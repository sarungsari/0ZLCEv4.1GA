# Laporan Tinjauan Kedua — Verifikasi Jawaban Tim & Rekomendasi Final
**ZLCE Studio & Mobile Workbench v4.0.0 GA** · bundel `zlce-claude-chatgpt-bundle.zip` (70 berkas) · 2026-11-08

Laporan ini melengkapi `LAPORAN_AUDIT_DOKUMENTASI_ZLCE.md` (tinjauan pertama). Setiap jawaban Q1–Q14 dari tim **diperiksa ulang ke isi berkas**, bukan diterima begitu saja. Penanda: ✅ terbukti · 🟡 sebagian · ❌ bertentangan dengan isi berkas · ❓ tidak bisa dibuktikan dari bundel ini.

> **Catatan metode.** Bundel ini sengaja lebih kecil (70 berkas) dari bundel audit pertama. Isinya **tidak** memuat `src/App.tsx`, sebagian besar `src/`, `templates/`, `examples/`, `zlce-starter-kit/`, `scripts/install-hooks.sh`, dan `node_modules/`. Karena itu, klaim yang menyangkut kode aplikasi atau hasil uji tidak dapat dibuktikan **maupun dibantah** dari bundel ini. Pada tinjauan pertama saya juga menjalankan `run-tests.py` dan `zlce-check.py` hanya pada salinan hasil ekstrak di folder kerja sementara. Tidak ada berkas proyek Anda yang diubah.
> Berkas rujukan **Framework 6-Tahap kini tersedia** (`public/assets/aistudio/file.md_75a501e3.txt`). Saya sudah membacanya: struktur 8 butir laporan pertama **sudah sesuai** dengan Tahap 6 di sana.

---

## 1. Verifikasi 14 jawaban tim

