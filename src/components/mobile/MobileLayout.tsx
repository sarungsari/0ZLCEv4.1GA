import React, { useEffect, useState, createContext, useContext } from 'react';
import { useOnlineStatus, usePWAInstall, useServiceWorkerUpdate } from '../../sw-register';
import { WifiOff, Download, ChevronUp, Tablet, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { ToastContainer } from './ToastContainer';

export interface ViewportContextType {
  viewportHeight: number;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  orientation: 'landscape' | 'portrait';
  isTabletOrMobile: boolean;
  screenWidth: number;
}

const ViewportContext = createContext<ViewportContextType>({
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
  keyboardHeight: 0,
  isKeyboardOpen: false,
  orientation: 'landscape',
  isTabletOrMobile: false,
  screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1340,
});

/**
 * Custom Hook: useVisualViewport
 * Mengukur tinggi viewport dinamis Android dan mendeteksi pembukaan Virtual Keyboard.
 * Mencegah panel aksi tertutup keyboard virtual pada Samsung Galaxy Tab A7 Lite (SM-T225).
 */
export function useVisualViewport(): ViewportContextType {
  const [viewportData, setViewportData] = useState<ViewportContextType>(() => {
    if (typeof window === 'undefined') {
      return {
        viewportHeight: 800,
        keyboardHeight: 0,
        isKeyboardOpen: false,
        orientation: 'landscape',
        isTabletOrMobile: false,
        screenWidth: 1340,
      };
    }
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      viewportHeight: height,
      keyboardHeight: 0,
      isKeyboardOpen: false,
      orientation: width >= height ? 'landscape' : 'portrait',
      isTabletOrMobile: width <= 1366,
      screenWidth: width,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;
    let lastAppliedHeight = -1;
    let lastAppliedKeyboard = -1;

    const updateViewport = () => {
      // Don't calculate or apply layout changes while the iframe is hidden (e.g. user in Chat tab)
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      const vv = window.visualViewport;
      const innerH = window.innerHeight;
      const innerW = window.innerWidth;

      // Ignore transient zero or collapsed measurements during panel transitions
      if (innerH < 200 || innerW < 200) {
        return;
      }

      const currentH = vv ? vv.height : innerH;
      if (currentH < 200) {
        return;
      }

      const diff = Math.max(0, innerH - currentH);
      const keyboardOpen = diff > 150; // Threshold Android soft keyboard
      const keyboardH = keyboardOpen ? diff : 0;

      // Only touch DOM styles if values actually changed to avoid layout thrashing
      if (Math.abs(lastAppliedHeight - currentH) >= 2) {
        lastAppliedHeight = currentH;
        document.documentElement.style.setProperty('--viewport-height', `${currentH}px`);
      }
      if (Math.abs(lastAppliedKeyboard - keyboardH) >= 2) {
        lastAppliedKeyboard = keyboardH;
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardH}px`);
      }

      setViewportData(prev => {
        const isLandscape = innerW >= innerH;
        const isTabletOrMobile = innerW <= 1366;
        if (
          Math.abs(prev.viewportHeight - currentH) < 2 &&
          prev.isKeyboardOpen === keyboardOpen &&
          Math.abs(prev.keyboardHeight - keyboardH) < 2 &&
          prev.screenWidth === innerW &&
          prev.orientation === (isLandscape ? 'landscape' : 'portrait') &&
          prev.isTabletOrMobile === isTabletOrMobile
        ) {
          return prev; // Skip duplicate render
        }
        return {
          viewportHeight: currentH,
          keyboardHeight: keyboardH,
          isKeyboardOpen: keyboardOpen,
          orientation: isLandscape ? 'landscape' : 'portrait',
          isTabletOrMobile,
          screenWidth: innerW,
        };
      });
    };

    const scheduleUpdate = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateViewport);
    };

    scheduleUpdate();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleUpdate);
    }
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);
    document.addEventListener('visibilitychange', scheduleUpdate);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', scheduleUpdate);
      }
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
      document.removeEventListener('visibilitychange', scheduleUpdate);
    };
  }, []);

  return viewportData;
}

export const useViewport = () => useContext(ViewportContext);

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

/**
 * Komponen Pembungkus MobileLayout
 * Mengatur tata letak yang dioptimalkan untuk tablet 8.7" (1340x800).
 * Menangani safe area, status bar offline, dan adaptasi keyboard virtual.
 */
export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const viewport = useVisualViewport();
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { hasUpdate, applyUpdate, dismissUpdate } = useServiceWorkerUpdate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [animatingQuota, setAnimatingQuota] = useState(true);
  const [animatingOffline, setAnimatingOffline] = useState(true);
  const [animatingUpdate, setAnimatingUpdate] = useState(true);

  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
      setAnimatingQuota(true);
    };
    window.addEventListener('zlce-storage-quota-exceeded', handleQuota);
    return () => window.removeEventListener('zlce-storage-quota-exceeded', handleQuota);
  }, []);

  // Hentikan animasi berlebih setelah 4 detik demi efisiensi daya & aksesibilitas (R-12)
  useEffect(() => {
    if (quotaExceeded) {
      const timer = setTimeout(() => setAnimatingQuota(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [quotaExceeded]);

  useEffect(() => {
    if (!isOnline) {
      setAnimatingOffline(true);
      const timer = setTimeout(() => setAnimatingOffline(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  useEffect(() => {
    if (hasUpdate) {
      setAnimatingUpdate(true);
      const timer = setTimeout(() => setAnimatingUpdate(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [hasUpdate]);

  useEffect(() => {
    let scrollRaf: number | null = null;
    const handleScroll = () => {
      if (scrollRaf !== null) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        const shouldShow = window.scrollY > 300;
        setShowScrollTop(prev => (prev !== shouldShow ? shouldShow : prev));
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ViewportContext.Provider value={viewport}>
      <div 
        className="w-full flex-1 flex flex-col relative"
        style={{
          minHeight: '100%',
          paddingBottom: viewport.isKeyboardOpen ? `${viewport.keyboardHeight}px` : '0px',
        }}
      >
        {/* Banner Stack Container: Menata rapi notifikasi update, offline, dan install PWA dengan offset dinamis --header-h (TASK-105 / TASK-117 / R-04) */}
        <div className="sticky z-40 flex flex-col w-full shadow-lg" style={{ top: 'var(--header-h, 116px)' }}>
          {/* Storage Quota Exceeded Emergency Banner (TASK-105 / R-12) */}
          {quotaExceeded && (
            <aside
              role="alert"
              aria-live="assertive"
              aria-label="Peringatan Kapasitas Penyimpanan Penuh"
              className="bg-rose-950/95 border-b border-rose-500/50 text-rose-100 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 backdrop-blur-sm shadow-xl"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 text-rose-400 shrink-0 ${animatingQuota ? 'animate-bounce' : ''}`} />
                <span>
                  <strong>Peringatan Kuota Penyimpanan!</strong> Kapasitas LocalStorage peramban penuh (QuotaExceededError). Unduh berkas <code>SESSION_STATE.md</code> agar kemajuan kerja tetap tersimpan.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const raw = localStorage.getItem('zlce_session_raw_markdown') || '';
                    const blob = new Blob([raw], { type: 'text/markdown;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `SESSION_STATE_EMERGENCY_${Date.now()}.md`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="touch-target-44 min-h-[44px] px-3.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow active:scale-95 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Cadangan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuotaExceeded(false)}
                  className="touch-target-44 min-h-[44px] px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                >
                  Tutup
                </button>
              </div>
            </aside>
          )}
          {/* SW Update Notification Banner (UX-03 / AUD4-007 / R-12) */}
          {hasUpdate && (
            <aside
              role="status"
              aria-live="polite"
              aria-label="Notifikasi Pembaruan Aplikasi"
              className="bg-emerald-950/95 border-b border-emerald-500/40 text-emerald-100 px-4 py-2.5 text-xs flex items-center justify-between backdrop-blur-sm shadow-xl"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${animatingUpdate ? 'animate-spin' : ''}`} />
                <span>
                  <strong>Versi baru ZLCEv4.1Mob tersedia!</strong> Sesi kerja saat ini tetap aman.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={dismissUpdate}
                  className="touch-target-44 min-h-[44px] px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                >
                  Nanti
                </button>
                <button
                  type="button"
                  onClick={applyUpdate}
                  className="touch-target-44 min-h-[44px] px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow active:scale-95 transition"
                >
                  <span>Muat Ulang</span>
                </button>
              </div>
            </aside>
          )}

          {/* Offline Banner jika terputus dari jaringan (R-12) */}
          {!isOnline && (
            <aside
              role="status"
              aria-live="polite"
              aria-label="Notifikasi Mode Offline"
              className="bg-amber-500/90 text-slate-950 font-medium px-4 py-2 text-xs flex items-center justify-between shadow-md backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <WifiOff className={`w-4 h-4 text-slate-950 ${animatingOffline ? 'animate-pulse' : ''}`} />
                <span>
                  <strong>Mode Offline Aktif</strong> • Cache PWA siap beroperasi penuh secara lokal (Cache-First Shell).
                </span>
              </div>
              <span className="text-xs uppercase tracking-wider font-mono bg-slate-950/20 px-2 py-0.5 rounded">
                Local Storage
              </span>
            </aside>
          )}

          {/* PWA Install Ribbon (Tampil jika browser mendukung sebelum instalasi) */}
          {isInstallable && !isInstalled && (
            <aside 
              role="region"
              aria-label="Pemasangan Aplikasi PWA"
              className="bg-indigo-950/95 border-b border-indigo-500/30 text-indigo-100 px-4 py-2 text-xs flex items-center justify-between backdrop-blur-sm shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4 text-indigo-400" />
                <span>Pasang ZLCEv4.1Mob di Layar Utama Tablet untuk pengalaman mandiri fullscreen.</span>
              </div>
              <button
                type="button"
                onClick={install}
                className="touch-target-44 min-h-[44px] px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow active:scale-95 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instal PWA</span>
              </button>
            </aside>
          )}
        </div>

        {/* Konten Halaman */}
        <div className="flex-1 w-full">{children}</div>

        {/* Floating Quick Action Buttons (Tablet Friendly) */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
            className="fixed bottom-6 right-6 z-40 touch-target-48 min-h-[48px] min-w-[48px] rounded-full bg-slate-800/90 hover:bg-slate-700 text-cyan-400 border border-slate-700 shadow-xl flex items-center justify-center backdrop-blur-sm active:scale-95 transition"
            title="Kembali ke atas"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}

        {/* Global Accessible Toast Container (TASK-102) */}
        <ToastContainer />
      </div>
    </ViewportContext.Provider>
  );
};
