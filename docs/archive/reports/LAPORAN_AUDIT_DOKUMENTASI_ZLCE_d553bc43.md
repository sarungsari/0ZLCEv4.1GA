# Laporan Audit & Restrukturisasi Dokumentasi — ZLCE Studio & Mobile Workbench v4.0.0 GA

- **Peran:** Senior Technical Writer, Dokumenter Software & Systems Architect
- **Tanggal audit:** 2026-11-07
- **Objek audit:** `zlce-audit-review-bundle-1.zip` (165 berkas, 2,5 MB terekstrak)
- **Metode:** seluruh berkas Markdown, skrip, `package.json`, `manifest.webmanifest`, `sw.js`, tipe TypeScript, dan komponen tab dibaca langsung. `zlce-check.py`, `zlce --help`, dan `scripts/run-tests.py` dijalankan pada salinan bundel.
- **Penanda:** `[PERLU KONFIRMASI]` = tidak dapat dibuktikan dari bundel. Tidak ada perintah, paket, atau fakta yang dikarang.

> **Batasan bahan audit (penting).**
> 1. Berkas rujukan `public/assets/aistudio/file.md_75a501e3.txt` (Framework 6-Tahap) **tidak ada di bundel**. Struktur laporan mengikuti daftar 8 butir pada mandat; kesesuaian dengan isi framework asli **[PERLU KONFIRMASI]**.
> 2. Bundel hanyalah **subset** repositori (tanpa `vite.config.ts`, `public/icons/`, `docs/revisi/`, `zlce-starter-kit/`, `node_modules/`). Beberapa temuan "berkas hilang" mungkin hanya artefak pengemasan. Setiap temuan seperti itu ditandai.
> 3. Mandat menyebut 11 panduan `docs/mobile/*` dan 3 `docs/revisi/*`. Bundel hanya berisi **8** panduan dan **0** berkas `revisi/`.

---

## 1. Ringkasan Kondisi Dokumentasi

**Kekuatan**

- Cakupan sangat luas dan konsisten dalam satu bahasa: README, `docs/USAGE.md`, 8 panduan mobile, 14 cetak biru, SECURITY, CONTRIBUTING, CHANGELOG.
- Prinsip inti jelas dan berulang secara konsisten: *Single Source of Truth* `SESSION_STATE.md`, tepat 1 task `IN_PROGRESS`, 4 gerbang, WAL, Zero-Secret.
- Alat bantu benar-benar bekerja: `python3 scripts/zlce-check.py .` pada bundel menghasilkan `RESULT: OK (0 error, 0 warn, 82 task)`, dan `zlce --help` berjalan.
- Ada panduan terpisah untuk instalasi (`INSTALLATION.md`), lembar contekan (`TERMUX_SETUP.md`), alur harian (`USER_GUIDE.md`), dan pemecahan masalah (`TROUBLESHOOTING.md`).

**Kelemahan utama**

1. **Jalur instalasi pemula tidak bisa diikuti apa adanya.** `INSTALLATION.md` tidak memasang `nodejs-lts`, tidak menjalankan `npm install`, tidak pernah menyalakan server, dan memakai path folder yang salah.
2. **Tautan mati / berkas dirujuk tapi tidak ada**, terutama `docs/mobile/PRODUCTION_OPERATIONS.md`, yang dirujuk README, `docs/README.md`, dan `scripts/zlce-prod-start.sh` sebagai panduan produksi utama.
3. **Kontradiksi isi antar dokumen**: definisi Recovery Kasus A–D berbeda total antara `USAGE.md` dan `TROUBLESHOOTING.md`; "Zero-Daemon" bertabrakan dengan server produksi; perintah `git commit -c` keliru.
4. **Angka dan versi usang** di halaman depan (v3.2.2, "14/14 lulus", badge 47/47 vs skrip uji yang gagal sebagian di bundel, 9 vs 10 template).
5. **Tiga hierarki yang saling menimpa** (README, `docs/README.md`, `docs/mobile/*` + `blueprint/*`) tanpa satu jalur baca yang jelas untuk pemula.

**Skor kesiapan dokumentasi (penilaian saya, bukan metrik baku):** 62/100. Konten kuat, tetapi navigasi dan akurasi langkah pemula menurunkan nilai.

---

## 2. Temuan Berbasis Bukti

Keparahan: **K** = kritis (menghalangi instalasi/penggunaan), **T** = tinggi, **S** = sedang, **R** = rendah.

### 2.1 Instalasi & skrip

| # | Sev | Temuan | Bukti |
|---|---|---|---|
| F1 | K | `INSTALLATION.md` Langkah 2 memasang `git python bash coreutils micro openssh` **tanpa `nodejs-lts`**, padahal aplikasi web butuh Node. Daftar lengkap yang benar ada di `docs/README.md` §3 dan pesan galat `scripts/zlce-prod-start.sh`. | `docs/mobile/INSTALLATION.md` §3; `scripts/zlce-prod-start.sh` baris pemeriksaan `MISSING_DEPS` |
| F2 | K | `INSTALLATION.md` tidak memuat `npm install` maupun perintah menjalankan server; Langkah 5 (PWA) meminta "akses URL aplikasi" tanpa menjelaskan URL-nya. | `docs/mobile/INSTALLATION.md` §4–§6 |
| F3 | K | Langkah verifikasi memakai `cd ~/projects/zlce-mobile-workbench`. Folder hasil clone adalah `T1ZLCE-Mobench-v4.0.0GA`. Alias `cdp` di `TERMUX_SETUP.md` dan `USER_GUIDE.md` mewarisi path salah yang sama. | `INSTALLATION.md` §7; `TERMUX_SETUP.md` §1; `package.json` `repository.url` |
| F4 | K | `zlce-prod-start.sh` menjalankan `npm run build` jika `dist/` belum ada, **tetapi tidak memeriksa/menjalankan `npm install`**. Pada clone baru, build gagal. | `scripts/zlce-prod-start.sh` langkah [4/5] |
| F5 | T | Skrip produksi mengikat `HOST=0.0.0.0` secara default sehingga server terbuka bagi seluruh perangkat di Wi-Fi yang sama. `USAGE.md` §6 menyarankan `127.0.0.1` untuk tablet, tetapi skrip tidak menyebut opsi itu. | `zlce-prod-start.sh` (`HOST="${HOST:-0.0.0.0}"`); `docs/USAGE.md` §6 |
| F6 | T | Langkah [3/5] skrip menghentikan seluruh start-up jika `SESSION_STATE.md` tidak valid. Pengguna pemula yang menyunting state bisa terkunci dari aplikasi. Tidak ada flag untuk melewati. | `zlce-prod-start.sh` langkah [3/5] |
| F7 | S | Baris `echo -e` ergonomi memuat `$\ge 44\times 44$`; `\t` pada `\times` ditafsirkan sebagai TAB, sehingga keluaran terminal rusak (`44<TAB>imes 44`). Sudah diuji. | `zlce-prod-start.sh` instruksi nomor 4 |
| F8 | T | Dokumen menyuruh `git checkout v4-mobile`; `SESSION_STATE.md` memang mencatat cabang `v4-mobile`, tetapi README meminta clone tanpa menyebut cabang. Cabang default repo tidak terbukti. | `INSTALLATION.md` §4; `SESSION_STATE.md` §1 |
| F9 | S | Keluaran contoh `zlce --help` di `INSTALLATION.md` (2 baris) tidak sama dengan keluaran nyata (kotak bantuan multi-baris, 7 subperintah). | `INSTALLATION.md` §5 vs hasil `bash scripts/zlce/zlce --help` |
| F10 | S | `scripts/zlce/README.md` memakai `ZLCE_REPO_DIR` sebagai placeholder, sedangkan `INSTALLATION.md` memakai path eksplisit. Tabel di README itu juga menulis `zlce pull` = `checkout -B ... --ff-only`, padahal dispatcher aktual memakai `fetch` + `checkout` + `merge --ff-only`. | `scripts/zlce/README.md` §2 vs `scripts/zlce/zlce` blok `pull` |
| F11 | T | `package.json` tidak punya field `engines`, tetapi badge README menyatakan Node `>=20.19`. `vite ^8.3.0`, `typescript ^7.0.2`, `@tailwindcss/vite ^4.3.3` memakai binary native/versi baru; kompatibilitas paket native di Termux (Android arm64) **tidak terdokumentasi**. | `package.json`; badge README |

