<div align="center">

# ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)

**Stasiun kerja mobile PWA terpandu AI mandiri untuk tablet Android (Samsung Galaxy Tab A7 Lite • 8 Anggota Tim Estafet) dengan protokol rekayasa konteks Zero-Loss.**

*Zero-Loss Context Engineering: a kit and web workbench that keeps AI coding sessions consistent across context resets, using structured state files, handover protocols, and mobile Termux integration.*

[![Tests](https://img.shields.io/badge/tests-74%2B%20passing-brightgreen.svg)](#hasil-pengujian)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.19-339933.svg)](#prasyarat)
[![Version](https://img.shields.io/badge/version-4.1.0%20GA-informational.svg)](CHANGELOG.md)
[![Baseline Terkunci: v4.1.0 GA](https://img.shields.io/badge/ZLCEv4.1Mob-Terkunci%20%26%20Siap-success.svg)](SESSION_STATE.md)

[Pusat Dokumentasi](docs/README.md) · [Cetak Biru Arsitektur](docs/mobile/MOBILE_BLUEPRINT.md) · [Tutorial Instalasi Android](docs/mobile/INSTALLATION_ANDROID.md) · [Tutorial Pemakaian Mobile](docs/mobile/USAGE_MOBILE.md) · [Operasi Produksi](docs/mobile/PRODUCTION_OPERATIONS.md) · [Starter Kit](zlce-starter-kit/README.md)

</div>

---

> **Catatan Struktur 3 Pilar Dokumentasi:** Dokumentasi ZLCE Mobile Workbench v4.1.0 GA (`ZLCEv4.1Mob`) memisahkan secara tegas antara **(1) Cetak Biru Arsitektur Proyek** (`docs/mobile/MOBILE_BLUEPRINT.md`), **(2) Tutorial Instalasi Android dari Termux s/d PWA** (`docs/mobile/INSTALLATION_ANDROID.md`), dan **(3) Tutorial Pemakaian Harian Mobile** (`docs/mobile/USAGE_MOBILE.md`). Direktori `zlce-starter-kit/` adalah template skeleton bersih untuk proyek baru Anda.


## Daftar Isi

- [Apa itu ZLCE?](#apa-itu-zlce)
- [Fitur Utama](#fitur-utama)
- [Mulai Cepat](#mulai-cepat)
  - [Prasyarat](#prasyarat)
  - [A. Pakai Kit dengan AI Anda](#a-pakai-kit-dengan-ai-anda)
  - [B. Jalankan ZLCE Studio (Web)](#b-jalankan-zlce-studio-web)
  - [C. Pakai Skrip CLI](#c-pakai-skrip-cli)
- [Cara Kerja & 4 Gerbang Kualitas](#cara-kerja--4-gerbang-kualitas)
- [Struktur Repositori](#struktur-repositori)
- [Hasil Pengujian](#hasil-pengujian)
- [Batasan yang Diketahui](#batasan-yang-diketahui)
- [Privasi dan Keamanan](#privasi-dan-keamanan)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Apa itu ZLCE?

Saat mengerjakan proyek perangkat lunak bersama AI coding assistant, konteks seringkali hilang: sesi baru tidak mengetahui keputusan arsitektur sebelumnya, kuota token obrolan habis di tengah jalan, atau AI mengubah kode di luar yang diminta.

ZLCE mengatasi masalah tersebut dengan satu prinsip: **status proyek ditulis di berkas, bukan diandalkan pada memori obrolan.**

- **`SESSION_STATE.md`** adalah sumber kebenaran tunggal (*Single Source of Truth*): matriks task, catatan serah terima, dan *write-ahead log* (WAL) untuk langkah yang sedang berjalan.
- **Empat Gerbang Persetujuan (*Quality Gates*)** menahan AI agar tidak menulis kode sebelum spesifikasi disetujui pengguna.
- **Protokol Handover dan Recovery** memungkinkan sesi baru, atau AI lain, melanjutkan pekerjaan tepat dari titik terakhir, termasuk saat sesi terputus (*session crash*).
- **Task bersifat atomik**: tepat satu task berstatus `IN_PROGRESS` pada satu waktu, dan status `DONE` hanya sah bila disertai bukti verifikasi riil.

Kit ini kompatibel dengan semua AI coding agent modern yang dapat membaca teks/berkas, seperti Google AI Studio, Claude Code, Cursor, Windsurf, ChatGPT, dan GitHub Copilot.

---

## Fitur Utama

| Komponen | Isi & Kemampuan |
| :--- | :--- |
| **Kit Kontrol** | Prompt inisiasi ([`LANDING_PROMPT.md`](LANDING_PROMPT.md)), prompt serah terima ([`HANDOVER_PROMPT.md`](HANDOVER_PROMPT.md)), 9 template dokumen kontrol ([`templates/`](templates/)), generator bundel tunggal Mode SIMPLE `ZLCE_KIT_SIMPLE.md` (`--simple-kit`) & Mode FULL `ZLCE_KIT_SINGLE.md` (`--single-kit`), serta profil domain. |
| **Studio (Web)** | Header ringkas (Project Switcher di kiri, Active Member Selector & Oper Tablet di kanan), editor visual `SESSION_STATE`, validator real-time, wizard recovery Kasus A–D, triase revisi R1–R7, Multi-AI Audit Hub (Claude 5.5 Sonnet, Gemini 4 Hydrogen Free, ChatGPT, DeepSeek), kalkulator token, tutorial interaktif, dan generator bundel Mode SIMPLE / FULL (.md & .ZIP). |
| **CLI & Diagnostik** | `zlce-check.py` (validasi integritas state), `zlce-snapshot.sh` (snapshot status git dan WAL), `zlce-collect.py` (kolektor diagnostik bertopeng rahasia). |

Dua mode proyek yang didukung:
- **Mode LITE** (*Default / Rekomendasi*): 4 berkas kontrol inti (`BLUEPRINT`, `TASKS`, `SESSION_STATE`, `HANDOVER`) untuk proyek di bawah ~15 task.
- **Mode FULL**: 10 dokumen kontrol lengkap untuk sistem besar atau multi-service.

---

## Mulai Cepat

### Prasyarat

| Komponen | Kebutuhan Lingkungan |
| :--- | :--- |
| **Studio (Web)** | Node.js `>=20.19.0` (direkomendasikan Node.js 22 LTS), npm |
| **Skrip CLI** | Python 3.10+, bash, git (di Windows: gunakan WSL atau Git Bash) |
| **Kit Saja** | Cukup AI assistant yang mendukung input teks atau unggah berkas |

### A. Pakai Kit dengan AI Anda

1. **Pilih mode**: **LITE** (4 berkas) atau **FULL** (10 berkas).
2. **Isi parameter** di [`LANDING_PROMPT.md`](LANDING_PROMPT.md) (Nama Proyek, Aksi `BARU`/`RESTRUKTURISASI`, Tech Stack, Kebutuhan Inti).
3. **Mulai sesi AI**:
   - Jika AI mendukung banyak lampiran (mis. Cursor/Windsurf/Claude Project): lampirkan folder [`templates/`](templates/) lalu tempel prompt.
   - Jika AI berupa chat web prompt tunggal (mis. ChatGPT/Claude/Gemini web):
     - **Mode SIMPLE / LITE (6 berkas inti, direkomendasikan untuk hemat token):** ekspor `ZLCE_KIT_SIMPLE.md` dari Dashboard / Pack Studio / Tutorial, atau jalankan `node scripts/sync-assets.mjs --simple-kit`, atau unduh bundel `zlce-simple-kit-v4.1.0.zip`.
     - **Mode FULL (12 berkas lengkap):** ekspor `ZLCE_KIT_SINGLE.md` dari Pack Studio, jalankan `node scripts/sync-assets.mjs --single-kit`, atau gunakan `zlce-starter-kit-v4.1.0.zip`.
4. **Persetujuan Gerbang 1**: AI akan menyusun `BLUEPRINT.md` lalu **berhenti**. Periksa draf tersebut, lalu berikan konfirmasi:
   > *"Setujui Gerbang 1 (BLUEPRINT.md). Lanjutkan ke gerbang berikutnya."*

Untuk melanjutkan sesi atau berganti AI, gunakan [`HANDOVER_PROMPT.md`](HANDOVER_PROMPT.md) bersama lampiran wajib: `SESSION_STATE.md`, `TASKS.md`, dan `AI_WORKFLOW.md` (pada Mode LITE: `SESSION_STATE.md`, `TASKS.md`, dan `HANDOVER.md`).

| Situasi Kerja | Berkas & Perintah |
| :--- | :--- |
| **Proyek baru** | `LANDING_PROMPT.md` (Aksi: `BARU`) |
| **Merapikan proyek lama** | `LANDING_PROMPT.md` (Aksi: `RESTRUKTURISASI`); AI dilarang mengubah kode sebelum audit selesai |
| **Lanjut sesi / pindah AI** | `HANDOVER_PROMPT.md` + lampirkan `SESSION_STATE.md`, `TASKS.md`, `AI_WORKFLOW.md` |
| **Sesi terputus di tengah jalan** | `bash scripts/zlce/zlce-snapshot.sh --diff`, atau buka tab **Recovery** di Studio |

### B. Jalankan ZLCE Studio (Web & Mobile Workbench)

**1. Peluncuran Produksi Nyata (Termux di Tablet Samsung Tab A7 Lite / Linux):**
```bash
# Jalankan skrip produksi mandiri (otomatis normalisasi izin, validasi state, build dist & serve)
cd ~/projects/0ZLCEv4.1GA
bash scripts/zlce-prod-start.sh
```
Akses di peramban tablet (Chrome/Samsung Internet) pada: <http://localhost:3000>  
Pilih **"Tambahkan ke Layar Utama" (Install PWA)** untuk pengalaman aplikasi mandiri layar penuh tanpa bilah URL.

**2. Mode Pengembangan Standar:**
```bash
git clone https://github.com/sarungsari/0ZLCEv4.1GA.git
cd 0ZLCEv4.1GA
npm install
npm run dev
```

Buka peramban di: <http://localhost:3000>

Untuk build produksi manual:
```bash
npm run build     # keluaran di folder dist/
npm run preview   # uji pratinjau lokal build produksi
```

### C. Pakai Skrip CLI

Uji langsung pada starter kit maupun root workbench tanpa konfigurasi git:
```bash
python3 scripts/zlce/zlce-check.py zlce-starter-kit --strict --no-git
# KELUARAN: RESULT: OK (0 error, 0 warn, 3 task)

python3 scripts/zlce/zlce-check.py . --strict --no-git
# KELUARAN: RESULT: OK (0 error, 0 warn, 3 task)
```

Untuk proyek Anda sendiri, salin folder `scripts/zlce/` ke direktori proyek Anda:
```bash
python3 scripts/zlce/zlce-check.py .          # validasi SESSION_STATE.md
python3 scripts/zlce/zlce-check.py . --strict # anggap warning sebagai error
bash scripts/zlce/zlce-snapshot.sh --diff     # ambil snapshot git dan WAL untuk recovery
```

> [!NOTE]
> Berkas `scripts/zlce-check.py`, `scripts/zlce-snapshot.sh`, dan `scripts/zlce-collect.py` di folder luar `scripts/` adalah wrapper tipis yang otomatis meneruskan argumen ke skrip kanonik di `scripts/zlce/`.

---

## Cara Kerja & 4 Gerbang Kualitas

```text
Gerbang 1  BLUEPRINT.md                 → Diperiksa & disetujui pengguna
Gerbang 2  ARCHITECTURE + DATA_MODEL    → Diperiksa & disetujui pengguna (khusus mode FULL)
Gerbang 3  TASKS.md + TESTING.md        → Diperiksa & disetujui pengguna
Gerbang 4  SESSION_STATE + AI_WORKFLOW  → Eksekusi tugas atomik dimulai
```

Saat eksekusi berjalan, setiap perubahan status dicatat pada matriks task dan blok WAL (*Write-Ahead Log*) **sebelum** modifikasi kode dilakukan. Jika sesi terputus, AI membaca blok WAL, membandingkannya dengan status git, dan menentukan protokol pemulihan:

| Kasus | Kondisi Pemulihan | Prosedur |
| :-: | :--- | :--- |
| **A** | Working tree bersih | Melanjutkan langkah pertama task aktif yang tercatat di WAL. |
| **B** | Diff uncommitted sesuai WAL | Mempertahankan perubahan, memverifikasi hasil, lalu commit. |
| **C** | Commit ada di git log namun belum di state | Sinkronisasi `SESSION_STATE.md` dengan log git terbaru. |
| **D** | Perubahan di luar daftar berkas WAL | Menahan modifikasi, task dialihkan ke `BLOCKED` untuk persetujuan pengguna. |

Panduan detail alur kerja operasional dan triase revisi: [`docs/USAGE.md`](docs/USAGE.md).

---

## Struktur Repositori

<details open>
<summary><b>Tampilkan Struktur Berkas</b></summary>

```text
.
├── LANDING_PROMPT.md          # Prompt inisiasi proyek baru / restrukturisasi
├── HANDOVER_PROMPT.md         # Prompt panduan serah terima dan protokol recovery
├── HANDOVER.md                # Prompt serah terima kanonik siap pakai (Mode FULL)
├── AI_WORKFLOW.md             # Aturan main eksekusi AI & protokol Git/WAL (Mode FULL)
├── BLUEPRINT.md               # Indeks Gerbang 1 (visi, batasan, 14 cetak biru)
├── ARCHITECTURE.md            # Indeks Gerbang 2 (arsitektur 4-lapisan & 6-tab PWA)
├── DATA_MODEL.md              # Indeks Gerbang 2 (skema SessionState/WAL & LocalStorage)
├── TESTING.md                 # Indeks Gerbang 3 (strategi uji 73 checks & SM-T225)
├── CHECKLISTS.md              # Indeks Gerbang 4 (daftar periksa rilis GA & Zero-Secret)
├── SESSION_STATE.md           # Single Source of Truth baseline terkunci ZLCEv4.1Mob
├── TASKS.md                   # Rincian task baseline operasional v4.1.0 GA
├── CHANGELOG.md               # Catatan rilis bersih v4.1.0 GA
├── zlce-starter-kit/          # Template skeleton Mode LITE (4 berkas inti + panduan)
├── archive/                   # Arsip lokal riwayat pengembangan & laporan (terkecuali di .gitignore)
├── templates/                 # 9 template dokumen kontrol + subfolder profiles/
│   ├── BLUEPRINT.template.md      # Gerbang 1: Visi, lingkup, kriteria selesai
│   ├── ARCHITECTURE.template.md   # Gerbang 2: Arsitektur & batasan sistem
│   ├── DATA_MODEL.template.md     # Gerbang 2: Skema data & migrasi
│   ├── TASKS.template.md          # Gerbang 3: Daftar task atomik
│   ├── TESTING.template.md        # Gerbang 3: Rencana pengujian
│   ├── CHECKLISTS.template.md     # Gerbang 4: Checklist rilis
│   ├── AI_WORKFLOW.template.md    # Gerbang 4: Aturan main agen
│   ├── SESSION_STATE.template.md  # Gerbang 4: Matriks state & WAL aktif
│   ├── CHANGELOG.template.md      # Gerbang 4: Log riwayat rilis
│   └── profiles/
│       └── DOMAIN_BOOKING.profile.md  # Profil domain reservasi & sewa
├── docs/                      # Dokumentasi komprehensif ZLCE (3 Pilar Terstruktur)
│   ├── README.md              # Peta & indeks seluruh dokumentasi proyek (Pilar 1, 2, 3)
│   ├── USAGE.md               # Panduan penggunaan lengkap 3 alur & triase revisi
│   ├── mobile/                # Panduan tablet Android, Termux & operasional
│   │   ├── MOBILE_BLUEPRINT.md# Indeks arsitektur 14 cetak biru & 9 ADR
│   │   ├── INSTALLATION_ANDROID.md # Tutorial instalasi berurutan Termux -> PWA
│   │   ├── USAGE_MOBILE.md    # SOP 10 langkah pemakaian harian tablet bersama
│   │   ├── INSTALLATION.md    # Spesifikasi SM-T225 & verifikasi awal
│   │   ├── TERMUX_SETUP.md    # Konfigurasi bashrc, alias, & editor micro
│   │   ├── USER_GUIDE.md      # Alur kerja harian estafet 8 anggota tim
│   │   ├── PRODUCTION_OPERATIONS.md # Operasi produksi (scripts/zlce-prod-start.sh)
│   │   ├── TROUBLESHOOTING.md # Penanganan kendala umum LMK & Kasus A-D
│   │   └── blueprint/         # 14 Cetak Biru Arsitektur Teknis Mobile
├── scripts/                   # Skrip operasional & utilitas ZLCE
│   ├── zlce-prod-start.sh     # Runner produksi mandiri (Termux / Linux)
│   ├── create-starter-kit-bundle.py # Pembuat bundel ZIP Starter Kit Lengkap (SIMPLE + FULL) on-demand
│   ├── create-simple-kit-bundle.py  # Pembuat bundel ZIP Mode SIMPLE (LITE 4 berkas + CLI + panduan)
│   ├── create-audit-bundle.py       # Pembuat bundel ZIP deterministik untuk audit
│   ├── create-pwa-review-bundle.py  # Pembuat bundel ZIP review frontend PWA
│   ├── create-claude-bundle.py      # Pembuat bundel ZIP khusus Claude & ChatGPT
│   ├── run-tests.py                 # Automated test suite runner (74 automated checks)
│   ├── security-audit.sh      # Pemeriksa zero-leak regex rahasia (Zero-Secret)
│   └── zlce/                  # Skrip kanonik (salin folder ini ke repo proyek Anda)
│       ├── zlce               # CLI dispatcher allowlist
│       ├── zlce-check.py      # Validator integritas format & dependensi state
│       ├── zlce-snapshot.sh   # Snapshot git diff dan WAL untuk recovery
│       ├── zlce-collect.py    # Kolektor bundle diagnostik
│       └── clean-auth.sh      # Pembersih cache kredensial git di RAM
├── src/                       # Kode sumber ZLCE Studio (React 19 + Vite + Tailwind v4)
│   ├── components/            # 6 Tab Kanonik (Dashboard, SessionState, AiWorkbench, TerminalGit, Diagnostics, DocsReference)
│   ├── hooks/                 # Custom hook (persistensi riwayat lokal & LMK cache)
│   ├── data/                  # Template data, 22 fase (0–21), 8 anggota tim & skenario
│   ├── utils/                 # Generator prompt, parser Markdown, validator skema
│   ├── types/                 # Definisi tipe TypeScript (6-tab TabType & alias)
│   └── tests/                 # Suite uji end-to-end (LMK, git, multi-user, cold-start)
├── public/                    # Manifest PWA, sw.js (Service Worker), ikon PNG
├── CONTRIBUTING.md            # Panduan kontribusi kode
├── SECURITY.md                # Kebijakan privasi & pelaporan kerentanan
├── LICENSE                    # Lisensi resmi (MIT)
├── index.html                 # HTML entry point aplikasi web
├── package.json               # Konfigurasi dependensi npm & engines (Node >=20.19)
├── tsconfig.json              # Konfigurasi TypeScript
├── vite.config.ts             # Konfigurasi bundler Vite
└── vite-session-sync.ts       # Plugin sinkronisasi SSE file lokal
```

</details>

Template tersedia dalam tiga bentuk dari satu sumber kebenaran:
1. **Berkas modular** di `templates/` untuk IDE AI (Cursor, Windsurf, VS Code).
2. **Bundel mandiri on-demand**:
   - **Mode SIMPLE (`ZLCE_KIT_SIMPLE.md`):** 6 berkas inti LITE via Pack Studio / Dashboard / Tutorial, `node scripts/sync-assets.mjs --simple-kit`, atau di `zlce-simple-kit-v4.1.0.zip`.
   - **Mode FULL (`ZLCE_KIT_SINGLE.md`):** 12 berkas kontrol lengkap via Pack Studio, `node scripts/sync-assets.mjs --single-kit`, atau di `zlce-starter-kit-v4.1.0.zip`.
3. **Impor statis** (`?raw`) ke dalam ZLCE Studio saat build aplikasi web.

---

## Hasil Pengujian

ZLCE Mobile Workbench v4.1.0 GA (`ZLCEv4.1Mob`) telah diverifikasi secara penuh menggunakan rangkaian pengujian otomatis (`python3 scripts/run-tests.py`):

| Parameter | Catatan Verifikasi Resmi |
| :--- | :--- |
| **Hasil Otomatisasi** | **Seluruh Uji Otomatis (`run-tests.py`) PASSED (100% Pass Rate)** |
| **Pemeriksaan Tipe** | `tsc --noEmit` LULUS bersih (0 errors) |
| **Audit Keamanan** | `scripts/security-audit.sh` LULUS (0 secret leaks / Zero-Secret Valid) |
| **Model AI Diuji** | Claude 5.5 Sonnet, ChatGPT-4o, Gemini 4 Hydrogen (Free), DeepSeek-V3 |
| **Target Platform Fisik** | Samsung Galaxy Tab A7 Lite (SM-T225) RAM 3GB • Termux • PWA Offline |
| **Tanggal & Versi Rilis** | 2026-11-14 • v4.1.0 GA (Baseline Operasional Terkunci & Siap Pakai) |

<details>
<summary><b>Cakupan 74+ Uji Otomatis (Test Suite Breakdown)</b></summary>

- **Uji Statis & Tipe:** TypeScript type-check, verifikasi integritas skrip kanonik POSIX, hash parity check.
- **Uji Protokol ZLCE:** Validator state, deteksi konflik keputusan lintas AI, cold-start model AI (Invarian I2).
- **Uji Kolaborasi Tim:** Uji cold-start estafet 8 anggota tim (Invarian I1–I5), isolasi session browser, task claim guard.
- **Uji CLI & Terminal:** Parameter binder, strict shell sanitizer, allowlist dispatcher, paste-back terminal parser, protokol Kasus A–D.
- **Uji Git & Keamanan:** Branch per task, commit identitas per perintah, clean-auth RAM cache, conflict resolution wizard.
- **Uji Ketahanan Mobile:** Mitigasi Android LMK (RAM 3GB), operasi 100% offline (Airplane mode), ergonomi sentuh target $\ge 44\text{px}$, transactional atomic persistence.

</details>

---

## Batasan yang Diketahui

- **Karakteristik AI**: Kepatuhan AI terhadap protokol bersifat probabilistik. Hasil evaluasi 14/14 berlaku untuk model dan konfigurasi yang tertera di atas.
- **Cakupan Validator Web**: Validator di aplikasi web memeriksa semua aturan integritas internal yang terdapat di `SESSION_STATE.md`. Pemeriksaan silang terhadap berkas `TASKS.md` dan integrasi git log/diff memerlukan skrip terminal (`zlce-check.py` dan `zlce-snapshot.sh`).
- **Estimasi Token**: Perhitungan token pada gauge Studio menggunakan rasio aproksimasi standar (1 token ≈ 4 karakter).
- **Lingkungan CLI**: Skrip shell `zlce-snapshot.sh` membutuhkan interpreter bash standar (di sistem operasi Windows, gunakan WSL atau Git Bash).
- **Operasi Git**: Aplikasi web ZLCE Studio berjalan di browser dan tidak mengakses sistem berkas lokal atau git secara langsung; gunakan antarmuka CLI yang disediakan untuk operasi git.

---

## Privasi dan Keamanan

ZLCE Studio berjalan sepenuhnya di sisi peramban (*client-side*). Draf pekerjaan disimpan secara lokal di `localStorage` perangkat Anda dan tidak pernah dikirimkan ke server jarak jauh mana pun. Jangan pernah mencantumkan rahasia produksi (kunci API, kredensial database) di dalam `SESSION_STATE.md`. Untuk informasi selengkapnya atau pelaporan kerentanan, silakan baca [`SECURITY.md`](SECURITY.md).

---

## Kontribusi

Kontribusi berupa saran, perbaikan bug, atau penambahan fitur sangat disambut. Sebelum mengajukan *Pull Request*, pastikan:

```bash
npm ci
npm run lint
npm run build
python3 scripts/zlce/zlce-check.py . --strict --no-git
```

Jika Anda mengubah berkas template di `templates/` atau prompt kontrol di root, jalankan `npm run sync:assets` agar `zlce-starter-kit/` dan `scripts/zlce/` tetap sinkron 100% dari sumber kanonik tunggal. Panduan kontribusi selengkapnya dapat dibaca di [`CONTRIBUTING.md`](CONTRIBUTING.md). Riwayat versi dapat dilihat di [`CHANGELOG.md`](CHANGELOG.md).

---

## Lisensi

Didistribusikan di bawah lisensi [MIT](LICENSE) © 2026 ZLCE Project Contributors.
