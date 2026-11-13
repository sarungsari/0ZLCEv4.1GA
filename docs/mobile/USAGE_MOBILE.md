# PANDUAN LENGKAP PEMAKAIAN ZLCE MOBILE WORKBENCH
## Alur Kerja Operasional Harian Estafet 8 Anggota di Tablet Bersama (DOC-003)

Dokumen ini memuat tutorial lengkap pemakaian ZLCE Mobile Workbench untuk operasional harian. Materi disusun berurutan dari saat pertama kali memegang tablet hingga proses serah terima ke rekan berikutnya, tanpa tumpang tindih dengan tutorial instalasi.

---

## 1. PETA ALUR KERJA OPERASIONAL 10 LANGKAH

```text
[1. Ambil Tablet Fisik]
        │
        ▼
[2. Aktifkan Profil Anggota di Header (Zero-Secret)]
        │
        ▼
[3. Buka Workspace Reader & Periksa Status Sesi]
        │
        ▼
[4. Klaim Task Atomik (Aturan 1 Task IN_PROGRESS) & Tulis WAL]
        │
        ▼
[5. Rakit Portable Context Pack & Adaptor Kuota Token]
        │
        ▼
[6. Beralih ke Browser AI & Jalankan Cold-Start Conversation]
        │
        ▼
[7. Tangkap Jawaban AI di Result Capture (Provenance Injeksi)]
        │
        ▼
[8. Jalankan Command Hub & Validasi Diagnostik Terminal (zlce check)]
        │
        ▼
[9. Buat Branch Task, Commit Beridentitas, Safe Pull & Push Remote]
        │
        ▼
[10. Sahkan Gerbang, Wizard Serah Terima Tablet & Clean-Auth RAM]
```

---

## 2. DETAIL 10 LANGKAH OPERASIONAL HARIAN

### LANGKAH 1: PENGAMBILAN TABLET FISIK
1. Ambil tablet Samsung Galaxy Tab A7 Lite bersama.
2. Nyalakan layar, periksa persentase baterai (>20%).
3. Buka aplikasi **ZLCE Mobile** langsung dari ikon petir di Layar Utama (Home Screen).
4. Layar aplikasi terbuka dalam mode *standalone* (bebas distraksi URL bar).

---

### LANGKAH 2: AKTIFKAN PROFIL ANGGOTA (ZERO-SECRET POLICY)
1. Perhatikan sudut kanan atas Header aplikasi: terdapat badge nama dan inisial anggota aktif.
2. Ketuk tombol **Active Member Selector**.
3. Pilih nama Anda dari daftar 8 profil resmi:
   - `eko` (Eko Siswanto - System & Git Coordinator)
   - `oned` (Oned Wiyono - Frontend & Mobile UI)
   - `cxperia` (Chris X. Peria - QA & Test Harness)
   - `sulistiyani` (Sulistiyani - PWA & Offline Architect)
   - `layang` (Layang Seta - Context & Prompt Engineer)
   - `acimau` (Acimau Dev - Git & Sync Hub)
   - `kepek` (Kepek Aris - Security & Zero-Secret)
   - `gete` (Gete Prakoso - Mobile UX & Ergonomics)
4. *Penting:* Pergantian profil ini **NOL PASSWORD**. Identitas hanya digunakan untuk atribusi commit Git publik dan pencatatan audit WAL.
5. *Log Kerja & Catatan Anggota:* Anda dapat membuka tab **Session Timeline ➔ Log Kerja Anggota** (atau melalui dropdown Header) untuk mencatat aktivitas baru atau menyunting catatan (*note*) kerja Anda secara mandiri.

---

### LANGKAH 3: PEMERIKSAAN STATUS SESI (WORKSPACE READER)
1. Buka tab **Workspace Reader** atau periksa panel **State Health** di Dashboard.
2. Pastikan file kontrol `SESSION_STATE.md` berstatus valid (0 error).
3. Periksa **Bagian 6 (Catatan Serah Terima)** di `SESSION_STATE.md` untuk mengetahui konteks pekerjaan yang ditinggalkan oleh anggota sebelum Anda.
4. Pastikan tidak ada pekerjaan menggantung tanpa kejelasan.

---

