# Review Frontend PWA ZLCE Mobile Workbench v4.0.0 GA

Nov 8, 2026 · @esperia

Skor kesiapan frontend PWA adalah 70 dari 100, keputusan **NEEDS POLISHING**: fitur sudah lengkap, tetapi adaptasi keyboard virtual, perlindungan draft, dan Service Worker offline belum sesuai klaim mandat.

Review ini berbasis pembacaan statis kode di bundel (98 berkas); aplikasi belum dijalankan di Galaxy Tab A7 Lite. Berkas yang dibaca langsung: `App.tsx`, `index.css`, `MobileLayout.tsx`, `useAutoDraftCache.ts`, `sw.js`, `sw-register.ts`, manifest, `index.html`, `OneTapCopyButton`, `clipboard.ts`, `TaskClaimBanner`, `ActiveMemberSelector`, serta sebagian `MemberWorkLogSection`, `useSessionPersistence`, `Header`, `commandSanitizer`. Sisanya dipindai dengan grep.

## 1. Ringkasan eksekutif & matriks skor UX

| Pilar | Skor (0-100) |
| --- | --- |
| User-Friendly (ergonomi & aksesibilitas sentuh) | 66 |
| Komunikatif (bahasa & umpan balik) | 70 |
| Kemudahan Pemakaian (1-tap flow) | 74 |
| Efisiensi (performa, PWA, RAM 3GB) | 60 |
| Ketangguhan Fitur (powerful) | 82 |
| **Total skor kesiapan frontend PWA** | **70** |
| **Keputusan** | **NEEDS POLISHING** |

## 2. Kekuatan utama

Tujuh hal ini layak dipertahankan karena sudah matang secara rekayasa.

- **Auto-draft yang kokoh** (`useAutoDraftCache.ts`): debounce 400 ms; flush pada `visibilitychange`, `pagehide`, `beforeunload`, dan saat unmount; draft dipisah per anggota lewat `getScopedStorageKey`; flush selalu ke kunci pemilik draft (`dirtyKeyRef`), jadi tidak bocor antar-anggota. Teks disimpan murni dan deteksi rahasia hanya memberi peringatan.
- **Disiplin target sentuh**: 257 pemakaian `touch-target-44/48` dan 247 `min-h-[44px/48px]`. Aksi utama (salin, rilis klaim, selesaikan) berukuran 44 px atau lebih.
- **`OneTapCopyButton`** punya fallback `execCommand` untuk konteks non-HTTPS (`clipboard.ts`), umpan balik "Tersalin!" yang jelas, dan 9 varian warna semantik.
- **`useVisualViewport`** efisien: pembaruan lewat rAF, ambang 2 px, ditunda saat tab tersembunyi.
- **`TaskClaimBanner`** mengomunikasikan invarian maks 1 IN\_PROGRESS, pemegang klaim ("Anda" vs "Anggota Lain"), dan durasi kerja.
- **Sanitizer shell** (`commandSanitizer.ts`): quoting POSIX, deny-list path (`.env`, `.git`, kunci), menolak flag dan traversal.
- **Cakupan fitur lengkap**: 18 tab, penanganan `?tab=` dan shortcut manifest, banner offline dan install PWA.

## 3. Temuan berbobot prioritas

Tiga temuan P0 menghalangi rilis, delapan P1 memengaruhi alur kerja, dan sebelas P2 bersifat polishing.

### P0: Kritis

**P0-1. Adaptasi keyboard virtual hanya setengah jadi.**

- Lokasi: `MobileLayout.tsx`, `index.css`.
- Bukti: `ViewportContext` / `useViewport` tidak dikonsumsi komponen lain. Kelas `.viewport-aware-container` dan `.tablet-thumb-bar` didefinisikan tetapi tidak dipakai. Tidak ada satu pun `scrollIntoView` di `src`.
- Dampak: hanya `paddingBottom` pada pembungkus yang berubah; textarea yang fokus tidak digulirkan ke area terlihat. Di edit log, Result Capture, Paste-Back, dan Handover, kolom input dan tombol Simpan bisa tertutup keyboard. `DEVICE_AUDIT.md` menyatakan PASS, tetapi uji otomatisnya hanya memeriksa nama variabel CSS.
- Solusi: hook `useKeyboardAwareFocus` yang memanggil `scrollIntoView({block:'center'})` pada `focusin` setelah `visualViewport.resize`; footer aksi form dan modal dibuat `sticky bottom-0` dengan `padding-bottom: calc(var(--keyboard-height) + var(--safe-bottom))`; tinggi modal memakai `max-height: var(--viewport-height)`.

