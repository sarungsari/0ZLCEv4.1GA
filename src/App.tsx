import React, { useState, useMemo, Suspense, lazy } from 'react';
import { TabType, ParsedSessionState } from './types/zlce';
import INITIAL_SESSION_STATE_MD from '../SESSION_STATE.md?raw';
import { parseSessionStateMarkdown } from './utils/markdownParser';
import { validateSessionStateIntegrity } from './utils/sessionStateValidator';
import { Header } from './components/Header';
import { useSessionPersistence, SessionSnapshot, UseSessionPersistenceReturn } from './hooks/useSessionPersistence';
import {
  HOST_WORKBENCH_PROJECT_ID,
  DEFAULT_PROJECTS,
  getProjectStorageKeys,
  seedProjectSessionStorage
} from './hooks/useProjectRegistry';
import { MobileLayout } from './components/mobile/MobileLayout';
import { TabSkeleton } from './components/mobile/TabSkeleton';
import { ShieldCheck } from 'lucide-react';

// Code Splitting Tab dengan React.lazy & Suspense untuk efisiensi RAM 3GB (TASK-104 / PERF-001)
const DashboardTab = lazy(() => import('./components/DashboardTab').then(m => ({ default: m.DashboardTab })));
const SessionStateTab = lazy(() => import('./components/SessionStateTab').then(m => ({ default: m.SessionStateTab })));
const LandingWizardTab = lazy(() => import('./components/LandingWizardTab').then(m => ({ default: m.LandingWizardTab })));
const RevisionTriageTab = lazy(() => import('./components/RevisionTriageTab').then(m => ({ default: m.RevisionTriageTab })));
const TestHarnessTab = lazy(() => import('./components/TestHarnessTab').then(m => ({ default: m.TestHarnessTab })));
const TutorialTab = lazy(() => import('./components/TutorialTab').then(m => ({ default: m.TutorialTab })));
const WorkspaceReader = lazy(() => import('./components/mobile/WorkspaceReader').then(m => ({ default: m.WorkspaceReader })));
const AiWorkbenchTab = lazy(() => import('./components/mobile/AiWorkbenchTab').then(m => ({ default: m.AiWorkbenchTab })));
const ContextPackTab = lazy(() => import('./components/mobile/ContextPackTab').then(m => ({ default: m.ContextPackTab })));
const ResultCaptureTab = lazy(() => import('./components/mobile/ResultCaptureTab').then(m => ({ default: m.ResultCaptureTab })));
const AiHandoverWizard = lazy(() => import('./components/mobile/AiHandoverWizard').then(m => ({ default: m.AiHandoverWizard })));
const DiagnosticsTab = lazy(() => import('./components/DiagnosticsTab').then(m => ({ default: m.DiagnosticsTab })));
const DocsReferenceTab = lazy(() => import('./components/DocsReferenceTab').then(m => ({ default: m.DocsReferenceTab })));
const FeedbackReviewTab = lazy(() => import('./components/mobile/FeedbackReviewTab').then(m => ({ default: m.FeedbackReviewTab })));
const SessionTimelineTab = lazy(() => import('./components/mobile/SessionTimelineTab').then(m => ({ default: m.SessionTimelineTab })));
const CommandHubTab = lazy(() => import('./components/mobile/CommandHubTab').then(m => ({ default: m.CommandHubTab })));
const TerminalGitTab = lazy(() => import('./components/mobile/TerminalGitTab').then(m => ({ default: m.TerminalGitTab })));
const GitSyncTab = lazy(() => import('./components/mobile/GitSyncTab').then(m => ({ default: m.GitSyncTab })));
const PerformanceAuditTab = lazy(() => import('./components/mobile/PerformanceAuditTab').then(m => ({ default: m.PerformanceAuditTab })));
const FullscreenEditorModal = lazy(() => import('./components/FullscreenEditorModal').then(m => ({ default: m.FullscreenEditorModal })));

export { useSessionPersistence };
export type { SessionSnapshot, UseSessionPersistenceReturn };