| # | Klaim tim | Status | Bukti / catatan |
|---|---|---|---|
| Q1 | 4 model resmi; uji cold-start TC-P3-06 lulus | 🟡 | `run-tests.py` memang memuat TC-P3-06, tetapi tidak bisa dijalankan pada bundel ini (lihat Status Verifikasi). Nama model tidak seragam: `USER_GUIDE.md` (DeepSeek-V3, Qwen 2.5), `PRODUCTION_OPERATIONS.md` §3 (Claude 3.5/5.5, Gemini 2.5/3.8), `teamMembers.ts` (Gemini 2.5 Flash). Klaim tim menyebut "DeepSeek V2.5". Perlu satu tabel model resmi. |
| Q2 | 8 anggota kanonik, sesuai `teamMembers.ts` dan `USER_GUIDE.md` | ❌ | **Nama/alias** cocok, tetapi **peran berbeda di tiga tempat**. `teamMembers.ts`: Eko = *System & Git Coordinator*, Oned = *Frontend & Mobile UI*, Cxperia = *QA & Test Harness*, Sulistiyani = *PWA & Offline Architect*, dst. `USER_GUIDE.md` §1: Eko = *Lead Engineer*, Oned = *QA & Gate Keeper*, Sulistiyani = *Technical Writer*. `PRODUCTION_OPERATIONS.md` §3: Eko = *Backend & Engine Architect*, Cxperia = *QA*, Sulistiyani = *Documentation*. |
| Q3 | Path kanonik `~/projects/T1ZLCE-Mobench-v4.0.0GA` | 🟡 | `INSTALLATION.md` sudah benar. **Masih salah**: `PRODUCTION_OPERATIONS.md:40` (`cd ~/projects/zlce-mobile-workbench`) dan alias `cdp` di `TERMUX_SETUP.md:26` yang memakai *fallback* ke path lama. |
| Q4 | Server = `vite preview` port 3000 via `zlce-prod-start.sh` | ✅ | `scripts/zlce-prod-start.sh:108` (`exec npx vite preview --port "$PORT" --host "$HOST"`). Alasan "SPA + Service Worker" tidak saya uji. |
| Q5 | `nodejs-lts` wajib; `INSTALLATION.md` dimutakhirkan | ✅ | `INSTALLATION.md:41` (`pkg install -y nodejs-lts`) dan `:70` (`npm install`). Skrip kini menjalankan `npm install` otomatis bila `node_modules/` tidak ada (baris 68–70). **Versi Node di Termux dan kompatibilitas paket biner Vite 8/Tailwind v4 di Android masih belum terjawab.** |
| Q6 | Berkas hilang kini ada; Claude bundle 70, Audit bundle 203 | 🟡 | **Ada kini:** `PRODUCTION_OPERATIONS.md`, `BLUEPRINT_REVIEW.md`, `AUDIT_BASELINE.md`, `docs/revisi/` (3 berkas), `public/icons/` (4 PNG), `vite.config.ts`, `vite-session-sync.ts` (baru), `file.md_75a501e3.txt`. **Jumlah 70 benar** untuk bundel ini. **Belum ada di bundel ini:** `data/FEEDBACK_ZLCE_EVALUASI.md`, `zlce-starter-kit/`, `templates/`, `examples/`. Bundel 203 berkas tidak diberikan, jadi tidak diperiksa. `PRODUCTION_OPERATIONS.md` §6 menyebut "162 berkas", tidak cocok dengan 70 maupun 203. |
| Q7 | `docs/revisi/` dipertahankan | ✅ | `AUDIT_3.22.md`, `REVISION_PLAN.md`, `REVISION_REPORT.md` ada. |
| Q8 | Kasus A–D di `TROUBLESHOOTING.md` selaras dengan USAGE/Blueprint 09 | 🟡 | **`TROUBLESHOOTING.md` §2 kini selaras dengan `USAGE.md` (kontradiksi C1 terselesaikan).** Sisa: (a) `PRODUCTION_OPERATIONS.md` §4 memuat versi ringkas ke-3 dan Kasus D-nya `git stash`, sedangkan `USAGE.md` menyuruh menandai task `BLOCKED` dan meminta konfirmasi manusia; (b) judul diagram Blueprint 09 untuk A dan C ("Commit sesuai WAL", "commit liar mendahului WAL") berbeda kata dari `USAGE.md`. |
| Q9 | Sintaks git commit diperbaiki | 🟡 | Benar di `USER_GUIDE.md:88`, `TROUBLESHOOTING.md:58`, `PRODUCTION_OPERATIONS.md`. **Masih salah** di `src/utils/auditPromptGenerator.ts:329` (`git commit -c user.name=…`). Teks ini muncul di jawaban Tanya-Jawab aplikasi dan di prompt yang dikirim ke AI. |
| Q10 | Semua anggota memakai `@zlce.local` | ❌ | `teamMembers.ts:13`, `USER_GUIDE.md:14`, dan `blueprint/14_MULTI_AI_TEAM_MODEL.md:23` memuat **`eko.keplek@gmail.com`** (alamat surel pribadi bergaya Gmail). Tujuh anggota lain `@zlce.local`. Lihat temuan baru B1. |
| Q11 | Port 3000 | ✅ | `package.json` (`vite --port=3000`) dan `PORT="${PORT:-3000}"` di skrip. |
| Q12 | `?tab=` kini didukung di `App.tsx` | ❓ | `src/App.tsx` **tidak ada** di bundel ini. Pintasan memang masih ada di `manifest.webmanifest:36,42,48`. Mohon kirim `App.tsx` atau bukti uji. |
| Q13 | Zero-Daemon vs server foreground | ✅ | `TERMUX_SETUP.md` §5 kini membedakan daemon permanen dari server interaktif sementara dan menyuruh `Ctrl+C` saat serah terima. Ini menyelesaikan C2. |
| Q14 | `zlce-starter-kit/` = template bersih, root = state aktif | 🟡 | Penjelasannya masuk akal tetapi **belum tertulis di dokumen mana pun** yang saya baca; README tidak memuat folder itu, padahal `sync-assets.mjs` dan `run-tests.py` bergantung padanya. |

