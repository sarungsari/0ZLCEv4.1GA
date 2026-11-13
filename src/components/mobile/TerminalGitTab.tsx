import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  GitBranch, 
  ShieldAlert, 
  KeyRound
} from 'lucide-react';
import { ParsedSessionState, TabType } from '../../types/zlce';
import { CommandHubTab } from './CommandHubTab';
import { GitSyncTab } from './GitSyncTab';
import { RecoveryCommandSection } from './RecoveryCommandSection';
import { SecurityAuthTab } from './SecurityAuthTab';
import { PasteBackModal } from './PasteBackModal';

export type TerminalGitSubMode = 'zlce-commands' | 'git-workflow' | 'emergency-recovery' | 'clean-auth';

interface TerminalGitTabProps {
  stateData: ParsedSessionState;
  rawMarkdown: string;
  onNavigateTab?: (tab: TabType) => void;
  onUpdateMarkdown?: (newMd: string) => void;
  onUpdateVerification?: (evidence: string) => void;
  initialSubMode?: TerminalGitSubMode;
}

export const TerminalGitTab: React.FC<TerminalGitTabProps> = ({
  stateData,
  rawMarkdown,
  onNavigateTab,
  onUpdateMarkdown,
  onUpdateVerification,
  initialSubMode = 'zlce-commands'
}) => {
  const [subMode, setSubMode] = useState<TerminalGitSubMode>(initialSubMode);
  const [isPasteBackOpen, setIsPasteBackOpen] = useState<boolean>(false);

  useEffect(() => {
    setSubMode(initialSubMode);
  }, [initialSubMode]);

  const handleApplyVerification = (evidence: string) => {
    if (onUpdateVerification) {
      onUpdateVerification(evidence);
    } else if (onUpdateMarkdown && rawMarkdown) {
      const updated = rawMarkdown.replace(
        /(\*\*Perintah Verifikasi:\*\*)[^\n]*/i,
        `$1 \`${evidence}\``
      );
      onUpdateMarkdown(updated);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Segment Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400 shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Terminal &amp; Git Dispatcher
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Termux Bridge
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pusat perintah CLI ZLCE, alur kerja Git per task, pemulihan darurat Kasus A–D, dan Zero-Secret
              </p>
            </div>
          </div>

          {/* Sub-mode buttons with touch target >= 44px */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSubMode('zlce-commands')}
              className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'zlce-commands'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>1. Perintah ZLCE</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('git-workflow')}
              className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'git-workflow'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>2. Alur Kerja Git</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('emergency-recovery')}
              className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'emergency-recovery'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>3. Pemulihan Kasus A–D</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('clean-auth')}
              className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'clean-auth'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>4. Clean-Auth</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render selected sub-mode */}
      {subMode === 'zlce-commands' && (
        <CommandHubTab
          stateData={stateData}
          rawMarkdown={rawMarkdown}
          onNavigateTab={onNavigateTab ? (tab: string) => onNavigateTab(tab as TabType) : undefined}
          onUpdateVerification={handleApplyVerification}
          initialCategory="all"
        />
      )}

      {subMode === 'git-workflow' && (
        <GitSyncTab
          sessionState={stateData}
          rawMarkdown={rawMarkdown}
          onNavigateTab={onNavigateTab}
          onUpdateMarkdown={onUpdateMarkdown}
        />
      )}

      {subMode === 'emergency-recovery' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Protokol Pemulihan Darurat Mandiri Kasus A–D (Blueprint 09)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Jalankan perintah mitigasi langsung di Termux tablet jika terjadi pembunuhan memori Android (LMK), konflik merge Git, atau kerusakan sintaks Markdown.
            </p>
          </div>
          <RecoveryCommandSection
            activeTaskId={stateData.status.activeTask || 'TASK-030'}
          />
        </div>
      )}

      {subMode === 'clean-auth' && (
        <div className="space-y-4">
          <SecurityAuthTab />
        </div>
      )}

      {/* Paste Back Modal for Terminal Outputs */}
      <PasteBackModal
        isOpen={isPasteBackOpen}
        onClose={() => setIsPasteBackOpen(false)}
        activeTaskId={stateData.status.activeTask || 'TASK-029'}
        onApplyVerification={handleApplyVerification}
      />
    </div>
  );
};
