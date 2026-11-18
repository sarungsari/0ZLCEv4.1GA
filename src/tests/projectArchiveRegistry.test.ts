/**
 * Dedicated Project Archive Registry & Dashboard Archive Section Test
 * Memverifikasi pemindahan proyek tidak aktif ke indeks localStorage khusus
 * (`zlce_projects_archive_registry`), pemulihan, penghapusan permanen, proteksi host,
 * serta integritas UI section Archive di DashboardTab.tsx.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  HOST_WORKBENCH_PROJECT_ID,
  REGISTRY_STORAGE_KEY,
  ARCHIVE_REGISTRY_STORAGE_KEY,
  ACTIVE_PROJECT_ID_KEY,
  DEFAULT_PROJECTS,
  getProjectStorageKeys,
  seedProjectSessionStorage,
  readPrimaryProjectsFromStorage,
  readArchivedProjectsFromStorage,
  archiveProjectInStorage,
  restoreProjectFromStorage,
  deleteArchivedProjectFromStorage
} from '../hooks/useProjectRegistry';
import { ProjectMeta } from '../types/mobile';

function assert(cond: unknown, msg: string) {
  if (!cond) {
    throw new Error(msg);
  }
}

function createMockLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    key(idx: number) {
      return Array.from(store.keys())[idx] ?? null;
    },
    get length() {
      return store.size;
    }
  };
}

function runArchiveTests() {
  console.log('=== Project Archive Registry & Dashboard Archive Section Test ===');

  const mockStorage = createMockLocalStorage();
  (globalThis as Record<string, unknown>).localStorage = mockStorage;

  const projectAlpha: ProjectMeta = {
    id: 'proj-alpha-archive',
    name: 'Kasir Toko Alpha',
    termuxPath: '~/projects/kasir-alpha',
    repoUrl: 'https://github.com/example/kasir-alpha.git',
    branch: 'main',
    activeMemberId: 'eko',
    lastAccessed: new Date().toISOString(),
    mode: 'LITE',
    workflow: 'NEW',
    stack: 'React + TypeScript',
    description: 'Aplikasi kasir non-aktif'
  };

  const projectBeta: ProjectMeta = {
    id: 'proj-beta-active',
    name: 'Booking Studio Beta',
    termuxPath: '~/projects/booking-beta',
    repoUrl: '',
    branch: 'task/TASK-REV-01',
    activeMemberId: 'oned',
    lastAccessed: new Date().toISOString(),
    mode: 'FULL',
    workflow: 'MODIFY',
    stack: 'React + Node.js',
    description: 'Aplikasi aktif sedang dikerjakan'
  };

  mockStorage.setItem(
    REGISTRY_STORAGE_KEY,
    JSON.stringify([DEFAULT_PROJECTS[0], projectAlpha, projectBeta])
  );
  mockStorage.setItem(ACTIVE_PROJECT_ID_KEY, projectBeta.id);

  // Seed custom session markdown in Alpha's isolated workspace
  seedProjectSessionStorage(projectAlpha);
  const alphaKeys = getProjectStorageKeys(projectAlpha.id);
  const customAlphaSession = '# SESSION_STATE ALPHA CUSTOM\n<!-- preserved -->';
  mockStorage.setItem(alphaKeys.rawMarkdownKey, customAlphaSession);

  // Check 1: Archive inactive project Alpha while Beta stays active
  const res1 = archiveProjectInStorage(projectAlpha.id);
  assert(res1.ok, 'Harus berhasil mengarsipkan proyek tidak aktif Alpha');
  assert(res1.nextActiveProjectId === projectBeta.id, 'Proyek aktif Beta harus tetap aktif');
  assert(
    readPrimaryProjectsFromStorage().every(p => p.id !== projectAlpha.id),
    'Proyek Alpha harus keluar dari registry utama (zlce_projects_registry)'
  );
  const archivedList = readArchivedProjectsFromStorage();
  assert(archivedList.length === 1 && archivedList[0].id === projectAlpha.id, 'Alpha harus masuk ke indeks zlce_projects_archive_registry');
  assert(Boolean(archivedList[0].archivedAt), 'Entri arsip wajib memiliki timestamp archivedAt');
  assert(
    mockStorage.getItem(alphaKeys.rawMarkdownKey) === customAlphaSession,
    'Data workspace terisolasi proyek diarsipkan wajib tetap utuh'
  );
  console.log('[PASS] Check 1: Proyek tidak aktif pindah ke indeks khusus zlce_projects_archive_registry dengan workspace tetap utuh');

  // Check 2: Host workbench project cannot be archived
  const resHost = archiveProjectInStorage(HOST_WORKBENCH_PROJECT_ID);
  assert(!resHost.ok, 'Proyek baseline host ZLCE Mobile Workbench tidak boleh diarsipkan');
  assert(
    readPrimaryProjectsFromStorage().some(p => p.id === HOST_WORKBENCH_PROJECT_ID),
    'Proyek host harus selalu bertahan di registry utama'
  );
  console.log('[PASS] Check 2: Proteksi host ZLCE Mobile Workbench mencegah pengarsipan proyek baseline');

  // Check 3: Archiving currently active non-host project Beta falls back cleanly to Host
  const res2 = archiveProjectInStorage(projectBeta.id);
  assert(res2.ok, 'Harus bisa mengarsipkan proyek aktif non-host Beta');
  assert(
    res2.nextActiveProjectId === HOST_WORKBENCH_PROJECT_ID,
    'Mengarsipkan proyek aktif non-host wajib kembali ke host ZLCE Mobile Workbench'
  );
  assert(
    mockStorage.getItem(ACTIVE_PROJECT_ID_KEY) === HOST_WORKBENCH_PROJECT_ID,
    'ACTIVE_PROJECT_ID_KEY di localStorage harus ter-update ke host'
  );
  console.log('[PASS] Check 3: Pengarsipan proyek aktif non-host otomatis fallback aman ke repositori host');

  // Check 4: Restore Alpha back to primary registry with preserved workspace markdown
  const resRestore = restoreProjectFromStorage(projectAlpha.id);
  assert(resRestore.ok, 'Pemulihan proyek Alpha dari archive harus berhasil');
  assert(
    readPrimaryProjectsFromStorage().some(p => p.id === projectAlpha.id),
    'Alpha harus kembali tampil di zlce_projects_registry'
  );
  assert(
    readArchivedProjectsFromStorage().every(a => a.id !== projectAlpha.id),
    'Alpha harus keluar dari zlce_projects_archive_registry setelah dipulihkan'
  );
  assert(
    mockStorage.getItem(alphaKeys.rawMarkdownKey) === customAlphaSession,
    'Session markdown proyek Alpha harus tetap utuh setelah dipulihkan'
  );
  console.log('[PASS] Check 4: Pulihkan (Restore) mengembalikan proyek ke registry utama tanpa kehilangan data sesi');

  // Check 5: Permanent delete from archive removes archive entry + isolated workspace keys
  seedProjectSessionStorage(projectBeta);
  const betaKeys = getProjectStorageKeys(projectBeta.id);
  assert(Boolean(mockStorage.getItem(betaKeys.rawMarkdownKey)), 'Beta session key harus ada sebelum dihapus permanen');
  const resDel = deleteArchivedProjectFromStorage(projectBeta.id);
  assert(resDel.ok, 'Penghapusan permanen proyek Beta dari archive harus berhasil');
  assert(
    readArchivedProjectsFromStorage().every(a => a.id !== projectBeta.id),
    'Beta harus hilang dari zlce_projects_archive_registry'
  );
  assert(
    mockStorage.getItem(betaKeys.rawMarkdownKey) === null &&
      mockStorage.getItem(betaKeys.stateDataKey) === null &&
      mockStorage.getItem(betaKeys.lastSavedKey) === null &&
      mockStorage.getItem(betaKeys.historyKey) === null,
    'Hapus permanen wajib membersihkan keempat kunci LocalStorage terisolasi proyek'
  );
  console.log('[PASS] Check 5: Hapus permanen membersihkan entri arsip dan seluruh kunci workspace terisolasi');

  // Check 6: DashboardTab & ProjectSwitcher UI integration and PWA ergonomics compliance
  const ROOT = process.cwd();
  const dashboardCode = fs.readFileSync(path.join(ROOT, 'src/components/DashboardTab.tsx'), 'utf-8');
  const switcherCode = fs.readFileSync(path.join(ROOT, 'src/components/mobile/ProjectSwitcher.tsx'), 'utf-8');

  assert(
    dashboardCode.includes('id="dashboard-archive-section"') &&
      dashboardCode.includes('Archive — Arsip Proyek Tidak Aktif') &&
      dashboardCode.includes('ARCHIVE_REGISTRY_STORAGE_KEY') &&
      dashboardCode.includes('archiveProject') &&
      dashboardCode.includes('restoreProject') &&
      dashboardCode.includes('deleteArchivedProject') &&
      dashboardCode.includes('Hapus Permanen Proyek dari Archive'),
    'DashboardTab.tsx wajib memuat section Archive lengkap dengan aksi Arsipkan, Pulihkan, dan ConfirmDialog Hapus Permanen'
  );
  assert(
    switcherCode.includes('archiveProject') && switcherCode.includes('HOST_WORKBENCH_PROJECT_ID'),
    'ProjectSwitcher.tsx wajib mendukung aksi arsip cepat non-host & menampilkan jumlah arsip'
  );
  console.log('[PASS] Check 6: Integrasi UI Archive di DashboardTab.tsx dan ProjectSwitcher.tsx terverifikasi');

  console.log('RESULT: Project Archive Registry & Dashboard Archive Section Test PASSED (6/6 checks OK)');
}

runArchiveTests();