**Status verifikasi tim (47/47, Zero-Secret, tsc) — ❓ tidak terbukti di sini.** Pada bundel ini `run-tests.py` gagal pada banyak langkah karena bahan uji tidak ada (`src/`, `templates/`, `examples/`, `.gitattributes`, `node_modules/`). Itu **bukan bukti** bahwa klaim tim salah. Mohon lampirkan keluaran terminal `npm test` dari repositori lengkap (beserta tanggal dan commit) agar badge README bisa dibenarkan.

---

## 2. Perbaikan dari tinjauan pertama yang terbukti sudah diterapkan

- **F1, F2, F4, F6** — `INSTALLATION.md` memasang `nodejs-lts`, menjalankan `npm install`, menyalakan server, dan menyebut `http://localhost:3000`. Skrip produksi kini memeriksa `node_modules/` (baris 68–70) dan menyediakan `--skip-check` / `ZLCE_SKIP_CHECK=1` (baris 56–62).
- **F7** — baris `echo` rusak (`$\ge 44\times 44$`) sudah tidak ada di skrip.
- **N1/N2** — `PRODUCTION_OPERATIONS.md`, `BLUEPRINT_REVIEW.md`, `AUDIT_BASELINE.md`, `docs/revisi/*` kini ada.
- **C1** — definisi Kasus A–D di `TROUBLESHOOTING.md` diselaraskan.
- **C2** — kebijakan Zero-Daemon diperjelas.
- **C3** — sintaks `git -c … commit` diperbaiki di dokumen (belum di kode, lihat Q9).
- **PWA** — ikon `public/icons/*.png` kini ada, jadi precache wajib di `sw.js` dapat terpenuhi.

---

## 3. Temuan baru / yang masih terbuka