### 2.2 Navigasi & berkas

| # | Sev | Temuan | Bukti |
|---|---|---|---|
| N1 | K | `docs/mobile/PRODUCTION_OPERATIONS.md` dirujuk di README (2 tempat), `docs/README.md` (2 tempat), `scripts/zlce-prod-start.sh`, dan `scripts/create-claude-bundle.py`, tetapi **tidak ada di bundel**. | hasil pencarian `PRODUCTION_OPERATIONS`; `ls docs/mobile` |
| N2 | T | `docs/README.md` mencantumkan `BLUEPRINT_REVIEW.md`, `AUDIT_BASELINE.md`, `revisi/AUDIT_3.22.md`, `REVISION_PLAN.md`, `REVISION_REPORT.md`; semuanya tidak ada di bundel **[PERLU KONFIRMASI: mungkin hanya terpangkas oleh pembuat bundel]**. | `docs/README.md` §1 vs daftar berkas |
| N3 | T | README menautkan `data/FEEDBACK_ZLCE_EVALUASI.md`; folder `data/` tidak ada di bundel. | README §Hasil Pengujian |
| N4 | S | README memuat `vite.config.ts` di pohon struktur; berkas tidak ada di bundel. `USAGE.md` §6 membahas `allowedHosts: true` yang hanya mungkin ada di berkas itu. | README §Struktur; `USAGE.md` §6 |
| N5 | S | Pohon README tidak memuat berkas root yang nyata: `TASKS.md` (1395 baris), `SESSION_STATE.md`, `CLAUDE_CHATGPT_HANDOVER.md`, `metadata.json`, `SHA256SUMS.txt`, `zlce-starter-kit/` (dirujuk `sync-assets.mjs`/`run-tests.py`), `DEVICE_AUDIT.md`, `FEASIBILITY_AND_DECISIONS.md`, `MOBILE_BLUEPRINT.md`. | pohon README vs `find` |
| N6 | S | README: "9 template dokumen kontrol"; `USAGE.md` dan README: Mode FULL = "10 dokumen kontrol". Daftar `CONTROL` di `zlce-check.py` memuat 10 nama, sedangkan `templates/` hanya 9 berkas template + 1 profil (tidak ada `HANDOVER`/`TESTING` setara satu-satu). Perbedaan perlu dijelaskan. | `zlce-check.py` konstanta `CONTROL`; `templates/` |

### 2.3 Kontradiksi isi

| # | Sev | Temuan | Bukti |
|---|---|---|---|
| C1 | K | **Definisi Kasus A–D saling bertentangan.** `USAGE.md`/README: A = tree bersih, B = diff cocok WAL, C = commit belum tercatat, D = diff di luar WAL. `TROUBLESHOOTING.md`: A = konflik git, B = halusinasi AI, C = format state rusak, D = remote desinkron. Pengguna yang membaca keduanya akan salah pulih. | `docs/USAGE.md` §3; `docs/mobile/TROUBLESHOOTING.md` §2 |
| C2 | T | **Zero-Daemon vs server produksi.** `TERMUX_SETUP.md` §5: "DILARANG menjalankan `node server.js`"; padahal `zlce-prod-start.sh` menjalankan `exec npx vite preview` yang bertahan di latar depan selama dipakai. Perlu dibedakan "proses latar depan sementara" dari "daemon permanen". | `TERMUX_SETUP.md` §5; `zlce-prod-start.sh` baris akhir; `package.json` `clean` memuat `server.js` |
| C3 | K | `USER_GUIDE.md` Langkah 7: `git commit -c user.name=... -c user.email=...`. **Sintaks salah**: pada `git commit`, `-c` berarti "pakai ulang pesan commit". Kode aplikasi menghasilkan bentuk benar `git -c user.name=... -c user.email=... commit -m ...`. | `USER_GUIDE.md` §2 Langkah 7; `src/utils/gitCommitFormatter.ts` baris 84 |
| C4 | S | Domain email profil: `USER_GUIDE.md` memakai `@zlce.internal`; `src/data/teamMembers.ts` memakai `@zlce.local` (mis. `oned@zlce.local`). | `USER_GUIDE.md` §1; `teamMembers.ts` |
| C5 | T | Angka pengujian tidak seragam: badge README `47/47 passing`; teks README "run-tests.py (32 checks)"; `CHANGELOG` rilis 4.0.0 "32/32", entri TASK-044–046 "35/35"; `docs/USAGE.md` dan teks "Hasil Pengujian" masih menyebut **v3.2.2**. Pada bundel ini `run-tests.py` mengeluarkan `35/47 checks OK` (lihat 2.4). | README; `CHANGELOG.md`; hasil `python3 scripts/run-tests.py` |
| C6 | S | `README.md` menyebut `Gemini 3.8 Flash / Claude 3.5 Sonnet` untuk uji; `USER_GUIDE.md` memakai nama model lain (Claude 3.5, Gemini 1.5, GPT-4o, DeepSeek-V3, Qwen 2.5). Nama model hanya preferensi per anggota; sebaiknya diberi label "contoh". `tokenBudgetAdapter.ts` sudah mendukung alias `claude-5.5`. | `USER_GUIDE.md` §1; `tokenBudgetAdapter.ts` |
| C7 | S | `CHANGELOG.md` teratas masih `4.0.0-alpha.TASK-046`; tidak ada entri untuk task 047–082 maupun tag "GA", padahal `package.json` = `4.0.0` dan `SESSION_STATE.md` = 82 task DONE. **[PERLU KONFIRMASI]** apakah bagian lain `CHANGELOG` memuatnya. | `CHANGELOG.md` baris 1–50; `SESSION_STATE.md` §1 |
| C8 | S | `CLAUDE_CHATGPT_HANDOVER.md` masih menyebut "43 task (TASK-001 s/d TASK-043)"; backlog sekarang 82 task. `FeedbackReviewTab.tsx` menampilkan "Backlog 46 Task". | `CLAUDE_CHATGPT_HANDOVER.md` §1–2; `FeedbackReviewTab.tsx` baris 338 |

### 2.4 Hasil menjalankan `scripts/run-tests.py` pada bundel