**P0-2. Perlindungan draft hanya mencakup 2 dari sekitar 18 area input.**

- Lokasi: `useAutoDraftCache` hanya dipakai `WorkspaceEditor` dan `FeedbackReviewTab`. Ada sekitar 30 `<textarea>` lain, antara lain di `ResultCaptureTab`, `PasteBackModal`, `AiHandoverWizard`, `MemberWorkLogSection`, `ConflictResolutionWizard`, `ContextPackTab`.
- Bukti: `ResultCaptureTab` hanya memakai `localStorage` untuk ID anggota; `editNoteText` di `MemberWorkLogSection` adalah `useState` biasa.
- Dampak: janji ketahanan sesi saat Android LMK tidak berlaku di alur paling berisiko. Hasil AI yang baru ditempel hilang tanpa peringatan bila aplikasi dimatikan saat anggota kembali dari Termux.
- Solusi: komponen `DraftTextarea draftKey="..."` atau `useAutoDraftCache` dengan `storageKey` unik di Result Capture, Paste-Back, Handover, dan edit log, plus lencana "Draft tersimpan HH.MM" yang konsisten.

**P0-3. Service Worker tidak sesuai klaim "Cache-First, 100% offline".**

- Lokasi: `public/sw.js`.
- Bukti: (1) `cache.addAll(CORE_MANDATORY_ASSETS)` atomik; folder `public/icons/` tidak ada di bundel dan manifest merujuk tiga ikon, jadi satu 404 membuat `/` dan `/index.html` tidak ter-cache, hanya dengan `console.error`. (2) Navigasi Network-First tanpa timeout. (3) `skipWaiting()` di install plus `clients.claim()` mengganti SW di tengah sesi, sementara `onUpdate` hanya `console.info`.
- Dampak: Mode Pesawat bisa gagal total tanpa pemberitahuan; startup lambat pada jaringan lemah atau captive portal.
- Solusi: precache toleran (`Promise.allSettled`, hanya `/` dan `/index.html` wajib); navigasi cache-first dengan revalidasi atau `Promise.race` timeout 2-3 detik; hapus `skipWaiting` otomatis dan tampilkan toast "Versi baru tersedia, Muat ulang" lewat `onUpdate`; pastikan ikon ikut artefak build.

### P1: Penting untuk alur kerja, komunikasi, kenyamanan

1. **Target sentuh di bawah standar pada kontrol sekunder.** `ActiveMemberSelector` (tombol tutup `p-1` + ikon 16 px, sekitar 24 px; avatar `w-6`), `WorkspaceEditor.tsx:381`, `<select>` status di `MemberWorkLogSection` (`py-1`), dan sekitar 160 `<button>` bergaya `p-1/p-1.5/py-1`. Solusi: `IconButton` dan `Select` bersama dengan `min-h-11 min-w-11`, plus lint untuk `<button>` tanpa kelas sentuh.
2. **Keterbacaan tipografi.** `text-[10px]` 296 kali, `text-[11px]` 391 kali, `text-[9px]` 19 kali. Badge "Driver" dan peran anggota memakai 9-10 px. Solusi: lantai 12 px untuk teks informatif dan 14 px untuk form, lewat token skala tipografi.
3. **`confirm()` / `alert()` bawaan browser** (8 `confirm`, 7 `alert`) di `TaskClaimBanner`, `MemberWorkLogSection`, dan lainnya. Hanya 1 dari 7 modal custom yang menangani `Escape`, 1 yang memakai `aria-modal`, dan tidak ada focus trap. Solusi: `ConfirmDialog` dan `Toast` bersama dengan tombol minimal 48 px dan label aksi eksplisit ("Ya, lepaskan klaim").
4. **`TaskClaimBanner` tidak melindungi klaim anggota lain.** Tombol "Rilis Klaim" dan "Selesaikan & Setujui" tampil untuk siapa pun walau badge "Anggota Lain"; efek fallback membuat klaim otomatis atas nama `activeMember` yang memegang tablet. Provenance estafet bisa rusak senyap. Solusi: konfirmasi ambil alih bila `!isCurrentDriver`, dan tanpa auto-claim senyap.
5. **Tidak ada code splitting.** `App.tsx` mengimpor statis 18 tab (sekitar 14 ribu baris); tidak ada `React.lazy` atau `Suspense`. Solusi: `React.lazy` per tab dengan skeleton, prefetch saat idle, target chunk awal di bawah sekitar 250 KB gzip (perlu diukur).
6. **Kegagalan simpan senyap pada penyimpanan penuh.** `saveLightweightHistory` punya `catch {}` kosong; `persistDraft` hanya `console.error`. UI bisa tetap menampilkan "tersimpan". Solusi: tangkap `QuotaExceededError`, tampilkan banner merah persisten dengan "Ekspor cadangan .md", dan tambahkan `navigator.storage.persist()`.
7. **"Pilih Manual" tidak memilih teks.** `OneTapCopyButton.tsx` berkomentar "seleksi otomatis" tetapi hanya `setHasError(true)`: jalan buntu bila salin gagal. Solusi: panel `<textarea readonly>` dengan teks terseleksi dan petunjuk "Tekan lama, lalu Salin".
8. **Banner offline dan install menimpa header.** Keduanya `sticky top-16`, padahal header `sticky top-0` punya dua baris (bar `h-14/16` plus `<nav>` tab), dan kedua banner bisa bertumpuk. Banner offline, indikator terpenting untuk mode pesawat, bisa tertutup nav. Solusi: letakkan di alur dokumen di bawah header atau ukur tinggi header ke `--header-h` lewat `ResizeObserver`.

