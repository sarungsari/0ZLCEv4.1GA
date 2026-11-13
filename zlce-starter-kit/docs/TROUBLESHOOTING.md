# PANDUAN PENANGANAN MASALAH & RECOVERY MANDIRI
## Troubleshooting & Disaster Recovery Matrix — ZLCE Mobile Workbench v4.1.0 GA / ZLCEv4.1Mob (TASK-043 / TC-P8-03)

Dokumen ini memuat panduan komprehensif penanganan masalah (*troubleshooting*), pemulihan bencana (*disaster recovery*), dan penanganan insiden operasional pada tablet Samsung Galaxy Tab A7 Lite (SM-T225).

---

## 1. MATRIKS TANYA-JAWAB GEJALA & SOLUSI UMUM

| No | Gejala Error / Permasalahan | Penyebab Umum | Tindakan Solusi Tepat |
| :--- | :--- | :--- | :--- |
| **Q1** | PWA me-refresh sendiri saat beralih dari browser AI kembali ke ZLCE. | Android Low Memory Killer (LMK) mematikan tab latar belakang karena RAM 3GB terdesak. | Buka kembali PWA dari Home Screen. Fitur Auto-Draft Cache akan memulihkan ketikan terakhir secara otomatis dari LocalStorage. |
| **Q2** | Terminal Termux menampilkan pesan: `Permission denied` saat menjalankan skrip. | Atribut izin eksekusi (*execute bit*) belum aktif pada berkas shell. | Jalankan perintah: `chmod +x scripts/zlce/zlce scripts/zlce/clean-auth.sh scripts/security-audit.sh` |
| **Q3** | Perintah `zlce check` gagal dengan error: `Missing Section 3 (WAL)`. | Struktur kanonik `SESSION_STATE.md` terpotong atau rusak saat pengeditan manual. | Gunakan fitur pemulihan struktur kanonik di tab **Recovery** PWA atau terapkan template standar dari `templates/SESSION_STATE.template.md`. |
| **Q4** | `git push` ditolak dengan error: `[rejected - non-fast-forward]`. | Cabang remote telah memiliki pembaruan commit dari anggota lain. | Jangan pernah menggunakan `--force`! Jalankan `git pull --ff-only` atau lakukan rebase/merge aman sesuai panduan Conflict Wizard di GitSyncTab. |
| **Q5** | Git meminta username dan token setiap kali commit/push. | Sesi `git credential-cache` telah kedaluwarsa (>900 detik / 15 menit) atau telah dibersihkan via `clean-auth`. | Masukkan token Anda kembali. Ini adalah perilaku yang diharapkan demi keamanan tablet bersama (Zero-Secret Policy). |
| **Q6** | Editor file picker tidak dapat membaca berkas dari penyimpanan internal tablet. | Termux atau Chrome belum memiliki izin akses penyimpanan Android. | Jalankan `termux-setup-storage` di Termux dan ketuk "Izinkan" pada dialog izin sistem Android. |
| **Q7** | Terdeteksi lebih dari 1 task `IN_PROGRESS` pada matriks task. | Pelanggaran aturan Aturan 1 Task IN_PROGRESS di tablet bersama (ADR-04). | Identifikasi task mana yang sedang aktif dikerjakan. Ubah task lainnya kembali ke status `READY` atau `BLOCKED`. |

---

## 2. PROTOKOL KANONIK RECOVERY KASUS A – D

Sesuai **Blueprint 09** (*Failure and Recovery*), `USAGE.md`, dan `SESSION_STATE.md`, ZLCE mendefinisikan 4 protokol pemulihan transaksional berlandaskan perbandingan antara *Git Status/Diff* dan *Blok WAL*:

```text
                  [ Deteksi Status Pemulihan ]
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
[ Working Tree Git Bersih? ]                [ Ada Uncommitted Changes? ]
     │                                                   │
     ├─► KASUS A: Working Tree Bersih                    ├─► KASUS B: Diff Cocok dengan WAL
     │   (Lanjut langkah berikutnya di WAL)              │   (Lanjutkan uji & verifikasi commit)
     │                                                   │
     └─► KASUS C: Commit Desync di Git Log               └─► KASUS D: File di Luar Daftar WAL
         (Audit git log, selaraskan state)                   (Perubahan liar, tahan & BLOCKED)
```

