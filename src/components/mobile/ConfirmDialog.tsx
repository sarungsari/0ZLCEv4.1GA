import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Info, Check, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  isDestructive = false,
  variant,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const effectiveVariant = variant || (isDestructive ? 'danger' : 'info');

  // Focus trap & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    
    // Auto-focus the action button
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      // Simple focus trap between dialog buttons
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col gap-4 modal-viewport-bounded"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              effectiveVariant === 'danger'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : effectiveVariant === 'warning'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : effectiveVariant === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {effectiveVariant === 'danger' || effectiveVariant === 'warning' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : effectiveVariant === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-white tracking-tight">
              {title}
            </h3>
            <div id="confirm-dialog-desc" className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {message}
            </div>
          </div>
        </div>

        {/* Action Buttons with 48px+ touch targets */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="touch-target-48 min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>{cancelLabel}</span>
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`touch-target-48 min-h-[48px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 ${
              effectiveVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                : effectiveVariant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/50'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
