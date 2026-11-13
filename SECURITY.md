# Kebijakan Keamanan (Security Policy)

## Arsitektur Privasi & Penyimpanan Data

1. **100% Sisi Klien (Client-Side)**:
   - Aplikasi web ZLCEv4.1Mob (`ZLCE Mobile Workbench v4.1.0 GA`) berjalan sepenuhnya di browser pengguna.
   - Semua input teks, draf `SESSION_STATE.md`, dan riwayat undo/redo disimpan secara lokal di `localStorage` peramban Anda.
   - Tidak ada data dokumen atau potongan kode proyek yang dikirimkan ke server jarak jauh (kecuali Anda sendiri yang menghubungkan integrasi eksternal).

2. **Perhatian Terhadap Kredensial**:
   - Jangan pernah menyalin atau menyimpan rahasia (kunci API privat, kata sandi database, token akses OAuth) ke dalam berkas kontrol `SESSION_STATE.md`, `TASKS.md`, maupun snapshot git.
   - Gunakan selalu berkas lingkungan lokal (`.env`) yang dikecualikan di `.gitignore`.

## Pelaporan Kerentanan (Reporting a Vulnerability)

Jika Anda menemukan potensi kerentanan keamanan pada kit atau aplikasi web ZLCEv4.1Mob:
- Harap tidak mempublikasikannya langsung di issue publik.
- Kirimkan detail temuan dan langkah reproduksi melalui email ke pengelola proyek atau buat *Security Advisory* privat di repositori GitHub resmi: `https://github.com/ekokeplek-glitch/ZLCE4.1/security/advisories`.
- Kami akan meninjau dan merespons laporan dalam waktu 1–3 hari kerja.
