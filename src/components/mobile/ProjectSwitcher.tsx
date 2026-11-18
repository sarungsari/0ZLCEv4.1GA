import React, { useState, useRef, useEffect } from 'react';
import { useProjectRegistry, HOST_WORKBENCH_PROJECT_ID } from '../../hooks/useProjectRegistry';
import { ProjectMeta, ProjectWorkflowMode } from '../../types/mobile';
import { getWorkflowShortTag } from '../../utils/projectStarter';
import { copyToClipboard } from '../../utils/clipboard';
import { ConfirmDialog } from './ConfirmDialog';
import { showToast } from './ToastContainer';
import { 
  FolderKanban, 
  ChevronDown, 
  Plus, 
  Check, 
  Terminal, 
  GitBranch, 
  Trash2, 
  Edit3, 
  X,
  Upload,
  Archive
} from 'lucide-react';

interface ProjectSwitcherProps {
  className?: string;
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({ className = '' }) => {
  const {
    projects,
    archivedProjects,
    activeProject,
    activeProjectId,
    switchProject,
    addProject,
    updateProject,
    deleteProject,
    archiveProject
  } = useProjectRegistry();

  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectMeta | null>(null);
  const [copiedPathId, setCopiedPathId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTermuxPath, setFormTermuxPath] = useState('');
  const [formRepoUrl, setFormRepoUrl] = useState('');
  const [formBranch, setFormBranch] = useState('main');
  const [formMode, setFormMode] = useState<'FULL' | 'LITE'>('LITE');
  const [formWorkflow, setFormWorkflow] = useState<ProjectWorkflowMode>('NEW');
  const [formStack, setFormStack] = useState('React / TypeScript / Node.js');
  const [formMember, setFormMember] = useState('eko');
  const [formDesc, setFormDesc] = useState('');
  const [importedMarkdown, setImportedMarkdown] = useState<string>('');
  const [importedFileName, setImportedFileName] = useState<string>('');
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const applyWorkflowDefaults = (wf: ProjectWorkflowMode) => {
    setFormWorkflow(wf);
    if (wf === 'NEW') {
      setFormTermuxPath('~/projects/proyek-baru');
      setFormBranch('main');
      setFormMode('LITE');
    } else if (wf === 'CONTINUE') {
      setFormTermuxPath('~/projects/proyek-lanjutan');
      setFormBranch('main');
      setFormMode('LITE');
    } else {
      setFormTermuxPath('~/projects/proyek-update');
      setFormBranch('task/TASK-REV-01');
      setFormMode('FULL');
    }
  };

  // Klik di luar menutup dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Dengarkan event eksternal untuk membuka modal proyek baru dari DashboardTab
  useEffect(() => {
    const handleOpenNewModal = (ev: Event) => {
      const detail = (ev as CustomEvent<{ workflow?: ProjectWorkflowMode }> | undefined)?.detail;
      const wf: ProjectWorkflowMode = detail?.workflow || 'NEW';
      setFormName('');
      setFormRepoUrl('');
      setFormStack('React / TypeScript / Node.js');
      setFormMember('eko');
      setFormDesc('');
      setImportedMarkdown('');
      setImportedFileName('');
      applyWorkflowDefaults(wf);
      setShowAddModal(true);
      setIsOpen(false);
    };

    window.addEventListener('zlce-open-new-project-modal', handleOpenNewModal);
    return () => window.removeEventListener('zlce-open-new-project-modal', handleOpenNewModal);
  }, []);

  const handleOpenAddModal = (defaultWorkflow: ProjectWorkflowMode = 'NEW') => {
    setFormName('');
    setFormRepoUrl('');
    setFormStack('React / TypeScript / Node.js');
    setFormMember('eko');
    setFormDesc('');
    setImportedMarkdown('');
    setImportedFileName('');
    applyWorkflowDefaults(defaultWorkflow);
    setShowAddModal(true);
    setIsOpen(false);
  };

  const handleOpenEditModal = (p: ProjectMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(p);
    setFormName(p.name);
    setFormTermuxPath(p.termuxPath);
    setFormRepoUrl(p.repoUrl);
    setFormBranch(p.branch);
    setFormMode(p.mode);
    setFormWorkflow(p.workflow || 'NEW');
    setFormStack(p.stack || 'React / TypeScript / Node.js');
    setFormMember(p.activeMemberId || 'eko');
    setFormDesc(p.description || '');
    setIsOpen(false);
  };

  const handleImportSessionFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      setImportedMarkdown(content);
      setImportedFileName(file.name);
      showToast(`Berkas ${file.name} siap dipakai sebagai SESSION_STATE.md awal proyek.`, 'success');
    } catch {
      showToast('Gagal membaca berkas Markdown.', 'error');
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTermuxPath.trim()) return;

