import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Filter, 
  Clock, 
  User, 
  Tag, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Download,
  Share2
} from 'lucide-react';
import { MemberWorkLog, MemberWorkLogStatus } from '../../types/mobile';
import { 
  loadMemberWorkLogs, 
  saveMemberWorkLogs, 
  addMemberWorkLog, 
  updateMemberWorkLogNote, 
  deleteMemberWorkLog, 
  resetMemberWorkLogsToDefault,
  MEMBER_WORK_LOGS_EVENT 
} from '../../utils/memberWorkLogs';
import { TEAM_MEMBERS, getMemberById } from '../../data/teamMembers';
import { copyText } from '../../utils/clipboard';
import { useKeyboardAwareFocus } from '../../hooks/useKeyboardAwareFocus';
import { DraftTextarea } from './DraftTextarea';
import { ConfirmDialog } from './ConfirmDialog';

interface MemberWorkLogSectionProps {
  initialMemberId?: string;
  className?: string;
  onOpenTask?: (taskId: string) => void;
}

export const MemberWorkLogSection: React.FC<MemberWorkLogSectionProps> = ({
  initialMemberId,
  className = '',
  onOpenTask
}) => {
  // UX-01: Auto-scroll when virtual keyboard resizes viewport
  useKeyboardAwareFocus();

  const [logs, setLogs] = useState<MemberWorkLog[]>(() => loadMemberWorkLogs());
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>(initialMemberId || 'ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [logToDelete, setLogToDelete] = useState<{ id: string; memberName: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Form State untuk Log Baru
  const [newMemberId, setNewMemberId] = useState<string>(() => {
    try {
      return localStorage.getItem('zlce_active_member_id') || 'oned';
    } catch {
      return 'oned';
    }
  });
  const [newActivity, setNewActivity] = useState('');
  const [newTaskId, setNewTaskId] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState<MemberWorkLogStatus>('IN_PROGRESS');

  // State Editing Note per Log
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [editStatus, setEditStatus] = useState<MemberWorkLogStatus>('COMPLETED');

  // Sinkronisasi real-time antar tab & komponen
  useEffect(() => {
    const handleUpdate = () => {
      setLogs(loadMemberWorkLogs());
    };
    window.addEventListener(MEMBER_WORK_LOGS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(MEMBER_WORK_LOGS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleCopy = async (text: string, id: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleStartEdit = (log: MemberWorkLog) => {
    setEditingLogId(log.id);
    setEditNoteText(log.note);
    setEditStatus(log.status);
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setEditNoteText('');
  };

  const handleSaveEdit = (logId: string) => {
    if (!editNoteText.trim()) {
      showFeedback('Catatan tidak boleh kosong!');
      return;
    }
    const ok = updateMemberWorkLogNote(logId, editNoteText, editStatus);
    if (ok) {
      setLogs(loadMemberWorkLogs());
      setEditingLogId(null);
      showFeedback('Catatan kerja berhasil diperbarui!');
    }
  };

  const handleDelete = (logId: string, memberName: string) => {
    setLogToDelete({ id: logId, memberName });
  };

  const handleConfirmDelete = () => {
    if (!logToDelete) return;
    const ok = deleteMemberWorkLog(logToDelete.id);
    if (ok) {
      setLogs(loadMemberWorkLogs());
      showFeedback(`Log kerja ${logToDelete.memberName} berhasil dihapus.`);
    }
    setLogToDelete(null);
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.trim()) {
      showFeedback('Judul aktivitas wajib diisi!');
      return;
    }
    if (!newNote.trim()) {
      showFeedback('Catatan kerja wajib diisi!');
      return;
    }

    addMemberWorkLog({
      memberId: newMemberId,
      activity: newActivity,
      note: newNote,
      taskId: newTaskId.trim() || undefined,
      status: newStatus
    });

    setLogs(loadMemberWorkLogs());
    setIsAddingNew(false);
    setNewActivity('');
    setNewTaskId('');
    setNewNote('');
    setNewStatus('IN_PROGRESS');
    showFeedback('Log kerja baru berhasil dicatat!');
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    const reset = resetMemberWorkLogsToDefault();
    setLogs(reset);
    showFeedback('Log kerja dikembalikan ke data kanonik bawaan.');
    setShowResetConfirm(false);
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchMember = selectedMemberFilter === 'ALL' || log.memberId.toLowerCase() === selectedMemberFilter.toLowerCase();
      const matchStatus = selectedStatusFilter === 'ALL' || log.status === selectedStatusFilter;
      return matchMember && matchStatus;
    });
  }, [logs, selectedMemberFilter, selectedStatusFilter]);

  // Ekspor Markdown
  const generateMarkdownSummary = () => {
    let md = `# LOG KERJA ANGGOTA TIM ZLCE MOBILE WORKBENCH\n\n`;
    md += `*Tanggal Ekspor:* ${new Date().toLocaleString('id-ID')} WIB\n`;
    md += `*Total Entri:* ${filteredLogs.length} Log\n\n`;
    md += `| Waktu | Anggota | Task | Status | Aktivitas & Catatan |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    filteredLogs.forEach(l => {
      md += `| ${l.formattedTime} | **${l.memberName}** (@${l.memberId}) | ${l.taskId || '-'} | \`${l.status}\` | **${l.activity}**<br>${l.note} |\n`;
    });
    return md;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownSummary();
    const element = document.createElement('a');
    const file = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `LOG_KERJA_ANGGOTA_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    showFeedback('Berkas log kerja diunduh.');
  };

  const getStatusBadge = (status: MemberWorkLogStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/60">SELESAI</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-600/60">SEDANG BERJALAN</span>;
      case 'HANDOVER':
        return <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/60">SIAP HANDOVER</span>;
      case 'BLOCKED':
        return <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-950/80 text-red-300 border border-red-600/60">TERKENDALA</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="touch-target-44 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar Kontrol Log */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-950 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Log Kerja Anggota &amp; Catatan Aktivitas
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {filteredLogs.length} Catatan
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pencatatan aktivitas harian 8 anggota tim, catatan estafet yang bisa diedit, dan kepatuhan Zero-Secret
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="touch-target-44 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-950 flex items-center gap-2 transition"
            >
              {isAddingNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isAddingNew ? 'Tutup Formulir' : '+ Catat Log Kerja'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="touch-target-44 min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
              title="Unduh ringkasan log dalam format Markdown (.md)"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Unduh .md</span>
            </button>

            <button
              onClick={() => handleCopy(generateMarkdownSummary(), 'copy-all-logs')}
              className="touch-target-44 min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
              title="Salin seluruh log kerja ke clipboard"
            >
              {copiedId === 'copy-all-logs' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span className="hidden sm:inline">{copiedId === 'copy-all-logs' ? 'Tersalin' : 'Salin Semua'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-0.5 rounded-xl border border-slate-800">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400 text-[11px]">Anggota:</span>
              <select
                value={selectedMemberFilter}
                onChange={(e) => setSelectedMemberFilter(e.target.value)}
                className="touch-target-44 min-h-[44px] bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Semua Anggota (8 Driver)</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900">
                    {m.name} (@{m.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-0.5 rounded-xl border border-slate-800">
              <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-400 text-[11px]">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="touch-target-44 min-h-[44px] bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Semua Status</option>
                <option value="IN_PROGRESS" className="bg-slate-900">Sedang Berjalan</option>
                <option value="COMPLETED" className="bg-slate-900">Selesai</option>
                <option value="HANDOVER" className="bg-slate-900">Siap Handover</option>
                <option value="BLOCKED" className="bg-slate-900">Terkendala</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="touch-target-44 min-h-[44px] px-3 rounded-lg text-[11px] text-slate-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition"
            title="Kembalikan ke data log awal kanonik"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Bawaan</span>
          </button>
        </div>
      </div>

      {/* FORMULIR TAMBAH LOG BARU */}
      {isAddingNew && (
        <form 
          onSubmit={handleCreateLog}
          className="p-5 bg-slate-900/95 border-2 border-indigo-500/50 rounded-2xl shadow-2xl space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Tambah Catatan Log Kerja Baru
            </h4>
            <span className="text-[11px] font-mono text-emerald-400">
              Zero-Secret Policy Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pemilih Anggota */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anggota Tim Pelaksana:
              </label>
              <select
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                className="touch-target-44 min-h-[44px] w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
              >
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role.split('(')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Task ID Opsional */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Terkait Task (Opsional):
              </label>
              <input
                type="text"
                placeholder="Contoh: TASK-093"
                value={newTaskId}
                onChange={(e) => setNewTaskId(e.target.value)}
                className="touch-target-44 min-h-[44px] w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Status Log */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Pekerjaan:
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as MemberWorkLogStatus)}
                className="touch-target-44 min-h-[44px] w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="IN_PROGRESS">Sedang Berjalan</option>
                <option value="COMPLETED">Selesai</option>
                <option value="HANDOVER">Siap Handover</option>
                <option value="BLOCKED">Terkendala</option>
              </select>
            </div>
          </div>

          {/* Judul Aktivitas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Judul Aktivitas / Pekerjaan:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pengujian offline & sinkronisasi Termux"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              className="touch-target-44 min-h-[44px] w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Catatan / Note Detail (Dapat Diberi Note) */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <label className="font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Catatan Detail Anggota (Note):
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {newNote.length} karakter
              </span>
            </div>
            <DraftTextarea
              storageKey="zlce_member_worklog_new_note_draft"
              memberId={newMemberId}
              taskId={newTaskId}
              rows={3}
              placeholder="Tuliskan catatan kerja Anda: apa yang telah dicapai, file yang diubah, hasil verifikasi, atau pesan penting untuk rekan yang akan memegang tablet berikutnya..."
              value={newNote}
              onChange={setNewNote}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
            />
          </div>

          <div className="sticky-form-footer rounded-xl p-2 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="touch-target-44 min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="touch-target-44 min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Catatan Log</span>
            </button>
          </div>
        </form>
      )}

      {/* DAFTAR LOG KERJA ANGGOTA */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="font-semibold text-slate-300">Tidak ada log kerja yang cocok dengan filter saat ini.</p>
            <p className="text-[11px] text-slate-500">
              Pilih anggota lain dari filter atau klik tombol <strong>"+ Catat Log Kerja"</strong> untuk menambahkan catatan baru.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const member = getMemberById(log.memberId);
            const isEditing = editingLogId === log.id;

            return (
              <div 
                key={log.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isEditing 
                    ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/30' 
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 shadow-md'
                }`}
              >
                {/* Header Kartu Log */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${member.avatarColor} flex items-center justify-center font-bold text-white text-xs shadow shrink-0 mt-0.5`}>
                      {member.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {member.name}
                        </span>
                        <span className="text-[11px] font-mono text-indigo-400">
                          @{member.id}
                        </span>
                        <span>•</span>
                        <span className="text-xs text-slate-400 font-medium">
                          {member.role.split('(')[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {log.formattedTime}
                        </span>
                        {log.updatedAt && (
                          <span className="text-slate-500 italic">
                            (Diedit: {log.updatedAt})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    {log.taskId && (
                      <button
                        onClick={() => onOpenTask?.(log.taskId!)}
                        className="touch-target-44 min-h-[44px] px-3 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700 hover:bg-indigo-900 transition flex items-center gap-1"
                        title="Buka task di backlog"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>{log.taskId}</span>
                      </button>
                    )}
                    {getStatusBadge(log.status)}
                  </div>
                </div>

                {/* Judul Aktivitas */}
                <div className="pt-3">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {log.activity}
                  </h4>
                </div>

                {/* AREA CATATAN (NOTE) - VIEW & EDIT INTERAKTIF */}
                <div className="mt-2.5">
                  {isEditing ? (
                    /* FORM EDIT NOTE */
                    <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-cyan-500/50">
                      <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold">
                        <span className="flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5" /> Edit Catatan Kerja:
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {editNoteText.length} karakter
                        </span>
                      </div>

                      <DraftTextarea
                        storageKey={`zlce_member_worklog_edit_${editingLogId}`}
                        memberId={log.memberId}
                        taskId={log.taskId}
                        rows={3}
                        value={editNoteText}
                        onChange={setEditNoteText}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
                        placeholder="Ubah catatan kerja anggota..."
                        autoFocus
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400 text-[11px]">Ubah Status:</span>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as MemberWorkLogStatus)}
                            className="touch-target-44 min-h-[44px] bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none"
                          >
                            <option value="IN_PROGRESS">Sedang Berjalan</option>
                            <option value="COMPLETED">Selesai</option>
                            <option value="HANDOVER">Siap Handover</option>
                            <option value="BLOCKED">Terkendala</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="touch-target-44 min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(log.id)}
                            className="touch-target-44 min-h-[44px] px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow transition"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Simpan Note</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* TAMPILAN VIEW NOTE DENGAN TOMBOL EDIT */
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed group relative flex flex-col justify-between gap-2">
                      <p className="whitespace-pre-wrap font-sans text-[12px] text-slate-200">
                        {log.note || <em className="text-slate-500">Belum ada catatan detail.</em>}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                          <span>ID: {log.id}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(log.note, `copy-${log.id}`)}
                            className="touch-target-44 min-h-[44px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px] transition"
                            title="Salin catatan ini"
                          >
                            {copiedId === `copy-${log.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            <span>{copiedId === `copy-${log.id}` ? 'Tersalin' : 'Salin Note'}</span>
                          </button>

                          <button
                            onClick={() => handleStartEdit(log)}
                            className="touch-target-44 min-h-[44px] px-3 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 flex items-center gap-1.5 font-semibold text-[11px] transition"
                            title="Edit catatan log kerja ini"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Edit Note</span>
                          </button>

                          <button
                            onClick={() => handleDelete(log.id, member.name)}
                            className="touch-target-44 min-h-[44px] min-w-[44px] rounded-lg bg-slate-800/60 hover:bg-red-950 hover:text-red-300 text-slate-500 flex items-center justify-center transition active:scale-90"
                            title="Hapus log kerja ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Modal Dialog Konfirmasi Hapus Log Kerja (TASK-102) */}
      <ConfirmDialog
        isOpen={Boolean(logToDelete)}
        title="Hapus Catatan Log Kerja"
        message={
          <span>
            Apakah Anda yakin ingin menghapus catatan log kerja dari <strong>{logToDelete?.memberName}</strong>?
          </span>
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setLogToDelete(null)}
      />

      {/* Modal Dialog Konfirmasi Reset Log Kerja ke Standar (TASK-102) */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Log Kerja ke Data Kanonik"
        message={
          <span>
            Apakah Anda yakin ingin mengembalikan log kerja ke 8 catatan kanonik bawaan? Catatan kustom Anda akan direset.
          </span>
        }
        confirmLabel="Ya, Reset Log"
        cancelLabel="Batal"
        variant="warning"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
