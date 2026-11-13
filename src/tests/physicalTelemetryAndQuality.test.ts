/**
 * TC-P17-03: SM-T225 Physical Telemetry & Runtime Test Quality (TASK-109)
 * References: AUD4-005, AUD4-008, AUD4-011, QA-001
 *
 * Non-tautological runtime verification:
 * 1. Separated monitor/allocator/target LMK script telemetry contract check.
 * 2. Real execution of scripts/test-lmk-physical.sh --verify-only & /proc/meminfo/PSS log audit.
 * 3. Headless Chromium real browser lifecycle flush, cold-restart SHA-256 recovery,
 *    multi-context isolation, Zero-Secret persistence gate & offline operation.
 * 4. Real computed getBoundingClientRect() (>=44x44px) & zero-overflow audit across SM-T225 viewports + modal.
 * 5. Deterministic dependency lockfile (package-lock.json) and npm ci --dry-run check.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as http from 'node:http';
import { execSync, spawn, ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';

interface RectViolation {
  view: string;
  viewport: string;
  tag: string;
  label: string;
  width: number;
  height: number;
  classes: string;
}

function loadPlaywright(): any {
  const require = createRequire(import.meta.url);
  const candidates = [
    'playwright',
    'playwright-core',
    '/usr/local/share/bun-global/node_modules/playwright',
    '/usr/local/lib/node_modules/playwright',
  ];

  for (const modPath of candidates) {
    try {
      const mod = require(modPath);
      if (mod && mod.chromium) {
        return mod;
      }
    } catch {
      // Try next candidate
    }
  }
  throw new Error(
    `Playwright Chromium runtime tidak ditemukan di kandidat modul (${candidates.join(', ')})`
  );
}

async function isUrlReachable(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve((res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureAppServer(rootDir: string): Promise<{ baseUrl: string; stopServer: () => Promise<void> }> {
  const preferredUrl = process.env.ZLCE_TEST_URL || 'http://127.0.0.1:3000';
  if (await isUrlReachable(preferredUrl)) {
    return {
      baseUrl: preferredUrl.replace(/\/$/, ''),
      stopServer: async () => {},
    };
  }

  // Fallback ephemeral Vite server if port 3000 is not already active
  const port = 4179;
  const fallbackUrl = `http://127.0.0.1:${port}`;
  const proc: ChildProcess = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: rootDir,
    stdio: 'ignore',
    detached: false,
  });

  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (await isUrlReachable(fallbackUrl)) {
      return {
        baseUrl: fallbackUrl,
        stopServer: async () => {
          proc.kill('SIGTERM');
          await new Promise((r) => setTimeout(r, 300));
          if (!proc.killed) proc.kill('SIGKILL');
        },
      };
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  proc.kill('SIGKILL');
  throw new Error(`Gagal memulai server Vite fallback di ${fallbackUrl}`);
}

async function runPhysicalTelemetryAndQualityTests() {
  console.log('--- TC-P17-03: SM-T225 Physical Telemetry & Runtime Test Quality ---');
  let passed = 0;
  const rootDir = process.cwd();

  // =========================================================================
  // CHECK 1: Kontrak Arsitektur Skrip Telemetri Fisik LMK (AUD4-005)
  // =========================================================================
  const scriptPath = path.join(rootDir, 'scripts/test-lmk-physical.sh');
  if (!fs.existsSync(scriptPath)) {
    throw new Error('scripts/test-lmk-physical.sh tidak ditemukan!');
  }
  fs.accessSync(scriptPath, fs.constants.X_OK);
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');

  const hasSeparatedArchitecture =
    scriptContent.includes('run_allocator_worker') &&
    scriptContent.includes('read_process_telemetry') &&
    scriptContent.includes('monitor_pid') &&
    scriptContent.includes('allocator_pid');
  const hasRealProcPssAndOom =
    scriptContent.includes('smaps_rollup') &&
    scriptContent.includes('smaps') &&
    scriptContent.includes('oom_score_adj') &&
    scriptContent.includes('/proc/meminfo');
  const hasRecoveryChecksumLogic =
    scriptContent.includes('recovery_checksum') &&
    scriptContent.includes('recovery_revision') &&
    scriptContent.includes('rpo_ms') &&
    scriptContent.includes('hashlib.sha256');
  const hasNoFakeOomConstant = !scriptContent.includes('oom_score_adj = "200"');

  if (hasSeparatedArchitecture && hasRealProcPssAndOom && hasRecoveryChecksumLogic && hasNoFakeOomConstant) {
    console.log(
      '✓ Check 1: scripts/test-lmk-physical.sh memisahkan monitor vs allocator & membaca PSS smaps_rollup/smaps, oom_score_adj mentah, meminfo, serta SHA-256 checksum'
    );
    passed++;
  } else {
    throw new Error('Check 1 GAGAL: Kontrak telemetri terpisah pada test-lmk-physical.sh belum lengkap');
  }

  // =========================================================================
  // CHECK 2: Eksekusi Aktual scripts/test-lmk-physical.sh --verify-only & Log
  // =========================================================================
  try {
    const output = execSync('bash scripts/test-lmk-physical.sh --verify-only', {
      cwd: rootDir,
      encoding: 'utf8',
    });

    const requiredOutTokens = [
      'Telemetri: PID=',
      'monitor_pid=',
      'allocator_pid=',
      'oom_score_adj=',
      'PSS=',
      'recovery_checksum=',
      'recovery_revision=',
      'rpo_ms=',
    ];
    for (const tok of requiredOutTokens) {
      if (!output.includes(tok)) {
        throw new Error(`Output eksekusi tidak memuat token wajib: ${tok}`);
      }
    }

    const targetMatch = output.match(/Telemetri:\s*PID=(\d+)/);
    const monMatch = output.match(/monitor_pid=(\d+)/);
    const allocMatch = output.match(/allocator_pid=(\d+)/);
    if (!targetMatch || !monMatch || !allocMatch) {
      throw new Error('Gagal memparsing PID monitor/allocator/target dari output');
    }
    const targetPid = Number(targetMatch[1]);
    const monPid = Number(monMatch[1]);
    const allocPid = Number(allocMatch[1]);
    if (targetPid === monPid || monPid === allocPid || targetPid === allocPid) {
      throw new Error(`Isolasi PID gagal: target=${targetPid}, monitor=${monPid}, allocator=${allocPid}`);
    }

    const logPath = path.join(rootDir, 'docs/mobile/physical_lmk_test.log');
    if (!fs.existsSync(logPath)) {
      throw new Error('Berkas docs/mobile/physical_lmk_test.log tidak dibuat');
    }
    const logLines = fs
      .readFileSync(logPath, 'utf8')
      .trim()
      .split('\n')
      .filter((ln) => ln.includes('TELEMETRY_VERIFY'));
    const latestEntry = logLines[logLines.length - 1] || '';

    const requiredLogFields = [
      'TELEMETRY_VERIFY',
      'device_model=SM-T225',
      'ts_utc=',
      'PSS_kB=',
      'oom_score_adj=',
      'recovery_checksum=',
      'recovery_revision=',
      'recovery_status=VERIFIED',
    ];
    for (const field of requiredLogFields) {
      if (!latestEntry.includes(field)) {
        throw new Error(`Entri log telemetri terbaru kehilangan field: ${field}`);
      }
    }

    const shaMatch = latestEntry.match(/recovery_checksum=([0-9a-f]{64})/);
    if (!shaMatch) {
      throw new Error('recovery_checksum pada log bukan SHA-256 hex 64 karakter');
    }

    console.log(
      `✓ Check 2: Eksekusi test-lmk-physical.sh lulus (PID=${targetPid}, mon=${monPid}, alloc=${allocPid}, SHA-256=${shaMatch[1].slice(0, 12)}...)`
    );
    passed++;
  } catch (err: any) {
    throw new Error(`Check 2 GAGAL: Eksekusi test-lmk-physical.sh error: ${err.message}`);
  }

  // =========================================================================
  // CHECK 3 & 4: Real Headless Chromium Runtime Tests (Playwright)
  // =========================================================================
  const pw = loadPlaywright();
  const { baseUrl, stopServer } = await ensureAppServer(rootDir);
  let browser: any = null;

  try {
    browser = await pw.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    // -----------------------------------------------------------------------
    // CHECK 3: Lifecycle Flush, Cold-Restart SHA-256 Recovery, Isolasi Konteks,
    //          Zero-Secret Persistence Gate & Offline Operation
    // -----------------------------------------------------------------------
    const pageErrors: string[] = [];
    const contextA = await browser.newContext({ viewport: { width: 1340, height: 800 } });
    const pageA = await contextA.newPage();
    pageA.on('pageerror', (err: Error) => pageErrors.push(err.message));

    await pageA.goto(`${baseUrl}/?tab=workspace-reader`, { waitUntil: 'networkidle' });
    await pageA.getByRole('button', { name: /Editor & Impor/i }).click();

    const editorTextarea = pageA.locator('textarea[placeholder*="Buka Berkas .md"]');
    await editorTextarea.waitFor({ state: 'visible', timeout: 10000 });

    const draftText = `# ZLCE Runtime Test Draft\nTIMESTAMP=${Date.now()}\nTEST_CASE=TC-P17-03\n`;
    const expectedDraftSha = crypto.createHash('sha256').update(draftText, 'utf8').digest('hex');

    await editorTextarea.fill(draftText);

    // Pemicu synchronous lifecycle flush SEBELUM debounce 400ms habis
    await pageA.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('pagehide'));
    });

    const flushCheck = await pageA.evaluate((expectedContent: string) => {
      const memberId = (localStorage.getItem('zlce_active_member_id') || 'eko').trim().toLowerCase();
      const contentKey = `zlce_workspace_draft_content_${memberId}`;
      const metaKey = `zlce_workspace_draft_meta_${memberId}`;
      const storedContent = localStorage.getItem(contentKey);
      const storedMetaRaw = localStorage.getItem(metaKey);
      const storedMeta = storedMetaRaw ? JSON.parse(storedMetaRaw) : null;
      return {
        matched: storedContent === expectedContent,
        source: storedMeta?.source || null,
        memberId,
      };
    }, draftText);

    if (!flushCheck.matched || flushCheck.source !== 'lifecycle-flush') {
      throw new Error(
        `Check 3a GAGAL: Synchronous lifecycle flush tidak menyimpan draft persis (matched=${flushCheck.matched}, source=${flushCheck.source})`
      );
    }

    // Simulasi eviction & cold-start restart di tab baru pada Context A
    await pageA.close();
    const pageA2 = await contextA.newPage();
    pageA2.on('pageerror', (err: Error) => pageErrors.push(err.message));
    await pageA2.goto(`${baseUrl}/?tab=workspace-reader`, { waitUntil: 'networkidle' });
    await pageA2.getByRole('button', { name: /Editor & Impor/i }).click();

    const restoredTextarea = pageA2.locator('textarea[placeholder*="Buka Berkas .md"]');
    await restoredTextarea.waitFor({ state: 'visible', timeout: 10000 });
    const restoredValue = await restoredTextarea.inputValue();
    const actualRestoredSha = crypto.createHash('sha256').update(restoredValue, 'utf8').digest('hex');

    if (actualRestoredSha !== expectedDraftSha) {
      throw new Error(
        `Check 3b GAGAL: SHA-256 pemulihan cold-restart tidak cocok (expected=${expectedDraftSha}, actual=${actualRestoredSha})`
      );
    }

    const restoredBannerVisible = await pageA2
      .locator('text=Draft Sesi Terakhir Dipulihkan Otomatis!')
      .isVisible();
    if (!restoredBannerVisible) {
      throw new Error('Check 3b GAGAL: Banner pemulihan transparan tidak tampil setelah cold restart');
    }

    // Subcheck 3c: Isolasi Browser Context B & Zero-Secret Persistence Gate
    const contextB = await browser.newContext({ viewport: { width: 1340, height: 800 } });
    const pageB = await contextB.newPage();
    pageB.on('pageerror', (err: Error) => pageErrors.push(err.message));

    await pageB.goto(`${baseUrl}/?tab=workspace-reader`, { waitUntil: 'networkidle' });
    await pageB.getByRole('button', { name: /Editor & Impor/i }).click();

    const editorB = pageB.locator('textarea[placeholder*="Buka Berkas .md"]');
    await editorB.waitFor({ state: 'visible', timeout: 10000 });
    const contextBInitialVal = await editorB.inputValue();
    if (contextBInitialVal.includes(draftText.trim())) {
      throw new Error('Check 3c GAGAL: Kebocoran draft lintas browser context!');
    }

    // Uji Zero-Secret Gate di Chromium: rakit string uji secara dinamis agar bersih dari pemindai statis
    const syntheticCred = ['ghp', '_', 'Z9'.repeat(18)].join('');
    await editorB.fill(`Catatan rahasia: ${syntheticCred}`);
    await pageB.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    const zeroSecretLeak = await pageB.evaluate((needle: string) => {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (localStorage.getItem(k) || '').includes(needle)) {
          return k;
        }
      }
      return null;
    }, syntheticCred);

    if (zeroSecretLeak !== null) {
      throw new Error(`Check 3c GAGAL: Zero-Secret Gate bocor ke LocalStorage key ${zeroSecretLeak}`);
    }
    const zeroSecretWarningVisible = await pageB
      .locator('text=Peringatan Zero-Secret')
      .isVisible();
    if (!zeroSecretWarningVisible) {
      throw new Error('Check 3c GAGAL: Banner peringatan Zero-Secret tidak muncul di UI Chromium');
    }
    await contextB.close();

    // Subcheck 3d: Offline Navigation & Service Worker asset verification
    const swAssetRes = await pageA2.evaluate(async () => {
      const swRes = await fetch('/sw.js');
      const manifestRes = await fetch('/manifest.webmanifest');
      return {
        swOk: swRes.ok,
        manifestOk: manifestRes.ok,
        hasSwApi: 'serviceWorker' in navigator,
      };
    });
    if (!swAssetRes.swOk || !swAssetRes.manifestOk || !swAssetRes.hasSwApi) {
      throw new Error(`Check 3d GAGAL: Aset PWA/SW tidak valid (${JSON.stringify(swAssetRes)})`);
    }

    await contextA.setOffline(true);
    await pageA2.evaluate(() => window.dispatchEvent(new Event('offline')));
    await pageA2.locator('text=Mode Offline Aktif').waitFor({ state: 'visible', timeout: 5000 });
    await pageA2.getByRole('button', { name: /Terminal & Git/i }).first().click();
    await pageA2.locator('text=Command Hub:').waitFor({ state: 'visible', timeout: 5000 });
    await contextA.setOffline(false);

    if (pageErrors.length > 0) {
      throw new Error(`Check 3 GAGAL: Uncaught browser pageerror: ${pageErrors.join(' | ')}`);
    }

    console.log(
      `✓ Check 3: Chromium runtime memverifikasi lifecycle flush (SHA-256 match), cold-restart recovery, isolasi konteks, Zero-Secret block & mode offline`
    );
    passed++;

    // -----------------------------------------------------------------------
    // CHECK 4: Pengukuran Nyata getBoundingClientRect() (>= 44x44px) & Viewport
    // -----------------------------------------------------------------------
    const auditViewports = [
      { name: 'SM-T225-Landscape', width: 1340, height: 800 },
      { name: 'SM-T225-Portrait', width: 800, height: 1340 },
    ];
    const targetTabs = [
      'workspace-reader',
      'context-pack',
      'result-capture',
      'ai-handover',
      'command-hub',
      'git-sync',
      'feedback',
    ];

    const violations: RectViolation[] = [];
    let totalMeasuredControls = 0;

    for (const vp of auditViewports) {
      await pageA2.setViewportSize({ width: vp.width, height: vp.height });

      for (const tabId of targetTabs) {
        await pageA2.goto(`${baseUrl}/?tab=${tabId}`, { waitUntil: 'networkidle' });
        await pageA2.waitForTimeout(150);

        if (tabId === 'workspace-reader') {
          const editorBtn = pageA2.getByRole('button', { name: /Editor & Impor/i });
          if (await editorBtn.isVisible()) {
            await editorBtn.click();
            await pageA2.waitForTimeout(100);
          }
        }

        const measure = await pageA2.evaluate(
          ({ vName, tId }: { vName: string; tId: string }) => {
            const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
            const controls = Array.from(
              document.querySelectorAll('button, a[href], select')
            ) as HTMLElement[];
            const bad: any[] = [];
            let count = 0;

            for (const el of controls) {
              const style = window.getComputedStyle(el);
              if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                continue;
              }
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 && rect.height === 0) continue;
              if (el.getClientRects().length === 0) continue;
              count++;
              if (rect.width < 43.5 || rect.height < 43.5) {
                bad.push({
                  view: tId,
                  viewport: vName,
                  tag: el.tagName.toLowerCase(),
                  label: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 48),
                  width: Number(rect.width.toFixed(1)),
                  height: Number(rect.height.toFixed(1)),
                  classes: (typeof el.className === 'string' ? el.className : '').slice(0, 80),
                });
              }
            }
            return { overflow, count, bad };
          },
          { vName: vp.name, tId: tabId }
        );

        totalMeasuredControls += measure.count;
        if (measure.overflow) {
          throw new Error(`Check 4 GAGAL: Horizontal overflow terdeteksi pada tab=${tabId} viewport=${vp.name}`);
        }
        violations.push(...measure.bad);
      }

      // Audit modal interaktif: DeviceHandoverModal
      const handoverBtn = pageA2.locator('button[title*="Serah Terima Tablet"]');
      if (await handoverBtn.isVisible()) {
        await handoverBtn.click();
        await pageA2.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 5000 });
        const modalMeasure = await pageA2.evaluate((vName: string) => {
          const dialog = document.querySelector('[role="dialog"]');
          if (!dialog) return { count: 0, bad: [] as any[] };
          const controls = Array.from(dialog.querySelectorAll('button, select')) as HTMLElement[];
          const bad: any[] = [];
          let count = 0;
          for (const el of controls) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            count++;
            if (rect.width < 43.5 || rect.height < 43.5) {
              bad.push({
                view: 'DeviceHandoverModal',
                viewport: vName,
                tag: el.tagName.toLowerCase(),
                label: (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 48),
                width: Number(rect.width.toFixed(1)),
                height: Number(rect.height.toFixed(1)),
                classes: (typeof el.className === 'string' ? el.className : '').slice(0, 80),
              });
            }
          }
          return { count, bad };
        }, vp.name);
        totalMeasuredControls += modalMeasure.count;
        violations.push(...modalMeasure.bad);
        await pageA2.locator('button[aria-label="Tutup Modal"]').click();
      }
    }

    // Verifikasi live adaptasi variabel CSS --viewport-height saat ukuran jendela berubah
    await pageA2.setViewportSize({ width: 1340, height: 800 });
    await pageA2.waitForTimeout(100);
    const vhFull = await pageA2.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--viewport-height').trim()
    );
    await pageA2.setViewportSize({ width: 1340, height: 480 });
    await pageA2.waitForTimeout(150);
    const vhResized = await pageA2.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--viewport-height').trim()
    );

    if (vhFull !== '800px' || vhResized !== '480px') {
      throw new Error(`Check 4 GAGAL: CSS --viewport-height tidak beradaptasi live (${vhFull} -> ${vhResized})`);
    }

    if (violations.length > 0) {
      const sample = violations
        .slice(0, 8)
        .map((v) => `[${v.viewport}/${v.view}] <${v.tag}> "${v.label}" = ${v.width}x${v.height}px`)
        .join('; ');
      throw new Error(`Check 4 GAGAL: Ditemukan ${violations.length} kontrol sentuh < 44px: ${sample}`);
    }

    await contextA.close();
    console.log(
      `✓ Check 4: Audit Chromium getBoundingClientRect() mengukur ${totalMeasuredControls} elemen aktif pada 1340x800 & 800x1340 + DeviceHandoverModal (0 pelanggaran <44px, 0 overflow, --viewport-height ${vhFull}->${vhResized})`
    );
    passed++;
  } finally {
    if (browser) await browser.close();
    await stopServer();
  }

  // =========================================================================
  // CHECK 5: Verifikasi Deterministik Lockfile Tunggal (package-lock.json) & npm ci
  // =========================================================================
  const pkgPath = path.join(rootDir, 'package.json');
  const pkgLockPath = path.join(rootDir, 'package-lock.json');

  if (!fs.existsSync(pkgLockPath)) {
    throw new Error('Check 5 GAGAL: package-lock.json tidak ditemukan');
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const pkgLock = JSON.parse(fs.readFileSync(pkgLockPath, 'utf8'));

  if (!pkgLock.lockfileVersion || pkgLock.lockfileVersion < 2 || !pkgLock.packages) {
    throw new Error('Check 5 GAGAL: package-lock.json tidak memuat lockfileVersion >= 2 atau struktur packages');
  }

  const allDirectDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };
  for (const depName of Object.keys(allDirectDeps)) {
    const lockedEntry = pkgLock.packages[`node_modules/${depName}`];
    if (!lockedEntry || !lockedEntry.version) {
      throw new Error(`Check 5 GAGAL: Dependensi '${depName}' belum terkunci di package-lock.json`);
    }
  }

  // Pastikan instalasi ulang via lockfile berjalan deterministik tanpa konflik peer
  execSync('npm ci --ignore-scripts --dry-run', { cwd: rootDir, stdio: 'pipe' });

  console.log(
    `✓ Check 5: package-lock.json tunggal (v${pkgLock.lockfileVersion}) tervalidasi mengunci ${Object.keys(allDirectDeps).length} dependensi langsung + npm ci --dry-run PASS`
  );
  passed++;

  console.log(`\nTC-P17-03: ${passed}/5 checks PASS (100% OK)`);
}

runPhysicalTelemetryAndQualityTests().catch((err) => {
  console.error('[FAIL] TC-P17-03 ERROR:', err?.message || err);
  process.exit(1);
});
