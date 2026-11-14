# PANDUAN LENGKAP INSTALASI ANDROID: TERMUX SAMPAI PWA STANDALONE
## ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob) — Tutorial Terurut Khusus Android & Tablet Samsung (DOC-002)

Dokumen ini memuat panduan instalasi langkah-demi-langkah yang presisi, berurutan, dan bebas friksi untuk menyiapkan ZLCE Mobile Workbench dari nol pada perangkat Android (khususnya tablet Samsung Galaxy Tab A7 Lite maupun smartphone Android).

---

## DAFTAR LANGKAH BERURUTAN (ROADMAP INSTALASI)

```text
[LANGKAH 1] Persiapan Perangkat & Baterai
     │
     ▼
[LANGKAH 2] Unduh & Pasang Termux Murni dari F-Droid
     │
     ▼
[LANGKAH 3] Konfigurasi Izin Penyimpanan & Setup Paket Linux
     │
     ▼
[LANGKAH 4] Clone Repositori Proyek & Instalasi Node Modules
     │
     ▼
[LANGKAH 5] Pasang Dispatcher CLI `zlce` & Shortcut ~/.bashrc
     │
     ▼
[LANGKAH 6] Jalankan Server Produksi Lokal (HOST=127.0.0.1:3000)
     │
     ▼
[LANGKAH 7] Pemasangan PWA ke Layar Utama Android (Standalone Mode)
     │
     ▼
[LANGKAH 8] Verifikasi Kesiapan Offline & Uji Diagnostik Awal
```

---

## LANGKAH 1: PERSIAPAN PERANGKAT & LINGKUNGAN

Sebelum memulai instalasi, pastikan tablet atau perangkat Android memenuhi checklist persiapan:
1. **Daya Baterai:** Pastikan baterai berada di atas 40% atau hubungkan perangkat ke kabel pengisi daya agar instalasi paket tidak terputus di tengah jalan.
2. **Koneksi Internet:** Sambungkan ke jaringan Wi-Fi yang stabil untuk mengunduh paket Linux (~150MB).
3. **Penyimpanan Bebas:** Sediakan ruang penyimpanan kosong minimal 1.5 GB di memori internal perangkat.
4. **Keyboard Virtual & Layar:** Disarankan mengaktifkan keyboard virtual dengan baris angka (Gboard atau Samsung Keyboard) dan mengatur rotasi layar otomatis (*Auto-rotate*).

---

## LANGKAH 2: INSTALASI TERMUX MURNI DARI F-DROID

> ⚠️ **PERINGATAN KRITIS:**  
> **JANGAN PERNAH** mengunduh Termux dari Google Play Store! Versi Play Store sudah ditinggalkan (deprecated) sejak Android 10 dan dibatasi oleh kebijakan Android API level sehingga `pkg update` akan gagal total.

### Cara Mengunduh & Memasang:
1. Buka peramban Google Chrome atau Samsung Internet di perangkat Android.
2. Kunjungi situs resmi F-Droid atau tautan langsung rilis Termux:  
   👉 **`https://f-droid.org/packages/com.termux/`**
3. Gulir ke bawah ke bagian **Versions**, lalu unduh berkas APK versi terbaru (misal: `com.termux_118.apk`).
4. Buka berkas APK yang telah diunduh di panel notifikasi atau folder *Downloads*.
5. Jika muncul peringatan izin keamanan Android:
   - Ketuk **Setelan (Settings)** ➔ Aktifkan **"Izinkan dari sumber ini" (Allow from this source)**.
6. Ketuk **Pasang (Install)** dan tunggu hingga selesai.
7. Buka aplikasi Termux dari layar aplikasi Anda.

---

## LANGKAH 3: IZIN PENYIMPANAN & SETUP PAKET LINUX

Setelah jendela hitam terminal Termux terbuka, jalankan perintah berikut untuk mengizinkan akses berkas dan memperbarui sistem operasi mini Linux:

