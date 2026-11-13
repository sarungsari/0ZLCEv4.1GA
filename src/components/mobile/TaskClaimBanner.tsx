import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  ShieldAlert,
  X,
  AlertTriangle
} from 'lucide-react';
import { ParsedSessionState } from '../../types/zlce';
import { TeamMember } from '../../types/mobile';
import { 
  getActiveTaskClaim, 
  TaskClaimRecord, 
  releaseTaskClaim,
  takeoverTaskClaim,
  saveActiveTaskClaim,
  incrementClaimRevision,
  canMutateTaskClaim
} from '../../utils/taskClaimManager';
import { getMemberById } from '../../data/teamMembers';
import { ConfirmDialog } from './ConfirmDialog';
import { DraftTextarea } from './DraftTextarea';
import { showToast } from './ToastContainer';

interface TaskClaimBannerProps {
  sessionState: ParsedSessionState;
  activeMember: TeamMember;
  onCommitChange: (updatedState: ParsedSessionState) => void;
  onRequestApproval?: (taskId: string) => void;
  className?: string;
}

export const TaskClaimBanner: React.FC<TaskClaimBannerProps> = ({
  sessionState,
  activeMember,
  onCommitChange,
  onRequestApproval,
  className = ''
}) => {
  const [activeClaim, setActiveClaim] = useState<TaskClaimRecord | null>(() => getActiveTaskClaim());
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  
  // State modal ambil alih & dialog rilis konfirmasi
  const [showTakeoverModal, setShowTakeoverModal] = useState<boolean>(false);
  const [takeoverReason, setTakeoverReason] = useState<string>('');
  const [takeoverError, setTakeoverError] = useState<string>('');
  const [showReleaseConfirm, setShowReleaseConfirm] = useState<boolean>(false);

  // Cari task berstatus IN_PROGRESS di matriks
  const inProgressTask = sessionState.tasks.find(t => t.status === 'IN_PROGRESS');

  // Sinkronkan claim dengan localStorage dan event
  useEffect(() => {
    const syncClaim = () => {
      const claim = getActiveTaskClaim();
      setActiveClaim(claim);
    };

    window.addEventListener('storage', syncClaim);
    window.addEventListener('zlce-task-claim-changed', syncClaim);
    
    return () => {
      window.removeEventListener('storage', syncClaim);
      window.removeEventListener('zlce-task-claim-changed', syncClaim);
    };
  }, []);

  // Update timer durasi pengerjaan
  useEffect(() => {
    if (!activeClaim?.claimedAtISO) return;

    const updateElapsed = () => {
      const start = new Date(activeClaim.claimedAtISO).getTime();
      const now = Date.now();
      const mins = Math.max(0, Math.floor((now - start) / 60000));
      setElapsedMinutes(mins);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 30000); // Tiap 30 detik
    return () => clearInterval(interval);
  }, [activeClaim]);

  // TASK-101: Jangan klaim otomatis senyap saat berpindah profil anggota tim.
  // Hanya buat fallback jika localStorage sama sekali kosong dan ada inProgressTask di sessionState.
  useEffect(() => {
    if (inProgressTask) {
      const existing = getActiveTaskClaim();
      if (existing && existing.taskId === inProgressTask.id) {
        setActiveClaim(existing);
        return;
      }
      if (!activeClaim) {
        const fallbackClaim: TaskClaimRecord = {
          taskId: inProgressTask.id,
          taskName: inProgressTask.name,
          memberId: activeMember.id,
          memberName: activeMember.name,
          memberAvatar: activeMember.avatarColor,
          claimedAtISO: new Date().toISOString(),
          claimedAtWIB: new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false }) + ' WIB',
          status: 'ACTIVE',
          revision: incrementClaimRevision()
        };
        saveActiveTaskClaim(fallbackClaim);
        setActiveClaim(fallbackClaim);
      }
    } else if (!inProgressTask && activeClaim) {
      saveActiveTaskClaim(null);
      setActiveClaim(null);
    }
  }, [inProgressTask]); // Bebas dari dependensi activeMember agar tidak overwrite

  // Handle rilis klaim dengan proteksi kepemilikan (TASK-101 & TASK-102)
  const handleConfirmRelease = () => {
    if (!inProgressTask) return;
    const mutateCheck = canMutateTaskClaim(inProgressTask.id, activeMember.id);
    if (!mutateCheck.allowed) {
      showToast(mutateCheck.reason || 'Anda bukan pemilik klaim aktif.', 'error');
      setShowReleaseConfirm(false);
      return;
    }

    const res = releaseTaskClaim(
      inProgressTask.id, 
      sessionState, 
      `Dilepaskan oleh ${activeMember.name}`, 
      undefined, 
      { memberId: activeMember.id }
    );
    if (res.success && res.updatedState) {
      onCommitChange(res.updatedState);
      setActiveClaim(null);
      showToast(`Klaim untuk ${inProgressTask.id} berhasil dilepaskan ke status READY.`, 'info');
    } else {
      showToast(res.error || 'Gagal melepaskan klaim.', 'error');
    }
    setShowReleaseConfirm(false);
  };

  // Handle pengesahan ambil alih task (TASK-101)
  const handleConfirmTakeover = () => {
    if (!inProgressTask) return;
    const reasonTrimmed = takeoverReason.trim();
    if (reasonTrimmed.length < 5) {
      setTakeoverError('Alasan pengambilalihan wajib diisi minimal 5 karakter untuk jejak audit tim.');
      return;
    }

    const res = takeoverTaskClaim(
      inProgressTask.id,
      activeMember,
      reasonTrimmed,
      sessionState
    );

    if (res.success && res.updatedState && res.claim) {
      onCommitChange(res.updatedState);
      setActiveClaim(res.claim);
      setShowTakeoverModal(false);
      setTakeoverReason('');
      setTakeoverError('');
      showToast(`Task ${inProgressTask.id} berhasil diambil alih oleh ${activeMember.name}.`, 'success');
    } else {
      setTakeoverError(res.error || 'Gagal mengambil alih klaim.');
    }
  };

  // Jika tidak ada task IN_PROGRESS
  if (!inProgressTask) {
    return (
      <div className={`p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            <strong>Status Pengerjaan:</strong> Tidak ada task aktif. Tablet siap untuk mengambil task baru (Batas Maksimal 1 Task Aktif).
          </span>
        </div>
        <span className="text-xs font-mono text-cyan-400">Siap Klaim</span>
      </div>
    );
  }

  const claimDriver = activeClaim ? getMemberById(activeClaim.memberId) : activeMember;
  const isCurrentDriver = claimDriver.id.toLowerCase() === activeMember.id.toLowerCase();

  return (
    <>
      <div className={`p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-600/40 rounded-2xl shadow-lg ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Detail Task & Pemegang Klaim */}
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${claimDriver.avatarColor} flex items-center justify-center font-bold text-white text-base shadow shrink-0 ring-2 ring-amber-500/50`}>
              {claimDriver.name.slice(0, 1)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  KLAIM AKTIF: {inProgressTask.id}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Pemegang: <strong className="text-white">{claimDriver.name}</strong> (@{claimDriver.id})
                </span>
                {isCurrentDriver ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Anda
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Anggota Lain
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white">
                {inProgressTask.name}
              </h4>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Mulai: {activeClaim?.claimedAtWIB || 'Baru saja'} {elapsedMinutes > 0 ? `(${elapsedMinutes} mnt)` : ''}
                </span>
                <span>•</span>
                <span className="text-emerald-400">Aturan 1 Task IN_PROGRESS Terkunci</span>
              </div>

              {!isCurrentDriver && (
                <p className="text-xs text-amber-400/90 font-sans italic pt-0.5">
                  Klaim aktif dipegang oleh {claimDriver.name}. Anda tidak dapat merilis atau menyelesaikan langsung tanpa Ambil Alih.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Target sentuh ergonomis tablet >= 44px */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0">
            {!isCurrentDriver ? (
              <button
                type="button"
                onClick={() => {
                  setTakeoverError('');
                  setShowTakeoverModal(true);
                }}
                className="touch-target-44 min-h-[44px] px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-amber-900/40"
                title="Ambil alih klaim task dengan alasan eksplisit untuk log audit"
              >
                <UserCheck className="w-4 h-4 text-amber-100" />
                <span>Ambil Alih Task</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowReleaseConfirm(true)}
                  className="touch-target-44 min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition active:scale-95 border border-slate-700"
                  title="Kembalikan task ke status READY"
                >
                  <Unlock className="w-4 h-4 text-slate-400" />
                  <span>Rilis Klaim</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onRequestApproval) {
                      onRequestApproval(inProgressTask.id);
                    }
                  }}
                  className="touch-target-44 min-h-[44px] px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-900/40"
                  title="Ajukan verifikasi gerbang kualitas dan tandai DONE"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Selesaikan &amp; Setujui</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Konfirmasi Rilis Klaim (TASK-102) */}
      <ConfirmDialog
        isOpen={showReleaseConfirm}
        title={`Rilis Klaim Task ${inProgressTask.id}`}
        message={
          <span>
            Apakah Anda yakin ingin melepaskan klaim untuk <strong>{inProgressTask.id} ({inProgressTask.name})</strong>?
            Task akan dikembalikan ke status <code>READY</code> dan dapat diklaim oleh anggota tim lain.
          </span>
        }
        confirmLabel="Ya, Rilis Klaim"
        cancelLabel="Batal"
        variant="warning"
        onConfirm={handleConfirmRelease}
        onCancel={() => setShowReleaseConfirm(false)}
      />

      {/* Modal Dialog Ambil Alih Task (TASK-101) */}
      {showTakeoverModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="takeover-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTakeoverModal(false);
          }}
        >
          <div className="w-full max-w-lg bg-slate-900 border border-amber-600/50 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col gap-4 modal-viewport-bounded">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="takeover-dialog-title" className="text-base font-bold text-white tracking-tight">
                  Ambil Alih Klaim: {inProgressTask.id}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Task ini saat ini sedang dikerjakan oleh <strong>{claimDriver.name}</strong> (@{claimDriver.id}).
                  Pengambilalihan akan mengalihkan kepemilikan aktif ke <strong>{activeMember.name}</strong> dan mencatatnya ke jejak audit provenance tim.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="takeover-reason" className="block text-xs font-semibold text-slate-200">
                Alasan Pengambilalihan (Minimal 5 karakter) <span className="text-rose-400">*</span>:
              </label>
              <DraftTextarea
                id="takeover-reason"
                rows={3}
                value={takeoverReason}
                onChange={(val) => {
                  setTakeoverReason(val);
                  if (takeoverError) setTakeoverError('');
                }}
                storageKey="zlce_task_takeover_reason_draft"
                taskId={inProgressTask?.id}
                memberId={activeMember?.id}
                placeholder="Contoh: Estafet shift malam; anggota sebelumnya telah menyelesaikan bagian backend dan menyerahkan pengujian tablet..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
                showDraftIndicator={false}
              />
              {takeoverError && (
                <p className="text-xs text-rose-400 font-medium">
                  {takeoverError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowTakeoverModal(false)}
                className="touch-target-48 min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Batal</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmTakeover}
                className="touch-target-48 min-h-[48px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs sm:text-sm font-bold transition active:scale-95 shadow-md shadow-amber-950/50 flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-amber-200" />
                <span>Konfirmasi Ambil Alih</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