| # | Sev | Temuan | Bukti | Saran |
|---|---|---|---|---|
| B1 | **T** | Surel pribadi (`eko.keplek@gmail.com`) tertanam di kode, panduan, dan blueprint pada repositori yang dimaksudkan publik. Bertentangan dengan jawaban Q10 dan dengan semangat kebijakan "profil non-kredensial". | `src/data/teamMembers.ts:13`; `docs/mobile/USER_GUIDE.md:14`; `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md:23` | **[PERLU KONFIRMASI pemilik]** apakah disengaja. Bila tidak, ganti ke `eko@zlce.local`. Perhatikan: jika berkas sudah pernah di-push, alamat tetap ada di riwayat git. |
| B2 | **T** | Dua versi "alur 8 langkah" yang tidak identik: `USER_GUIDE.md` (… 6 Validasi & Commit → 7 Push → 8 Serah terima/clean-auth) vs `PRODUCTION_OPERATIONS.md` (… 6 Sahkan Gerbang → 7 Clean-Auth → 8 Oper Tablet; commit disisipkan di langkah 5). Pengguna bisa mengira urutannya berbeda. Batas tab Chrome juga berbeda: **2** (`USER_GUIDE.md:143`) vs **5** (`PRODUCTION_OPERATIONS.md:146`). | kedua berkas | Jadikan `USER_GUIDE.md` satu-satunya sumber alur 8 langkah; di `PRODUCTION_OPERATIONS.md` cukup tautan + ringkasan satu baris. Seragamkan batas tab. |
| B3 | **T** | Peran 8 anggota berbeda di 3 tempat (Q2). | lihat Q2 | Jadikan `teamMembers.ts` sumber tunggal; `USER_GUIDE.md` dan `PRODUCTION_OPERATIONS.md` menampilkan tabel yang sama atau hanya menautkan. |
| B4 | **S** | `README.md` **belum berubah** dari versi yang saya audit: masih "v3.2.2", "14/14", "Gemini 3.8 Flash", "9 template", "run-tests.py (32 checks)" bersama badge `47/47`; pohon struktur tidak memuat `TASKS.md`, `SESSION_STATE.md`, `vite-session-sync.ts`, `zlce-starter-kit/`. Tautan mati yang tersisa pada bundel ini: `public/assets/zlce-audit-review-bundle.zip`, `data/FEEDBACK_ZLCE_EVALUASI.md` (`templates/` hanya hilang dari bundel ini). | `README.md` baris 9, 59, 177, 205, 240–247 | Pakai draf README di bagian 5. |
| B4b | **S** | `docs/USAGE.md` baris 3 masih menyatakan **v3.2.2**; `CHANGELOG.md` teratas masih `4.0.0-alpha.TASK-046` padahal rilis GA (82 task). | berkas masing-masing | Beri banner versi atau perbarui; tambahkan entri GA. |
| B5 | **S** | HOST default masih `0.0.0.0` dan `PRODUCTION_OPERATIONS.md` §2 malah menyebut "dapat diakses… di LAN" tanpa menyebut cara membatasi ke `127.0.0.1`. Di tablet bersama, ini menjadikan aplikasi terbuka bagi perangkat lain di Wi-Fi yang sama. | `scripts/zlce-prod-start.sh:19`; `PRODUCTION_OPERATIONS.md` §2 | Dokumentasikan `HOST=127.0.0.1 bash scripts/zlce-prod-start.sh`; pertimbangkan default `127.0.0.1` untuk skrip produksi. |
| B6 | **S** | `INSTALLATION.md:67` masih `git checkout v4-mobile`; cabang default repo belum dijawab. Contoh keluaran `zlce --help` (baris ±99–100) masih dua baris, sedangkan keluaran nyata dispatcher adalah kotak bantuan multi-baris (diverifikasi pada tinjauan pertama). | `INSTALLATION.md` | Tambah "jika galat `pathspec`, lewati"; ganti contoh keluaran. |
| B7 | **S** | `package.json` belum punya `engines`; badge "Node ≥ 20.19" tidak punya sumber. | `package.json` | Tambah `"engines": {"node": ">=20.19.0"}` setelah dikonfirmasi. |
| B8 | **R** | `vite-session-sync.ts` (plugin Vite yang membaca/menulis `SESSION_STATE.md`/`TASKS.md` dan memakai SSE) adalah berkas baru yang **tidak disebut** dalam dokumen yang saya baca. Belum saya telaah mendalam. | `vite-session-sync.ts`; `vite.config.ts:5` | **[PERLU KONFIRMASI]** apakah aktif di mode `preview`/produksi atau hanya `dev`; dokumentasikan perilakunya dan dampak keamanannya bila server diikat ke `0.0.0.0`. |
| B9 | **R** | Catatan di `PRODUCTION_OPERATIONS.md` §6 ("bundel audit 162 berkas") dan klaim tim (203 / 70) tidak konsisten. | lihat Q6 | Hapus angka tetap, atau tulis "jumlah berkas dapat berubah". |

---

## 4. Rekomendasi penyempurnaan akhir (berurutan)

**P0 — sebelum rilis dokumentasi**
1. Perbaiki `src/utils/auditPromptGenerator.ts:329` ke `git -c … commit` (Q9).
2. Ganti path lama di `PRODUCTION_OPERATIONS.md:40` dan alias `cdp` di `TERMUX_SETUP.md:26` (Q3).
3. Putuskan soal surel pribadi pada B1 sebelum README/zip dipublikasikan.
4. Lampirkan bukti uji (keluaran `npm test`, `npm run lint`, `bash scripts/security-audit.sh`) dari repositori lengkap; setelah itu baru badge `47/47` dipertahankan (README-nya statis).
5. Jawab dua hal teknis yang belum terjawab: **(a)** versi Node pada `pkg install nodejs-lts` di Tab A7 Lite; **(b)** apakah `npm install` dan `npm run build` sukses di Termux (arm64). Cukup tempelkan keluaran `node -v` dan beberapa baris terakhir `npm install`.

