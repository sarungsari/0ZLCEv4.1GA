# PANDUAN OPERASIONAL PRODUKSI NYATA (PRODUCTION OPERATIONS MANUAL)
## ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob) Hardened
### Standar Operasional Prosedur (SOP) Tablet Bersama Samsung Galaxy Tab A7 Lite (SM-T225)

---

## 1. RINGKASAN ARSITEKTUR PRODUKSI

ZLCE Mobile Workbench v4.1.0 GA (`ZLCEv4.1Mob`) dirancang khusus untuk memfasilitasi estafet rekayasa perangkat lunak multi-AI (Claude, ChatGPT, Gemini, DeepSeek) oleh **8 anggota tim** yang berbagi satu unit fisik tablet Samsung Galaxy Tab A7 Lite (RAM 3 GB, MediaTek Helio P22T, ROM 32 GB, Android 11–14).

```
   ┌─────────────────────────────────────────────────────────────┐
   │         TABLET BERSAMA (Samsung Galaxy Tab A7 Lite)          │
   ├──────────────────────────────┬──────────────────────────────┤
   │   PROGRESSIVE WEB APP (UI)   │      TERMUX POSIX ENGINE     │
   │  • Offline Service Worker    │  • Git Local Repository      │
   │  • LocalStorage Multi-User   │  • Python 3.11 Runtime       │
   │  • 400ms Debounce LMK Guard  │  • CLI Dispatcher 'zlce'     │
   │  • Ergonomi Sentuh ≥ 44px    │  • Memory Cache (15 menit)   │
   └──────────────▲───────────────┴──────────────▲───────────────┘
                  │                              │
                  ▼                              ▼
      Single Source of Truth: /SESSION_STATE.md & /TASKS.md
```

### 5 Invarian Mutlak Sistem ZLCE:
1. **Invarian I1 (Single Source of Truth):** Segala status proyek hanya diatur oleh `SESSION_STATE.md`.
2. **Invarian I2 (Cold-Start Resume):** Pengemudi baru atau model AI baru harus dapat langsung bekerja hanya dengan membaca `SESSION_STATE.md`.
3. **Invarian I3 (Atomic WAL Handover):** Setiap pekerjaan aktif dicatat di Bagian 3 (WAL). Maksimal 1 task `IN_PROGRESS`.
4. **Invarian I4 (Strict Provenance Tracking):** Persetujuan gerbang kualitas wajib mencantumkan identitas pengesah: `ya (oleh: [Nama])`.
5. **Invarian I5 (Deterministic Quality Gates):** Sebelum menandai `DONE`, wajib menyertakan bukti verifikasi nyata ($\ge 5$ karakter).

---

## 2. SATU PERINTAH PELUNCURAN PRODUKSI (1-TAP START)

Untuk memulai Workbench di lingkungan nyata (Termux di Samsung Tab A7 Lite), buka aplikasi Termux dan jalankan:

```bash
cd ~/projects/0ZLCEv4.1GA
bash scripts/zlce-prod-start.sh
```

Skrip ini akan secara otomatis:
1. Menormalkan seluruh izin eksekusi berkas utilitas POSIX (`0755`).
2. Memeriksa ketersediaan runtime Node.js, Python 3, dan Git.
3. Memeriksa keberadaan `node_modules` (otomatis memicu `npm install` bila belum ada).
4. Memvalidasi kepatuhan dokumen kontrol via `python3 scripts/zlce-check.py .` (dapat dilewati dalam darurat via `--skip-check` atau `ZLCE_SKIP_CHECK=1`).
5. Memeriksa bundel produksi `dist/` (mengompilasi otomatis bila belum ada).
6. Menjalankan static preview server pada `http://localhost:3000`.

*Catatan Keamanan HOST (Tablet Bersama):*
Secara bawaan server mengikat ke `0.0.0.0`. Di tablet bersama atau jaringan Wi-Fi publik, **sangat disarankan** mengikat hanya ke localhost agar aplikasi tidak terbuka bagi perangkat lain di jaringan:
```bash
HOST=127.0.0.1 bash scripts/zlce-prod-start.sh
```

---

## 3. ALUR KERJA ESTAFET HARIAN (8 LANGKAH STANDAR OPERASIONAL)

