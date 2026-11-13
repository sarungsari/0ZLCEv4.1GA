import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, GraduationCap, FolderKanban } from 'lucide-react';
import { ParsedSessionState, TabType } from '../types/zlce';
import { WorkspaceReader } from './mobile/WorkspaceReader';
import { TutorialTab } from './TutorialTab';
import { TemplatesTab } from './TemplatesTab';

export type DocsSubMode = 'reader' | 'tutorial' | 'templates';

interface DocsReferenceTabProps {
  stateData: ParsedSessionState;
  rawMarkdown: string;
  onUpdateMarkdown: (newMd: string) => void;
  onNavigateTab?: (tab: TabType) => void;
  initialSubMode?: DocsSubMode;
}

export const DocsReferenceTab: React.FC<DocsReferenceTabProps> = ({
  stateData,
  rawMarkdown,
  onUpdateMarkdown,
  onNavigateTab,
  initialSubMode = 'reader'
}) => {
  const [subMode, setSubMode] = useState<DocsSubMode>(initialSubMode);

  useEffect(() => {
    setSubMode(initialSubMode);
  }, [initialSubMode]);

  return (
    <div className="space-y-4 pb-12">
      {/* Technical Segment Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Dokumentasi &amp; Panduan Operasional
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Pustaka Lengkap
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pembaca dokumen repositori, panduan 10 langkah mobile/Termux, dan pustaka template baku + starter kit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSubMode('reader')}
              className={`touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'reader'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Pustaka Berkas (.md)</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('tutorial')}
              className={`touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'tutorial'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>2. Panduan 10 Langkah</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('templates')}
              className={`touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'templates'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>3. Template &amp; Pack Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-mode Rendering */}
      {subMode === 'reader' && (
        <WorkspaceReader
          initialMarkdown={rawMarkdown}
          onSelectDocument={(md) => onUpdateMarkdown(md)}
        />
      )}

      {subMode === 'tutorial' && (
        <TutorialTab
          sessionState={stateData}
          onNavigateTab={onNavigateTab ? (tab: string) => onNavigateTab(tab as TabType) : undefined}
        />
      )}

      {subMode === 'templates' && <TemplatesTab />}
    </div>
  );
};
