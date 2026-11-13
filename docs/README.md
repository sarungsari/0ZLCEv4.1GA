# Pusat Dokumentasi ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)

Selamat datang di pusat dokumentasi resmi **ZLCE Mobile Workbench v4.1.0 GA (`ZLCEv4.1Mob`)** — Zero-Loss Context Engineering.

Dokumentasi ini disusun ke dalam **3 Pilar Pemisahan Terstruktur** yang memisahkan secara tegas antara arsitektur sistem proyek, panduan teknis penyiapan lingkungan Termux/Android, dan tutorial pemakaian operasional harian aplikasi PWA.

---

```
                                  PUSAT DOKUMENTASI ZLCE
                                      (docs/README.md)
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      │                                      │                                      │
   PILAR 1                                PILAR 2                                PILAR 3
DOKUMENTASI PROYEK                TUTORIAL INSTALASI TERMUX               TUTORIAL PETUNJUK
  ZLCE WORKBENCH                   & APLIKASI PWA ANDROID                   PENGGUNAAN PWA
(Konsep, 14 Blueprint,            (Langkah dari Nol, Paket,              (Alur Harian 8 Anggota,
  Metodologi, & Revisi)           Storage, Server, & Pasang)            8 Langkah, Task, & Kasus A-D)
```

---

## PILAR 1: DOKUMENTASI PROYEK ZLCE MOBILE WORKBENCH
*Bagian ini membahas fondasi rekayasa, metodologi Zero-Loss Context Engineering, spesifikasi arsitektur teknis, dan catatan audit repositori.*

### 1.1 Metodologi & Konsep Dasar ZLCE
* **[`docs/USAGE.md`](USAGE.md)** — **Panduan Metodologi Inti ZLCE:**
  Menjelaskan filosofi *Single Source of Truth* pada berkas, 4 Gerbang Kualitas (*Quality Gates*), *Write-Ahead Logging* (WAL) task atomik, dan protokol triase revisi R1–R7.
* **[`docs/mobile/MOBILE_BLUEPRINT.md`](mobile/MOBILE_BLUEPRINT.md)** — **Ringkasan Eksekutif Arsitektur Mobile:**
  Visi tablet bersama 8.7" Samsung Galaxy Tab A7 Lite, kendala memori RAM 3GB, model estafet 8 anggota tim, dan prinsip *Zero-Secret*.
* **[`docs/mobile/FEASIBILITY_AND_DECISIONS.md`](mobile/FEASIBILITY_AND_DECISIONS.md)** — **Analisis Kelayakan & Keputusan ADR:**
  Hasil riset teknis pengujian tablet fisik SM-T225, uji performa browser, dan kompilasi keputusan arsitektur awal.

### 1.2 14 Cetak Biru Arsitektur Teknis (`docs/mobile/blueprint/`)
Kompilasi spesifikasi arsitektur komprehensif yang menjadi acuan implementasi kode sumber:

| Cetak Biru | Judul & Fokus Teknis | Berkas Rujukan |
| :--- | :--- | :--- |
| **Blueprint 01** | Visi Sistem, Batasan Memori 3GB & Arsitektur Umum | [`blueprint/01_SYSTEM_OVERVIEW.md`](mobile/blueprint/01_SYSTEM_OVERVIEW.md) |
| **Blueprint 02** | Arsitektur Komponen Antarmuka PWA & Tata Letak Sentuh 44px | [`blueprint/02_COMPONENT_ARCHITECTURE.md`](mobile/blueprint/02_COMPONENT_ARCHITECTURE.md) |
| **Blueprint 03** | Arsitektur PWA, Service Worker, Cache Offline & Manifest | [`blueprint/03_PWA_ARCHITECTURE.md`](mobile/blueprint/03_PWA_ARCHITECTURE.md) |
| **Blueprint 04** | Integrasi POSIX Shell Termux, Symlink & Antarmuka CLI | [`blueprint/04_TERMUX_INTEGRATION.md`](mobile/blueprint/04_TERMUX_INTEGRATION.md) |
| **Blueprint 05** | Penyimpanan Lokal, Write-Ahead Log (WAL) & Mitigasi LMK | [`blueprint/05_STORAGE_AND_SYNC.md`](mobile/blueprint/05_STORAGE_AND_SYNC.md) |
| **Blueprint 06** | Manajemen Cabang Git per Task & Konvensi Commit Identitas | [`blueprint/06_REPOSITORY_CHANGES.md`](mobile/blueprint/06_REPOSITORY_CHANGES.md) |
| **Blueprint 07** | Desain Alur Estafet Berantai 8 Anggota Tim & Handover State | [`blueprint/07_WORKFLOW_DESIGN.md`](mobile/blueprint/07_WORKFLOW_DESIGN.md) |
| **Blueprint 08** | Model Keamanan Zero-Secret & Isolasi Token di RAM (clean-auth) | [`blueprint/08_SECURITY_MODEL.md`](mobile/blueprint/08_SECURITY_MODEL.md) |
| **Blueprint 09** | Protokol Pemulihan Crash & Fail-Safe Kanonik Kasus A–D | [`blueprint/09_FAILURE_AND_RECOVERY.md`](mobile/blueprint/09_FAILURE_AND_RECOVERY.md) |
| **Blueprint 10** | Strategi Pengujian Otomatis & Harness Benchmark Multi-AI | [`blueprint/10_TEST_STRATEGY.md`](mobile/blueprint/10_TEST_STRATEGY.md) |
| **Blueprint 11** | Peta Jalan Implementasi (Fase 0 s/d Fase 21 — 134 Task) | [`blueprint/11_IMPLEMENTATION_ROADMAP.md`](mobile/blueprint/11_IMPLEMENTATION_ROADMAP.md) |
| **Blueprint 12** | Rekapitulasi 14 Architectural Decision Records (ADR-01 s/d ADR-14) | [`blueprint/12_ARCHITECTURE_DECISIONS.md`](mobile/blueprint/12_ARCHITECTURE_DECISIONS.md) |
| **Blueprint 13** | Katalog Perintah CLI Siap Pakai & Parameter Allowlist | [`blueprint/13_COMMAND_TEMPLATES.md`](mobile/blueprint/13_COMMAND_TEMPLATES.md) |
| **Blueprint 14** | Model Kolaborasi Multi-AI (Claude, ChatGPT, Gemini, DeepSeek) | [`blueprint/14_MULTI_AI_TEAM_MODEL.md`](mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md) |

### 1.3 Riwayat Audit & Evolusi Versi
* **[`docs/revisi/AUDIT_3.22.md`](revisi/AUDIT_3.22.md)** — Laporan audit komparatif ZLCE v3.2.2 terhadap tantangan lingkungan mobile.
* **[`docs/revisi/REVISION_PLAN.md`](revisi/REVISION_PLAN.md)** — Rencana aksi sistematis perbaikan 7 level revisi arsitektur.
* **[`docs/revisi/REVISION_REPORT.md`](revisi/REVISION_REPORT.md)** — Bukti verifikasi penutupan seluruh temuan audit v3.2.2.
* **[`docs/mobile/AUDIT_BASELINE.md`](mobile/AUDIT_BASELINE.md)** — Tolok ukur dasar pengujian fisik tablet Samsung Galaxy Tab A7 Lite.
* **[`docs/mobile/BLUEPRINT_REVIEW.md`](mobile/BLUEPRINT_REVIEW.md)** — Evaluasi mendalam konsistensi 14 cetak biru.
* **[`docs/archive/AUDIT_LOG_FASE_0_TO_18.md`](archive/AUDIT_LOG_FASE_0_TO_18.md)** — Arsip historis 62 entri log audit (`P2-CP1` s/d `TASK-118`, Fase 0–18).
* **`docs/archive/reports/`** — Arsip laporan audit & tinjauan historis pra-v4.1.0 GA yang dipindahkan dari `public/assets/aistudio/` agar direktori publik hanya memuat berkas aktif UI (`TASK-131`).

