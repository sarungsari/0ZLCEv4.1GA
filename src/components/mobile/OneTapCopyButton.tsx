import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, AlertCircle, X, CheckCheck } from 'lucide-react';
import { copyText } from '../../utils/clipboard';
import { showToast } from './ToastContainer';

interface OneTapCopyButtonProps {
  textToCopy: string;
  label?: string;
  successLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCopied?: () => void;
  title?: string;
  feedbackDurationMs?: number;
}

export const OneTapCopyButton: React.FC<OneTapCopyButtonProps> = ({
  textToCopy,
  label = 'Salin Perintah',
  successLabel = 'Tersalin!',
  variant = 'secondary',
  size = 'md',
  className = '',
  onCopied,
  title = 'Salin ke clipboard',
  feedbackDurationMs = 2000,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showManualModal && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [showManualModal]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = await copyText(textToCopy);
      if (success) {
        setCopied(true);
        setHasError(false);
        showToast('Teks berhasil disalin ke papan klip!', 'success', 2500);
        onCopied?.();
        setTimeout(() => setCopied(false), feedbackDurationMs);
      } else {
        // Fallback: buka modal salin manual
        setHasError(true);
        setShowManualModal(true);
        showToast('Gagal menyalin otomatis. Silakan salin secara manual.', 'warning', 4000);
        setTimeout(() => setHasError(false), 3000);
      }
    } catch {
      setHasError(true);
      setShowManualModal(true);
      showToast('Gagal menyalin otomatis. Silakan salin secara manual.', 'warning', 4000);
      setTimeout(() => setHasError(false), 3000);
    }
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      showToast('Seluruh teks telah dipilih', 'info', 2000);
    }
  };

  // Base styling for 44px touch target (Samsung Galaxy Tab A7 Lite SM-T225)
  const baseClasses = 'touch-target-44 min-h-[44px] inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all active:scale-95 select-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-5 py-2.5 text-sm sm:text-base font-semibold'
  }[size];

  const variantClasses = {
    primary: copied
      ? 'bg-emerald-600 text-white shadow-md'
      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md hover:shadow-cyan-500/20',
    secondary: copied
      ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300'
      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80',
    outline: copied
      ? 'bg-emerald-950/40 border border-emerald-500 text-emerald-300'
      : 'bg-transparent hover:bg-slate-800/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400',
    subtle: copied
      ? 'bg-emerald-950/40 text-emerald-300'
      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300',
    cyan: copied
      ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
      : 'bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-700/60 shadow-sm',
    emerald: copied
      ? 'bg-emerald-600 text-white shadow-md'
      : 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/60 shadow-sm',
    amber: copied
      ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
      : 'bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-700/60 shadow-sm',
    rose: copied
      ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
      : 'bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-700/60 shadow-sm',
    ghost: copied
      ? 'bg-emerald-950/40 text-emerald-300'
      : 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200',
  }[variant];

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        title={title}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        aria-label={copied ? successLabel : label}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400 shrink-0 animate-in zoom-in-50 duration-200" />
            <span className="font-semibold">{successLabel}</span>
          </>
        ) : hasError ? (
          <>
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-amber-300 text-xs">Pilih Manual</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-200" />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Manual Selection Fallback Modal (TASK-105) */}
      {showManualModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-copy-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowManualModal(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 id="manual-copy-modal-title" className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Copy className="w-4 h-4 text-cyan-400" />
                Salin Teks Manual (Fallback)
              </h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="touch-target-44 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white"
                aria-label="Tutup jendela salin manual"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Peramban atau konteks iframe tidak mengizinkan akses papan klip otomatis. Tekan tombol <strong>Pilih Semua</strong> lalu salin (Ctrl+C atau tekan lama di layar sentuh).
            </p>

            <textarea
              ref={textareaRef}
              readOnly
              value={textToCopy}
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none select-all"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="touch-target-44 min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              >
                <CheckCheck className="w-4 h-4 text-cyan-400" />
                <span>Pilih Semua</span>
              </button>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="touch-target-44 min-h-[44px] px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow transition active:scale-95"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
