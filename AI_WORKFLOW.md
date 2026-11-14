# TATA KELOLA AI, ALUR KERJA & STANDAR TEKNIS: ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)

Satu-satunya definisi aturan kerja, enum status, triase revisi, WAL, dan protokol git untuk repositori **ZLCE Mobile Workbench v4.1.0 GA (`ZLCEv4.1Mob`)**. Berkas lain merujuk ke dokumen ini (`docs/mobile/blueprint/` untuk rincian spesifikasi domain).

---

## 1. KONVENSI TEKNIS

1. **Bahasa dokumentasi:** teknis murni dalam Bahasa Indonesia, ringkas, bullet/tabel, tanpa narasi berlebihan.
2. **Waktu (ISO 8601 + WIB):** mis. `2026-11-13 19:54:12 WIB` atau `2026-11-13 jam: ?` bila jam tidak ada di sumber.
3. **Penamaan & Stack (`React 19 + TypeScript + Vite + Tailwind CSS + Termux`):**
   - Komponen React & halaman: `PascalCase.tsx` (`src/components/`, `src/components/mobile/`).
   - Utilitas, hooks, skrip: `camelCase.ts` / `use*.ts` (`src/utils/`, `src/hooks/`), `kebab-case.sh/.py` (`scripts/`).
   - Konstanta & tipe: `UPPER_SNAKE_CASE` untuk konstanta global; `PascalCase` untuk interface/type; `camelCase` untuk fungsi/variabel.
4. **Arsitektur Antarmuka 6-Tab Kanonik:** `dashboard`, `session`, `ai-workbench`, `terminal-git`, `diagnostics`, `docs` (`src/types/zlce.ts`), dengan target sentuh tablet SM-T225 minimal `44x44px` (`touch-target-44 min-h-[44px]`) dan ukuran tipografi minimal `12px` (`text-xs`).

---

## 2. ENUM STATUS (TUNGGAL)

`PENDING | READY | IN_PROGRESS | BLOCKED | DONE`

| Status | Arti |
| :--- | :--- |
| `PENDING` | Dependensi belum `DONE` |
| `READY` | Dependensi `DONE`, belum dimulai |
| `IN_PROGRESS` | Sedang dikerjakan (maks. 1 task) |
| `BLOCKED` | Terhenti; alasan wajib dicatat di `SESSION_STATE.md` |
| `DONE` | Acceptance Criteria terpenuhi + Bukti Verifikasi nyata terisi + `Disetujui: ya (oleh: Nama)` |

Nilai lain dilarang di semua berkas dan divalidasi ketat oleh `scripts/zlce/zlce-check.py`.

---

## 3. GUARDRAIL AI

1. Dilarang menghapus atau mengganti nama berkas kontrol tanpa persetujuan tertulis pengguna.
2. Satu task `IN_PROGRESS` pada satu waktu (Aturan Single Task / P2-CP6).
3. **Read-before-write:** baca kode modul target dan `Docs Terkait` sebelum menulis modifikasi.
4. **Tidak menebak (Anti-Halusinasi):** informasi di luar berkas/lampiran dianggap tidak diketahui. Catat `ASM-xx`/`Q-xx` di `SESSION_STATE.md` Bagian 4 dengan penomoran bersama tanpa memakai ulang ID.
5. Verifikasi versi & API library sebelum dipakai; catat di `BLUEPRINT.md` bagian dependensi.
6. Dilarang mengarang output perintah, hasil test, atau kode placeholder (`// ... rest of code`).
7. **Zero-Secret Policy:** rahasia hanya via `.env`; dilarang menyimpan token (`ghp_*`, `sk-*`), API key, atau surel pribadi di repositori/LocalStorage. Gunakan profil non-kredensial 8 anggota (`@zlce.local`) dan jalankan `bash scripts/zlce/clean-auth.sh` saat serah terima tablet.
8. **Aturan Waktu X1 (Anti-Ekstrapolasi):** dilarang mengarang atau memajukan jam secara sintetis (+5/+10 menit). Gunakan jam persis dari pesan pengguna/sistem/snapshot, atau tulis `'YYYY-MM-DD jam: ?'` bila tidak ada sumber jam baru.

