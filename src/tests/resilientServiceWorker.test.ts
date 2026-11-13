/**
 * Unit Test TC-P15-05: Resilient Service Worker & Tolerant Precache (TASK-100 / AUD4-007 / PWA-001)
 *
 * Menguji:
 * 1. Aset inti App Shell terdaftar dan file fisiknya ada di repositori.
 * 2. Toleran precaching menggunakan Promise.allSettled untuk aset sekunder tanpa kegagalan fatal.
 * 3. Logika navigasi Cache-First dengan 2.5s timeout revalidasi jaringan.
 * 4. Tidak ada auto skipWaiting() destruktif di install event; penanganan via pesan SKIP_WAITING.
 * 5. PWA update hook & event dispatcher 'zlce-sw-update-available' terpasang pada sw-register.ts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function runTestSuite() {
  console.log('--- Memulai Pengujian TC-P15-05: Resilient Service Worker & Tolerant Precache ---');
  let passedChecks = 0;
  const totalChecks = 6;

  const rootDir = process.cwd();
  const swPath = path.resolve(rootDir, 'public/sw.js');
  const swRegisterPath = path.resolve(rootDir, 'src/sw-register.ts');
  const mobileLayoutPath = path.resolve(rootDir, 'src/components/mobile/MobileLayout.tsx');

  // Check 1: public/sw.js ada dan mendefinisikan CORE_MANDATORY_ASSETS
  try {
    if (!fs.existsSync(swPath)) {
      throw new Error('public/sw.js tidak ditemukan');
    }
    const swContent = fs.readFileSync(swPath, 'utf8');

    if (!swContent.includes('CORE_MANDATORY_ASSETS') || !swContent.includes('OPTIONAL_PRECACHE_ASSETS')) {
      throw new Error('sw.js tidak memisahkan aset wajib (core) dan opsional');
    }

    if (!swContent.includes("'/index.html'") && !swContent.includes('"/index.html"')) {
      throw new Error('App Shell /index.html tidak tercantum di daftar aset inti');
    }

    // Pastikan berkas index.html dan manifest.webmanifest secara fisik ada
    if (!fs.existsSync(path.resolve(rootDir, 'index.html'))) {
      throw new Error('index.html fisik tidak ada');
    }
    if (!fs.existsSync(path.resolve(rootDir, 'public/manifest.webmanifest'))) {
      throw new Error('manifest.webmanifest fisik tidak ada');
    }

    passedChecks++;
    console.log('✓ Check 1: Definisi CORE_MANDATORY_ASSETS & integritas fisik App Shell valid');
  } catch (err: any) {
    console.error('✗ Check 1 GAGAL:', err.message);
  }

  // Check 2: Precache menggunakan Promise.allSettled dan event.waitUntil
  try {
    const swContent = fs.readFileSync(swPath, 'utf8');

    if (!swContent.includes('Promise.allSettled')) {
      throw new Error('sw.js belum menggunakan Promise.allSettled untuk toleransi precaching');
    }

    if (!swContent.includes('event.waitUntil')) {
      throw new Error('sw.js tidak menggunakan event.waitUntil pada install/activate');
    }

    // Verifikasi toleransi fallback fetch reload
    if (!swContent.includes("cache: 'reload'")) {
      throw new Error('Precache tidak menggunakan reload flag untuk cache validation');
    }

    passedChecks++;
    console.log('✓ Check 2: Precache toleran dengan Promise.allSettled & event.waitUntil terverifikasi');
  } catch (err: any) {
    console.error('✗ Check 2 GAGAL:', err.message);
  }

  // Check 3: Strategi Navigasi Cache-First dengan 2.5s Timeout Revalidasi (AUD4-007)
  try {
    const swContent = fs.readFileSync(swPath, 'utf8');

    const hasNavigateMode = swContent.includes("request.mode === 'navigate'");
    const hasTimeout2500 = swContent.includes('2500');
    const hasPromiseRace = swContent.includes('Promise.race');

    if (!hasNavigateMode || !hasTimeout2500 || !hasPromiseRace) {
      throw new Error('Logika 2.5s network navigation timeout via Promise.race belum terpasang di fetch handler');
    }

    // Pastikan fallback HTML offline tersedia jika navigasi belum ter-cache
    if (!swContent.includes('Aplikasi sedang offline')) {
      throw new Error('Fallback offline HTML darurat tidak ditemukan di navigate mode');
    }

    passedChecks++;
    console.log('✓ Check 3: Navigasi Cache-First dengan 2.5s revalidation timeout & offline fallback terverifikasi');
  } catch (err: any) {
    console.error('✗ Check 3 GAGAL:', err.message);
  }

  // Check 4: Non-destructive update - TIDAK ada auto skipWaiting() di install listener
  try {
    const swContent = fs.readFileSync(swPath, 'utf8');

    // Cari blok install listener
    const installBlockMatch = swContent.match(/addEventListener\(\s*['"]install['"][\s\S]*?\n\}\);/);
    if (!installBlockMatch) {
      throw new Error('Blok addEventListener("install") tidak ditemukan');
    }
    const installBlock = installBlockMatch[0];

    // Pastikan self.skipWaiting() tidak dipanggil secara aktif di install handler (hanya komentar jika ada)
    const activeSkipWaiting = installBlock.split('\n').filter((line) => {
      const trimmed = line.trim();
      return !trimmed.startsWith('//') && !trimmed.startsWith('/*') && trimmed.includes('skipWaiting()');
    });

    if (activeSkipWaiting.length > 0) {
      throw new Error('self.skipWaiting() otomatis masih aktif di blok install; ini merusak sesi pengguna!');
    }

    // Pastikan ada penanganan SKIP_WAITING eksplisit di message listener
    if (!swContent.includes("type === 'SKIP_WAITING'")) {
      throw new Error('Pesan kontrol SKIP_WAITING eksplisit tidak ditangani di message event listener');
    }

    passedChecks++;
    console.log('✓ Check 4: Zero-Destructive update: skipWaiting otomatis dihapus dari install event');
  } catch (err: any) {
    console.error('✗ Check 4 GAGAL:', err.message);
  }

  // Check 5: sw-register.ts & MobileLayout.tsx update toast integration
  try {
    const swRegContent = fs.readFileSync(swRegisterPath, 'utf8');
    const layoutContent = fs.readFileSync(mobileLayoutPath, 'utf8');

    if (!swRegContent.includes('applyServiceWorkerUpdate') || !swRegContent.includes('useServiceWorkerUpdate')) {
      throw new Error('sw-register.ts tidak mengekspor applyServiceWorkerUpdate atau useServiceWorkerUpdate');
    }

    if (!swRegContent.includes('zlce-sw-update-available')) {
      throw new Error("sw-register.ts tidak memicu event kustom 'zlce-sw-update-available'");
    }

    if (!layoutContent.includes('useServiceWorkerUpdate') || !layoutContent.includes('Muat Ulang')) {
      throw new Error('MobileLayout.tsx tidak menampilkan banner notifikasi pembaruan dengan tombol Muat Ulang');
    }

    passedChecks++;
    console.log('✓ Check 5: Integrasi UI toast pembaruan non-destruktif & hook useServiceWorkerUpdate terverifikasi');
  } catch (err: any) {
    console.error('✗ Check 5 GAGAL:', err.message);
  }

  // Check 6: Verifikasi pasca-build bundel CSS/JS awal masuk CORE_BUILD_ASSETS di dist/sw.js + ignoreVary
  try {
    const distIndexPath = path.resolve(rootDir, 'dist/index.html');
    const distSwPath = path.resolve(rootDir, 'dist/sw.js');
    if (!fs.existsSync(distIndexPath) || !fs.existsSync(distSwPath)) {
      execSync('npm run build', { cwd: rootDir, stdio: 'ignore' });
    }

    const distIndex = fs.readFileSync(distIndexPath, 'utf8');
    const distSw = fs.readFileSync(distSwPath, 'utf8');
    const swRegContent = fs.readFileSync(swRegisterPath, 'utf8');

    if (!distSw.includes('ignoreVary: true')) {
      throw new Error('dist/sw.js tidak menyertakan ignoreVary: true untuk aset modul crossorigin');
    }
    if (!swRegContent.includes('modulepreload')) {
      throw new Error('sw-register.ts belum mendaftarkan link[rel="modulepreload"]');
    }

    const initialAssets: string[] = [];
    const assetMatches = distIndex.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g);
    for (const m of assetMatches) {
      initialAssets.push(m[1]);
    }
    if (initialAssets.length === 0) {
      throw new Error('Tidak ditemukan aset /assets/* awal di dist/index.html');
    }
    for (const assetUrl of initialAssets) {
      if (!distSw.includes(assetUrl)) {
        throw new Error(`Aset awal ${assetUrl} tidak disuntikkan ke dist/sw.js`);
      }
    }

    passedChecks++;
    console.log(`✓ Check 6: Seluruh ${initialAssets.length} bundel CSS/JS/modulepreload awal disuntikkan ke dist/sw.js`);
  } catch (err: any) {
    console.error('✗ Check 6 GAGAL:', err.message);
  }

  console.log(`\nHASIL AKHIR TC-P15-05: ${passedChecks}/${totalChecks} checks PASS`);
  if (passedChecks !== totalChecks) {
    process.exit(1);
  }
}

runTestSuite();