Setiap anggota tim yang menerima giliran memegang tablet fisik wajib mengikuti siklus 8 langkah standar (identik dengan `USER_GUIDE.md`):

```
[1. Ambil Tablet] ──> [2. Pilih Anggota & Cek Status] ──> [3. Klaim Task (1 Max)]
        │                                                                │
[8. Serah Terima & Clean-Auth] <── [7. Push Branch] <── [6. Validasi & Commit] <── [5. Eksekusi AI] <── [4. Rancang Context Pack]
```

### Langkah 1: Menerima Tablet & Pemeriksaan Status
* Hidupkan tablet, buka aplikasi **ZLCEv4.1Mob** dari Layar Utama (PWA Standalone).
* Periksa status header: pastikan tidak ada task `IN_PROGRESS` yang tertinggal dari sesi sebelumnya.

### Langkah 2: Mengalihkan Driver Aktif di UI
* Ketuk selektor anggota di bilah Header pojok kanan atas.
* Pilih nama profil Anda dari 8 anggota tim resmi (sumber tunggal: `src/data/teamMembers.ts`):
  1. **Eko** (`eko@zlce.local`) - System & Git Coordinator (Lead)
  2. **Oned** (`oned@zlce.local`) - Frontend & Mobile UI Specialist
  3. **Cxperia** (`cxperia@zlce.local`) - QA & Test Harness Lead
  4. **Sulistiyani** (`sulistiyani@zlce.local`) - PWA & Offline Architect
  5. **Layang** (`layang@zlce.local`) - Context & Prompt Engineer
  6. **Acimau** (`acimau@zlce.local`) - Git & Sync Hub Specialist
  7. **Kepek** (`kepek@zlce.local`) - Security & Zero-Secret Officer
  8. **Gete** (`gete@zlce.local`) - Mobile UX & Ergonomics Reviewer

### Langkah 3: Mengklaim Task di Matriks Sesi
* Masuk ke tab **SESSION_STATE** atau **Dashboard**.
* Pilih task dengan status `READY`.
* Ubah status menjadi `IN_PROGRESS`. Sistem secara atomik mengunci task dengan urutan revisi monotonik (*Atomic Task Claim Guard*). Tepat 1 task boleh aktif.

### Langkah 4: Menghasilkan Context Pack Portabel
* Buka tab **Context Pack** atau **Prompt Studio**.
* Pilih AI sasaran yang akan Anda gunakan (Claude 5.5 Sonnet, ChatGPT GPT-4o, Gemini 4 Hydrogen (Free), DeepSeek).
* Ketuk tombol **Salin Context Pack (1-Ketukan)** atau unduh `.md`.

### Langkah 5: Eksekusi Rekayasa dengan AI Eksternal
* Buka tab browser AI eksternal atau aplikasi terkait.
* Tempelkan prompt mandat estafet C-I-DI (*Context - Instruction - Details - Invariants*).
* Eksekusi kode di Termux pada cabang Git terisolasi per task:
  ```bash
  git checkout -b task/TASK-xxx
  ```
* Commit perubahan dengan menyertakan identitas per-perintah (Zero-Secret):
  ```bash
  git -c user.name="Nama Pengemudi" -c user.email="nama@zlce.local" commit -m "feat: deskripsi task"
  ```

### Langkah 6: Validasi Bukti, Commit & Pengesahan Gerbang
* Jalankan verifikasi kepatuhan:
  ```bash
  npm run build && python3 scripts/zlce-check.py .
  ```
* Buka modal **Sahkan Gerbang** di UI ZLCEv4.1Mob. Masukkan bukti verifikasi nyata ($\ge 5$ karakter, contoh: `pytest 10/10 pass, build 0 error`).
* Sistem otomatis menyuntikkan provenance `ya (oleh: [Nama Driver])`.
* Lakukan commit task beridentitas:
  ```bash
  git -c user.name="Nama Pengemudi" -c user.email="nama@zlce.local" commit -m "feat: implementasi TASK-xxx"
  ```

### Langkah 7: Dorong Cabang Task ke Repositori Remote
* Dorong branch task terisolasi ke remote GitHub:
  ```bash
  zlce push
  # atau: git push origin task/TASK-xxx
  ```
