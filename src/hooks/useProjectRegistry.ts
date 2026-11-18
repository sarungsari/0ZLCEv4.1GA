import { useState, useEffect, useCallback } from 'react';
import { ArchivedProjectMeta, ProjectMeta } from '../types/mobile';
import { buildFreshSessionStateMarkdown } from '../utils/projectStarter';
import { parseSessionStateMarkdown } from '../utils/markdownParser';

export const HOST_WORKBENCH_PROJECT_ID = 'zlce-mobile-workbench';

export const DEFAULT_PROJECTS: ProjectMeta[] = [
  {
    id: HOST_WORKBENCH_PROJECT_ID,
    name: 'ZLCE Mobile Workbench v4.1.0 GA',
    termuxPath: '~/projects/0ZLCEv4.1GA',
    repoUrl: 'https://github.com/sarungsari/0ZLCEv4.1GA.git',
    branch: 'v4-mobile',
    activeMemberId: 'eko',
    lastAccessed: new Date().toISOString(),
    mode: 'FULL',
    workflow: 'MODIFY',
    stack: 'React 19 + TypeScript + Vite + Tailwind CSS + Termux',
    description: 'Repositori kanonik ZLCE Mobile Workbench v4.1.0 GA (Terkunci & Siap Pakai)'
  }
];

export const REGISTRY_STORAGE_KEY = 'zlce_projects_registry';
export const ARCHIVE_REGISTRY_STORAGE_KEY = 'zlce_projects_archive_registry';
export const ACTIVE_PROJECT_ID_KEY = 'zlce_active_project_id';

export function getProjectStorageKeys(projectId: string) {
  const safeId = (projectId || HOST_WORKBENCH_PROJECT_ID).replace(/[^a-zA-Z0-9_-]/g, '_');
  return {
    rawMarkdownKey: `zlce_project::${safeId}::raw_markdown`,
    stateDataKey: `zlce_project::${safeId}::state_data`,
    lastSavedKey: `zlce_project::${safeId}::last_saved`,
    historyKey: `zlce_project::${safeId}::history`
  };
}

function normalizeLegacyProject(p: ProjectMeta): ProjectMeta {
  if (
    p.id === HOST_WORKBENCH_PROJECT_ID ||
    p.repoUrl?.includes('ekokeplek-glitch/ZLCE4.1') ||
    p.repoUrl?.includes('ZLCE3.22-studio') ||
    p.repoUrl?.includes('T1ZLCE-Mobench-v4.0.0GA')
  ) {
    return {
      ...p,
      name: 'ZLCE Mobile Workbench v4.1.0 GA',
      termuxPath: '~/projects/0ZLCEv4.1GA',
      repoUrl: 'https://github.com/sarungsari/0ZLCEv4.1GA.git',
      workflow: p.workflow || 'MODIFY'
    };
  }
  return p;
}

export function readPrimaryProjectsFromStorage(): ProjectMeta[] {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_PROJECTS;
    const legacyKeys = getProjectStorageKeys('todo-api-service');
    localStorage.removeItem(legacyKeys.rawMarkdownKey);
    localStorage.removeItem(legacyKeys.stateDataKey);
    localStorage.removeItem(legacyKeys.lastSavedKey);
    localStorage.removeItem(legacyKeys.historyKey);

    const saved = localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed
          .filter((p: ProjectMeta) => p && p.id && p.id !== 'todo-api-service')
          .map(normalizeLegacyProject);
        if (cleaned.length > 0) {
          return cleaned;
        }
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_PROJECTS;
}

export function readArchivedProjectsFromStorage(): ArchivedProjectMeta[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const saved = localStorage.getItem(ARCHIVE_REGISTRY_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const cleaned: ArchivedProjectMeta[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item.id === 'string' &&
        item.id !== 'todo-api-service' &&
        item.id !== HOST_WORKBENCH_PROJECT_ID &&
        !seen.has(item.id)
      ) {
        seen.add(item.id);
        cleaned.push({
          ...item,
          archivedAt: typeof item.archivedAt === 'string' ? item.archivedAt : new Date().toISOString()
        });
      }
    }
    return cleaned;
  } catch {
    return [];
  }
}

