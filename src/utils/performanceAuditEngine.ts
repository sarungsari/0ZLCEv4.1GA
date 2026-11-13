/**
 * Pure PWA Diagnostics & Performance Audit Engine (TASK-111 / UX-18 / PERF-002)
 * Mengevaluasi kesehatan Service Worker, Cache Storage / StorageManager,
 * First Contentful Paint (FCP), kepatuhan target sentuh 44px+, heap RAM SM-T225,
 * dan kesiapan auto-draft listeners secara deterministik.
 */

export interface CacheBucketDetail {
  name: string;
  itemCount: number;
  estimatedBucketBytes?: number | null;
}

export type SwLifecycleState =
  | 'activated'
  | 'activating'
  | 'installed'
  | 'installing'
  | 'redundant'
  | 'parsed'
  | 'none'
  | 'not_registered'
  | 'unsupported'
  | 'error';

export interface ServiceWorkerDiagnostic {
  supported: boolean;
  registered: boolean;
  scope: string | null;
  controllerActive: boolean;
  activeState: SwLifecycleState;
  waitingState: SwLifecycleState;
  installingState: SwLifecycleState;
  updateAvailable: boolean;
  stateSummary: string;
}

export interface StorageQuotaDiagnostic {
  cacheSupported: boolean;
  storageApiSupported: boolean;
  caches: CacheBucketDetail[];
  totalItems: number;
  estimatedUsageBytes: number;
  cacheUsageBytes: number | null;
  quotaBytes: number;
  usageRatioPercent: number | null;
}

export interface RuntimePerformanceTelemetry {
  fcpMs: number | null;
  domInteractiveMs: number | null;
  heapUsedMB: number | null;
  heapTotalMB: number | null;
  heapBudgetLimitMB: number;
  touchControlsTotal: number;
  touchControlsCompliant: number;
  touchCompliancePercent: number | null;
  touchViolationsSample: string[];
  viewportDimensions: string;
  hasVisualViewportVar: boolean;
  autoDraftKeyCount: number;
  autoDraftListenersReady: boolean;
}

export interface PwaDiagnosticsSnapshot {
  capturedAt: string;
  online: boolean;
  connectionType: string;
  downlinkMbps: number | null;
  rttMs: number | null;
  sw: ServiceWorkerDiagnostic;
  storage: StorageQuotaDiagnostic;
  telemetry: RuntimePerformanceTelemetry;
}

export type AuditCategory = 'pwa' | 'timing' | 'ergonomics' | 'memory' | 'storage';
export type AuditMetricStatus = 'PASS' | 'WARN' | 'FAIL';

export interface PerformanceMetricResult {
  id: string;
  title: string;
  category: AuditCategory;
  status: AuditMetricStatus;
  score: number;
  maxScore: number;
  observedValue: string;
  thresholdLabel: string;
  details: string;
  recommendation?: string;
}