| Kasus Recovery | Kondisi Lapangan di Tablet | Resep Tindakan Preskriptif |
| :---: | :--- | :--- |
| **KASUS A** | **Working Tree Bersih:** Tidak ada uncommitted diff (`git status` clean), sesi peramban terputus di tengah jalan. | 1. Buka Termux, jalankan `bash scripts/zlce-snapshot.sh`.<br>2. Buka PWA ZLCE, baca field *Langkah Berikutnya (persis)* di WAL Bagian 3.<br>3. Buka sesi AI baru, tempelkan snapshot dan lanjutkan langkah tersebut tanpa menulis ulang kode yang sudah di-commit. |
| **KASUS B** | **Diff Uncommitted Sesuai WAL:** Ada berkas termodifikasi di Termux dan seluruhnya tercatat di *plannedFiles* WAL. | 1. **DILARANG reset atau checkout!**<br>2. Jalankan perintah verifikasi task di Termux (`npm test` atau `python3 scripts/zlce-check.py .`).<br>3. Jika lolos, selesaikan task, perbarui `SESSION_STATE.md` menjadi `DONE`, lalu commit beridentitas. |
| **KASUS C** | **Commit Desync di Git Log:** Ada commit baru di `git log` yang belum tercatat statusnya pada matriks `SESSION_STATE.md`. | 1. Jalankan `git log -3 --oneline` di Termux.<br>2. Periksa apakah commit tersebut menyelesaikan sub-langkah WAL.<br>3. Sinkronkan `SESSION_STATE.md` di PWA agar mencerminkan commit tersebut sebelum melanjutkan ke task berikutnya. |
| **KASUS D** | **Wildcard Diff / Modifikasi di Luar WAL:** Ada berkas termodifikasi di Termux yang **TIDAK TERCANTUM** pada blok WAL. | 1. **DILARANG reset tanpa konfirmasi.**<br>2. Jalankan `git diff` untuk memeriksa apakah perubahan tersebut adalah revisi Level S atau pekerjaan anggota lain yang tertinggal.<br>3. Jika sah: masukkan ke daftar WAL aktif. Jika sampah/salah: simpan via `git stash` sebelum melanjutkan. |

---

## 3. PENANGANAN SKENARIO INSIDEN OPERASIONAL LAINNYA

### 3.1 Konflik Merge Git Antar Anggota Tim
1. Amankan status saat ini: `git status`
2. Buka berkas konflik dengan editor `micro`: `micro SESSION_STATE.md`
3. Cari penanda `<<<<<<< HEAD`, `=======`, `>>>>>>>`. Pertahankan versi terbaru yang sah.
4. Simpan (`Ctrl+S`) dan keluar (`Ctrl+Q`).
5. Validasi: `zlce check` -> wajib `RESULT: OK`.
6. Commit penyelesaian konflik:
   `git -c user.name="Nama Anda" -c user.email="email@zlce.local" commit -m "fix(sync): resolve merge conflict"`

### 3.2 Kerusakan Format Kanonik `SESSION_STATE.md`
1. Bandingkan berkas `SESSION_STATE.md` dengan template referensi di `templates/SESSION_STATE.template.md`.
2. Pastikan 8 bagian kanonik tetap utuh: `## 0. KONTEKS PROYEK`, `## 1. STATUS AKTIF`, `## 2. MATRIKS TASK`, `## 3. WORK IN PROGRESS (WAL)`, `## 4. ASSUMPTIONS`, `## 5. SLOT REVISI AKTIF`, `## 6. CATATAN SERAH TERIMA`, `## 7. LOG AUDIT`.
3. Jalankan `zlce check` untuk memastikan 0 error.

### 3.3 Halusinasi AI / Deviasi Arsitektur
1. Tolak kode hasil AI (jangan commit).
2. Catat deviasi di Bagian 6 `SESSION_STATE.md`.
3. Generate ulang Context Pack dengan stop-token ketat dan aturan larangan eksplisit di Prompt Studio.
   ```bash
   git pull --ff-only origin v4-mobile
   ```
4. Cek integritas sesi:
   ```bash
   zlce check
   ```

---

## 3. PENEGASAN: LARANGAN PERINTAH DESTRUKTIF TANPA BACKUP

> ⛔ **ATURAN MUTLAK SISTEM:**  
> Dilarang keras menjalankan perintah-perintah berikut pada repositori bersama tanpa persetujuan Lead Architect dan tanpa membuat snapshot pencadangan terlebih dahulu:

1. `git reset --hard`  
   *(Dapat memusnahkan perubahan lokal yang belum ter-push secara permanen).*
2. `git push --force` atau `git push -f`  
   *(Dapat menimpa commit anggota tim lain di server remote secara sepihak).*