function getActiveProjectIdFromStorage(projects: ProjectMeta[]): string {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
      if (saved && saved !== 'todo-api-service' && projects.some(p => p.id === saved)) {
        return saved;
      }
    }
  } catch {
    // fallback
  }
  return projects[0]?.id || DEFAULT_PROJECTS[0].id;
}

function dispatchProjectChangedEvent(projectId: string) {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zlce-project-changed', { detail: { projectId } }));
  }
}

export function seedProjectSessionStorage(project: ProjectMeta, customMarkdown?: string): string {
  const md = (customMarkdown && customMarkdown.trim().length > 0)
    ? customMarkdown
    : buildFreshSessionStateMarkdown({
        projectName: project.name,
        stack: project.stack,
        mode: project.mode,
        workflow: project.workflow || 'NEW',
        branch: project.branch,
        termuxPath: project.termuxPath,
        description: project.description
      });

  try {
    const keys = getProjectStorageKeys(project.id);
    const parsed = parseSessionStateMarkdown(md);
    const nowIso = new Date().toISOString();
    const initialHistory = [
      {
        id: 'init-' + Date.now(),
        timestamp: Date.now(),
        label: customMarkdown ? `Imported (${project.name})` : `Fresh Init (${project.name})`,
        rawMarkdown: md,
        stateData: parsed
      }
    ];
    localStorage.setItem(keys.rawMarkdownKey, md);
    localStorage.setItem(keys.stateDataKey, JSON.stringify(parsed));
    localStorage.setItem(keys.lastSavedKey, nowIso);
    localStorage.setItem(keys.historyKey, JSON.stringify(initialHistory));
  } catch (e) {
    console.warn('Gagal inisialisasi storage terisolasi proyek:', e);
  }
  return md;
}

export function archiveProjectInStorage(id: string): {
  ok: boolean;
  projects: ProjectMeta[];
  archivedProjects: ArchivedProjectMeta[];
  nextActiveProjectId: string;
  archivedItem?: ArchivedProjectMeta;
} {
  const projects = readPrimaryProjectsFromStorage();
  const archived = readArchivedProjectsFromStorage();
  const currentActiveId = getActiveProjectIdFromStorage(projects);

  if (id === HOST_WORKBENCH_PROJECT_ID || projects.length <= 1) {
    return {
      ok: false,
      projects,
      archivedProjects: archived,
      nextActiveProjectId: currentActiveId
    };
  }

  const target = projects.find(p => p.id === id);
  if (!target) {
    return {
      ok: false,
      projects,
      archivedProjects: archived,
      nextActiveProjectId: currentActiveId
    };
  }

  const nextProjects = projects.filter(p => p.id !== id);
  const archivedEntry: ArchivedProjectMeta = {
    ...target,
    archivedAt: new Date().toISOString()
  };
  const nextArchived = [archivedEntry, ...archived.filter(a => a.id !== id)];

  const nextActiveId =
    currentActiveId === id
      ? nextProjects.find(p => p.id === HOST_WORKBENCH_PROJECT_ID)?.id || nextProjects[0].id
      : currentActiveId;

  try {
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(nextProjects));
    localStorage.setItem(ARCHIVE_REGISTRY_STORAGE_KEY, JSON.stringify(nextArchived));
    if (currentActiveId === id) {
      localStorage.setItem(ACTIVE_PROJECT_ID_KEY, nextActiveId);
    }
  } catch (e) {
    console.warn('Gagal mengarsipkan proyek ke localStorage:', e);
  }

  dispatchProjectChangedEvent(nextActiveId);
  return {
    ok: true,
    projects: nextProjects,
    archivedProjects: nextArchived,
    nextActiveProjectId: nextActiveId,
    archivedItem: archivedEntry
  };
}