export interface PerformanceAuditReport {
  timestamp: string;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  readinessLabel: string;
  metrics: PerformanceMetricResult[];
  snapshot: PwaDiagnosticsSnapshot;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return 'N/A';
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function formatQuotaCapacity(quotaBytes: number): string {
  if (!Number.isFinite(quotaBytes) || quotaBytes <= 0) {
    return 'N/A';
  }
  const gb = quotaBytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`;
  }
  const mb = quotaBytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

export function formatSwStateLabel(state: SwLifecycleState): string {
  switch (state) {
    case 'activated':
      return 'Activated';
    case 'activating':
      return 'Activating';
    case 'installed':
      return 'Installed';
    case 'installing':
      return 'Installing';
    case 'redundant':
      return 'Redundant';
    case 'parsed':
      return 'Parsed';
    case 'none':
      return 'None';
    case 'not_registered':
      return 'Belum Terdaftar';
    case 'unsupported':
      return 'Tidak Didukung';
    case 'error':
      return 'Error';
    default:
      return String(state);
  }
}

export function evaluatePerformanceAudit(snapshot: PwaDiagnosticsSnapshot): PerformanceAuditReport {
  const metrics: PerformanceMetricResult[] = [];
  const { sw, storage, telemetry } = snapshot;

  // 1. Service Worker Registration, Sub-States & Controller (20 pts)
  const swActiveOk = sw.registered && (sw.activeState === 'activated' || sw.controllerActive);
  if (swActiveOk && !sw.updateAvailable && sw.waitingState === 'none') {
    metrics.push({
      id: 'OPT-PWA-01',
      title: 'Service Worker Lifecycle & Controller',
      category: 'pwa',
      status: 'PASS',
      score: 20,
      maxScore: 20,
      observedValue: sw.controllerActive ? 'Active · Controller OK' : 'Registered · Activated',
      thresholdLabel: 'Active & Controller',
      details: `SW terdaftar pada scope ${sw.scope || '/'} (active: ${sw.activeState}, waiting: ${sw.waitingState}, installing: ${sw.installingState}).`,
    });
  } else if (swActiveOk && (sw.updateAvailable || sw.waitingState !== 'none')) {
    metrics.push({
      id: 'OPT-PWA-01',
      title: 'Service Worker Lifecycle & Update Handler',
      category: 'pwa',
      status: 'PASS',
      score: 17,
      maxScore: 20,
      observedValue: 'Update Waiting',
      thresholdLabel: 'Active & Latest SW',
      details: `SW aktif dengan pembaruan baru menunggu aktivasi non-destruktif (waiting: ${sw.waitingState}).`,
      recommendation: 'Gunakan tombol Terapkan Update SW pada kartu Service Worker saat sesi edit sedang aman.',
    });
  } else if (sw.registered) {
    metrics.push({
      id: 'OPT-PWA-01',
      title: 'Service Worker Lifecycle & Controller',
      category: 'pwa',
      status: 'WARN',
      score: 12,
      maxScore: 20,
      observedValue: sw.stateSummary,
      thresholdLabel: 'Active & Controller',
      details: `SW terdaftar (${sw.stateSummary}), namun controller belum mengklaim halaman aktif.`,
      recommendation: 'Muat ulang tab agar Service Worker mengambil alih permintaan offline.',
    });
  } else {
    metrics.push({
      id: 'OPT-PWA-01',
      title: 'Service Worker Lifecycle & Controller',
      category: 'pwa',
      status: 'FAIL',
      score: 4,
      maxScore: 20,
      observedValue: sw.supported ? 'Belum Terdaftar' : 'Tidak Didukung',
      thresholdLabel: 'Active & Controller',
      details: sw.supported
        ? 'Service Worker belum terdaftar di origin ini.'
        : 'Browser atau konteks non-HTTPS tidak mendukung Service Worker API.',
      recommendation: 'Pastikan halaman diakses melalui HTTPS atau localhost (127.0.0.1) dan public/sw.js termuat.',
    });
  }

  // 2. First Contentful Paint (FCP) & Navigation Timing (20 pts)
  if (telemetry.fcpMs !== null) {
    const fcpRounded = Math.round(telemetry.fcpMs);
    if (fcpRounded <= 1800) {
      metrics.push({
        id: 'OPT-TIME-01',
        title: 'First Contentful Paint (FCP)',
        category: 'timing',
        status: 'PASS',
        score: 20,
        maxScore: 20,
        observedValue: `${fcpRounded} ms`,
        thresholdLabel: '<= 1800 ms',
        details: `FCP tercatat ${fcpRounded} ms (cepat di bawah ambang Core Web Vitals 1800 ms${
          telemetry.domInteractiveMs !== null ? `, DOM interactive ${Math.round(telemetry.domInteractiveMs)} ms` : ''
        }).`,
      });
    } else if (fcpRounded <= 3000) {
      metrics.push({
        id: 'OPT-TIME-01',
        title: 'First Contentful Paint (FCP)',
        category: 'timing',
        status: 'WARN',
        score: 13,
        maxScore: 20,
        observedValue: `${fcpRounded} ms`,
        thresholdLabel: '<= 1800 ms',
        details: `FCP tercatat ${fcpRounded} ms (sedang, ambang optimal tablet <= 1800 ms).`,
        recommendation: 'Pastikan Cache-First App Shell aktif dan hindari memuat berkas besar sebelum interaksi awal.',
      });
    } else {
      metrics.push({
        id: 'OPT-TIME-01',
        title: 'First Contentful Paint (FCP)',
        category: 'timing',
        status: 'FAIL',
        score: 6,
        maxScore: 20,
        observedValue: `${fcpRounded} ms`,
        thresholdLabel: '<= 1800 ms',
        details: `FCP lambat (${fcpRounded} ms, melewati batas toleransi 3000 ms).`,
        recommendation: 'Periksa bundel CSS/JS awal dan pastikan aset inti sudah masuk Cache Storage.',
      });
    }
  } else if (telemetry.domInteractiveMs !== null) {
    const domMs = Math.round(telemetry.domInteractiveMs);
    const isFast = domMs <= 1800;
    metrics.push({
      id: 'OPT-TIME-01',
      title: 'Navigation Timing & Render Awal',
      category: 'timing',
      status: isFast ? 'PASS' : 'WARN',
      score: isFast ? 18 : 12,
      maxScore: 20,
      observedValue: `${domMs} ms (DOM)`,
      thresholdLabel: '<= 1800 ms',
      details: `Entri paint FCP belum terekspos engine; DOM interactive selesai dalam ${domMs} ms.`,
      recommendation: isFast ? undefined : 'Aktifkan pre-cache aset inti agar pemuatan ulang instan.',
    });
  } else {
    metrics.push({
      id: 'OPT-TIME-01',
      title: 'First Contentful Paint (FCP)',
      category: 'timing',
      status: 'WARN',
      score: 14,
      maxScore: 20,
      observedValue: 'N/A',
      thresholdLabel: '<= 1800 ms',
      details: 'Performance Paint Timing API tidak melaporkan entri FCP pada konteks runtime ini.',
      recommendation: 'Uji di Chromium tablet untuk membaca entri FCP perangkat keras aktual.',
    });
  }

  // 3. Touch Target 44px+ Compliance & Visual Viewport (20 pts)
  if (telemetry.touchControlsTotal > 0 && telemetry.touchCompliancePercent !== null) {
    const ratio = telemetry.touchCompliancePercent;
    if (ratio >= 100 && telemetry.hasVisualViewportVar) {
      metrics.push({
        id: 'OPT-ERG-01',
        title: 'Kepatuhan Target Sentuh 44px+ & Viewport',
        category: 'ergonomics',
        status: 'PASS',
        score: 20,
        maxScore: 20,
        observedValue: `100% (${telemetry.touchControlsCompliant}/${telemetry.touchControlsTotal})`,
        thresholdLabel: '>= 95% & Viewport OK',
        details: `Seluruh ${telemetry.touchControlsTotal} kontrol aktif memenuhi target sentuh >= 44px pada viewport ${telemetry.viewportDimensions} px.`,
      });
    } else if (ratio >= 95) {
      metrics.push({
        id: 'OPT-ERG-01',
        title: 'Kepatuhan Target Sentuh 44px+ & Viewport',
        category: 'ergonomics',
        status: 'PASS',
        score: telemetry.hasVisualViewportVar ? 18 : 16,
        maxScore: 20,
        observedValue: `${ratio.toFixed(1)}% (${telemetry.touchControlsCompliant}/${telemetry.touchControlsTotal})`,
        thresholdLabel: '>= 95% & Viewport OK',
        details: `${telemetry.touchControlsCompliant} dari ${telemetry.touchControlsTotal} kontrol memenuhi >= 44px.${
          telemetry.touchViolationsSample.length > 0
            ? ` Sampel <44px: ${telemetry.touchViolationsSample.join(', ')}.`
            : ''
        }`,
        recommendation:
          telemetry.touchViolationsSample.length > 0
            ? 'Tambahkan kelas touch-target-44 min-h-[44px] pada elemen interaktif yang tercantum.'
            : undefined,
      });
    } else if (ratio >= 85) {
      metrics.push({
        id: 'OPT-ERG-01',
        title: 'Kepatuhan Target Sentuh 44px+ & Viewport',
        category: 'ergonomics',
        status: 'WARN',
        score: 12,
        maxScore: 20,
        observedValue: `${ratio.toFixed(1)}% (${telemetry.touchControlsCompliant}/${telemetry.touchControlsTotal})`,
        thresholdLabel: '>= 95%',
        details: `Hanya ${ratio.toFixed(1)}% elemen aktif mencapai >= 44px. Sampel: ${
          telemetry.touchViolationsSample.join(', ') || 'lihat audit DOM'
        }.`,
        recommendation: 'Terapkan touch-target-44 dan min-h-[44px] min-w-[44px] di seluruh tombol kecil.',
      });
    } else {
      metrics.push({
        id: 'OPT-ERG-01',
        title: 'Kepatuhan Target Sentuh 44px+ & Viewport',
        category: 'ergonomics',
        status: 'FAIL',
        score: 5,
        maxScore: 20,
        observedValue: `${ratio.toFixed(1)}% (${telemetry.touchControlsCompliant}/${telemetry.touchControlsTotal})`,
        thresholdLabel: '>= 95%',
        details: `Tingkat kepatuhan target sentuh rendah (${ratio.toFixed(1)}%) berisiko salah ketuk di layar tablet 8.7".`,
        recommendation: 'Audit ulang tombol/tautan agar minimum 44x44px sesuai standar SM-T225.',
      });
    }
  } else {
    metrics.push({
      id: 'OPT-ERG-01',
      title: 'Kepatuhan Target Sentuh 44px+ & Viewport',
      category: 'ergonomics',
      status: telemetry.hasVisualViewportVar ? 'PASS' : 'WARN',
      score: telemetry.hasVisualViewportVar ? 16 : 8,
      maxScore: 20,
      observedValue: telemetry.viewportDimensions,
      thresholdLabel: '--viewport-height aktif',
      details: telemetry.hasVisualViewportVar
        ? `Variabel --viewport-height aktif (${telemetry.viewportDimensions} px); pemindaian DOM tidak mendeteksi elemen terukur.`
        : 'Variabel CSS --viewport-height belum terpasang pada root dokumen.',
      recommendation: telemetry.hasVisualViewportVar ? undefined : 'Pastikan MobileLayout aktif membungkus UI utama.',
    });
  }

  // 4. Heap RAM Estimate for 3GB SM-T225 (< 150 MB) (20 pts)
  const budgetMB = telemetry.heapBudgetLimitMB || 150;
  if (telemetry.heapUsedMB !== null) {
    const used = Math.round(telemetry.heapUsedMB);
    if (used <= 110) {
      metrics.push({
        id: 'OPT-MEM-01',
        title: 'Konsumsi Heap RAM (Target Tablet 3GB)',
        category: 'memory',
        status: 'PASS',
        score: 20,
        maxScore: 20,
        observedValue: `${used} MB`,
        thresholdLabel: `< ${budgetMB} MB`,
        details: `Heap JS terukur ${used} MB${
          telemetry.heapTotalMB ? ` dari alokasi ${Math.round(telemetry.heapTotalMB)} MB` : ''
        } — aman di bawah ambang Android LMK (${budgetMB} MB).`,
      });
    } else if (used <= budgetMB) {
      metrics.push({
        id: 'OPT-MEM-01',
        title: 'Konsumsi Heap RAM (Target Tablet 3GB)',
        category: 'memory',
        status: 'PASS',
        score: 17,
        maxScore: 20,
        observedValue: `${used} MB`,
        thresholdLabel: `< ${budgetMB} MB`,
        details: `Heap JS ${used} MB masih di bawah batas ${budgetMB} MB, namun mendekati zona waspada tablet 3GB.`,
        recommendation: 'Tutup editor dokumen >2MB setelah sinkronisasi agar GC membebaskan memori.',
      });
    } else if (used <= 200) {
      metrics.push({
        id: 'OPT-MEM-01',
        title: 'Konsumsi Heap RAM (Target Tablet 3GB)',
        category: 'memory',
        status: 'WARN',
        score: 10,
        maxScore: 20,
        observedValue: `${used} MB`,
        thresholdLabel: `< ${budgetMB} MB`,
        details: `Heap JS (${used} MB) melampaui target ketat ${budgetMB} MB untuk Samsung Tab A7 Lite 3GB.`,
        recommendation: 'Pangkas riwayat snapshot lokal dan muat ulang tab untuk memicu pembersihan memori.',
      });
    } else {
      metrics.push({
        id: 'OPT-MEM-01',
        title: 'Konsumsi Heap RAM (Target Tablet 3GB)',
        category: 'memory',
        status: 'FAIL',
        score: 4,
        maxScore: 20,
        observedValue: `${used} MB`,
        thresholdLabel: `< ${budgetMB} MB`,
        details: `Konsumsi heap tinggi (${used} MB) berisiko memicu Android LMK SIGKILL saat berpindah ke Termux.`,
        recommendation: 'Simpan state segera lalu muat ulang aplikasi untuk reset alokasi heap.',
      });
    }
  } else {
    metrics.push({
      id: 'OPT-MEM-01',
      title: 'Konsumsi Heap RAM (Target Tablet 3GB)',
      category: 'memory',
      status: 'PASS',
      score: 18,
      maxScore: 20,
      observedValue: 'Lazy-Split Active',
      thresholdLabel: `< ${budgetMB} MB`,
      details: 'API performance.memory khusus Chromium tidak diekspos runtime ini; isolasi lazy chunk React aktif menjaga jejak memori tetap ringan.',
    });
  }

  // 5. Auto-Draft Listeners, Cache Storage & Quota Usage Ratio (20 pts)
  const quotaRatio = storage.usageRatioPercent;
  const hasCacheData = storage.totalItems > 0;
  const quotaCritical = quotaRatio !== null && quotaRatio >= 90;
  const quotaWarn = quotaRatio !== null && quotaRatio >= 75 && quotaRatio < 90;

  if (quotaCritical) {
    metrics.push({
      id: 'OPT-STOR-01',
      title: 'Auto-Draft Listeners, Cache & Kuota Storage',
      category: 'storage',
      status: 'FAIL',
      score: 5,
      maxScore: 20,
      observedValue: `${quotaRatio.toFixed(1)}% Kuota`,
      thresholdLabel: '< 75% Kuota · Auto-Draft Ready',
      details: `Pemakaian kuota sangat tinggi (${quotaRatio.toFixed(1)}%), berisiko QuotaExceededError saat menyimpan draft.`,
      recommendation: 'Ekspor SESSION_STATE.md lalu bersihkan cache usang atau riwayat lokal.',
    });
  } else if (telemetry.autoDraftListenersReady && hasCacheData && !quotaWarn) {
    metrics.push({
      id: 'OPT-STOR-01',
      title: 'Auto-Draft Listeners, Cache & Kuota Storage',
      category: 'storage',
      status: 'PASS',
      score: 20,
      maxScore: 20,
      observedValue: `${storage.totalItems} aset · ${quotaRatio !== null ? `${quotaRatio.toFixed(2)}%` : formatBytes(storage.estimatedUsageBytes)}`,
      thresholdLabel: '< 75% Kuota · Auto-Draft Ready',
      details: `Listener auto-draft (visibilitychange/pagehide) aktif dengan ${telemetry.autoDraftKeyCount} kunci sesi/draft dan ${storage.totalItems} aset di ${storage.caches.length} bucket cache (${formatBytes(storage.estimatedUsageBytes)}).`,
    });
  } else {
    const missingReasons: string[] = [];
    if (!telemetry.autoDraftListenersReady) missingReasons.push('listener pagehide/visibilitychange tidak lengkap');
    if (!hasCacheData) missingReasons.push('Cache Storage masih 0 berkas');
    if (quotaWarn && quotaRatio !== null) missingReasons.push(`pemakaian kuota ${quotaRatio.toFixed(1)}% mendekati batas`);

    metrics.push({
      id: 'OPT-STOR-01',
      title: 'Auto-Draft Listeners, Cache & Kuota Storage',
      category: 'storage',
      status: 'WARN',
      score: 13,
      maxScore: 20,
      observedValue: `${storage.totalItems} aset · ${telemetry.autoDraftKeyCount} draft key`,
      thresholdLabel: '< 75% Kuota · Cache > 0',
      details: `Status parsial: ${missingReasons.join('; ')} (penggunaan storage: ${formatBytes(storage.estimatedUsageBytes)}).`,
      recommendation: !hasCacheData
        ? 'Muat halaman saat online agar Service Worker mem-precache App Shell ke Cache Storage.'
        : 'Pantau kapasitas penyimpanan berkala dan lakukan ekspor cadangan .md.',
    });
  }

  const rawScore = metrics.reduce((sum, item) => sum + item.score, 0);
  const overallScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  const grade: 'A' | 'B' | 'C' | 'D' =
    overallScore >= 90 ? 'A' : overallScore >= 75 ? 'B' : overallScore >= 60 ? 'C' : 'D';

  const readinessLabel =
    overallScore >= 90
      ? 'Siap Produksi Tablet'
      : overallScore >= 75
      ? 'Layak Operasi dengan Catatan'
      : overallScore >= 60
      ? 'Perlu Optimasi Pra-Lapangan'
      : 'Perlu Remediasi Kritis';

  return {
    timestamp: new Date().toISOString(),
    overallScore,
    grade,
    readinessLabel,
    metrics,
    snapshot,
  };
}

