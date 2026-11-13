import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  Wifi,
  WifiOff,
  Database,
  Layers,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  HardDrive,
  Gauge,
} from 'lucide-react';
import { downloadMarkdownBlob, normalizeToUnixLineEndings } from '../../utils/fileExport';
import { applyServiceWorkerUpdate, checkForServiceWorkerUpdates } from '../../sw-register';
import { OneTapCopyButton } from './OneTapCopyButton';
import { showToast } from './ToastContainer';
import {
  CacheBucketDetail,
  PwaDiagnosticsSnapshot,
  PerformanceAuditReport,
  SwLifecycleState,
  evaluatePerformanceAudit,
  buildPerformanceSummaryLine,
  buildPerformanceReportMarkdown,
  formatBytes,
  formatQuotaCapacity,
  formatSwStateLabel,
} from '../../utils/performanceAuditEngine';

interface NetworkInfoLike {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

interface PerformanceMemoryLike {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface StorageEstimateWithDetails extends StorageEstimate {
  usageDetails?: {
    caches?: number;
    indexedDB?: number;
    serviceWorkerRegistrations?: number;
  };
}

function measureVisibleTouchTargets(): {
  total: number;
  compliant: number;
  compliancePercent: number | null;
  violationsSample: string[];
} {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return { total: 0, compliant: 0, compliancePercent: null, violationsSample: [] };
  }

  const controls = Array.from(document.querySelectorAll<HTMLElement>('button, a[href], select'));
  let total = 0;
  let compliant = 0;
  const violationsSample: string[] = [];

  for (const el of controls) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (el.getClientRects().length === 0) continue;