Hasil: **35 dari 47 pemeriksaan lulus**. Penyebab yang terbukti pada bundel:

- `Cannot find module 'lucide-react'` → `node_modules/` tidak ada di bundel (wajar).
- `Canonical Script Integrity Check`: salinan di `zlce-starter-kit/` tidak ada (5 berkas).
- `TC-P7-03` dan `TC-P10-08`: *"Aset ikon PWA tidak lengkap"* → `public/icons/*.png` tidak ada di bundel, padahal `manifest.webmanifest` dan `sw.js` mewajibkan `/icons/icon-192x192.png` dan `/icons/icon-512x512.png` (precache wajib).

**[PERLU KONFIRMASI]** apakah ikon, `zlce-starter-kit/`, dan `vite.config.ts` ada di repositori GitHub asli. Jika memang tidak ada di repo, PWA tidak dapat dipasang/di-precache dengan benar (kritis); jika hanya terpangkas dari bundel, cukup perbaiki skrip `create-audit-bundle.py`.

### 2.5 Antarmuka (Preview Studio / workbench)

| # | Sev | Temuan | Bukti |
|---|---|---|---|
| U1 | S | `manifest.webmanifest` punya *shortcuts* `/?tab=dashboard`, `/?tab=session`, `/?tab=tutorial`. Di `src/` **tidak ada** pembaca `location.search`/`URLSearchParams`; pintasan tidak membuka tab yang dimaksud. | manifest; hasil `grep` di `src/` |
| U2 | S | `FeedbackReviewTab.tsx` menawarkan unduh `/assets/zlce-claude-chatgpt-bundle.zip` & `/assets/zlce-audit-review-bundle.zip`, dan mencoba memuat `/assets/aistudio/Laporan_Audit_ZLCE_v4.0.0_150d1d16.md`. Zip dihasilkan oleh `scripts/create-*-bundle.py`; README menautkan `public/assets/*.zip` seolah-olah berkas tetap. **[PERLU KONFIRMASI]** apakah zip ikut di-commit. | `FeedbackReviewTab.tsx` baris 244–252, 594–605 |
| U3 | S | Daftar "berkas rujukan" di `FeedbackReviewTab.tsx` (baris 333–346) tidak memuat `README.md`, `docs/README.md`, `USAGE.md`, `scripts/zlce-prod-start.sh`, atau `package.json`, padahal fokus audit `docs-audit-readme` justru membutuhkannya. | `FeedbackReviewTab.tsx` |
| U4 | R | `TabType` memuat 18 tab, tetapi uji `TC-P10-08` menyebut "10 tab" dengan id `test-harness`, `session-state`, `feedback-review` yang berbeda dari id nyata (`harness`, `session`, `feedback`). Dokumen perlu satu tabel id tab resmi. | `src/types/zlce.ts` baris 5–23; keluaran `run-tests.py` |
| U5 | R | `TutorialTab.tsx` menyajikan `USAGE.md` (versi tertanam) dan hanya menaut ke GitHub dan zip audit; belum menaut ke panduan Termux atau tutorial mobile v4. | `TutorialTab.tsx` baris 326–375 |
| U6 | R | `WorkspaceReader.tsx` memuat contoh `SESSION_STATE`/`TASKS` yang disematkan; berguna sebagai demo, tetapi tidak ditandai sebagai "data contoh". | `WorkspaceReader.tsx` baris 72–160 |

---

## 3. Usulan Struktur & Pemetaan `docs/`

**Prinsip:** satu pintu masuk per peran, satu sumber untuk tiap fakta (instalasi, Kasus A–D, perintah git), dan tidak ada berkas yang dihapus: yang usang dipindah ke `archive/` dengan banner "USANG".

```text
docs/
├── README.md                    # Pintu masuk tunggal: "Saya ingin ..." → tautan (lihat tabel di bawah)
├── getting-started/             # JALUR PEMULA (urut baca 1 → 2 → 3)
│   ├── 01-INSTALASI-ANDROID-TERMUX.md   # ← gabungan INSTALLATION.md + bagian server dari PRODUCTION_OPERATIONS
│   ├── 02-TUTORIAL-PEMAKAIAN-V4.md      # ← USER_GUIDE.md diperbaiki (alur 8 langkah)
│   └── 03-CHEATSHEET-TERMUX.md          # ← TERMUX_SETUP.md
├── methodology/
│   └── USAGE.md                 # metodologi ZLCE (4 gerbang, WAL, triase R1–R7); versi ditandai
├── operations/
│   ├── PRODUCTION_OPERATIONS.md # (buat/pulihkan; satu-satunya panduan menjalankan scripts/zlce-prod-start.sh)
│   ├── TROUBLESHOOTING.md       # diselaraskan dengan definisi Kasus A–D kanonik
│   └── SECURITY_AUDIT.md
├── reference/
│   ├── RECOVERY_CASES.md        # SATU definisi kanonik Kasus A–D (tautan dari semua dokumen lain)
│   ├── CLI_ZLCE.md              # ← scripts/zlce/README.md + tabel allowlist yang akurat
│   ├── TAB_IDS.md               # id tab resmi ↔ nama tampil ↔ dokumen terkait
│   └── blueprint/01..14_*.md    # tetap, tanpa perubahan isi
├── decisions/
│   ├── FEASIBILITY_AND_DECISIONS.md
│   ├── MOBILE_BLUEPRINT.md
│   └── DEVICE_AUDIT.md
└── archive/                     # berisi revisi/* (AUDIT_3.22, REVISION_PLAN, REVISION_REPORT) bila ada
```

> Bila perpindahan folder terlalu invasif sekarang, **versi minimal (P1)**: pertahankan jalur lama `docs/mobile/*`, tambahkan hanya `docs/README.md` baru, `docs/mobile/PRODUCTION_OPERATIONS.md`, dan `docs/reference/RECOVERY_CASES.md`, lalu perbaiki isi. Pemindahan folder lengkap menyusul (P2) beserta pengalihan tautan.

**Peran tiap berkas dan navigasi (`docs/README.md` baru):**

| Saya ingin ... | Baca |
|---|---|
| Memasang di tablet dari nol | `getting-started/01-INSTALASI-ANDROID-TERMUX.md` |
| Memakai aplikasi sehari-hari (estafet 8 anggota) | `getting-started/02-TUTORIAL-PEMAKAIAN-V4.md` |
| Memakai metode ZLCE dengan AI saya | `methodology/USAGE.md` |
| Menjalankan di produksi / berbagi lewat Wi-Fi | `operations/PRODUCTION_OPERATIONS.md` |
| Memperbaiki masalah (crash, git, token) | `operations/TROUBLESHOOTING.md` → `reference/RECOVERY_CASES.md` |
| Memeriksa keamanan | `operations/SECURITY_AUDIT.md`, `reference/blueprint/08_SECURITY_MODEL.md` |
| Memahami arsitektur | `reference/blueprint/01…14` |

**Pemetaan dari kondisi sekarang ke target (tanpa penghapusan):**