export function buildPerformanceSummaryLine(report: PerformanceAuditReport): string {
  const { overallScore, grade, snapshot } = report;
  const fcpText = snapshot.telemetry.fcpMs !== null ? `${Math.round(snapshot.telemetry.fcpMs)}ms` : 'N/A';
  const heapText = snapshot.telemetry.heapUsedMB !== null ? `${Math.round(snapshot.telemetry.heapUsedMB)}MB` : 'N/A';
  const touchText =
    snapshot.telemetry.touchCompliancePercent !== null
      ? `${snapshot.telemetry.touchCompliancePercent.toFixed(0)}%`
      : 'N/A';

  return [
    `ZLCE PWA Audit: ${overallScore}/100 (Grade ${grade})`,
    `Net: ${snapshot.online ? 'Online' : 'Offline'} (${snapshot.connectionType})`,
    `SW: ${snapshot.sw.activeState}/${snapshot.sw.waitingState}/${snapshot.sw.installingState} ctrl=${snapshot.sw.controllerActive ? 'yes' : 'no'}`,
    `Cache: ${formatBytes(snapshot.storage.estimatedUsageBytes)} (${snapshot.storage.totalItems} items)`,
    `FCP: ${fcpText}`,
    `Touch>=44px: ${touchText}`,
    `Heap: ${heapText}`,
  ].join(' | ');
}