* *Perhatian:* CLI dispatcher `zlce push` secara tegas memblokir push langsung ke branch `main`.

### Langkah 8: Serah Terima Fisik & Sanitasi Kredensial RAM (Clean-Auth)
* Buka wizard **Oper Tablet** di UI ZLCEv4.1Mob, verifikasi checklist 8 butir, dan catat serah terima di Bagian 6 `SESSION_STATE.md`.
* Jalankan pembersihan kredensial RAM di Termux:
  ```bash
  bash scripts/zlce/clean-auth.sh
  ```
* Tutup seluruh tab peramban AI dan serahkan tablet fisik ke pengemudi berikutnya.

---

## 4. PROTOKOL PENYELAMATAN DARURAT DI LAPANGAN (CASES A–D)

Bila terjadi inkonsistensi status, crash browser, atau konflik git di tablet, gunakan panduan cepat berikut (selaras 100% dengan `USAGE.md` dan `09_FAILURE_AND_RECOVERY.md`):

| Kasus | Gejala | Tindakan Penyelamatan di Termux |
| :--- | :--- | :--- |
| **Kasus A** | Sesi terputus, working-tree bersih, tidak ada uncommitted diff | `python3 scripts/zlce-check.py .`<br>Bila OK, lanjutkan langkah WAL berikutnya. |
| **Kasus B** | Ada berkas berubah uncommitted yang sesuai dengan daftar WAL | Review berkas: `git status`<br>Commit: `git -c user.name="Nama" -c user.email="email@zlce.local" commit -am "wip: sesuai WAL"` |
| **Kasus C** | Ada commit lokal baru yang belum tercatat di SESSION_STATE | Ekstrak log: `git log -1 --stat`<br>Perbarui `SESSION_STATE.md` mencerminkan commit tersebut. |
| **Kasus D** | Ada perubahan liar di luar daftar WAL | Tandai task `BLOCKED` di `SESSION_STATE.md`. Amankan sementara via `git stash` dan minta konfirmasi manusia sebelum melangkah. |

---

## 5. MANAJEMEN MEMORI RAM 3GB & ANDROID LMK

Tablet Samsung Galaxy Tab A7 Lite memiliki memori fisik 3GB yang rentan terhadap penutupan paksa oleh Android Low Memory Killer (LMK):
1. **Debounce 400ms & Lifecycle Flush:** Antarmuka ZLCEv4.1Mob secara otomatis menyimpan draft editor ke `localStorage` dengan penundaan 400ms dan langsung mem-flush data saat aplikasi diminimalkan (`visibilitychange` / `pagehide`).
2. **Loss-Bounded Persistence (RPO $\le$ 400ms):** Maksimal potensi kehilangan ketikan saat tablet dimatikan mendadak oleh kernel adalah 400 milidetik.
3. **Peringatan Hemat RAM:** Jangan membuka lebih dari 2–3 tab di Google Chrome secara bersamaan di tablet ini (selaras dengan panduan `USER_GUIDE.md`).

---

## 6. PEMELIHARAAN & BACKUP PERIODIK

Jalankan skrip backup secara berkala:
```bash
# Snapshot cepat status repositori
bash scripts/zlce-snapshot.sh . --diff

# Pembuatan bundel audit deterministik lengkap (200+ berkas self-contained)
python3 scripts/create-audit-bundle.py
```

Arsip ZIP akan tersimpan di `release-bundles/zlce-audit-review-bundle.zip` (terpisah dari `dist/assets/` PWA) dan siap dipindahkan via USB OTG atau penyimpanan awan.

---

## 7. CATATAN TEKNIS SINKRONISASI (`vite-session-sync.ts`)

Plugin `vite-session-sync.ts` memfasilitasi integrasi WebSocket / Server-Sent Events (SSE) antara editor file disk dan antarmuka web pada mode pengembangan lokal (`npm run dev`). Pada mode produksi mandiri (`vite preview` via `zlce-prod-start.sh`), PWA beroperasi secara offline client-side menggunakan LocalStorage cache dan eksekusi skrip POSIX one-shot di Termux.
