import React, { useEffect, useRef } from 'react';
import { useAutoDraftCache, AutoDraftMeta } from '../../hooks/useAutoDraftCache';
import { useKeyboardAwareFocus } from '../../hooks/useKeyboardAwareFocus';
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, Trash2 } from 'lucide-react';

export interface DraftTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  storageKey: string;
  memberId?: string;
  taskId?: string;
  debounceMs?: number;
  autoRestore?: boolean;
  showDraftIndicator?: boolean;
  onDraftSaved?: (content: string, meta: AutoDraftMeta) => void;
  label?: string;
  helperText?: string;
}

/**
 * Universal DraftTextarea Component (TASK-099 / UX-02 / AUD4-006 / DAT-001)
 * Membungkus elemen textarea dengan perlindungan auto-draft cache (debounce 400ms),
 * isolasi namespace multi-user, Zero-Secret Persistence Gate, serta scroll otomatis
 * saat virtual keyboard Android muncul.
 */
export const DraftTextarea: React.FC<DraftTextareaProps> = ({
  value = '',
  onChange,
  storageKey,
  memberId,
  taskId,
  debounceMs = 400,
  autoRestore = true,
  showDraftIndicator = true,
  onDraftSaved,
  label,
  helperText,
  className = '',
  rows = 4,
  placeholder,
  disabled,
  readOnly,
  id,
  ...restProps
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hook isolasi auto-draft dengan Zero-Secret Persistence Gate
  const {
    draftContent,
    setDraftContent,
    isSaving,
    isDraftSaved,
    lastSavedAt,
    hasStoredDraft,
    storedDraftMeta,
    hasDetectedSecrets,
    detectedSecrets,
    isBlockedDueToSecrets,
    redactAndSave,
    discardDraft
  } = useAutoDraftCache(value, {
    storageKey,
    memberId,
    debounceMs,
    autoRestore,
    docType: taskId ? `task-${taskId}` : 'input-draft',
    onAutoSave: (savedText, meta) => {
      onDraftSaved?.(savedText, meta);
    },
    onRestore: (restoredText) => {
      if (restoredText && onChange) {
        onChange(restoredText);
      }
    }
  });

  // UX-01: Auto-scroll saat virtual keyboard aktif
  useKeyboardAwareFocus(textareaRef);

  // Sinkronisasi value eksternal jika berubah dari parent dan bukan karena ketikan lokal
  useEffect(() => {
    if (value !== undefined && value !== draftContent && !hasStoredDraft) {
      setDraftContent(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setDraftContent(nextVal);
    onChange?.(nextVal);
  };

  const handleRedactClick = () => {
    const cleanText = redactAndSave();
    onChange?.(cleanText);
  };

  const handleDiscardClick = () => {
    discardDraft('');
    onChange?.('');
  };

  return (
    <div className="space-y-1.5 w-full">
      {/* Header Baris Label & Indikator */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-300">
            {label}
          </label>
        )}

        {showDraftIndicator && (
          <div className="flex items-center gap-2 text-xs font-mono ml-auto">
            {isBlockedDueToSecrets ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-600/80 animate-pulse">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>Penyimpanan Diblokir (Secret Terdeteksi)</span>
              </span>
            ) : isSaving ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 animate-pulse">
                <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                <span>Menyimpan (400ms)...</span>
              </span>
            ) : isDraftSaved && lastSavedAt ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>
                  Draft tersimpan {lastSavedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 bg-slate-800">
                <span>Draft aktif</span>
              </span>
            )}

            {hasStoredDraft && (
              <button
                type="button"
                onClick={handleDiscardClick}
                className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 p-2 transition"
                title="Buang draft lokal"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Banner Khusus Secret jika terblokir */}
      {isBlockedDueToSecrets && (
        <div className="p-2.5 bg-rose-950/90 border border-rose-600/80 rounded-xl flex items-center justify-between gap-2 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Terdeteksi secret ({detectedSecrets.join(', ')}). Persistensi diblokir.</span>
          </div>
          <button
            type="button"
            onClick={handleRedactClick}
            className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sensor &amp; Simpan</span>
          </button>
        </div>
      )}

      {/* Textarea Element */}
      <textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        value={draftContent}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono leading-relaxed ${className}`}
        {...restProps}
      />

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
};
