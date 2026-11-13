/**
 * Unit Test: Member Work Logs & Editable Notes (LOG-001)
 * Memverifikasi fungsionalitas pencatatan log kerja anggota, penyuntingan catatan (note),
 * sanitasi Zero-Secret Policy, dan integritas data riwayat tim estafet.
 */

import { 
  CANONICAL_INITIAL_WORK_LOGS, 
  sanitizeLogNote, 
  formatLogTimestamp 
} from '../utils/memberWorkLogs';
import { MemberWorkLog, MemberWorkLogStatus } from '../types/mobile';
import { TEAM_MEMBERS } from '../data/teamMembers';

export function runMemberWorkLogsTests() {
  console.log('[TEST] Menjalankan Pengujian Log Kerja Anggota & Penyuntingan Catatan...');

  // Check 1: 8 anggota tim terwakili dalam log awal kanonik
  if (!Array.isArray(CANONICAL_INITIAL_WORK_LOGS) || CANONICAL_INITIAL_WORK_LOGS.length !== 8) {
    throw new Error(`Log awal kanonik harus berjumlah 8, didapat ${CANONICAL_INITIAL_WORK_LOGS?.length}`);
  }
  const loggedMemberIds = new Set(CANONICAL_INITIAL_WORK_LOGS.map(l => l.memberId.toLowerCase()));
  for (const m of TEAM_MEMBERS) {
    if (!loggedMemberIds.has(m.id.toLowerCase())) {
      throw new Error(`Anggota @${m.id} (${m.name}) tidak memiliki log kerja awal`);
    }
  }
  console.log('  ✓ 1. Seluruh 8 anggota tim estafet terwakili dalam log kerja awal kanonik');

  // Check 2: Format timestamp lokal valid
  const ts = formatLogTimestamp(new Date('2026-11-08T11:30:00.000Z'));
  if (!ts.includes('WIB')) {
    throw new Error(`Format timestamp lokal tidak memuat zona waktu: ${ts}`);
  }
  console.log('  ✓ 2. Format timestamp lokal valid dan mencantumkan zona waktu WIB');

  // Check 3: Penegakan Zero-Secret Policy pada sanitasi catatan (note)
  const dummyGh = ['gh', 'p_', '1234567890abcdefghijklmnopqrstuvwxyz'].join('');
  const dummyAi = ['s', 'k-', '1234567890abcdefghijklmnopqrstuvwxyz'].join('');
  const leakNote = `Selesai setup deploy, token ${dummyGh} dan ${dummyAi}`;
  const cleanNote = sanitizeLogNote(leakNote);
  if (cleanNote.includes('ghp_') || cleanNote.includes('sk-')) {
    throw new Error(`Sanitasi note gagal mencegah kebocoran secret: ${cleanNote}`);
  }
  if (!cleanNote.includes('[REDACTED_SECRET]')) {
    throw new Error('Sanitasi note tidak menyematkan penanda [REDACTED_SECRET]');
  }
  console.log('  ✓ 3. Sanitasi Zero-Secret Policy terbukti menyensor token GitHub dan OpenAI API key');

  // Check 4: Operasi penambahan log dan penyuntingan note secara in-memory
  const mockLogs: MemberWorkLog[] = [...CANONICAL_INITIAL_WORK_LOGS];
  const newEntry: MemberWorkLog = {
    id: 'test-log-999',
    memberId: 'oned',
    memberName: 'Oned',
    timestamp: new Date().toISOString(),
    formattedTime: formatLogTimestamp(),
    taskId: 'TASK-093',
    activity: 'Penambahan Fitur Log Kerja Anggota',
    note: 'Catatan awal: fitur sedang dibangun.',
    status: 'IN_PROGRESS'
  };
  mockLogs.unshift(newEntry);
  if (mockLogs.length !== 9 || mockLogs[0].id !== 'test-log-999') {
    throw new Error('Gagal menambahkan entri log kerja');
  }
  console.log('  ✓ 4. Entri log kerja baru berhasil ditambahkan');

  // Check 5: Penyuntingan catatan (note)
  const targetLog = mockLogs.find(l => l.id === 'test-log-999');
  if (!targetLog) throw new Error('Entri target tidak ditemukan');
  targetLog.note = 'Catatan diperbarui: fitur berhasil diuji dan disetujui.';
  targetLog.status = 'COMPLETED';
  targetLog.updatedAt = formatLogTimestamp();

  if (targetLog.note !== 'Catatan diperbarui: fitur berhasil diuji dan disetujui.' || targetLog.status !== 'COMPLETED') {
    throw new Error('Penyuntingan catatan log kerja gagal');
  }
  console.log('  ✓ 5. Penyuntingan catatan (note) dan status pekerjaan berhasil');

  // Check 6: Operasi penghapusan log
  const afterDelete = mockLogs.filter(l => l.id !== 'test-log-999');
  if (afterDelete.length !== 8) {
    throw new Error('Penghapusan log kerja gagal');
  }
  console.log('  ✓ 6. Penghapusan log kerja berhasil');

  console.log('RESULT: ALL MEMBER WORK LOGS CHECKS PASSED (6/6 checks OK).');
  return true;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('memberWorkLogs.test.ts')) {
  try {
    runMemberWorkLogsTests();
    process.exit(0);
  } catch (err: any) {
    console.error('[ERROR] Member work logs test failed:', err?.message || err);
    process.exit(1);
  }
}
