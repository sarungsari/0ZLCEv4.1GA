import React, { useState, useEffect } from 'react';
import { Sparkles, ClipboardCheck, ArrowRightLeft, Cpu, MessageSquareCode } from 'lucide-react';
import { ParsedSessionState, TabType } from '../../types/zlce';
import { ContextPackTab } from './ContextPackTab';
import { ResultCaptureTab } from './ResultCaptureTab';
import { AiHandoverWizard } from './AiHandoverWizard';
import { FeedbackReviewTab } from './FeedbackReviewTab';

export type AiWorkbenchSubMode = 'context' | 'capture' | 'handover' | 'review';

interface AiWorkbenchTabProps {
  sessionState: ParsedSessionState;
  rawMarkdown: string;
  onUpdateMarkdown: (newMd: string) => void;
  onNavigateTab?: (tab: TabType) => void;
  initialSubMode?: AiWorkbenchSubMode;
}

export const AiWorkbenchTab: React.FC<AiWorkbenchTabProps> = ({
  sessionState,
  rawMarkdown,
  onUpdateMarkdown,
  onNavigateTab,
  initialSubMode = 'context'
}) => {
  const [subMode, setSubMode] = useState<AiWorkbenchSubMode>(initialSubMode);

  useEffect(() => {
    setSubMode(initialSubMode);
  }, [initialSubMode]);

  return (
    <div className="space-y-4 pb-12">
      {/* Technical Segment Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  AI Workbench
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Universal AI Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Perakitan konteks mandiri, tangkap hasil terverifikasi, estafet lintas AI, &amp; review bundel
              </p>
            </div>
          </div>

          {/* Sub-segment selector buttons with touch target >= 44px */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSubMode('context')}
              className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'context'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>1. Rakit Prompt</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('capture')}
              className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'capture'
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
              <span>2. Tangkap Hasil</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('handover')}
              className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'handover'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
              <span>3. Estafet AI</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('review')}
              className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'review'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <MessageSquareCode className="w-3.5 h-3.5 shrink-0" />
              <span>4. Review &amp; Q&amp;A</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render selected sub-segment */}
      {subMode === 'context' && (
        <ContextPackTab
          sessionState={sessionState}
          onNavigateTab={onNavigateTab}
          initialTaskId={sessionState.status.activeTask || sessionState.tasks.find(t => t.status === 'READY')?.id || sessionState.tasks[0]?.id || ''}
        />
      )}

      {subMode === 'capture' && (
        <ResultCaptureTab
          sessionState={sessionState}
          rawMarkdown={rawMarkdown}
          onUpdateMarkdown={onUpdateMarkdown}
          onNavigateTab={onNavigateTab}
        />
      )}

      {subMode === 'handover' && (
        <AiHandoverWizard
          sessionState={sessionState}
          rawMarkdown={rawMarkdown}
          onUpdateMarkdown={onUpdateMarkdown}
          onNavigateTab={onNavigateTab}
        />
      )}

      {subMode === 'review' && (
        <FeedbackReviewTab
          sessionState={sessionState}
          rawMarkdown={rawMarkdown}
          onUpdateMarkdown={onUpdateMarkdown}
          onNavigateTab={onNavigateTab ? (tab: string) => onNavigateTab(tab as TabType) : undefined}
        />
      )}
    </div>
  );
};