---

## 4. PEMBACAAN BERTINGKAT

| Tier | Isi | Kapan |
| :--- | :--- | :--- |
| 0 | `SESSION_STATE.md` + entri task aktif di `TASKS.md` | Setiap sesi / awal handoff |
| 1 | Berkas di `Docs Terkait` task + kode modul yang diubah (`ARCHITECTURE.md`, `DATA_MODEL.md`, `docs/mobile/blueprint/`) | Per task |
| 2 | Template baku (`templates/`), starter kit (`zlce-starter-kit/`), dan arsip lokal pra-GA (`archive/`, terkecuali di `.gitignore`) | Hanya bila perlu |

---

## 5. ATURAN VERIFIKASI

1. `DONE` memerlukan: seluruh Acceptance Criteria terpenuhi, kolom `Bukti Verifikasi` terisi ($\ge 5$ karakter hasil output/test nyata), dan kolom `Disetujui` bertanda `ya` atau `ya (oleh: NamaAnggota)` dari 8 profil resmi (`Eko`, `Oned`, `Cxperia`, `Sulistiyani`, `Layang`, `Acimau`, `Kepek`, `Gete`).
2. Bukti = output nyata (`npm run build`, `npx tsc --noEmit`, `npm run lint`, `python3 scripts/run-tests.py`, `bash scripts/security-audit.sh`, `python3 scripts/zlce-check.py . --strict --no-git`).
3. AI tanpa kemampuan eksekusi: berikan perintah persis di Termux, pengguna menempel output, status tetap `IN_PROGRESS` sampai bukti masuk.
4. **Sinkronisasi Dokumen:** seluruh berkas pada `Docs Impact` diperbarui dalam task yang sama sebelum `DONE`.
5. `SESSION_STATE.md` diperbarui pada setiap perubahan status task, setiap commit, dan setiap langkah WAL (Bagian 8).
6. Persetujuan `DONE` harus eksplisit menyebut task atau `DONE`; pesan pendek ambigu tanpa konteks persetujuan bukan tanda sah `DONE`.

---

## 6. TRIASE REVISI (INTERRUPT PROTOCOL)

| Level | Kriteria | Penanganan |
| :--- | :--- | :--- |
| **Level S** | <= 1 berkas, <= 20 baris, tanpa perubahan skema/kontrak/keamanan/dependensi/AC | Eksekusi langsung; commit `[MINOR]`; catat di `CHANGELOG.md` (`Fixed`/`Changed`) |
| **Level M/L** | Selain Level S, atau ragu | Prosedur di bawah |

**Cek ketergantungan wajib sebelum membuat `TASK-REV-NN`:** apakah revisi mengubah atau bergantung pada keluaran task yang belum `DONE`?
- **YA:** jangan preempt. Pilih (i) ubah AC/`Docs Impact` task tersebut sebagai perubahan scope (catat di `Catatan Serah Terima` & `CHANGELOG.md`, minta persetujuan), atau (ii) daftarkan `TASK-REV-NN` berstatus `PENDING` dengan dependensi ke task tersebut.
- **TIDAK:**
  1. Jeda task aktif (`BLOCKED` dengan alasan `"preempted by TASK-REV-NN"`), pindahkan WAL ke `Catatan Serah Terima`, isi WAL baru untuk `TASK-REV-NN`.
  2. Daftarkan `TASK-REV-NN` di `TASKS.md` & `SESSION_STATE.md`.
  3. Eksekusi dan verifikasi hingga `DONE`, catat di `CHANGELOG.md`.
  4. Kembalikan task sebelumnya ke `IN_PROGRESS` dan pulihkan WAL.

Penomoran baku: `TASK-NNN` (reguler) dan `TASK-REV-NN` (revisi).

---

## 7. GIT & COMMIT (ADR-03 & ADR-05)

Conventional Commits dengan atribusi identitas per-commit (tanpa menyimpan git config global persisten di tablet bersama):

```bash
git checkout -b task/TASK-XXX
git -c user.name="Nama Anggota" -c user.email="alias@zlce.local" commit -m "feat(scope): deskripsi imperatif [TASK-XXX]"
```