export function restoreProjectFromStorage(id: string): {
  ok: boolean;
  projects: ProjectMeta[];
  archivedProjects: ArchivedProjectMeta[];
  restoredItem?: ProjectMeta;
} {
  const projects = readPrimaryProjectsFromStorage();
  const archived = readArchivedProjectsFromStorage();
  const target = archived.find(a => a.id === id);

  if (!target) {
    return { ok: false, projects, archivedProjects: archived };
  }

  const { archivedAt: _archivedAt, ...restMeta } = target;
  const restoredMeta: ProjectMeta = {
    ...restMeta,
    lastAccessed: new Date().toISOString()
  };

  const nextArchived = archived.filter(a => a.id !== id);
  const nextProjects = [restoredMeta, ...projects.filter(p => p.id !== id)];

  // Pastikan data workspace proyek tetap tersedia jika belum ada di storage
  try {
    const keys = getProjectStorageKeys(id);
    if (!localStorage.getItem(keys.rawMarkdownKey)) {
      seedProjectSessionStorage(restoredMeta);
    }
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(nextProjects));
    localStorage.setItem(ARCHIVE_REGISTRY_STORAGE_KEY, JSON.stringify(nextArchived));
  } catch (e) {
    console.warn('Gagal memulihkan proyek dari arsip localStorage:', e);
  }

  dispatchProjectChangedEvent(getActiveProjectIdFromStorage(nextProjects));
  return {
    ok: true,
    projects: nextProjects,
    archivedProjects: nextArchived,
    restoredItem: restoredMeta
  };
}

export function deleteArchivedProjectFromStorage(id: string): {
  ok: boolean;
  archivedProjects: ArchivedProjectMeta[];
} {
  const archived = readArchivedProjectsFromStorage();
  const exists = archived.some(a => a.id === id);
  if (!exists) {
    return { ok: false, archivedProjects: archived };
  }

  const nextArchived = archived.filter(a => a.id !== id);
  try {
    const keys = getProjectStorageKeys(id);
    localStorage.removeItem(keys.rawMarkdownKey);
    localStorage.removeItem(keys.stateDataKey);
    localStorage.removeItem(keys.lastSavedKey);
    localStorage.removeItem(keys.historyKey);
    localStorage.setItem(ARCHIVE_REGISTRY_STORAGE_KEY, JSON.stringify(nextArchived));
  } catch (e) {
    console.warn('Gagal menghapus proyek dari arsip localStorage:', e);
  }

  const projects = readPrimaryProjectsFromStorage();
  dispatchProjectChangedEvent(getActiveProjectIdFromStorage(projects));
  return { ok: true, archivedProjects: nextArchived };
}

