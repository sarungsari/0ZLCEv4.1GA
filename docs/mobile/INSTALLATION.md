# PANDUAN INSTALASI TABLET ANDROID & ZLCE MOBILE WORKBENCH
## Prosedur Penyiapan Lengkap Samsung Galaxy Tab A7 Lite (SM-T225) dari Nol (TASK-041 / TC-P8-01 / DOC-002)

> 💡 **TUTORIAL TERPISAH:** Dokumen ini memuat panduan komprehensif, presisi, dan siap salin (*copy-paste ready*) untuk menyiapkan tablet Android. Untuk versi langkah-demi-langkah berurutan murni dari persiapan Termux sampai instalasi PWA standalone, lihat juga dokumen acuan: [`docs/mobile/INSTALLATION_ANDROID.md`](INSTALLATION_ANDROID.md).

---

## 1. RINGKASAN SPESIFIKASI ACUAN PERANGKAT

* **Model Tablet:** Samsung Galaxy Tab A7 Lite (SM-T225)
* **RAM / Penyimpanan:** 3 GB LPDDR4X / 32 GB eMMC 5.1 (microSD opsional)
* **Layar:** 8.7 inci TFT LCD WXGA+ (1340 x 800 piksel, rasio 5:3)
* **Sistem Operasi:** Android 11 s/d Android 14 (One UI Core 6.x)
* **Prinsip Utama:** *Zero Daemon & Zero External Runtime* (Nol daemon background, isolasi memori 15 menit).

---

## 2. LANGKAH 1: INSTALASI TERMUX DARI F-DROID

> ⚠️ **PERINGATAN PENTING:** Jangan mengunduh Termux dari Google Play Store! Versi Play Store sudah dihentikan dan dibatasi kebijakan API Android. Wajib menggunakan build resmi F-Droid.

1. Buka peramban Google Chrome di tablet Samsung A7 Lite.
2. Unduh installer **F-Droid APK** dari situs resmi:  
   `https://f-droid.org/` atau langsung unduh **Termux APK** dari:  
   `https://f-droid.org/packages/com.termux/`
3. Berikan izin instalasi aplikasi tidak dikenal (*Install unknown apps*) pada Chrome.
4. Pasang Termux hingga selesai, lalu buka aplikasi Termux.

---

## 3. LANGKAH 2: PENYIAPAN PAKET LINUX STANDAR TERMUX

Jalankan perintah berikut di jendela Termux (cukup salin satu blok perintah utuh):

```bash
# 1. Update repository dan upgrade paket dasar
pkg update -y && pkg upgrade -y

# 2. Instal pustaka Linux standar & runtime Node.js LTS yang dibutuhkan ZLCE
pkg install -y git python bash coreutils micro openssh
pkg install -y nodejs-lts

# 3. Verifikasi instalasi paket
node -v
npm -v
git --version
python3 --version
micro --version
```

*Catatan:* Skrip pemeriksa ZLCE (`zlce-check.py`, `zlce-collect.py`) beroperasi 100% menggunakan pustaka bawaan standar Python (`os`, `sys`, `re`, `json`, `subprocess`). **Nol instalasi pip external** yang membebani memori.

---

## 4. LANGKAH 3: PENGATURAN DIREKTORI PROYEK & CLONE REPOSITORI

```bash
# 1. Buat direktori kerja proyek tim
mkdir -p ~/projects
cd ~/projects

# 2. Clone repositori bersama ZLCE
git clone https://github.com/ekokeplek-glitch/ZLCE4.1.git
cd ZLCE4.1

# 3. Pindah ke branch kerja v4-mobile (lewati jika clone sudah berada di branch default)
git checkout v4-mobile 2>/dev/null || true

# 4. Pasang dependensi JavaScript (wajib sebelum menjalankan aplikasi)
npm install

# 5. Berikan izin eksekusi pada seluruh skrip utilitas ZLCE
chmod +x scripts/zlce/zlce scripts/zlce/clean-auth.sh scripts/*.sh scripts/*.py
```

---

## 5. LANGKAH 4: MEMASANG DISPATCHER `zlce` DI PATH TERMUX

Agar perintah diagnostik dapat dipanggil dengan singkat (misalnya `zlce check`), buat tautan simbolik (*symlink*) ke direktori bin Termux:

```bash
# 1. Buat direktori ~/bin jika belum ada
mkdir -p ~/bin

# 2. Buat symlink ke dispatcher zlce
ln -sf ~/projects/ZLCE4.1/scripts/zlce/zlce ~/bin/zlce

# 3. Muat ulang path shell
export PATH="$HOME/bin:$PATH"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc

# 4. Uji eksekusi dispatcher
zlce --help
```

Keluaran yang diharapkan:
```text
============================================================
ZLCE Mobile CLI Dispatcher v4.1.0 GA (Termux / Android)
============================================================
Penggunaan: zlce <subperintah> [argumen...]

Subperintah resmi yang diizinkan (allowlist):
  check      Validasi SESSION_STATE.md & TASKS.md (opsi: --strict, --no-git)
  snapshot   Ambil snapshot recovery diff dan status git (opsi: --diff)
  collect    Kemas dokumen kontrol ZLCE ke arsip ZIP aman
  pull       Tarik pembaruan cabang secara aman (--ff-only)
  push       Dorong cabang task aktif ke repositori remote (blokir main)
  clean-auth Bersihkan credential cache dari memori RAM tablet
  help       Tampilkan pesan bantuan ini
============================================================
```

---

## 6. LANGKAH 5: MENJALANKAN SERVER & INSTALASI PWA KE LAYAR UTAMA

Jalankan skrip produksi mandiri ZLCE di jendela Termux:

```bash
cd ~/projects/ZLCE4.1
bash scripts/zlce-prod-start.sh
```

Skrip ini akan memeriksa dependensi, memvalidasi integritas dokumen `SESSION_STATE.md`, mengompilasi bundel produksi (`npm run build`), dan menyajikan aplikasi web di `http://localhost:3000`.

**Pemasangan PWA (Progressive Web App):**
1. Buka peramban **Google Chrome** atau **Samsung Internet** di tablet Samsung Galaxy Tab A7 Lite.
2. Akses alamat: **`http://localhost:3000`**
3. Tunggu hingga Service Worker aktif mencache app shell untuk operasi offline.
4. Ketuk menu **tiga titik vertikal** (⋮) di pojok kanan atas peramban -> Pilih **"Instal aplikasi"** atau **"Tambahkan ke Layar Utama" (Add to Home screen)**.
5. Konfirmasi instalasi. Ikon aplikasi **ZLCEv4.1Mob** dengan logo petir akan muncul di layar utama tablet.
6. Buka aplikasi dari ikon layar utama: aplikasi berjalan penuh tanpa URL bar (*standalone mode*).

---

## 7. LANGKAH 6: VERIFIKASI INSTALASI AWAL

Buka jendela terminal Termux baru atau hentikan server sementara (`Ctrl+C`), lalu jalankan verifikasi diagnostik:

```bash
cd ~/projects/ZLCE4.1
zlce check
```

Bila seluruh berkas kontrol utuh, keluaran terminal akan menampilkan:
```text
RESULT: OK (0 error, 0 warn, 93 task)
```

Tablet Samsung Galaxy Tab A7 Lite kini 100% siap digunakan oleh 8 anggota tim estafet!
Untuk panduan operasional pemakaian harian berurutan, lanjutkan ke: [`docs/mobile/USAGE_MOBILE.md`](USAGE_MOBILE.md).
