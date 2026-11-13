import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const TOAST_EVENT = 'zlce-toast';

/**
 * Helper global untuk memicu toast aksesibel dari komponen atau utilitas manapun
 */
export function showToast(message: string, type: ToastType = 'info', duration: number = 4000): void {
  if (typeof window === 'undefined') return;
  const detail: ToastItem = {
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    message,
    type,
    duration
  };
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail }));
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (!customEvent.detail) return;
      const newToast = customEvent.detail;
      
      setToasts((prev) => [...prev.slice(-3), newToast]); // Maks 4 toast bertumpuk

      const duration = newToast.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, duration);
      }
    };

    window.addEventListener(TOAST_EVENT, handleToastEvent);
    return () => window.removeEventListener(TOAST_EVENT, handleToastEvent);
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isWarn = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-2 duration-200 ${
              isError
                ? 'bg-rose-950/95 border-rose-500/50 text-rose-100 shadow-rose-950/50'
                : isWarn
                ? 'bg-amber-950/95 border-amber-500/50 text-amber-100 shadow-amber-950/50'
                : isSuccess
                ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50'
                : 'bg-slate-900/95 border-cyan-500/50 text-slate-100 shadow-cyan-950/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarn && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {!isError && !isWarn && !isSuccess && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-1.5 -mt-1.5 text-slate-400 hover:text-white rounded-lg transition active:scale-90"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
