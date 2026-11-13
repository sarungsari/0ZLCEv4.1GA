/**
 * ZLCE Mobile Workbench Service Worker
 * Versi: v4.1.0 GA (Hardened)
 * Strategi: Cache-First untuk App Shell & Aset Statis, Stale-While-Revalidate untuk konten umum,
 * Timeout Revalidasi Navigasi 2.5 Detik (UX-03 / AUD4-007 / PWA-001), dan
 * Toleran Precache via Promise.allSettled tanpa auto skipWaiting destruktif di tengah sesi.
 * Rujukan: docs/mobile/blueprint/03_PWA_ARCHITECTURE.md
 */

const CACHE_NAME = 'zlce-mobile-v4.1.0';

// Mandatory App Shell core precache assets
const CORE_MANDATORY_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Initial build CSS/JS & modulepreload bundles injected at build time (vite.config.ts)
const CORE_BUILD_ASSETS = [/*__ZLCE_CORE_BUILD_ASSETS__*/];

// Optional non-blocking precache assets
const OPTIONAL_PRECACHE_ASSETS = [
  '/icons/icon-512x512-maskable.png',
  '/icons/apple-touch-icon.png'
];

// Lazy route JS/CSS bundles injected at build time for complete offline tab switching
const OPTIONAL_BUILD_ASSETS = [/*__ZLCE_OPTIONAL_BUILD_ASSETS__*/];

/**
 * Fallback parser saat build list belum disuntikkan: mengekstrak script/css/modulepreload dari index.html
 */
function extractInitialAssetsFromHtml(htmlText) {
  const discovered = new Set();
  const attrRegex = /(?:src|href)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrRegex.exec(htmlText)) !== null) {
    const rawUrl = match[1];
    if (
      rawUrl &&
      rawUrl.startsWith('/') &&
      !rawUrl.startsWith('/@') &&
      !rawUrl.startsWith('/api/') &&
      /\.(?:js|mjs|css|png|svg|webmanifest|woff2)(?:\?.*)?$/i.test(rawUrl)
    ) {
      discovered.add(rawUrl);
    }
  }
  return Array.from(discovered);
}

/**
 * Helper precache toleran per-aset
 */
async function precacheAssetList(cache, urls, label) {
  const uniqueUrls = Array.from(new Set(urls.filter((u) => typeof u === 'string' && u.length > 0)));
  if (uniqueUrls.length === 0) return [];
  const results = await Promise.allSettled(
    uniqueUrls.map((url) =>
      cache
        .add(new Request(url, { cache: 'reload', credentials: 'same-origin' }))
        .catch((err) => {
          console.warn(`[SW] Fetch reload gagal untuk ${label}, mencoba fetch standar:`, url, err);
          return cache.add(url);
        })
    )
  );
  return results;
}

/**
 * Pencarian Cache toleran terhadap header Vary: Origin pada modul CORS / crossorigin
 */
async function matchCachedWithVaryFallback(request, url) {
  return (
    (await caches.match(request)) ||
    (await caches.match(request, { ignoreVary: true })) ||
    (url && url.origin === self.location.origin
      ? (await caches.match(url.pathname + url.search, { ignoreVary: true })) ||
        (await caches.match(url.pathname, { ignoreVary: true }))
      : undefined)
  );
}

// Install: Simpan seluruh App Shell & bundel awal ke Cache Storage dengan toleransi tinggi (Promise.allSettled)
self.addEventListener('install', (event) => {
  // AUD4-007: Hapus self.skipWaiting() otomatis di tengah instalasi agar tidak memutus sesi aktif pengguna!
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Simpan aset inti wajib & bundel awal (CSS/JS/modulepreload)
      let coreAssets = [...CORE_MANDATORY_ASSETS, ...CORE_BUILD_ASSETS];
      const coreResults = await precacheAssetList(cache, coreAssets, 'aset inti');
      console.log('[SW] Core mandatory App Shell assets precached with status:', coreResults.map((r) => r.status));

      // Jika CORE_BUILD_ASSETS kosong (misal mode dev), ekstrak aset awal langsung dari /index.html yang ter-cache
      if (CORE_BUILD_ASSETS.length === 0) {
        try {
          const cachedHtml = await caches.match('/index.html');
          if (cachedHtml) {
            const htmlText = await cachedHtml.text();
            const discoveredAssets = extractInitialAssetsFromHtml(htmlText);
            if (discoveredAssets.length > 0) {
              await precacheAssetList(cache, discoveredAssets, 'aset DOM awal');
            }
          }
        } catch (err) {
          console.warn('[SW] Ekstraksi aset awal dari /index.html dilewati:', err);
        }
      }

      // 2. Simpan aset ikon opsional (ringan); chunk tab lazy besar ditunda sampai interaksi awal via WARM_LAZY_ASSETS
      await Promise.allSettled(
        OPTIONAL_PRECACHE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload', credentials: 'same-origin' })).catch((err) => {
            console.warn('[SW] Optional asset precache skipped:', url, err);
          })
        )
      );
    })
  );
});

