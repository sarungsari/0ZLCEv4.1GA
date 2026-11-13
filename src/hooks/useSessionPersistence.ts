import { useState, useEffect, useRef, useCallback } from 'react';
import { ParsedSessionState } from '../types/zlce';
import { ProjectMeta } from '../types/mobile';
import { parseSessionStateMarkdown } from '../utils/markdownParser';
import { buildFreshSessionStateMarkdown } from '../utils/projectStarter';
import {
  HOST_WORKBENCH_PROJECT_ID,
  DEFAULT_PROJECTS,
  getProjectStorageKeys,
  seedProjectSessionStorage
} from './useProjectRegistry';
import INITIAL_SESSION_STATE_MD from '../../SESSION_STATE.md?raw';

const STORAGE_KEY_MARKDOWN = 'zlce_session_raw_markdown';
const STORAGE_KEY_STATE = 'zlce_session_state_data';
const STORAGE_KEY_LAST_SAVED = 'zlce_session_last_saved';
const STORAGE_KEY_HISTORY = 'zlce_session_history';
const ACTIVE_PROJECT_ID_KEY = 'zlce_active_project_id';
const REGISTRY_STORAGE_KEY = 'zlce_projects_registry';

export interface SessionSnapshot {
  id: string;
  timestamp: number;
  label: string;
  rawMarkdown: string;
  stateData: ParsedSessionState;
}

export interface DiskSyncState {
  isLive: boolean;
  isAvailable: boolean;
  isSaving: boolean;
  isReading: boolean;
  lastDiskSync: Date | null;
  diskMtime: number | null;
  filePath: string;
  error: string | null;
  statusMessage?: string;
  externalChangeDetected: boolean;
}

export interface UseSessionPersistenceReturn {
  lastSaved: Date | null;
  isSaved: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => boolean;
  redo: () => boolean;
  restoreFromStorage: () => boolean;
  restoreSnapshot: (snapshotId: string) => boolean;
  resetToDefault: () => void;
  createManualSnapshot: (label?: string) => void;
  clearStorage: () => void;
  hasStoredSession: boolean;
  history: SessionSnapshot[];
  historyIndex: number;
  // Live Disk Sync (Single Source of Truth)
  diskSync: DiskSyncState;
  reloadFromDisk: () => Promise<boolean>;
  saveToDiskNow: () => Promise<boolean>;
  dismissExternalChange: () => void;
  // Storage Quota Resilience (TASK-105)
  isQuotaExceeded: boolean;
  dismissQuotaWarning: () => void;
  exportSessionMarkdown: () => void;
}

export function isQuotaError(e: any): boolean {
  return (
    Boolean(e) &&
    (e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 ||
      e.code === 1014 ||
      e.number === -2147024882)
  );
}

function getActiveProjectIdSafe(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(ACTIVE_PROJECT_ID_KEY) || HOST_WORKBENCH_PROJECT_ID;
    }
  } catch {
    // ignore
  }
  return HOST_WORKBENCH_PROJECT_ID;
}

function findProjectMetaSafe(projectId: string): ProjectMeta {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(REGISTRY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const found = parsed.find((p: ProjectMeta) => p.id === projectId);
          if (found) return found;
        }
      }
    }
  } catch {
    // fallback
  }
  return (
    DEFAULT_PROJECTS.find(p => p.id === projectId) || {
      id: projectId,
      name: projectId,
      termuxPath: `~/projects/${projectId}`,
      repoUrl: '',
      branch: 'main',
      activeMemberId: 'eko',
      lastAccessed: new Date().toISOString(),
      mode: 'LITE',
      workflow: 'NEW',
      description: 'Workspace proyek mandiri ZLCE'
    }
  );
}

function getDefaultMarkdownForProject(projectId: string): string {
  if (projectId === HOST_WORKBENCH_PROJECT_ID) {
    return INITIAL_SESSION_STATE_MD;
  }
  const meta = findProjectMetaSafe(projectId);
  return buildFreshSessionStateMarkdown({
    projectName: meta.name,
    stack: meta.stack,
    mode: meta.mode,
    workflow: meta.workflow || 'NEW',
    branch: meta.branch,
    termuxPath: meta.termuxPath,
    description: meta.description
  });
}

function saveLightweightHistory(snapshots: SessionSnapshot[], projectId?: string) {
  try {
    // Only persist the 5 most recent snapshots to keep LocalStorage write snappy (<25KB instead of 1MB)
    const lightweight = snapshots.slice(-5).map(({ id, timestamp, label, rawMarkdown }) => ({
      id,
      timestamp,
      label,
      rawMarkdown
    }));
    const serialized = JSON.stringify(lightweight);
    const targetProjectId = projectId || getActiveProjectIdSafe();
    const keys = getProjectStorageKeys(targetProjectId);
    localStorage.setItem(keys.historyKey, serialized);
    if (targetProjectId === getActiveProjectIdSafe()) {
      localStorage.setItem(STORAGE_KEY_HISTORY, serialized);
    }
  } catch (err) {
    if (isQuotaError(err) && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zlce-storage-quota-exceeded'));
    }
  }
}

