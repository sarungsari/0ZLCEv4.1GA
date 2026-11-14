import { useState, useEffect, useCallback } from 'react';
import { ProjectMeta } from '../types/mobile';
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

const REGISTRY_STORAGE_KEY = 'zlce_projects_registry';
const ACTIVE_PROJECT_ID_KEY = 'zlce_active_project_id';

export function getProjectStorageKeys(projectId: string) {
  const safeId = (projectId || HOST_WORKBENCH_PROJECT_ID).replace(/[^a-zA-Z0-9_-]/g, '_');
  return {
    rawMarkdownKey: `zlce_project::${safeId}::raw_markdown`,
    stateDataKey: `zlce_project::${safeId}::state_data`,
    lastSavedKey: `zlce_project::${safeId}::last_saved`,
    historyKey: `zlce_project::${safeId}::history`
  };
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

export function useProjectRegistry() {
  const [projects, setProjects] = useState<ProjectMeta[]>(() => {
    try {
      // Bersihkan sisa key isolated storage proyek demo lama jika pernah tersimpan
      const legacyKeys = getProjectStorageKeys('todo-api-service');
      localStorage.removeItem(legacyKeys.rawMarkdownKey);
      localStorage.removeItem(legacyKeys.stateDataKey);
      localStorage.removeItem(legacyKeys.lastSavedKey);
      localStorage.removeItem(legacyKeys.historyKey);

      const saved = localStorage.getItem(REGISTRY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrasi otomatis URL repositori lama & hapus proyek contoh 'todo-api-service'
          const cleaned = parsed
            .filter((p: ProjectMeta) => p.id !== 'todo-api-service')
            .map((p: ProjectMeta) => {
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
            });
          if (cleaned.length > 0) {
            return cleaned;
          }
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROJECTS;
  });

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

  // Pantau storage event lintas tab & event internal
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedProjects = localStorage.getItem(REGISTRY_STORAGE_KEY);
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        }
        const savedActiveId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
        if (savedActiveId) {
          setActiveProjectIdState(savedActiveId);
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
    window.dispatchEvent(new CustomEvent('zlce-project-changed', { detail: { projectId: id } }));
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
      if (prev.length <= 1) return prev; // Pertahankan minimal 1 proyek
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
        window.dispatchEvent(new CustomEvent('zlce-project-changed', { detail: { projectId: nextActive.id } }));
      }
      return filtered;
    });
  }, [activeProjectId]);

  return {
    projects,
    activeProject,
    activeProjectId,
    switchProject,
    addProject,
    updateProject,
    deleteProject
  };
}