3. `rm -rf` pada direktori proyek  
   *(Gunakan penghapusan selektif per berkas).*

### Prosedur Pencadangan Wajib Sebelum Operasi Berisiko:
Sebelum melakukan operasi perbaikan besar, selalu buat berkas cadangan snapshot:
```bash
bash scripts/zlce-snapshot.sh
```
Berkas snapshot akan disimpan dengan stempel waktu di direktori `.snapshots/` yang diabaikan oleh Git, sehingga aman dari kehilangan data.

---

## 4. MATRIKS PENANGANAN TEMUAN AUDIT EKSTERNAL (AUD-001 s/d AUD-014)

| Kode Audit | Topik & Risiko | Gejala / Indikator | Prosedur Solusi Terverifikasi |
| :--- | :--- | :--- | :--- |
| **AUD-001** | Zero-Secret Pre-Commit Hook | Token bocor saat commit manual di Termux | Pasang hook: `bash scripts/install-hooks.sh`. Skrip memblokir commit jika mendeteksi token GitHub/AWS/Google. |
| **AUD-002** | Lifecycle Flush LMK React Hook | Ketikan hilang saat berpindah cepat ke Termux | Hook `useAutoDraftCache` melakukan synchronous flush pada event `visibilitychange ('hidden')` dan `pagehide`. |
| **AUD-003** | Browser Process Termination Recovery | Tab tertutup total oleh OS Android | Buka kembali PWA; `useAutoDraftCache` memuat ulang draft dari LocalStorage secara transparan (0 loss). |
| **AUD-004** | Tekanan Memori Fisik SM-T225 | UI Android melambat atau reload | Jalankan `bash scripts/test-lmk-physical.sh --verify-only` untuk simulasi beban aman bertahap (500MB s/d 2000MB). |
| **AUD-005** | Isolasi Sesi Multi-Anggota Browser | Draft Anggota A tertimpa oleh Anggota B | Namespace otomatis per anggota: `zlce_workspace_draft_content_[memberId]`. Mengganti anggota memuat draft masing-masing. |
| **AUD-006** | Eksklusivitas Klaim Task | Dua task berstatus `IN_PROGRESS` | `verifyClaimExclusivity()` menolak klaim ganda. Gunakan fungsi `takeoverTaskClaim()` dengan alasan jelas jika perlu alih tugas. |
| **AUD-007** | Penulisan Transaksional Berkas Kontrol | Berkas corrupt saat baterai habis | `atomicWriteStorageWithChecksum()` menulis ke buffer staging dan memvalidasi checksum DJB2a sebelum commit final. |
| **AUD-008** | Navigasi Offline Mode Pesawat PWA | Navigasi antar-tab macet tanpa internet | `public/sw.js` mem-precache App Shell dan memiliki fallback offline `/index.html` untuk seluruh 10 rute tab workbench. |
| **AUD-009** | Standardisasi Alur Git Kanonik | Riwayat commit tertimpa atau konflik rebase | Larangan mutlak `--force`. Gunakan `CMD-GIT-05` (pull `--ff-only`), `CMD-GIT-06` (safe stash & pull), dan `CMD-GIT-07` (`branch -d`). |
| **AUD-010** | Konsolidasi Test Runner Tunggal | Hasil uji parsial / tidak terintegrasi | Jalankan perintah terpadu `npm test` atau `python3 scripts/run-tests.py` yang mengevaluasi 44 checks komprehensif. |
| **AUD-011** | Sinkronisasi Baseline Cetak Biru | Over-claiming atau referensi berkas usang | Dokumen cetak biru `MOBILE_BLUEPRINT.md` disinkronkan 100% dengan 60 task selesai dan 44 test suite. |
| **AUD-012** | Reproduksibilitas Bundel ZIP Audit | Hash bundel zip berubah-ubah di mesin berbeda | `scripts/create-audit-bundle.py` menyertakan `SHA256SUMS.txt` dengan stempel waktu deterministik untuk verifikasi integritas. |
| **AUD-013** | Kemurnian State Updater React | Render race-condition pada aksi cepat | Seluruh mutasi state menggunakan bentuk functional arrow murni `(prev => ...)` tanpa efek samping mutasi objek langsung. |
| **AUD-014** | Pembaruan Panduan Operasional | Anggota ragu menjalankan mitigasi baru | Panduan `USER_GUIDE.md` dan `TROUBLESHOOTING.md` telah memuat protokol remediasi AUD-001 s/d AUD-014 lengkap. |

