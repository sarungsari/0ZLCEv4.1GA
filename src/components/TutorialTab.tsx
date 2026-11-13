import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  FolderGit2,
  Check,
  Copy,
  ArrowRight,
  ArrowRightLeft,
  Terminal,
  Layers,
  RefreshCw,
  Play,
  Sparkles,
  ShieldCheck,
  Download,
  Zap,
  Sliders,
  Server,
  Smartphone,
  CheckSquare,
  Square,
  ExternalLink
} from 'lucide-react';
import { copyText } from '../utils/clipboard';
import {
  CANONICAL_USAGE_GUIDE_MD,
  CURRENT_PROJECT_TASKS_MD,
  INSTALLATION_ANDROID_MD,
  USAGE_MOBILE_MD,
  MOBILE_BLUEPRINT_MD,
  TERMUX_SETUP_MD,
  PRODUCTION_OPERATIONS_MD,
  INITIAL_SESSION_STATE_MD,
  LANDING_PROMPT_MD,
  HANDOVER_PROMPT_MD,
  AI_WORKFLOW_MD
} from '../data/templates';
import { parseTasksMarkdown, parseSessionStateMarkdown } from '../utils/markdownParser';
import { ParsedSessionState, TabType, ParsedBacklogTask } from '../types/zlce';
import { TargetAIProvider } from '../utils/contextPackGenerator';
import { TEAM_MEMBERS } from '../data/teamMembers';
import { generateRelayHandover } from '../utils/relayHandoverGenerator';
import { downloadMarkdownBlob, generateAndDownloadZipBundle } from '../utils/fileExport';

export type ViewMode =
  | 'android-installation'
  | 'mobile-usage'
  | 'project-architecture'
  | 'ai-handover-claude-gpt'
  | 'production-operations'
  | 'canonical-usage'
  | 'interactive-scenarios'
  | 'prompt-catalog';

type ScenarioType = 'new-project' | 'existing-project' | 'in-progress';

export interface TutorialTabProps {
  sessionState?: ParsedSessionState;
  onNavigateTab?: (tab: TabType) => void;
  initialTaskId?: string;
}