### 1.4 Klarifikasi Hubungan Starter Kit vs Berkas Root
* **`zlce-starter-kit/`** adalah template *clean skeleton* Mode LITE (4 berkas kontrol inti: `BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`) untuk memulai proyek baru.
* **Berkas Root Repositori** (10 dokumen kontrol Mode FULL: `BLUEPRINT.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `TASKS.md`, `TESTING.md`, `CHECKLISTS.md`, `AI_WORKFLOW.md`, `SESSION_STATE.md`, `CHANGELOG.md`, `HANDOVER.md`) adalah *state aktif operasional* pengembangan **ZLCE Mobile Workbench v4.1.0 GA** (134 task terdaftar, Fase 0 s/d 21).

---

## PILAR 2: TUTORIAL INSTALASI TERMUX & LANGKAH PENGAPLIKASIAN PWA DI ANDROID
*Panduan langkah demi langkah bagi pengembang pemula untuk menyiapkan terminal Linux di Android, menginstal dependensi, menyalakan server lokal, hingga memasang PWA di layar utama.*

### 2.1 Dokumen Rujukan
* **[`docs/mobile/INSTALLATION_ANDROID.md`](mobile/INSTALLATION_ANDROID.md)** — **Tutorial Instalasi Android Terurut (Termux ➔ PWA):**
  Panduan utama 8 langkah logis dari nol: persiapan perangkat, unduh Termux F-Droid murni, setup paket Linux, clone git, symlink `zlce`, jalankan server lokal, hingga pemasangan PWA standalone ke layar utama.
* **[`docs/mobile/INSTALLATION.md`](mobile/INSTALLATION.md)** — **Tutorial Instalasi Lengkap Tablet SM-T225:**
  Rincian spesifikasi tablet, verifikasi diagnostik awal, dan integrasi repositori.
* **[`docs/mobile/TERMUX_SETUP.md`](mobile/TERMUX_SETUP.md)** — **Panduan Cepat Konfigurasi Lingkungan:**
  Cheatsheet pengaturan `~/.bashrc`, alias praktis (`cdp`, `zcheck`), editor sentuh `micro`, izin storage, dan kebijakan *Zero-Daemon*.

### 2.2 Ringkasan Prosedur 6 Tahap Penyiapan Android:
```text
[1. Unduh Termux F-Droid]
           │
           ▼
[2. pkg update & pkg install -y git python nodejs-lts bash coreutils micro openssh]
           │
           ▼
[3. termux-setup-storage & Konfigurasi ~/.bashrc]
           │
           ▼
[4. git clone https://github.com/ekokeplek-glitch/ZLCE4.1.git & cd ZLCE4.1 & npm install]
           │
           ▼
[5. Pasang Symlink CLI: ln -sf .../scripts/zlce/zlce ~/bin/zlce]
           │
           ▼
[6. bash scripts/zlce-prod-start.sh  ──>  Buka http://localhost:3000  ──>  Install PWA]
```

### 2.3 Opsi Keamanan Jaringan Server Lokal:
* Secara default, server mendengarkan pada `0.0.0.0:3000`.
* Pada lingkungan tablet bersama atau jaringan Wi-Fi publik, jalankan dengan isolasi loopback agar tidak dapat diakses perangkat lain di jaringan yang sama:
  ```bash
  HOST=127.0.0.1 bash scripts/zlce-prod-start.sh
  ```

---

## PILAR 3: TUTORIAL PETUNJUK PENGGUNAAN PWA & OPERASI HARIAN
*Panduan operasional harian bagi 8 anggota tim estafet dalam mengoperasikan ZLCE Mobile Workbench pada tablet fisik bersama.*

### 3.1 Dokumen Rujukan
* **[`docs/mobile/USAGE_MOBILE.md`](mobile/USAGE_MOBILE.md)** — **Tutorial Pemakaian ZLCE Mobile (Alur Harian 10 Langkah):**
  Panduan operasional lengkap dari awal buka PWA, penentuan profil, perakitan Context Pack, interaksi browser AI, command hub, git sync, hingga serah terima tablet.
* **[`docs/mobile/USER_GUIDE.md`](mobile/USER_GUIDE.md)** — **Panduan Pengguna & Alur Kerja Estafet 8 Anggota:**
  Panduan operasional penggunaan antarmuka PWA, pemilihan profil anggota, penguncian task atomik, pembuatan Context Pack, hingga sanitasi kredensial.
* **[`docs/mobile/PRODUCTION_OPERATIONS.md`](mobile/PRODUCTION_OPERATIONS.md)** — **Prosedur Operasi Produksi Nyata:**
  Manual operasional tablet lapangan, peluncuran 1-ketuk, mitigasi Android Low Memory Killer (RAM 3GB), batas tab browser, dan backup snapshot.
* **[`docs/mobile/TROUBLESHOOTING.md`](mobile/TROUBLESHOOTING.md)** — **Matriks Pemecahan Masalah & Recovery Kasus A–D:**
  Solusi penanganan crash peramban, uncommitted changes liar, konflik Git, limit token, dan pemulihan darurat tanpa merusak status WAL.
* **[`docs/mobile/SECURITY_AUDIT.md`](mobile/SECURITY_AUDIT.md)** — **Penegakan Kebijakan Zero-Secret:**
  Audit berkala non-kredensial, timeout cache in-memory 900 detik, dan eksekusi `clean-auth.sh`.

### 3.2 Struktur Tim Estafet 8 Anggota (Sumber: `src/data/teamMembers.ts`)
Setiap aksi di PWA otomatis tercatat ke profil pengemudi yang aktif tanpa menyimpan rahasia/password:

| Alias | Nama Anggota | Peran Utama Kanonik | Preferensi Engine AI | Surel Publik |
| :--- | :--- | :--- | :--- | :--- |
| `eko` | Eko Siswanto | System & Git Coordinator (Lead) | Gemini 2.5 Flash / Claude 3.5 | `eko@zlce.local` |
| `oned` | Oned Wiyono | Frontend & Mobile UI Specialist | Claude 3.5 Sonnet | `oned@zlce.local` |
| `cxperia` | Chris X. Peria | QA & Test Harness Lead | Gemini 2.5 Flash | `cxperia@zlce.local` |
| `sulistiyani` | Sulistiyani | PWA & Offline Architect | Claude 3.5 Sonnet | `sulistiyani@zlce.local` |
| `layang` | Layang Seta | Context & Prompt Engineer | Claude 3.5 Sonnet / ChatGPT | `layang@zlce.local` |
| `acimau` | Acimau Dev | Git & Sync Hub Specialist | Gemini 2.5 Pro | `acimau@zlce.local` |
| `kepek` | Kepek Aris | Security & Zero-Secret Officer | Gemini 2.5 Flash | `kepek@zlce.local` |
| `gete` | Gete Prakoso | Mobile UX & Ergonomics Reviewer | Claude 3.5 Haiku | `gete@zlce.local` |

### 3.3 Alur Kerja Estafet Harian (8 Langkah Standar):
1. **Ambil Tablet:** Hidupkan tablet Samsung Galaxy Tab A7 Lite, buka aplikasi **ZLCEv4.1Mob** dari Layar Utama (PWA Standalone).
2. **Pilih Anggota & Cek Status:** Buka modal *Active Member Selector* di pojok kanan atas Header, pilih profil Anda, dan pastikan tidak ada task menggantung.
3. **Klaim Task Atomik (1 Max):** Buka tab **SESSION_STATE & WAL**, pilih task `READY`, dan kunci status menjadi `IN_PROGRESS` (Invarian I3).
4. **Rancang Context Pack:** Buka tab **AI Workbench** (`1. Rakit Prompt` / `Context Pack`), sesuaikan model AI sasaran (budget token 30K / 128K / 1M), lalu ketuk **1-Ketuk Salin Context Pack**.
5. **Eksekusi AI di Peramban:** Buka peramban AI (Claude/ChatGPT/Gemini), tempel Context Pack, dan eksekusi rekayasa kode pada cabang terisolasi `git checkout -b task/TASK-xxx`.
6. **Validasi & Commit Beridentitas:** Uji hasil via `zlce check`, buka modal **Sahkan Gerbang** (masukkan bukti verifikasi riil $\ge 5$ karakter), lalu commit:
   ```bash
   git -c user.name="Nama Anda" -c user.email="nama@zlce.local" commit -m "feat: implementasi TASK-xxx"
   ```
7. **Push Branch Task:** Dorong cabang task menggunakan perintah aman `zlce push` (otomatis memblokir push langsung ke `main`).
8. **Serah Terima & Clean-Auth:** Buka wizard Oper Tablet di PWA, catat catatan serah terima di Bagian 6 `SESSION_STATE.md`, lalu jalankan `bash scripts/zlce/clean-auth.sh` di Termux untuk membersihkan cache RAM sebelum menyerahkan fisik tablet ke rekan berikutnya.

### 3.4 Matriks Penyelamatan Darurat (Kasus A–D):
Jika sesi kerja terputus atau terjadi crash browser akibat LMK:
* **Kasus A (Working tree bersih, sesuai WAL):** Jalankan `zlce check`, lalu lanjutkan langkah kerja WAL berikutnya.
* **Kasus B (Uncommitted changes cocok dengan daftar WAL):** Periksa status file via `git status`, lalu commit sesuai rencana WAL.
* **Kasus C (Ada commit baru di Git yang belum tercatat di WAL):** Periksa log via `git log -1 --stat`, lalu sinkronkan `SESSION_STATE.md`.
* **Kasus D (Perubahan liar di luar daftar file WAL):** Tandai task `BLOCKED` di `SESSION_STATE.md`, amankan perubahan liar sementara via `git stash`, dan mintakan konfirmasi pengawas tim sebelum dilanjutkan.

---

## Navigasi Pintas: Dokumen yang Sering Dibutuhkan

| Pertanyaan / Kebutuhan | Dokumen yang Dituju |
| :--- | :--- |
| *"Saya baru memegang tablet dan ingin tutorial instalasi berurutan dari Termux sampai PWA"* | 👉 [**Pilar 2 — Tutorial Instalasi Android Terurut**](mobile/INSTALLATION_ANDROID.md) |
| *"Saya ingin tahu contekan perintah apa saja yang tersedia di terminal Termux"* | 👉 [**Pilar 2 — Pengaturan Lingkungan Termux**](mobile/TERMUX_SETUP.md) |
| *"Bagaimana alur kerja harian 10 langkah pemakaian ZLCE Mobile di tablet?"* | 👉 [**Pilar 3 — Tutorial Pemakaian Mobile**](mobile/USAGE_MOBILE.md) |
| *"Bagaimana alur kerja 8 anggota tim estafet dan pembagian peran?"* | 👉 [**Pilar 3 — Panduan Pengguna Tim Estafet**](mobile/USER_GUIDE.md) |
| *"Bagaimana cara mengoperasikan server lokal dan menjaga memori RAM 3GB?"* | 👉 [**Pilar 3 — Operasi Produksi Nyata**](mobile/PRODUCTION_OPERATIONS.md) |
| *"Terjadi crash atau status Git tidak cocok dengan SESSION_STATE"* | 👉 [**Pilar 3 — Pemecahan Masalah & Kasus A–D**](mobile/TROUBLESHOOTING.md) |
| *"Bagaimana aturan 4 Gerbang Kualitas dan Write-Ahead Logging ZLCE?"* | 👉 [**Pilar 1 — Metodologi ZLCE**](USAGE.md) |
| *"Saya ingin membaca arsitektur teknis lengkap (14 Blueprint)"* | 👉 [**Pilar 1 — 14 Cetak Biru Arsitektur**](mobile/blueprint/01_SYSTEM_OVERVIEW.md) |
| *"Saya ingin memeriksa laporan audit dan riwayat revisi repositori"* | 👉 [**Pilar 1 — Laporan Revisi Audit**](revisi/REVISION_REPORT.md) |