- **Tipe:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `wip`.
- **Proteksi Cabang:** dilarang push langsung ke `main` (gunakan `zlce push` / cabang `task/TASK-XXX`).
- **Safe Pull:** selalu gunakan `git pull --ff-only`.
- **Serah Terima Tablet:** jalankan `bash scripts/zlce/clean-auth.sh` untuk membersihkan cache kredensial RAM.

---

## 8. CHECKPOINT & WAL (PENCEGAHAN SESI TERPUTUS & LMK RAM 3GB)

1. **WAL (Tulis-Dahulu):** sebelum langkah multi-berkas, isi `SESSION_STATE.md` Bagian 3 (`Task`, `Langkah Sedang Dikerjakan`, `Berkas Direncanakan/Disentuh`, `Sudah Dilakukan`, `Langkah Berikutnya (persis)`, `Perintah Verifikasi`, `Diperbarui`). Kosongkan semua menjadi `-` saat task `DONE`.
2. **Disk Bridge & Auto-Draft Cache:** di PWA dev-server (`vite-session-sync.ts`), perubahan UI dapat disinkronkan melalui `/api/session-state`, sementara di Mode Statis PWA dilindungi `useAutoDraftCache` (debounce `400ms` + flush sinkron pada `visibilitychange`/`pagehide`).
3. **Checkpoint Block (bila tanpa akses tulis berkas):**
   ```text
   === ZLCE CHECKPOINT [YYYY-MM-DD (HH:MM WIB | jam: ?)] ===
   ## 1. STATUS AKTIF
   ## 2. MATRIKS TASK
   ## 3. WORK IN PROGRESS (WAL)
   ## 6. CATATAN SERAH TERIMA
   ## 7. LOG AUDIT
   === END CHECKPOINT ===
   ```
4. **Validasi Wajib:** jalankan `python3 scripts/zlce-check.py . --strict` (atau `--no-git` bila tanpa `.git`) sebelum menandai `DONE`.

---

## 9. PEMULIHAN SESI TERPUTUS (RECOVERY)

Dipicu bila `SESSION_STATE.md` Bagian 3 (WAL) berisi task aktif atau pengguna menyatakan sesi terputus. Prompt pengarah: `HANDOVER.md`.

1. Ambil snapshot: `bash scripts/zlce/zlce-snapshot.sh --diff` (atau `git status --short`, `git log -5 --oneline`, `git diff --stat`).
2. Klasifikasi kondisi pemulihan:

| Kasus | Ciri | Tindakan |
| :--- | :--- | :--- |
| **A** | Working tree bersih, tidak ada commit baru | Lanjutkan dari `Langkah Berikutnya` WAL |
| **B** | Perubahan tak ter-commit pada berkas WAL | Baca diff, nilai kelengkapan terhadap AC, lanjutkan (dilarang `reset`/`checkout` tanpa persetujuan) |
| **C** | Ada commit bertanda task yang belum tercermin di `SESSION_STATE.md` | Perbarui `SESSION_STATE.md`, verifikasi ulang bukti baru |
| **D** | Perubahan pada berkas di luar daftar WAL | Laporkan dan tandai `BLOCKED`; tunggu konfirmasi pengguna |

3. Dalam pemulihan, `DONE` wajib disertai bukti verifikasi baru dan dicatat: `RECOVERY: kasus [A-D], langkah dilanjutkan [..]`.

---

## 10. MODE LITE (STARTER KIT PROYEK BARU < 15 TASK)

Direktori `zlce-starter-kit/` menyediakan kerangka siap salin untuk **Mode LITE** dengan **4 berkas kontrol inti**:
`BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md` (ditambah `AI_WORKFLOW.md` opsional sebagai referensi kerja):
1. Model data ringkas ditulis di `BLUEPRINT.md` bagian 7; strategi uji di bagian 8 (`DATA_MODEL.md` dan `TESTING.md` tidak dibuat).
2. `Docs Impact` hanya merujuk dokumen yang ada (`BLUEPRINT`, `TASKS`).
3. `Test Case` merujuk nama atau path uji (mis. `tests/auth.test.ts`), bukan ID `TC-xx`.