export function buildPerformanceReportMarkdown(report: PerformanceAuditReport): string {
  const { overallScore, grade, readinessLabel, metrics, snapshot } = report;
  const { sw, storage, telemetry } = snapshot;

  const usageRatioStr =
    storage.usageRatioPercent !== null ? `${storage.usageRatioPercent.toFixed(2)}%` : 'N/A';

  return `# LAPORAN DIAGNOSTIK & AUDIT PERFORMA PWA ZLCE STUDIO

* **Timestamp UTC:** ${report.timestamp}
* **Profil Perangkat Acuan:** Samsung Galaxy Tab A7 Lite SM-T225 (3GB RAM / 8.7" WXGA+)
* **Skor Optimasi:** ${overallScore} / 100 (Grade ${grade} - ${readinessLabel})

---

## 1. METRIK DIAGNOSTIK RUNTIME PWA

* **Status Koneksi:** ${snapshot.online ? 'Online' : 'Offline'} (Tipe: ${snapshot.connectionType}, RTT: ${
    snapshot.rttMs !== null ? `${snapshot.rttMs} ms` : 'N/A'
  })
* **Service Worker Terdaftar:** ${sw.registered ? 'Ya' : 'Tidak'} (Scope: ${sw.scope || '-'})
* **Controller Aktif:** ${sw.controllerActive ? 'Ya' : 'Tidak'}
* **Siklus Hidup SW (Active / Waiting / Installing):** \`${sw.activeState}\` / \`${sw.waitingState}\` / \`${sw.installingState}\`
* **Pembaruan Menunggu (Update Handler):** ${sw.updateAvailable ? 'Tersedia (Siap Diterapkan)' : 'Mutakhir'}
* **Bucket Cache Storage:** ${storage.caches.length} bucket (${storage.totalItems} berkas tersimpan)
* **Estimasi Ukuran Cache / Usage:** ${formatBytes(storage.estimatedUsageBytes)}${
    storage.cacheUsageBytes !== null ? ` (Cache API khusus: ${formatBytes(storage.cacheUsageBytes)})` : ''
  }
* **Kuota Penyimpanan StorageManager:** ${formatQuotaCapacity(storage.quotaBytes)} (Rasio Terpakai: ${usageRatioStr})
* **First Contentful Paint (FCP):** ${telemetry.fcpMs !== null ? `${Math.round(telemetry.fcpMs)} ms` : 'N/A'}
* **Kepatuhan Target Sentuh 44px+:** ${
    telemetry.touchCompliancePercent !== null
      ? `${telemetry.touchCompliancePercent.toFixed(1)}% (${telemetry.touchControlsCompliant}/${telemetry.touchControlsTotal})`
      : 'N/A'
  }
* **Estimasi Heap JS:** ${telemetry.heapUsedMB !== null ? `${Math.round(telemetry.heapUsedMB)} MB / batas ${telemetry.heapBudgetLimitMB} MB` : 'N/A'}
* **Auto-Draft Listeners:** ${telemetry.autoDraftListenersReady ? 'Aktif' : 'Perlu Pemeriksaan'} (${telemetry.autoDraftKeyCount} kunci tersimpan)
* **Dimensi Viewport Aktif:** ${telemetry.viewportDimensions} px

---

## 2. RINCIAN SCORECARD OPTIMASI (0-100)

| ID | Indikator Audit | Status | Nilai Terukur | Ambang Batas | Skor | Catatan & Rekomendasi |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
${metrics
  .map(
    (m) =>
      `| \`${m.id}\` | ${m.title} | ${m.status} | ${m.observedValue} | ${m.thresholdLabel} | ${m.score}/${m.maxScore} | ${m.details}${
        m.recommendation ? ` Rekomendasi: ${m.recommendation}` : ''
      } |`
  )
  .join('\n')}

---

## 3. KESIMPULAN

${
  overallScore >= 80
    ? 'ZLCE Mobile Workbench memenuhi kesiapan operasi offline, target sentuh >=44px, dan efisiensi memori tablet RAM 3GB.'
    : 'Diperlukan tindak lanjut pada metrik bertanda WARN atau FAIL di atas sebelum pengoperasian lapangan berjangka panjang.'
}
`;
}
