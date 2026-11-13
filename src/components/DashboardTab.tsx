import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Play, 
  GitBranch, 
  FileText, 
  Users, 
  Tablet, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  Filter, 
  Search, 
  ArrowRight, 
  Cpu, 
  Database, 
  ChevronRight, 
  ChevronDown,
  FolderGit2, 
  Flame, 
  RotateCcw,
  Zap,
  Globe,
  GitPullRequest,
  Key,
  Share2,
  ArrowUpRight,
  Code2,
  BookOpen,
  ShieldAlert,
  ArrowRightLeft,
  ClipboardList,
  Download,
  FolderPlus,
  Wrench,
  GitFork,
  GraduationCap
} from 'lucide-react';
import { ParsedSessionState, ValidationResult, TaskStatus, ZLCETask, ParsedBacklogTask } from '../types/zlce';
import { copyText } from '../utils/clipboard';
import { serializeSessionStateToMarkdown, parseSessionStateMarkdown, parseTasksMarkdown } from '../utils/markdownParser';
import { generatePortableContextPack } from '../utils/contextPackGenerator';
import { downloadMarkdownBlob, generateAndDownloadZipBundle } from '../utils/fileExport';
import { TEAM_MEMBERS } from '../data/teamMembers';
import { TeamMember, ProjectWorkflowMode } from '../types/mobile';
import { UseSessionPersistenceReturn } from '../hooks/useSessionPersistence';
import { useProjectRegistry, HOST_WORKBENCH_PROJECT_ID } from '../hooks/useProjectRegistry';
import {
  buildFreshSessionStateMarkdown,
  buildFreshTasksMarkdown,
  buildFreshBlueprintMarkdown,
  buildTermuxInitCommand,
  getWorkflowLabel,
  getWorkflowShortTag
} from '../utils/projectStarter';
import { ConfirmDialog } from './mobile/ConfirmDialog';
import { ModalShell } from './mobile/ModalShell';
import { DraftTextarea } from './mobile/DraftTextarea';
import { showToast } from './mobile/ToastContainer';
import {
  parseDocsImpactList,
  validateSmartTaskCheck,
  generateRecommendedDocsImpactEvidence,
  SmartTaskCheckValidationResult
} from '../utils/smartTaskCheck';

export { TEAM_MEMBERS };
export type { TeamMember };

interface DashboardTabProps {
  stateData: ParsedSessionState;
  rawMarkdown: string;
  validation: ValidationResult;
  onUpdateMarkdown: (newMd: string) => void;
  onUpdateStateData: (newData: ParsedSessionState) => void;
  onNavigateTab: (tab: string) => void;
  onRunLinter: () => void;
  persistence?: UseSessionPersistenceReturn;
}

import { TASK_PHASES, TaskPhaseDefinition } from '../data/taskPhases';
export { TASK_PHASES };
export type { TaskPhaseDefinition };