| Berkas sekarang | Tindakan |
|---|---|
| `docs/mobile/INSTALLATION.md` | Tulis ulang (Bagian 5 laporan ini); versi lama → `archive/` dengan banner |
| `docs/mobile/USER_GUIDE.md` | Perbaiki (C3, F3, C4); alur 8 langkah dipertahankan (Bagian 6) |
| `docs/mobile/TERMUX_SETUP.md` | Perbaiki path alias; revisi bagian Zero-Daemon (C2) |
| `docs/mobile/TROUBLESHOOTING.md` | Selaraskan Kasus A–D dengan `RECOVERY_CASES.md` (C1) |
| `docs/USAGE.md` | Perbarui versi (v3.2.2 → v4.0.0 atau beri banner "metodologi inti, versi kit 3.2.2") |
| `docs/README.md` | Ganti dengan indeks bergaya tabel di atas; hapus entri berkas yang tidak ada atau tandai "[Belum tersedia]" |
| `docs/mobile/PRODUCTION_OPERATIONS.md` | **Pulihkan atau tulis** (N1) |
| `docs/revisi/*` | Pastikan ada; pindah ke `archive/` |

---

## 4. Draf README.md yang Disarankan

Ganti isi `README.md` dengan teks di bawah. Seluruh angka yang belum terverifikasi ditandai. Badge uji sengaja memakai teks netral sampai angka dikonfirmasi.

`````markdown
<div align="center">

# ZLCE Studio & Mobile Workbench

**Zero-Loss Context Engineering — jaga konteks proyek tetap utuh saat bekerja dengan AI coding agent.**
Kit dokumen kontrol + aplikasi web (PWA) yang berjalan di tablet Android melalui Termux.

[![Version](https://img.shields.io/badge/version-4.0.0%20GA-informational.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.19-339933.svg)](#prasyarat)
[![Tasks](https://img.shields.io/badge/ZLCE%20tasks-82%2F82%20DONE-success.svg)](SESSION_STATE.md)
[![Platform](https://img.shields.io/badge/platform-Android%20%C2%B7%20Termux%20%C2%B7%20PWA-3DDC84.svg)](docs/getting-started/01-INSTALASI-ANDROID-TERMUX.md)

[Mulai Cepat](#mulai-cepat) · [Panduan Pemula Android](docs/getting-started/01-INSTALASI-ANDROID-TERMUX.md) · [Tutorial Pemakaian](docs/getting-started/02-TUTORIAL-PEMAKAIAN-V4.md) · [Indeks Dokumentasi](docs/README.md) · [Pemecahan Masalah](docs/operations/TROUBLESHOOTING.md)

</div>

---

## Apa itu ZLCE?

Saat bekerja dengan AI, konteks mudah hilang: sesi baru tidak tahu keputusan sebelumnya, kuota habis di tengah jalan, atau AI mengubah kode di luar permintaan. ZLCE menyelesaikannya dengan satu prinsip: **status proyek ditulis di berkas, bukan di ingatan obrolan.**

- **`SESSION_STATE.md`** = sumber kebenaran tunggal (matriks task, catatan serah terima, *write-ahead log*).
- **4 Gerbang Kualitas** menahan AI menulis kode sebelum spesifikasi Anda setujui.
- **Tepat 1 task `IN_PROGRESS`**; `DONE` hanya sah dengan bukti verifikasi nyata.
- **Recovery Kasus A–D** untuk melanjutkan sesi yang terputus.

Terdiri dari tiga bagian:

| Bagian | Fungsi |
|---|---|
| **Kit Kontrol** | Prompt (`LANDING_PROMPT.md`, `HANDOVER_PROMPT.md`), `templates/`, bundel satu berkas `ZLCE_KIT_SINGLE.md` |
| **ZLCE Studio / Mobile Workbench** | Aplikasi web React 19 + Vite + Tailwind v4 (PWA) untuk tablet Samsung Galaxy Tab A7 Lite dan tim estafet 8 anggota |
| **CLI `zlce`** | `check`, `snapshot`, `collect`, `pull`, `push`, `clean-auth` (dispatcher allowlist di `scripts/zlce/`) |

---

## Mulai Cepat

### Prasyarat

| Kebutuhan | Versi |
|---|---|
| Node.js + npm | `>=20.19` (rekomendasi LTS terbaru) |
| Python | 3.10+ (hanya pustaka standar) |
| git, bash | terbaru |

### Opsi 1 — Tablet Android (Termux), untuk pemula

Ikuti **[Panduan Instalasi Android (Termux)](docs/getting-started/01-INSTALASI-ANDROID-TERMUX.md)**. Ringkasnya:

```bash
pkg update -y && pkg upgrade -y
pkg install -y git python nodejs-lts bash coreutils micro openssh
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/layangsetrum-arch/T1ZLCE-Mobench-v4.0.0GA.git
cd T1ZLCE-Mobench-v4.0.0GA
npm install
bash scripts/zlce-prod-start.sh
```

Buka **http://localhost:3000** di Chrome / Samsung Internet, lalu pilih **Instal aplikasi** untuk memasang PWA.

### Opsi 2 — Komputer (mode pengembangan)

```bash
git clone https://github.com/layangsetrum-arch/T1ZLCE-Mobench-v4.0.0GA.git
cd T1ZLCE-Mobench-v4.0.0GA
npm install
npm run dev          # http://localhost:3000
```

Build produksi: `npm run build` lalu `npm run preview`.

### Opsi 3 — Hanya kit dengan AI Anda (tanpa aplikasi)

1. Pilih mode **LITE** (4 berkas) atau **FULL** (10 berkas).
2. Isi parameter di [`LANDING_PROMPT.md`](LANDING_PROMPT.md).
3. Lampirkan `templates/` (atau satu berkas [`ZLCE_KIT_SINGLE.md`](ZLCE_KIT_SINGLE.md)) lalu tempel prompt.
4. Setujui Gerbang 1: *"Setujui Gerbang 1 (BLUEPRINT.md). Lanjutkan ke gerbang berikutnya."*

Lanjut sesi / ganti AI: gunakan [`HANDOVER_PROMPT.md`](HANDOVER_PROMPT.md) + `SESSION_STATE.md`, `TASKS.md`, `AI_WORKFLOW.md` (Mode LITE: `HANDOVER.md`).

### Uji cepat CLI

```bash
python3 scripts/zlce/zlce-check.py . --no-git
# RESULT: OK (0 error, 0 warn, 82 task)
```

---

## Cara Kerja

```text
Gerbang 1  BLUEPRINT.md                → Anda periksa & setujui
Gerbang 2  ARCHITECTURE + DATA_MODEL   → (khusus FULL)
Gerbang 3  TASKS.md + TESTING.md       → Anda periksa & setujui
Gerbang 4  SESSION_STATE + AI_WORKFLOW → eksekusi task atomik dimulai
```

Alur harian tim estafet (8 langkah): **ambil tablet → pilih anggota → klaim 1 task → buat Context Pack → jalankan di AI → tangkap hasil + `zlce check` → commit & push branch `task/TASK-xxx` → serah terima + `clean-auth`**. Rinciannya di [Tutorial Pemakaian](docs/getting-started/02-TUTORIAL-PEMAKAIAN-V4.md).

Pemulihan sesi terputus (Kasus A–D): lihat [`docs/reference/RECOVERY_CASES.md`](docs/reference/RECOVERY_CASES.md).

---

## Dokumentasi

| Tujuan | Dokumen |
|---|---|
| Pasang dari nol di Android | [Instalasi Android/Termux](docs/getting-started/01-INSTALASI-ANDROID-TERMUX.md) |
| Pakai sehari-hari | [Tutorial Pemakaian v4](docs/getting-started/02-TUTORIAL-PEMAKAIAN-V4.md) |
| Metode ZLCE (gerbang, WAL, triase) | [`docs/methodology/USAGE.md`](docs/methodology/USAGE.md) |
| Operasi produksi | [`docs/operations/PRODUCTION_OPERATIONS.md`](docs/operations/PRODUCTION_OPERATIONS.md) |
| Masalah & pemulihan | [`docs/operations/TROUBLESHOOTING.md`](docs/operations/TROUBLESHOOTING.md) |
| Arsitektur (14 cetak biru) | [`docs/reference/blueprint/`](docs/reference/blueprint/) |
| Indeks lengkap | [`docs/README.md`](docs/README.md) |

---

## Struktur Repositori (ringkas)

```text
.
├── LANDING_PROMPT.md / HANDOVER_PROMPT.md / ZLCE_KIT_SINGLE.md   # kit
├── templates/  examples/                                         # template & contoh
├── SESSION_STATE.md  TASKS.md  CHANGELOG.md                      # kontrol proyek ini sendiri
├── docs/                                                         # dokumentasi (lihat docs/README.md)
├── scripts/                                                      # zlce-prod-start.sh, run-tests.py, security-audit.sh, install-hooks.sh
│   └── zlce/                                                     # CLI kanonik: zlce, zlce-check.py, zlce-snapshot.sh, zlce-collect.py, clean-auth.sh
├── src/                                                          # React 19 + Vite + Tailwind v4 (components/, hooks/, utils/, types/, tests/)
├── public/                                                       # manifest.webmanifest, sw.js, ikon PWA
└── package.json  tsconfig.json  vite.config.ts  index.html
```

---

## Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | server pengembangan, port 3000 |
| `npm run build` | build produksi ke `dist/` |
| `npm run preview` | pratinjau build produksi |
| `npm run lint` | `tsc --noEmit` |
| `npm test` | `python3 scripts/run-tests.py` |
| `npm run sync:assets` | sinkron berkas kanonik ke `scripts/zlce/` dan `zlce-starter-kit/` |

---

## Pengujian

Jalankan `npm test` untuk seluruh pemeriksaan otomatis dan `npm run lint` untuk pemeriksaan tipe. Hasil terakhir yang dikonfirmasi: **[ISI SETELAH DIVERIFIKASI: jumlah lulus/total + tanggal]**.

## Batasan yang Diketahui

- Kepatuhan AI terhadap protokol bersifat probabilistik.
- Validator web tidak memeriksa silang `TASKS.md` dan git; gunakan `zlce check`.
- Estimasi token memakai pendekatan 1 token ≈ 4 karakter.
- Aplikasi web tidak mengakses git/berkas lokal; operasi git dilakukan di terminal Termux.
- Server produksi bawaan mengikat `0.0.0.0`; gunakan `HOST=127.0.0.1 bash scripts/zlce-prod-start.sh` bila tidak ingin diakses dari jaringan.

## Privasi & Keamanan

Aplikasi berjalan sepenuhnya di sisi klien; draf disimpan di `localStorage`. Jangan menaruh kunci API/token di `SESSION_STATE.md`. Di tablet bersama, jalankan `bash scripts/zlce/clean-auth.sh` setiap serah terima. Lihat [`SECURITY.md`](SECURITY.md).

## Kontribusi & Lisensi

Lihat [`CONTRIBUTING.md`](CONTRIBUTING.md) dan [`CHANGELOG.md`](CHANGELOG.md). Lisensi [MIT](LICENSE) © 2026 ZLCE Project Contributors.
`````

