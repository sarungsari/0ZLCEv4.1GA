import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, XCircle, Copy, Check, ArrowRight, X } from 'lucide-react';
import { parseTerminalOutput, ParsedTerminalResult } from '../../utils/terminalParser';
import { copyToClipboard } from '../../utils/clipboard';

import { useKeyboardAwareFocus } from '../../hooks/useKeyboardAwareFocus';
import { DraftTextarea } from './DraftTextarea';
import { ModalShell } from './ModalShell';

interface PasteBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTaskId?: string;
  onApplyVerification?: (verificationSnippet: string) => void;
}

export const PasteBackModal: React.FC<PasteBackModalProps> = ({
  isOpen,
  onClose,
  activeTaskId,
  onApplyVerification,
}) => {
  const [inputText, setInputText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedTerminalResult | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // UX-01: Auto-scroll focused textarea when virtual keyboard resizes viewport
  useKeyboardAwareFocus();

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setParsedResult(null);
      return;
    }
    const result = parseTerminalOutput(text);
    setParsedResult(result);
    setAppliedSuccess(false);
  };

  const handleCopySnippet = async () => {
    if (!parsedResult) return;
    const ok = await copyToClipboard(parsedResult.verificationEvidence);
    if (ok) {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  const handleApply = () => {
    if (!parsedResult || !onApplyVerification) return;
    onApplyVerification(parsedResult.verificationEvidence);
    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title="Paste-Back Hasil Terminal Termux"
      description="Tempelkan keluaran terminal (zlce check, git status) untuk validasi instan"
      icon={<Terminal className="w-5 h-5" />}
      headerGradient="bg-slate-800/80"
    >
      {/* Body */}
      <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Active Task Banner */}
          {activeTaskId && (
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Task Aktif Saat Ini:</span>
              <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {activeTaskId}
              </span>
            </div>
          )}

          {/* Textarea Input with Universal Auto-Draft Cache (TASK-099) */}
          <div>
            <DraftTextarea
              id="terminal-stdout-input"
              label="Teks Keluaran Terminal (Stdout / Stderr):"
              storageKey="zlce_pasteback_terminal_draft"
              taskId={activeTaskId}
              rows={5}
              value={inputText}
              onChange={handleParse}
              placeholder="Tempelkan hasil keluaran Termux di sini (misal: RESULT: OK (0 error, 0 warn) atau git status)..."
              className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-y"
            />
          </div>

          {/* Parsed Result Display */}
          {parsedResult && (
            <div className="space-y-3">
              {/* Status Header Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  parsedResult.success
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}
              >
                {parsedResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span>{parsedResult.summary}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded uppercase tracking-wider bg-black/40 border border-white/10">
                      {parsedResult.commandType}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-4 font-mono">
                    <span>Error: <b className={parsedResult.errorCount > 0 ? 'text-rose-400' : 'text-slate-400'}>{parsedResult.errorCount}</b></span>
                    <span>Peringatan: <b className={parsedResult.warningCount > 0 ? 'text-amber-400' : 'text-slate-400'}>{parsedResult.warningCount}</b></span>
                    {parsedResult.taskCount !== undefined && (
                      <span>Task: <b className="text-cyan-400">{parsedResult.taskCount}</b></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Error List */}
              {parsedResult.errors.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 space-y-1.5">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Daftar Kesalahan Ditemukan ({parsedResult.errors.length}):
                  </h4>
                  <ul className="space-y-1 text-xs text-rose-200 font-mono pl-5 list-disc">
                    {parsedResult.errors.map((err, idx) => (
                      <li key={idx} className="break-words">{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning List */}
              {parsedResult.warnings.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3.5 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Peringatan ({parsedResult.warnings.length}):
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-200 font-mono pl-5 list-disc">
                    {parsedResult.warnings.map((warn, idx) => (
                      <li key={idx} className="break-words">{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verification Evidence String */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-slate-400">
                    Kutipan Bukti Verifikasi Terformat:
                  </span>
                  <button
                    onClick={handleCopySnippet}
                    className="touch-target-44 min-h-[44px] px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 text-[11px]">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px]">Salin Bukti</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs font-mono text-cyan-300 bg-slate-900/90 p-2.5 rounded border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                  {parsedResult.verificationEvidence}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => handleParse('')}
            disabled={!inputText}
            className="touch-target-44 min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            Bersihkan Input
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="touch-target-44 min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Tutup
            </button>

            {onApplyVerification && parsedResult && parsedResult.success && (
              <button
                onClick={handleApply}
                disabled={appliedSuccess}
                className="touch-target-44 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-all active:scale-[0.98]"
              >
                {appliedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Diterapkan ke Task!</span>
                  </>
                ) : (
                  <>
                    <span>Terapkan ke Verifikasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
    </ModalShell>
  );
};