### LANGKAH 4: KLAIM TASK ATOMIK (ATURAN 1 TASK IN_PROGRESS)
1. Buka tab **SESSION_STATE** ➔ Gulir ke Matriks Task.
2. Pilih task berikutnya yang berstatus **`READY`**.
3. **Aturan 1 Task IN_PROGRESS (ADR-04 & P2-CP6):**
   - Tablet bersama hanya mengizinkan **maksimal 1 task** berstatus `IN_PROGRESS` dalam satu waktu.
   - Sistem akan memblokir klaim baru jika task sebelumnya belum di-`DONE`-kan atau dilepas.
4. Ubah status task yang dipilih menjadi `IN_PROGRESS`.
5. **Wajib Isi Bagian 3 (WAL):** Tuliskan rencana langkah atomik di Bagian 3 sebelum menyentuh atau mengubah berkas kode apa pun:
   - Task: `TASK-xxx`
   - Langkah Sedang Dikerjakan: Deskripsi ringkas
   - Berkas Direncanakan/Disentuh: Daftar berkas
   - Langkah Berikutnya (persis): Rencana verifikasi

---

### LANGKAH 5: MERAKIT CONTEXT PACK & ADAPTOR TOKEN
1. Buka tab **Context Pack** di navigasi bawah/samping.
2. Pilih ID Task aktif yang baru saja Anda klaim.
3. Pilih model AI sasaran pada pemilih **Token Budget Selector**:
   - **Claude (Mid Context ~30K):** Fokus pada blueprint terkait dan task atomik.
   - **ChatGPT (Compact ~16K):** Konteks terkompresi tanpa lampiran historis berlebih.
   - **Gemini (Large Context ~1M):** Menyertakan riwayat lengkap dan seluruh blueprint.
4. Periksa indikator estimasi token yang ditampilkan (faktor keselamatan 3.2 char/token).
5. Ketuk tombol **"1-Ketuk Salin Context Pack"** (target sentuh 44px+). Teks paket mandiri tersalin ke clipboard tablet.

---

### LANGKAH 6: EKSEKUSI DI BROWSER AI (ZERO-LOSS COLD-START)
1. Beralih ke Google Chrome / aplikasi peramban AI (Claude, ChatGPT, atau Gemini web).
2. Buka jendela percakapan baru (*New Chat*).
3. Tempelkan (*paste*) seluruh teks Context Pack yang sudah disalin tadi.
4. Model AI akan bertindak sebagai engineer pelaksana tanpa halusinasi karena memegang seluruh konteks mandiri (Invarian I2).
5. Tinjau jawaban kode yang diberikan oleh AI.
6. Salin blok kode hasil eksekusi ke clipboard.

---

### LANGKAH 7: RESULT CAPTURE & PROVENANCE INJECTION
1. Kembali ke aplikasi **ZLCE Mobile**. (State Anda terlindungi secara aman oleh mekanisme cache RPO $\le 400$ms meskipun peramban sempat terminasi di background).
2. Buka tab **Result Capture**.
3. Tempelkan kode/solusi dari AI ke kotak masukan.
4. Sistem otomatis menyematkan metadata provenance standar:
   `<!-- Provenance: Model=[AI], Driver=[Nama Anggota], Timestamp=[WIB], Task=[TASK-xxx] -->`
5. Simpan atau terapkan perubahan berkas ke disk kerja via editor.

---

### LANGKAH 8: COMMAND HUB & VALIDASI TERMINAL
1. Buka tab **Command Hub** di aplikasi.
2. Cari template perintah **`zlce-check`** (Badge Hijau: Safe).
3. Ketuk tombol **Salin Perintah**.
4. Beralih ke aplikasi **Termux** (atau jendela split jika layar mendukung), masuk ke folder proyek (`cdp`), lalu tempel dan jalankan:
   ```bash
   zlce check
   ```
5. **Syarat Kelulusan Mutlak:** Output harus menyatakan `RESULT: OK (0 error, 0 warn)`.
6. Jika ada kesalahan linter atau format, perbaiki segera sebelum melangkah ke tahap commit.

---

### LANGKAH 9: GIT SYNC (BRANCHING, COMMIT, PULL, PUSH)
1. Buka tab **Git Sync** di aplikasi ZLCE Mobile.
2. Buat branch terisolasi untuk task ini:
   ```bash
   git checkout -b task/TASK-xxx
   ```
   *(PWA secara ketat melarang commit langsung ke cabang `main`).*
