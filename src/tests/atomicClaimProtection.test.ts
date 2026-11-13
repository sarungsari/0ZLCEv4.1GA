/**
 * TC-P16-01: Atomic Task Claim Guard & Ownership Protection Test
 * Rujukan: TASK-101, AUD4-004, UX-07, FLW-001
 */

import {
  claimTask,
  releaseTaskClaim,
  takeoverTaskClaim,
  canMutateTaskClaim,
  getActiveTaskClaim,
  getActiveClaimRevision,
  saveActiveTaskClaim,
  TaskClaimRecord
} from '../utils/taskClaimManager';
import { ParsedSessionState } from '../types/zlce';
import { TeamMember } from '../types/mobile';

// In-memory localStorage mock for node / tsx test runner
const storage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => storage[k] ?? null,
  setItem: (k: string, v: string) => { storage[k] = v; },
  removeItem: (k: string) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
(globalThis as any).window = {
  dispatchEvent: () => true
};

const memberEko: TeamMember = {
  id: 'eko',
  name: 'Eko',
  role: 'Frontend / PWA Architect',
  email: 'eko@zlce.local',
  aiPreference: 'Claude 3.5 Sonnet',
  avatarColor: 'from-blue-600 to-cyan-500'
};

const memberOned: TeamMember = {
  id: 'oned',
  name: 'Oned',
  role: 'Systems & Termux Operator',
  email: 'oned@zlce.local',
  aiPreference: 'DeepSeek-V3',
  avatarColor: 'from-emerald-600 to-teal-500'
};

function createMockState(): ParsedSessionState {
  return {
    context: {
      projectName: 'ZLCE Mobile Workbench v4.0.0',
      stack: 'React 19 + TypeScript + Vite + Tailwind',
      mode: 'FULL',
      fileWriteCapability: 'YA',
      execCapability: 'YA'
    },
    status: {
      timestampAudit: '2026-11-08 12:00:00 WIB',
      gitBranch: 'v4-mobile',
      lastDoneTask: 'TASK-100',
      activeTask: '-',
      activeTaskStatus: 'READY',
      nextTask: 'TASK-101'
    },
    tasks: [
      { id: 'TASK-100', name: 'Task 100', dependencies: '-', status: 'DONE', evidence: 'ok', approved: 'ya' },
      { id: 'TASK-101', name: 'Atomic Claim Protection', dependencies: 'TASK-100', status: 'READY', evidence: '-', approved: '-' },
      { id: 'TASK-102', name: 'Accessible Dialogs', dependencies: 'TASK-101', status: 'PENDING', evidence: '-', approved: '-' }
    ],
    wal: {
      task: '-',
      currentStep: '-',
      plannedFiles: '-',
      completedSoFar: '-',
      nextStepExact: '-',
      verificationCommand: '-',
      updatedTimestamp: '-'
    },
    assumptions: [],
    revisions: [],
    handoverNotes: '',
    auditLog: []
  };
}

async function runTests() {
  console.log('=== TC-P16-01: Atomic Task Claim Guard & Ownership Protection Test ===');
  let passed = 0;
  const total = 5;

  let state = createMockState();
  localStorage.clear();

  // 1. Klaim awal oleh Eko
  const claimRes = claimTask('TASK-101', memberEko, state);
  if (claimRes.success && claimRes.updatedState) {
    state = claimRes.updatedState;
    const activeClaim = getActiveTaskClaim();
    if (activeClaim && activeClaim.memberId === 'eko' && state.status.activeTask === 'TASK-101') {
      console.log('[PASS] Check 1: Inisiasi klaim task TASK-101 oleh Eko berhasil tersimpan (status IN_PROGRESS)');
      passed++;
    } else {
      console.error('[FAIL] Check 1: Record klaim aktif tidak sesuai:', activeClaim);
    }
  } else {
    console.error('[FAIL] Check 1: Gagal mengklaim task:', claimRes.error);
  }

  // 2. Proteksi kepemilikan: Oned tidak boleh merilis task Eko secara langsung
  const canOnedMutate = canMutateTaskClaim('TASK-101', 'oned');
  const releaseAttempt = releaseTaskClaim('TASK-101', state, 'Percobaan rilis ilegal oleh Oned', undefined, { memberId: 'oned' });
  if (!canOnedMutate.allowed && !releaseAttempt.success && (releaseAttempt.error?.includes('dimiliki oleh') || releaseAttempt.error?.includes('Ambil Alih'))) {
    console.log('[PASS] Check 2: Anggota lain (Oned) ditolak saat mencoba merilis task milik Eko secara langsung');
    passed++;
  } else {
    console.error('[FAIL] Check 2: Proteksi mutasi gagal memblokir rilis anggota lain:', releaseAttempt);
  }

  // 3. Penolakan Ambil Alih jika alasan kosong atau < 5 karakter
  const invalidTakeover = takeoverTaskClaim('TASK-101', memberOned, 'err', state);
  if (!invalidTakeover.success && invalidTakeover.error?.includes('minimal 5 karakter')) {
    console.log('[PASS] Check 3: Validasi alasan ambil alih eksplisit (min 5 chars) ditegakkan');
    passed++;
  } else {
    console.error('[FAIL] Check 3: Validasi alasan ambil alih tidak memblokir:', invalidTakeover);
  }

  // 4. Ambil alih berhasil oleh Oned dengan alasan lengkap & pencatatan jejak audit
  const validReason = 'Estafet shift pengerjaan: Eko offline, Oned melanjutkan implementasi';
  const takeoverRes = takeoverTaskClaim('TASK-101', memberOned, validReason, state);
  if (takeoverRes.success && takeoverRes.updatedState && takeoverRes.claim) {
    state = takeoverRes.updatedState;
    const activeClaim = getActiveTaskClaim();
    const hasAuditEntry = state.auditLog.some(log => log.includes('AMBIL_ALIH') && log.includes('Oned') && log.includes('Eko'));
    const walUpdated = state.wal.completedSoFar.includes('Eko ke Oned');

    if (activeClaim?.memberId === 'oned' && hasAuditEntry && walUpdated) {
      console.log('[PASS] Check 4: Ambil alih task oleh Oned berhasil dicatat ke Audit Log & WAL dengan provenance lengkap');
      passed++;
    } else {
      console.error('[FAIL] Check 4: Jejak audit atau kepemilikan tidak tercatat sempurna:', { activeClaim, hasAuditEntry, walUpdated });
    }
  } else {
    console.error('[FAIL] Check 4: Pengambilalihan gagal:', takeoverRes.error);
  }

  // 5. Compare-and-Swap (CAS) Protection terhadap Stale Revision
  const staleRevision = 1; // Revisi sekarang sudah bertambah lebih dari 1
  const staleTakeover = takeoverTaskClaim('TASK-101', memberEko, 'Revisi basi coba ambil alih', state, staleRevision);
  if (!staleTakeover.success && staleTakeover.error?.includes('STALE_REVISION')) {
    console.log('[PASS] Check 5: Penolakan CAS terhadap nomor revisi basi (STALE_REVISION) berhasil dicegah');
    passed++;
  } else {
    console.error('[FAIL] Check 5: CAS protection gagal mendeteksi revisi basi:', staleTakeover);
  }

  console.log(`Result: TC-P16-01 ${passed === total ? 'PASS' : 'FAIL'} (${passed}/${total} checks): Atomic Task Claim Guard & Ownership Protection terverifikasi 100%`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