**Catatan untuk penulis draf ini:**
- Perintah `HOST=127.0.0.1 bash scripts/zlce-prod-start.sh` valid menurut skrip (`HOST="${HOST:-0.0.0.0}"`).
- Tautan ke `docs/getting-started/…`, `docs/methodology/…`, dst. hanya berlaku setelah struktur Bagian 3 diterapkan. Pada versi minimal, ganti dengan jalur lama (`docs/mobile/INSTALLATION.md`, dll.).
- Baris Node `>=20.19` berasal dari badge README lama; tidak ada `engines` di `package.json` **[PERLU KONFIRMASI]**.

---

## 5. Draf Panduan Instalasi & Persiapan Android (Termux)

Draf ini menggantikan `docs/mobile/INSTALLATION.md`. Semua perintah berasal dari `INSTALLATION.md`, `docs/README.md` §3, `zlce-prod-start.sh`, `package.json`, dan `scripts/zlce/README.md`.

`````markdown
# Panduan Instalasi Android (Termux) — dari Nol sampai PWA Terpasang

Untuk: Samsung Galaxy Tab A7 Lite (SM-T225) atau tablet/ponsel Android lain.
Tidak perlu pengalaman Linux. Salin perintah **persis**, satu blok demi satu blok.

## Sebelum mulai

- Baterai di atas 50% atau sambungkan pengisi daya.
- Koneksi internet (Wi-Fi) untuk mengunduh paket. Perkiraan unduhan: **[PERLU KONFIRMASI: ukuran]**.
- Ruang penyimpanan kosong yang cukup untuk `node_modules`. **[PERLU KONFIRMASI: angka]**.

## Langkah 1 — Pasang Termux dari F-Droid

> **Jangan** pasang Termux dari Google Play Store. Gunakan F-Droid.

1. Buka **Chrome** di tablet.
2. Buka `https://f-droid.org/packages/com.termux/` lalu ketuk **Unduh APK**.
3. Saat diminta, izinkan Chrome **"Pasang aplikasi tidak dikenal"** (Install unknown apps).
4. Buka berkas APK yang terunduh, ketuk **Pasang**, lalu buka **Termux**.

Anda akan melihat layar hitam dengan tanda `$`. Itu normal: itulah *terminal*, tempat Anda mengetik perintah.

## Langkah 2 — Perbarui paket dan pasang alat yang dibutuhkan

Ketik (atau tempel) lalu tekan **Enter**:

```bash
pkg update -y && pkg upgrade -y
```

Jika Termux menanyakan pemilihan *mirror* (server unduhan) atau menanyakan apakah berkas konfigurasi diganti, pilih opsi bawaan (tekan Enter). **[PERLU KONFIRMASI: perintah `termux-change-repo` tidak ada di bundel; jangan dipakai kecuali galat pada pembaruan.]**

Lalu pasang alat (perhatikan: `nodejs-lts` **wajib**):

```bash
pkg install -y git python nodejs-lts bash coreutils micro openssh
```

Periksa hasilnya:

```bash
node -v
npm -v
python3 --version
git --version
micro --version
```

Setiap perintah harus menampilkan nomor versi. Aplikasi memerlukan Node.js `>=20.19` (sesuai badge README). Jika `node -v` menampilkan versi lebih rendah, **berhenti dan laporkan**. **[PERLU KONFIRMASI: versi Node yang dipasang `nodejs-lts` di Termux.]**

## Langkah 3 — (Opsional) Izinkan akses penyimpanan

Hanya diperlukan bila Anda ingin menukar berkas dengan folder tablet (`~/storage/shared`):

```bash
termux-setup-storage
```

Ketuk **Izinkan** pada dialog Android.

