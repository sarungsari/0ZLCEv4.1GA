# ZLCE STARTER KIT (v4.1.0 GA — Fresh System)
### Zero-Loss Context Engineering Starter Kit untuk Proyek Baru, Lanjutan & Modifikasi

Paket starter kit bersih siap pakai untuk mengendalikan konteks AI agent (Claude, ChatGPT, Gemini, Cursor, Copilot) agar bekerja deterministik, terverifikasi, dan tanpa kehilangan status (*zero context loss*) — baik pada **proyek baru dari nol**, **proyek lanjutan setengah jadi**, maupun **update & modifikasi proyek eksisting**.

---

## 📁 Struktur Direktori Kit

```text
.
├── README.md                      # Panduan lengkap starter kit (berkas ini)
├── LANDING_PROMPT.md              # Prompt inisiasi AI sesi pertama (BARU & RESTRUKTURISASI)
├── HANDOVER_PROMPT.md             # Panduan & prompt serah terima sesi / ganti model
├── ZLCE_KIT_SINGLE.md             # [Generated di arsip .ZIP / --single-kit] Bundel 1 berkas seluruh template
├── .gitignore                     # Konfigurasi Git pelacak berkas kontrol ZLCE
│
├── BLUEPRINT.md                   # [Mode LITE] Spesifikasi Gerbang 1 + §7 Model Data + §8 Strategi Uji
├── TASKS.md                       # [Mode LITE & FULL] Daftar tugas atomik terstruktur & kriteria uji
├── SESSION_STATE.md               # [Single Source of Truth] Status aktif, WAL & log audit
├── HANDOVER.md                    # [Mode LITE & FULL] Salinan verbatim blok prompt HANDOVER_PROMPT.md
├── AI_WORKFLOW.md                 # [Mode FULL / Referensi LITE] Konvensi teknis, guardrail, & triase
│
├── docs/                          # Panduan Instalasi Android, Termux, Pemakaian & Troubleshooting
│   ├── INSTALLATION_ANDROID.md    # Tutorial langkah demi langkah instalasi Android + Termux + PWA
│   ├── USAGE_MOBILE.md            # SOP pemakaian harian di tablet/mobile & estafet tim
│   ├── TERMUX_SETUP.md            # Penyiapan Termux, Git, SSH, & lingkungan Node/Python
│   └── TROUBLESHOOTING.md         # Solusi cepat kendala LMK, Git, dan layanan Termux
│
├── templates/                     # Template Dokumen Kontrol Baku ZLCE (untuk Mode FULL)
│   ├── SESSION_STATE.template.md  # Template status sesi & WAL
│   ├── TASKS.template.md          # Template backlog tugas atomik
│   ├── AI_WORKFLOW.template.md    # Template tata kelola & alur kerja
│   ├── BLUEPRINT.template.md      # Template Gerbang 1 (Spesifikasi & Parameter)
│   ├── ARCHITECTURE.template.md   # Template arsitektur sistem & ADR
│   ├── DATA_MODEL.template.md     # Template skema & migrasi basis data
│   ├── TESTING.template.md        # Template strategi & matriks pengujian
│   ├── CHECKLISTS.template.md     # Template checklist keamanan & rilis
│   ├── CHANGELOG.template.md      # Template catatan perubahan SemVer
│   └── profiles/
│       └── DOMAIN_BOOKING.profile.md  # Profil domain reservasi & sewa unit
│
├── examples/                      # Berkas Contoh Nyata Terverifikasi (Todo API)
│   ├── SESSION_STATE.example.md   # Contoh status sesi aktif, WAL, dan asumsi
│   ├── TASKS.example.md           # Contoh rincian task atomik (TASK-001 s/d TASK-005)
│   ├── AI_WORKFLOW.example.md     # Contoh aturan eksekusi AI & Checkpoint Block
│   └── BLUEPRINT.example.md       # Contoh blueprint spesifikasi sistem terisi
│
└── scripts/                       # CLI & Skrip Otomasi Python / Bash
    ├── README.md                  # Panduan rinci eksekusi CLI
    ├── zlce-check.py              # Linter otomatis pemeriksa integritas ZLCE
    ├── zlce-collect.py            # Pengumpul diagnostik dan ringkasan git
    └── zlce-snapshot.sh           # Snapshot pemulihan working-tree & WAL
```

---

## 🚀 Panduan 3 Skenario Pemakaian (Baru · Lanjutan · Modifikasi)

### Skenario A: Proyek Baru (Mulai dari Nol)
1. Ekstrak seluruh isi kit ini ke folder root repositori baru Anda (`mkdir -p ~/projects/proyek-baru && cd ~/projects/proyek-baru`).
2. **Mode LITE (Proyek < ~15 task):** cukup pakai 4 berkas kontrol inti (`BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`).
   **Mode FULL (Proyek kompleks > 15 task):** salin seluruh template dari `templates/` ke root (10 berkas kontrol).