function writeProjectSnapshotToStorage(
  projectId: string,
  md: string,
  state: ParsedSessionState,
  nowIso: string,
  mirrorToLegacyKeys: boolean
) {
  const keys = getProjectStorageKeys(projectId);
  const serializedState = JSON.stringify(state);
  localStorage.setItem(keys.rawMarkdownKey, md);
  localStorage.setItem(keys.stateDataKey, serializedState);
  localStorage.setItem(keys.lastSavedKey, nowIso);
  if (mirrorToLegacyKeys) {
    localStorage.setItem(STORAGE_KEY_MARKDOWN, md);
    localStorage.setItem(STORAGE_KEY_STATE, serializedState);
    localStorage.setItem(STORAGE_KEY_LAST_SAVED, nowIso);
  }
}

export function useSessionPersistence(
  rawMarkdown: string,
  stateData: ParsedSessionState,
  setRawMarkdown: React.Dispatch<React.SetStateAction<string>>,
  setStateData: React.Dispatch<React.SetStateAction<ParsedSessionState>>,
  options: { maxHistory?: number; debounceMs?: number } = {}
): UseSessionPersistenceReturn {
  const { maxHistory = 35, debounceMs = 350 } = options;

  const [activeProjectId, setActiveProjectId] = useState<string>(() => getActiveProjectIdSafe());
  const activeProjectIdRef = useRef<string>(activeProjectId);

  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    try {
      const pid = getActiveProjectIdSafe();
      const keys = getProjectStorageKeys(pid);
      const savedTime = localStorage.getItem(keys.lastSavedKey) || localStorage.getItem(STORAGE_KEY_LAST_SAVED);
      return savedTime ? new Date(savedTime) : null;
    } catch {
      return null;
    }
  });

  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [hasStoredSession, setHasStoredSession] = useState<boolean>(() => {
    try {
      const pid = getActiveProjectIdSafe();
      const keys = getProjectStorageKeys(pid);
      const saved = localStorage.getItem(keys.rawMarkdownKey) || localStorage.getItem(STORAGE_KEY_MARKDOWN);
      return Boolean(saved && saved.trim().length > 0 && saved !== getDefaultMarkdownForProject(pid));
    } catch {
      return false;
    }
  });

  // Disk sync state tracking (hanya aktif untuk repositori host ZLCE4.1)
  const [diskSync, setDiskSync] = useState<DiskSyncState>(() => {
    const isHost = getActiveProjectIdSafe() === HOST_WORKBENCH_PROJECT_ID;
    return {
      isLive: false,
      isAvailable: isHost,
      isSaving: false,
      isReading: false,
      lastDiskSync: null,
      diskMtime: null,
      filePath: isHost ? '/SESSION_STATE.md' : 'LocalStorage (Terisolasi)',
      error: null,
      statusMessage: isHost
        ? undefined
        : 'Live Bridge tidak aktif (Mode Statis PWA) — Workspace Proyek Terisolasi',
      externalChangeDetected: false
    };
  });

  // History stack for Undo / Redo in current project session
  const [history, setHistory] = useState<SessionSnapshot[]>(() => {
    try {
      const pid = getActiveProjectIdSafe();
      const keys = getProjectStorageKeys(pid);
      const savedHistory = localStorage.getItem(keys.historyKey) || (pid === HOST_WORKBENCH_PROJECT_ID ? localStorage.getItem(STORAGE_KEY_HISTORY) : null);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(-maxHistory).map((item: any) => ({
            id: item.id,
            timestamp: item.timestamp,
            label: item.label,
            rawMarkdown: item.rawMarkdown,
            stateData: item.stateData || parseSessionStateMarkdown(item.rawMarkdown)
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [
      {
        id: 'init-' + Date.now(),
        timestamp: Date.now(),
        label: 'Initial State',
        rawMarkdown,
        stateData
      }
    ];
  });

  const [historyIndex, setHistoryIndex] = useState<number>(() => {
    return history.length - 1;
  });

  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);

  // Refs untuk membaca snapshot state terkini ketika berganti proyek
  const latestDataRef = useRef({ rawMarkdown, stateData, history });
  useEffect(() => {
    latestDataRef.current = { rawMarkdown, stateData, history };
  }, [rawMarkdown, stateData, history]);

  useEffect(() => {
    const handleQuota = () => setIsQuotaExceeded(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('zlce-storage-quota-exceeded', handleQuota);
      return () => window.removeEventListener('zlce-storage-quota-exceeded', handleQuota);
    }
  }, []);

  // Ref flags to prevent infinite loops when updating from undo/redo/restore, project switch, or external disk sync
  const isInternalChangeRef = useRef<boolean>(false);
  const isDiskOriginUpdateRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKnownDiskMtimeRef = useRef<number | null>(null);

  // Sinkronisasi isolasi workspace ketika pengguna berpindah proyek via ProjectSwitcher
  useEffect(() => {
    const handleProjectSwitch = (ev?: Event) => {
      const detailId = (ev as CustomEvent<{ projectId?: string }> | undefined)?.detail?.projectId;
      const nextId = detailId || getActiveProjectIdSafe();
      const prevId = activeProjectIdRef.current;

      if (nextId === prevId) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // 1. Flush state proyek sebelumnya ke kunci terisolasi masing-masing
      try {
        const current = latestDataRef.current;
        writeProjectSnapshotToStorage(prevId, current.rawMarkdown, current.stateData, new Date().toISOString(), false);
        saveLightweightHistory(current.history, prevId);
      } catch {
        // ignore flush error on switch
      }

      // 2. Aktifkan ID proyek baru
      activeProjectIdRef.current = nextId;
      setActiveProjectId(nextId);

      // 3. Muat state terisolasi milik proyek baru (atau buat fresh workspace baru)
      try {
        const nextKeys = getProjectStorageKeys(nextId);
        let nextMd = localStorage.getItem(nextKeys.rawMarkdownKey) || '';
        let nextState: ParsedSessionState | null = null;

        if (!nextMd.trim()) {
          if (nextId === HOST_WORKBENCH_PROJECT_ID) {
            nextMd = INITIAL_SESSION_STATE_MD;
            nextState = parseSessionStateMarkdown(nextMd);
            writeProjectSnapshotToStorage(nextId, nextMd, nextState, new Date().toISOString(), true);
          } else {
            const meta = findProjectMetaSafe(nextId);
            nextMd = seedProjectSessionStorage(meta);
            nextState = parseSessionStateMarkdown(nextMd);
          }
        } else {
          const savedStateJson = localStorage.getItem(nextKeys.stateDataKey);
          if (savedStateJson) {
            try {
              nextState = JSON.parse(savedStateJson);
            } catch {
              nextState = parseSessionStateMarkdown(nextMd);
            }
          } else {
            nextState = parseSessionStateMarkdown(nextMd);
          }
        }

        const resolvedState = nextState || parseSessionStateMarkdown(nextMd);
        const savedTime = localStorage.getItem(nextKeys.lastSavedKey);
        const nowIso = savedTime || new Date().toISOString();

        // Mirror ke kunci aktif legacy agar seluruh tab pembaca tetap sinkron
        writeProjectSnapshotToStorage(nextId, nextMd, resolvedState, nowIso, true);

        let loadedHistory: SessionSnapshot[] = [];
        try {
          const histRaw = localStorage.getItem(nextKeys.historyKey);
          if (histRaw) {
            const parsedHist = JSON.parse(histRaw);
            if (Array.isArray(parsedHist) && parsedHist.length > 0) {
              loadedHistory = parsedHist.slice(-maxHistory).map((item: any) => ({
                id: item.id,
                timestamp: item.timestamp,
                label: item.label,
                rawMarkdown: item.rawMarkdown,
                stateData: item.stateData || parseSessionStateMarkdown(item.rawMarkdown)
              }));
            }
          }
        } catch {
          // ignore
        }

        if (loadedHistory.length === 0) {
          loadedHistory = [
            {
              id: 'switch-init-' + Date.now(),
              timestamp: Date.now(),
              label: `Workspace (${findProjectMetaSafe(nextId).name})`,
              rawMarkdown: nextMd,
              stateData: resolvedState
            }
          ];
        }

        isInternalChangeRef.current = true;
        setRawMarkdown(nextMd);
        setStateData(resolvedState);
        setHistory(loadedHistory);
        setHistoryIndex(loadedHistory.length - 1);
        saveLightweightHistory(loadedHistory, nextId);
        setLastSaved(savedTime ? new Date(savedTime) : new Date());
        setIsSaved(true);
        setHasStoredSession(nextMd !== getDefaultMarkdownForProject(nextId));

        const isHost = nextId === HOST_WORKBENCH_PROJECT_ID;
        setDiskSync(prev => ({
          ...prev,
          isLive: false,
          isAvailable: isHost,
          isSaving: false,
          isReading: false,
          filePath: isHost ? '/SESSION_STATE.md' : 'LocalStorage (Terisolasi)',
          error: null,
          statusMessage: isHost
            ? prev.statusMessage
            : 'Live Bridge tidak aktif (Mode Statis PWA) — Workspace Proyek Terisolasi',
          externalChangeDetected: false
        }));
      } catch (err) {
        console.warn('[useSessionPersistence] Gagal beralih workspace proyek:', err);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('zlce-project-changed', handleProjectSwitch);
      window.addEventListener('storage', handleProjectSwitch);
      return () => {
        window.removeEventListener('zlce-project-changed', handleProjectSwitch);
        window.removeEventListener('storage', handleProjectSwitch);
      };
    }
  }, [maxHistory, setRawMarkdown, setStateData]);

  // Helper: Reload live state directly from disk /SESSION_STATE.md (host only)
  const reloadFromDisk = useCallback(async (): Promise<boolean> => {
    if (activeProjectIdRef.current !== HOST_WORKBENCH_PROJECT_ID || !diskSync.isAvailable) {
      return false;
    }
    try {
      setDiskSync(prev => ({ ...prev, isReading: true, error: null }));
      const response = await fetch('/api/session-state', {
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setDiskSync(prev => ({
            ...prev,
            isLive: false,
            isAvailable: false,
            isReading: false,
            error: null,
            statusMessage: 'Live Bridge tidak aktif (Mode Statis PWA)'
          }));
          return false;
        }
        throw new Error(`Gagal memuat status disk (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (data && typeof data.content === 'string') {
        const parsed = parseSessionStateMarkdown(data.content);

        // Mark as internal disk update to prevent echoing back to disk immediately
        isInternalChangeRef.current = true;
        isDiskOriginUpdateRef.current = true;
        lastKnownDiskMtimeRef.current = data.mtime;

        setRawMarkdown(data.content);
        setStateData(parsed);

        const now = new Date();
        writeProjectSnapshotToStorage(HOST_WORKBENCH_PROJECT_ID, data.content, parsed, now.toISOString(), true);

        setLastSaved(now);
        setIsSaved(true);
        setHasStoredSession(true);

        setDiskSync(prev => ({
          ...prev,
          isLive: true,
          isAvailable: true,
          isReading: false,
          lastDiskSync: now,
          diskMtime: data.mtime,
          error: null,
          statusMessage: 'Live Bridge Aktif',
          externalChangeDetected: false
        }));

        const newSnap: SessionSnapshot = {
          id: 'disk-sync-' + Date.now(),
          timestamp: Date.now(),
          label: `Disk Reload (${parsed.status?.activeTask || 'Live'})`,
          rawMarkdown: data.content,
          stateData: parsed
        };

        setHistory(prev => {
          const next = [...prev, newSnap].slice(-maxHistory);
          setHistoryIndex(next.length - 1);
          saveLightweightHistory(next, HOST_WORKBENCH_PROJECT_ID);
          return next;
        });

        return true;
      }
      return false;
    } catch (err: any) {
      if (diskSync.isAvailable) {
        console.warn('[ZLCE Disk Sync] Gagal membaca dari disk:', err);
      }
      setDiskSync(prev => ({
        ...prev,
        isReading: false,
        error: diskSync.isAvailable ? (err?.message || 'Gagal sinkronisasi disk') : null,
        statusMessage: diskSync.isAvailable ? undefined : 'Live Bridge tidak aktif (Mode Statis PWA)'
      }));
      return false;
    }
  }, [diskSync.isAvailable, maxHistory, setRawMarkdown, setStateData]);

  // Helper: Force save current in-memory markdown directly to isolated storage (+ disk if host)
  const saveToDiskNow = useCallback(async (): Promise<boolean> => {
    const now = new Date();
    const pid = activeProjectIdRef.current;

    // 1. Always persist to project-isolated LocalStorage first
    try {
      writeProjectSnapshotToStorage(pid, rawMarkdown, stateData, now.toISOString(), true);
      setLastSaved(now);
      setIsSaved(true);
    } catch (err: any) {
      if (isQuotaError(err) && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zlce-storage-quota-exceeded'));
      }
    }

    if (pid !== HOST_WORKBENCH_PROJECT_ID) {
      setDiskSync(prev => ({
        ...prev,
        isLive: false,
        isAvailable: false,
        isSaving: false,
        error: null,
        statusMessage: 'Live Bridge tidak aktif (Mode Statis PWA) — Workspace Proyek Terisolasi'
      }));
      return true;
    }

    if (!diskSync.isAvailable) {
      setDiskSync(prev => ({
        ...prev,
        isSaving: false,
        error: null,
        statusMessage: 'Live Bridge tidak aktif (Mode Statis PWA)'
      }));
      return true;
    }

    try {
      setDiskSync(prev => ({ ...prev, isSaving: true, error: null }));
      const response = await fetch('/api/session-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: rawMarkdown,
          source: 'ui-manual-save'
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          setDiskSync(prev => ({
            ...prev,
            isLive: false,
            isAvailable: false,
            isSaving: false,
            error: null,
            statusMessage: 'Live Bridge tidak aktif (Mode Statis PWA)'
          }));
          return true;
        }
        throw new Error(`Gagal menyimpan ke disk (HTTP ${response.status})`);
      }

      const res = await response.json();
      lastKnownDiskMtimeRef.current = res.mtime;

      setDiskSync(prev => ({
        ...prev,
        isLive: true,
        isAvailable: true,
        isSaving: false,
        lastDiskSync: now,
        diskMtime: res.mtime,
        error: null,
        statusMessage: 'Live Bridge Aktif'
      }));

      return true;
    } catch (err: any) {
      if (diskSync.isAvailable) {
        console.error('[ZLCE Disk Sync] Gagal menulis ke disk:', err);
      }
      setDiskSync(prev => ({
        ...prev,
        isSaving: false,
        error: diskSync.isAvailable ? (err?.message || 'Gagal menulis ke berkas disk /SESSION_STATE.md') : null,
        statusMessage: diskSync.isAvailable ? undefined : 'Live Bridge tidak aktif (Mode Statis PWA)'
      }));
      return false;
    }
  }, [diskSync.isAvailable, rawMarkdown, stateData]);

  // Dismiss external change indicator
  const dismissExternalChange = useCallback(() => {
    setDiskSync(prev => ({ ...prev, externalChangeDetected: false }));
  }, []);

  // 1. Initial Load & SSE Stream Setup (ONLY runs Live Disk Sync on host workbench project)
  useEffect(() => {
    if (activeProjectId !== HOST_WORKBENCH_PROJECT_ID) {
      setDiskSync(prev => ({
        ...prev,
        isLive: false,
        isAvailable: false,
        isSaving: false,
        isReading: false,
        filePath: 'LocalStorage (Terisolasi)',
        error: null,
        statusMessage: 'Live Bridge tidak aktif (Mode Statis PWA) — Workspace Proyek Terisolasi',
        externalChangeDetected: false
      }));
      return;
    }

    let isMounted = true;
    let eventSource: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const connectWatchAndPoll = () => {
      try {
        eventSource = new EventSource('/api/session-state/watch');

        eventSource.onopen = () => {
          if (!isMounted || activeProjectIdRef.current !== HOST_WORKBENCH_PROJECT_ID) return;
          setDiskSync(prev => {
            if (prev.isLive && prev.error === null) return prev;
            return { ...prev, isLive: true, error: null };
          });
        };

        eventSource.onmessage = (e) => {
          if (!isMounted || activeProjectIdRef.current !== HOST_WORKBENCH_PROJECT_ID) return;
          try {
            const payload = JSON.parse(e.data);
            if (payload.type === 'CONNECTED') {
              setDiskSync(prev => {
                if (prev.isLive && prev.diskMtime === payload.mtime) return prev;
                return { ...prev, isLive: true, diskMtime: payload.mtime };
              });
            } else if (payload.type === 'DISK_FILE_CHANGED') {
              if (payload.mtime !== lastKnownDiskMtimeRef.current) {
                lastKnownDiskMtimeRef.current = payload.mtime;
                reloadFromDisk();
              }
            }
          } catch {
            // Heartbeat or ping comment
          }
        };

        eventSource.onerror = () => {
          if (!isMounted) return;
          if (typeof document !== 'undefined' && document.hidden) return;
          setDiskSync(prev => {
            if (!prev.isLive) return prev;
            return { ...prev, isLive: false };
          });
        };
      } catch {
        // SSE fallback: periodic polling
      }

      pollInterval = setInterval(async () => {
        if (!isMounted || activeProjectIdRef.current !== HOST_WORKBENCH_PROJECT_ID) return;
        if (typeof document !== 'undefined' && document.hidden) return;
        try {
          const res = await fetch('/api/disk-status');
          if (res.ok) {
            const status = await res.json();
            if (
              status.mtime &&
              lastKnownDiskMtimeRef.current &&
              status.mtime !== lastKnownDiskMtimeRef.current
            ) {
              lastKnownDiskMtimeRef.current = status.mtime;
              reloadFromDisk();
            }
          }
        } catch {
          // quiet fallback
        }
      }, 8000);
    };

    const initDiskSync = async () => {
      try {
        const res = await fetch('/api/session-state', {
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (activeProjectIdRef.current !== HOST_WORKBENCH_PROJECT_ID) return;

        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && typeof data.content === 'string' && data.content.trim().length > 0) {
            const parsed = parseSessionStateMarkdown(data.content);
            isInternalChangeRef.current = true;
            isDiskOriginUpdateRef.current = true;
            lastKnownDiskMtimeRef.current = data.mtime;

            setRawMarkdown(data.content);
            setStateData(parsed);

            const now = new Date();
            writeProjectSnapshotToStorage(HOST_WORKBENCH_PROJECT_ID, data.content, parsed, now.toISOString(), true);

            setLastSaved(now);
            setIsSaved(true);
            setHasStoredSession(true);

            setDiskSync(prev => ({
              ...prev,
              isLive: true,
              isAvailable: true,
              filePath: '/SESSION_STATE.md',
              lastDiskSync: now,
              diskMtime: data.mtime,
              error: null,
              statusMessage: 'Live Bridge Aktif'
            }));

            setHistory([
              {
                id: 'disk-init-' + Date.now(),
                timestamp: Date.now(),
                label: 'Disk Initial (/SESSION_STATE.md)',
                rawMarkdown: data.content,
                stateData: parsed
              }
            ]);
            setHistoryIndex(0);

            connectWatchAndPoll();
          }
        } else if (isMounted) {
          setDiskSync(prev => ({
            ...prev,
            isLive: false,
            isAvailable: false,
            error: null,
            statusMessage: 'Live Bridge tidak aktif (Mode Statis PWA)'
          }));
        }
      } catch {
        if (isMounted) {
          setDiskSync(prev => ({
            ...prev,
            isLive: false,
            isAvailable: false,
            error: null,
            statusMessage: 'Live Bridge tidak aktif (Mode Statis PWA)'
          }));
        }
      }
    };

    initDiskSync();

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [activeProjectId, reloadFromDisk, setRawMarkdown, setStateData]);

  // 2. Persist to Project-Isolated LocalStorage (& Disk if host) whenever rawMarkdown or stateData changes
  useEffect(() => {
    if (isInternalChangeRef.current || isDiskOriginUpdateRef.current) {
      isInternalChangeRef.current = false;
      isDiskOriginUpdateRef.current = false;
      return;
    }

    setIsSaved(false);
    setDiskSync(prev => {
      if (prev.isSaving) return prev;
      return { ...prev, isSaving: true };
    });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const now = new Date();
      const pid = activeProjectIdRef.current;

      // 1. Save to isolated project keys + mirror to legacy keys
      try {
        writeProjectSnapshotToStorage(pid, rawMarkdown, stateData, now.toISOString(), true);
        setLastSaved(now);
        setIsSaved(true);
        setHasStoredSession(true);
        setIsQuotaExceeded(false);

        const currentSnapshot = history[historyIndex];
        if (!currentSnapshot || currentSnapshot.rawMarkdown !== rawMarkdown) {
          const updatedHistory = history.slice(0, historyIndex + 1);
          const newSnapshot: SessionSnapshot = {
            id: 'snap-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            timestamp: Date.now(),
            label: `Edit (${stateData.status?.activeTask || stateData.context?.projectName || 'Update'})`,
            rawMarkdown,
            stateData
          };

          const trimmed = [...updatedHistory, newSnapshot].slice(-maxHistory);
          setHistory(trimmed);
          setHistoryIndex(trimmed.length - 1);
          saveLightweightHistory(trimmed, pid);
        }
      } catch (err: any) {
        if (isQuotaError(err)) {
          console.warn('[ZLCE Storage] Kuota LocalStorage terlampaui (QuotaExceededError)');
          setIsQuotaExceeded(true);
          try {
            const pruned = history.slice(-2);
            saveLightweightHistory(pruned, pid);
          } catch {
            // ignore
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('zlce-storage-quota-exceeded', { detail: { timestamp: Date.now() } }));
          }
        } else {
          console.warn('[ZLCE Storage] LocalStorage write error:', err);
        }
      }

      // 2. Real-time Disk Write: ONLY for host repository when disk bridge is available
      if (pid !== HOST_WORKBENCH_PROJECT_ID || !diskSync.isAvailable) {
        setDiskSync(prev => ({
          ...prev,
          isSaving: false,
          error: null,
          statusMessage:
            pid !== HOST_WORKBENCH_PROJECT_ID
              ? 'Live Bridge tidak aktif (Mode Statis PWA) — Workspace Proyek Terisolasi'
              : 'Live Bridge tidak aktif (Mode Statis PWA)'
        }));
        return;
      }

      try {
        const response = await fetch('/api/session-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: rawMarkdown,
            source: 'ui-auto-save'
          })
        });

        if (response.ok) {
          const res = await response.json();
          lastKnownDiskMtimeRef.current = res.mtime;
          setDiskSync(prev => ({
            ...prev,
            isLive: true,
            isSaving: false,
            lastDiskSync: now,
            diskMtime: res.mtime,
            error: null
          }));
        } else {
          setDiskSync(prev => ({
            ...prev,
            isSaving: false,
            error: `Disk write failed (HTTP ${response.status})`
          }));
        }
      } catch {
        setDiskSync(prev => ({
          ...prev,
          isSaving: false,
          error: 'Jaringan disk bridge terputus'
        }));
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [rawMarkdown, stateData, historyIndex, maxHistory, debounceMs, diskSync.isAvailable, history]);

  // Undo: Step back in history
  const undo = useCallback((): boolean => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const targetSnapshot = history[prevIdx];
      if (targetSnapshot) {
        const pid = activeProjectIdRef.current;
        isInternalChangeRef.current = true;
        setHistoryIndex(prevIdx);
        setRawMarkdown(targetSnapshot.rawMarkdown);
        setStateData(targetSnapshot.stateData);
        setIsSaved(true);

        try {
          writeProjectSnapshotToStorage(pid, targetSnapshot.rawMarkdown, targetSnapshot.stateData, new Date().toISOString(), true);
        } catch {
          // ignore
        }

        if (pid === HOST_WORKBENCH_PROJECT_ID && diskSync.isAvailable) {
          fetch('/api/session-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: targetSnapshot.rawMarkdown, source: 'ui-undo' })
          }).catch((err) => {
            console.warn('[useSessionPersistence] Gagal sinkronisasi undo ke disk:', err);
          });
        }

        return true;
      }
    }
    return false;
  }, [diskSync.isAvailable, historyIndex, history, setRawMarkdown, setStateData]);

  // Redo: Step forward in history
  const redo = useCallback((): boolean => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const targetSnapshot = history[nextIdx];
      if (targetSnapshot) {
        const pid = activeProjectIdRef.current;
        isInternalChangeRef.current = true;
        setHistoryIndex(nextIdx);
        setRawMarkdown(targetSnapshot.rawMarkdown);
        setStateData(targetSnapshot.stateData);
        setIsSaved(true);

        try {
          writeProjectSnapshotToStorage(pid, targetSnapshot.rawMarkdown, targetSnapshot.stateData, new Date().toISOString(), true);
        } catch {
          // ignore
        }

        if (pid === HOST_WORKBENCH_PROJECT_ID && diskSync.isAvailable) {
          fetch('/api/session-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: targetSnapshot.rawMarkdown, source: 'ui-redo' })
          }).catch((err) => {
            console.warn('[useSessionPersistence] Gagal sinkronisasi redo ke disk:', err);
          });
        }

        return true;
      }
    }
    return false;
  }, [diskSync.isAvailable, historyIndex, history, setRawMarkdown, setStateData]);

  // Restore: Load persisted rawMarkdown & stateData from project-isolated localStorage
  const restoreFromStorage = useCallback((): boolean => {
    try {
      const pid = activeProjectIdRef.current;
      const keys = getProjectStorageKeys(pid);
      const storedMd = localStorage.getItem(keys.rawMarkdownKey) || localStorage.getItem(STORAGE_KEY_MARKDOWN);
      const storedState = localStorage.getItem(keys.stateDataKey) || localStorage.getItem(STORAGE_KEY_STATE);

      if (!storedMd) {
        return false;
      }

      let parsedState: ParsedSessionState;
      if (storedState) {
        try {
          parsedState = JSON.parse(storedState);
        } catch {
          parsedState = parseSessionStateMarkdown(storedMd);
        }
      } else {
        parsedState = parseSessionStateMarkdown(storedMd);
      }

      isInternalChangeRef.current = true;
      setRawMarkdown(storedMd);
      setStateData(parsedState);
      setIsSaved(true);

      const restoreSnap: SessionSnapshot = {
        id: 'snap-restore-' + Date.now(),
        timestamp: Date.now(),
        label: 'Restored from LocalStorage',
        rawMarkdown: storedMd,
        stateData: parsedState
      };

      const next = [...history, restoreSnap].slice(-maxHistory);
      setHistory(next);
      setHistoryIndex(next.length - 1);
      saveLightweightHistory(next, pid);

      if (pid === HOST_WORKBENCH_PROJECT_ID && diskSync.isAvailable) {
        fetch('/api/session-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: storedMd, source: 'ui-restore' })
        }).catch((err) => {
          console.warn('[useSessionPersistence] Gagal sinkronisasi restore ke disk:', err);
        });
      }

      return true;
    } catch (err) {
      console.error('[ZLCE Storage] Gagal memulihkan sesi:', err);
      return false;
    }
  }, [diskSync.isAvailable, history, maxHistory, setRawMarkdown, setStateData]);

  // Restore snapshot by ID
  const restoreSnapshot = useCallback((snapshotId: string): boolean => {
    const target = history.find(s => s.id === snapshotId);
    if (!target) return false;

    const pid = activeProjectIdRef.current;
    const idx = history.findIndex(s => s.id === snapshotId);
    isInternalChangeRef.current = true;
    setHistoryIndex(idx);
    setRawMarkdown(target.rawMarkdown);
    setStateData(target.stateData);
    setIsSaved(true);

    try {
      writeProjectSnapshotToStorage(pid, target.rawMarkdown, target.stateData, new Date().toISOString(), true);
    } catch {
      // ignore
    }

    if (pid === HOST_WORKBENCH_PROJECT_ID && diskSync.isAvailable) {
      fetch('/api/session-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: target.rawMarkdown, source: 'ui-restore-snapshot' })
      }).catch((err) => {
        console.warn('[useSessionPersistence] Gagal sinkronisasi snapshot restore ke disk:', err);
      });
    }

    return true;
  }, [diskSync.isAvailable, history, setRawMarkdown, setStateData]);

  // Reset to project's clean starter template (or canonical host template if on host)
  const resetToDefault = useCallback(() => {
    const pid = activeProjectIdRef.current;
    const defaultMd = getDefaultMarkdownForProject(pid);
    const defaultData = parseSessionStateMarkdown(defaultMd);
    isInternalChangeRef.current = true;
    setRawMarkdown(defaultMd);
    setStateData(defaultData);

    const resetSnap: SessionSnapshot = {
      id: 'snap-reset-' + Date.now(),
      timestamp: Date.now(),
      label: pid === HOST_WORKBENCH_PROJECT_ID ? 'Reset to Template Awal' : 'Reset Fresh Workspace',
      rawMarkdown: defaultMd,
      stateData: defaultData
    };

    const next = [...history, resetSnap].slice(-maxHistory);
    setHistory(next);
    setHistoryIndex(next.length - 1);
    saveLightweightHistory(next, pid);

    try {
      const now = new Date();
      writeProjectSnapshotToStorage(pid, defaultMd, defaultData, now.toISOString(), true);
      setLastSaved(now);
      setIsSaved(true);
    } catch (err) {
      console.warn('[useSessionPersistence] Gagal menyimpan snapshot default ke LocalStorage:', err);
    }

    if (pid === HOST_WORKBENCH_PROJECT_ID && diskSync.isAvailable) {
      fetch('/api/session-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: defaultMd, source: 'ui-reset' })
      }).catch((err) => {
        console.warn('[useSessionPersistence] Gagal sinkronisasi reset template ke disk:', err);
      });
    }
  }, [diskSync.isAvailable, history, maxHistory, setRawMarkdown, setStateData]);

  // Manual snapshot checkpoint
  const createManualSnapshot = useCallback((label?: string) => {
    const pid = activeProjectIdRef.current;
    const newSnapshot: SessionSnapshot = {
      id: 'snap-manual-' + Date.now(),
      timestamp: Date.now(),
      label: label || `Manual Checkpoint (${new Date().toLocaleTimeString('id-ID')})`,
      rawMarkdown,
      stateData
    };

    setHistory(prev => {
      const next = [...prev, newSnapshot].slice(-maxHistory);
      setHistoryIndex(next.length - 1);
      saveLightweightHistory(next, pid);
      return next;
    });
  }, [rawMarkdown, stateData, maxHistory]);

  // Clear storage
  const clearStorage = useCallback(() => {
    try {
      const pid = activeProjectIdRef.current;
      const keys = getProjectStorageKeys(pid);
      localStorage.removeItem(keys.rawMarkdownKey);
      localStorage.removeItem(keys.stateDataKey);
      localStorage.removeItem(keys.lastSavedKey);
      localStorage.removeItem(keys.historyKey);

      localStorage.removeItem(STORAGE_KEY_MARKDOWN);
      localStorage.removeItem(STORAGE_KEY_STATE);
      localStorage.removeItem(STORAGE_KEY_LAST_SAVED);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      setHasStoredSession(false);
      setLastSaved(null);
    } catch (err) {
      console.warn('[useSessionPersistence] Gagal membersihkan LocalStorage:', err);
    }
  }, []);

  const dismissQuotaWarning = useCallback(() => {
    setIsQuotaExceeded(false);
  }, []);

  const exportSessionMarkdown = useCallback(() => {
    if (typeof document === 'undefined') return;
    try {
      const blob = new Blob([rawMarkdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SESSION_STATE_${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export markdown file:', e);
    }
  }, [rawMarkdown]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    lastSaved,
    isSaved,
    canUndo,
    canRedo,
    undo,
    redo,
    restoreFromStorage,
    restoreSnapshot,
    resetToDefault,
    createManualSnapshot,
    clearStorage,
    hasStoredSession,
    history,
    historyIndex,
    // Real-time Disk Bridge
    diskSync,
    reloadFromDisk,
    saveToDiskNow,
    dismissExternalChange,
    // Storage Quota Resilience (TASK-105)
    isQuotaExceeded,
    dismissQuotaWarning,
    exportSessionMarkdown
  };
}
