# SPESIFIKASI TEKNIS & BLUEPRINT SISTEM (MODE LITE): [Nama Proyek Baru]

Dokumen kontrol Gerbang 1 untuk proyek **Mode LITE** (< ~15 task). Memuat spesifikasi inti, batasan domain, **Model Data Ringkas (§7)**, dan **Strategi Uji (§8)** agar tidak memerlukan `DATA_MODEL.md` maupun `TESTING.md` terpisah. Diperbarui bila task dengan `Docs Impact: BLUEPRINT` selesai.

---

## 1. PARAMETER SISTEM & LINGKUNGAN

* **Nama Sistem:** [Nama Proyek Baru]
* **MODE:** `LITE` (4 berkas kontrol: `BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`)
* **Profil Domain:** [none | booking] (lihat `templates/profiles/`)
* **Lingkungan Produksi:**
  - Runtime: [CONTOH: Node.js 20+ / Python 3.12]
  - Database: [CONTOH: SQLite / PostgreSQL 16]
  - Framework: [CONTOH: Express / FastAPI / React]
* **Versi Dependensi Terverifikasi:**

| Dependensi | Versi | Sumber Verifikasi | Tanggal |
| :--- | :--- | :--- | :--- |
| [nama] | [x.y.z] | [package.json / lockfile] | [YYYY-MM-DD] |

* **Standar Keamanan:**
  - Masukan: validasi tipe ketat dan sanitasi input.
  - Rahasia: `.env` / secret manager; dilarang commit kredensial ke Git.

---

## 2. BATASAN DOMAIN BISNIS

1. **Aturan Bisnis (BR-xx):**
   - `BR-01`: [Aturan terukur pertama]
   - `BR-02`: [Aturan terukur kedua]
2. **Out of Scope:**
   - [Fitur yang secara eksplisit TIDAK dikerjakan pada MVP]

---

## 3. MATRIKS MODUL

| ID Modul | Nama Modul | Fungsi Utama | Dependensi |
| :--- | :--- | :--- | :--- |
| `MOD-01` | Core | Inisialisasi, konfigurasi, env | Runtime |
| `MOD-02` | Logika Utama | Layanan/API inti | MOD-01 |
| `MOD-03` | Antarmuka / CLI | Input/output pengguna | MOD-02 |

---

## 4. INTEGRASI EKSTERNAL

* [Daftar API/layanan eksternal bila ada, atau `-` bila mandiri]

---

## 5. NFR

1. Performa: [target terukur, mis. API p95 < 300ms]
2. Keandalan: penulisan state deterministik dan validasi skema sebelum eksekusi.

---

## 6. ASUMSI & PERTANYAAN TERBUKA AWAL

Salin asumsi/pertanyaan ke `SESSION_STATE.md` Bagian 4 (`ASM-xx` / `Q-xx`).

---

## 7. MODEL DATA RINGKAS (MODE LITE)

* **Entitas Utama:** `[nama_entitas]` (`id`, `[kolom_utama]`, `status`, `created_at`, `updated_at`)
* **State Machine Ringkas:**

| Dari | Ke | Pemicu | Guard (Syarat) |
| :--- | :--- | :--- | :--- |
| `DRAFT` | `ACTIVE` | Submit valid | Field wajib terisi |

---

## 8. STRATEGI UJI (MODE LITE)

* **Tipe Uji:** Unit test + integration smoke test.
* **Perintah Menjalankan:** `[mis. npm test / pytest]` & `python3 scripts/zlce-check.py . --strict`
* **Kasus Batas Wajib:** Input kosong/invalid, duplikasi ID, dan kondisi error state transition.
* **Kriteria Lulus:** 100% test PASS dan 0 error `zlce-check.py`.