3. Buka sesi AI pertama, lampirkan berkas kontrol (atau `ZLCE_KIT_SINGLE.md`), dan tempel isi `LANDING_PROMPT.md` dengan `Aksi: BARU` serta `MODE: LITE` / `FULL`.
4. AI akan memfinalkan `BLUEPRINT.md` di **Gerbang 1** dan menunggu persetujuan sebelum menulis kode pertama.

### Skenario B: Proyek Lanjutan / Setengah Jadi
* **Jika proyek sudah memakai ZLCE:**
  - Pastikan folder `scripts/` diperbarui ke versi kit ini (tanpa menimpa `SESSION_STATE.md`, `TASKS.md`, dan `BLUEPRINT.md` milik proyek Anda).
  - Tempel `HANDOVER_PROMPT.md` + `SESSION_STATE.md` & `TASKS.md` eksisting di sesi AI baru agar langsung melanjutkan dari WAL terakhir.
* **Jika proyek setengah jadi belum memakai ZLCE:**
  - Salin `scripts/`, `templates/`, dan berkas starter ZLCE ke folder proyek (gunakan `unzip -n` atau `cp -n` agar tidak menimpa kode sumber).
  - Gunakan `LANDING_PROMPT.md` dengan `Aksi: RESTRUKTURISASI proyek existing`.
  - AI wajib melakukan **audit baca-saja** pada `TASK-001` terlebih dahulu untuk memetakan modul yang sudah selesai vs tersisa sebelum melanjutkan implementasi.

### Skenario C: Update & Modifikasi Proyek Eksisting
* **Perubahan sangat kecil (Level S — ≤ 1 berkas & ≤ 20 baris tanpa ubah kontrak/keamanan):**
  - Eksekusi langsung, uji, commit dengan prefix `[MINOR]`, dan catat di `CHANGELOG.md`.
* **Update fitur / modifikasi terstruktur (Level M/L):**
  - Gunakan cabang terpisah (`git checkout -b task/TASK-REV-01`), daftarkan `TASK-REV-01` s/d `TASK-REV-NN` di `SESSION_STATE.md` Bagian 2 & Bagian 5 (**Slot Revisi Aktif**) serta `TASKS.md`.
  - Jalankan verifikasi uji regresi penuh dan `python3 scripts/zlce-check.py . --strict` sebelum merge kembali ke `main`.

---

## 📱 Panduan Instalasi Android, Termux & Penggunaan Mobile

Seluruh dokumentasi instalasi dan penggunaan ikut dibundel di folder `docs/` serta tersedia interaktif di tab **Tutorial** dan **Dokumentasi & Panduan** pada PWA:
1. [`docs/INSTALLATION_ANDROID.md`](docs/INSTALLATION_ANDROID.md) — Instalasi Termux (F-Droid), izin storage, kloning Git, dan pemasangan PWA di layar utama tablet/HP.
2. [`docs/USAGE_MOBILE.md`](docs/USAGE_MOBILE.md) — Alur kerja harian 10 langkah dengan AI, salin Context Pack 1-tap, Capture hasil, dan serah terima tim.
3. [`docs/TERMUX_SETUP.md`](docs/TERMUX_SETUP.md) — Konfigurasi environment Termux, Git credential cache, & tooling Node/Python.
4. [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) — Penanganan LMK Android, konflik Git, dan pemulihan sesi.

---

## 🛠️ Validasi Otomatis (CLI Linter)

ZLCE menyertakan skrip linter Python mandiri (tanpa dependensi eksternal / tanpa `pip install`):

```bash
# Validasi konsistensi dokumen ZLCE
python3 scripts/zlce-check.py .

# Mode ketat (wajib 0 error dan 0 warning)
python3 scripts/zlce-check.py . --strict
```

### Apa Saja yang Diperiksa oleh Linter?
1. **Aturan Single IN_PROGRESS:** Maksimal 1 task berstatus `IN_PROGRESS`.
2. **Kesesuaian Header vs Matriks:** Status task aktif di Bagian 1 harus sama persis dengan Bagian 2.
3. **Kewajiban Bukti Uji:** Task `DONE` dilarang kosong pada kolom `Bukti Verifikasi` dan wajib `Disetujui: ya`.
4. **Urutan Dependensi:** Task tidak dapat berstatus `IN_PROGRESS` atau `DONE` bila prasyaratnya belum `DONE`.
5. **Integritas WAL:** Bagian WAL (Bagian 3) harus menunjuk ke task yang sedang `IN_PROGRESS`.

---

## ⚡ Aturan Kunci ZLCE

1. **Aturan X1 Jam (Anti-Ekstrapolasi):**
   AI dilarang mengarang waktu secara sintetis (+5/+10 menit). Gunakan jam persis dari prompt pengguna atau git log, atau tulis `'YYYY-MM-DD jam: ?'`.
2. **Protokol Pemulihan Cepat (Snapshot):**
   ```bash
   bash scripts/zlce-snapshot.sh . --diff
   ```
   Salin output terminal ke sesi AI baru untuk melanjutkan persis dari checkpoint terakhir.

