/**
 * TC-P18-02: PWA Icons Integrity & Post-Build Offline Caching Test (TASK-113 / R-01 / P0-01)
 *
 * Menguji secara deterministik:
 * 1. Keberadaan dan integritas biner seluruh ikon PWA (192x192, 512x512, maskable, apple-touch-icon).
 * 2. Konsistensi Web App Manifest (manifest.webmanifest) dan referensi ikon purpose any & maskable.
 * 3. Header HTML entry point (index.html) memuat link manifest, apple-touch-icon, dan meta PWA.
 * 4. Service Worker (public/sw.js) memasukkan ikon ke dalam precache mandatori/opsional dan cache-first.
 * 5. Verifikasi pasca-build (dist/): Seluruh aset ikon tercakup di dist/icons/ dengan SHA-256 identik (0 kesalahan 404).
 * 6. Audit kesiapan instalasi PWA (Lighthouse Installability criteria) memenuhi 100% syarat.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function fileSha256(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function readPngDimensions(buffer: Buffer): { width: number; height: number; isValidPng: boolean } {
  if (buffer.length < 24) {
    return { width: 0, height: 0, isValidPng: false };
  }
  const isMagicMatch = buffer.subarray(0, 8).equals(PNG_MAGIC);
  if (!isMagicMatch) {
    return { width: 0, height: 0, isValidPng: false };
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height, isValidPng: true };
}

export function runPwaIconsIntegrityTests(): { passed: number; total: number; checks: string[] } {
  console.log('=== TC-P18-02: PWA Icons Integrity & Offline Caching Suite ===');
  let passed = 0;
  const total = 6;
  const checks: string[] = [];

  // Check 1: Integritas Biner Seluruh Ikon PWA di public/icons/
  try {
    const requiredIcons = [
      { relPath: 'public/icons/icon-192x192.png', expectedW: 192, expectedH: 192, minBytes: 500 },
      { relPath: 'public/icons/icon-512x512.png', expectedW: 512, expectedH: 512, minBytes: 1000 },
      { relPath: 'public/icons/icon-512x512-maskable.png', expectedW: 512, expectedH: 512, minBytes: 1000 },
      { relPath: 'public/icons/apple-touch-icon.png', expectedW: 180, expectedH: 180, minBytes: 500 },
    ];

    for (const icon of requiredIcons) {
      const fullPath = path.join(ROOT_DIR, icon.relPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Berkas ikon ${icon.relPath} tidak ditemukan di sistem berkas`);
      }
      const buf = fs.readFileSync(fullPath);
      if (buf.length < icon.minBytes) {
        throw new Error(`Ukuran berkas ${icon.relPath} terlalu kecil (${buf.length} bytes, minimum ${icon.minBytes})`);
      }
      const { width, height, isValidPng } = readPngDimensions(buf);
      if (!isValidPng) {
        throw new Error(`Berkas ${icon.relPath} bukan format PNG valid`);
      }
      if (width !== icon.expectedW || height !== icon.expectedH) {
        throw new Error(
          `Dimensi berkas ${icon.relPath} tidak sesuai: ${width}x${height}px (diharapkan ${icon.expectedW}x${icon.expectedH}px)`
        );
      }
    }

    passed++;
    const msg = '✓ Check 1: Seluruh 4 ikon PWA (192, 512, maskable, apple-touch-icon) terverifikasi valid PNG & dimensi tepat';
    checks.push(msg);
    console.log(msg);
  } catch (err: any) {
    const msg = `✗ Check 1 GAGAL: ${err.message}`;
    checks.push(msg);
    console.error(msg);
    throw err;
  }

  // Check 2: Validasi Web App Manifest & Deklarasi Ikon Standar PWA
  try {
    const manifestPath = path.join(ROOT_DIR, 'public/manifest.webmanifest');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('public/manifest.webmanifest tidak ditemukan');
    }
    const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestRaw);

    if (manifest.name !== 'ZLCE Mobile Workbench v4.1.0 GA') {
      throw new Error(`Nama manifest tidak sesuai: "${manifest.name}"`);
    }
    if (manifest.short_name !== 'ZLCEv4.1Mob') {
      throw new Error(`short_name manifest tidak sesuai: "${manifest.short_name}"`);
    }
    if (manifest.display !== 'standalone') {
      throw new Error(`display mode manifest harus "standalone", didapat: "${manifest.display}"`);
    }
    if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) {
      throw new Error('Daftar icons di manifest harus memuat minimal 3 entri');
    }

    const has192 = manifest.icons.some(
      (ic: any) => ic.src === '/icons/icon-192x192.png' && ic.sizes === '192x192' && ic.type === 'image/png'
    );
    const has512 = manifest.icons.some(
      (ic: any) => ic.src === '/icons/icon-512x512.png' && ic.sizes === '512x512' && ic.type === 'image/png'
    );
    const hasMaskable = manifest.icons.some(
      (ic: any) =>
        ic.src === '/icons/icon-512x512-maskable.png' &&
        ic.sizes === '512x512' &&
        ic.type === 'image/png' &&
        ic.purpose === 'maskable'
    );

    if (!has192 || !has512 || !hasMaskable) {
      throw new Error('Manifest kehilangan salah satu ikon wajib (192px, 512px, atau 512px maskable)');
    }

    // Pastikan seluruh file yang dirujuk manifest benar-benar ada di public/
    for (const ic of manifest.icons) {
      const targetPath = path.join(ROOT_DIR, 'public', ic.src.replace(/^\//, ''));
      if (!fs.existsSync(targetPath)) {
        throw new Error(`Aset ikon yang dirujuk manifest tidak ada di disk: ${ic.src}`);
      }
    }

    passed++;
    const msg = '✓ Check 2: manifest.webmanifest memenuhi spesifikasi W3C PWA dengan rujukan ikon any & maskable valid';
    checks.push(msg);
    console.log(msg);
  } catch (err: any) {
    const msg = `✗ Check 2 GAGAL: ${err.message}`;
    checks.push(msg);
    console.error(msg);
    throw err;
  }

  // Check 3: Validasi Header HTML Entry Point (index.html)
  try {
    const indexPath = path.join(ROOT_DIR, 'index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf8');

    if (!indexHtml.includes('<link rel="manifest" href="/manifest.webmanifest" />') &&
        !indexHtml.includes('<link rel="manifest" href="/manifest.webmanifest">')) {
      throw new Error('index.html tidak memuat link manifest');
    }
    if (!indexHtml.includes('<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />') &&
        !indexHtml.includes('<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">')) {
      throw new Error('index.html tidak memuat apple-touch-icon');
    }
    if (!indexHtml.includes('name="theme-color" content="#0f172a"')) {
      throw new Error('index.html tidak memuat meta theme-color #0f172a');
    }
    if (!indexHtml.includes('name="apple-mobile-web-app-title" content="ZLCEv4.1Mob"')) {
      throw new Error('index.html tidak menyelaraskan apple-mobile-web-app-title dengan "ZLCEv4.1Mob"');
    }

    passed++;
    const msg = '✓ Check 3: index.html memuat rel="manifest", apple-touch-icon, meta PWA standalone & title ZLCEv4.1Mob';
    checks.push(msg);
    console.log(msg);
  } catch (err: any) {
    const msg = `✗ Check 3 GAGAL: ${err.message}`;
    checks.push(msg);
    console.error(msg);
    throw err;
  }

  // Check 4: Service Worker Caching & App Shell Precache (public/sw.js)
  try {
    const swPath = path.join(ROOT_DIR, 'public/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');

    if (!swContent.includes("'/icons/icon-192x192.png'") && !swContent.includes('"/icons/icon-192x192.png"')) {
      throw new Error('public/sw.js tidak memuat icon-192x192.png di daftar precache');
    }
    if (!swContent.includes("'/icons/icon-512x512.png'") && !swContent.includes('"/icons/icon-512x512.png"')) {
      throw new Error('public/sw.js tidak memuat icon-512x512.png di daftar precache');
    }
    if (!swContent.includes("'/icons/icon-512x512-maskable.png'") && !swContent.includes('"/icons/icon-512x512-maskable.png"')) {
      throw new Error('public/sw.js tidak memuat icon-512x512-maskable.png di daftar precache opsional');
    }
    if (!swContent.includes("'/icons/apple-touch-icon.png'") && !swContent.includes('"/icons/apple-touch-icon.png"')) {
      throw new Error('public/sw.js tidak memuat apple-touch-icon.png di daftar precache opsional');
    }
    if (!swContent.includes("url.pathname.startsWith('/icons/')")) {
      throw new Error('public/sw.js tidak memuat penanganan rute cache-first untuk direktori /icons/');
    }

    passed++;
    const msg = '✓ Check 4: public/sw.js mengamankan seluruh ikon PWA dalam precache dan cache-first asset handler';
    checks.push(msg);
    console.log(msg);
  } catch (err: any) {
    const msg = `✗ Check 4 GAGAL: ${err.message}`;
    checks.push(msg);
    console.error(msg);
    throw err;
  }

  // Check 5: Verifikasi Pasca-Build (dist/): SHA-256 Identik & Zero 404
  try {
    const distIconsDir = path.join(ROOT_DIR, 'dist/icons');
    if (!fs.existsSync(distIconsDir)) {
      // Jalankan vite build otomatis jika dist belum dibuat
      console.log('   Menjalankan build Vite sementara untuk pengujian pasca-build...');
      execSync('npm run build', { cwd: ROOT_DIR, stdio: 'ignore' });
    }

    const testFiles = [
      'apple-touch-icon.png',
      'icon-192x192.png',
      'icon-512x512-maskable.png',
      'icon-512x512.png',
    ];

    for (const f of testFiles) {
      const publicPath = path.join(ROOT_DIR, 'public/icons', f);
      const distPath = path.join(ROOT_DIR, 'dist/icons', f);

      if (!fs.existsSync(distPath)) {
        throw new Error(`Berkas ikon ${f} hilang dari direktori build dist/icons/ (berpotensi 404)`);
      }

      const publicHash = fileSha256(publicPath);
      const distHash = fileSha256(distPath);

      if (publicHash !== distHash) {
        throw new Error(`Checksum ${f} di dist/ tidak cocok dengan public/ (${distHash} vs ${publicHash})`);
      }
    }

    // Pastikan manifest dan sw.js juga ada di dist
    if (!fs.existsSync(path.join(ROOT_DIR, 'dist/manifest.webmanifest'))) {
      throw new Error('dist/manifest.webmanifest hilang dari bundel produksi');
    }
    if (!fs.existsSync(path.join(ROOT_DIR, 'dist/sw.js'))) {
      throw new Error('dist/sw.js hilang dari bundel produksi');
    }

    passed++;
    const msg = '✓ Check 5: Pasca-build (dist/icons/) memuat seluruh aset ikon dengan SHA-256 identik 100% (0 kesalahan 404)';
    checks.push(msg);
    console.log(msg);
  } catch (err: any) {
    const msg = `✗ Check 5 GAGAL: ${err.message}`;
    checks.push(msg);
    console.error(msg);
    throw err;
  }

  // Check 6: Lighthouse PWA "Installable" Criteria Audit Readiness
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'public/manifest.webmanifest'), 'utf8'));
    const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

    // Kriteria 1: Web app manifest fetched and non-empty
    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Manifest bukan objek valid');
    }
    // Kriteria 2: Has name & short_name
    if (!manifest.name || !manifest.short_name) {
      throw new Error('Manifest tidak memiliki name atau short_name');
    }
    // Kriteria 3: Has start_url
    if (!manifest.start_url) {
      throw new Error('Manifest tidak memiliki start_url');
    }
    // Kriteria 4: Has standalone/fullscreen display
    if (!['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)) {
      throw new Error(`display mode ${manifest.display} tidak memenuhi kriteria installable`);
    }
    // Kriteria 5: Has icons >= 192px and >= 512px
    const sizes = manifest.icons.map((i: any) => i.sizes);
    if (!sizes.includes('192x192') || !sizes.includes('512x512')) {
      throw new Error('Ikon minimal 192x192 dan 512x512 wajib ada');
    }
    // Kriteria 6: Has maskable icon
    const hasMaskable = manifest.icons.some((i: any) => (i.purpose || '').includes('maskable'));
    if (!hasMaskable) {
      throw new Error('Ikon maskable diperlukan untuk Android Adaptive Icon');
    }
    // Kriteria 7: Viewport meta tag present
    if (!indexHtml.includes('name="viewport"')) {
      throw new Error('index.html harus memuat meta viewport');
    }

    passed++;
    const msg = '✓ Check 6: 100% kriteria Lighthouse PWA Installable terpenuhi tanpa peringatan aset hilang';
    checks.push(msg);
    console.log(msg);
  } catch (err: any) {
    const msg = `✗ Check 6 GAGAL: ${err.message}`;
    checks.push(msg);
    console.error(msg);
    throw err;
  }

  console.log(`\nTC-P18-02: ${passed}/${total} checks PASS (100% OK)`);
  return { passed, total, checks };
}

// Auto-run when invoked via CLI (npx tsx src/tests/pwaIconsIntegrity.test.ts)
if (process.argv[1] && process.argv[1].endsWith('pwaIconsIntegrity.test.ts')) {
  try {
    runPwaIconsIntegrityTests();
  } catch {
    process.exit(1);
  }
}