3. Salin template commit beridentitas otomatis yang telah diinjeksi nama Anda:
   ```bash
   git -c user.name="Nama Anda" -c user.email="email@zlce.local" commit -m "feat(scope): implementasi TASK-xxx"
   ```
4. Tarik pembaruan cabang induk secara aman tanpa merge sembarangan:
   ```bash
   git pull --ff-only origin v4-mobile
   ```
5. Dorong cabang task ke repositori:
   ```bash
   git push origin task/TASK-xxx
   ```
   *(Token kredensial hanya akan disimpan di RAM selama 15 menit melalui `cache --timeout=900`).*

---

### LANGKAH 10: SERAH TERIMA TABLET & CLEAN-AUTH RAM
1. Buka modal **Sahkan Gerbang Kualitas** pada task terkait di PWA:
   - Masukkan bukti verifikasi nyata (minimal 5 karakter, misal: `zlce check ok, 0 err, test pass`).
   - Tekan **Sahkan Task Selesai**: status task berubah menjadi `DONE` dengan tanda `ya (oleh: Nama Anda)`.
2. Kosongkan kembali Bagian 3 (WAL) menjadi tanda `-`.
3. Tuliskan ringkasan hasil kerja di Bagian 6 (Catatan Serah Terima) `SESSION_STATE.md`.
4. Buka **Device Handover Modal** dari bilah navigasi atas:
   - Centang 4 item verifikasi serah terima.
   - Ketuk tombol **Salin Perintah Clean-Auth**.
5. Buka Termux dan jalankan pembersihan kredensial:
   ```bash
   zlce clean-auth
   ```
   *Perintah ini menghentikan git-credential-cache daemon dan menghapus socket RAM seketika.*
6. Tutup tab peramban eksternal Chrome yang tidak dipakai untuk membebaskan RAM 3GB.
7. Serahkan unit tablet fisik ke anggota tim berikutnya dalam kondisi bersih, aman, dan siap pakai!

---

## 3. NAVIGASI FITUR APLIKASI PREVIEW STUDIO

| Tab / Menu | Fungsi & Panduan Penggunaan |
| :--- | :--- |
| 📊 **Dashboard** | Ikhtisar kesehatan proyek (State Health), ringkasan task, dan status LMK persistence. |
| 📋 **SESSION_STATE** | Pusat kebenaran status: matriks task, editor WAL, catatan serah terima, dan log audit. |
| 📖 **Workspace Reader** | Membaca dokumen kontrol, tutorial instalasi, panduan mobile, dan cetak biru secara terstruktur. |
| 📦 **Context Pack** | Generator paket konteks portabel dengan pemotong token cerdas sesuai profil AI. |
| 🎯 **Result Capture** | Kotak penampung solusi AI dengan otomatisasi injeksi tanda tangan provenance. |
| ⚡ **Command Hub** | Katalog perintah aman Termux/Git siap salin 1-ketukan dengan badge risiko. |
| 🔄 **Git Sync** | Generator perintah checkout branch, fast-forward pull, dan wizard resolusi konflik. |
| 🎓 **Tutorial** | Pusat panduan interaktif: instalasi Android, pemakaian mobile, pustaka dokumen, & handover. |

---

## 4. PENANGANAN MASALAH UMUM (TROUBLESHOOTING RINGKAS)

* **Aplikasi tertutup mendadak saat membuka Chrome (LMK Killer):**
  Buka kembali PWA dari Layar Utama. Berkat modul ketahanan RPO $\le 400$ms, draft Anda yang terakhir diketik akan pulih otomatis.
* **Muncul peringatan "Ada task IN_PROGRESS lain":**
  Selesaikan task tersebut terlebih dahulu atau diskusikan dengan pemegang task sebelum mengklaim task baru.
* **Gagal push ke Git karena kredensial kadaluarsa:**
  Token di RAM otomatis terhapus setelah 15 menit. Masukkan kembali Personal Access Token (PAT) Anda saat diminta di Termux; token akan diamankan sementara di memori RAM tanpa pernah disimpan ke disk.