**P1 — navigasi dan konsistensi**
6. Ganti `README.md` dengan draf bagian 5 (sudah memakai jalur `docs/mobile/*` yang **kini ada**, jadi tidak perlu memindahkan folder).
7. Satukan alur 8 langkah dan tabel anggota (B2/B3); jadikan `teamMembers.ts` sumber peran.
8. Tambah satu paragraf "starter-kit vs root" (Q14) di `README.md` dan `docs/README.md`.
9. Perbarui `docs/USAGE.md`/`CHANGELOG.md` (B4b); dokumentasikan HOST dan `--skip-check` di `PRODUCTION_OPERATIONS.md` (B5).
10. Tambah `engines` di `package.json` (B7).

**P2 — penyempurnaan**
11. Struktur folder baru dari tinjauan pertama (Bagian 3) bersifat **opsional** sekarang. Cukup rapikan `docs/README.md` menjadi tabel "Saya ingin…".
12. Preview Studio: tambahkan `README.md`, `docs/README.md`, `docs/mobile/PRODUCTION_OPERATIONS.md`, `scripts/zlce-prod-start.sh`, dan `package.json` ke daftar berkas rujukan fokus `docs-audit-readme` di `FeedbackReviewTab.tsx` (daftar saat ini tidak memuatnya, dan masih berlabel "46 Task"). Beri lencana "Data contoh" pada preset `WorkspaceReader`. Tambahkan tautan "Baca panduan" dari tiap kategori `CommandHubTab` ke `13_COMMAND_TEMPLATES.md` dan bagian Kasus A–D di `TROUBLESHOOTING.md`.
13. Pastikan `?tab=` benar-benar ditangani (Q12) lalu tambahkan satu uji sederhana.

---

## 5. Draf README final (siap tempel, memakai jalur dokumen yang sekarang ada)

Perbedaan dari draf pertama: tautan mengarah ke `docs/mobile/*` dan `docs/USAGE.md`; ditambah penjelasan starter-kit, `--skip-check`, dan `HOST`. Dua nilai tetap ditandai karena belum terbukti: jumlah uji dan versi Node Termux.


`````markdown
<div align="center">

# ZLCE Studio & Mobile Workbench

**Zero-Loss Context Engineering — jaga konteks proyek tetap utuh saat bekerja dengan AI coding agent.**
Kit dokumen kontrol + aplikasi web (PWA) yang berjalan di tablet Android melalui Termux.

[![Version](https://img.shields.io/badge/version-4.0.0%20GA-informational.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.19-339933.svg)](#prasyarat)
[![Tasks](https://img.shields.io/badge/ZLCE%20tasks-82%2F82%20DONE-success.svg)](SESSION_STATE.md)
[![Platform](https://img.shields.io/badge/platform-Android%20%C2%B7%20Termux%20%C2%B7%20PWA-3DDC84.svg)](docs/mobile/INSTALLATION.md)

[Mulai Cepat](#mulai-cepat) · [Panduan Pemula Android](docs/mobile/INSTALLATION.md) · [Tutorial Pemakaian](docs/mobile/USER_GUIDE.md) · [Indeks Dokumentasi](docs/README.md) · [Pemecahan Masalah](docs/mobile/TROUBLESHOOTING.md)

</div>

---

> **Catatan:** `zlce-starter-kit/` adalah template bersih untuk proyek baru Anda; berkas di root repositori ini adalah *state aktif* ZLCE Mobile Workbench itu sendiri **[PERLU KONFIRMASI pemilik: redaksi]**.

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
| Node.js + npm | `>=20.19` **[PERLU KONFIRMASI: belum ada `engines` di package.json]** |
| Python | 3.10+ (hanya pustaka standar) |
| git, bash | terbaru |

### Opsi 1 — Tablet Android (Termux), untuk pemula

Ikuti **[Panduan Instalasi Android (Termux)](docs/mobile/INSTALLATION.md)**. Ringkasnya (skrip produksi juga menjalankan `npm install` otomatis bila `node_modules/` belum ada):

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

Opsi skrip: `HOST=127.0.0.1` (batasi ke perangkat ini), `PORT=3001` (ganti port), `--build` (paksa build ulang), `--skip-check` atau `ZLCE_SKIP_CHECK=1` (lewati validasi `SESSION_STATE.md`; hanya untuk darurat).

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

Alur harian tim estafet (8 langkah): **ambil tablet → pilih anggota → klaim 1 task → buat Context Pack → jalankan di AI → tangkap hasil + `zlce check` → commit & push branch `task/TASK-xxx` → serah terima + `clean-auth`**. Rinciannya di [Tutorial Pemakaian](docs/mobile/USER_GUIDE.md).

Pemulihan sesi terputus (Kasus A–D): lihat [`docs/mobile/TROUBLESHOOTING.md#2-protokol-kanonik-recovery-kasus-a--d`](docs/mobile/TROUBLESHOOTING.md#2-protokol-kanonik-recovery-kasus-a--d).