interface ParsedMarkdownSection {
  id: string;
  number: number;
  title: string;
  rawBody: string;
  summaryParagraphs: string[];
  listItems: string[];
  codeBlocks: { lang: string; code: string }[];
  tables: { headers: string[]; rows: string[][] }[];
  links: { label: string; url: string }[];
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

function parseMarkdownSections(md: string, headingRegex: RegExp): ParsedMarkdownSection[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const rawSections: { title: string; num: number; lines: string[] }[] = [];
  let current: { title: string; num: number; lines: string[] } | null = null;
  let inCode = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
    }
    if (!inCode) {
      const match = line.match(headingRegex);
      if (match) {
        if (current) rawSections.push(current);
        const parsedNum = match[1] !== undefined && match[1] !== '' ? Number(match[1]) : NaN;
        const num = !Number.isNaN(parsedNum) ? parsedNum : rawSections.length + 1;
        const title = stripInlineMarkdown(match[2] || match[0].replace(/^#+\s*/, ''));
        current = { title, num, lines: [] };
        continue;
      }
    }
    if (current) {
      current.lines.push(line);
    }
  }
  if (current) rawSections.push(current);

  return rawSections.map((sec, idx) => {
    const codeBlocks: { lang: string; code: string }[] = [];
    const tables: { headers: string[]; rows: string[][] }[] = [];
    const summaryParagraphs: string[] = [];
    const listItems: string[] = [];
    const links: { label: string; url: string }[] = [];

    let i = 0;
    while (i < sec.lines.length) {
      const raw = sec.lines[i];
      const trimmed = raw.trim();

      // Fenced code block
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim() || 'text';
        const codeLines: string[] = [];
        i++;
        while (i < sec.lines.length && !sec.lines[i].trim().startsWith('```')) {
          codeLines.push(sec.lines[i]);
          i++;
        }
        const code = codeLines.join('\n').trim();
        if (code && lang !== 'text') {
          codeBlocks.push({ lang, code });
        } else if (code && lang === 'text' && codeBlocks.length === 0 && !code.includes('│')) {
          codeBlocks.push({ lang, code });
        }
        i++;
        continue;
      }

      // Markdown table
      if (trimmed.startsWith('|') && i + 1 < sec.lines.length && sec.lines[i + 1].trim().startsWith('|') && sec.lines[i + 1].includes('---')) {
        const parseRow = (rowLine: string) =>
          rowLine
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map(c => stripInlineMarkdown(c.trim()));

        const headers = parseRow(trimmed);
        i += 2; // skip header and separator
        const rows: string[][] = [];
        while (i < sec.lines.length && sec.lines[i].trim().startsWith('|')) {
          rows.push(parseRow(sec.lines[i]));
          i++;
        }
        tables.push({ headers, rows });
        continue;
      }

      // Extract HTTPS URLs cleanly
      const urlMatches = trimmed.match(/https:\/\/[^\s)`>]+/g);
      if (urlMatches) {
        for (const url of urlMatches) {
          if (!links.some(l => l.url === url)) {
            links.push({ label: url.replace(/^https?:\/\//, ''), url });
          }
        }
      }

      // List items, subheadings, or paragraphs
      if (/^(\d+\.|[-*])\s+/.test(trimmed)) {
        const cleaned = stripInlineMarkdown(trimmed.replace(/^(\d+\.|[-*])\s+/, ''));
        if (cleaned) listItems.push(cleaned);
      } else if (trimmed.startsWith('###')) {
        const cleanedSub = stripInlineMarkdown(trimmed.replace(/^#{3,6}\s*/, ''));
        if (cleanedSub) listItems.push(`▸ ${cleanedSub}`);
      } else if (trimmed && trimmed !== '---' && !trimmed.startsWith('>')) {
        const cleaned = stripInlineMarkdown(trimmed);
        if (cleaned && summaryParagraphs.length < 6) {
          summaryParagraphs.push(cleaned);
        }
      } else if (trimmed.startsWith('>')) {
        const cleaned = stripInlineMarkdown(trimmed.replace(/^>+\s*/, ''));
        if (cleaned && summaryParagraphs.length < 6) {
          summaryParagraphs.push(cleaned);
        }
      }
      i++;
    }

    return {
      id: `sec-${idx + 1}`,
      number: sec.num,
      title: sec.title,
      rawBody: sec.lines.join('\n').trim(),
      summaryParagraphs,
      listItems,
      codeBlocks,
      tables,
      links
    };
  });
}

function extractFencedPrompt(md: string, preferredLang = 'markdown'): string {
  const regex = new RegExp('```' + preferredLang + '\\n([\\s\\S]*?)\\n```', 'm');
  const match = md.match(regex);
  if (match && match[1]) return match[1].trim();
  const fallback = md.match(/```[a-z]*\n([\s\S]*?)\n```/m);
  return fallback?.[1]?.trim() || md.trim();
}

export const TutorialTab: React.FC<TutorialTabProps> = ({
  sessionState: propSessionState,
  onNavigateTab,
  initialTaskId
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('android-installation');
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('new-project');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [completedInstallSteps, setCompletedInstallSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('zlce_install_checklist_steps');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  const toggleInstallStep = (stepNumber: number) => {
    setCompletedInstallSteps(prev => {
      const updated = prev.includes(stepNumber)
        ? prev.filter(s => s !== stepNumber)
        : [...prev, stepNumber];
      try {
        localStorage.setItem('zlce_install_checklist_steps', JSON.stringify(updated));
      } catch (err) {
        console.warn('[TutorialTab] Gagal menyimpan checklist instalasi:', err);
      }
      return updated;
    });
  };

  const handleDownloadDoc = (content: string, filename: string) => {
    downloadMarkdownBlob(content, { filename });
  };

  const copyToClipboard = async (text: string, id: string) => {
    const success = await copyText(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const sessionState = useMemo<ParsedSessionState>(() => {
    if (propSessionState) return propSessionState;
    return parseSessionStateMarkdown(INITIAL_SESSION_STATE_MD);
  }, [propSessionState]);

  const defaultTask = useMemo(() => {
    if (initialTaskId) return initialTaskId;
    if (sessionState.status.nextTask && sessionState.status.nextTask.startsWith('TASK-')) {
      return sessionState.status.nextTask;
    }
    const readyTask = sessionState.tasks.find(t => t.status === 'READY');
    if (readyTask) return readyTask.id;
    const activeTask = sessionState.tasks.find(t => t.status === 'IN_PROGRESS');
    if (activeTask) return activeTask.id;
    return sessionState.tasks[sessionState.tasks.length - 1]?.id || 'TASK-001';
  }, [initialTaskId, sessionState]);

  const [selectedTaskId, setSelectedTaskId] = useState<string>(defaultTask);
  const [selectedAiProvider, setSelectedAiProvider] = useState<TargetAIProvider>('claude');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    try {
      return localStorage.getItem('zlce_active_member_id') || 'member-01';
    } catch {
      return 'member-01';
    }
  });
  const [handoverMode, setHandoverMode] = useState<'direct-execution' | 'cidi-handover'>('direct-execution');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');
  const [taskSearch, setTaskSearch] = useState<string>('');

  const activeDriver = useMemo(() => {
    return TEAM_MEMBERS.find(m => m.id === selectedDriverId) || TEAM_MEMBERS[0];
  }, [selectedDriverId]);

  const taskDetailMap = useMemo(() => {
    const parsed = parseTasksMarkdown(CURRENT_PROJECT_TASKS_MD);
    const map = new Map<string, ParsedBacklogTask>();
    parsed.tasks.forEach(t => map.set(t.id, t));
    return map;
  }, []);

  const availablePhases = useMemo(() => {
    const set = new Set<string>();
    taskDetailMap.forEach(t => {
      if (t.phase) set.add(t.phase);
    });
    const list = Array.from(set);
    return ['ALL', ...list.slice(-5)];
  }, [taskDetailMap]);

  const relayOutput = useMemo(() => {
    return generateRelayHandover({
      taskId: selectedTaskId,
      aiProvider: selectedAiProvider,
      activeMember: activeDriver,
      sessionState,
      handoverMode,
      taskDetailMap
    });
  }, [selectedTaskId, selectedAiProvider, activeDriver, sessionState, handoverMode, taskDetailMap]);

  const filteredTasks = useMemo(() => {
    return sessionState.tasks.filter(t => {
      const detail = taskDetailMap.get(t.id);
      const matchesPhase = phaseFilter === 'ALL' || detail?.phase === phaseFilter;
      const matchesSearch =
        !taskSearch.trim() ||
        t.id.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
        (detail?.title && detail.title.toLowerCase().includes(taskSearch.toLowerCase()));
      return matchesPhase && matchesSearch;
    });
  }, [sessionState.tasks, taskDetailMap, phaseFilter, taskSearch]);

  // Derived Canonical Markdown Parsings (Single Source of Truth)
  const installSteps = useMemo(
    () => parseMarkdownSections(INSTALLATION_ANDROID_MD, /^##\s+LANGKAH\s+(\d+):\s*(.+)$/i),
    []
  );
  const mobileUsageSteps = useMemo(
    () => parseMarkdownSections(USAGE_MOBILE_MD, /^###\s+LANGKAH\s+(\d+):\s*(.+)$/i),
    []
  );
  const blueprintSections = useMemo(
    () => parseMarkdownSections(MOBILE_BLUEPRINT_MD, /^##\s+(\d+)\.\s+(.+)$/),
    []
  );
  const usageGuideSections = useMemo(
    () => parseMarkdownSections(CANONICAL_USAGE_GUIDE_MD, /^##\s+(\d+)\.\s+(.+)$/),
    []
  );
  const prodOpsSections = useMemo(
    () => parseMarkdownSections(PRODUCTION_OPERATIONS_MD, /^##\s+(\d+)\.\s+(.+)$/),
    []
  );
  const termuxAliasesBlock = useMemo(() => extractFencedPrompt(TERMUX_SETUP_MD, 'bash'), []);
  const canonicalLandingPrompt = useMemo(() => extractFencedPrompt(LANDING_PROMPT_MD, 'markdown'), []);
  const canonicalHandoverPrompt = useMemo(() => extractFencedPrompt(HANDOVER_PROMPT_MD, 'markdown'), []);
  const canonicalCheckpointBlock = useMemo(() => extractFencedPrompt(CANONICAL_USAGE_GUIDE_MD, 'markdown'), []);
  const canonicalSnapshotCommands = useMemo(
    () => `# Validasi state & ambil snapshot git + WAL untuk pemulihan\npython3 scripts/zlce/zlce-check.py .\nbash scripts/zlce/zlce-snapshot.sh --diff\ngit status --short && git log -5 --oneline`,
    []
  );

  const installTotal = installSteps.length || 8;
  const installProgressPct = Math.round((completedInstallSteps.length / installTotal) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Utama & Selektor 4 Pilar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight [text-wrap:balance]">
                Pusat Tutorial &amp; Dokumentasi ZLCE Mobile
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Seluruh panduan dirender langsung dari berkas Markdown kanonik repositori (<code className="text-emerald-300 font-mono">docs/mobile/*.md</code> &amp; <code className="text-cyan-300 font-mono">docs/USAGE.md</code>) · {sessionState.tasks.length} Task Terdaftar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDownloadDoc(INSTALLATION_ANDROID_MD, 'INSTALLATION_ANDROID.md')}
              className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono bg-slate-950 hover:bg-slate-800 border border-emerald-800/60 text-emerald-300 transition whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instalasi Android</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadDoc(USAGE_MOBILE_MD, 'USAGE_MOBILE.md')}
              className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono bg-slate-950 hover:bg-slate-800 border border-amber-800/60 text-amber-300 transition whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Pemakaian Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadDoc(MOBILE_BLUEPRINT_MD, 'MOBILE_BLUEPRINT.md')}
              className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono bg-slate-950 hover:bg-slate-800 border border-cyan-800/60 text-cyan-300 transition whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Blueprint</span>
            </button>
          </div>
        </div>

        {/* 4 Pilar Utama Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('android-installation')}
            className={`touch-target-44 min-h-[44px] flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
              viewMode === 'android-installation'
                ? 'bg-emerald-950/60 border-emerald-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${viewMode === 'android-installation' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono text-emerald-400 truncate">Pilar 2 · {installTotal} Langkah</div>
              <div className="text-sm font-bold text-slate-100 truncate">Instalasi Android</div>
              <div className="text-xs text-slate-400 truncate">Termux F-Droid ➔ PWA</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('mobile-usage')}
            className={`touch-target-44 min-h-[44px] flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
              viewMode === 'mobile-usage'
                ? 'bg-amber-950/60 border-amber-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${viewMode === 'mobile-usage' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
              <Play className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono text-amber-400 truncate">Pilar 3 · SOP {mobileUsageSteps.length || 10} Langkah</div>
              <div className="text-sm font-bold text-slate-100 truncate">Pemakaian Mobile</div>
              <div className="text-xs text-slate-400 truncate">Alur Estafet 8 Anggota</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('project-architecture')}
            className={`touch-target-44 min-h-[44px] flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
              viewMode === 'project-architecture'
                ? 'bg-purple-950/60 border-purple-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${viewMode === 'project-architecture' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono text-purple-400 truncate">Pilar 1 · 14 Blueprint</div>
              <div className="text-sm font-bold text-slate-100 truncate">Arsitektur Proyek</div>
              <div className="text-xs text-slate-400 truncate">Spesifikasi &amp; 9 ADR</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('ai-handover-claude-gpt')}
            className={`touch-target-44 min-h-[44px] flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
              viewMode === 'ai-handover-claude-gpt'
                ? 'bg-cyan-950/60 border-cyan-500 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${viewMode === 'ai-handover-claude-gpt' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono text-cyan-400 truncate">Estafet AI · Universal</div>
              <div className="text-sm font-bold text-slate-100 truncate">AI Handover Studio</div>
              <div className="text-xs text-slate-400 truncate">Generator Claude, GPT, Gemini</div>
            </div>
          </button>
        </div>

        {/* Navigasi Sekunder */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 font-mono mr-1">Referensi Kanonik:</span>
          {[
            { id: 'production-operations', label: 'Operasi Lapangan', activeCls: 'bg-slate-800 text-emerald-300 border-emerald-500/50' },
            { id: 'canonical-usage', label: 'USAGE.md Kanonik', activeCls: 'bg-slate-800 text-cyan-300 border-cyan-500/50' },
            { id: 'interactive-scenarios', label: '3 Skenario Siklus', activeCls: 'bg-slate-800 text-blue-300 border-blue-500/50' },
            { id: 'prompt-catalog', label: 'Katalog Prompt Paten', activeCls: 'bg-slate-800 text-indigo-300 border-indigo-500/50' }
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setViewMode(item.id as ViewMode)}
              className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg font-medium border transition whitespace-nowrap ${
                viewMode === item.id
                  ? item.activeCls
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: TUTORIAL INSTALASI ANDROID (SUMBER: docs/mobile/INSTALLATION_ANDROID.md) */}
      {viewMode === 'android-installation' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-emerald-400">
                  Pilar 2 · Sumber: docs/mobile/INSTALLATION_ANDROID.md · Samsung Tab A7 Lite &amp; Android
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Tutorial Instalasi Android dari Nol (Termux F-Droid ➔ PWA)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {installTotal} langkah berurutan dari persiapan perangkat, instalasi Termux F-Droid, setup Node/Python/Git, hingga pemasangan PWA standalone.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => copyToClipboard(INSTALLATION_ANDROID_MD, 'copy-install-android')}
                  className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-700/60 transition whitespace-nowrap"
                >
                  {copiedId === 'copy-install-android' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === 'copy-install-android' ? 'Tersalin!' : 'Salin .md'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(INSTALLATION_ANDROID_MD, 'INSTALLATION_ANDROID.md')}
                  className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Panduan</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  Progres Penyiapan Perangkat
                </span>
                <span className="font-mono tabular-nums text-emerald-400 font-bold">
                  {completedInstallSteps.length} / {installTotal} Langkah ({installProgressPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(100, installProgressPct)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {installSteps.map((step, idx) => {
              const isDone = completedInstallSteps.includes(step.number);
              return (
                <div
                  key={step.id}
                  className={`p-5 rounded-2xl border transition ${
                    isDone ? 'bg-slate-900 border-emerald-500/50' : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono tabular-nums font-bold flex items-center justify-center shrink-0">
                        {step.number}
                      </div>
                      <div className="space-y-2.5 flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white">{step.title}</h4>
                        {step.summaryParagraphs.map((p, pIdx) => (
                          <p key={pIdx} className="text-xs text-slate-300 leading-relaxed">
                            {p}
                          </p>
                        ))}
                        {step.listItems.length > 0 && (
                          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300 leading-relaxed">
                            {step.listItems.map((item, lIdx) => (
                              <li
                                key={lIdx}
                                className={item.startsWith('▸ ') ? 'list-none -ml-5 pt-1 font-semibold text-emerald-300' : ''}
                              >
                                {item.startsWith('▸ ') ? item.slice(2) : item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {step.links.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {step.links.map((lk, lkIdx) => (
                              <a
                                key={lkIdx}
                                href={lk.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 hover:text-cyan-200 font-mono text-xs inline-flex items-center gap-1.5"
                              >
                                <span>{lk.label}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ))}
                          </div>
                        )}
                        {step.codeBlocks.map((cb, cIdx) => {
                          const cKey = `inst-${step.number}-${cIdx}`;
                          return (
                            <div key={cKey} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                                <span className="font-mono">Perintah Termux ({cb.lang})</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(cb.code, cKey)}
                                  className="touch-target-44 min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1.5 whitespace-nowrap"
                                >
                                  {copiedId === cKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedId === cKey ? 'Tersalin' : 'Salin Perintah'}</span>
                                </button>
                              </div>
                              <pre className="p-2.5 rounded-lg bg-black/50 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                                {cb.code}
                              </pre>
                            </div>
                          );
                        })}
                        {idx === installSteps.length - 1 && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setViewMode('mobile-usage')}
                              className="touch-target-44 min-h-[44px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition"
                            >
                              <span>Lanjut ke Tutorial Pemakaian Mobile</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleInstallStep(step.number)}
                      className={`touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 whitespace-nowrap ${
                        isDone
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isDone ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                      <span>{isDone ? `Langkah ${step.number} Selesai` : 'Tandai Selesai'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: TUTORIAL PEMAKAIAN MOBILE (SUMBER: docs/mobile/USAGE_MOBILE.md) */}
      {viewMode === 'mobile-usage' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-amber-400">
                Pilar 3 · Sumber: docs/mobile/USAGE_MOBILE.md · 8 Anggota Tim · 1 Tablet Bersama
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Tutorial Pemakaian ZLCE Mobile &amp; SOP Estafet {mobileUsageSteps.length || 10} Langkah
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Siklus operasional harian dari menerima tablet, klaim task atomik, perakitan Context Pack, eksekusi AI, hingga handover &amp; clean-auth RAM.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(USAGE_MOBILE_MD, 'copy-usage-mobile')}
                className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-700/60 transition whitespace-nowrap"
              >
                {copiedId === 'copy-usage-mobile' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === 'copy-usage-mobile' ? 'Tersalin!' : 'Salin .md'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDoc(USAGE_MOBILE_MD, 'USAGE_MOBILE.md')}
                className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Unduh USAGE_MOBILE.md</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mobileUsageSteps.map(step => (
              <div key={step.id} className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono tabular-nums font-bold flex items-center justify-center text-xs shrink-0">
                    {String(step.number).padStart(2, '0')}
                  </div>
                  <h4 className="text-sm font-bold text-white">{step.title}</h4>
                </div>
                {step.listItems.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300 leading-relaxed">
                    {step.listItems.map((item, lIdx) => (
                      <li key={lIdx}>{item}</li>
                    ))}
                  </ul>
                )}
                {step.codeBlocks.map((cb, cIdx) => {
                  const key = `usage-${step.number}-${cIdx}`;
                  return (
                    <div key={key} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono">{cb.lang}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(cb.code, key)}
                          className="touch-target-44 min-h-[44px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs flex items-center gap-1"
                        >
                          {copiedId === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === key ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-emerald-300 overflow-x-auto">{cb.code}</pre>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: ARSITEKTUR PROYEK & CETAK BIRU (SUMBER: docs/mobile/MOBILE_BLUEPRINT.md) */}
      {viewMode === 'project-architecture' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-purple-400">
                Pilar 1 · Sumber: docs/mobile/MOBILE_BLUEPRINT.md · 14 Cetak Biru &amp; 9 ADR · {sessionState.tasks.length} Task
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Spesifikasi Arsitektur Proyek ZLCE Mobile Workbench
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Indeks cetak biru 4-lapisan PWA, ketahanan memori Loss-Bounded Persistence (RPO ≤ 400ms), kebijakan Zero-Secret, dan taksonomi multi-AI.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(MOBILE_BLUEPRINT_MD, 'copy-blueprint-md')}
                className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-700/60 transition whitespace-nowrap"
              >
                {copiedId === 'copy-blueprint-md' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === 'copy-blueprint-md' ? 'Tersalin!' : 'Salin .md'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDoc(MOBILE_BLUEPRINT_MD, 'MOBILE_BLUEPRINT.md')}
                className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Blueprint Master</span>
              </button>
            </div>
          </div>

          {blueprintSections.map(sec => (
            <div key={sec.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="font-mono tabular-nums text-purple-400">{String(sec.number).padStart(2, '0')}.</span>
                <span>{sec.title}</span>
              </h4>
              {sec.summaryParagraphs.map((p, idx) => (
                <p key={idx} className="text-xs text-slate-300 leading-relaxed">{p}</p>
              ))}
              {sec.listItems.length > 0 && (
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {sec.listItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
              {sec.tables.map((tbl, tIdx) => (
                <div key={tIdx} className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                        {tbl.headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-3 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {tbl.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`p-3 ${cIdx === 0 ? 'font-mono tabular-nums font-bold text-purple-300' : cIdx === 1 ? 'font-mono text-cyan-300' : ''}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* VIEW 4: OPERASI PRODUKSI LAPANGAN (SUMBER: PRODUCTION_OPERATIONS.md + teamMembers.ts) */}
      {viewMode === 'production-operations' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-emerald-400">
                  Sumber: docs/mobile/PRODUCTION_OPERATIONS.md · SM-T225 (RAM 3GB) · {sessionState.tasks.length} Task
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Operasional Produksi Nyata di Tablet Bersama
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Peluncuran server produksi Termux, kepatuhan 5 prinsip integritas ZLCE, dan identitas commit Zero-Secret untuk seluruh 8 anggota estafet.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href="/api/bundle/audit"
                  download="zlce-audit-review-bundle.zip"
                  className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Bundel Audit ZIP</span>
                </a>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('session')}
                    className="touch-target-44 min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition whitespace-nowrap"
                  >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Matriks {sessionState.tasks.length} Task</span>
                  </button>
                )}
              </div>
            </div>

            {termuxAliasesBlock && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="font-mono flex items-center gap-1.5 text-slate-200">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Snippet Setup ~/.bashrc (Sumber: docs/mobile/TERMUX_SETUP.md)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(termuxAliasesBlock, 'termux-bashrc')}
                    className="touch-target-44 min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {copiedId === 'termux-bashrc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'termux-bashrc' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-emerald-300 overflow-x-auto max-h-40 leading-relaxed">
                  {termuxAliasesBlock}
                </pre>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {prodOpsSections.map(sec => (
              <div key={sec.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sec.number}. {sec.title}</span>
                </h4>
                {sec.summaryParagraphs.map((p, idx) => (
                  <p key={idx} className="text-xs text-slate-300 leading-relaxed">{p}</p>
                ))}
                {sec.listItems.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300 leading-relaxed">
                    {sec.listItems.map((item, idx) => (
                      <li
                        key={idx}
                        className={item.startsWith('▸ ') ? 'list-none -ml-5 pt-1 font-semibold text-emerald-300' : ''}
                      >
                        {item.startsWith('▸ ') ? item.slice(2) : item}
                      </li>
                    ))}
                  </ul>
                )}
                {sec.tables.map((tbl, tIdx) => (
                  <div key={tIdx} className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                          {tbl.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-2.5 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {tbl.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={`p-2.5 ${cIdx === 0 ? 'font-mono font-bold text-emerald-300' : ''}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                {sec.codeBlocks.map((cb, cIdx) => {
                  const opsKey = `ops-${sec.number}-${cIdx}`;
                  return (
                    <div key={opsKey} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono">{cb.lang}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(cb.code, opsKey)}
                          className="touch-target-44 min-h-[44px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs flex items-center gap-1"
                        >
                          {copiedId === opsKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === opsKey ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-cyan-300 overflow-x-auto">{cb.code}</pre>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Identitas Driver Commit Zero-Secret dari TEAM_MEMBERS SSOT */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Identitas Driver Tablet Resmi (Zero-Secret Per-Commit Flags)</span>
              </h4>
              <span className="text-xs font-mono text-slate-400">{TEAM_MEMBERS.length} Profil Terdaftar</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {TEAM_MEMBERS.map(member => (
                <div key={member.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-100 truncate">{member.name}</span>
                    <span className="text-xs font-mono text-slate-400 shrink-0">@{member.id}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate">{member.email}</div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `git -c user.name="${member.name}" -c user.email="${member.email}" commit -m "wip: update"`,
                        `git-id-${member.id}`
                      )
                    }
                    className="touch-target-44 min-h-[44px] w-full py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedId === `git-id-${member.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === `git-id-${member.id}` ? 'Tersalin!' : 'Salin Flag Commit'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: USAGE.MD KANONIK (SUMBER: docs/USAGE.md) */}
      {viewMode === 'canonical-usage' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-cyan-400">Sumber: docs/USAGE.md</div>
              <h3 className="text-lg font-bold text-white">Panduan Penggunaan Metodologi ZLCE</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(CANONICAL_USAGE_GUIDE_MD, 'copy-usage-canon')}
                className="touch-target-44 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 flex items-center gap-1.5"
              >
                {copiedId === 'copy-usage-canon' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === 'copy-usage-canon' ? 'Tersalin' : 'Salin USAGE.md'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDoc(CANONICAL_USAGE_GUIDE_MD, 'USAGE.md')}
                className="touch-target-44 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh USAGE.md</span>
              </button>
            </div>
          </div>

          {usageGuideSections.map(sec => (
            <div key={sec.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-mono tabular-nums text-cyan-400">{sec.number}.</span>
                <span>{sec.title}</span>
              </h4>
              {sec.summaryParagraphs.map((p, idx) => (
                <p key={idx} className="text-xs text-slate-300 leading-relaxed">{p}</p>
              ))}
              {sec.listItems.length > 0 && (
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {sec.listItems.map((item, idx) => (
                    <li
                      key={idx}
                      className={item.startsWith('▸ ') ? 'list-none -ml-5 pt-1 font-semibold text-cyan-300' : ''}
                    >
                      {item.startsWith('▸ ') ? item.slice(2) : item}
                    </li>
                  ))}
                </ul>
              )}
              {sec.tables.map((tbl, tIdx) => (
                <div key={tIdx} className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                        {tbl.headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-3 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {tbl.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`p-3 ${cIdx === 0 ? 'font-semibold text-cyan-300' : ''}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              {sec.codeBlocks.map((cb, cIdx) => {
                const key = `canon-${sec.number}-${cIdx}`;
                return (
                  <div key={key} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono">{cb.lang}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(cb.code, key)}
                        className="touch-target-44 min-h-[44px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs flex items-center gap-1"
                      >
                        {copiedId === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === key ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">{cb.code}</pre>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* VIEW 6: 3 SKENARIO SIKLUS (SUMBER: LANDING_PROMPT.md & HANDOVER_PROMPT.md) */}
      {viewMode === 'interactive-scenarios' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'new-project', label: 'Skenario 1: Proyek Baru', icon: Sparkles },
              { id: 'existing-project', label: 'Skenario 2: Audit Proyek Lama', icon: RefreshCw },
              { id: 'in-progress', label: 'Skenario 3: Takeover & Recovery', icon: Layers }
            ].map(sc => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScenario(sc.id as ScenarioType)}
                  className={`touch-target-44 min-h-[44px] shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border whitespace-nowrap ${
                    activeScenario === sc.id
                      ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sc.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono text-cyan-400">
                  {activeScenario === 'in-progress'
                    ? 'Sumber Kanonik: HANDOVER_PROMPT.md + CLI Snapshot'
                    : 'Sumber Kanonik: LANDING_PROMPT.md'}
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeScenario === 'new-project' && 'Memulai Proyek Baru (Mode LITE / FULL, Aksi: BARU)'}
                  {activeScenario === 'existing-project' && 'Merapikan Proyek Lama (Read-Only Audit, Aksi: RESTRUKTURISASI)'}
                  {activeScenario === 'in-progress' && 'Melanjutkan Proyek & Pemulihan Sesi Terputus (Kasus A–D)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    activeScenario === 'in-progress' ? canonicalHandoverPrompt : canonicalLandingPrompt,
                    `sc-${activeScenario}`
                  )
                }
                className="touch-target-44 min-h-[44px] px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                {copiedId === `sc-${activeScenario}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === `sc-${activeScenario}` ? 'Tersalin!' : 'Salin Prompt Kanonik'}</span>
              </button>
            </div>

            {activeScenario === 'in-progress' && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">Perintah Forensik Snapshot Sebelum Takeover</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(canonicalSnapshotCommands, 'sc-forensic')}
                    className="touch-target-44 min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1.5"
                  >
                    {copiedId === 'sc-forensic' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'sc-forensic' ? 'Tersalin' : 'Salin CLI'}</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {canonicalSnapshotCommands}
                </pre>
              </div>
            )}

            <pre className="text-slate-300 font-mono text-xs overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-96 leading-relaxed whitespace-pre-wrap">
              {activeScenario === 'in-progress' ? canonicalHandoverPrompt : canonicalLandingPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* VIEW 7: KATALOG PROMPT PATEN (SUMBER: LANDING_PROMPT.md, HANDOVER_PROMPT.md, USAGE.md) */}
      {viewMode === 'prompt-catalog' && (
        <div className="space-y-4">
          {[
            {
              id: 'cat-landing',
              tag: 'LANDING_PROMPT.md',
              title: 'Prompt Inisiasi Proyek / Restrukturisasi',
              content: canonicalLandingPrompt,
              filename: 'LANDING_PROMPT.md'
            },
            {
              id: 'cat-handover',
              tag: 'HANDOVER_PROMPT.md',
              title: 'Prompt Paten Serah Terima & Recovery',
              content: canonicalHandoverPrompt,
              filename: 'HANDOVER_PROMPT.md'
            },
            {
              id: 'cat-checkpoint',
              tag: 'docs/USAGE.md · Blok Checkpoint',
              title: 'Format Blok Checkpoint & Aturan Waktu Asli',
              content: canonicalCheckpointBlock,
              filename: 'CHECKPOINT_TEMPLATE.md'
            },
            {
              id: 'cat-workflow',
              tag: 'AI_WORKFLOW.md (Ringkasan Aturan)',
              title: 'Pedoman Eksekusi Agen Mode FULL',
              content: AI_WORKFLOW_MD.split('\n').slice(0, 45).join('\n'),
              filename: 'AI_WORKFLOW.md'
            }
          ].map(card => (
            <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono text-cyan-400">{card.tag}</div>
                  <h4 className="text-sm font-bold text-white">{card.title}</h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(card.content, card.id)}
                    className="touch-target-44 min-h-[44px] px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copiedId === card.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === card.id ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(card.content, card.filename)}
                    className="touch-target-44 min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </button>
                </div>
              </div>
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-60 whitespace-pre-wrap leading-relaxed">
                {card.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 8: AI HANDOVER STUDIO (INTERACTIVE UNIVERSAL RELAY GENERATOR) */}
      {viewMode === 'ai-handover-claude-gpt' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-amber-400">
                  Blueprint 14 · Universal Multi-AI Relay Generator · {sessionState.tasks.length} Task Didukung
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Generator Estafet AI: Pindahkan Task ke Model AI Luar
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  Bangun prompt cold-start lengkap untuk <strong className="text-cyan-300">{relayOutput.aiProviderLabel}</strong> dengan batas sentuh 44px+ dan konteks bebas halusinasi.
                </p>
              </div>
              <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    await generateAndDownloadZipBundle({
                      type: 'claude',
                      filename: 'zlce-claude-chatgpt-bundle.zip'
                    });
                  }}
                  className="touch-target-44 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-600 hover:bg-amber-500 text-white transition whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate &amp; Unduh Bundel Claude/GPT</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(relayOutput.fullPrompt, `prompt-${selectedTaskId}`)}
                  className="touch-target-44 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition whitespace-nowrap"
                >
                  {copiedId === `prompt-${selectedTaskId}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                  <span>{copiedId === `prompt-${selectedTaskId}` ? 'Prompt Tersalin!' : `Salin Prompt ${selectedTaskId}`}</span>
                </button>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('ai-handover')}
                    className="touch-target-44 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-slate-950 hover:bg-slate-800 border border-indigo-700/60 text-indigo-300 transition whitespace-nowrap"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                    <span>Buka Hub Estafet AI</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
              <span>{relayOutput.taskId}: {relayOutput.taskName}</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-300">{relayOutput.aiProviderLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-300">Driver: {relayOutput.driver.name}</span>
              <span aria-hidden="true">·</span>
              <span className={`tabular-nums ${relayOutput.safety.status === 'safe' ? 'text-emerald-400' : relayOutput.safety.status === 'warning' ? 'text-amber-400' : 'text-rose-400'}`}>
                ~{relayOutput.estimatedTokens.toLocaleString()} tokens ({relayOutput.safety.statusLabel})
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Konfigurasi Generator Estafet</span>
              </h4>
              <button
                type="button"
                onClick={() => setSelectedTaskId(defaultTask)}
                className="touch-target-44 min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-950 hover:bg-slate-800 border border-cyan-800/60 text-cyan-300 transition"
              >
                Pilih Task Aktif/Siap ({defaultTask})
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-mono font-semibold text-slate-300 tabular-nums">
                  1. Mandat Task ({filteredTasks.length} / {sessionState.tasks.length} Task)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {availablePhases.map(phase => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => setPhaseFilter(phase)}
                      className={`touch-target-44 min-h-[44px] px-3 py-1.5 rounded text-xs font-mono transition ${
                        phaseFilter === phase
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                  className="md:col-span-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 touch-target-44 min-h-[44px]"
                >
                  {filteredTasks.map(t => {
                    const detail = taskDetailMap.get(t.id);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.id}: {detail?.title || t.name} [{t.status}]
                      </option>
                    );
                  })}
                </select>
                <input
                  type="text"
                  value={taskSearch}
                  onChange={e => setTaskSearch(e.target.value)}
                  placeholder="Cari task ID / nama..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500 touch-target-44 min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                2. Target Model AI Penerima Estafet
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { id: 'claude', name: 'Claude 3.5 Sonnet', limit: '30K Mid' },
                  { id: 'chatgpt', name: 'ChatGPT GPT-4o', limit: '128K Wide' },
                  { id: 'cursor', name: 'Cursor AI', limit: '64K Coding' },
                  { id: 'copilot', name: 'GitHub Copilot', limit: '32K Flow' },
                  { id: 'gemini', name: 'Gemini Flash', limit: '1M Mega' },
                  { id: 'deepseek', name: 'DeepSeek Reasoner', limit: '64K Deep' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAiProvider(item.id as TargetAIProvider)}
                    className={`touch-target-44 min-h-[44px] p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      selectedAiProvider === item.id
                        ? 'bg-amber-950/50 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs truncate">{item.name}</div>
                    <div className="text-xs font-mono opacity-80">{item.limit}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 block">
                3. Penanggung Jawab Tablet ({TEAM_MEMBERS.length} Anggota Resmi)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
                {TEAM_MEMBERS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedDriverId(m.id)}
                    className={`touch-target-44 min-h-[44px] p-2 rounded-lg border text-center transition ${
                      selectedDriverId === m.id
                        ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs truncate">{m.name}</div>
                    <div className="text-xs text-slate-400 truncate">{m.role.split('/')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400">Mode Format Prompt:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHandoverMode('direct-execution')}
                  className={`touch-target-44 min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-mono transition ${
                    handoverMode === 'direct-execution'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Eksekusi Mandiri
                </button>
                <button
                  type="button"
                  onClick={() => setHandoverMode('cidi-handover')}
                  className={`touch-target-44 min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-mono transition ${
                    handoverMode === 'cidi-handover'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Protokol C-I-D-I (Cold-Start)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relayOutput.steps.map(step => (
              <div key={step.stepNumber} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono tabular-nums font-bold text-amber-400">
                  Langkah {step.stepNumber}
                </div>
                <h5 className="text-sm font-bold text-white">{step.title}</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                {step.targetUrl && (
                  <a
                    href={step.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="touch-target-44 min-h-[44px] inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Buka {relayOutput.aiProviderLabel} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs font-mono text-amber-400">Prompt Mandat Siap Salin</div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {relayOutput.taskId} ({relayOutput.taskName}) · {relayOutput.aiProviderLabel}
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(relayOutput.fullPrompt, `prompt-${relayOutput.taskId}-full`)}
                  className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-600 hover:bg-amber-500 text-white transition"
                >
                  {copiedId === `prompt-${relayOutput.taskId}-full` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === `prompt-${relayOutput.taskId}-full` ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadMarkdownBlob(relayOutput.fullPrompt, { filename: relayOutput.filename })}
                  className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Unduh .md</span>
                </button>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('result-capture')}
                    className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-950 hover:bg-slate-800 border border-emerald-700/60 text-emerald-300 transition"
                  >
                    <span>Capture Hasil</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap select-all">
              {relayOutput.fullPrompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