### P2: Polishing

- **Identitas dan versi tidak seragam.** `index.html` berjudul "4Remix T1ZLCE Mobench v4.0.0GA"; manifest "ZLCE Mobile Workbench"; `apple-mobile-web-app-title` "ZLCE Studio"; footer menulis "Kit v3.2.2" (22 kemunculan `v3.2.2`) padahal produknya v4.0.0.
- **`<html lang="en">`** padahal UI berbahasa Indonesia; ubah ke `lang="id"`.
- **Kelas Tailwind tidak valid**: `py-0.2` dan `px-0.2` (41 kali) tidak dikenal sehingga padding badge hilang.
- **Jargon internal** di footer dan banner ("Anti-Ekstrapolasi Jam: Fix X1 Aktif", "Invarian I1", "Kasus A/B/C/D", `(@eko)`); ganti dengan bahasa tugas dan pindahkan istilah teknis ke tooltip atau Panduan.
- **Label zona waktu keras**: `TaskClaimBanner` menempelkan "WIB" pada `toLocaleTimeString('id-ID')` tanpa `timeZone` eksplisit.
- **Pintasan keyboard fisik** (Ctrl+Z, Ctrl+Y, Ctrl+Shift+F) tidak berguna bagi pengguna sentuh; sediakan tombol Undo/Redo.
- **Tidak ada `prefers-reduced-motion`** padahal ada `animate-pulse` dan `animate-bounce`.
- **Tidak ada `aria-live`**: toast, status simpan, dan banner offline tidak diumumkan ke pembaca layar.
- **Tab tumpang tindih**: `templates` dan `workspace-reader` merender komponen yang sama; `prompt-engine` dan `runtime-engine` sama-sama `ContextPackTab`; `recovery` adalah `CommandHubTab`. "18 tab" setara sekitar 13 layar unik.
- **Fallback `'TASK-013'`** di `App.tsx` ter-hardcode; pakai task READY pertama atau pilihan kosong.
- **Manifest**: tambahkan `lang`, `categories`, `screenshots`, dan ikon `monochrome` untuk Android 13+.

### Keterbatasan bukti

- Folder `public/icons/` tidak ada di bundel, jadi kelengkapan ikon tidak bisa diverifikasi.
- `vite-session-sync.ts` diimpor `vite.config.ts` tetapi tidak ikut bundel, sehingga bundel tidak bisa di-build apa adanya.
- Live Disk Sync memanggil `/api/session-state` yang hanya ada di dev server; pada build PWA statis, lencana "Offline" / "Live Bridge" kemungkinan selalu mati.
- `src/tests/touchTarget.test.ts` yang dirujuk `DEVICE_AUDIT.md` tidak ada di bundel. Bila isinya hanya pemindaian string kelas CSS, kolom "ukuran terukur" di tabel audit itu asersi, bukan pengukuran.
- Skor Efisiensi tidak memakai angka profiling nyata (ukuran bundle, heap, TTI).

## 4. Rencana tindakan (sub-task backlog)

Kerjakan UX-01 sampai UX-03 lebih dulu karena memblokir rilis, lalu UX-07, UX-09, UX-10 untuk integritas data dan akuntabilitas. Estimasi total sekitar 13 hari kerja.