### 3.1 Berikan Izin Penyimpanan Android:
```bash
termux-setup-storage
```
*Akan muncul dialog pop-up Android bertuliskan "Izinkan Termux mengakses foto, media, dan file di perangkat Anda?". Ketuk **Izinkan (Allow)**.*

### 3.2 Update Repositori & Instal Paket Inti:
Salin satu blok perintah berikut dan tempelkan ke jendela Termux:
```bash
# Update repository index dan paket bawaan
pkg update -y && pkg upgrade -y

# Instal runtime Node.js LTS, Python 3, Git, editor Micro, dan utilitas standar
pkg install -y git python nodejs-lts bash coreutils micro openssh
```

### 3.3 Verifikasi Pemasangan Paket:
Periksa apakah seluruh alat terpasang dengan sukses:
```bash
node -v && npm -v && python3 --version && git --version && micro --version
```
*Pastikan Node.js menampilkan versi `>= 20.x.x` dan Python menampilkan `>= 3.11.x`.*

---

## LANGKAH 4: CLONE REPOSITORI PROYEK & INSTAL DEPENDENSI

Sekarang kita akan membuat folder kerja `projects` di direktori `home` Termux dan mengkloning repositori ZLCE Mobile Workbench:

```bash
# 1. Buat folder proyek dan masuk ke dalamnya
mkdir -p ~/projects
cd ~/projects

# 2. Clone repositori ZLCE Mobile Workbench v4.1.0 GA
git clone https://github.com/sarungsari/0ZLCEv4.1GA.git
cd 0ZLCEv4.1GA

# 3. Pindah ke branch kerja aktif (lewati jika clone sudah berada di branch default)
git checkout v4-mobile 2>/dev/null || true

# 4. Instal seluruh dependensi front-end (React, Vite, Tailwind CSS, Lucide)
npm install

# 5. Berikan hak eksekusi pada seluruh script utilitas ZLCE
chmod +x scripts/zlce/zlce scripts/zlce/clean-auth.sh scripts/*.sh scripts/*.py
```

---

## LANGKAH 5: PASANG DISPATCHER CLI `zlce` & SHORTCUT `~/.bashrc`

Agar seluruh anggota tim dapat menjalankan diagnostik hanya dengan mengetik perintah pendek seperti `zlce check`, buat symlink ke direktori `~/bin`:

```bash
# 1. Buat direktori ~/bin jika belum ada
mkdir -p ~/bin

# 2. Buat symlink simbolik ke dispatcher ZLCE
ln -sf ~/projects/0ZLCEv4.1GA/scripts/zlce/zlce ~/bin/zlce

# 3. Pasang shortcut alias dan lingkungan ramah layar sentuh di ~/.bashrc
cat << 'EOF' >> ~/.bashrc

# --- Konfigurasi ZLCE Mobile Workbench ---
export PATH="$HOME/bin:$PATH"
export EDITOR=micro
export VISUAL=micro

alias cdp="cd ~/projects/0ZLCEv4.1GA"
alias zcheck="zlce check"
alias zsnap="zlce snapshot"
alias zclean="zlce clean-auth"
alias zpull="zlce pull"

echo "⚡ Terminal ZLCE Mobile Siap Digunakan!"
echo "👉 Ketik 'cdp' untuk masuk ke folder proyek."
echo "👉 Ketik 'zcheck' untuk memeriksa status sesi."
EOF

# 4. Muat ulang konfigurasi shell
source ~/.bashrc

# 5. Uji bantuan dispatcher ZLCE
zlce help
```

---

## LANGKAH 6: MENJALANKAN SERVER LOKAL MANDIRI

ZLCE Mobile Workbench adalah aplikasi web client-side yang menyajikan app shell lokal secara mandiri.

Jalankan perintah peluncur server produksi berikut:
```bash
cdp
bash scripts/zlce-prod-start.sh
```

*Catatan Keamanan Jaringan Wi-Fi Bersama:*  
Jika tablet terhubung ke Wi-Fi publik / bersama dan Anda ingin membatasi akses hanya untuk tablet lokal tanpa bisa dibuka perangkat lain:
```bash
HOST=127.0.0.1 bash scripts/zlce-prod-start.sh
```