## Langkah 4 — Unduh (clone) proyek dan pasang dependensi

```bash
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/layangsetrum-arch/T1ZLCE-Mobench-v4.0.0GA.git
cd T1ZLCE-Mobench-v4.0.0GA
```

Pindah ke cabang kerja bila diminta tim:

```bash
git checkout v4-mobile
```

> `SESSION_STATE.md` mencatat cabang `v4-mobile`. Apakah cabang default repo sudah sama, **[PERLU KONFIRMASI]**. Jika perintah di atas menjawab `error: pathspec 'v4-mobile' did not match`, lewati langkah itu.

Pasang dependensi JavaScript (butuh beberapa menit, jangan tutup Termux):

```bash
npm install
```

> **Peringatan:** proyek memakai Vite 8 dan Tailwind v4 (`package.json`) yang menyertakan komponen biner bawaan. Kompatibilitasnya di Termux/Android **belum terdokumentasi** di repositori. **[PERLU KONFIRMASI]** — jika `npm install` atau `npm run build` gagal dengan galat soal paket biner/*native*, salin seluruh pesan galat dan laporkan; jangan mencoba `--force`.

## Langkah 5 — (Opsional tapi disarankan) Pasang perintah `zlce` dan hook keamanan

```bash
mkdir -p ~/bin
ln -sf ~/projects/T1ZLCE-Mobench-v4.0.0GA/scripts/zlce/zlce ~/bin/zlce
chmod +x ~/projects/T1ZLCE-Mobench-v4.0.0GA/scripts/zlce/zlce
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
zlce help
```

Pasang pemeriksa rahasia otomatis sebelum `git commit` (dijelaskan di `USER_GUIDE.md` bagian AUD-001):

```bash
bash scripts/install-hooks.sh
```

## Langkah 6 — Jalankan aplikasi

```bash
cd ~/projects/T1ZLCE-Mobench-v4.0.0GA
bash scripts/zlce-prod-start.sh
```

Skrip melakukan 5 langkah otomatis: (1) memberi izin eksekusi skrip, (2) memeriksa `node`/`python3`/`git`, (3) menjalankan `zlce-check.py` pada `SESSION_STATE.md`, (4) membuat `dist/` bila belum ada (`npm run build`), (5) menampilkan alamat dan menjalankan `npx vite preview` di port 3000.

Keberhasilan ditandai dengan kotak hijau **"ZLCE MOBILE WORKBENCH SIAP DIOPERASIKAN"** dan alamat `http://localhost:3000`.

- Untuk memaksa build ulang: `bash scripts/zlce-prod-start.sh --build`.
- Agar **tidak** terbuka bagi perangkat lain di Wi-Fi: `HOST=127.0.0.1 bash scripts/zlce-prod-start.sh`.
- Mengganti port: `PORT=3001 bash scripts/zlce-prod-start.sh`.
- **Biarkan jendela Termux ini terbuka.** Server berhenti dengan `Ctrl+C`. Untuk membuka Chrome tanpa menutup server, pakai **gestur pindah aplikasi** (jangan "tutup" Termux dari daftar aplikasi terbaru).

Jika skrip berhenti dengan `[FAIL] Dokumen kontrol memiliki error kanonik`, berarti `SESSION_STATE.md` tidak valid. Jalankan `python3 scripts/zlce-check.py .` untuk melihat penyebab, atau pulihkan dari `templates/SESSION_STATE.template.md`.

Jika muncul `[ERROR] Kebutuhan runtime belum lengkap`, pasang paket yang disebut (misalnya `pkg install nodejs-lts`).

## Langkah 7 — Buka di Chrome dan pasang PWA

1. Buka **Chrome** (atau Samsung Internet) → alamat `http://localhost:3000`.
2. Tunggu halaman dimuat sepenuhnya (Service Worker aktif; `INSTALLATION.md` lama menyebut badge hijau online **[PERLU KONFIRMASI: label tepat di UI]**).
3. Ketuk menu **⋮** → **Instal aplikasi** (atau **Tambahkan ke Layar Utama**).
4. Ketuk **Instal**. Ikon **ZLCE Mobile** muncul di layar utama (nama pendek dari `manifest.webmanifest`).
5. Buka dari ikon: aplikasi tampil layar penuh (`display: standalone`).

> Penyiapan PWA bergantung pada ikon `/icons/icon-192x192.png` dan `/icons/icon-512x512.png`. **[PERLU KONFIRMASI: ikon ada di repo; tidak ada di bundel audit.]**
> Setelah dimuat sekali, *service worker* menyimpan cangkang aplikasi untuk mode offline (`public/sw.js`). Apakah PWA tetap terbuka setelah server dihentikan **[PERLU KONFIRMASI di perangkat nyata]**.

## Langkah 8 — Verifikasi akhir

```bash
cd ~/projects/T1ZLCE-Mobench-v4.0.0GA
zlce check
```

Hasil yang benar: `RESULT: OK (0 error, 0 warn, 82 task)`. (Pesan `[INFO] Git tidak tersedia...` muncul hanya jika folder bukan repositori git.)

## Jika terjadi masalah

| Gejala | Tindakan |
|---|---|
| `Permission denied` saat menjalankan skrip | `chmod +x scripts/zlce/zlce scripts/zlce/clean-auth.sh scripts/*.sh` |
| `node: command not found` | `pkg install -y nodejs-lts` |
| `npm run build` gagal setelah `git clone` | pastikan `npm install` sudah dijalankan |
| Halaman refresh sendiri saat kembali dari AI | normal (Android mematikan tab latar belakang); data draf tersimpan otomatis |
| Lainnya | `docs/operations/TROUBLESHOOTING.md` |
`````

---

## 6. Draf Tutorial Pemakaian ZLCE Mobile v4

Draf ini menggantikan/memperbaiki `docs/mobile/USER_GUIDE.md`. Fakta berasal dari `USER_GUIDE.md`, `scripts/zlce/*`, `src/utils/gitCommitFormatter.ts`, `src/utils/provenanceInjector.ts` (nama berkas), `SESSION_STATE.md`, dan blueprint 07/14.

`````markdown
# Tutorial Pemakaian ZLCE Mobile v4 — Alur Harian Tim Estafet

## 1. Konsep yang harus dipahami lebih dulu

| Istilah | Arti singkat |
|---|---|
| **Single Source of Truth** | `SESSION_STATE.md`. Apa pun yang tidak tertulis di berkas dianggap tidak ada. |
| **Matriks Task** | Tabel di `SESSION_STATE.md` bagian 2. Status: `PENDING`, `READY`, `IN_PROGRESS`, `BLOCKED`, `DONE`. |
| **Aturan 1 task** | **Hanya satu** task boleh `IN_PROGRESS` di tablet bersama. |
| **WAL** | Catatan rencana langkah (bagian 3 `SESSION_STATE.md`) yang ditulis **sebelum** menyentuh berkas. |
| **Context Pack** | Paket teks portabel yang ditempel ke AI baru agar AI itu langsung paham keadaan terakhir. |
| **Provenance** | Jejak "siapa, AI apa, kapan, task apa" yang disisipkan ke hasil. |
| **`DONE`** | Hanya sah dengan bukti verifikasi dan persetujuan berformat `ya (oleh: Nama)`. |

## 2. Tim dan profil

Profil tidak menyimpan password/token. Alias: `eko`, `oned`, `cxperia`, `sulistiyani`, `layang`, `acimau`, `kepek`, `gete` (lihat `src/data/teamMembers.ts` untuk data otoritatif; domain email contoh: **[PERLU KONFIRMASI: `.local` atau `.internal`]**). Ganti anggota lewat tombol **Active Member Selector** di header; pilihan tersimpan di `localStorage` (`zlce_active_member_id`).

## 3. Alur 8 langkah

```text
1 Ambil tablet → 2 Pilih anggota & cek status → 3 Klaim 1 task → 4 Context Pack
   → 5 Kerjakan di AI → 6 Tangkap hasil + zlce check → 7 Branch, commit, push → 8 Serah terima + clean-auth
```

### Langkah 1 — Ambil tablet
- Baterai > 20% atau sambungkan pengisi daya.
- Pastikan server berjalan (Termux: `bash scripts/zlce-prod-start.sh`) lalu buka ikon **ZLCE Mobile**.

### Langkah 2 — Pilih anggota dan cek status
- Pilih nama Anda di **Active Member Selector**.
- Buka tab **Session State** (id tab: `session`) atau widget kesehatan state di **Dashboard**.
- Pastikan tidak ada task `IN_PROGRESS` tersisa. Jika ada, baca catatan serah terima (bagian 6 `SESSION_STATE.md`) lebih dulu.

### Langkah 3 — Klaim satu task
- Pilih task `READY` berikutnya; ketuk klaim (banner klaim akan menolak klaim ganda, aturan ADR-04).
- Isi WAL (rencana langkah + berkas yang akan diubah + perintah verifikasi) **sebelum** mengubah apa pun.
- Mengambil alih task orang lain: gunakan wizard *takeover* dengan alasan minimal 5 karakter (AUD-006).

### Langkah 4 — Buat Portable Context Pack
1. Buka tab **Context Pack** (`context-pack`).
2. Pilih task aktif.
3. Pilih profil model (mis. Claude 30K, Gemini 1M, ChatGPT ringkas). Anggaran token menyesuaikan otomatis (`tokenBudgetAdapter.ts`).
4. Ketuk **Salin Context Pack** (1 ketukan).

### Langkah 5 — Kerjakan di AI
- Pindah ke Chrome/aplikasi AI, mulai **percakapan baru**, tempel Context Pack, tunggu jawaban, salin hasilnya.
- Batasi maksimal 2 tab Chrome agar RAM 3 GB tidak kehabisan.

### Langkah 6 — Tangkap hasil dan verifikasi
1. Kembali ke ZLCE; draf Anda dipulihkan otomatis jika Android mematikan tab.
2. Buka tab **Result Capture** (`result-capture`), tempel hasil AI. Aplikasi menyuntikkan provenance `[Aktor, Model AI, Timestamp, Task ID]` (Invarian I4).
3. Simpan perubahan ke berkas proyek (ekspor `.md` atau gunakan `micro` di Termux).
4. Verifikasi kanonik di Termux:

```bash
cd ~/projects/T1ZLCE-Mobench-v4.0.0GA
zlce check
```

Wajib: `RESULT: OK (0 error, 0 warn, ...)`. Jika ada error, **jangan lanjut**; perbaiki dulu.

### Langkah 7 — Branch, commit, push
```bash
git checkout -b task/TASK-xxx
git add -A
git -c user.name="Nama Anda" -c user.email="email@contoh" commit -m "feat(scope): implementasi TASK-xxx"
zlce push
```

> **Koreksi dari dokumen lama:** bentuk yang benar adalah `git -c ... commit`, **bukan** `git commit -c ...` (`-c` pada `commit` punya arti lain). Bentuk benar sama dengan keluaran `gitCommitFormatter.ts`.
> `zlce push` menolak push dari cabang `main`. Gunakan cabang `task/TASK-xxx`. Jika diminta, masukkan kredensial; cache RAM berlaku maksimal 15 menit (`cache --timeout=900`, ADR-04).
> Memperbarui cabang: `zlce pull` (hanya *fast-forward*, menolak bila working tree kotor).

### Langkah 8 — Serah terima dan bersihkan memori
1. Tandai task `DONE` di `SESSION_STATE.md` dengan bukti dan persetujuan `ya (oleh: Nama Anda)`; perbarui catatan serah terima (bagian 6).
2. Pastikan perubahan sudah ter-push.
3. Buka **Device Handover Wizard** (header) dan ikuti 4 butir checklist.
4. Bersihkan kredensial memori:

```bash
bash scripts/zlce/clean-auth.sh        # atau: zlce clean-auth
```

`clean-auth.sh` menghentikan daemon `git credential-cache`, menghapus soket cache, memeriksa `credential.helper` (peringatan jika bukan `cache`), menghapus variabel `GITHUB_TOKEN`/`GH_TOKEN` pada subproses, dan menggagalkan (exit 1) bila ada token tertanam di URL remote. Untuk membersihkan variabel di shell Termux induk, jalankan `source scripts/zlce/clean-auth.sh`.
5. Tutup tab AI; jika sempat mengetik token manual, jalankan `history -c`.
6. Serahkan tablet.

## 4. Command Hub (salin-tempel perintah aman)

Tab **Command Hub** (`command-hub`) memuat 10 template berlabel risiko: 🟢 aman (baca saja), 🟡 mengubah, 🔴 destruktif (diblokir tanpa konfirmasi ganda). Ketuk **Salin Perintah**, lalu tempel di Termux. Daftar rinci: `docs/mobile/blueprint/13_COMMAND_TEMPLATES.md`.

## 5. Sinkronisasi dan konflik
Tab **Git Sync** (`git-sync`) menyediakan *Conflict Resolution Wizard*: tempel pesan galat dari Termux, ikuti panduan, buka berkas konflik di `micro`, hapus penanda `<<<<<<<`, `=======`, `>>>>>>>`, simpan (`Ctrl+S`), keluar (`Ctrl+Q`), lalu `zlce check`. **Jangan** memakai `--force` atau `branch -D`.

## 6. Sesi terputus
Gunakan `zlce snapshot --diff` lalu ikuti [`RECOVERY_CASES.md`](../reference/RECOVERY_CASES.md) (definisi kanonik A–D; lihat temuan C1).

## 7. Menghemat RAM 3 GB
Maksimal 2 tab Chrome; bersihkan aplikasi latar belakang; hentikan server (`Ctrl+C`) saat tidak dipakai; ketikan tersimpan otomatis tiap jeda 400 ms.
`````

**Pengecekan terhadap kode:** `zlce push` menolak `main` (`scripts/zlce/zlce`); `zlce pull` memakai `merge --ff-only`; `gitCommitFormatter.ts` memakai `git -c ... commit`; `clean-auth.sh` perilaku sesuai uraian di atas; tab id dari `src/types/zlce.ts`.

---

## 7. Daftar Informasi [PERLU KONFIRMASI]

| # | Pertanyaan | Mengapa penting |
|---|---|---|
| Q1 | Isi `public/assets/aistudio/file.md_75a501e3.txt` (Framework 6-Tahap) | Tidak ada di bundel; struktur laporan mengikuti butir 1–8 mandat |
| Q2 | Apakah `docs/mobile/PRODUCTION_OPERATIONS.md`, `BLUEPRINT_REVIEW.md`, `AUDIT_BASELINE.md`, dan `docs/revisi/*` ada di repo GitHub | Dirujuk di banyak tempat; di bundel tidak ada |
| Q3 | Apakah `public/icons/*.png`, `vite.config.ts`, `zlce-starter-kit/`, `data/FEEDBACK_ZLCE_EVALUASI.md` ada di repo | Menentukan apakah PWA bisa dipasang/offline dan apakah `run-tests.py` lulus penuh |
| Q4 | Versi Node yang dipasang `pkg install nodejs-lts` dan apakah memenuhi `>=20.19` | Vite 8 / Tailwind v4 |
| Q5 | Apakah `npm install` + `npm run build` berhasil pada Termux arm64 (paket biner Tailwind v4/esbuild/Vite) | Titik gagal terbesar bagi pemula |
| Q6 | Cabang default repo (`main` atau `v4-mobile`) | `git checkout v4-mobile` di dokumen |
| Q7 | Domain email profil: `@zlce.internal` atau `@zlce.local` | Ketidakcocokan docs vs `teamMembers.ts` |
| Q8 | Apakah server `vite preview` aman dibiarkan hidup lama di Termux (Android dapat mematikan Termux); apakah PWA bertahan offline tanpa server | Mempengaruhi aturan "Zero-Daemon" |
| Q9 | Definisi Kasus A–D yang berlaku (USAGE/README vs TROUBLESHOOTING) | Kontradiksi C1; tidak ada sumber otoritatif di blueprint 09 yang saya verifikasi satu per satu |
| Q10 | Angka uji resmi (47/47? 32? 35?) dan di lingkungan mana dicapai | Badge README vs CHANGELOG vs hasil run di bundel |
| Q11 | Apakah zip `public/assets/zlce-*-bundle.zip` di-commit atau dibuat saat build/di tab Audit | README menaut seolah tetap |
| Q12 | Apakah entri `CHANGELOG` untuk TASK-047…082 dan tag GA ada di bagian lain | Teratas hanya `alpha.TASK-046` |
| Q13 | Perilaku pintasan `?tab=` PWA (apakah ada penanganan di berkas lain) | Tidak ditemukan di `src/` |
| Q14 | Nama label indikator "siap/online" di UI (INSTALLATION menyebut badge hijau; USER_GUIDE menyebut ikon petir hijau) | Dua dokumen berbeda menyebut indikator berbeda |

---

## 8. Daftar Perubahan yang Disarankan Berdasarkan Prioritas

### P0 — Kritis (menghalangi instalasi & penggunaan)

1. **Perbaiki `INSTALLATION.md`** dengan Bagian 5 laporan ini: tambah `nodejs-lts`, `npm install`, perintah menjalankan server, dan alamat `http://localhost:3000` (F1, F2).
2. **Seragamkan path folder** `T1ZLCE-Mobench-v4.0.0GA` di `INSTALLATION.md`, `TERMUX_SETUP.md`, `USER_GUIDE.md` (alias `cdp` juga) (F3).
3. **Perbaiki `zlce-prod-start.sh`:** jalankan `npm install` bila `node_modules/` tidak ada sebelum build (F4); perbaiki baris `echo -e` yang salah (F7).
4. **Pulihkan/buat `docs/mobile/PRODUCTION_OPERATIONS.md`** atau hapus tautannya dari README, `docs/README.md`, skrip (N1).
5. **Perbaiki sintaks git** di `USER_GUIDE.md`: `git -c user.name=… -c user.email=… commit` (C3).
6. **Satukan definisi Kasus A–D** dalam `RECOVERY_CASES.md` dan selaraskan `TROUBLESHOOTING.md` (C1).
7. **Pastikan ikon PWA ada di repo** dan ikut dalam bundel (Q3), karena `sw.js` dan manifest bergantung padanya.
8. **Uji `npm install` dan build di Termux nyata**, catat hasilnya di panduan (Q5).

### P1 — Penting untuk pemahaman & navigasi

1. Ganti `docs/README.md` dengan indeks bergaya tabel "Saya ingin..." (Bagian 3); beri status "[Belum tersedia]" untuk berkas yang belum ada (N2).
2. Ganti `README.md` dengan draf Bagian 4; hapus/ganti klaim "v3.2.2 14/14" dengan angka yang sudah diverifikasi (C5, N3).
3. Tambahkan flag/variabel di skrip produksi untuk melewati validasi state (mis. `--skip-check`) dan dokumentasikan `HOST=127.0.0.1` (F5, F6).
4. Selaraskan keluaran contoh `zlce --help` dan tabel `scripts/zlce/README.md` dengan dispatcher (F9, F10).
5. Jelaskan perbedaan "server latar depan sementara" vs "daemon" di `TERMUX_SETUP.md` (C2).
6. Perbarui `USAGE.md` (versi), `CLAUDE_CHATGPT_HANDOVER.md` ("43 task"), teks "Backlog 46 Task" pada `FeedbackReviewTab.tsx` (C5, C8).
7. Tambahkan field `engines` pada `package.json` (F11).
8. Buat `docs/reference/TAB_IDS.md` (id tab, nama tampil, dokumen terkait) (U4).

### P2 — Penyempurnaan gaya & opsional

1. **Preview Studio / workbench:**
   - **FeedbackReviewTab:** tambahkan `README.md`, `docs/README.md`, `docs/USAGE.md`, `scripts/zlce-prod-start.sh`, `package.json` ke daftar berkas rujukan fokus `docs-audit-readme` (U3); perbaiki label "46 Task"; beri catatan sumber zip (U2).
   - **CommandHubTab:** tambahkan tautan konteks "Baca panduan" per kategori ke `RECOVERY_CASES.md`, `CLI_ZLCE.md`, dan `13_COMMAND_TEMPLATES.md` (saat ini hanya satu komentar kode merujuk blueprint 13).
   - **WorkspaceReader:** beri lencana "Data contoh" pada preset tertanam dan tautan ke `02-TUTORIAL-PEMAKAIAN-V4.md` (U6).
   - **TutorialTab:** tambahkan tautan ke panduan Termux dan tutorial v4 (U5).
   - **Manifest shortcuts:** tambahkan pembaca `?tab=` di `App.tsx` atau hapus pintasan (U1).
2. Jadikan tautan "Baca panduan" yang sama dapat dibuka dalam aplikasi (modal markdown) sehingga alur dokumentasi dan antarmuka satu kesatuan.
3. Tambahkan `CHANGELOG` entri GA dan ringkasan fase 047–082 (C7).
4. Bubuhkan banner "USANG/diarsipkan" pada berkas lama yang dipindah (jangan dihapus).
5. Beri label "contoh" pada nama model di profil anggota (C6) dan ukuran unduhan di panduan Termux.
6. Tambahkan diagram alur 8 langkah sebagai gambar (mis. SVG) di tutorial.

---

*Seluruh temuan di atas dapat diperiksa ulang dengan membuka berkas dan baris yang disebut di kolom "Bukti". Perintah pengujian yang saya jalankan: `python3 -I scripts/zlce/zlce-check.py .`, `bash scripts/zlce/zlce --help`, `python3 -I scripts/run-tests.py`.*

=== END CLAUDE AUDIT RESPONSE ===