function getInitialWorkspaceMarkdown(): string {
  try {
    const activeId = localStorage.getItem('zlce_active_project_id') || HOST_WORKBENCH_PROJECT_ID;
    const keys = getProjectStorageKeys(activeId);
    const projectSaved = localStorage.getItem(keys.rawMarkdownKey);
    if (projectSaved && projectSaved.trim().length > 0) {
      return projectSaved;
    }

    if (activeId !== HOST_WORKBENCH_PROJECT_ID) {
      let matched = DEFAULT_PROJECTS.find(p => p.id === activeId);
      try {
        const regRaw = localStorage.getItem('zlce_projects_registry');
        if (regRaw) {
          const reg = JSON.parse(regRaw);
          if (Array.isArray(reg)) {
            const found = reg.find((p: any) => p.id === activeId);
            if (found) matched = found;
          }
        }
      } catch {
        // ignore
      }
      return seedProjectSessionStorage(
        matched || {
          id: activeId,
          name: activeId,
          termuxPath: `~/projects/${activeId}`,
          repoUrl: '',
          branch: 'main',
          activeMemberId: 'eko',
          lastAccessed: new Date().toISOString(),
          mode: 'LITE',
          workflow: 'NEW'
        }
      );
    }

    const saved = localStorage.getItem('zlce_session_raw_markdown');
    if (saved && saved.trim().length > 0) {
      if (saved.includes('Todo API') && !saved.includes('ZLCE Mobile Workbench')) {
        localStorage.setItem('zlce_session_raw_markdown', INITIAL_SESSION_STATE_MD);
        return INITIAL_SESSION_STATE_MD;
      }
      return saved;
    }
  } catch {
    // fallback
  }
  return INITIAL_SESSION_STATE_MD;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const paramTab = new URLSearchParams(window.location.search).get('tab');
      const validTabs: TabType[] = [
        'dashboard', 'session', 'ai-workbench', 'terminal-git', 'diagnostics', 'docs',
        'workspace-reader', 'context-pack',
        'result-capture', 'ai-handover', 'feedback', 'session-timeline',
        'command-hub', 'git-sync', 'initiation', 'prompt-engine',
        'runtime-engine', 'recovery', 'triage', 'harness', 'templates', 'tutorial',
        'performance-audit'
      ];
      if (paramTab && validTabs.includes(paramTab as TabType)) {
        return paramTab as TabType;
      }
    }
    return 'dashboard';
  });
  const [isFullscreenEditorOpen, setIsFullscreenEditorOpen] = useState<boolean>(false);

  // Initialize rawMarkdown from project-isolated localStorage
  const [rawMarkdown, setRawMarkdown] = useState<string>(() => getInitialWorkspaceMarkdown());

  // Initialize stateData from project-isolated localStorage or parsed initial markdown
  const [stateData, setStateData] = useState<ParsedSessionState>(() => {
    try {
      const activeId = localStorage.getItem('zlce_active_project_id') || HOST_WORKBENCH_PROJECT_ID;
      const keys = getProjectStorageKeys(activeId);
      const savedState = localStorage.getItem(keys.stateDataKey) || (activeId === HOST_WORKBENCH_PROJECT_ID ? localStorage.getItem('zlce_session_state_data') : null);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (activeId === HOST_WORKBENCH_PROJECT_ID && parsed.context?.projectName?.includes('Todo API') && !parsed.context?.projectName?.includes('ZLCE Mobile')) {
          const fresh = parseSessionStateMarkdown(INITIAL_SESSION_STATE_MD);
          localStorage.setItem('zlce_session_state_data', JSON.stringify(fresh));
          return fresh;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return parseSessionStateMarkdown(getInitialWorkspaceMarkdown());
  });

  // Automatic persistence to localStorage with Undo/Restore history capability
  const persistence = useSessionPersistence(
    rawMarkdown,
    stateData,
    setRawMarkdown,
    setStateData,
    { maxHistory: 35, debounceMs: 400 }
  );

  // Pre-warm lazy tab chunks hanya SETELAH interaksi awal pengguna agar muat awal tetap ringan tanpa berkas besar
  React.useEffect(() => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    let cancelled = false;
    let warmed = false;
    const warmUpTabs = () => {
      if (cancelled || warmed || !navigator.onLine) return;
      warmed = true;
      void Promise.allSettled([
        import('./components/DashboardTab'),
        import('./components/SessionStateTab'),
        import('./components/mobile/AiWorkbenchTab'),
        import('./components/mobile/TerminalGitTab'),
        import('./components/DiagnosticsTab'),
        import('./components/DocsReferenceTab'),
        import('./components/mobile/WorkspaceReader'),
        import('./components/mobile/ContextPackTab'),
        import('./components/mobile/ResultCaptureTab'),
        import('./components/mobile/AiHandoverWizard'),
        import('./components/mobile/FeedbackReviewTab'),
        import('./components/mobile/CommandHubTab'),
        import('./components/mobile/GitSyncTab'),
        import('./components/mobile/SessionTimelineTab'),
        import('./components/TutorialTab'),
        import('./components/TestHarnessTab'),
        import('./components/RevisionTriageTab'),
        import('./components/LandingWizardTab'),
        import('./components/mobile/PerformanceAuditTab'),
        import('./components/FullscreenEditorModal'),
      ]);
    };

    const onFirstInteraction = () => {
      window.setTimeout(warmUpTabs, 80);
    };

    const events = ['pointerdown', 'keydown', 'touchstart', 'click'] as const;
    events.forEach((ev) => window.addEventListener(ev, onFirstInteraction, { once: true, passive: true }));
    return () => {
      cancelled = true;
      events.forEach((ev) => window.removeEventListener(ev, onFirstInteraction));
    };
  }, []);

  // Global keyboard shortcuts:
  // - Ctrl/Cmd + Shift + F: Toggle Fullscreen Editor
  // - Ctrl/Cmd + Z: Undo session change (when not typing inside an input/textarea)
  // - Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo session change
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Fullscreen shortcut
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setIsFullscreenEditorOpen(prev => !prev);
        return;
      }

      // Check if user is typing in standard textarea/input
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      // Undo: Ctrl/Cmd + Z (outside raw input, or global)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        if (!isInputFocused && persistence.canUndo) {
          e.preventDefault();
          persistence.undo();
        }
      }

      // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
      if (
        ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'y' || e.key === 'Y')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        if (!isInputFocused && persistence.canRedo) {
          e.preventDefault();
          persistence.redo();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [persistence]);

  // Real-time validation computation with strict canonical integrity checks (TASK-011)
  const validation = useMemo(() => {
    return validateSessionStateIntegrity(rawMarkdown);
  }, [rawMarkdown]);

  const handleUpdateMarkdown = React.useCallback((newMd: string) => {
    setRawMarkdown(newMd);
  }, []);

  const handleUpdateStateData = React.useCallback((newData: ParsedSessionState) => {
    setStateData(newData);
  }, []);

  const handleRunLinter = React.useCallback(() => {
    // Force re-evaluation and switch to session tab to view diagnostics
    setActiveTab('session');
  }, []);

  const handleToggleFullscreen = React.useCallback(() => {
    setIsFullscreenEditorOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        validation={validation}
        onRunLinter={handleRunLinter}
        rawMarkdown={rawMarkdown}
        onUpdateMarkdown={handleUpdateMarkdown}
        onToggleFullscreen={handleToggleFullscreen}
        persistence={persistence}
      />

      <MobileLayout activeTab={activeTab} onNavigateTab={(tab) => setActiveTab(tab as TabType)}>
        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Suspense fallback={<TabSkeleton tabName={activeTab} />}>
            {activeTab === 'dashboard' && (
              <DashboardTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                validation={validation}
                onUpdateMarkdown={handleUpdateMarkdown}
                onUpdateStateData={handleUpdateStateData}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                onRunLinter={handleRunLinter}
                persistence={persistence}
              />
            )}

            {activeTab === 'session' && (
              <SessionStateTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                validation={validation}
                onUpdateMarkdown={handleUpdateMarkdown}
                onUpdateStateData={handleUpdateStateData}
                onRunLinter={handleRunLinter}
                onToggleFullscreen={handleToggleFullscreen}
                persistence={persistence}
              />
            )}

            {(activeTab === 'docs' || activeTab === 'workspace-reader') && (
              <DocsReferenceTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                onUpdateMarkdown={handleUpdateMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                initialSubMode="reader"
              />
            )}

            {activeTab === 'ai-workbench' && (
              <AiWorkbenchTab
                sessionState={stateData}
                rawMarkdown={rawMarkdown}
                onUpdateMarkdown={handleUpdateMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                initialSubMode="context"
              />
            )}

            {activeTab === 'context-pack' && (
              <AiWorkbenchTab
                sessionState={stateData}
                rawMarkdown={rawMarkdown}
                onUpdateMarkdown={handleUpdateMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                initialSubMode="context"
              />
            )}

            {activeTab === 'result-capture' && (
              <AiWorkbenchTab
                sessionState={stateData}
                rawMarkdown={rawMarkdown}
                onUpdateMarkdown={handleUpdateMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                initialSubMode="capture"
              />
            )}

            {activeTab === 'ai-handover' && (
              <AiWorkbenchTab
                sessionState={stateData}
                rawMarkdown={rawMarkdown}
                onUpdateMarkdown={handleUpdateMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                initialSubMode="handover"
              />
            )}

            {activeTab === 'feedback' && (
              <AiWorkbenchTab
                sessionState={stateData}
                rawMarkdown={rawMarkdown}
                onUpdateMarkdown={handleUpdateMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                initialSubMode="review"
              />
            )}

            {activeTab === 'session-timeline' && (
              <SessionTimelineTab
                persistence={persistence}
                currentMarkdown={rawMarkdown}
                onRestoreMarkdown={handleUpdateMarkdown}
              />
            )}

            {activeTab === 'terminal-git' && (
              <TerminalGitTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                onUpdateMarkdown={handleUpdateMarkdown}
                initialSubMode="zlce-commands"
              />
            )}

            {activeTab === 'command-hub' && (
              <TerminalGitTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                onUpdateMarkdown={handleUpdateMarkdown}
                initialSubMode="zlce-commands"
              />
            )}

            {activeTab === 'git-sync' && (
              <TerminalGitTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                onUpdateMarkdown={handleUpdateMarkdown}
                initialSubMode="git-workflow"
              />
            )}

            {activeTab === 'initiation' && (
              <LandingWizardTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              />
            )}

            {activeTab === 'prompt-engine' && (
              <ContextPackTab 
                sessionState={stateData}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)} 
                initialTaskId={stateData.status.activeTask || stateData.tasks[0]?.id || ''}
                initialMode="prompt-studio"
              />
            )}

            {activeTab === 'runtime-engine' && (
              <ContextPackTab
                sessionState={stateData}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                initialTaskId={stateData.status.activeTask || stateData.tasks[0]?.id || ''}
                initialMode="context-pack"
              />
            )}

            {activeTab === 'recovery' && (
              <TerminalGitTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                onUpdateMarkdown={handleUpdateMarkdown}
                initialSubMode="emergency-recovery"
              />
            )}

            {activeTab === 'diagnostics' && (
              <DiagnosticsTab
                stateData={stateData}
                initialSubMode="harness"
              />
            )}

            {activeTab === 'harness' && (
              <DiagnosticsTab
                stateData={stateData}
                initialSubMode="harness"
              />
            )}

            {activeTab === 'triage' && (
              <DiagnosticsTab
                stateData={stateData}
                initialSubMode="triage"
              />
            )}

            {activeTab === 'performance-audit' && (
              <DiagnosticsTab
                stateData={stateData}
                initialSubMode="audit"
              />
            )}

            {activeTab === 'templates' && (
              <DocsReferenceTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                onUpdateMarkdown={handleUpdateMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                initialSubMode="templates"
              />
            )}

            {activeTab === 'tutorial' && (
              <DocsReferenceTab
                stateData={stateData}
                rawMarkdown={rawMarkdown}
                onUpdateMarkdown={handleUpdateMarkdown}
                onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                initialSubMode="tutorial"
              />
            )}
          </Suspense>
        </main>

        {/* Fullscreen Editor Modal */}
        {isFullscreenEditorOpen && (
          <Suspense fallback={null}>
            <FullscreenEditorModal
              rawMarkdown={rawMarkdown}
              onUpdateMarkdown={handleUpdateMarkdown}
              onUpdateStateData={handleUpdateStateData}
              validation={validation}
              onClose={() => setIsFullscreenEditorOpen(false)}
              persistence={persistence}
            />
          </Suspense>
        )}

        {/* Footer info bar */}
        <footer className="border-t border-slate-800/80 bg-slate-950/90 py-4 px-4 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob) • Single Source of Truth</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Standar Waktu Asli: <strong className="text-emerald-400">Aktif (Anti-Karang)</strong></span>
            <span>Protokol Pemulihan: <strong className="text-cyan-400">Kasus A / B / C / D</strong></span>
          </div>
        </footer>
      </MobileLayout>
    </div>
  );
};

export default App;