// Activate: Bersihkan cache lama dan klaim kontrol klien
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name.startsWith('zlce-'))
          .map((name) => {
            console.log('[SW] Menghapus cache usang:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Caching multi-layer ramah tablet offline 100%
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Hanya tangani metode GET
  if (request.method !== 'GET') {
    return;
  }

  // Bypass API lokal, WebSocket Vite HMR, dan skema non-http(s)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/__vite') ||
    url.protocol.startsWith('ws') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  // Strategi 1: Navigasi Halaman (HTML) -> Cache-First dengan 2.5s Timeout Revalidasi (AUD4-007)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // Ambil dari cache lokal terlebih dahulu jika tersedia (bebas layar putih di Airplane Mode)
        const cachedResponse =
          (await caches.match(request, { ignoreVary: true })) ||
          (await caches.match('/index.html')) ||
          (await caches.match('/'));

        const networkFetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch((err) => {
            console.log('[SW] Network navigation fetch failed, serving cache:', err);
            return null;
          });

        if (cachedResponse) {
          // Cache-First App Shell sejati: kembalikan cachedResponse instan (0ms),
          // dan jalankan revalidasi latar belakang dibatasi timeout 2.5s agar tidak memblokir render.
          const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve(null), 2500);
          });

          event.waitUntil(Promise.race([networkFetchPromise, timeoutPromise]));
          return cachedResponse;
        }

        // Jika belum ada di cache (pembukaan pertama kali):
        const freshNetwork = await networkFetchPromise;
        if (freshNetwork) return freshNetwork;

        return (
          cachedResponse ||
          new Response(
            '<!doctype html><html><body style="background:#020617;color:#f8fafc;font-family:sans-serif;padding:2rem;"><h2>ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)</h2><p>Aplikasi sedang offline dan App Shell belum ter-cache penuh. Harap sambungkan internet sejenak untuk inisialisasi awal.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          )
        );
      })()
    );
    return;
  }

  // Strategi 2: Aset Statis (JS, CSS, Font, Ikon, Gambar, Manifest) -> Cache-First (ignoreVary agar aman untuk modul crossorigin)
  const isStaticAsset =
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset && url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cachedResponse = await matchCachedWithVaryFallback(request, url);
        if (cachedResponse) {
          // Revalidasi di latar belakang (Stale-While-Revalidate) jika online
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
              }
            })
            .catch(() => {/* Abaikan kegagalan jaringan saat revalidasi */});
          return cachedResponse;
        }

        // Jika belum ada di cache, unduh dari jaringan dan simpan
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        } catch (err) {
          const fallback = await matchCachedWithVaryFallback(request, url);
          if (fallback) return fallback;
          throw err;
        }
      })()
    );
    return;
  }

  // Strategi 3: Permintaan Lainnya -> Network First dengan Fallback Cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => matchCachedWithVaryFallback(request, url))
  );
});

// Penanganan Pesan Kontrol dari Klien (misal: SKIP_WAITING eksplisit saat user menekan 'Muat Ulang')
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Eksekusi SKIP_WAITING terkonfirmasi dari UI pengguna.');
    self.skipWaiting();
  } else if (event.data && event.data.type === 'WARM_LAZY_ASSETS') {
    if (OPTIONAL_BUILD_ASSETS.length > 0) {
      caches.open(CACHE_NAME).then((cache) => precacheAssetList(cache, OPTIONAL_BUILD_ASSETS, 'aset tab lazy'));
    }
  } else if (event.data && event.data.type === 'REGISTER_BUILD_ASSETS' && Array.isArray(event.data.assets)) {
    const assetsToCache = Array.from(new Set(event.data.assets)).filter(
      (assetUrl) => typeof assetUrl === 'string' && assetUrl.length > 0
    );
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        assetsToCache.map(async (assetUrl) => {
          try {
            const existing = await cache.match(assetUrl, { ignoreVary: true });
            if (existing) return;
            const res = await fetch(new Request(assetUrl, { credentials: 'same-origin' }));
            if (res && res.status === 200) {
              await cache.put(assetUrl, res);
              console.log('[SW] Deterministic build asset cached:', assetUrl);
            }
          } catch (err) {
            console.warn('[SW] Could not precache dynamic asset:', assetUrl, err);
          }
        })
      );
    });
  }
});