| ID | Prioritas | Sub-task | Berkas utama | Kriteria selesai | Estimasi (hari) |
| --- | --- | --- | --- | --- | --- |
| UX-01 | P0 | Hook `useKeyboardAwareFocus` dan footer aksi sticky yang sadar `--keyboard-height` di semua form dan modal | `MobileLayout.tsx`, `index.css`, modal mobile | Uji manual Gboard potret dan lanskap: textarea fokus dan tombol Simpan selalu terlihat | 1-1,5 |
| UX-02 | P0 | Komponen `DraftTextarea`; pasang di Result Capture, Paste-Back, Handover, edit log, Conflict wizard | `useAutoDraftCache.ts`, 6 komponen mobile | Tutup paksa app saat mengetik lalu buka: teks pulih di semua alur | 1,5 |
| UX-03 | P0 | Precache toleran, navigasi cache-first/timeout, prompt pembaruan SW, ikon ikut deploy | `sw.js`, `sw-register.ts`, `main.tsx` | Mode Pesawat dari instalasi baru memuat shell; toast update muncul saat SW baru | 1 |
| UX-04 | P1 | `IconButton` dan `Select` bersama minimal 44 px, plus lint untuk `<button>` tanpa kelas sentuh | `index.css`, komponen mobile | 0 kontrol interaktif di bawah 44 px; pengukuran DevTools lolos | 1 |
| UX-05 | P1 | Skala tipografi: lantai 12 px (info) dan 14 px (form) | seluruh komponen | 0 `text-[9px]` / `text-[10px]` pada teks informatif | 1 |
| UX-06 | P1 | `ConfirmDialog` dan `Toast` bersama (focus trap, Escape, `aria-live`); ganti semua `confirm`/`alert` | modal, `TaskClaimBanner`, `MemberWorkLogSection` | 0 pemanggilan `confirm(` / `alert(` tersisa | 1,5 |
| UX-07 | P1 | Proteksi klaim milik orang lain; hentikan auto-claim senyap | `TaskClaimBanner.tsx`, `taskClaimManager.ts` | Mutasi butuh konfirmasi ambil alih bila bukan pemegang; log mencatat aktor asli | 0,5 |
| UX-08 | P1 | `React.lazy` per tab dengan skeleton | `App.tsx`, `vite.config.ts` | Ukuran chunk awal turun terukur (catat sebelum dan sesudah); TTI diukur di perangkat | 1 |
| UX-09 | P1 | Tangani `QuotaExceededError`, banner gagal simpan, ekspor cadangan | `useSessionPersistence.ts`, `useAutoDraftCache.ts` | Simulasi kuota penuh menampilkan status merah, bukan "tersimpan" | 0,5 |
| UX-10 | P1 | Perbaiki fallback salin: panel teks terseleksi | `OneTapCopyButton.tsx` | Bila Clipboard API dan `execCommand` gagal, teks tampil dan terseleksi | 0,5 |
| UX-11 | P1 | Tata ulang banner status di bawah header (satu tumpukan, tinggi dinamis) | `MobileLayout.tsx`, `Header.tsx` | Banner offline dan install tidak pernah tertutup atau tumpang tindih | 0,5 |
| UX-12 | P2 | Seragamkan identitas dan versi; `lang="id"`; satu sumber versi dari `package.json` | `index.html`, manifest, `App.tsx` | Satu nama produk dan satu versi di semua tempat | 0,25 |
| UX-13 | P2 | Perbaiki kelas `py-0.2` / `px-0.2` dan tambahkan lint Tailwind | 41 lokasi | 0 kelas tidak valid | 0,25 |
| UX-14 | P2 | Bahasakan ulang jargon; tooltip istilah ZLCE | footer, banner, kartu klaim | Uji baca oleh 2 anggota non-teknis tanpa bantuan | 0,5 |
| UX-15 | P2 | `prefers-reduced-motion`, `aria-live`, tombol Undo/Redo sentuh | `index.css`, `App.tsx`, `Header.tsx` | Animasi mati saat preferensi aktif; status simpan diumumkan | 0,5 |
| UX-16 | P2 | Konsolidasi tab duplikat di navigasi | `Header.tsx`, `App.tsx` | Nav menampilkan layar unik; alias lama tetap jalan lewat `?tab=` | 0,5 |
| UX-17 | P2 | Uji perangkat nyata di SM-T225 lewat Chrome remote debugging: target sentuh, memori, TTI | `DEVICE_AUDIT.md`, skrip uji | Laporan angka nyata menggantikan tabel asersi | 1 |

Setelah P0 serta UX-07, UX-09, UX-10 selesai, skor diperkirakan naik ke kisaran 80-an. Keputusan bisa menjadi READY FOR PRODUCTION bila UX-17 mengonfirmasi hasilnya di perangkat nyata.
