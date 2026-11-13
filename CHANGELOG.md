# Catatan Perubahan (Changelog)

Semua perubahan penting pada proyek **ZLCE (Zero-Loss Context Engineering)** didokumentasikan di sini. Format mengikuti prinsip [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

## [4.1.0 GA] - 2026-11-13 (Terkunci & Siap Operasional)

### Dirilis & Dikunci
- **Baseline Operasional Bersih `ZLCE Mobile Workbench v4.1.0 GA` (`ZLCEv4.1Mob`):**
  - **PWA 6-Tab Kanonik & Offline Shell:** `Dashboard`, `SESSION_STATE & WAL`, `AI Workbench`, `Terminal & Git`, `Diagnostik & Kualitas`, serta `Dokumentasi & Panduan` dengan Service Worker (`public/sw.js`), Web App Manifest (`public/manifest.webmanifest`), target sentuh minimal `44x44px`, tipografi `>= 12px`, dan ketahanan LMK RPO `<= 400ms`.
  - **Kesiapan 3 Alur Kerja Terisolasi:** Launcher Dashboard & `projectStarter` siap untuk **Proyek Baru (`NEW`)**, **Lanjutan Setengah Jadi (`CONTINUE`)**, dan **Update & Modifikasi (`MODIFY`)** tanpa menimpa baseline GA host.
  - **Single Source Sync & Generator Bundel On-Demand:** Seluruh template kontrol, contoh, skrip Termux (`scripts/zlce/`), tutorial instalasi Android (`INSTALLATION_ANDROID.md`, `TERMUX_SETUP.md`), panduan penggunaan mobile (`USAGE_MOBILE.md`, `TROUBLESHOOTING.md`), dan `zlce-starter-kit/` tersinkron penuh via `npm run sync:assets`; seluruh paket `.zip` dibuat dinamis saat dibutuhkan (`npm run bundles` / `/api/bundle/*`) tanpa residu arsip `.zip` di repositori.
  - **Pembersihan Riwayat & Eksklusi `.gitignore`:** Tugas dan laporan review pengembangan historis diarsipkan ke `archive/` dan dikecualikan di `.gitignore` agar repositori ringkas saat di-clone (`archive/components/README.md` tetap terjaga secara internal).
  - **Pengesahan Resmi GA (8 Anggota Tim Estafet):** Eko, Oned, Cxperia, Sulistiyani, Layang, Acimau, Kepek, Gete (`Zero-Secret Policy` 0 leak, `zlce-check.py --strict` 0 error/0 warn).

> *Catatan: Riwayat rinci pengembangan historis v4.0.0 s/d v4.1.0 (FASE 0–21 / TASK-001 s/d TASK-134) tersimpan di arsip lokal `archive/history/CHANGELOG.v4.1.0-dev.md`.*
