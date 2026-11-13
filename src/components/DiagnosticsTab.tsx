import React, { useState, useEffect } from 'react';
import { ShieldCheck, GitFork, Gauge } from 'lucide-react';
import { ParsedSessionState } from '../types/zlce';
import { TestHarnessTab } from './TestHarnessTab';
import { RevisionTriageTab } from './RevisionTriageTab';
import { PerformanceAuditTab } from './mobile/PerformanceAuditTab';

export type DiagnosticsSubMode = 'harness' | 'triage' | 'audit';

interface DiagnosticsTabProps {
  stateData: ParsedSessionState;
  initialSubMode?: DiagnosticsSubMode;
}

export const DiagnosticsTab: React.FC<DiagnosticsTabProps> = ({
  stateData,
  initialSubMode = 'harness'
}) => {
  const [subMode, setSubMode] = useState<DiagnosticsSubMode>(initialSubMode);

  useEffect(() => {
    setSubMode(initialSubMode);
  }, [initialSubMode]);

  return (
    <div className="space-y-4 pb-12">
      {/* Technical Sub-segment Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Diagnostik &amp; Kualitas
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Kualitas &amp; Kepatuhan
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pusat pengujian otomatis, triase klasifikasi revisi S/M/L, dan audit performa PWA SM-T225
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSubMode('harness')}
              className={`touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'harness'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>1. Test Harness</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('triage')}
              className={`touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'triage'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>2. Triase Revisi S/M/L</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('audit')}
              className={`touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                subMode === 'audit'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>3. Audit Performa PWA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {subMode === 'harness' && <TestHarnessTab />}
      {subMode === 'triage' && <RevisionTriageTab stateData={stateData} />}
      {subMode === 'audit' && <PerformanceAuditTab />}
    </div>
  );
};