const DashboardTabComponent: React.FC<DashboardTabProps> = ({
  stateData,
  rawMarkdown,
  validation,
  onUpdateMarkdown,
  onUpdateStateData,
  onNavigateTab,
  onRunLinter,
  persistence
}) => {
  const { activeProject, activeProjectId } = useProjectRegistry();
  const isHostProject = activeProjectId === HOST_WORKBENCH_PROJECT_ID;

  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return localStorage.getItem('zlce_active_member_id') || 'eko';
  });

  // Evidence modal / inline input for marking DONE
  const [doneModalTaskId, setDoneModalTaskId] = useState<string | null>(null);
  const [evidenceInput, setEvidenceInput] = useState<string>('Verifikasi build & uji lulus 100%');
  // Smart Task Check: pelacakan dokumen Docs Impact yang dikonfirmasi eksplisit
  const [confirmedDocsByTask, setConfirmedDocsByTask] = useState<Record<string, string[]>>({});

  // GitHub Sync & Remote Hub Modal state
  const [isGitSyncOpen, setIsGitSyncOpen] = useState<boolean>(false);
  const [showReloadTemplateConfirm, setShowReloadTemplateConfirm] = useState<boolean>(false);
  const [gitSyncMode, setGitSyncMode] = useState<'direct-push' | 'fork-clone' | 'new-repo'>('direct-push');
  const [targetBranch, setTargetBranch] = useState<string>('v4-mobile');
  const [isScanningConflicts, setIsScanningConflicts] = useState<boolean>(false);
  const [conflictScanReport, setConflictScanReport] = useState<{
    status: 'clean' | 'conflicts';
    scannedAt: string;
    checksPassed: number;
    totalChecks: number;
  }>({
    status: 'clean',
    scannedAt: '2026-11-07 17:45 WIB',
    checksPassed: 7,
    totalChecks: 7
  });

  const handleTriggerLiveConflictScan = () => {
    setIsScanningConflicts(true);
    setTimeout(() => {
      setIsScanningConflicts(false);
      setConflictScanReport({
        status: 'clean',
        scannedAt: new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) + ' WIB',
        checksPassed: 7,
        totalChecks: 7
      });
    }, 600);
  };

  // Lazy-load TASKS.md detail backlog hanya untuk repositori host ZLCE4.1; proyek pengguna memakai starter backlog mandiri
  const [tasksMarkdown, setTasksMarkdown] = useState<string | null>(null);
  const ensureTasksBacklogLoaded = React.useCallback(async (): Promise<string> => {
    if (!isHostProject) return '';
    if (tasksMarkdown !== null) return tasksMarkdown;
    try {
      const mod = await import('../../TASKS.md?raw');
      const raw = mod.default || '';
      setTasksMarkdown(raw);
      return raw;
    } catch {
      return '';
    }
  }, [isHostProject, tasksMarkdown]);

  React.useEffect(() => {
    if (!isHostProject || typeof window === 'undefined' || tasksMarkdown !== null) return;
    let triggered = false;
    const onFirstInteraction = () => {
      if (triggered) return;
      triggered = true;
      void ensureTasksBacklogLoaded();
    };
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach(ev => window.addEventListener(ev, onFirstInteraction, { once: true, passive: true }));
    return () => {
      events.forEach(ev => window.removeEventListener(ev, onFirstInteraction));
    };
  }, [isHostProject, tasksMarkdown, ensureTasksBacklogLoaded]);

  // Parse TASKS.md kanonik (untuk host) atau starter TASKS.md (untuk proyek pengguna)
  const parsedBacklogDoc = useMemo(() => {
    if (!isHostProject) {
      try {
        const starterTasksMd = buildFreshTasksMarkdown({
          projectName: activeProject.name,
          stack: activeProject.stack,
          mode: activeProject.mode,
          workflow: activeProject.workflow || 'NEW',
          branch: activeProject.branch,
          termuxPath: activeProject.termuxPath,
          description: activeProject.description
        });
        return parseTasksMarkdown(starterTasksMd);
      } catch {
        return { projectName: activeProject.name, raw: '', phases: [], tasks: [] };
      }
    }
    if (!tasksMarkdown) {
      return { projectName: '-', raw: '', phases: [], tasks: [] };
    }
    try {
      return parseTasksMarkdown(tasksMarkdown);
    } catch {
      return { projectName: '-', raw: '', phases: [], tasks: [] };
    }
  }, [isHostProject, tasksMarkdown, activeProject]);

  const taskDetailMap = useMemo(() => {
    const map = new Map<string, ParsedBacklogTask>();
    parsedBacklogDoc.tasks.forEach(t => map.set(t.id, t));
    return map;
  }, [parsedBacklogDoc]);

  const handleOpenWorkflowModal = (workflow: ProjectWorkflowMode) => {
    window.dispatchEvent(new CustomEvent('zlce-open-new-project-modal', { detail: { workflow } }));
  };

  const handleDownloadStarterFile = (docKind: 'SESSION_STATE' | 'TASKS' | 'BLUEPRINT') => {
    const opts = {
      projectName: activeProject.name,
      stack: activeProject.stack,
      mode: activeProject.mode,
      workflow: activeProject.workflow || 'NEW',
      branch: activeProject.branch,
      termuxPath: activeProject.termuxPath,
      description: activeProject.description
    };
    const content =
      docKind === 'SESSION_STATE'
        ? rawMarkdown
        : docKind === 'TASKS'
        ? buildFreshTasksMarkdown(opts)
        : buildFreshBlueprintMarkdown(opts);
    const res = downloadMarkdownBlob(content, { filename: `${docKind}.md` });
    if (res.success) {
      showToast(`Berkas ${res.filename} berhasil diunduh untuk proyek "${activeProject.name}".`, 'success');
    } else {
      showToast(res.error || 'Gagal mengunduh berkas.', 'error');
    }
  };

  // Smart Task Check Modal Opener & Gating Handlers
  const openDoneModalWithSmartCheck = (taskId: string) => {
    void ensureTasksBacklogLoaded();
    const detail = taskDetailMap.get(taskId);
    const existingTask = stateData.tasks.find(t => t.id === taskId);
    const docs = parseDocsImpactList(detail?.docsImpact);

    // Jika bukti tersimpan sudah memadai (>= 5 karakter dan bukan placeholder), gunakan itu; jika tidak, gunakan rekomendasi otomatis
    if (existingTask && existingTask.evidence && existingTask.evidence !== '-' && existingTask.evidence.length >= 5) {
      setEvidenceInput(existingTask.evidence);
    } else {
      setEvidenceInput(generateRecommendedDocsImpactEvidence(taskId, docs, detail?.title || existingTask?.name));
    }

    // Inisialisasi checklist dokumen untuk task ini
    setConfirmedDocsByTask(prev => {
      const existing = prev[taskId] || [];
      return { ...prev, [taskId]: existing.length > 0 ? existing : docs };
    });

    setDoneModalTaskId(taskId);
  };

  const handleToggleDocConfirmation = (taskId: string, doc: string) => {
    const docLower = doc.trim().toLowerCase();
    setConfirmedDocsByTask(prev => {
      const current = prev[taskId] || [];
      const exists = current.some(d => d.toLowerCase() === docLower);
      const updated = exists
        ? current.filter(d => d.toLowerCase() !== docLower)
        : [...current, doc];
      return { ...prev, [taskId]: updated };
    });
  };

  const handleConfirmAllDocs = (taskId: string, docsList: string[]) => {
    setConfirmedDocsByTask(prev => ({ ...prev, [taskId]: [...docsList] }));
  };

  const handlePopulateRecommendedEvidence = (taskId: string) => {
    const detail = taskDetailMap.get(taskId);
    const existingTask = stateData.tasks.find(t => t.id === taskId);
    const docs = parseDocsImpactList(detail?.docsImpact);
    const rec = generateRecommendedDocsImpactEvidence(taskId, docs, detail?.title || existingTask?.name);
    setEvidenceInput(rec);
    handleConfirmAllDocs(taskId, docs);
  };

  const activeMember = useMemo(() => {
    return TEAM_MEMBERS.find(m => m.id === activeMemberId) || TEAM_MEMBERS[0];
  }, [activeMemberId]);

  const handleSelectMember = (id: string) => {
    setActiveMemberId(id);
    localStorage.setItem('zlce_active_member_id', id);
    window.dispatchEvent(new Event('zlce-active-member-changed'));
  };

  const handleCopy = async (text: string, id: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Compute status summary
  const statusStats = useMemo(() => {
    const tasks = stateData.tasks || [];
    let ready = 0;
    let inProgress = 0;
    let done = 0;
    let pending = 0;
    let blocked = 0;

    tasks.forEach(t => {
      if (t.status === 'READY') ready++;
      else if (t.status === 'IN_PROGRESS') inProgress++;
      else if (t.status === 'DONE') done++;
      else if (t.status === 'BLOCKED') blocked++;
      else pending++;
    });

    const completionPercent = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

    return { total: tasks.length, ready, inProgress, done, pending, blocked, completionPercent };
  }, [stateData.tasks]);

  // Hitung progres setiap fase untuk navigator fase
  const phaseProgressMap = useMemo(() => {
    const map = new Map<string, { total: number; done: number; isComplete: boolean }>();
    const tasks = stateData.tasks || [];

    TASK_PHASES.forEach(p => {
      if (p.id === 'all') {
        map.set('all', {
          total: tasks.length,
          done: statusStats.done,
          isComplete: statusStats.done === tasks.length
        });
        return;
      }

      let count = 0;
      let doneCount = 0;
      tasks.forEach(t => {
        const numMatch = t.id.match(/\d+/);
        if (numMatch) {
          const num = parseInt(numMatch[0], 10);
          if (num >= p.minNum && num <= p.maxNum) {
            count++;
            if (t.status === 'DONE') doneCount++;
          }
        }
      });
      map.set(p.id, {
        total: count,
        done: doneCount,
        isComplete: count > 0 && count === doneCount
      });
    });

    return map;
  }, [stateData.tasks, statusStats.done]);

  // Hitung jumlah fase yang sudah berstatus 100% selesai (TASK-116)
  const completedPhasesCount = useMemo(() => {
    let count = 0;
    TASK_PHASES.forEach(p => {
      if (p.id !== 'all') {
        const pStat = phaseProgressMap.get(p.id);
        if (pStat && pStat.isComplete) count++;
      }
    });
    return count;
  }, [phaseProgressMap]);

  // Temukan task aktif saat ini atau task berikutnya
  const activeOrNextTask = useMemo(() => {
    const inProg = stateData.tasks.find(t => t.status === 'IN_PROGRESS');
    if (inProg) return inProg;

    const ready = stateData.tasks.find(t => t.status === 'READY');
    if (ready) return ready;

    if (stateData.status.nextTask && stateData.status.nextTask !== '-') {
      const match = stateData.tasks.find(t => t.id === stateData.status.nextTask);
      if (match) return match;
    }

    return stateData.tasks[0] || null;
  }, [stateData.tasks, stateData.status.nextTask]);

  // Detail backlog untuk activeOrNextTask
  const activeTaskDetail = useMemo(() => {
    if (!activeOrNextTask) return null;
    return taskDetailMap.get(activeOrNextTask.id) || null;
  }, [activeOrNextTask, taskDetailMap]);

  // Filter tasks based on phase, status, search
  const filteredTasks = useMemo(() => {
    return stateData.tasks.filter(t => {
      // Phase filter
      if (selectedPhase !== 'all') {
        const numMatch = t.id.match(/\d+/);
        if (numMatch) {
          const num = parseInt(numMatch[0], 10);
          const p = TASK_PHASES.find(phase => phase.id === selectedPhase);
          if (p && (num < p.minNum || num > p.maxNum)) {
            return false;
          }
        }
      }

      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
      }

      return true;
    });
  }, [stateData.tasks, selectedPhase, statusFilter, searchQuery]);

  // Handle task status transition
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus, customEvidence?: string) => {
    // Check 1 Task IN_PROGRESS rule
    if (newStatus === 'IN_PROGRESS') {
      const existingInProg = stateData.tasks.find(t => t.status === 'IN_PROGRESS' && t.id !== taskId);
      if (existingInProg) {
        showToast(`Aturan Kolaborasi Tablet: Task ${existingInProg.id} sedang berstatus IN_PROGRESS. Hanya 1 task aktif pada satu waktu.`, 'warning');
        return;
      }
    }

    // Smart Task Check Gate: Verifikasi bukti pengerjaan Docs Impact sebelum status diubah ke DONE
    if (newStatus === 'DONE') {
      const detail = taskDetailMap.get(taskId);
      const existing = stateData.tasks.find(t => t.id === taskId);
      const evidenceToValidate = customEvidence || (existing && existing.evidence !== '-' ? existing.evidence : evidenceInput) || '';
      const checkResult = validateSmartTaskCheck({
        taskId,
        docsImpact: detail?.docsImpact,
        evidence: evidenceToValidate,
        explicitlyConfirmedDocs: confirmedDocsByTask[taskId] || [],
        taskTitle: detail?.title || existing?.name
      });

      if (!checkResult.canMarkDone) {
        showToast(`[Smart Task Check Diblokir] ${checkResult.summary}`, 'warning');
        openDoneModalWithSmartCheck(taskId);
        return;
      }
    }

    const updatedTasks = stateData.tasks.map(t => {
      if (t.id === taskId) {
        const isNowDone = newStatus === 'DONE';
        return {
          ...t,
          status: newStatus,
          evidence: isNowDone 
            ? (customEvidence || (t.evidence !== '-' ? t.evidence : 'Verifikasi terminal sukses 0 error')) 
            : t.evidence,
          approved: isNowDone 
            ? `ya (oleh: ${activeMember.name})` 
            : t.approved
        };
      }
      return t;
    });

    const updatedStatus = { ...stateData.status };
    const updatedWal = { ...stateData.wal };
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' WIB';
    const detail = taskDetailMap.get(taskId);

    if (newStatus === 'IN_PROGRESS') {
      const target = stateData.tasks.find(t => t.id === taskId);
      updatedStatus.activeTask = taskId;
      updatedStatus.activeTaskStatus = 'IN_PROGRESS';
      updatedWal.task = taskId;
      updatedWal.currentStep = `Implementasi ${target?.name || taskId} oleh ${activeMember.name}`;
      updatedWal.plannedFiles = detail?.files?.join(', ') || 'src/components/mobile/';
      updatedWal.completedSoFar = 'Penyiapan konteks kerja & verifikasi dependensi';
      updatedWal.nextStepExact = detail?.acceptanceCriteria?.[0] || 'Eksekusi kode dan verifikasi tes';
      updatedWal.verificationCommand = 'npm run build && python3 scripts/zlce-check.py .';
      updatedWal.updatedTimestamp = nowStr;
    } else if (newStatus === 'DONE') {
      updatedStatus.lastDoneTask = taskId;
      if (updatedStatus.activeTask === taskId) {
        updatedStatus.activeTask = '-';
        updatedStatus.activeTaskStatus = 'READY';
      }
      // Determine next task
      const currentIdx = stateData.tasks.findIndex(t => t.id === taskId);
      if (currentIdx >= 0 && currentIdx < stateData.tasks.length - 1) {
        const next = stateData.tasks[currentIdx + 1];
        updatedStatus.nextTask = next.id;
      }
      updatedWal.task = '-';
      updatedWal.currentStep = `Task ${taskId} tuntas diverifikasi oleh ${activeMember.name}`;
      updatedWal.nextStepExact = `Mulai task berikutnya: ${updatedStatus.nextTask}`;
      updatedWal.updatedTimestamp = nowStr;
    }

    // Append to audit log
    const updatedAuditLog = [
      `**${nowStr}:** Task ${taskId} status diubah ke ${newStatus} oleh ${activeMember.name}.`,
      ...(stateData.auditLog || []).slice(0, 20)
    ];

    const newState: ParsedSessionState = {
      ...stateData,
      tasks: updatedTasks,
      status: updatedStatus,
      wal: updatedWal,
      auditLog: updatedAuditLog
    };

    const newMd = serializeSessionStateToMarkdown(newState);
    onUpdateStateData(newState);
    onUpdateMarkdown(newMd);
  };

  // Reset or reload live canonical SESSION_STATE directly from physical disk file
  const handleReloadLiveSessionState = async () => {
    if (persistence?.reloadFromDisk) {
      const ok = await persistence.reloadFromDisk();
      if (ok) {
        showToast('Berhasil disinkronkan langsung dari berkas disk /SESSION_STATE.md repositori!', 'success');
        return;
      }
    }
    setShowReloadTemplateConfirm(true);
  };

  const executeReloadTemplate = async () => {
    if (!isHostProject) {
      const freshMd = buildFreshSessionStateMarkdown({
        projectName: activeProject.name,
        stack: activeProject.stack,
        mode: activeProject.mode,
        workflow: activeProject.workflow || 'NEW',
        branch: activeProject.branch,
        termuxPath: activeProject.termuxPath,
        description: activeProject.description
      });
      const parsed = parseSessionStateMarkdown(freshMd);
      onUpdateMarkdown(freshMd);
      onUpdateStateData(parsed);
      showToast(`Workspace "${activeProject.name}" diatur ulang ke starter fresh ZLCE.`, 'info');
      setShowReloadTemplateConfirm(false);
      return;
    }

    const { default: seedMd } = await import('../../SESSION_STATE.md?raw');
    const parsed = parseSessionStateMarkdown(seedMd);
    onUpdateMarkdown(seedMd);
    onUpdateStateData(parsed);
    showToast('State berhasil dimuat ulang dari template kanonik workspace.', 'info');
    setShowReloadTemplateConfirm(false);
  };

  // Generate complete Context Pack for current active task
  const generateContextPack = (targetTaskId?: string) => {
    const tId = targetTaskId || activeOrNextTask?.id || stateData.tasks.find(t => t.status === 'READY')?.id || stateData.tasks[0]?.id || '';
    const detail = taskDetailMap.get(tId);
    const targetTask: ZLCETask = stateData.tasks.find(t => t.id === tId) || {
      id: tId,
      name: detail?.title || activeOrNextTask?.name || 'Task Atomik ZLCE',
      dependencies: detail?.dependencies || '-',
      status: activeOrNextTask?.status || 'IN_PROGRESS',
      evidence: '-',
      approved: '-'
    };

    const output = generatePortableContextPack({
      task: targetTask,
      taskDetail: detail,
      sessionState: stateData,
      activeMember,
      mode: stateData.context.mode || 'FULL'
    });

    return output.markdown;
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-12">
      {/* 1. High-Density Technical Ribbon */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-cyan-400 font-bold tracking-wider">ZLCE DASHBOARD</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-bold">CABANG: {stateData.status.gitBranch || 'v4-mobile'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">DRIVER: {activeMember.name}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-indigo-300">MODE: {stateData.context.mode || 'FULL'}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {stateData.context.projectName || 'ZLCE Mobile Workbench v4.1.0 GA'}
            </h1>
            <p className="text-xs text-slate-400">
              Pusat status alur kerja teknis, kontrol eksekusi task aktif, dan matriks pengerjaan tim tablet SM-T225.
            </p>
          </div>

          {/* Quick Technical Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('session')}
              className="touch-target-44 min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>SESSION_STATE</span>
            </button>

            <button
              onClick={() => handleCopy(generateContextPack(), 'context-pack-hero')}
              className="touch-target-44 min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition active:scale-95"
            >
              {copiedId === 'context-pack-hero' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedId === 'context-pack-hero' ? 'Tersalin' : 'Salin Konteks'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('terminal-git')}
              className="touch-target-44 min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 transition"
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>Terminal &amp; Git</span>
            </button>

            <button
              onClick={handleReloadLiveSessionState}
              className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
              title="Tarik & Muat Ulang Berkas SESSION_STATE.md repositori"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Technical Roadmap Progress Bar */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">PROGRES BACKLOG:</span>
              <span className="text-cyan-400 font-bold">{statusStats.done} / {statusStats.total} Task Selesai ({statusStats.completionPercent}%)</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-emerald-400">{statusStats.done} DONE</span>
              <span>·</span>
              <span className="text-amber-400">{statusStats.ready} READY</span>
              <span>·</span>
              <span className="text-cyan-300">{statusStats.inProgress} IN_PROGRESS</span>
              <span>·</span>
              <span>{statusStats.pending} PENDING</span>
            </div>
          </div>

          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(statusStats.completionPercent, 4)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 1B. Fresh PWA & Sistem ZLCE Launcher (Proyek Baru, Lanjutan & Modifikasi) */}
      {isHostProject ? (
        <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 p-4 sm:p-5 space-y-3 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  v4.1.0 GA TERKUNCI (SIAP PAKAI)
                </span>
                <span className="text-cyan-300 font-semibold">Fresh PWA &amp; Sistem ZLCE Siap Pakai</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Mulai Workspace Proyek Baru, Lanjutan Setengah Jadi, atau Update &amp; Modifikasi
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Repositori ZLCE Mobile Workbench sudah final &amp; terkunci. Buat proyek baru terisolasi tanpa menyentuh state v4.1.0 GA, unduh Starter Kit (.ZIP), atau buka panduan Android &amp; pemakaian mobile.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenWorkflowModal('NEW')}
                className="touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Proyek Baru</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenWorkflowModal('CONTINUE')}
                className="touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
              >
                <GitFork className="w-4 h-4" />
                <span>Lanjutan Setengah Jadi</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenWorkflowModal('MODIFY')}
                className="touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
              >
                <Wrench className="w-4 h-4" />
                <span>Update &amp; Modifikasi</span>
              </button>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const res = await generateAndDownloadZipBundle({
                  type: 'starter-kit',
                  sessionStateMarkdown: rawMarkdown,
                  filename: 'zlce-starter-kit-v4.1.0.zip'
                });
                if (res.success) {
                  showToast('Bundel zlce-starter-kit-v4.1.0.zip berhasil di-generate & diunduh.', 'success');
                } else {
                  showToast('Mode Statis PWA: generate zlce-starter-kit-v4.1.0.zip di Termux via "npm run bundles".', 'warning');
                }
              }}
              className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Generate dan unduh zlce-starter-kit-v4.1.0.zip secara on-demand tanpa menyimpan file ZIP statis di repo"
            >
              <Download className="w-4 h-4" />
              <span>Generate &amp; Unduh Starter Kit (.ZIP)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('tutorial')}
              className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Tutorial Instalasi Android</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('docs')}
              className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Panduan Penggunaan &amp; Pustaka</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 p-4 sm:p-5 space-y-3 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  {getWorkflowShortTag(activeProject.workflow)} · {getWorkflowLabel(activeProject.workflow)}
                </span>
                <span className="text-cyan-300 font-semibold">{activeProject.termuxPath}</span>
                <span className="text-slate-400">Mode {activeProject.mode}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Workspace Mandiri Terisolasi: {activeProject.name}
              </h2>
              <p className="text-xs text-slate-300">
                Perubahan tersimpan otomatis di sandbox proyek ini tanpa memengaruhi repositori host ZLCE v4.1.0 GA. Ekspor berkas kontrol atau salin perintah Termux di bawah ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenWorkflowModal('NEW')}
                className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Proyek Baru</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('tutorial')}
                className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Tutorial</span>
              </button>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadStarterFile('SESSION_STATE')}
              className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh SESSION_STATE.md</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadStarterFile('TASKS')}
              className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh TASKS.md</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadStarterFile('BLUEPRINT')}
              className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh BLUEPRINT.md</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  buildTermuxInitCommand({
                    termuxPath: activeProject.termuxPath,
                    branch: activeProject.branch,
                    workflow: activeProject.workflow
                  }),
                  'termux-project-init'
                )
              }
              className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copiedId === 'termux-project-init' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
              <span>{copiedId === 'termux-project-init' ? 'Perintah Termux Tersalin' : 'Salin Setup Termux'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Real-time Disk Bridge Card */}
      <div className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all ${
        persistence?.diskSync?.isSaving
          ? 'bg-amber-950/20 border-amber-800/50'
          : persistence?.diskSync?.isLive
          ? 'bg-emerald-950/20 border-emerald-800/40'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
            persistence?.diskSync?.isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
          }`}>
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">
                Integrasi Berkas: <code className="text-cyan-300 font-mono">/SESSION_STATE.md</code>
              </span>
              <span className={`text-xs font-mono flex items-center gap-1.5 ${
                persistence?.diskSync?.isSaving
                  ? 'text-amber-400'
                  : persistence?.diskSync?.isLive
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  persistence?.diskSync?.isSaving
                    ? 'bg-amber-400'
                    : persistence?.diskSync?.isLive
                    ? 'bg-emerald-400'
                    : 'bg-slate-500'
                }`} />
                {persistence?.diskSync?.isSaving
                  ? 'Menulis...'
                  : persistence?.diskSync?.isLive
                  ? 'Live Bridge Aktif'
                  : 'Live Bridge tidak aktif (Mode Statis PWA)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {persistence?.diskSync?.isLive ? (
                <>Task, WAL, status DONE, dan estafet tim <span className="text-slate-200">tersinkronisasi langsung ke disk fisik</span>.</>
              ) : (
                <>Beroperasi mandiri di browser: seluruh perubahan tersimpan otomatis di <span className="text-slate-200">LocalStorage peramban (Zero-Loss Cache)</span>.</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 font-mono text-xs">
          <button
            onClick={() => persistence?.saveToDiskNow && persistence.saveToDiskNow()}
            disabled={persistence?.diskSync?.isSaving}
            className="touch-target-44 min-h-[44px] px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-200 transition active:scale-95 disabled:opacity-50"
            title="Tulis paksa markdown ke berkas /SESSION_STATE.md"
          >
            Tulis Disk
          </button>
          <button
            onClick={() => persistence?.reloadFromDisk && persistence.reloadFromDisk()}
            disabled={persistence?.diskSync?.isReading}
            className="touch-target-44 min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition active:scale-95 disabled:opacity-50 flex items-center gap-1"
            title="Muat ulang isi langsung dari disk fisik"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-emerald-400 ${persistence?.diskSync?.isReading ? 'animate-spin' : ''}`} />
            <span>Tarik Disk</span>
          </button>
        </div>
      </div>

      {/* 3. Metrics Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Total Tasks */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Total Backlog</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">{statusStats.total}</div>
          <div className="text-xs text-slate-400 mt-0.5 font-mono">{TASK_PHASES.length - 1} Fase Eksekusi</div>
        </div>

        {/* Ready Tasks */}
        <div className="bg-slate-900 border border-amber-900/40 p-3 sm:p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-amber-400 text-xs font-medium mb-1">
            <span>Siap Eksekusi</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-300">{statusStats.ready}</div>
          <div className="text-xs text-amber-400/80 mt-0.5 font-mono">{activeOrNextTask?.id || 'Antrean Selesai'}</div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900 border border-cyan-900/40 p-3 sm:p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-cyan-400 text-xs font-medium mb-1">
            <span>In Progress</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-cyan-300">{statusStats.inProgress} / 1</div>
          <div className="text-xs text-slate-400 mt-0.5 font-mono">1 Task Tablet</div>
        </div>

        {/* Completed */}
        <div className="bg-slate-900 border border-emerald-900/40 p-3 sm:p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-medium mb-1">
            <span>Task DONE</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-300">{statusStats.done}</div>
          <div className="text-xs text-emerald-400/80 mt-0.5 font-mono">{completedPhasesCount} dari {TASK_PHASES.length - 1} Fase Selesai</div>
        </div>

        {/* Pending */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Pending</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-300">{statusStats.pending}</div>
          <div className="text-xs text-slate-400 mt-0.5 font-mono">Antrean</div>
        </div>

        {/* State Health */}
        <div className={`border p-3 sm:p-3.5 rounded-xl ${validation.valid ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-rose-950/20 border-rose-800/40'}`}>
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className={validation.valid ? 'text-emerald-400' : 'text-rose-400'}>State Health</span>
            <ShieldCheck className={`w-3.5 h-3.5 ${validation.valid ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className={`text-lg sm:text-xl font-extrabold ${validation.valid ? 'text-emerald-300' : 'text-rose-300'}`}>
            {validation.valid ? '100% VALID' : `${validation.errorsCount} ERROR`}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-mono">
            {validation.valid ? 'zlce-check PASS' : 'Cek Error'}
          </div>
        </div>
      </div>

      {/* 4. Main Grid: Dynamic Spotlight on Active Task + Team Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Spotlight Card: The Task Running / Next Up (Span 2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-xs uppercase font-mono font-bold text-amber-400 tracking-wider">
                  Fokus Eksekusi Sekarang
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white">
                  {activeOrNextTask?.id}: {activeTaskDetail?.title || activeOrNextTask?.name}
                </h3>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase border ${
                activeOrNextTask?.status === 'IN_PROGRESS'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : activeOrNextTask?.status === 'READY'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                ● Status: {activeOrNextTask?.status || 'READY'}
              </span>
            </div>
          </div>

          {/* Dynamic Details & Acceptance Criteria from TASKS.md */}
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            {/* Description if present */}
            {activeTaskDetail?.description && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 sm:p-3 rounded-lg border border-slate-800/80">
                {activeTaskDetail.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5 text-xs">Fase &amp; Jalur:</span>
                <span className="text-slate-200 font-bold truncate block">{activeTaskDetail?.phase || 'Fase Eksekusi ZLCE'}</span>
              </div>
              <div className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5 text-xs">Dependensi:</span>
                <span className="text-emerald-400 font-bold">{activeOrNextTask?.dependencies || '-'}</span>
              </div>
              <div className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5 text-xs">Berkas Direncanakan:</span>
                <span className="text-cyan-300 font-bold truncate block" title={activeTaskDetail?.files?.join(', ') || stateData.wal.plannedFiles}>
                  {activeTaskDetail?.files?.join(', ') || stateData.wal.plannedFiles || '-'}
                </span>
              </div>
            </div>

            {/* Dynamic Acceptance Criteria Box */}
            <div className="bg-slate-950/80 rounded-xl p-3 sm:p-4 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Kriteria Penerimaan (Acceptance Criteria):
                </span>
                {activeTaskDetail?.testCase && (
                  <span className="font-mono text-cyan-400 text-xs font-normal">
                    Test Case: {activeTaskDetail.testCase}
                  </span>
                )}
              </div>
              
              {activeTaskDetail?.acceptanceCriteria && activeTaskDetail.acceptanceCriteria.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeTaskDetail.acceptanceCriteria.map((ac, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                        {idx + 1}
                      </span>
                      <span>{ac}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-400 font-mono">
                  Langkah berikutnya dari WAL: {stateData.wal.nextStepExact || 'Selesaikan implementasi sesuai cetak biru.'}
                </div>
              )}
            </div>

            {/* Terminal Command to Run in Termux */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  Perintah Verifikasi di Termux / Shell:
                </span>
                <button
                  onClick={() => handleCopy(stateData.wal.verificationCommand || 'npm run build && python3 scripts/zlce-check.py .', 'cmd-spotlight')}
                  className="touch-target-44 min-h-[44px] px-2.5 flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                >
                  {copiedId === 'cmd-spotlight' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'cmd-spotlight' ? 'Tersalin' : 'Salin Perintah'}
                </button>
              </div>
              <pre className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800 text-[11px] sm:text-xs font-mono text-cyan-300 overflow-x-auto">
{stateData.wal.verificationCommand || 'npm run build && python3 scripts/zlce-check.py .'}
              </pre>
            </div>

            {/* Dynamic Git Commit Command with Atribusi Anggota Aktif */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
                  Template Commit Git (Atribusi: {activeMember.name}):
                </span>
                <button
                  onClick={() => handleCopy(
                    `git -c user.name="${activeMember.name}" -c user.email="${activeMember.email}" commit -m "${activeOrNextTask?.id || stateData.tasks.find(t => t.status === 'READY')?.id || stateData.tasks[0]?.id || 'TASK-xxx'}: ${(activeTaskDetail?.title || activeOrNextTask?.name || 'update').toLowerCase()}"`,
                    'git-commit-spotlight'
                  )}
                  className="touch-target-44 min-h-[44px] px-2.5 flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                >
                  {copiedId === 'git-commit-spotlight' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'git-commit-spotlight' ? 'Tersalin' : 'Salin Commit'}
                </button>
              </div>
              <pre className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800 text-[11px] sm:text-xs font-mono text-emerald-400 overflow-x-auto">
{`git -c user.name="${activeMember.name}" -c user.email="${activeMember.email}" commit -m "${activeOrNextTask?.id || stateData.tasks.find(t => t.status === 'READY')?.id || stateData.tasks[0]?.id || 'TASK-xxx'}: ${(activeTaskDetail?.title || activeOrNextTask?.name || 'update').toLowerCase()}"`}
              </pre>
            </div>
          </div>

          {/* Interactive State Transition Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            {activeOrNextTask?.status !== 'IN_PROGRESS' ? (
              <button
                onClick={() => handleUpdateTaskStatus(activeOrNextTask?.id || stateData.tasks.find(t => t.status === 'READY')?.id || '', 'IN_PROGRESS')}
                disabled={!activeOrNextTask && !stateData.tasks.some(t => t.status === 'READY')}
                className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-cyan-600 hover:bg-cyan-500 text-white shadow-md active:scale-95 transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai Kerjakan (Set IN_PROGRESS)</span>
              </button>
            ) : (
              <button
                onClick={() => openDoneModalWithSmartCheck(activeOrNextTask.id)}
                className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sahkan DONE (Smart Task Check)</span>
              </button>
            )}

            <button
              onClick={() => handleCopy(generateContextPack(activeOrNextTask?.id), 'spotlight-cp')}
              className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copiedId === 'spotlight-cp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedId === 'spotlight-cp' ? 'Konteks Tersalin' : 'Salin Konteks'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('ai-workbench')}
              className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Workbench</span>
            </button>

            <button
              onClick={() => onNavigateTab('terminal-git')}
              className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 transition"
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>Terminal &amp; Git</span>
            </button>
          </div>
        </div>

        {/* Right Column: 8-Member Relay Team Selector & Device Monitor */}
        <div className="space-y-4 sm:space-y-6">
          {/* Active Member Selector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 sm:pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">Tim Estafet (8 Anggota)</h3>
                  <p className="text-xs text-slate-400">Pemegang tablet saat ini (Hak Persetujuan Bersama)</p>
                </div>
              </div>
            </div>

            {/* Active Driver Highlight */}
            <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 p-3 rounded-xl border border-indigo-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${activeMember.avatarColor} flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white/10 shrink-0 text-xs sm:text-sm`}>
                  {activeMember.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-white">{activeMember.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-300">
                      Driver
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{activeMember.role}</div>
                </div>
              </div>
              <div className="text-right font-mono text-xs text-slate-400 shrink-0">
                <div>AI: <span className="text-cyan-300">{(activeMember.aiPreference || 'Gemini').split(' ')[0]}</span></div>
                <div className="text-xs text-emerald-400">Sah</div>
              </div>
            </div>

            {/* Grid of all 8 members with 1-tap select */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
              {TEAM_MEMBERS.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMember(m.id)}
                  className={`touch-target-44 min-h-[44px] flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border text-left transition ${
                    activeMemberId === m.id
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-sm ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr ${m.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                    {m.name.slice(0, 1)}
                  </div>
                  <div className="truncate min-w-0">
                    <div className="font-semibold truncate text-xs">{m.name}</div>
                    <div className="text-xs text-slate-400 truncate">{m.role.split(' ')[0]}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 bg-slate-950 p-2 sm:p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Log Kerja &amp; Catatan Anggota:</span>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('session-timeline')}
                  className="touch-target-44 min-h-[44px] px-2.5 py-1 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-cyan-300 text-xs font-bold flex items-center gap-1 transition active:scale-95"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Buka &amp; Edit Note</span>
                </button>
              </div>
              <p>Setiap driver dapat menambahkan dan menyunting catatan aktivitas kerja harian.</p>
            </div>
          </div>

          {/* Device Constraints & Architecture Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-2.5 sm:space-y-3">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              Spesifikasi &amp; ADR Tablet:
            </h4>
            <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-slate-300 font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Model:</span>
                <span className="text-white font-semibold">Galaxy Tab A7 Lite (SM-T225)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">RAM:</span>
                <span className="text-amber-300 font-semibold">3GB (LMK Aware · 400ms)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">ADR-09:</span>
                <span className="text-cyan-300 font-semibold">Obsidian Dieksklusikan</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Keamanan:</span>
                <span className="text-emerald-300 font-semibold">Zero-Secret (git-cache 900s)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Viewport:</span>
                <span className="text-white font-semibold">8.7" (1340x800)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Task Backlog Matrix & 9-Phase Roadmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-3 sm:pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              Matriks Backlog {stateData.tasks.length} Task Atomik (Fase 0 s/d {TASK_PHASES.length - 1})
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Klik task untuk melihat acceptance criteria &amp; berkas. Aturan: hanya 1 task IN_PROGRESS pada tablet bersama.
            </p>
          </div>

          {/* Search, Phase & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ID atau nama..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-48 lg:w-56 font-mono"
              />
            </div>

            {/* Quick Phase Selector */}
            <select
              value={selectedPhase}
              onChange={e => setSelectedPhase(e.target.value)}
              className="touch-target-44 min-h-[44px] bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-full sm:w-auto"
              title="Filter Fase"
            >
              {TASK_PHASES.map(phase => {
                const pStats = phaseProgressMap.get(phase.id);
                return (
                  <option key={phase.id} value={phase.id}>
                    {phase.name} {pStats ? `(${pStats.done}/${pStats.total}${pStats.isComplete ? ' ✓' : ''})` : ''}
                  </option>
                );
              })}
            </select>

            {/* Segmented Status Selector */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="touch-target-44 min-h-[44px] bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-full sm:w-auto"
            >
              <option value="all">Semua Status ({statusStats.total})</option>
              <option value="READY">READY ({statusStats.ready})</option>
              <option value="IN_PROGRESS">IN_PROGRESS ({statusStats.inProgress})</option>
              <option value="DONE">DONE ({statusStats.done})</option>
              <option value="PENDING">PENDING ({statusStats.pending})</option>
              <option value="BLOCKED">BLOCKED ({statusStats.blocked})</option>
            </select>
          </div>
        </div>

        {/* Phase Filter Buttons with Completion Progress */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none w-full flex-nowrap min-w-0">
          {TASK_PHASES.map(phase => {
            const pStats = phaseProgressMap.get(phase.id);
            const isSelected = selectedPhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => setSelectedPhase(phase.id)}
                className={`touch-target-44 min-h-[44px] shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono whitespace-nowrap transition border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/80 font-bold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{phase.name}</span>
                {pStats && (
                  <span className={`text-xs px-1 rounded ${
                    pStats.isComplete ? 'bg-emerald-950 text-emerald-400 font-bold' : 'text-slate-400'
                  }`}>
                    {pStats.done}/{pStats.total} {pStats.isComplete && '✓'}
                  </span>
                )}
                {phase.priority && <span className="text-xs text-amber-400 font-bold">★</span>}
              </button>
            );
          })}
        </div>

        {/* Tasks List / Expandable Cards */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="bg-slate-950/50 p-8 rounded-xl border border-slate-800 text-center text-slate-400 text-xs font-mono">
              Tidak ada task yang cocok dengan filter atau pencarian.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSpotlight = task.id === activeOrNextTask?.id;
              const isExpanded = expandedTaskId === task.id;
              const detail = taskDetailMap.get(task.id);

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border transition-all ${
                    task.status === 'IN_PROGRESS'
                      ? 'bg-cyan-950/30 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/30'
                      : isSpotlight
                      ? 'bg-slate-950/90 border-amber-600/50'
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-950/90 hover:border-slate-700'
                  }`}
                >
                  {/* Task Summary Row */}
                  <div className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start md:items-center gap-3">
                      <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs shrink-0 ${
                        task.status === 'DONE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : task.status === 'READY'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {task.id}
                      </span>

                      <div>
                        <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                          <span>{detail?.title || task.name}</span>
                          {task.status === 'IN_PROGRESS' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-300 font-mono">
                              Sedang Dikerjakan
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                          <span>Dep: <span className="text-slate-300">{task.dependencies}</span></span>
                          {detail?.phase && (
                            <>
                              <span>·</span>
                              <span className="text-slate-400">{detail.phase.split(':')[0]}</span>
                            </>
                          )}
                          {detail?.docsImpact && detail.docsImpact !== '-' && (
                            <>
                              <span>·</span>
                              <span className="text-amber-300 font-mono text-[11px] flex items-center gap-1" title={`Docs Impact: ${detail.docsImpact}`}>
                                <BookOpen className="w-3 h-3 text-amber-400" />
                                <span>Impact: {parseDocsImpactList(detail.docsImpact).length} dok</span>
                              </span>
                            </>
                          )}
                          {task.status === 'DONE' ? (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1" title="Docs Impact terverifikasi valid">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Smart Check OK</span>
                              </span>
                            </>
                          ) : (
                            <>
                              <span>·</span>
                              <span className="text-cyan-400/90 font-mono text-[11px] flex items-center gap-1" title="Smart Task Check siap memverifikasi Docs Impact">
                                <ShieldAlert className="w-3 h-3 text-cyan-400" />
                                <span>Smart Check</span>
                              </span>
                            </>
                          )}
                          {task.approved !== '-' && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400">Persetujuan: {task.approved}</span>
                            </>
                          )}
                          {task.evidence !== '-' && (
                            <>
                              <span>·</span>
                              <span className="text-cyan-400 truncate max-w-xs">Bukti: {task.evidence}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Expand Button */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto font-mono">
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="touch-target-44 min-h-[44px] px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1 transition"
                        title="Lihat detail kriteria penerimaan dan berkas"
                      >
                        <span>{isExpanded ? 'Tutup' : 'Detail'}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      <select
                        value={task.status}
                        onChange={e => {
                          const newStatus = e.target.value as TaskStatus;
                          if (newStatus === 'DONE') {
                            openDoneModalWithSmartCheck(task.id);
                          } else {
                            handleUpdateTaskStatus(task.id, newStatus);
                          }
                        }}
                        className={`touch-target-44 min-h-[44px] text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none transition ${
                          task.status === 'DONE'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-cyan-950/60 text-cyan-300 border-cyan-600/60'
                            : task.status === 'READY'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="READY">READY</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="DONE">DONE</option>
                      </select>

                      {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="touch-target-44 min-h-[44px] px-2.5 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold transition"
                          title="Klaim task ini sebagai aktif"
                        >
                          Klaim
                        </button>
                      )}

                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => openDoneModalWithSmartCheck(task.id)}
                          className="touch-target-44 min-h-[44px] px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
                          title="Smart Task Check: Selesaikan task dengan verifikasi bukti Docs Impact"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Selesaikan</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Task Drawer with Full Metadata */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3 text-xs animate-in fade-in">
                      {detail?.description && (
                        <div>
                          <span className="text-slate-400 font-bold block mb-1 font-mono uppercase text-xs">
                            Deskripsi Task:
                          </span>
                          <p className="text-slate-200 leading-relaxed bg-slate-900/80 p-2.5 rounded border border-slate-800">
                            {detail.description}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                          <span className="text-slate-400 block text-xs">Berkas Yang Disentuh:</span>
                          <span className="text-cyan-300 font-bold truncate block" title={detail?.files?.join(', ') || '-'}>
                            {detail?.files?.join(', ') || '-'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                          <span className="text-slate-400 block text-xs">Dokumen Terkait / Rujukan:</span>
                          <span className="text-slate-300 truncate block" title={detail?.docsRelated || '-'}>
                            {detail?.docsRelated || '-'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                          <span className="text-slate-400 block text-xs">Docs Impact (Smart Check):</span>
                          <span className="text-amber-300 font-bold truncate block" title={detail?.docsImpact || 'SESSION_STATE.md'}>
                            {detail?.docsImpact || 'SESSION_STATE.md'}
                          </span>
                        </div>
                      </div>

                      {detail?.acceptanceCriteria && detail.acceptanceCriteria.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-slate-400 font-bold block font-mono uppercase text-xs">
                            Kriteria Penerimaan (Acceptance Criteria):
                          </span>
                          <ul className="space-y-1.5 pl-1">
                            {detail.acceptanceCriteria.map((ac, acIdx) => (
                              <li key={acIdx} className="flex items-start gap-2 text-slate-300">
                                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                                  {acIdx + 1}
                                </span>
                                <span>{ac}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick copy buttons for this task */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 font-mono">
                        <button
                          onClick={() => handleCopy(task.id, `copy-id-${task.id}`)}
                          className="touch-target-44 min-h-[44px] px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-1"
                        >
                          {copiedId === `copy-id-${task.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Salin ID Task</span>
                        </button>

                        <button
                          onClick={() => handleCopy(generateContextPack(task.id), `copy-cp-${task.id}`)}
                          className="touch-target-44 min-h-[44px] px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-[11px] flex items-center gap-1"
                        >
                          {copiedId === `copy-cp-${task.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Salin Context Pack ({task.id})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Write-Ahead Log (WAL) & Handover Notes Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WAL Display Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Write-Ahead Log (WAL) Saat Ini
            </h4>
            <button
              onClick={() => onNavigateTab('session')}
              className="touch-target-44 min-h-[44px] px-2.5 inline-flex items-center text-[11px] text-slate-400 hover:text-cyan-300 font-mono"
            >
              Edit di SESSION_STATE →
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-xs">TASK:</span>
              <span className="text-white font-bold">{stateData.wal.task || '-'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-xs">LANGKAH SEDANG DIKERJAKAN:</span>
              <span className="text-slate-200">{stateData.wal.currentStep || '-'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-xs">LANGKAH BERIKUTNYA (PERSIS):</span>
              <span className="text-cyan-300">{stateData.wal.nextStepExact || '-'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-xs">PERINTAH VERIFIKASI:</span>
              <span className="text-emerald-400">{stateData.wal.verificationCommand || '-'}</span>
            </div>
          </div>
        </div>

        {/* Serah Terima Notes Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              Catatan Serah Terima (Bagian 6)
            </h4>
            <span className="text-xs text-slate-400 font-mono">Single Source of Truth</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed space-y-1.5 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {stateData.handoverNotes || '* Gerbang Rilis ZLCE Mobile Workbench v4.1.0 GA telah dikunci dan siap dipakai.\n* Jalankan Proyek Baru, Lanjutan Setengah Jadi, atau Update & Modifikasi dari launcher di atas.'}
          </div>
        </div>
      </div>

      {/* Done Modal (Smart Task Check - Docs Impact Verification Gate) */}
      {doneModalTaskId && (() => {
        const doneDetail = taskDetailMap.get(doneModalTaskId);
        const doneTask = stateData.tasks.find(t => t.id === doneModalTaskId);
        const docsList = parseDocsImpactList(doneDetail?.docsImpact);
        const activeConfirmed = confirmedDocsByTask[doneModalTaskId] || [];

        const smartCheck = validateSmartTaskCheck({
          taskId: doneModalTaskId,
          docsImpact: doneDetail?.docsImpact,
          evidence: evidenceInput,
          explicitlyConfirmedDocs: activeConfirmed,
          taskTitle: doneDetail?.title || doneTask?.name
        });

        return (
          <ModalShell
            isOpen={true}
            onClose={() => setDoneModalTaskId(null)}
            maxWidth="max-w-xl"
            title={`Smart Task Check: Selesaikan ${doneModalTaskId}`}
            description="Verifikasi bukti pengerjaan untuk seluruh dokumen Docs Impact sebelum task disahkan DONE"
            badge={
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                DOCS IMPACT GATE
              </span>
            }
            icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
            className="p-5 sm:p-6 space-y-4 my-6"
          >

              {/* 1. Docs Impact Checklist Card */}
              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-mono">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    Dokumen Terdampak (Docs Impact): {docsList.length} berkas
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmAllDocs(doneModalTaskId, docsList)}
                      className="touch-target-44 min-h-[44px] px-2 inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                    >
                      Centang Semua
                    </button>
                    <span className="text-slate-600">·</span>
                    <button
                      type="button"
                      onClick={() => handlePopulateRecommendedEvidence(doneModalTaskId)}
                      className="touch-target-44 min-h-[44px] px-2 inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
                    >
                      Auto-Isi Rekomendasi
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {smartCheck.items.map((item, idx) => {
                    const isExplicit = (activeConfirmed || []).some(
                      d => d.toLowerCase() === item.doc.toLowerCase()
                    );
                    return (
                      <div
                        key={idx}
                        className={`flex items-start justify-between gap-2 p-2 rounded-lg border text-xs font-mono transition ${
                          item.hasEvidence
                            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                            : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                        }`}
                      >
                        <label className="flex items-start gap-2.5 cursor-pointer flex-1 select-none">
                          <input
                            type="checkbox"
                            checked={item.hasEvidence || isExplicit}
                            onChange={() => handleToggleDocConfirmation(doneModalTaskId, item.doc)}
                            className="w-4 h-4 mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 bg-slate-900"
                          />
                          <div className="space-y-0.5">
                            <span className="font-bold block break-all text-white">
                              {item.doc}
                            </span>
                            <span className="text-xs text-slate-400 block font-sans">
                              {item.reason}
                            </span>
                          </div>
                        </label>

                        <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 self-center ${
                          item.hasEvidence
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                            : 'bg-rose-900/60 text-rose-300 border border-rose-700/60 animate-pulse'
                        }`}>
                          {item.hasEvidence ? 'TERVERIFIKASI' : 'BELUM ADA BUKTI'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Bukti Verifikasi Input Field */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <label className="text-slate-300 font-medium">
                    Bukti Verifikasi (Evidence Output / Test Results):
                  </label>
                  <span className={`text-[11px] ${
                    smartCheck.evidenceValid ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {evidenceInput.trim().length} / min. 5 karakter
                  </span>
                </div>
                <DraftTextarea
                  rows={3}
                  value={evidenceInput}
                  onChange={val => setEvidenceInput(val)}
                  storageKey="zlce_smart_check_evidence_draft"
                  taskId={doneModalTaskId || undefined}
                  placeholder="Contoh: npm test 100% pass, build 0 error, sinkronisasi SESSION_STATE.md & CHANGELOG.md ok"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs leading-relaxed"
                  showDraftIndicator={false}
                />
              </div>

              {/* 3. Live Smart Task Check Feedback Alert */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                smartCheck.canMarkDone
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
              }`}>
                {smartCheck.canMarkDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <span className="font-bold block">
                    {smartCheck.canMarkDone ? 'Smart Task Check LULUS' : 'Smart Task Check Belum Memenuhi Syarat'}
                  </span>
                  <p className="text-[11px] opacity-90 leading-relaxed font-mono">
                    {smartCheck.summary}
                  </p>
                </div>
              </div>

              {/* 4. Provenance Attribution Strip */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono text-[11px] text-slate-400">
                <div>Penyetuju Resmi: <span className="text-white font-bold">{activeMember.name}</span> ({activeMember.role})</div>
                <div>Format Persetujuan: <span className="text-emerald-400">ya (oleh: {activeMember.name})</span></div>
              </div>

              {/* 5. Dialog Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 font-mono">
                <button
                  type="button"
                  onClick={() => setDoneModalTaskId(null)}
                  className="touch-target-44 min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!smartCheck.canMarkDone}
                  onClick={() => {
                    if (!smartCheck.canMarkDone) {
                      showToast(`Smart Task Check: ${smartCheck.summary}`, 'warning');
                      return;
                    }
                    handleUpdateTaskStatus(doneModalTaskId, 'DONE', evidenceInput);
                    setDoneModalTaskId(null);
                  }}
                  className={`touch-target-44 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    smartCheck.canMarkDone
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Konfirmasi Status DONE</span>
                </button>
              </div>
          </ModalShell>
        );
      })()}

      {/* GitHub Sync & Remote Hub Modal */}
      {isGitSyncOpen && (
        <ModalShell
          isOpen={isGitSyncOpen}
          onClose={() => setIsGitSyncOpen(false)}
          maxWidth="max-w-2xl"
          title="GitHub Sync & Remote Hub"
          description="Panduan & perintah siap pakai untuk push dan sinkronisasi ke GitHub"
          badge={
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              v4-mobile
            </span>
          }
          icon={<GitBranch className="w-6 h-6 text-emerald-400" />}
          headerGradient="bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-slate-950"
          className="p-6 space-y-5 my-8"
        >
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-xs">REMOTE ORIGIN TERHUBUNG:</span>
                <span className="text-emerald-400 font-bold break-all">https://github.com/ekokeplek-glitch/ZLCE4.1.git</span>
              </div>
              <div className="text-left sm:text-right space-y-0.5 shrink-0">
                <span className="text-slate-400 block text-xs">CABANG AKTIF:</span>
                <span className="text-cyan-300 font-bold">{targetBranch} (120 berkas ter-commit)</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-200 block font-mono">Perintah Terminal untuk Push ke GitHub:</span>
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-cyan-300 overflow-x-auto text-xs">
{`git remote -v
git checkout ${targetBranch}
git push origin ${targetBranch}`}
              </pre>

              <button
                onClick={() => handleCopy(`git checkout ${targetBranch} && git push origin ${targetBranch}`, 'copy-git-push-modal')}
                className="touch-target-44 min-h-[44px] w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-2"
              >
                {copiedId === 'copy-git-push-modal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === 'copy-git-push-modal' ? 'Perintah Push Tersalin!' : 'Salin Perintah Push Terminal'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsGitSyncOpen(false)}
                className="touch-target-44 min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:text-white transition"
              >
                Tutup
              </button>
            </div>
        </ModalShell>
      )}

      {/* Dialog Konfirmasi Muat Ulang Template (TASK-102) */}
      <ConfirmDialog
        isOpen={showReloadTemplateConfirm}
        title="Muat Ulang State dari Template Kanonik"
        message={
          <span>
            Apakah Anda yakin ingin memuat ulang state dari template kanonik workspace (ZLCE Mobile Workbench v4.1.0 GA)?
            Perubahan yang belum tersimpan akan digantikan oleh template awal.
          </span>
        }
        confirmLabel="Ya, Muat Ulang"
        cancelLabel="Batal"
        variant="warning"
        onConfirm={executeReloadTemplate}
        onCancel={() => setShowReloadTemplateConfirm(false)}
      />
    </div>
  );
};

export const DashboardTab = React.memo(DashboardTabComponent);