---

## Dokumentasi

| Tujuan | Dokumen |
|---|---|
| Pasang dari nol di Android | [Instalasi Android/Termux](docs/mobile/INSTALLATION.md) |
| Pakai sehari-hari | [Tutorial Pemakaian v4](docs/mobile/USER_GUIDE.md) |
| Metode ZLCE (gerbang, WAL, triase) | [`docs/USAGE.md`](docs/USAGE.md) |
| Operasi produksi | [`docs/mobile/PRODUCTION_OPERATIONS.md`](docs/mobile/PRODUCTION_OPERATIONS.md) |
| Masalah & pemulihan | [`docs/mobile/TROUBLESHOOTING.md`](docs/mobile/TROUBLESHOOTING.md) |
| Arsitektur (14 cetak biru) | [`docs/mobile/blueprint/`](docs/mobile/blueprint/) |
| Indeks lengkap | [`docs/README.md`](docs/README.md) |

---

## Struktur Repositori (ringkas)

```text
.
├── LANDING_PROMPT.md / HANDOVER_PROMPT.md / ZLCE_KIT_SINGLE.md   # kit
├── templates/  examples/                                         # template & contoh
├── zlce-starter-kit/                                             # template bersih untuk proyek BARU pengguna [PERLU KONFIRMASI: isi]
├── SESSION_STATE.md  TASKS.md  CHANGELOG.md                      # kontrol proyek ini sendiri
├── docs/                                                         # dokumentasi (lihat docs/README.md)
├── vite.config.ts  vite-session-sync.ts                          # konfigurasi Vite + plugin sinkron SESSION_STATE [PERLU KONFIRMASI: perilaku di mode produksi]
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

Jalankan `npm test` untuk seluruh pemeriksaan otomatis dan `npm run lint` untuk pemeriksaan tipe. Hasil terakhir yang dikonfirmasi: **[ISI SETELAH DIVERIFIKASI: jumlah lulus/total + tanggal + commit]**.

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

**Tutorial dan panduan Termux:** draf tinjauan pertama (Bagian 5 dan 6 pada `LAPORAN_AUDIT_DOKUMENTASI_ZLCE.md`) tetap berlaku. Hanya perlu mengganti jalur tautan ke `docs/mobile/*`, dan memakai `teamMembers.ts` sebagai sumber peran anggota.

*Perintah yang saya jalankan untuk laporan ini: `unzip`, `ls`, `grep`, `sed`, `python3 -I scripts/run-tests.py` (pada salinan sementara), dan pemindai tautan Markdown. Tidak ada berkas proyek Anda yang diubah.*

=== END CLAUDE AUDIT RESPONSE ===
