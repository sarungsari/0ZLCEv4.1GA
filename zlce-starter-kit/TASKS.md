# BACKLOG TASK PENGEMBANGAN: [Nama Proyek Baru]

Definisi task atomik Mode LITE. **Status task tidak ditulis di sini**; status ada di `SESSION_STATE.md`. Enum dan aturan kerja mengikuti `HANDOVER.md` / Bagian 2 `LANDING_PROMPT.md` (dan `AI_WORKFLOW.md` bila dipakai).

---

## 1. PETA FASE

* **FASE 0: Pondasi & Spesifikasi Mode LITE** (`TASK-001`, `TASK-002`)
* **FASE 1: Implementasi Fitur Inti** (`TASK-003`)

---

## 2. FORMAT TASK

### TASK-001: Inisialisasi Repositori & 4 Dokumen Kontrol Mode LITE
* **Fase:** FASE 0
* **Deskripsi:** Setup direktori proyek, `.gitignore`, linter/formatter, `.env.example`, dan verifikasi kelengkapan 4 berkas kontrol Mode LITE (`BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`).
* **Dependensi:** -
* **File:** `.gitignore`, `.env.example`, `BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md`
* **Docs Impact:** `BLUEPRINT`
* **Acceptance Criteria:**
  1. Repositori terinisialisasi bersih dengan linter 0 error.
  2. Keempat berkas kontrol Mode LITE tersedia lengkap dan lulus `python3 scripts/zlce-check.py . --strict`.
  3. Disetujui pengguna di `SESSION_STATE.md`.
* **Test Case:** `scripts/zlce-check.py::main`
* **Metode Verifikasi:** `python3 scripts/zlce-check.py . --strict --no-git`

---

### TASK-002: Finalisasi Spesifikasi & Model Data Ringkas (`BLUEPRINT.md`)
* **Fase:** FASE 0
* **Deskripsi:** Menetapkan parameter runtime, struktur modul, batas domain, model data ringkas (§7 `BLUEPRINT.md`), dan strategi uji (§8 `BLUEPRINT.md`).
* **Dependensi:** `TASK-001`
* **File:** `BLUEPRINT.md`
* **Docs Terkait:** `BLUEPRINT.md`
* **Docs Impact:** `BLUEPRINT`
* **Acceptance Criteria:**
  1. Bagian 1–8 `BLUEPRINT.md` (termasuk §7 Model Data & §8 Strategi Uji) terisi tanpa placeholder kritis.
  2. Kriteria non-goals (out-of-scope) disepakati pada Gerbang 1.
* **Test Case:** `tests/blueprint_check::test_lite_sections`
* **Metode Verifikasi:** Review spesifikasi bersama pengguna; konfirmasi persetujuan Gerbang 1 di `SESSION_STATE.md`.

---

### TASK-003: Implementasi Modul Pertama & Uji Awal
* **Fase:** FASE 1
* **Deskripsi:** Membangun fungsionalitas logika bisnis utama atau API endpoint tahap pertama sesuai `BLUEPRINT.md` §7–§8.
* **Dependensi:** `TASK-002`
* **File:** Berkas sumber kode modul pertama & berkas pengujian terkait
* **Docs Terkait:** `BLUEPRINT.md`
* **Docs Impact:** `BLUEPRINT`
* **Acceptance Criteria:**
  1. Modul lulus pengujian unit dengan cakupan yang ditetapkan pada `BLUEPRINT.md` §8.
  2. `python3 scripts/zlce-check.py . --strict` lulus 0 error.
* **Test Case:** `tests/module_one.test::test_happy_path`
* **Metode Verifikasi:** Eksekusi unit test modul di terminal lokal; lampirkan output lulus ke `SESSION_STATE.md`.

---

## 3. TEMPLATE TASK REVISI

### TASK-REV-NN: [Judul Revisi Level M]
* **Fase:** REVISI
* **Deskripsi:** [Penjelasan spesifik perbaikan/perubahan yang dibutuhkan]
* **Dependensi:** [Task terkait sebelumnya]
* **File:** [Berkas yang terdampak]
* **Docs Impact:** `BLUEPRINT` / `TASKS`
* **Acceptance Criteria:**
  1. [Kriteria 1]
  2. [Kriteria 2]
* **Test Case:** `[path/nama_test]`
* **Metode Verifikasi:** [Perintah pengujian untuk memvalidasi revisi]
