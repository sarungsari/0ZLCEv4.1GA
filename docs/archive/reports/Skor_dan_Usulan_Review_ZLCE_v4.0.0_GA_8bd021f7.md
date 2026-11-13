# Skor Review & Usulan Tindakan: ZLCE Mobile Workbench v4.0.0 GA

Tanggal: 11 Nov 2026
Dasar: audit ulang bundel ZIP (138 berkas, checksum SHA-256 cocok). Pembacaan statis; belum dijalankan di Galaxy Tab A7 Lite (SM-T225).

## 1. Skor Review

| Pilar | Review lama (8 Nov) | Audit ulang (11 Nov) | Perubahan |
| --- | --- | --- | --- |
| User-Friendly (ergonomi & aksesibilitas sentuh) | 66 | 78 | +12 |
| Komunikatif (bahasa & umpan balik) | 70 | 76 | +6 |
| Kemudahan Pemakaian (1-tap flow) | 74 | 82 | +8 |
| Efisiensi (performa, PWA, RAM 3GB) | 60 | 74 | +14 |
| Ketangguhan Fitur | 82 | 88 | +6 |
| **Total Skor Kesiapan Frontend PWA** | **70** | **80** | **+10** |
| **Keputusan** | NEEDS POLISHING | **NEEDS POLISHING** | tetap |

Catatan:
- Skor adalah penilaian reviewer. Total adalah rata-rata kelima pilar, dibulatkan.
- Skor Efisiensi belum berbasis pengukuran (ukuran bundle, heap, TTI belum diukur).
- Ambang keputusan (90 siap produksi, 60 perlu polishing) adalah asumsi reviewer, bukan dari mandat.

## 2. Ringkasan Temuan

| Prioritas | Jumlah | Inti |
| --- | --- | --- |
| P0 | 1 | Ikon PWA tidak ada di bundel |
| P1 | 9 | Keyboard dan draft belum merata, aksesibilitas modal, banner menutup navigasi, tipografi kecil, identitas produk, jargon, klaim uji tak terverifikasi, belum diuji di perangkat nyata |
| P2 | 6 | Fallback `TASK-013`, label WIB, `catch {}` kosong, manifest, `aria-live` banner, tab berdekatan |

Perbaikan review lama yang sudah terverifikasi: hook keyboard, `DraftTextarea` (7 berkas), Service Worker toleran dengan timeout 2,5 dtk, `ConfirmDialog` dan Toast (0 `confirm()`/`alert()`), Ambil Alih klaim, banner kuota, `React.lazy`, `lang="id"`, reduced-motion, dan Undo/Redo sentuh.

## 3. Usulan Rencana Tindakan

| ID | Prio | Sub-task | Berkas utama | Kriteria selesai | Hari | Menutup |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | P0 | Pastikan ikon ikut build dan tambah cek pasca-build | `public/icons/`, `package.json`, skrip | Lighthouse "Installable" lolos, 0 ikon 404 | 0,5 | P0-1 |
| R-02 | P1 | `ModalShell` bersama (dialog, `aria-modal`, Escape, focus trap, hook keyboard); migrasikan 6 modal | `mobile/*Modal*`, `DashboardTab`, `ProjectSwitcher`, `TaskClaimBanner` | 0 modal tanpa Escape dan `aria-modal` | 1,5 | P1-1, P1-3 |
| R-03 | P1 | `DraftTextarea` untuk bukti verifikasi, alasan ambil alih, Device Handover, Project Switcher, Prompt Studio, SessionState, Recovery | 7 berkas | Tutup paksa saat mengetik, teks pulih di semua alur | 1 | P1-2 |
| R-04 | P1 | Banner stack memakai `--header-h` dari `ResizeObserver` | `MobileLayout.tsx`, `Header.tsx` | Banner tidak pernah menutup baris tab | 0,5 | P1-4 |
| R-05 | P1 | Skala tipografi 12/14 px | seluruh komponen | 0 `text-[9px]`/`[10px]` pada teks informatif | 1 | P1-5 |
| R-06 | P1 | Satu sumber nama dan versi; perbaiki title/og/description dan sisa "v3.2.2" | `index.html`, `vite.config.ts`, `PersistentSidebar`, `TestHarnessTab` | Satu nama dan satu versi di semua tempat | 0,5 | P1-6 |
| R-07 | P1 | Bahasakan ulang jargon "Fix X1" dan "Invarian I1" di UI | 11 berkas UI | Uji baca 2 anggota non-teknis tanpa bantuan | 0,5 | P1-7 |
| R-08 | P1 | Sertakan `scripts/` dan 3 tes yang dirujuk CHANGELOG ke bundel review | `scripts/`, `src/tests/` | `run-tests.py` dapat dijalankan pihak review | 0,25 | P1-8 |
| R-09 | P1 | Uji perangkat nyata SM-T225: Gboard, offset ganda, LMK, Mode Pesawat, RAM, TTI | `DEVICE_AUDIT.md` | Angka nyata menggantikan asersi; `interactive-widget` diputuskan | 1 | P1-9 |
| R-10 | P1 | Status "Live Bridge tidak tersedia" yang jelas pada build statis | `useSessionPersistence.ts` | Tidak ada galat terlihat saat `/api/session-state` 404 | 0,25 | P1-9 |
| R-11 | P2 | Hapus fallback `TASK-013`, set `timeZone` WIB, perbaiki `catch {}` | `DashboardTab`, `TaskClaimBanner`, 3 berkas | Tidak ada literal task tersisa | 0,25 | P2-1..3 |
| R-12 | P2 | Lengkapi manifest, `aria-live` banner, animasi banner berhenti sendiri | manifest, `MobileLayout` | Lighthouse PWA tanpa peringatan | 0,5 | P2-4..6 |

**Estimasi:** P0 0,5 hari, P1 6,5 hari, P2 0,75 hari, **total 7,75 hari kerja** (penilaian reviewer, bukan pengukuran).

## 4. Jalur ke READY FOR PRODUCTION

Jika R-01, R-02, R-03, R-04, dan R-09 selesai dan lolos di perangkat nyata, skor diperkirakan naik ke kisaran 88-90.
