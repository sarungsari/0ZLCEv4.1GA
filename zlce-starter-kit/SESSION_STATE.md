# STATUS SESI (SESSION_STATE.md): [Nama Proyek Baru]

Sumber kebenaran tunggal status task, catatan serah terima, WAL checkpoint, dan audit state ZLCE.

---

## 0. KONTEKS PROYEK (statis)

* **Proyek:** [Nama Proyek Baru]
* **Stack:** [Bahasa / Framework / Database / Runtime]
* **MODE:** LITE
* **Kemampuan Tulis Berkas AI:** YA (atau gunakan Checkpoint Block)
* **Kemampuan Eksekusi AI:** TIDAK (Pengguna menjalankan verifikasi di terminal lokal)

---

## 1. STATUS AKTIF

* **Timestamp Audit:** 2026-10-14 jam: ?
* **Cabang Git:** `main`
* **Task Terakhir DONE:** -
* **Task Aktif:** `TASK-001`
* **Status Task Aktif:** READY
* **Task Berikutnya:** `TASK-002`

---

## 2. MATRIKS TASK

| ID Task | Nama | Dependensi | Status | Bukti Verifikasi | Disetujui |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-001` | Inisialisasi Repositori & 4 Dokumen Kontrol Mode LITE | - | READY | - | - |
| `TASK-002` | Finalisasi Spesifikasi & Model Data Ringkas (`BLUEPRINT.md`) | TASK-001 | PENDING | - | - |
| `TASK-003` | Implementasi Modul Pertama & Uji Awal | TASK-002 | PENDING | - | - |

---

## 3. WORK IN PROGRESS (WAL)

* **Task:** -
* **Langkah Sedang Dikerjakan:** -
* **Berkas Direncanakan/Disentuh:** -
* **Sudah Dilakukan:** -
* **Langkah Berikutnya (persis):** -
* **Perintah Verifikasi:** -
* **Diperbarui:** -

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

| ID | Jenis | Isi | Dampak jika salah | Status |
| :--- | :--- | :--- | :--- | :--- |
| `ASM-01` | Asumsi | Proyek dimulai menggunakan Mode LITE (4 berkas kontrol: BLUEPRINT.md, TASKS.md, SESSION_STATE.md, HANDOVER.md) | Beralih ke Mode FULL jika proyek > 15 task atau multi-service | OPEN |

---

## 5. SLOT REVISI AKTIF

| ID | Level (S/M/L) | Deskripsi | Tindakan |
| :--- | :--- | :--- | :--- |
| - | - | Tidak ada revisi aktif saat ini | - |

---

## 6. CATATAN SERAH TERIMA

* Inisiasi starter kit Mode LITE siap dijalankan mulai `TASK-001` setelah `BLUEPRINT.md` Gerbang 1 disetujui.

---

## 7. LOG AUDIT

* `2026-10-14 jam: ?`: Inisiasi kit ZLCE Mode LITE untuk proyek baru. Status awal: `TASK-001` `READY`.