    total++;
    if (rect.width >= 43.5 && rect.height >= 43.5) {
      compliant++;
    } else if (violationsSample.length < 3) {
      const label = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || el.tagName)
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 28);
      violationsSample.push(`${label} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
    }
  }

  return {
    total,
    compliant,
    compliancePercent: total > 0 ? (compliant / total) * 100 : null,
    violationsSample,
  };
}

function readPaintAndNavigationTiming(): { fcpMs: number | null; domInteractiveMs: number | null } {
  if (typeof performance === 'undefined') {
    return { fcpMs: null, domInteractiveMs: null };
  }

  let fcpMs: number | null = null;
  let domInteractiveMs: number | null = null;

  try {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
    if (fcpEntry && Number.isFinite(fcpEntry.startTime)) {
      fcpMs = fcpEntry.startTime;
    }

    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0 && Number.isFinite(navEntries[0].domInteractive)) {
      domInteractiveMs = navEntries[0].domInteractive;
    }
  } catch {
    // Abaikan jika Performance API dibatasi
  }

  return { fcpMs, domInteractiveMs };
}

function readLocalAutoDraftStats(): { autoDraftKeyCount: number; autoDraftListenersReady: boolean } {
  let autoDraftKeyCount = 0;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.startsWith('zlce_') || key.includes('draft'))) {
          autoDraftKeyCount++;
        }
      }
    }
  } catch {
    // Abaikan jika localStorage tidak dapat diakses
  }

  const autoDraftListenersReady =
    typeof document !== 'undefined' &&
    typeof window !== 'undefined' &&
    'visibilityState' in document &&
    typeof document.addEventListener === 'function' &&
    typeof window.addEventListener === 'function';

  return { autoDraftKeyCount, autoDraftListenersReady };
}

function normalizeSwState(rawState: string | undefined): SwLifecycleState {
  if (!rawState) return 'none';
  const allowed: SwLifecycleState[] = ['activated', 'activating', 'installed', 'installing', 'redundant', 'parsed'];
  return allowed.includes(rawState as SwLifecycleState) ? (rawState as SwLifecycleState) : 'none';
}

function createInitialSnapshot(): PwaDiagnosticsSnapshot {
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const width = typeof window !== 'undefined' ? window.innerWidth : 1340;
  const height = typeof window !== 'undefined' ? window.innerHeight : 800;

  return {
    capturedAt: new Date().toISOString(),
    online,
    connectionType: 'unknown',
    downlinkMbps: null,
    rttMs: null,
    sw: {
      supported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      registered: false,
      scope: null,
      controllerActive: false,
      activeState: 'none',
      waitingState: 'none',
      installingState: 'none',
      updateAvailable: false,
      stateSummary: 'checking',
    },
    storage: {
      cacheSupported: typeof window !== 'undefined' && 'caches' in window,
      storageApiSupported: typeof navigator !== 'undefined' && Boolean(navigator.storage?.estimate),
      caches: [],
      totalItems: 0,
      estimatedUsageBytes: 0,
      cacheUsageBytes: null,
      quotaBytes: 0,
      usageRatioPercent: null,
    },
    telemetry: {
      fcpMs: null,
      domInteractiveMs: null,
      heapUsedMB: null,
      heapTotalMB: null,
      heapBudgetLimitMB: 150,
      touchControlsTotal: 0,
      touchControlsCompliant: 0,
      touchCompliancePercent: null,
      touchViolationsSample: [],
      viewportDimensions: `${width}x${height}`,
      hasVisualViewportVar: false,
      autoDraftKeyCount: 0,
      autoDraftListenersReady: true,
    },
  };
}

export const PerformanceAuditTab: React.FC = () => {
  const [snapshot, setSnapshot] = useState<PwaDiagnosticsSnapshot>(() => createInitialSnapshot());
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [auditRunning, setAuditRunning] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<PerformanceAuditReport | null>(null);
  const swUpdatePendingRef = useRef<boolean>(false);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const collectPwaDiagnosticsSnapshot = useCallback(async (): Promise<PwaDiagnosticsSnapshot> => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    const online = nav ? nav.onLine : true;

    let connectionType = 'unknown';
    let downlinkMbps: number | null = null;
    let rttMs: number | null = null;
    const conn = (nav as unknown as { connection?: NetworkInfoLike } | undefined)?.connection;
    if (conn) {
      connectionType = conn.effectiveType || 'unknown';
      downlinkMbps = typeof conn.downlink === 'number' ? conn.downlink : null;
      rttMs = typeof conn.rtt === 'number' ? conn.rtt : null;
    }

    // 1. Service Worker Status (active / waiting / installing / controller / update handler)
    const swSupported = Boolean(nav && 'serviceWorker' in nav);
    let swRegistered = false;
    let swScope: string | null = null;
    let controllerActive = false;
    let activeState: SwLifecycleState = swSupported ? 'none' : 'unsupported';
    let waitingState: SwLifecycleState = swSupported ? 'none' : 'unsupported';
    let installingState: SwLifecycleState = swSupported ? 'none' : 'unsupported';
    let updateAvailable = swUpdatePendingRef.current;
    let stateSummary = swSupported ? 'not_registered' : 'unsupported';

    if (swSupported && nav) {
      try {
        controllerActive = Boolean(nav.serviceWorker.controller);
        const registration = await nav.serviceWorker.getRegistration();
        swRegistrationRef.current = registration || null;
        if (registration) {
          swRegistered = true;
          swScope = registration.scope;
          activeState = normalizeSwState(registration.active?.state);
          waitingState = normalizeSwState(registration.waiting?.state);
          installingState = normalizeSwState(registration.installing?.state);
          if (registration.waiting) {
            updateAvailable = true;
            swUpdatePendingRef.current = true;
          }
          const primary = registration.active || registration.waiting || registration.installing;
          stateSummary = primary ? primary.state : 'idle';
        } else {
          stateSummary = 'not_registered';
        }
      } catch {
        stateSummary = 'error';
      }
    }

    // 2. Cache Storage & StorageManager Quota Estimation
    const cacheSupported = typeof window !== 'undefined' && 'caches' in window;
    const storageApiSupported = Boolean(nav?.storage && typeof nav.storage.estimate === 'function');
    const cachesList: CacheBucketDetail[] = [];
    let totalItems = 0;

    if (cacheSupported) {
      try {
        const cacheKeys = await window.caches.keys();
        for (const key of cacheKeys) {
          try {
            const cache = await window.caches.open(key);
            const requests = await cache.keys();
            let bucketBytesSum = 0;
            let hasHeaderBytes = false;
            const sampleRequests = requests.slice(0, 25);
            for (const req of sampleRequests) {
              try {
                const res = await cache.match(req);
                const lenHeader = res?.headers.get('content-length');
                if (lenHeader) {
                  const parsedLen = Number.parseInt(lenHeader, 10);
                  if (Number.isFinite(parsedLen) && parsedLen > 0) {
                    bucketBytesSum += parsedLen;
                    hasHeaderBytes = true;
                  }
                }
              } catch {
                // Abaikan item yang gagal dibaca ukurannya
              }
            }
            cachesList.push({
              name: key,
              itemCount: requests.length,
              estimatedBucketBytes: hasHeaderBytes ? bucketBytesSum : null,
            });
            totalItems += requests.length;
          } catch {
            cachesList.push({ name: key, itemCount: 0, estimatedBucketBytes: null });
          }
        }
      } catch {
        // Fallback aman jika Cache API gagal diakses
      }
    }

    let estimatedUsageBytes = 0;
    let cacheUsageBytes: number | null = null;
    let quotaBytes = 0;
    if (storageApiSupported && nav?.storage?.estimate) {
      try {
        const estimate = (await nav.storage.estimate()) as StorageEstimateWithDetails;
        estimatedUsageBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || 0;
        if (typeof estimate.usageDetails?.caches === 'number') {
          cacheUsageBytes = estimate.usageDetails.caches;
        }
      } catch {
        // StorageManager API tidak tersedia
      }
    }
    const usageRatioPercent = quotaBytes > 0 ? (estimatedUsageBytes / quotaBytes) * 100 : null;

    // 3. Performance, Touch Target 44px+, Heap RAM & Auto-Draft Telemetry
    const { fcpMs, domInteractiveMs } = readPaintAndNavigationTiming();
    const touchScan = measureVisibleTouchTargets();
    const { autoDraftKeyCount, autoDraftListenersReady } = readLocalAutoDraftStats();

    let heapUsedMB: number | null = null;
    let heapTotalMB: number | null = null;
    const perfMem =
      typeof performance !== 'undefined'
        ? (performance as unknown as { memory?: PerformanceMemoryLike }).memory
        : undefined;
    if (perfMem && Number.isFinite(perfMem.usedJSHeapSize)) {
      heapUsedMB = perfMem.usedJSHeapSize / (1024 * 1024);
      heapTotalMB = perfMem.totalJSHeapSize / (1024 * 1024);
    }

    const width = typeof window !== 'undefined' ? window.innerWidth : 1340;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    const vhVar =
      typeof window !== 'undefined'
        ? getComputedStyle(document.documentElement).getPropertyValue('--viewport-height').trim()
        : '';
    const hasVisualViewportVar = vhVar.length > 0 || (typeof window !== 'undefined' && Boolean(window.visualViewport));

    return {
      capturedAt: new Date().toISOString(),
      online,
      connectionType,
      downlinkMbps,
      rttMs,
      sw: {
        supported: swSupported,
        registered: swRegistered,
        scope: swScope,
        controllerActive,
        activeState,
        waitingState,
        installingState,
        updateAvailable,
        stateSummary,
      },
      storage: {
        cacheSupported,
        storageApiSupported,
        caches: cachesList,
        totalItems,
        estimatedUsageBytes,
        cacheUsageBytes,
        quotaBytes,
        usageRatioPercent,
      },
      telemetry: {
        fcpMs,
        domInteractiveMs,
        heapUsedMB,
        heapTotalMB,
        heapBudgetLimitMB: 150,
        touchControlsTotal: touchScan.total,
        touchControlsCompliant: touchScan.compliant,
        touchCompliancePercent: touchScan.compliancePercent,
        touchViolationsSample: touchScan.violationsSample,
        viewportDimensions: `${width}x${height}`,
        hasVisualViewportVar,
        autoDraftKeyCount,
        autoDraftListenersReady,
      },
    };
  }, []);

  const refreshDiagnostics = useCallback(async (): Promise<PwaDiagnosticsSnapshot> => {
    setIsLoadingMetrics(true);
    try {
      const freshSnapshot = await collectPwaDiagnosticsSnapshot();
      setSnapshot(freshSnapshot);
      return freshSnapshot;
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [collectPwaDiagnosticsSnapshot]);

  useEffect(() => {
    void refreshDiagnostics();

    const handleNetworkChange = () => {
      void refreshDiagnostics();
    };
    const handleSwUpdateAvailable = () => {
      swUpdatePendingRef.current = true;
      void refreshDiagnostics();
    };
    const handleControllerChange = () => {
      swUpdatePendingRef.current = false;
      void refreshDiagnostics();
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('zlce-sw-update-available', handleSwUpdateAvailable);

    const conn = (navigator as unknown as { connection?: NetworkInfoLike }).connection;
    conn?.addEventListener?.('change', handleNetworkChange);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('zlce-sw-update-available', handleSwUpdateAvailable);
      conn?.removeEventListener?.('change', handleNetworkChange);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, [refreshDiagnostics]);

  const handleRefreshClick = () => {
    void refreshDiagnostics();
  };

  const handleCheckSwUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      await checkForServiceWorkerUpdates();
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          if (reg.waiting) {
            swUpdatePendingRef.current = true;
          }
        }
      }
      const updated = await refreshDiagnostics();
      if (updated.sw.updateAvailable || updated.sw.waitingState !== 'none') {
        showToast('Pembaruan Service Worker ditemukan dan siap diterapkan.', 'info', 3500);
      } else if (updated.sw.registered) {
        showToast('Service Worker sudah menggunakan versi terbaru.', 'success', 3000);
      } else {
        showToast('Service Worker belum terdaftar di sesi browser ini.', 'warning', 3500);
      }
    } catch {
      showToast('Pemeriksaan update SW selesai dengan mode offline atau sandbox.', 'info', 3000);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleApplySwUpdate = () => {
    applyServiceWorkerUpdate(swRegistrationRef.current);
    showToast('Menerapkan versi Service Worker terbaru...', 'success', 2000);
    window.setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  const handleRunOptimizationAudit = async () => {
    setAuditRunning(true);
    try {
      const freshSnapshot = await refreshDiagnostics();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const report = evaluatePerformanceAudit(freshSnapshot);
      setAuditReport(report);
    } finally {
      setAuditRunning(false);
    }
  };

  const handleExportReportMarkdown = () => {
    if (!auditReport) return;
    const markdownContent = buildPerformanceReportMarkdown(auditReport);
    downloadMarkdownBlob(normalizeToUnixLineEndings(markdownContent), {
      filename: `zlce-pwa-performance-audit-${new Date().toISOString().slice(0, 10)}.md`,
    });
    showToast('Laporan audit performa PWA berhasil diunduh (.md).', 'success', 3000);
  };

  const { sw, storage, telemetry } = snapshot;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Utama: Single-Elevation Flat Dark Slate */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight text-balance">
              Performance Audit &amp; PWA Diagnostics
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Target Tablet SM-T225 (8.7&quot; · RAM 3GB)</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Viewport {telemetry.viewportDimensions} px
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                FCP {telemetry.fcpMs !== null ? `${Math.round(telemetry.fcpMs)} ms` : 'Menunggu'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="touch-target-44 min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition active:scale-95 whitespace-nowrap shrink-0 disabled:opacity-50"
            onClick={handleRefreshClick}
            disabled={isLoadingMetrics}
            title="Segarkan seluruh metrik diagnostik PWA"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
            <span>{isLoadingMetrics ? 'Menyegarkan...' : 'Segarkan'}</span>
          </button>

          <button
            type="button"
            className="touch-target-44 min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition active:scale-95 whitespace-nowrap shrink-0 disabled:opacity-60"
            onClick={handleRunOptimizationAudit}
            disabled={auditRunning}
          >
            {auditRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Check Optimization</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 3 Kartu Diagnostik Real-Time PWA */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Metrik Diagnostik PWA Real-Time">
        {/* 1. Offline & Network Status */}
        <article
          aria-label="Kartu Diagnostik Status Jaringan"
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Status Jaringan</span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                  snapshot.online ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {snapshot.online ? <Wifi className="w-4 h-4 shrink-0" /> : <WifiOff className="w-4 h-4 shrink-0" />}
                <span>{snapshot.online ? 'Online' : 'Offline'}</span>
              </span>
            </div>

            <div className="pt-3">
              <div className="text-2xl font-bold text-white tracking-tight">
                {snapshot.online ? 'Terhubung' : 'Mode Luring'}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {snapshot.online
                  ? 'Sinkronisasi dan pembaruan aset Cache Storage siap dilakukan.'
                  : 'PWA berjalan mandiri dari Service Worker dan penyimpanan lokal.'}
              </p>
            </div>
          </div>

          <dl className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt className="text-slate-500">Tipe</dt>
              <dd className="font-mono tabular-nums font-semibold text-slate-200 uppercase">
                {snapshot.connectionType}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Downlink</dt>
              <dd className="font-mono tabular-nums font-semibold text-slate-200">
                {snapshot.downlinkMbps !== null ? `${snapshot.downlinkMbps} Mb` : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">RTT</dt>
              <dd className="font-mono tabular-nums font-semibold text-slate-200">
                {snapshot.rttMs !== null ? `${snapshot.rttMs} ms` : 'N/A'}
              </dd>
            </div>
          </dl>
        </article>

        {/* 2. Cache Storage & StorageManager Estimation */}
        <article
          aria-label="Kartu Diagnostik Cache Storage"
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Cache Storage</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 font-mono tabular-nums">
                <Database className="w-4 h-4 shrink-0" />
                <span>{storage.caches.length} Bucket</span>
              </span>
            </div>

            <div className="pt-3">
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                {formatBytes(storage.estimatedUsageBytes)}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed font-mono tabular-nums">
                {storage.totalItems} permintaan tersimpan
                {storage.cacheUsageBytes !== null ? ` · Cache API ${formatBytes(storage.cacheUsageBytes)}` : ''}
              </p>
            </div>
          </div>

          <dl className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-slate-500">Rasio Kuota</dt>
              <dd className="font-mono tabular-nums font-semibold text-slate-200">
                {storage.usageRatioPercent !== null ? `${storage.usageRatioPercent.toFixed(2)}%` : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Kapasitas Maks</dt>
              <dd className="font-mono tabular-nums font-semibold text-slate-200">
                {formatQuotaCapacity(storage.quotaBytes)}
              </dd>
            </div>
          </dl>
        </article>

        {/* 3. Service Worker Lifecycle & Update Handler */}
        <article
          aria-label="Kartu Diagnostik Service Worker"
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Service Worker</span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                  sw.registered ? 'text-cyan-300' : 'text-amber-400'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>{sw.registered ? formatSwStateLabel(sw.activeState !== 'none' ? sw.activeState : 'installed') : formatSwStateLabel(sw.activeState)}</span>
              </span>
            </div>

            <div className="pt-3">
              <div className="text-2xl font-bold text-white">
                {sw.registered ? 'Terdaftar' : 'Belum Aktif'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {sw.controllerActive ? 'Controller aktif mengawal permintaan offline' : 'Menunggu klaim controller halaman'}
              </p>
            </div>

            <dl className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-slate-500">Active</dt>
                <dd className="font-mono tabular-nums font-semibold text-slate-200">{sw.activeState}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Waiting</dt>
                <dd className={`font-mono tabular-nums font-semibold ${sw.waitingState !== 'none' ? 'text-amber-300' : 'text-slate-200'}`}>
                  {sw.waitingState}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Installing</dt>
                <dd className="font-mono tabular-nums font-semibold text-slate-200">{sw.installingState}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Controller:{' '}
              <strong className={sw.controllerActive ? 'text-emerald-400' : 'text-amber-400'}>
                {sw.controllerActive ? 'Ya' : 'Tidak'}
              </strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="touch-target-44 min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap shrink-0 disabled:opacity-50"
                onClick={handleCheckSwUpdate}
                disabled={isCheckingUpdate}
                title="Periksa apakah pembaruan Service Worker tersedia"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>Periksa Update</span>
              </button>

              {(sw.updateAvailable || sw.waitingState !== 'none') && (
                <button
                  type="button"
                  className="touch-target-44 min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap shrink-0"
                  onClick={handleApplySwUpdate}
                >
                  <span>Terapkan Update SW</span>
                </button>
              )}
            </div>
          </div>
        </article>
      </section>

      {/* Hasil Audit & Scorecard Kesiapan 0-100 */}
      {auditReport ? (
        <section
          aria-label="Scorecard Audit Optimasi PWA"
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Hasil Simulasi &amp; Telemetri Runtime</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {new Date(auditReport.timestamp).toLocaleTimeString('id-ID')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-200">{auditReport.readinessLabel}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Scorecard Kesiapan Produksi PWA
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="text-left sm:text-right">
                <div className="text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
                  {auditReport.overallScore} <span className="text-sm text-slate-400 font-normal">/ 100</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  Predikat: <strong className="text-emerald-400 font-bold">{auditReport.grade}</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-3 sm:border-l border-slate-800">
                <OneTapCopyButton
                  textToCopy={buildPerformanceSummaryLine(auditReport)}
                  label="Salin Ringkasan"
                  successLabel="Ringkasan Disalin!"
                  variant="secondary"
                  size="sm"
                  title="Salin ringkasan audit PWA ke clipboard"
                />
                <button
                  type="button"
                  className="touch-target-44 min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 inline-flex items-center gap-2 transition active:scale-95 whitespace-nowrap shrink-0"
                  onClick={handleExportReportMarkdown}
                  title="Unduh laporan lengkap dalam format Markdown (.md)"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Unduh .md</span>
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar Skor */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  auditReport.overallScore >= 85
                    ? 'bg-emerald-500'
                    : auditReport.overallScore >= 65
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${auditReport.overallScore}%` }}
              />
            </div>
          </div>

          {/* Rincian 5 Indikator Wajib */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditReport.metrics.map((m) => (
              <div
                key={m.id}
                className="border-t border-slate-800 pt-3.5 flex flex-col justify-between gap-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0">
                      {m.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                      {m.status === 'WARN' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                      {m.status === 'FAIL' && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-100">{m.title}</h3>
                        <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5 flex flex-wrap items-center gap-x-2">
                          <span
                            className={
                              m.status === 'PASS'
                                ? 'text-emerald-400 font-semibold'
                                : m.status === 'WARN'
                                ? 'text-amber-300 font-semibold'
                                : 'text-rose-400 font-semibold'
                            }
                          >
                            {m.status}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-200">{m.observedValue}</span>
                          <span aria-hidden="true">·</span>
                          <span>Target: {m.thresholdLabel}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono tabular-nums font-bold text-slate-300 shrink-0">
                      {m.score}/{m.maxScore}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 pl-6 leading-relaxed">{m.details}</p>
                </div>

                {m.recommendation && (
                  <p className="ml-6 text-xs text-amber-300 bg-amber-950/30 border border-amber-900/50 rounded-lg px-3 py-2">
                    <strong>Saran:</strong> {m.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 mx-auto">
            <Gauge className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-xl mx-auto">
            <h2 className="text-sm font-bold text-white">Belum Ada Hasil Audit Optimasi</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tekan tombol <strong className="text-slate-200">Check Optimization</strong> untuk mengevaluasi 5 indikator tablet SM-T225: siklus Service Worker, First Contentful Paint (FCP), kepatuhan target sentuh 44px+, heap RAM &lt; 150 MB, serta status auto-draft dan kuota storage.
            </p>
          </div>
        </section>
      )}

      {/* Rincian Bucket Cache Storage */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="text-sm font-bold text-white">Rincian Bucket Cache Storage</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            Total Entri: {storage.totalItems}
          </span>
        </div>

        {storage.caches.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-mono">
            Belum ada bucket Cache API tersimpan pada sesi ini. Pastikan Service Worker aktif saat online untuk mem-precache App Shell.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {storage.caches.map((bucket) => (
              <div
                key={bucket.name}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs font-mono"
              >
                <span className="text-slate-200 font-medium break-all">{bucket.name}</span>
                <span className="text-slate-400 tabular-nums shrink-0">
                  {bucket.itemCount} permintaan
                  {bucket.estimatedBucketBytes ? ` · ~${formatBytes(bucket.estimatedBucketBytes)}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