export function useProjectRegistry() {
  const [projects, setProjects] = useState<ProjectMeta[]>(() => readPrimaryProjectsFromStorage());
  const [archivedProjects, setArchivedProjects] = useState<ArchivedProjectMeta[]>(() =>
    readArchivedProjectsFromStorage()
  );

  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
      if (saved && saved !== 'todo-api-service') return saved;
    } catch {
      // fallback
    }
    return DEFAULT_PROJECTS[0].id;
  });

  // Simpan projects ke localStorage saat berubah
  useEffect(() => {
    try {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Gagal menyimpan registry proyek ke localStorage:', e);
    }
  }, [projects]);

  // Simpan archivedProjects ke indeks localStorage khusus arsip saat berubah
  useEffect(() => {
    try {
      localStorage.setItem(ARCHIVE_REGISTRY_STORAGE_KEY, JSON.stringify(archivedProjects));
    } catch (e) {
      console.warn('Gagal menyimpan indeks arsip proyek ke localStorage:', e);
    }
  }, [archivedProjects]);

  // Pantau storage event lintas tab & event internal
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const nextPrimary = readPrimaryProjectsFromStorage();
        setProjects(nextPrimary);
        setArchivedProjects(readArchivedProjectsFromStorage());

        const savedActiveId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
        if (savedActiveId && nextPrimary.some(p => p.id === savedActiveId)) {
          setActiveProjectIdState(savedActiveId);
        } else if (nextPrimary[0]?.id) {
          setActiveProjectIdState(nextPrimary[0].id);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('zlce-project-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('zlce-project-changed', handleStorageChange);
    };
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || DEFAULT_PROJECTS[0];

  const switchProject = useCallback((id: string) => {
    setActiveProjectIdState(id);
    try {
      localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
    } catch {
      // ignore
    }

    // Update lastAccessed pada proyek bersangkutan
    setProjects(prev => {
      const next = prev.map(p => (p.id === id ? { ...p, lastAccessed: new Date().toISOString() } : p));
      try {
        localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    // Trigger custom event untuk memberitahu useSessionPersistence & komponen lain
    dispatchProjectChangedEvent(id);
  }, []);

  const addProject = useCallback((
    newProj: Omit<ProjectMeta, 'id' | 'lastAccessed'>,
    initialSessionMarkdown?: string
  ) => {
    const id = `proj-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const fullProject: ProjectMeta = {
      ...newProj,
      id,
      workflow: newProj.workflow || 'NEW',
      lastAccessed: new Date().toISOString()
    };

    // Seed workspace terisolasi sebelum memicu zlce-project-changed
    seedProjectSessionStorage(fullProject, initialSessionMarkdown);

    setProjects(prev => {
      const next = [fullProject, ...prev];
      try {
        localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    switchProject(id);
    return fullProject;
  }, [switchProject]);

  const updateProject = useCallback((id: string, updates: Partial<ProjectMeta>) => {
    setProjects(prev => {
      const next = prev.map(p => (p.id === id ? { ...p, ...updates, lastAccessed: new Date().toISOString() } : p));
      try {
        localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      if (prev.length <= 1 || id === HOST_WORKBENCH_PROJECT_ID) return prev; // Pertahankan minimal 1 proyek & host kanonik
      const filtered = prev.filter(p => p.id !== id);
      try {
        const keys = getProjectStorageKeys(id);
        localStorage.removeItem(keys.rawMarkdownKey);
        localStorage.removeItem(keys.stateDataKey);
        localStorage.removeItem(keys.lastSavedKey);
        localStorage.removeItem(keys.historyKey);
        localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(filtered));
      } catch {
        // ignore
      }
      if (activeProjectId === id) {
        const nextActive = filtered[0];
        setActiveProjectIdState(nextActive.id);
        localStorage.setItem(ACTIVE_PROJECT_ID_KEY, nextActive.id);
        dispatchProjectChangedEvent(nextActive.id);
      }
      return filtered;
    });
  }, [activeProjectId]);

  const archiveProject = useCallback((id: string): boolean => {
    const res = archiveProjectInStorage(id);
    if (!res.ok) return false;
    setProjects(res.projects);
    setArchivedProjects(res.archivedProjects);
    setActiveProjectIdState(res.nextActiveProjectId);
    return true;
  }, []);

  const restoreProject = useCallback((id: string): boolean => {
    const res = restoreProjectFromStorage(id);
    if (!res.ok) return false;
    setProjects(res.projects);
    setArchivedProjects(res.archivedProjects);
    return true;
  }, []);

  const deleteArchivedProject = useCallback((id: string): boolean => {
    const res = deleteArchivedProjectFromStorage(id);
    if (!res.ok) return false;
    setArchivedProjects(res.archivedProjects);
    return true;
  }, []);

  return {
    projects,
    archivedProjects,
    activeProject,
    activeProjectId,
    switchProject,
    addProject,
    updateProject,
    deleteProject,
    archiveProject,
    restoreProject,
    deleteArchivedProject
  };
}