    const created = addProject(
      {
        name: formName.trim(),
        termuxPath: formTermuxPath.trim(),
        repoUrl: formRepoUrl.trim(),
        branch: formBranch.trim() || 'main',
        mode: formMode,
        workflow: formWorkflow,
        stack: formStack.trim() || 'React / TypeScript / Node.js',
        activeMemberId: formMember,
        description: formDesc.trim()
      },
      importedMarkdown || undefined
    );

    showToast(
      `Workspace "${created.name}" (${getWorkflowShortTag(created.workflow)} · ${created.mode}) siap dipakai terisolasi!`,
      'success'
    );
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !formName.trim() || !formTermuxPath.trim()) return;

    updateProject(editingProject.id, {
      name: formName.trim(),
      termuxPath: formTermuxPath.trim(),
      repoUrl: formRepoUrl.trim(),
      branch: formBranch.trim() || 'main',
      mode: formMode,
      workflow: formWorkflow,
      stack: formStack.trim() || editingProject.stack,
      activeMemberId: formMember,
      description: formDesc.trim()
    });

    showToast(`Konfigurasi "${formName.trim()}" diperbarui.`, 'info');
    setEditingProject(null);
  };

  const handleCopyTermuxCommand = async (path: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cmd = `cd ${path}`;
    await copyToClipboard(cmd);
    setCopiedPathId(id);
    setTimeout(() => setCopiedPathId(null), 2000);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete({ id, name });
  };

  const handleArchive = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = archiveProject(id);
    if (ok) {
      showToast(`Proyek "${name}" dipindahkan ke Archive di Dashboard.`, 'info');
      if (id === activeProjectId) {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Tombol Pemicu di Header (Target Sentuh Ergonomis Tablet >= 44px) */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="touch-target-44 min-h-[44px] min-w-0 max-w-full flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs transition active:scale-95 shadow-sm"
        title={`Proyek Aktif: ${activeProject.name} (${activeProject.termuxPath}) • Klik untuk berganti proyek`}
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
          <FolderKanban className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-slate-100 max-w-[130px] sm:max-w-[170px] truncate">
              {activeProject.name}
            </span>
            <span className="text-xs px-1 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
              {activeProject.mode}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono min-w-0">
            <GitBranch className="w-2.5 h-2.5 text-slate-500 shrink-0" />
            <span className="truncate max-w-[90px]">{activeProject.branch}</span>
            <span className="text-slate-600 shrink-0">·</span>
            <span className="text-amber-300 shrink-0">{getWorkflowShortTag(activeProject.workflow)}</span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Proyek */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)] rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Panel */}
          <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Registry Multi-Proyek Tablet
                </h3>
                <p className="text-xs text-slate-400">
                  Workspace terisolasi per proyek
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenAddModal('NEW')}
              className="touch-target-44 min-h-[44px] px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 shadow active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          {/* Daftar Proyek */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-800/60 p-1.5">
            {projects.map((project) => {
              const isActive = project.id === activeProjectId;
              return (
                <div
                  key={project.id}
                  onClick={() => {
                    switchProject(project.id);
                    setIsOpen(false);
                  }}
                  className={`touch-target-48 p-2.5 rounded-lg flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-cyan-950/60 border border-cyan-500/50 shadow-inner'
                      : 'hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-xs font-semibold truncate ${isActive ? 'text-cyan-300 font-bold' : 'text-slate-200'}`}>
                        {project.name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {getWorkflowShortTag(project.workflow)}
                      </span>
                      {isActive && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                      <span className="truncate text-slate-300">{project.termuxPath}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-indigo-400">{project.branch}</span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Actions per item */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleCopyTermuxCommand(project.termuxPath, project.id, e)}
                      className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                      title="Salin perintah 'cd' ke clipboard Termux"
                    >
                      {copiedPathId === project.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Terminal className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleOpenEditModal(project, e)}
                      className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      title="Edit konfigurasi proyek"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {projects.length > 1 && project.id !== HOST_WORKBENCH_PROJECT_ID && (
                      <>
                        <button
                          onClick={(e) => handleArchive(project.id, project.name, e)}
                          className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                          title="Arsipkan proyek ke Dashboard Archive (data workspace tetap aman)"
                          aria-label={`Arsipkan proyek ${project.name}`}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(project.id, project.name, e)}
                          className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title="Hapus proyek dari registry"
                          aria-label={`Hapus proyek ${project.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Penyimpanan: <strong className="text-slate-300">LocalStorage Terisolasi</strong></span>
            <span>
              {projects.length} Aktif
              {archivedProjects.length > 0 ? ` · ${archivedProjects.length} Arsip` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Modal Tambah Proyek Baru / Lanjutan / Modifikasi */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Siapkan Workspace Proyek ZLCE</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-4 space-y-3 max-h-[82vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skenario Proyek <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formWorkflow}
                  onChange={e => applyWorkflowDefaults(e.target.value as ProjectWorkflowMode)}
                  className="touch-target-44 min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="NEW">Proyek Baru (Mulai dari Nol)</option>
                  <option value="CONTINUE">Lanjutan Setengah Jadi (Audit &amp; Teruskan)</option>
                  <option value="MODIFY">Update &amp; Modifikasi Proyek (TASK-REV / Revisi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Proyek <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Misal: Sistem Kasir UMKM / App Booking"
                  required
                  className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Path Direktori Termux <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTermuxPath}
                    onChange={e => setFormTermuxPath(e.target.value)}
                    placeholder="~/projects/nama-repo"
                    required
                    className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stack Teknologi</label>
                  <input
                    type="text"
                    value={formStack}
                    onChange={e => setFormStack(e.target.value)}
                    placeholder="React + TypeScript / Go / Laravel"
                    className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cabang Default</label>
                  <input
                    type="text"
                    value={formBranch}
                    onChange={e => setFormBranch(e.target.value)}
                    placeholder="main"
                    className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mode Kontrol ZLCE</label>
                  <select
                    value={formMode}
                    onChange={e => setFormMode(e.target.value as 'FULL' | 'LITE')}
                    className="touch-target-44 min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LITE">LITE (4 Berkas Inti - Cepat)</option>
                    <option value="FULL">FULL (10 Berkas Lengkap)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL Remote Git (Opsional)</label>
                <input
                  type="text"
                  value={formRepoUrl}
                  onChange={e => setFormRepoUrl(e.target.value)}
                  placeholder="https://github.com/organisasi/repo.git"
                  className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Impor SESSION_STATE.md Eksisting (Opsional — untuk Proyek Lanjutan/Update)
                </label>
                <label className="touch-target-44 min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-dashed border-slate-700 hover:border-cyan-500 text-xs text-slate-300 flex items-center justify-between gap-2 cursor-pointer transition">
                  <span className="flex items-center gap-2 truncate">
                    <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {importedFileName ? `Terpilih: ${importedFileName}` : 'Pilih berkas .md atau biarkan kosong untuk buat baru'}
                    </span>
                  </span>
                  <input
                    type="file"
                    accept=".md,.txt,text/markdown"
                    onChange={handleImportSessionFile}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Singkat</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="Keterangan singkat tujuan proyek atau target modifikasi..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="touch-target-44 min-h-[44px] px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="touch-target-44 min-h-[44px] px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow"
                >
                  Buat &amp; Buka Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Proyek */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Edit Proyek: {editingProject.name}</h3>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skenario Proyek</label>
                <select
                  value={formWorkflow}
                  onChange={e => setFormWorkflow(e.target.value as ProjectWorkflowMode)}
                  className="touch-target-44 min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="NEW">Proyek Baru (Mulai dari Nol)</option>
                  <option value="CONTINUE">Lanjutan Setengah Jadi</option>
                  <option value="MODIFY">Update &amp; Modifikasi Proyek</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Proyek</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                  className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Path Direktori di Termux</label>
                  <input
                    type="text"
                    value={formTermuxPath}
                    onChange={e => setFormTermuxPath(e.target.value)}
                    required
                    className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stack Teknologi</label>
                  <input
                    type="text"
                    value={formStack}
                    onChange={e => setFormStack(e.target.value)}
                    className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cabang Default</label>
                  <input
                    type="text"
                    value={formBranch}
                    onChange={e => setFormBranch(e.target.value)}
                    className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mode Kontrol</label>
                  <select
                    value={formMode}
                    onChange={e => setFormMode(e.target.value as 'FULL' | 'LITE')}
                    className="touch-target-44 min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LITE">LITE (4 Berkas Inti)</option>
                    <option value="FULL">FULL (10 Berkas Lengkap)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL Remote Git</label>
                <input
                  type="text"
                  value={formRepoUrl}
                  onChange={e => setFormRepoUrl(e.target.value)}
                  className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="touch-target-44 min-h-[44px] px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="touch-target-44 min-h-[44px] px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Proyek (TASK-102) */}
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Hapus Proyek dari Registry"
        message={
          <span>
            Apakah Anda yakin ingin menghapus proyek <strong>"{projectToDelete?.name}"</strong> dari registry tablet?
          </span>
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDestructive
        onConfirm={() => {
          if (projectToDelete) {
            deleteProject(projectToDelete.id);
            showToast(`Proyek "${projectToDelete.name}" dihapus dari registry.`, 'info');
            setProjectToDelete(null);
          }
        }}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};
