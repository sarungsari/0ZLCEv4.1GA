import React from 'react';
import { Sparkles } from 'lucide-react';

export interface TabSkeletonProps {
  tabName?: string;
}

export const TabSkeleton: React.FC<TabSkeletonProps> = ({ tabName }) => {
  return (
    <div
      role="status"
      aria-label={`Memuat modul tab ${tabName || ''}...`}
      className="w-full space-y-5 animate-pulse min-h-[500px]"
    >
      {/* Top Banner Skeleton */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-44 bg-slate-800 rounded-lg" />
            <div className="h-3 w-64 bg-slate-850 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-slate-800 rounded-xl" />
          <div className="h-9 w-28 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Main Grid / Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl space-y-3.5">
            <div className="h-4 w-32 bg-slate-800 rounded" />
            <div className="h-28 w-full bg-slate-950/70 rounded-xl border border-slate-850" />
            <div className="h-10 w-full bg-slate-800/80 rounded-xl" />
          </div>

          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl space-y-3">
            <div className="h-4 w-40 bg-slate-800 rounded" />
            <div className="space-y-2">
              <div className="h-14 w-full bg-slate-950/60 rounded-xl border border-slate-850" />
              <div className="h-14 w-full bg-slate-950/60 rounded-xl border border-slate-850" />
              <div className="h-14 w-full bg-slate-950/60 rounded-xl border border-slate-850" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl space-y-3.5">
            <div className="h-4 w-28 bg-slate-800 rounded" />
            <div className="h-40 w-full bg-slate-950/60 rounded-xl border border-slate-850" />
          </div>
        </div>
      </div>
    </div>
  );
};
