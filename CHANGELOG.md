# Catatan Perubahan (Changelog)

Semua perubahan penting pada proyek **ZLCE (Zero-Loss Context Engineering)** didokumentasikan di sini. Format mengikuti prinsip [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

## [4.1.1] - 2026-11-13

### Diubah & Disederhanakan (FASE 21: Single Source of Truth & Optimasi Repo/PWA)
- **TASK-130 (`TC-P21-01`)**: Menghapus 4 komponen legacy yatim pasca-FASE 19 (`src/components/PersistentSidebar.tsx`, `RuntimeEngineTab.tsx`, `PromptEngineTab.tsx`, `RecoveryTab.tsx`), memperbarui generator bundel (`create-audit-bundle.py`, `create-pwa-review-bundle.py`), menyelaraskan referensi komponen 6-tab pada `offlineOperation.test.ts`, `universalDraftCache.test.ts`, dan `TestHarnessTab.tsx`, serta mendaftarkan `FASE 21` (`TASK-130` s/d `TASK-134`) ke `TASKS.md`, `SESSION_STATE.md`, `src/data/taskPhases.ts`, dan `dashboardPhaseFilter.test.ts`. Disetujui oleh: Acimau.
- **TASK-131 (`TC-P21-02`)**: Menghapus duplikat identik `ZLCEv3.2.2-main_56612ab6.zip` dan `bun.lock` (lockfile tunggal `package-lock.json`), memindahkan 8 laporan historis pasif dari `public/assets/aistudio/` ke `docs/archive/reports/`, serta menambahkan `scripts/create-starter-kit-bundle.py` untuk menghasilkan `public/assets/zlce-starter-kit-v4.1.0.zip` dan memperbarui tautan unduh di `TemplatesTab.tsx` & `LandingWizardTab.tsx`. Disetujui oleh: Acimau.
- **TASK-132 (`TC-P21-03`)**: Memperluas `scripts/sync-assets.mjs` untuk sinkronisasi penuh satu arah 22 sumber kanonik -> 25 berkas target (`scripts/zlce/` & `zlce-starter-kit/`: skrip CLI, `templates/`, `examples/`, `prompts`, `.gitignore`, `scripts/README.md`) serta menambahkan generator `--single-kit`; menghapus duplikat statis `ZLCE_KIT_SINGLE.md` di root & `zlce-starter-kit/` (~78 KB), menyintesisnya secara dinamis di dalam `create-starter-kit-bundle.py` (28 berkas, `66.1 KB`), serta memperbarui `run-tests.py` Step 4, 3 generator bundel, `README.md`, `docs/USAGE.md`, dan `zlce-starter-kit/README.md`. Disetujui oleh: Acimau.
- **TASK-133 (`TC-P21-04`)**: Memindahkan output 4 generator bundel ZIP audit/review (`create-audit-bundle.py`, `create-pwa-review-bundle.py`, `create-claude-bundle.py`, `create-lmk-bundle.py`) dari `public/assets/` ke `release-bundles/` (~2.2 MB) dan membersihkan berkas ZIP lama di `public/assets/` sehingga `public/assets/` menyusut ke `133 KB` dan `dist/` produksi menjadi `2.5 MB`; memperbarui `vite-session-sync.ts`, `FeedbackReviewTab.tsx`, `TutorialTab.tsx`, `fileExport.ts`, `auditPromptGenerator.ts`, `pwaReviewPrompt.test.ts`, `run-tests.py` Step 33 & 73, `.gitignore`, `package.json` (`npm run bundles`), `README.md`, dan `PRODUCTION_OPERATIONS.md`. Disetujui oleh: Acimau.
- **TASK-134 (`TC-P21-FIN`)**: Merefaktor `src/components/TutorialTab.tsx` (177 KB -> 76 KB; chunk `dist/assets/TutorialTab-*.js` turun dari `221.19 kB` ke `76.06 kB` / gzip `12.26 kB`, total `dist/` `2.3 MB`) agar seluruh panduan dirender langsung dari berkas Markdown kanonik (`INSTALLATION_ANDROID.md`, `USAGE_MOBILE.md`, `MOBILE_BLUEPRINT.md`, `PRODUCTION_OPERATIONS.md`, `TERMUX_SETUP.md`, `docs/USAGE.md`, `LANDING_PROMPT.md`, `HANDOVER_PROMPT.md`, `AI_WORKFLOW.md`) via `src/data/templates.ts`; memperluas `documentationParity.test.ts` Check 9 (Single Source of Truth) dan menyelaraskan `MOBILE_BLUEPRINT.md`, `README.md`, `docs/README.md`, `blueprintParity.test.ts`, `dashboardPhaseFilter.test.ts`, `DashboardTab.tsx`, serta `auditPromptGenerator.ts` ke 134 task (Fase 0–21). Disetujui oleh: Oned.

## [4.1.0] - 2026-11-13

### Ditambahkan & Diselaraskan
- **FASE 20: Penyelarasan Penuh Berkas Kontrol ZLCE (Mode FULL & LITE), Arsip Audit, Paritas Dokumentasi & Bundel v4.1.0 GA (TASK-125 s/d TASK-129)**:
  - **TASK-125 (`TC-P20-01`)**: Menambahkan `/AI_WORKFLOW.md` (10 bagian kanonik disesuaikan untuk `ZLCE Mobile Workbench v4.1.0 GA` / `ZLCEv4.1Mob`) dan `/HANDOVER.md` (salinan verbatim dari blok prompt `HANDOVER_PROMPT.md`). Disetujui oleh: Eko.
  - **TASK-126 (`TC-P20-02`)**: Melengkapi 5 indeks kendali Mode FULL di root (`/BLUEPRINT.md`, `/ARCHITECTURE.md`, `/DATA_MODEL.md`, `/TESTING.md`, `/CHECKLISTS.md`) dan memperbaiki kelengkapan Mode LITE 4 berkas pada `zlce-starter-kit/` (`BLUEPRINT.md` §7–§8, `HANDOVER.md`, `README.md`, `SESSION_STATE.md`, `TASKS.md`, serta `scripts/sync-assets.mjs` 10 target). Disetujui oleh: Eko.
  - **TASK-127 (`TC-P20-03`)**: Menambahkan `FASE 17` (`TASK-107` s/d `TASK-111`) ke peta fase `TASKS.md` §1, menormalisasi slot revisi §5 `SESSION_STATE.md` menjadi `TASK-REV-01` s/d `TASK-REV-04`, dan mengarsipkan 62 entri log historis (`P2-CP1` s/d `TASK-118` / Fase 0–18) ke `docs/archive/AUDIT_LOG_FASE_0_TO_18.md`. Disetujui oleh: Eko.
  - **TASK-128 (`TC-P20-04`)**: Menyelaraskan dokumentasi utama (`README.md`, `docs/README.md`, `docs/mobile/MOBILE_BLUEPRINT.md`, `CLAUDE_CHATGPT_HANDOVER.md`), katalog & komponen UI (`src/data/taskPhases.ts`, `src/data/templates.ts`, `src/components/TutorialTab.tsx`, `src/components/DashboardTab.tsx`, `src/utils/auditPromptGenerator.ts`), serta suite uji paritas (`src/tests/blueprintParity.test.ts`, `src/tests/dashboardPhaseFilter.test.ts`) ke status aktual v4.1.0 GA (129 task, Fase 0–20, 6 tab kanonik). Disetujui oleh: Acimau.
  - **TASK-129 (`TC-P20-FIN`)**: Mengonsolidasikan arsip 13 komponen pra-FASE 19 di `/archive/components/README.md` (`v4.1.0 GA` / `ZLCEv4.1Mob`), menghapus folder kosong `/src/archive/`, memperbarui 4 generator bundel ZIP (`create-audit-bundle.py`, `create-pwa-review-bundle.py`, `create-claude-bundle.py`, `create-lmk-bundle.py`) dengan `SHA256SUMS.txt` deterministik, memperluas `scripts/run-tests.py` Step 4 (10 target `sync-assets.mjs`) & Step 73 (`TC-P20-FIN`), serta menuntaskan verifikasi penuh rilis v4.1.0 GA. Disetujui oleh: Acimau.

## [4.0.0-phase19] - 2026-11-13

### Diubah & Dikonsolidasikan
- **FASE 19: Penyederhanaan Frontend PWA Menjadi Dashboard Teknis Ringkas (TASK-119 s/d TASK-124)**:
  - **TASK-119 (`TC-P19-01`)**: Mengarsipkan 13 komponen asli ke `archive/components/` (serta catatan indeks `src/archive/components/README.md`) dan mengecualikan `archive` di `tsconfig.json`.
  - **TASK-120 (`TC-P19-02`)**: Merestrukturisasi tipe `TabType` (`CanonicalTabType` 6-tab + alias kompatibel) di `src/types/zlce.ts` dan menyederhanakan `src/components/Header.tsx` menjadi 6 tab kanonik ringkas ramah sentuh (`Dashboard`, `SESSION_STATE & WAL`, `AI Workbench`, `Terminal & Git`, `Diagnostik & Kualitas`, `Dokumentasi & Panduan`).
  - **TASK-121 (`TC-P19-03`)**: Mengonsolidasikan alur kerja AI (`ContextPackTab`, `ResultCaptureTab`, `AiHandoverWizard`, `FeedbackReviewTab`) ke dalam `src/components/mobile/AiWorkbenchTab.tsx` dengan sub-segmen 4 langkah berurutan dan sinkronisasi rute `?tab=`.
  - **TASK-122 (`TC-P19-04`)**: Mengonsolidasikan `CommandHubTab`, `GitSyncTab`, `RecoveryCommandSection` (Kasus A–D), dan `SecurityAuthTab` (`Clean-Auth`) ke dalam `src/components/mobile/TerminalGitTab.tsx`.
  - **TASK-123 (`TC-P19-05`)**: Meredesain `src/components/DashboardTab.tsx` menjadi dasbor teknis berdensitas tinggi tanpa gradien dekoratif maupun animasi ping kosmetik, mempertahankan akses 1-ketuk task aktif, Smart Task Check, Live Bridge status, dan matriks backlog dinamis.
  - **TASK-124 (`TC-P19-FIN`)**: Membangun `src/components/DiagnosticsTab.tsx` (`Test Harness`, `Triase Revisi S/M/L`, `Audit Performa PWA`) dan `src/components/DocsReferenceTab.tsx` (`WorkspaceReader`, `Panduan 10 Langkah`, `TemplatesTab` + `ZLCE_KIT_SINGLE.md`), menyatukan sub-tampilan `Riwayat & Log` (`SessionTimelineTab`) di `SessionStateTab.tsx`, memulihkan paritas lazy pre-warming & build Vite, mendaftarkan berkas baru ke generator bundel rilis (`scripts/create-audit-bundle.py`, `scripts/create-pwa-review-bundle.py`), dan merekonsiliasi suite uji `src/tests/uiPolishing.test.ts`, `src/tests/physicalTelemetryAndQuality.test.ts`, dan `src/tests/performanceAudit.test.ts`.
  - Disetujui resmi oleh: Oned (Frontend & Mobile UI Specialist).

## [4.0.0-phase18] - 2026-11-11

### Ditambahkan
- **Perumusan FASE 18: Remediasi Hasil Review Frontend PWA Ulang (11 Nov 2026) & Penyeragaman Identitas Rilis (ZLCEv4Mobile) [R-01 s.d. R-12]**:
  - Menerjemahkan 12 usulan tindakan ulasan ulang (`Skor_dan_Usulan_Review_ZLCE_v4.0.0_GA_8bd021f7.md`) ke dalam backlog terstruktur di `TASKS.md` dan `SESSION_STATE.md`: `TASK-112` s/d `TASK-117`.
  - Mendaftarkan slot revisi aktif `REV-AUD-05` di `SESSION_STATE.md`.
- **TASK-112 (R-06 / REV-ID-01)**: **Penyeragaman Identitas Proyek & PWA: "ZLCE Mobile Workbench v4.0.0" & "ZLCEv4Mobile"**:
  - Menetapkan nama produk kanonik "ZLCE Mobile Workbench v4.0.0" dan nama pendek/identitas "ZLCEv4Mobile" di seluruh dokumen Markdown kendali (`SESSION_STATE.md`, `TASKS.md`, `README.md`, `docs/mobile/MOBILE_BLUEPRINT.md`).
  - Menyelaraskan Web App Manifest `public/manifest.webmanifest` (`name: "ZLCE Mobile Workbench v4.0.0"`, `short_name: "ZLCEv4Mobile"`).
  - Menyelaraskan HTML shell `index.html` (`<title>ZLCEv4Mobile - ZLCE Mobile Workbench v4.0.0</title>`, `apple-mobile-web-app-title="ZLCEv4Mobile"`, deskripsi, OpenGraph, dan critical splash screen).
  - Memperbarui antarmuka pengguna: footer `src/App.tsx`, logo brand `src/components/Header.tsx`, badge versi dan snippet `src/components/PersistentSidebar.tsx`, serta default kit version `src/components/TestHarnessTab.tsx` (membersihkan sisa "v3.2.2").
  - Memperbarui pengujian otomatis `src/tests/blueprintParity.test.ts` (TC-P17-01/TC-P18-01, 5/5 checks PASS).
  - Disetujui resmi oleh: Sulistiyani (PWA & Offline Architect).
- **TASK-113 (R-01 / P0-01)**: **Integritas Ikon PWA & Cek Pasca-Build Caching Offline**:
  - Memverifikasi keberadaan dan integritas biner seluruh 4 ikon PWA di `public/icons/` (`icon-192x192.png`, `icon-512x512.png`, `icon-512x512-maskable.png`, `apple-touch-icon.png`) dengan signature PNG valid dan dimensi tepat.
  - Membangun suite uji mandiri `src/tests/pwaIconsIntegrity.test.ts` (TC-P18-02, 6/6 checks PASS) yang memvalidasi header PNG, Web App Manifest W3C, header HTML `index.html`, Service Worker precache & cache-first `public/sw.js`, integritas pasca-build `dist/icons/` dengan SHA-256 identik (0 kesalahan 404), dan 100% kriteria Lighthouse PWA Installable.
  - Menambahkan script `"test:icons": "npx tsx src/tests/pwaIconsIntegrity.test.ts"` di `package.json`.
  - Mendaftarkan Step 67 (`TC-P18-01`) dan Step 68 (`TC-P18-02`) pada `scripts/run-tests.py`.
  - Mendaftarkan aset ikon dan modul uji pada generator bundel `scripts/create-audit-bundle.py` dan `scripts/create-pwa-review-bundle.py`.
  - Disetujui resmi oleh: Sulistiyani (PWA & Offline Architect).
- **TASK-114 (R-02 / P1-01)**: **Komponen ModalShell Bersama & Focus Trap Aksesibel**:
  - Membangun komponen bersama `src/components/mobile/ModalShell.tsx` dengan kepatuhan semantik W3C ARIA (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`).
  - Mengimplementasikan focus trap aksesibel (menjebak navigasi Tab dan Shift+Tab secara sirkular di dalam modal, memfokuskan elemen interaktif pertama pada saat terbuka, dan mengembalikan fokus aktif ke elemen pemanggil saat modal ditutup).
  - Menangani listener global keyboard Escape (`keydown` -> `onClose`), penutupan melalui klik backdrop (dapat dikonfigurasi melalui prop `closeOnBackdropClick`), tombol tutup berskala sentuh tablet minimal 44x44px (`touch-target-44 min-w-[44px] min-h-[44px]`), dan pembatasan viewport responsif (`max-h-[92vh]` / `max-h-[85vh]` overflow auto).
  - Memigrasikan seluruh 5 dialog modal kritis: `PasteBackModal.tsx`, `GateApprovalModal.tsx`, `DeviceHandoverModal.tsx`, `TeamRegistryModal.tsx`, serta dialog modal Smart Task Check dan Sinkronisasi GitHub pada `DashboardTab.tsx`.
  - Memperbarui pengujian aksesibilitas otomatis `src/tests/accessibleDialogs.test.ts` (TC-P18-03, 7/7 checks PASS) memvalidasi fokus trap, penanganan Escape, dan migrasi modal.
  - Mendaftarkan `ModalShell.tsx` pada generator bundel `scripts/create-audit-bundle.py` dan `scripts/create-pwa-review-bundle.py`.
  - Mendaftarkan Step 69 (`TC-P18-03`) pada runner master `scripts/run-tests.py`.
  - Disetujui resmi oleh: Oned (Frontend & Mobile UI Specialist).
- **TASK-115 (R-03 / P1-02)**: **Ekspansi Universal DraftTextarea ke Seluruh Form Kritis**:
  - Menggantikan 100% elemen `<textarea>` mentah yang tersisa pada seluruh 6 modul formulir kritis dengan komponen `DraftTextarea`:
    1. `src/components/DashboardTab.tsx`: Input bukti verifikasi pada modal *Smart Task Check (Docs Impact Verification Gate)* (`zlce_smart_check_evidence_draft`).
    2. `src/components/mobile/TaskClaimBanner.tsx`: Input alasan pengambilalihan task antar-anggota tim (`zlce_task_takeover_reason_draft`).
    3. `src/components/mobile/DeviceHandoverModal.tsx`: Input catatan serah terima fisik tablet antar-anggota (`zlce_device_handover_notes_draft`).
    4. `src/components/PromptEngineTab.tsx`: Input skema output (`zlce_prompt_output_schema_draft`), aturan batas/edge cases (`zlce_prompt_edge_case_rules_draft`), konteks verbatim (`zlce_prompt_verbatim_context_draft`), dan sampel output mentah (`zlce_prompt_sample_output_draft`).
    5. `src/components/mobile/PromptStudio.tsx`: Input instruksi khusus / edge case tambahan (`zlce_prompt_studio_custom_directives_draft`).
    6. `src/components/RecoveryTab.tsx`: Seluruh area input data pemulihan (git status short, diff, git log -5, WAL, dan snapshot text).
  - Melindungi seluruh pengetikan teks panjang dari terminasi mendadak Android Low Memory Killer (LMK) dengan debounce 400ms dan synchronous lifecycle flush (`visibilitychange` / `pagehide`).
  - Menegakkan *Zero-Secret Persistence Gate* secara fail-closed pada seluruh 12 alur penyimpanan kunci draft scoped per anggota tim aktif.
  - Memperluas suite uji otomatis `src/tests/universalDraftCache.test.ts` (TC-P18-04, 7/7 checks PASS) yang memvalidasi namespace multi-user, persistensi 400ms, lifecycle flush, transparent restore, pemblokiran plaintext secret token, ketiadaan textarea mentah pada 6 formulir, dan LMK round-trip recovery `restore(persist(x)) === x`.
  - Mendaftarkan Step 70 (`TC-P18-04`) pada runner master `scripts/run-tests.py`.
  - Disetujui resmi oleh: Oned (Frontend & Mobile UI Specialist).
- **TASK-116 (R-09 / UX-02 / FE-001)**: **Dinamisasi Filter & Pemetaan Fase Lengkap (Fase 0 s/d 18) di Seluruh UI Dashboard & Komponen Terkait**:
  - Mengatasi masalah keterbatasan filter fase di `DashboardTab.tsx` yang sebelumnya hanya menampilkan Fase 0 hingga Fase 8 (katalog statis 43 task awal).
  - Mengekstrak definisi katalog tipe dan 19 fase lengkap (`fase-0` s/d `fase-18` serta opsi `all`, task 1 s/d 999) ke modul terisolasi `src/data/taskPhases.ts`.
  - Memperbarui `src/components/DashboardTab.tsx`:
    - Menambahkan dropdown `<select>` fase cepat (Quick Jump) ramah tablet berdampingan dengan tab horizontal sentuh, mempermudah navigasi langsung ke fase 9 s/d 18.
    - Mendinamisasikan kartu metrik progres: `{TASK_PHASES.length - 1} Fase Eksekusi` (19 Fase) dan penghitungan dinamis `{completedPhasesCount} dari {TASK_PHASES.length - 1} Fase Selesai`.
    - Mendinamisasikan judul matriks backlog: `Matriks Backlog {stateData.tasks.length} Task Atomik (Fase 0 s/d {TASK_PHASES.length - 1})`.
  - Menyelaraskan teks paritas dan deskripsi roadmap:
    - `src/components/TutorialTab.tsx`: Memperbarui deskripsi roadmap menjadi `Peta jalan bertahap Fase 0 hingga Fase 18 (118 task tuntas terverifikasi)`.
    - `src/data/templates.ts`: Memperbarui judul dan deskripsi template `TASKS.md` kanonik menjadi `118 Task (Fase 0 s/d 18)`.
  - Menyesuaikan antrean backlog resmi:
    - Merumuskan solusi masalah filter menjadi `TASK-116` (Dinamisasi Filter & Pemetaan Fase Lengkap).
    - Memundurkan antrean task berikutnya secara rapi: `TASK-117` (Dynamic Stack Banner --header-h, Tipografi Bersih & Refaktor Jargon UI) dan `TASK-118` (Penyelarasan Status Live Bridge, Manifest PWA & Rekonsiliasi Bundel Rilis).
  - Membangun test suite otomatis mandiri `src/tests/dashboardPhaseFilter.test.ts` (TC-P18-05, 5/5 checks PASS) yang memverifikasi 19 fase lengkap, jangkauan nomor task tanpa celah (gapless 1..999), akurasi filter task per fase, serta kehadiran elemen UI dinamis.
  - Memperbarui generator bundel `scripts/create-audit-bundle.py` dan `scripts/create-pwa-review-bundle.py` serta mendaftarkan Step 71 (`TC-P18-05`) pada runner master `scripts/run-tests.py`.
  - Seluruh 72 checks pada `scripts/run-tests.py` lulus 100% dan `scripts/zlce-check.py` mengonfirmasi 118 task (0 error, 0 warning).
  - Disetujui resmi oleh: Oned (Frontend & Mobile UI Specialist).
- **TASK-117 (R-04 / R-05 / R-07 / UX-POLISH)**: **Dynamic Stack Banner `--header-h`, Tipografi Bersih & Refaktor Jargon UI**:
  - Mengintegrasikan `ResizeObserver` pada `src/components/Header.tsx` yang secara reaktif mengukur tinggi aktual header (navigasi multi-baris pada tablet) dan menetapkan variabel CSS `--header-h` pada `:root` document element.
  - Mengatur `z-index` header menjadi `z-50` (`sticky top-0 z-50`), menata ulang urutan layout di `src/App.tsx` agar Header ditempatkan tepat sebelum `MobileLayout`, serta mengonfigurasi fallback top `var(--header-h, 116px)` di container stack banner `src/components/mobile/MobileLayout.tsx` sehingga tumpukan banner peringatan/offline tidak pernah menutupi bilah navigasi tab atau mengintersepsi event klik pointer.
  - Menetapkan lantai skala tipografi tablet (Strict Typography Floor >=12px) dengan membersihkan total 232 kemunculan kelas font mikro informatif (`text-[9px]` dan `text-[10px]`) di seluruh 48 berkas komponen menjadi kelas standar Tailwind `text-xs` (12px).
  - Membahasakan ulang istilah teknis internal dan jargon kriptik ("Fix X1", "Invarian I1-I5", "Strict Provenance", "Anti-Ekstrapolasi") menjadi kalimat operasional bahasa Indonesia yang lugas dan ramah pengguna ("Preservasi Waktu Asli: Aktif (Tanpa Rekaan)", "Standar Integritas ZLCE", "Atribusi Sumber Otentik", "Kemandirian Sesi Baru") pada antarmuka utama.
  - Membangun test suite otomatis mandiri `src/tests/layoutHeaderBannerStack.test.ts` (TC-P18-06, 5/5 checks PASS) yang memverifikasi arsitektur header dinamis, fallback top banner, 0 sisa teks informatif sub-12px, pembersihan jargon UI, dan integritas 5 komponen mobile.
  - Mendaftarkan Step 72 (`TC-P18-06`) pada runner master `scripts/run-tests.py`, menambahkan `layoutHeaderBannerStack.test.ts` pada generator bundel `scripts/create-audit-bundle.py` dan `scripts/create-pwa-review-bundle.py`.
  - Disetujui resmi oleh: Oned (Frontend & Mobile UI Specialist).
- **TASK-118 (R-08 / R-10 / R-11 / R-12 / FIN-002)**: **Penyelarasan Status Live Bridge, Manifest PWA & Rekonsiliasi Bundel Rilis**:
  - Penanganan Status Live Bridge Mulus di Mode Statis PWA (`src/hooks/useSessionPersistence.ts`, `src/components/DashboardTab.tsx`, `src/components/Header.tsx`):
    - Mendeteksi respon HTTP 404 pada inisialisasi `/api/session-state` dan mengisolasi SSE watch (`/api/session-state/watch`) serta background polling berkala hanya jika endpoint backend aktif (`res.ok`).
    - Menghilangkan 100% banjir kesalahan console 404 berkala di hosting statis PWA murni tanpa server bridge.
    - Menampilkan status transparan `"Live Bridge tidak aktif (Mode Statis PWA)"` pada badge navigasi header dan kartu pemulihan dashboard dengan jaminan Zero-Loss Cache lokal.
  - Eliminasi Fallback Literal & Penyelarasan Waktu WIB:
    - Menghapus 100% fallback kode literal statis `'TASK-013'` di `DashboardTab.tsx`, `App.tsx`, dan `ContextPackTab.tsx` menjadi deteksi dinamis berbasis status antrean task aktif (`READY`/aktif).
    - Menyeragamkan format lokal waktu Indonesia Barat `{ timeZone: 'Asia/Jakarta' }` + `' WIB'` pada `DashboardTab.tsx` dan `TaskClaimBanner.tsx`.
    - Melengkapi blok `catch {}` kosong pada `useSessionPersistence.ts`, `AiHandoverWizard.tsx`, `ResultCaptureTab.tsx`, dan `TutorialTab.tsx` dengan pencatatan edukatif.
  - Penyempurnaan Metadata Web App Manifest & Aksesibilitas Banner (`public/manifest.webmanifest`, `src/components/mobile/MobileLayout.tsx`):
    - Melengkapi manifest dengan atribut W3C kanonik: `"lang": "id"`, `"dir": "ltr"`, `"categories": ["development", "productivity", "utilities"]`, `"prefer_related_applications": false`, dan entri `"screenshots"` representatif untuk tablet dan seluler.
    - Menambahkan semantik ARIA `role="alert"` (`aria-live="assertive"`) pada Quota Banner, `role="status"` (`aria-live="polite"`) pada Service Worker & Offline Banner, serta pembatas timer 4 detik auto-stop untuk animasi banner agar ramah daya dan lulus uji Lighthouse PWA.
  - Rekonsiliasi Generator Bundel Review & Ekspor POSIX (`scripts/create-pwa-review-bundle.py`, `scripts/create-audit-bundle.py`):
    - Mendaftarkan seluruh 34 modul test di `src/tests/` dan seluruh skrip utilitas di `scripts/` (termasuk `scripts/zlce/`) ke dalam `zlce-pwa-frontend-review-bundle.zip` (190 berkas, 793 KB, 0 broken import, 100% self-contained).
    - Menerapkan normalisasi permission bit POSIX `0755` untuk seluruh skrip bash/python eksekutabel.
  - Membangun asersi uji otomatis `TC-P18-FIN` pada `scripts/run-tests.py` (73/73 checks PASS 100%).
  - Memverifikasi audit keamanan `scripts/security-audit.sh` (0 leaks) dan validasi kanonik `scripts/zlce-check.py` (118 task terdaftar, 0 error, 0 warning).
  - Disetujui resmi oleh: Oned (Frontend & Mobile UI Specialist).

## [4.0.0-phase17] - 2026-11-11

### Ditambahkan
- **Smart Task Check (Docs Impact Verification Gate)**:
  - Membangun mesin validasi murni `src/utils/smartTaskCheck.ts` untuk memverifikasi bukti pengerjaan seluruh dokumen pada `Docs Impact` sebelum status task dapat diubah menjadi `DONE`.
  - Mengintegrasikan modal verifikasi interaktif `Smart Task Check: Selesaikan Task` di `src/components/DashboardTab.tsx` lengkap dengan checklist dokumen terdampak, indikator validasi real-time (minimal 5 karakter, anti-placeholder), tombol *Centang Semua* & *Auto-Isi Rekomendasi Bukti*, serta pencegahan bypass status melalui dropdown status `<select>`.
  - Menampilkan badge visual status `Smart Check OK` / `Smart Check` dan penghitung dokumen terdampak pada setiap baris task dan kartu sorotan aktif.
  - Membangun test suite mandiri `src/tests/smartTaskCheck.test.ts` (5/5 checks PASS).
  - Mendaftarkan modul dan tes baru pada `scripts/create-audit-bundle.py` dan `scripts/create-pwa-review-bundle.py` (240 berkas & 138 berkas, 0 broken import, 100% self-contained).
- **TASK-107 (AUD4-009 / UX-12 / DOC-001)**: **Rekonsiliasi 14 Blueprint As-Built & Identitas Rilis Kanonik**.
  - Memperbarui status seluruh 14 dokumen cetak biru di `docs/mobile/blueprint/01_*.md` s.d. `14_*.md` dari `DRAFT BLUEPRINT` menjadi `APPROVED / AS-BUILT`.
  - Merekonsiliasi total 111 task di `docs/mobile/MOBILE_BLUEPRINT.md` (mencakup Fase 14 s.d. Fase 17), `TASKS.md`, dan `SESSION_STATE.md`.
  - Mengubah atribut bahasa dokumen `index.html` dari `lang="en"` menjadi `lang="id"` dan menyinkronkan `apple-mobile-web-app-title`.
  - Menyeragamkan nama produk menjadi "ZLCE Mobile Workbench v4.0.0 GA" pada `public/manifest.webmanifest`.
  - Membangun unit test otomatis `src/tests/blueprintParity.test.ts` (TC-P17-01, 5/5 checks PASS).
  - Mengintegrasikan Step 63 pada runner uji otomatis `scripts/run-tests.py` (63/63 checks PASS, 100% OK).
- **TASK-108 (UX-13 s/d UX-16 / UI-003)**: **Polishing CSS Tailwind, Jargon Clarity, Reduced Motion & Nav**.
  - Mengoreksi seluruh 38 lokasi pemakaian kelas CSS Tailwind tidak valid `py-0.2` dan `px-0.2` di 16 berkas komponen menjadi `py-0.5` dan `px-0.5`.
  - Mengganti istilah jargon kriptik pada badge navigasi Header menjadi bahasa operasional komunikatif: `Bukti`, `Estafet`, `CLI`, `Repo`, `Review`.
  - Menambahkan dukungan aksesibilitas `@media (prefers-reduced-motion: reduce)` pada `src/index.css` untuk menonaktifkan animasi bagi pengguna dengan preferensi reduced motion.
  - Menambahkan kontrol tombol sentuh Undo dan Redo berukuran ergonomis minimal 44x44px (`touch-target-44 min-h-[44px] min-w-[44px]`) pada Header.
  - Mengonsolidasikan navigasi alat pendukung menjadi 5 alat rapi di `Header.tsx` dan memasukkan `performance-audit` ke daftar `secondaryTabs`.
  - Membangun unit test otomatis `src/tests/uiPolishing.test.ts` (TC-P17-02, 5/5 checks PASS).
  - Mengintegrasikan Step 64 pada runner uji otomatis `scripts/run-tests.py` (64/64 checks PASS, 100% OK).
- **TASK-109 (AUD4-005 / AUD4-008 / AUD4-011 / QA-001)** *(2026-11-11)*: **Telemetri Pengujian Fisik SM-T225 & Runtime Test Quality**.
  - Merefaktor `scripts/test-lmk-physical.sh` dengan pemisahan proses Target Discovery / `isolated_target_worker`, Independent Monitor (`read_process_telemetry`, `monitor_pid`), dan Subprocess Allocator (`run_allocator_worker`, `allocator_pid`), membaca metrik kernel nyata `/proc/<pid>/smaps_rollup` -> `/proc/<pid>/smaps` -> `/proc/<pid>/status` (`VmRSS`), raw `/proc/<pid>/oom_score_adj`, `/proc/meminfo`, opsional `logcat`/`adb`, serta SHA-256 `recovery_checksum`, `recovery_revision`, `rpo_ms`, timestamp ISO-8601 UTC + WIB, dan `recovery_status=VERIFIED` ke `docs/mobile/physical_lmk_test.log`.
  - Membangun dan mengeksekusi suite browser Chromium Playwright nyata `src/tests/physicalTelemetryAndQuality.test.ts` (`TC-P17-03`, 5/5 checks PASS): synchronous lifecycle flush (`visibilitychange: hidden` / `pagehide`), cold-restart SHA-256 recovery, isolasi multi-context, Zero-Secret persistence gate, navigasi offline Service Worker (dengan background pre-warming 16 lazy chunks saat online di `src/App.tsx`), serta pengukuran computed `getBoundingClientRect()` pada **548 elemen aktif** di viewport SM-T225 `1340x800` & `800x1340` + `DeviceHandoverModal` (0 pelanggaran `< 44px`, 0 horizontal overflow, `--viewport-height` live `800px -> 480px`).
  - Memperbarui `PersistentSidebar.tsx` (`touch-target-44 min-h-[44px]` + `invisible pointer-events-none` & `aria-hidden` saat terlipat) beserta 9 komponen antarmuka (`TokenUsageGauge`, `DraftTextarea`, `DeviceHandoverModal`, `CommandHubTab`, `AiHandoverWizard`, `ContextPackTab`, `ResultCaptureTab`, `WorkspaceEditor`, `WorkspaceReader`), `ActiveMemberSelector.tsx`, dan `useAutoDraftCache.ts`.
  - Menyesuaikan peer dependency `esbuild` (`^0.28.0`) di `package.json`, menambahkan `package-lock.json` (`lockfileVersion: 3`, 15 dependensi langsung) & menyinkronkan `bun.lock` (`npm ci --ignore-scripts --dry-run` exit 0), membundel `package-lock.json` di `scripts/create-audit-bundle.py`, memperbarui `docs/mobile/DEVICE_AUDIT.md`, serta menjalankan Step 65 pada `scripts/run-tests.py` (65/65 checks PASS, 100% OK).
- **TASK-110 (FIN-001)** *(2026-11-11)*: **Rekonsiliasi Master Test Runner, Verifikasi Bundel & Pengesahan Gerbang Rilis GA**.
  - Merekonsiliasi seluruh pengujian `TC-P15-01` s/d `TC-P17-03` dan mengintegrasikan gerbang akhir Step 66 (`TC-P17-FIN`) pada runner utama `scripts/run-tests.py` (66/66 checks PASS, 100% OK).
  - Memperkuat closure import (mendukung `?raw` `.md`, `.js`/`.mjs`, `vite-session-sync.ts`, `bun.lock`, serta seluruh komponen/hooks/template/test harness UI) dan verifikasi digest `SHA256SUMS.txt` fail-closed pada `scripts/create-audit-bundle.py` (237 berkas + manifest, 0 broken import) dan `scripts/create-pwa-review-bundle.py` (menutup 40 relasi import hilang menjadi 135 berkas + manifest, 0 broken import).
  - Mengeksekusi pemindaian keamanan Zero-Secret `scripts/security-audit.sh` (0 kebocoran) dan pemeriksa kanonik ketat `scripts/zlce-check.py . --strict --no-git` (0 error, 0 warning, 111 task).
  - Mencatat pengesahan resmi Gerbang Rilis GA ZLCE Mobile Workbench v4.0.0 oleh seluruh 8 anggota resmi tim estafet (`Eko`, `Oned`, `Cxperia`, `Sulistiyani`, `Layang`, `Acimau`, `Kepek`, `Gete`).
- **TASK-111 (UX-18 / PERF-002)** *(2026-11-11)*: **Tab Diagnostik & Audit Performa PWA di UI Studio (`performance-audit`)**.
  - Membangun mesin evaluasi murni `src/utils/performanceAuditEngine.ts` dengan skor kesiapan 0–100 (Grade A–D), format kuota aman `N/A` saat kapasitas nol, dan generator ringkasan serta laporan Markdown LF.
  - Merefaktor `src/components/mobile/PerformanceAuditTab.tsx` bebas stale-closure, single-elevation dark slate tanpa pill badge, tipografi minimal `12px`, target sentuh `>= 44px`, kartu real-time **Status Jaringan** (`navigator.onLine`, `effectiveType`, `downlink`, `rtt`), **Cache Storage** (`caches.keys()` per bucket + `StorageManager`), **Service Worker** (`controller`, sub-status terpisah `active` / `waiting` / `installing`, handler `Periksa Update` & `Terapkan Update SW`), tombol interaktif **Check Optimization** (5 metrik tablet SM-T225: SW Lifecycle, FCP/DOM Timing, kepatuhan target sentuh 44px+ & `visualViewport`, estimasi heap RAM `< 150 MB`, dan auto-draft listeners + kuota), tombol salin 1-ketuk `OneTapCopyButton`, serta unduh `.md`.
  - Memperbarui eksposur modul di `src/components/mobile/index.ts`, navigasi sekunder `Header.tsx` tanpa badge sub-12px, serta validasi `VALID_TABS` di `src/tests/tabRouting.test.ts` (19 tab).
  - Membangun suite uji runtime Chromium Playwright `src/tests/performanceAudit.test.ts` (`TC-P17-04`, 5/5 checks PASS) dan mengintegrasikannya sebagai Step 66 pada `scripts/run-tests.py` bersama gerbang rilis final Step 67 (`TC-P17-FIN`, 67/67 checks PASS) serta pembaruan kedua bundel ZIP (`238` & `137` berkas + `SHA256SUMS.txt`, 0 broken import).

## [4.0.0-phase16] - 2026-11-08

### Ditambahkan
- **Penuntasan 100% FASE 16: Peningkatan UX P1, Ergonomi Tablet & Integritas Alur Kerja** (`TASK-101` s/d `TASK-106`, AUD4-004, AUD4-010, UX-04 s/d UX-11).
- **TASK-101 (AUD4-004 / UX-07 / FLW-001)**: **Atomic Task Claim Guard & Proteksi Klaim Anggota Lain** pada `src/utils/taskClaimManager.ts` dan `src/components/mobile/TaskClaimBanner.tsx`. Menghilangkan silent claim saat beralih profil anggota, menonaktifkan aksi langsung rilis/selesai bagi non-pemilik klaim, menambahkan modal ambil alih eksplisit dengan alasan minimal 5 karakter yang dicatat di `sessionState.auditLog`, serta pengujian `src/tests/atomicClaimProtection.test.ts` (TC-P16-01, 5/5 PASS).
- **TASK-102 (UX-06 / UI-001)**: **Dialog Konfirmasi & Toast Aksesibel Bersama** (`src/components/mobile/ConfirmDialog.tsx`, `src/components/mobile/ToastContainer.tsx`). Menghilangkan seluruh 15 pemanggilan `confirm()` dan `alert()` bawaan browser yang memblokir main thread di iframe sandboxes, menggantikannya dengan dialog modal `aria-modal="true"` dengan focus trap & penutup tombol Escape, serta toast global non-blocking via custom DOM event `zlce-toast` (TC-P16-02, 5/5 PASS).
- **TASK-103 (UX-04 / UX-05 / ERG-002)**: **Standardisasi Target Sentuh Tablet 44px+ & Skala Tipografi** (`src/components/mobile/IconButton.tsx`, `src/components/mobile/SelectInput.tsx`). Menstandarkan seluruh target sentuh minimal 44x44px (`min-w-[44px] min-h-[44px]`), memperbesar tombol close di `ActiveMemberSelector`, dan menetapkan batas minimum tipografi 12px dengan menghapus kelas sub-12px `text-[9px]` dan `text-[10px]` (TC-P16-03, 5/5 PASS).
- **TASK-104 (UX-08 / PERF-001)**: **Code Splitting Tab dengan React.lazy & Skeleton Loaders** pada `src/App.tsx` dan `src/components/mobile/TabSkeleton.tsx`. Memecah 16 modul tab menjadi impor dinamis `React.lazy` dengan pembungkus `<Suspense fallback={<TabSkeleton />}>` berstatus `role="status"` yang mencegah layout shift dan menjaga heap RAM tetap hemat pada tablet 3GB (TC-P16-04, 5/5 PASS).
- **TASK-105 (UX-09 / UX-10 / UX-11 / UI-002)**: **Penanganan Storage Quota, Fallback Salin & Stack Banner Dinamis** pada `src/hooks/useSessionPersistence.ts`, `src/components/mobile/OneTapCopyButton.tsx`, dan `src/components/mobile/MobileLayout.tsx`. Menangkap galat `QuotaExceededError` (code 22) dengan banner merah darurat dan unduh instan `SESSION_STATE.md`, modal fallback salin manual pada `OneTapCopyButton`, serta tumpukan banner notifikasi rapi tanpa tumpang tindih (TC-P16-05, 5/5 PASS).
- **TASK-106 (AUD4-010 / AI-001)**: **Hard Token Budget Enforcement & Context Pruning** pada `src/utils/tokenBudgetAdapter.ts` dan `src/utils/contextPackGenerator.ts`. Mengimplementasikan `enforceTokenBudgetHardCap()` yang menjamin muatan markdown tidak pernah melebihi batas kuota keras model tujuan (Gemini 1M, GPT 128k, Claude 30k, DeepSeek 64k, Copilot 32k, Cursor 64k, Compact 8k, FreeBuff 4k), disertai indikator peringatan saat penggunaan token mencapai $\ge 95\%$ (TC-P16-06, 5/5 PASS).
- Integrasi Step 57 hingga Step 62 pada runner uji otomatis `scripts/run-tests.py` (62/62 checks PASS, 100% OK).

---

## [4.0.0-phase15] - 2026-11-08

### Ditambahkan
- **Penuntasan 100% FASE 15: Remediasi Kritis P0 & Zero-Secret Persistence Gate** (`TASK-096` s/d `TASK-100`, AUD4-002 s/d AUD4-007, UX-01 s/d UX-03).
- **TASK-096 (AUD4-002 / SEC-001)**: **Zero-Secret Persistence Gate** pada `src/hooks/useAutoDraftCache.ts` dan `WorkspaceEditor.tsx`. Mengubah deteksi token pasif menjadi pemblokiran aktif penulisan plaintext ke storage persisten (`localStorage` / `sessionStorage`), penolakan `isDraftSaved = true` saat terdeteksi token, banner visual peringatan dengan tombol sensor mandiri, dan pengujian `src/tests/zeroSecretPersistence.test.ts` (TC-P15-01, 5/5 PASS).
- **TASK-097 (AUD4-003 / SEC-002)**: **Credential Helper Fail-Closed & Source-Safe Sanitizer** pada `scripts/zlce/clean-auth.sh`. Penegakan ketat exit code 1 jika `credential.helper` selain `cache`, implementasi `_is_sourced` dan fungsi pembungkus `_finish` yang menggunakan `return` saat di-source sehingga tidak mematikan shell induk Termux, dan pengujian `src/tests/cleanAuthPolicy.test.ts` (TC-P15-02, 5/5 PASS).
- **TASK-098 (UX-01 / ERG-001)**: **Keyboard-Aware Viewport & Dynamic Sticky Form Actions** pada `src/hooks/useKeyboardAwareFocus.ts`, `src/index.css`, serta form/modal aksi sticky (`PasteBackModal`, `ResultCaptureTab`, `AiHandoverWizard`, `MemberWorkLogSection`, `ConflictResolutionWizard`). Memanggil `scrollIntoView({ block: 'center', behavior: 'smooth' })` saat keyboard virtual Android aktif dan membatasi modal dengan batas `calc(var(--keyboard-height) + var(--safe-bottom))` (TC-P15-03, 5/5 PASS).
- **TASK-099 (UX-02 / AUD4-006 / DAT-001)**: **Universal DraftTextarea & Unified Storage Checkpoint** (`src/components/mobile/DraftTextarea.tsx`). Komponen universal yang memproteksi 6 alur input rawan hilang data (Result Capture, Paste-Back, AI Handover, Log Kerja Anggota, Wizard Konflik, Context Pack) dengan debounce 400ms, sinkronisasi storage, isolasi per-user, dan pengujian `src/tests/universalDraftCache.test.ts` (TC-P15-04, 5/5 PASS).
- **TASK-100 (UX-03 / AUD4-007 / PWA-001)**: **Deterministic Offline Service Worker & Tolerant Precache** pada `public/sw.js` dan `src/sw-register.ts`. Precache toleran dengan `Promise.allSettled`, strategi navigasi Cache-First dengan 2.5s network timeout revalidation, penghapusan `skipWaiting()` otomatis di install handler untuk mencegah interupsi mendadak, serta banner toast pembaruan non-destruktif "Versi baru tersedia, Muat Ulang" di `MobileLayout.tsx` (TC-P15-05, 5/5 PASS).
- Integrasi Step 52 hingga Step 56 pada runner uji otomatis `scripts/run-tests.py` (56/56 checks PASS).

---

## [4.0.0] - 2026-11-07 (General Availability)

### Ditambahkan
- **Rilis Resmi GA (General Availability) ZLCE Mobile Workbench v4.0.0** dengan 95/95 task selesai (100% DONE) dan diverifikasi melalui 51 pengujian otomatis (`scripts/run-tests.py`).
- **TASK-095 (AUD4-001 / REV-PWA-01)**: Pembuatan **Prompt Review Frontend PWA untuk ChatGPT & Claude** berfokus pada 5 pilar utama UX (*User-Friendly*, *Komunikatif*, *Mudah Dipakai/Ease of Use*, *Efisien*, dan *Powerful*) pada profil tablet Samsung Galaxy Tab A7 Lite SM-T225 8.7" (1340x800, RAM 3GB), generator bundel ZIP mandiri `scripts/create-pwa-review-bundle.py` (`public/assets/zlce-pwa-frontend-review-bundle.zip`, 97 berkas + manifest, 482 KB), tombol unduh 1-ketuk di `FeedbackReviewTab.tsx`, dan pengujian otomatis `src/tests/pwaReviewPrompt.test.ts` (TC-P14-07, 7/7 PASS).
- **TASK-094 (LOG-001)**: Penambahan modul dan antarmuka **Log Kerja Anggota & Penyuntingan Catatan** (`src/components/mobile/MemberWorkLogSection.tsx`, `src/utils/memberWorkLogs.ts`) dengan kemampuan penambahan log, edit catatan (*note*) interaktif, filter 8 driver tim & 4 status, ekspor markdown Blob, tombol salin 1-ketuk, penegakan Zero-Secret sanitizer, dan test suite otomatis `src/tests/memberWorkLogs.test.ts` (TC-P14-06, 6/6 PASS).
- Penyusunan **3 Pilar Dokumentasi Terstruktur** di `docs/README.md`: Pilar 1 (Dokumentasi Proyek ZLCE), Pilar 2 (Tutorial Instalasi Termux & PWA Android), dan Pilar 3 (Tutorial Petunjuk Penggunaan PWA & Operasi Harian).
- Pemutakhiran generator bundel ZIP audit: `public/assets/zlce-audit-review-bundle.zip` (210 berkas, 800 KB) dan `public/assets/zlce-claude-chatgpt-bundle.zip` (70 berkas, 293 KB).
- Dukungan penanganan parameter URL shortcut PWA `?tab=...` pada `src/App.tsx`.
- Standarisasi privasi dan penegakan identitas non-kredensial `@zlce.local` untuk seluruh 8 anggota tim estafet.

---

## [4.0.0-alpha.TASK-046] - 2026-11-05

### Ditambahkan
- Penuntasan 100% **FASE 9: Audit, Testing & Review Multi-AI Eksternal** (`TASK-044` s/d `TASK-046`).
- **TASK-046**: Integrator Review Final & Perencana Task Perbaikan Terstruktur (`src/utils/auditPromptGenerator.ts`, `src/components/mobile/FeedbackReviewTab.tsx`, `TC-P9-03`).
- Modul pembedah teks laporan ulasan AI eksternal (`parseReviewFeedbackToProposedTasks`) yang mengekstrak skor kesiapan produksi (0-100), ringkasan eksekutif arsitektur, daftar temuan celah & risiko berperingkat (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), serta memecahnya menjadi daftar usulan sub-task terstruktur (`ProposedSubTask[]`).
- Penegakan **Prinsip Kehati-hatian ZLCE**: usulan task baru tidak langsung mengubah sistem, melainkan disajikan dalam kartu checklist interaktif di mana pengguna menyetujui sub-task sebelum dialirkan ke Bagian 2 (Matriks Task) dan Bagian 7 (Log Audit) `SESSION_STATE.md`.
- Penambahan butir uji Step 35 (`TC-P9-03`) pada runner otomatis `scripts/run-tests.py` dengan hasil 35/35 checks PASS (100% OK).
- Seluruh 46/46 task roadmap v4.0.0 tuntas dan terverifikasi bersih (`zlce-check` 0 error, 0 warn) dengan pengesahan gerbang oleh Layang: `ya (oleh: layang)`.

---

## [4.0.0-alpha.TASK-045] - 2026-11-05

### Ditambahkan
- **TASK-045**: Modul Tanggapan Tanya-Jawab & Klarifikasi Permintaan File AI Eksternal (`src/utils/auditPromptGenerator.ts`, `src/components/mobile/FeedbackReviewTab.tsx`, `TC-P9-02`).
- Generator respon klarifikasi teknis cerdas (`generateTechnicalClarificationResponse`) untuk menanggapi pertanyaan pendalaman dan permintaan berkas dari Claude, ChatGPT, dan DeepSeek.
- Menyediakan 4 preset pertanyaan teknis domain kunci: (1) Ketahanan Android LMK & RAM 3GB, (2) Zero-Secret Policy & pembersihan RAM Termux via `clean-auth.sh`, (3) Audit Ergonomi Layar Sentuh 8.7" target 44px+ & `visualViewport` keyboard awareness, dan (4) Kapabilitas Offline PWA 100% & Service Worker precache.
- Pemetaan otomatis berkas referensi proyek terkait dan aksi 1-ketukan salin jawaban siap kirim kembali ke AI peninjau.
- Penambahan butir uji Step 34 (`TC-P9-02`) pada runner otomatis `scripts/run-tests.py` dengan hasil 35/35 checks PASS (100% OK).
- Pengesahan gerbang kualitas oleh Layang: `ya (oleh: layang)`. Status `TASK-046` beralih ke `READY`.

---

## [4.0.0-alpha.TASK-044] - 2026-11-05

### Ditambahkan
- **TASK-044**: Generator Prompt Audit & Bundel File ZIP Review Multi-AI (`src/utils/auditPromptGenerator.ts`, `scripts/create-audit-bundle.py`, `src/components/mobile/FeedbackReviewTab.tsx`, `TC-P9-01`).
- Generator prompt mandat audit, testing, dan arsitektur review terstruktur untuk 4 model sasaran (`claude-3.5-sonnet`, `chatgpt-4o`, `deepseek-v3`, `gemini-1.5-pro`) dengan injeksi stop token presisi (`=== END CLAUDE AUDIT RESPONSE ===`, dll.), penegakan bahasa teknis tanpa basa-basi, berbasis bukti kode konkret, anti-placeholder, dan target sentuh minimal 44px.
- Skrip pembuat bundel ZIP otomatis `scripts/create-audit-bundle.py` yang mengemas 69 berkas kontrol, blueprint, dan kode sumber ke `public/assets/zlce-audit-review-bundle.zip` (230.4 KB).
- Antarmuka tablet **Audit & Feedback** (`src/components/mobile/FeedbackReviewTab.tsx`) dengan alur 3-langkah (Prompt & Bundel ZIP, Tanya-Jawab Klarifikasi, dan Integrasi Review), aksi 1-ketukan salin, unduh file prompt `.md`, serta unduh bundel ZIP.
- Penambahan butir uji Step 33 (`TC-P9-01`) pada runner uji otomatis `scripts/run-tests.py` dengan hasil 35/35 checks PASS (100% OK).
- Penegakan integritas berkas status `SESSION_STATE.md` (46 task, 0 error, 0 warn) dengan pengesahan gerbang oleh Layang: `ya (oleh: layang)`. Status `TASK-045` beralih ke `READY`.

---

## [4.0.0] - 2026-11-05

### Ditambahkan
- **RILIS RESMI ZLCE MOBILE WORKBENCH v4.0.0**: Penuntasan 100% dari seluruh 43 task roadmap (`TASK-001` s/d `TASK-043`) pada Samsung Galaxy Tab A7 Lite (SM-T225).
- Penuntasan 100% **FASE 8: Dokumentasi & Panduan Operasional Terpadu** (`TASK-041` s/d `TASK-043`).
- **TASK-041**: Panduan Instalasi Tablet & Penyiapan Termux (`docs/mobile/INSTALLATION.md`, `docs/mobile/TERMUX_SETUP.md`, `TC-P8-01`). Menyediakan panduan langkah-demi-langkah instalasi Termux dari F-Droid, instalasi paket dasar Linux (`git`, `python`, `bash`, `coreutils`, `micro`, `openssh`), penyiapan symlink dispatcher `zlce`, instalasi PWA ke Layar Utama (Home Screen) dalam mode Standalone, serta lembar contekan mandiri environment Termux (alias, izin penyimpanan, editor micro).
- **TASK-042**: Panduan Pengguna & Alur Kerja Estafet 8 Anggota (`docs/mobile/USER_GUIDE.md`, `TC-P8-02`). Menyusun alur kerja harian 8 langkah terstruktur (Ambil Tablet -> Cek Status -> Klaim Task -> Context Pack -> Eksekusi AI -> Result Capture -> Commit Beridentitas -> Serah Terima & Clean-Auth), panduan beralih profil 8 anggota tim, panduan penggunaan Command Hub 1-tap copy, serta 4 tips efisiensi memori RAM 3GB.
- **TASK-043**: Panduan Penanganan Masalah & Recovery Mandiri (`docs/mobile/TROUBLESHOOTING.md`, `TC-P8-03`). Menyusun matriks Q&A 7 skenario masalah umum (Android LMK reload, permission denied, kerusakan sesi, non-fast-forward push, credential-cache expiry, storage access, multi-task in progress), protokol pemulihan terstandarisasi Kasus A s/d D, penegakan larangan perintah destruktif tanpa backup, dan prosedur snapshot cadangan `scripts/zlce-snapshot.sh`.
- Penambahan butir uji Step 30 (`TC-P8-01`), Step 31 (`TC-P8-02`), dan Step 32 (`TC-P8-03`) pada runner otomatis `scripts/run-tests.py` dengan hasil 32/32 checks PASS (100% OK).
- Penegakan integritas berkas status `SESSION_STATE.md` (43/43 task DONE, 0 error, 0 warn) dengan pengesahan gerbang oleh Layang: `ya (oleh: layang)`.

---

## [4.0.0-alpha.TASK-040] - 2026-11-05

### Ditambahkan
- Penuntasan 100% **FASE 7: Uji Integrasi Penuh & Verifikasi Tablet Fisik SM-T225** (`TASK-036` s/d `TASK-040`).
- **TASK-040**: Audit Keamanan Zero-Secret & Verifikasi Pembersihan Token (`scripts/security-audit.sh`, `docs/mobile/SECURITY_AUDIT.md`, `TC-P7-05`). Memverifikasi pemindaian regex nol kebocoran rahasia (0 Personal Access Token GitHub `ghp_*`/`github_pat_*`, 0 private key, 0 cloud API key AWS/Google), konfirmasi LocalStorage PWA bebas kredensial rahasia, serta verifikasi pembersihan daemon cache RAM Termux via `clean-auth.sh` (`git credential-cache exit`).
- Kartu runner interaktif live `TC-P7-05` (Audit Keamanan Zero-Secret) di `src/components/TestHarnessTab.tsx`.
- Penambahan butir uji Step 29 (`TC-P7-05`) pada runner uji otomatis `scripts/run-tests.py` dengan hasil kelulusan sempurna (29/29 checks PASS 100%).
- Penegakan integritas berkas status `SESSION_STATE.md` (43 task, 0 error, 0 warn) dengan pengesahan gerbang oleh Layang: `ya (oleh: layang)`. Status `TASK-041` (Panduan Instalasi Tablet & Penyiapan Termux) beralih ke `READY`.

---

## [4.0.0-alpha.TASK-039] - 2026-11-05

### Ditambahkan
- **TASK-038**: Uji Operasi Offline 100% (Mode Pesawat) & Service Worker Cache (`src/tests/offlineOperation.test.ts`, `TC-P7-03`). Memverifikasi 5 kriteria keandalan offline: precache berkas App Shell (`sw.js`, `manifest.webmanifest`, ikon PWA), kebijakan Cache-First & Stale-While-Revalidate dengan fallback `index.html`, perakitan Context Pack portabel tanpa dependensi API eksternal, ketersediaan katalog Command Hub & template CLI lokal, serta pembuatan prompt multi-model offline dengan stop token presisi.
- **TASK-039**: Verifikasi Fisik Ergonomi Layar Sentuh & Target 44px+ di SM-T225 (`docs/mobile/DEVICE_AUDIT.md`, `TC-P7-04`). Audit fisik perangkat Samsung Galaxy Tab A7 Lite 8.7" (1340x800) yang memverifikasi 13 komponen interaktif memiliki target sentuh terukur $\ge 44\times 44\text{px}$ (`min-h-[44px]`), jangkauan jempol mode lanskap/potret, kontras teks memadai, dan adaptasi virtual keyboard Android via `visualViewport` API (`--keyboard-height` awareness).
- Kartu runner interaktif live `TC-P7-03` (Uji Operasi Offline 100%) dan `TC-P7-04` (Audit Ergonomi Fisik Layar Sentuh) di `src/components/TestHarnessTab.tsx`.
- Penambahan butir uji Step 27 (`TC-P7-03`) dan Step 28 (`TC-P7-04`) pada runner uji otomatis `scripts/run-tests.py` dengan hasil kelulusan sempurna (28/28 checks PASS 100%).
- Penegakan integritas berkas status `SESSION_STATE.md` (43 task, 0 error, 0 warn) dengan pengesahan gerbang oleh Eko: `ya (oleh: Eko)`. Status `TASK-040` (Audit Keamanan Zero-Secret) beralih ke `READY`.

---

## [4.0.0-alpha.TASK-030] - 2026-11-05

### Ditambahkan
- Penuntasan 100% **FASE 5: Command Hub & Termux Dispatcher** (`TASK-025` s/d `TASK-030`).
- **TASK-026**: Parameter Binder & Strict POSIX Shell Sanitizer (`src/utils/commandSanitizer.ts`, `src/utils/commandBinder.ts`) yang mencegah celah injeksi shell (semicolon, pipe, subshell `$()`, newline, backtick, redirect).
- **TASK-027**: Komponen tombol salin 1-ketukan `OneTapCopyButton.tsx` dengan target sentuh ergonomis tablet $\ge 44\text{px}$, konfirmasi visual 2 detik, dan seleksi fallback otomatis.
- **TASK-028**: Skrip shell CLI dispatcher `scripts/zlce/zlce` dan dokumentasi instalasi/symlink `scripts/zlce/README.md` dengan penegakan allowlist subperintah Termux (`check`, `snapshot`, `collect`, `pull`, `push`, `clean-auth`).
- **TASK-029**: Komponen `PasteBackModal.tsx` dan parser terminal `src/utils/terminalParser.ts` yang membedah hasil `zlce-check` (OK/FAIL, error count, warning) dan status git untuk validasi instan serta pembaruan bukti verifikasi task.
- **TASK-030**: Modul `RecoveryCommandSection.tsx` yang mengintegrasikan resep preskriptif dan perintah 1-tap untuk Protokol Pemulihan Kasus A–D (Sesi Terputus, Uncommitted WAL, Commit Liar, dan Berkas Liar) ke `CommandHubTab.tsx` dan `RecoveryTab.tsx`.
- Peningkatan runner uji otomatis `scripts/run-tests.py` dengan penambahan butir uji `TC-P5-02`, `TC-P5-03`, `TC-P5-04`, `TC-P5-05`, dan `TC-P5-06` (19/19 checks PASS).
- Sinkronisasi status sesi di `SESSION_STATE.md` dengan persetujuan gerbang oleh Eko & Oned; status task aktif beralih ke `TASK-031` (READY).

---

## [4.0.0-alpha.TASK-025] - 2026-11-05

### Ditambahkan
- Modul katalog perintah berversi **Katalog Template Perintah Berversi (Git & CLI ZLCE)** (`src/data/commandTemplates.ts`), mencakup 10 template kanonik dari Blueprint 13 dan Blueprint 04.
- Komponen antarmuka tablet **Command Hub** (`src/components/mobile/CommandHubTab.tsx`) dengan filter kategori (Validator, Git, Recovery, Handover), penandaan parameter dinamis, dan aksi 1-ketukan salin perintah langsung maupun dispatcher `zlce`.
- Badge label risiko tiga tingkat visual (🟢 SAFE, 🟡 MUTATING, 🔴 DESTRUCTIVE) serta fungsi verifikasi ketiadaan perintah destruktif (`verifyNoDestructiveCommands`).
- Penambahan tab navigasi 'Command Hub' (`TASK-025`) di `src/components/Header.tsx` dan `src/App.tsx`.
- Penambahan Step 14 (`TC-P5-01`) pada runner uji otomatis `scripts/run-tests.py` (14/14 checks PASS).
- Penuntasan tugas pertama **FASE 5: Command Hub & Termux Dispatcher**.

---

## [4.0.0-alpha.TASK-024] - 2026-11-05

### Ditambahkan
- Penuntasan 100% **FASE 4: Multi-Akun & Tim Estafet 8 Anggota** (`TASK-019` s/d `TASK-024`).
- **TASK-019**: Registri 8 anggota tim resmi (`src/data/teamMembers.ts`, `src/components/mobile/TeamRegistryModal.tsx`) dengan Zero-Secret Policy.
- **TASK-020**: Mesin klaim task atomik & penegakan aturan tepat 1 task `IN_PROGRESS` (`src/utils/taskClaimManager.ts`, `src/components/mobile/TaskClaimBanner.tsx`).
- **TASK-021**: Sistem persetujuan Gerbang Kualitas terdesentralisasi (ADR-07) dengan format wajib provenance `ya (oleh: Nama)` (`src/utils/gateApprovalManager.ts`, `src/components/mobile/GateApprovalModal.tsx`).
- **TASK-022**: Wizard checklist serah terima tablet 4-langkah dan sanitasi kredensial `clean-auth` (`src/components/mobile/DeviceHandoverModal.tsx`, `src/utils/handoverChecklist.ts`).
- **TASK-023**: Linimasa riwayat sesi visual hingga 35 snapshot, kalkulasi diff per-baris, dan pembatasan kuota LocalStorage (`src/components/mobile/SessionTimelineTab.tsx`, `src/hooks/useSessionHistory.ts`).
- **TASK-024**: Test suite otomatis uji cold-start lintas anggota tim Eko -> Oned (`src/tests/coldStartMember.test.ts`) dengan kelulusan 100% (5/5 checks PASS).
- Integrasi Step 12 dan Step 13 pada `scripts/run-tests.py` dengan hasil 13/13 test checks PASS.
- Pengaktifan protokol serah terima C-I-D-I kanonik akibat batas kuota token model AI untuk transisi ke FASE 5 (`TASK-025`).

---

## [4.0.0-alpha.TASK-018] - 2026-11-05

### Ditambahkan
- Modul test suite otomatis **Uji Cold-Start Lintas AI Claude -> Gemini** (`src/tests/coldStartAi.test.ts`), memvalidasi 5 invarian matematis dan logis tanpa riwayat chat (Invarian I2).
- Kartu runner uji interaktif live `TC-P3-06` di `src/components/TestHarnessTab.tsx` dengan visualisasi hasil 5 butir uji secara real-time.
- Skenario baru `TC-P3-06` pada daftar evaluasi kit `src/data/scenarios.ts` dengan kategori `multi-ai`.
- Integrasi Step 11 (`TC-P3-06`) ke dalam runner uji `scripts/run-tests.py` (11/11 checks PASS).
- Penuntasan 100% **FASE 3: Multi-AI & Context Pack Portabel** (`TASK-013` s/d `TASK-018`).

---

## [4.0.0-alpha.TASK-017] - 2026-11-05

### Ditambahkan
- Modul **Handover Manager Lintas AI** (`src/components/mobile/AiHandoverWizard.tsx`) dengan alur kerja 3-langkah (Sumber & Alasan, Target & Deteksi Konflik, Bundle & Ekspor).
- Mesin deteksi konflik keputusan (`src/utils/conflictDetector.ts`) yang memindai deviasi ADR-09 Obsidian, multi-task `IN_PROGRESS`, direct commit ke branch `main`, dan kode placeholder.
- Mekanisme penyelesaian konflik berbasis *Human-in-the-Loop* (Tolak / Enforce Baseline, Setujui, Override).
- Injeksi otomatis catatan serah terima ke Bagian 6 `SESSION_STATE.md` (maks. ~10 baris) dan generator prompt C-I-D-I kanonik.
- Tombol navigasi 'Handover Lintas AI' di Header dan tab Context Pack.
- Suite uji `TC-P3-05b` di `scripts/run-tests.py` (10/10 checks PASS).

---

## [3.2.2] - 2026-10-21

### Ditambahkan
- Standar skrip kanonik di `scripts/zlce/` (`zlce-check.py`, `zlce-snapshot.sh`, `zlce-collect.py`) dengan wrapper tipis di `scripts/`.
- Dukungan flag `--state <file>` dan `--no-git` pada `zlce-check.py` untuk menguji contoh berkas tanpa repositori git aktif.
- Dokumentasi modular `docs/USAGE.md`, `SECURITY.md`, dan `CONTRIBUTING.md`.
- Sinkronisasi template impor `?raw` di web app langsung dari direktori `templates/`.

### Diperbaiki
- Paritas validasi `zlceValidator.ts` ditingkatkan untuk mencocokkan logika `zlce-check.py` pada seluruh aturan dokumen `SESSION_STATE.md` (deteksi dependensi, ID duplikat, keselarasan WAL vs IN_PROGRESS, status task aktif).
- Perbaikan parser Markdown agar tidak membuang baris teks yang mengandung kata "ID" dalam daftar asumsi.
- Perbaikan penanganan fallback clipboard di 22 titik menggunakan helper terpadu `copyText()`.
- Optimasi penyimpanan histori `useSessionPersistence` dengan skema *lightweight snapshot* (tanpa duplikasi objek terurai `stateData`).
- Sinkronisasi metadata HTML (`lang="id"`, sinkronisasi title dan deskripsi).

---

## [3.2.1] - 2026-10-18

### Diperbaiki
- Sinkronisasi penamaan profil domain dan pemetaan `DOMAIN_BOOKING.profile.md`.
- Normalisasi penanganan format timestamp UTC ISO 8601 dan fallback aturan jam `X1` ("jam: ?").

---

## [3.2.0] - 2026-10-14

### Ditambahkan
- Inisiasi awal ZLCE Studio web app (React 19 + Vite + Tailwind CSS v4).
- 4 Quality Gates terstruktur: Blueprint, Rules, Tasks/Testing, Session State/Workflow.
- Protokol pemulihan darurat Kasus A–D (Working tree bersih, In-flight diff, Commit desync, Wildcard diff).
- Matriks triase revisi R1–R7 (Level S, M dependen, M independen).
- Modul uji benchmark Test Harness (14 butir evaluasi).
