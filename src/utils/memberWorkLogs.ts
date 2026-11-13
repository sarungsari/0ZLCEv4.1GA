/**
 * ZLCE Mobile Workbench: Member Work Logs & Notes Manager
 * Mengelola riwayat log kerja 8 anggota tim, catatan aktivitas, dan status pengerjaan.
 * Mematuhi Zero-Secret Policy (menolak token/kredensial pada note).
 */

import { MemberWorkLog, MemberWorkLogStatus } from '../types/mobile';
import { TEAM_MEMBERS, getMemberById } from '../data/teamMembers';

export const MEMBER_WORK_LOGS_STORAGE_KEY = 'zlce_member_work_logs';
export const MEMBER_WORK_LOGS_EVENT = 'zlce_member_work_logs_updated';

// Format tanggal lokal ramah layar tablet (WIB / Local)
export function formatLogTimestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${min} WIB`;
}

// Log awal kanonik yang mencerminkan milestone riil proyek
export const CANONICAL_INITIAL_WORK_LOGS: MemberWorkLog[] = [
  {
    id: 'log-001',
    memberId: 'eko',
    memberName: 'Eko',
    timestamp: '2026-11-08T04:30:00.000Z',
    formattedTime: '2026-11-08 11:30 WIB',
    taskId: 'TASK-093',
    activity: 'Rekonsiliasi Test Runner & Paritas Bundel Dokumen',
    note: 'Memverifikasi kelulusan 49/49 checks di scripts/run-tests.py dan normalisasi izin file bundel ZIP 207 berkas.',
    status: 'COMPLETED'
  },
  {
    id: 'log-002',
    memberId: 'oned',
    memberName: 'Oned',
    timestamp: '2026-11-08T04:15:00.000Z',
    formattedTime: '2026-11-08 11:15 WIB',
    taskId: 'TASK-092',
    activity: 'Restrukturisasi TutorialTab 4 Pilar & WorkspaceReader Optgroup',
    note: 'Komponen visual 4 pilar diuji pada layar sentuh tablet 8.7". Seluruh target sentuh tombol min-h-[44px] memenuhi standar.',
    status: 'COMPLETED'
  },
  {
    id: 'log-003',
    memberId: 'sulistiyani',
    memberName: 'Sulistiyani',
    timestamp: '2026-11-08T03:50:00.000Z',
    formattedTime: '2026-11-08 10:50 WIB',
    taskId: 'TASK-090',
    activity: 'Penyusunan Tutorial Instalasi Android & Verifikasi PWA',
    note: 'SOP 8 langkah instalasi Termux F-Droid hingga PWA standalone diverifikasi offline pada Samsung Galaxy Tab A7 Lite.',
    status: 'COMPLETED'
  },
  {
    id: 'log-004',
    memberId: 'layang',
    memberName: 'Layang',
    timestamp: '2026-11-08T03:30:00.000Z',
    formattedTime: '2026-11-08 10:30 WIB',
    taskId: 'TASK-091',
    activity: 'Penyusunan SOP Pemakaian Mobile 10 Langkah Estafet',
    note: 'Menyusun alur kerja harian tanpa redundansi instalasi dasar, termasuk zero-secret profile selection dan clean-auth.',
    status: 'COMPLETED'
  },
  {
    id: 'log-005',
    memberId: 'cxperia',
    memberName: 'Cxperia',
    timestamp: '2026-11-08T03:00:00.000Z',
    formattedTime: '2026-11-08 10:00 WIB',
    taskId: 'TASK-093',
    activity: 'Pengujian Otomatis documentationParity.test.ts',
    note: 'Unit test paritas dokumentasi 8/8 checks lulus 100%. Tidak ditemukan link rusak antar berkas rujukan.',
    status: 'COMPLETED'
  },
  {
    id: 'log-006',
    memberId: 'kepek',
    memberName: 'Kepek',
    timestamp: '2026-11-08T02:30:00.000Z',
    formattedTime: '2026-11-08 09:30 WIB',
    taskId: 'TASK-083',
    activity: 'Audit Ketiadaan Kredensial & Pembersihan RAM Termux',
    note: 'Memastikan script clean-auth.sh menghapus cache kredensial git di RAM saat serah terima tablet antar anggota.',
    status: 'COMPLETED'
  },
  {
    id: 'log-007',
    memberId: 'acimau',
    memberName: 'Acimau',
    timestamp: '2026-11-08T02:00:00.000Z',
    formattedTime: '2026-11-08 09:00 WIB',
    taskId: 'TASK-086',
    activity: 'Sinkronisasi Cabang Git v4-mobile & Remote Safe Pull',
    note: 'Aturan fast-forward only (--ff-only) menjaga cabang tetap linear tanpa commit merge tak terduga.',
    status: 'COMPLETED'
  },
  {
    id: 'log-008',
    memberId: 'gete',
    memberName: 'Gete',
    timestamp: '2026-11-08T01:30:00.000Z',
    formattedTime: '2026-11-08 08:30 WIB',
    taskId: 'TASK-087',
    activity: 'Uji Ergonomi Keyboard Virtual visualViewport',
    note: 'Memastikan formulir catatan dan teks editor tidak tertutup pop-up papan ketik virtual saat tablet diposisikan mendatar.',
    status: 'COMPLETED'
  }
];

/**
 * Sanitasi string catatan untuk mencegah kebocoran token/secret (Zero-Secret Policy).
 */
export function sanitizeLogNote(note: string): string {
  if (!note) return '';
  return note.replace(/(ghp_[a-zA-Z0-9]{20,}|github_pat_[a-zA-Z0-9_]{30,}|sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{35})/g, '[REDACTED_SECRET]');
}

/**
 * Memuat daftar log kerja anggota dari LocalStorage.
 */
export function loadMemberWorkLogs(): MemberWorkLog[] {
  if (typeof window === 'undefined') return CANONICAL_INITIAL_WORK_LOGS;
  try {
    const raw = localStorage.getItem(MEMBER_WORK_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          id: String(item.id || `log-${Date.now()}`),
          memberId: String(item.memberId || 'oned').toLowerCase(),
          memberName: String(item.memberName || getMemberById(item.memberId || 'oned').name),
          timestamp: String(item.timestamp || new Date().toISOString()),
          formattedTime: String(item.formattedTime || formatLogTimestamp()),
          taskId: item.taskId ? String(item.taskId) : undefined,
          activity: String(item.activity || 'Aktivitas Kerja'),
          note: sanitizeLogNote(String(item.note || '')),
          status: (['IN_PROGRESS', 'COMPLETED', 'HANDOVER', 'BLOCKED'].includes(item.status) ? item.status : 'COMPLETED') as MemberWorkLogStatus,
          updatedAt: item.updatedAt ? String(item.updatedAt) : undefined
        }));
      }
    }
  } catch (err) {
    console.warn('[MemberWorkLogs] Gagal membaca LocalStorage, memuat fallback bawaan:', err);
  }
  return CANONICAL_INITIAL_WORK_LOGS;
}

/**
 * Menyimpan seluruh log kerja anggota ke LocalStorage dan memicu event sinkronisasi.
 */
export function saveMemberWorkLogs(logs: MemberWorkLog[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const sanitized = logs.map(l => ({
      ...l,
      note: sanitizeLogNote(l.note)
    }));
    localStorage.setItem(MEMBER_WORK_LOGS_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent(MEMBER_WORK_LOGS_EVENT, { detail: sanitized }));
    window.dispatchEvent(new Event('storage'));
    return true;
  } catch (err) {
    console.error('[MemberWorkLogs] Gagal menyimpan log kerja:', err);
    return false;
  }
}

/**
 * Menambahkan entri log kerja baru untuk anggota.
 */
export function addMemberWorkLog(entry: {
  memberId: string;
  activity: string;
  note: string;
  taskId?: string;
  status?: MemberWorkLogStatus;
}): MemberWorkLog {
  const member = getMemberById(entry.memberId);
  const now = new Date();
  const newLog: MemberWorkLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    memberId: member.id,
    memberName: member.name,
    timestamp: now.toISOString(),
    formattedTime: formatLogTimestamp(now),
    taskId: entry.taskId?.trim() || undefined,
    activity: entry.activity.trim() || 'Aktivitas Pengembangan',
    note: sanitizeLogNote(entry.note.trim()),
    status: entry.status || 'IN_PROGRESS'
  };

  const current = loadMemberWorkLogs();
  const updated = [newLog, ...current];
  saveMemberWorkLogs(updated);
  return newLog;
}

/**
 * Memperbarui catatan (note) atau status pada log kerja yang sudah ada.
 */
export function updateMemberWorkLogNote(
  logId: string, 
  newNote: string, 
  newStatus?: MemberWorkLogStatus
): boolean {
  const current = loadMemberWorkLogs();
  let found = false;
  const now = new Date();

  const updated = current.map(item => {
    if (item.id === logId) {
      found = true;
      return {
        ...item,
        note: sanitizeLogNote(newNote.trim()),
        status: newStatus !== undefined ? newStatus : item.status,
        updatedAt: formatLogTimestamp(now)
      };
    }
    return item;
  });

  if (found) {
    saveMemberWorkLogs(updated);
  }
  return found;
}

/**
 * Menghapus entri log kerja berdasarkan ID.
 */
export function deleteMemberWorkLog(logId: string): boolean {
  const current = loadMemberWorkLogs();
  const updated = current.filter(item => item.id !== logId);
  if (updated.length !== current.length) {
    saveMemberWorkLogs(updated);
    return true;
  }
  return false;
}

/**
 * Mengembalikan log kerja ke data contoh kanonik default.
 */
export function resetMemberWorkLogsToDefault(): MemberWorkLog[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(MEMBER_WORK_LOGS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(MEMBER_WORK_LOGS_EVENT, { detail: CANONICAL_INITIAL_WORK_LOGS }));
    window.dispatchEvent(new Event('storage'));
  }
  return CANONICAL_INITIAL_WORK_LOGS;
}
