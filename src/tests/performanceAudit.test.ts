/**
 * TC-P17-04: Performance Audit Tab & PWA Diagnostics Runtime Test Suite (TASK-111)
 * References: UX-18, PERF-002
 *
 * Verifies:
 * 1. Pure audit scoring engine across optimal and degraded snapshots, FCP/heap/touch/quota thresholds,
 *    and Markdown report generation (LF endings, zero placeholder, 0 quota -> N/A).
 * 2. Deep-link routing `/?tab=performance-audit` and header navigation trigger in live Chromium.
 * 3. Real-time PWA diagnostics (Network online/offline transitions, Cache Storage/StorageManager,
 *    Service Worker active/waiting/installing states & update handler).
 * 4. Interactive 'Check Optimization' execution producing 0-100 scorecard + all 5 tablet indicators,
 *    1-tap copy summary, and real `.md` Blob download verification.
 * 5. SM-T225 touch target ergonomics (`getBoundingClientRect() >= 44px`), typography floor (`>= 12px`),
 *    and zero horizontal overflow on `1340x800` Landscape and `800x1340` Portrait.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as http from 'node:http';
import { spawn, ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  PwaDiagnosticsSnapshot,
  evaluatePerformanceAudit,
  buildPerformanceSummaryLine,
  buildPerformanceReportMarkdown,
  formatQuotaCapacity,
} from '../utils/performanceAuditEngine';

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

  const port = 4181;
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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function verifyAuditEngineUnitLogic(): void {
  assert(formatQuotaCapacity(0) === 'N/A', 'Quota 0 bytes harus diformat menjadi N/A, bukan 0.0 GB');
  assert(formatQuotaCapacity(-10) === 'N/A', 'Quota negatif harus diformat menjadi N/A');
  assert(formatQuotaCapacity(2 * 1024 * 1024 * 1024) === '2.0 GB', 'Quota 2 GiB harus diformat menjadi 2.0 GB');

  const optimalSnapshot: PwaDiagnosticsSnapshot = {
    capturedAt: '2026-11-11T07:00:00.000Z',
    online: true,
    connectionType: '4g',
    downlinkMbps: 10,
    rttMs: 40,
    sw: {
      supported: true,
      registered: true,
      scope: 'http://127.0.0.1:3000/',
      controllerActive: true,
      activeState: 'activated',
      waitingState: 'none',
      installingState: 'none',
      updateAvailable: false,
      stateSummary: 'activated',
    },
    storage: {
      cacheSupported: true,
      storageApiSupported: true,
      caches: [{ name: 'zlce-mobile-v4.1.0', itemCount: 14, estimatedBucketBytes: 512000 }],
      totalItems: 14,
      estimatedUsageBytes: 1200000,
      cacheUsageBytes: 512000,
      quotaBytes: 2 * 1024 * 1024 * 1024,
      usageRatioPercent: 0.06,
    },
    telemetry: {
      fcpMs: 380,
      domInteractiveMs: 290,
      heapUsedMB: 58,
      heapTotalMB: 92,
      heapBudgetLimitMB: 150,
      touchControlsTotal: 42,
      touchControlsCompliant: 42,
      touchCompliancePercent: 100,
      touchViolationsSample: [],
      viewportDimensions: '1340x800',
      hasVisualViewportVar: true,
      autoDraftKeyCount: 4,
      autoDraftListenersReady: true,
    },
  };

  const optimalReport = evaluatePerformanceAudit(optimalSnapshot);
  assert(optimalReport.overallScore === 100, `Skor optimal harus 100, didapat ${optimalReport.overallScore}`);
  assert(optimalReport.grade === 'A', `Grade optimal harus A, didapat ${optimalReport.grade}`);
  assert(optimalReport.metrics.length === 5, `Harus terdapat 5 metrik evaluasi, didapat ${optimalReport.metrics.length}`);
  for (const m of optimalReport.metrics) {
    assert(m.status === 'PASS', `Metrik optimal ${m.id} harus PASS, didapat ${m.status}`);
  }

  const degradedSnapshot: PwaDiagnosticsSnapshot = {
    capturedAt: '2026-11-11T07:05:00.000Z',
    online: false,
    connectionType: 'slow-2g',
    downlinkMbps: 0.1,
    rttMs: 1200,
    sw: {
      supported: true,
      registered: false,
      scope: null,
      controllerActive: false,
      activeState: 'not_registered',
      waitingState: 'none',
      installingState: 'none',
      updateAvailable: false,
      stateSummary: 'not_registered',
    },
    storage: {
      cacheSupported: true,
      storageApiSupported: true,
      caches: [],
      totalItems: 0,
      estimatedUsageBytes: 95 * 1024 * 1024,
      cacheUsageBytes: 0,
      quotaBytes: 100 * 1024 * 1024,
      usageRatioPercent: 95,
    },
    telemetry: {
      fcpMs: 3600,
      domInteractiveMs: 3900,
      heapUsedMB: 215,
      heapTotalMB: 260,
      heapBudgetLimitMB: 150,
      touchControlsTotal: 20,
      touchControlsCompliant: 14,
      touchCompliancePercent: 70,
      touchViolationsSample: ['Tombol Kecil (30x28px)'],
      viewportDimensions: '1340x800',
      hasVisualViewportVar: false,
      autoDraftKeyCount: 0,
      autoDraftListenersReady: false,
    },
  };

  const degradedReport = evaluatePerformanceAudit(degradedSnapshot);
  assert(degradedReport.overallScore < 40, `Skor degraded harus < 40, didapat ${degradedReport.overallScore}`);
  assert(degradedReport.grade === 'D', `Grade degraded harus D, didapat ${degradedReport.grade}`);
  assert(
    degradedReport.metrics.every((m) => m.status === 'FAIL' && Boolean(m.recommendation)),
    'Seluruh 5 metrik kritis pada snapshot degraded harus berstatus FAIL beserta rekomendasi'
  );

  const summary = buildPerformanceSummaryLine(optimalReport);
  assert(summary.includes('100/100') && summary.includes('Grade A'), 'Ringkasan copy tidak memuat skor/grade');

  const md = buildPerformanceReportMarkdown(optimalReport);
  assert(!md.includes('\r\n'), 'Laporan Markdown harus menggunakan LF Unix');
  assert(md.includes('OPT-PWA-01') && md.includes('OPT-TIME-01') && md.includes('OPT-ERG-01') && md.includes('OPT-MEM-01') && md.includes('OPT-STOR-01'), 'Laporan Markdown harus memuat kelima kode metrik');
}

async function runPerformanceAuditTests(): Promise<void> {
  console.log('============================================================');
  console.log('TC-P17-04: Performance Audit Tab & PWA Diagnostics Verification');
  console.log('============================================================');

  const rootDir = process.cwd();

  // Check 1: Pure Engine & Export Formatting Unit Assertions
  verifyAuditEngineUnitLogic();
  console.log('[PASS] Check 1: Audit scoring engine (optimal=100/A, degraded<40/D), quota N/A & Markdown LF formatting verified');

  // Check 2-5: Real Headless Chromium Runtime Verification
  const pw = loadPlaywright();
  const { baseUrl, stopServer } = await ensureAppServer(rootDir);
  let browser: any = null;

  try {
    browser = await pw.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const context = await browser.newContext({
      viewport: { width: 1340, height: 800 },
      permissions: ['clipboard-read', 'clipboard-write'],
      acceptDownloads: true,
    });
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (err: Error) => pageErrors.push(err.message));

    // Check 2: Deep Link ?tab=performance-audit & Header Navigation Trigger
    await page.goto(`${baseUrl}/?tab=performance-audit`, { waitUntil: 'networkidle' });
    await page.locator('h1', { hasText: 'Performance Audit & PWA Diagnostics' }).waitFor({ state: 'visible', timeout: 10000 });

    // Confirm navigation from Dashboard via consolidated Diagnostik & Kualitas -> Audit Performa PWA works too
    await page.getByRole('button', { name: 'Dashboard' }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /Diagnostik & Kualitas/i }).click();
    await page.getByRole('button', { name: /Audit Performa PWA/i }).click();
    await page.locator('h1', { hasText: 'Performance Audit & PWA Diagnostics' }).waitFor({ state: 'visible', timeout: 8000 });
    console.log('[PASS] Check 2: Deep-link /?tab=performance-audit and consolidated Diagnostics nav routing verified in Chromium');

    // Check 3: Real-time Diagnostic Cards (Offline/Online Reactivity, Cache Storage, SW Sub-States & Update Handler)
    const swCard = page.locator('article[aria-label="Kartu Diagnostik Service Worker"]');
    await swCard.locator('dt', { hasText: 'Active' }).waitFor({ state: 'visible', timeout: 5000 });
    await swCard.locator('dt', { hasText: 'Waiting' }).waitFor({ state: 'visible', timeout: 5000 });
    await swCard.locator('dt', { hasText: 'Installing' }).waitFor({ state: 'visible', timeout: 5000 });

    // Click 'Periksa Update' and verify accessible toast feedback responds without error
    await swCard.getByRole('button', { name: /Periksa Update/i }).click();
    await page.locator('[role="status"]').first().waitFor({ state: 'visible', timeout: 5000 });

    // Toggle real browser offline mode and confirm network card updates live
    const netCard = page.locator('article[aria-label="Kartu Diagnostik Status Jaringan"]');
    await netCard.locator('text=Terhubung').waitFor({ state: 'visible', timeout: 5000 });
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await netCard.locator('text=Mode Luring').waitFor({ state: 'visible', timeout: 5000 });
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await netCard.locator('text=Terhubung').waitFor({ state: 'visible', timeout: 5000 });

    const cacheCard = page.locator('article[aria-label="Kartu Diagnostik Cache Storage"]');
    const quotaText = (await cacheCard.locator('dd').nth(1).innerText()).trim();
    assert(
      quotaText === 'N/A' || (/^\d+(\.\d+)?\s*(MB|GB)$/i.test(quotaText) && !/^0(\.0+)?\s*(MB|GB)$/i.test(quotaText)),
      `Kapasitas kuota storage tidak valid atau nol GB: "${quotaText}"`
    );
    console.log(`[PASS] Check 3: Live network online/offline, Cache Storage (quota=${quotaText}) & SW lifecycle/update controls verified`);

    // Check 4: Empty state -> Click 'Check Optimization' -> Scorecard 0-100, 5 Metrics, 1-Tap Copy & .md Download
    await page.locator('text=Belum Ada Hasil Audit Optimasi').waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: /Check Optimization/i }).click();

    const scorecardSection = page.locator('section[aria-label="Scorecard Audit Optimasi PWA"]');
    await scorecardSection.waitFor({ state: 'visible', timeout: 8000 });
    const scorecardText = await scorecardSection.innerText();
    assert(/(\d{1,3})\s*\/\s*100/.test(scorecardText), `Scorecard tidak memuat skor /100: ${scorecardText}`);

    assert(
      scorecardText.includes('First Contentful Paint (FCP)') || scorecardText.includes('Navigation Timing & Render Awal'),
      'Scorecard kehilangan indikator timing FCP / Navigation Timing'
    );
    for (const metricTitle of [
      'Service Worker Lifecycle',
      'Kepatuhan Target Sentuh 44px+',
      'Konsumsi Heap RAM',
      'Auto-Draft Listeners',
    ]) {
      assert(scorecardText.includes(metricTitle), `Scorecard kehilangan indikator wajib: ${metricTitle}`);
    }

    // 1-Tap Copy Summary verification
    await scorecardSection.getByRole('button', { name: /Salin Ringkasan/i }).click();
    await scorecardSection.getByRole('button', { name: /Ringkasan Disalin!/i }).waitFor({ state: 'visible', timeout: 5000 });

    // Download Markdown .md verification
    const downloadPromise = page.waitForEvent('download', { timeout: 8000 });
    await scorecardSection.getByRole('button', { name: /Unduh \.md/i }).click();
    const download = await downloadPromise;
    assert(
      download.suggestedFilename().startsWith('zlce-pwa-performance-audit-') && download.suggestedFilename().endsWith('.md'),
      `Nama berkas unduhan tidak sesuai: ${download.suggestedFilename()}`
    );
    const downloadedPath = await download.path();
    assert(downloadedPath, 'Path hasil unduhan Playwright tidak tersedia');
    const downloadedMd = fs.readFileSync(downloadedPath, 'utf-8');
    assert(!downloadedMd.includes('\r\n'), 'Berkas laporan .md hasil unduhan harus menggunakan line-ending Unix LF');
    assert(
      downloadedMd.includes('OPT-PWA-01') &&
        downloadedMd.includes('OPT-TIME-01') &&
        downloadedMd.includes('OPT-ERG-01') &&
        downloadedMd.includes('OPT-MEM-01') &&
        downloadedMd.includes('OPT-STOR-01'),
      'Berkas .md hasil unduhan tidak memuat seluruh 5 indikator scorecard'
    );
    console.log('[PASS] Check 4: Check Optimization scorecard (0-100, 5 metrics), 1-tap clipboard copy & Markdown .md download verified');

    // Check 5: SM-T225 Viewports (1340x800 & 800x1340) Touch Target >= 44px, Typography >= 12px & 0 Overflow
    const viewports = [
      { name: 'SM-T225-Landscape', width: 1340, height: 800 },
      { name: 'SM-T225-Portrait', width: 800, height: 1340 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(150);

      const layoutAudit = await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
        const controls = Array.from(document.querySelectorAll('button, a[href], select')) as HTMLElement[];
        const smallControls: string[] = [];

        for (const el of controls) {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;
          if (el.getClientRects().length === 0) continue;
          if (rect.width < 43.5 || rect.height < 43.5) {
            smallControls.push(
              `${el.tagName.toLowerCase()} "${(el.innerText || el.getAttribute('aria-label') || '').trim()}" (${rect.width.toFixed(1)}x${rect.height.toFixed(1)}px)`
            );
          }
        }

        const sub12Texts: string[] = [];
        const mainEl = document.querySelector('main');
        if (mainEl) {
          const walker = document.createTreeWalker(mainEl, NodeFilter.SHOW_ELEMENT);
          let node = walker.currentNode as HTMLElement | null;
          while (node) {
            const st = window.getComputedStyle(node);
            if (st.display !== 'none' && st.visibility !== 'hidden') {
              const fontPx = Number.parseFloat(st.fontSize || '12');
              const directText = Array.from(node.childNodes)
                .filter((n) => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0)
                .map((n) => (n.textContent || '').trim())
                .join(' ');
              if (directText.length > 0 && fontPx < 11.9) {
                sub12Texts.push(`"${directText.slice(0, 24)}"=${fontPx}px`);
              }
            }
            node = walker.nextNode() as HTMLElement | null;
          }
        }

        return {
          overflow,
          controlsMeasured: controls.length,
          smallControls,
          sub12Texts,
        };
      });

      assert(!layoutAudit.overflow, `Horizontal overflow terdeteksi pada viewport ${vp.name}`);
      assert(
        layoutAudit.smallControls.length === 0,
        `Ditemukan kontrol sentuh < 44px pada ${vp.name}: ${layoutAudit.smallControls.join(', ')}`
      );
      assert(
        layoutAudit.sub12Texts.length === 0,
        `Ditemukan teks di bawah 12px pada ${vp.name}: ${layoutAudit.sub12Texts.join(', ')}`
      );
    }

    assert(pageErrors.length === 0, `Uncaught Chromium pageerror: ${pageErrors.join(' | ')}`);
    console.log('[PASS] Check 5: SM-T225 Landscape/Portrait (>=44px touch targets, >=12px text, 0 overflow, 0 pageerrors) verified');

    await context.close();
  } finally {
    if (browser) await browser.close();
    await stopServer();
  }

  console.log('============================================================');
  console.log('RESULT: ALL PERFORMANCE AUDIT TAB CHECKS PASSED (5/5 checks OK)');
  console.log('============================================================');
}

runPerformanceAuditTests().catch((err) => {
  console.error('[FAIL] TC-P17-04 ERROR:', err?.message || err);
  process.exit(1);
});