Server akan mengompilasi bundel produksi Vite dan menampilkan log:
```text
  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```
*Biarkan jendela Termux ini tetap aktif di latar belakang (jangan ditutup).*

---

## LANGKAH 7: PEMASANGAN PWA KE LAYAR UTAMA ANDROID

Sekarang aplikasi siap dipasang sebagai Progressive Web App (PWA) agar berjalan mandiri tanpa URL bar browser (*Standalone App Mode*):

### Prosedur di Google Chrome:
1. Buka peramban **Google Chrome** di tablet Android Anda.
2. Ketik alamat: **`http://localhost:3000`** lalu tekan Enter.
3. Halaman ZLCE Mobile Workbench akan terbuka. Tunggu 2-3 detik hingga Service Worker selesai mengunduh dan mencache seluruh app shell.
4. Ketuk menu **Tiga Titik Vertikal (⋮)** di sudut kanan atas Chrome.
5. Pilih menu **"Tambahkan ke Layar Utama" (Add to Home screen)** atau **"Instal aplikasi" (Install app)**.
6. Akan muncul konfirmasi nama aplikasi `"ZLCEv4.1Mob"`, ketuk tombol **Instal / Tambahkan**.
7. Kembali ke layar beranda (Home Screen) tablet Anda: Ikon petir kuning dengan latar gelap ZLCEv4.1Mob akan muncul berdampingan dengan aplikasi Android lainnya.

### Prosedur di Samsung Internet Browser:
1. Buka **Samsung Internet**.
2. Masuk ke **`http://localhost:3000`**.
3. Di bilah alamat sebelah kanan atau di menu bawah (garis tiga ☰), akan muncul ikon unduh kecil atau opsi **"Tambahkan halaman ke" ➔ "Layar depan" (Home screen)**.
4. Konfirmasi penambahan.

---

## LANGKAH 8: VERIFIKASI KESIAPAN OFFLINE & UJI AWAL

Untuk memastikan tablet 100% siap dipakai tanpa kendala memori maupun jaringan:

### 8.1 Uji Mode Mandiri / Standalone:
- Ketuk ikon **ZLCEv4.1Mob** di Layar Utama Android.
- Pastikan aplikasi terbuka tanpa bilah alamat URL peramban (layar penuh bersih).
- Header atas menampilkan pemilih proyek (**Registry Proyek**) di sebelah kiri serta **Active Member Selector** + tombol **Oper Tablet** di sebelah kanan.

### 8.2 Uji Ketahanan Mode Offline (Mode Pesawat):
1. Tarik panel notifikasi Android ke bawah, lalu aktifkan **Mode Pesawat (Airplane Mode)**.
2. Geser atau tutup aplikasi ZLCEv4.1Mob dari daftar aplikasi terkini (Recent Apps), lalu buka kembali dari Home Screen.
3. Aplikasi akan tetap terbuka seketika dan berfungsi normal berkat Service Worker app shell caching.
4. Matikan kembali Mode Pesawat setelah pengujian.

### 8.3 Uji Diagnostik Terminal:
Buka sesi terminal Termux baru (geser dari tepi kiri Termux ➔ ketuk *New Session*), lalu jalankan:
```bash
cdp
zlce check
```
Keluaran yang diharapkan:
```text
RESULT: OK (0 error, 0 warn, 3 task)
```

> 💡 **Mode SIMPLE untuk Proyek Baru:** Anda juga dapat mengunduh **Kit Single SIMPLE (`ZLCE_KIT_SIMPLE.md`)** atau **`zlce-simple-kit-v4.1.0.zip`** langsung dari tab **Dashboard** atau **Template & Pack Studio** untuk memulai proyek baru yang ringan dengan AI.

🎉 **Selamat! ZLCE Mobile Workbench kini 100% terpasang dan siap digunakan untuk kolaborasi estafet 8 anggota tim.**
