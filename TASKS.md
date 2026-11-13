# BACKLOG OPERASIONAL TERKUNCI: ZLCE MOBILE WORKBENCH v4.1.0 GA (ZLCEv4.1Mob)
## Baseline Bersih Siap Pakai (Proyek Baru, Lanjutan Setengah Jadi, Update & Modifikasi)

Baseline operasional terkunci **ZLCE Mobile Workbench v4.1.0 GA (`ZLCEv4.1Mob`)**. Antrean tugas pengembangan internal (`TASK-001` s/d `TASK-134` Fase 0–21) beserta laporan audit historis telah dibersihkan dan diarsipkan di `archive/history/`. Gunakan launcher **Proyek Baru (`NEW`)**, **Lanjutan Setengah Jadi (`CONTINUE`)**, atau **Update & Modifikasi (`MODIFY`)** di Dashboard UI maupun `zlce-starter-kit/` untuk mengerjakan proyek target Anda secara terisolasi.

---

## 1. PETA FASE BASELINE TERKUNCI

* **FASE 0: Baseline Terkunci v4.1.0 GA (`ZLCEv4.1Mob`)** (`TASK-001` s/d `TASK-003`)

---

## 2. RINCIAN TASK ATOMIK BASELINE

### ============================================================================
### FASE 0: BASELINE TERKUNCI v4.1.0 GA (ZLCEv4.1Mob)
### ============================================================================

### TASK-001: Kunci Baseline Inti PWA & Shell Offline v4.1.0 GA (`ZLCEv4.1Mob`)
* **Fase:** FASE 0
* **Deskripsi:** Mengunci aplikasi Web Workbench 6-Tab kanonik (`Dashboard`, `SESSION_STATE & WAL`, `AI Workbench`, `Terminal & Git`, `Diagnostik & Kualitas`, `Dokumentasi & Panduan`), Service Worker offline (`public/sw.js`), Web App Manifest (`public/manifest.webmanifest`), serta 4 ikon PWA agar siap dipasang dan dijalankan offline di tablet Samsung Galaxy Tab A7 Lite (SM-T225) maupun desktop.
* **Dependensi:** -
* **File:** `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*`, `src/App.tsx`, `src/components/Header.tsx`
* **Docs Terkait:** `docs/mobile/MOBILE_BLUEPRINT.md`, `docs/mobile/INSTALLATION_ANDROID.md`, `docs/mobile/USAGE_MOBILE.md`
* **Docs Impact:** `SESSION_STATE.md`, `BLUEPRINT.md`
* **Acceptance Criteria:**
  1. Seluruh 6 tab kanonik UI terkompilasi bersih (`tsc --noEmit` 0 error) dan menghasilkan build produksi `dist/` yang valid.
  2. `public/manifest.webmanifest` (`ZLCE Mobile Workbench v4.1.0 GA` / `ZLCEv4.1Mob`), ikon PWA, dan Service Worker `public/sw.js` lolos verifikasi precache offline.
  3. Antarmuka mematuhi target sentuh minimal `44x44px`, tipografi minimal `12px`, dan auto-draft debounce `400ms` dengan flush sinkron Android LMK.
* **Test Case:** `TC-P18-02`
* **Metode Verifikasi:** Jalankan `npm run test:icons`, `npm run lint`, dan `npm run build`.

---

### TASK-002: Isolasi Workspace Multi-Proyek (`NEW / CONTINUE / MODIFY`) & Starter Kit Bersih
* **Fase:** FASE 0
* **Deskripsi:** Menyiapkan `ZLCEv4.1Mob` sebagai stasiun kerja siap pakai untuk 3 alur operasional terisolasi (`Proyek Baru`, `Lanjutan Setengah Jadi`, `Update & Modifikasi`) dengan penyimpanan LocalStorage per-proyek terpisah (`useProjectRegistry`), sinkronisasi satu sumber kanonik (`sync-assets.mjs`), dan pembangkitan bundel Starter Kit `.zip` secara on-demand tanpa menyimpan arsip `.zip` statis di repositori.
* **Dependensi:** `TASK-001`
* **File:** `src/hooks/useProjectRegistry.ts`, `src/utils/projectStarter.ts`, `zlce-starter-kit/`, `scripts/sync-assets.mjs`, `scripts/create-starter-kit-bundle.py`
* **Docs Terkait:** `LANDING_PROMPT.md`, `HANDOVER_PROMPT.md`, `docs/USAGE.md`, `zlce-starter-kit/README.md`
* **Docs Impact:** `SESSION_STATE.md`, `README.md`, `zlce-starter-kit/`
* **Acceptance Criteria:**
  1. Kunci LocalStorage setiap proyek terisolasi unik dan tidak menimpa state host `v4.1.0 GA`.
  2. Seluruh panduan instalasi Android/Termux, pemakaian mobile, template, dan `zlce-starter-kit/` tersinkron 100% melalui `npm run sync:assets`.
  3. Bundel Starter Kit `.zip` maupun bundel review lain dibentuk secara dinamis saat dibutuhkan (tanpa residu `.zip` statis).
* **Test Case:** `TC-FRESH-01`
* **Metode Verifikasi:** Jalankan `npm run sync:assets` dan `npx tsx src/tests/freshWorkspaceMultiProject.test.ts`.

---

### TASK-003: Pembersihan Arsip/Laporan & Validasi Gerbang Keamanan Zero-Secret GA
* **Fase:** FASE 0
* **Deskripsi:** Membersihkan backlog tugas pengembangan lama, laporan review historis, dan arsip ZIP dari ruang kerja aktif (diarsipkan terpisah di `archive/` dan dikecualikan di `.gitignore`), serta memverifikasi seluruh suite uji otomatis, audit Zero-Secret, dan kepatuhan kanonik `zlce-check.py --strict`.
* **Dependensi:** `TASK-002`
* **File:** `.gitignore`, `SESSION_STATE.md`, `TASKS.md`, `scripts/run-tests.py`, `scripts/security-audit.sh`, `scripts/zlce/zlce-check.py`
* **Docs Terkait:** `CHECKLISTS.md`, `TESTING.md`, `docs/mobile/SECURITY_AUDIT.md`, `docs/mobile/PRODUCTION_OPERATIONS.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`, `README.md`, `docs/README.md`
* **Acceptance Criteria:**
  1. `archive/` dan `*.zip` terdaftar di `.gitignore` (serta tersinkron ke `zlce-starter-kit/.gitignore`) sehingga tidak ikut terclone/terdistribusi.
  2. Tidak ada sisa file `.zip` statis maupun laporan historis pengganggu di `public/`.
  3. Seluruh pengujian `python3 scripts/run-tests.py`, `bash scripts/security-audit.sh`, dan `python3 scripts/zlce-check.py . --strict --no-git` lulus 100% (0 error, 0 warn).
* **Test Case:** `TC-P18-FIN`
* **Metode Verifikasi:** Jalankan `python3 scripts/run-tests.py`, `bash scripts/security-audit.sh`, dan `python3 scripts/zlce-check.py . --strict --no-git`.
