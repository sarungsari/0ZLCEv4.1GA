# BACKLOG TASK PENGEMBANGAN: ZLCE MOBILE WORKBENCH v4.1.0 GA (ZLCEv4.1Mob)
## Rincian Task Atomik Implementasi Tablet Bersama (Samsung Galaxy Tab A7 Lite • 8 Anggota)

Definisi seluruh task implementasi Track 2. **Status task aktif tidak ditulis di sini**; status dan matriks dinamis dikelola di `SESSION_STATE.md`. Aturan, enum, dan protokol: `docs/mobile/blueprint/`.

---

## 1. PETA FASE IMPLEMENTASI

* **FASE 0: Baseline & Persiapan Lingkungan Uji** (`TASK-001` s/d `TASK-002`)
* **FASE 1: Fondasi PWA Tablet Android & Ergonomi Layar Sentuh** (`TASK-003` s/d `TASK-007`)
* **FASE 2: Markdown Workspace & Manajemen Multi-Proyek** (`TASK-008` s/d `TASK-012`)
* **FASE 3: Multi-AI & Context Pack Portabel [PRIORITAS UTAMA]** (`TASK-013` s/d `TASK-018`)
* **FASE 4: Multi-Akun & Tim Estafet 8 Anggota [PRIORITAS UTAMA]** (`TASK-019` s/d `TASK-024`)
* **FASE 5: Command Hub & Termux Dispatcher** (`TASK-025` s/d `TASK-030`)
* **FASE 6: Git Sync & Kolaborasi Cabang Tim** (`TASK-031` s/d `TASK-035`)
* **FASE 7: Uji Integrasi Penuh & Verifikasi Tablet Fisik SM-T225** (`TASK-036` s/d `TASK-040`)
* **FASE 8: Dokumentasi & Panduan Operasional Terpadu** (`TASK-041` s/d `TASK-043`)
* **FASE 9: Audit, Testing & Review Multi-AI Eksternal** (`TASK-044` s/d `TASK-046`)
* **FASE 10: Remediasi Audit & Pengerasan Sistem [AUD-001 s.d. AUD-014]** (`TASK-047` s/d `TASK-060`)
* **FASE 11: Remediasi Audit Lanjutan [CLAUDE 5.5 REVIEW - AUD-015 s.d. AUD-028]** (`TASK-061` s/d `TASK-074`)
* **FASE 12: GA Production Hardening & GPT-6 Audit Remediation [AUD2-001 s.d. AUD2-008]** (`TASK-075` s/d `TASK-082`)
* **FASE 13: Final Review Audit Remediation & Documentation Polish [AUD3-001 s.d. AUD3-006]** (`TASK-083` s/d `TASK-088`)
* **FASE 14: Pemisahan & Integrasi Dokumentasi Arsitektur, Tutorial Android (Termux ➔ PWA), Panduan Pemakaian Mobile, Log Kerja Anggota, & Review Prompt Frontend PWA [DOC-001 s.d. DOC-005, LOG-001, REV-PWA-01]** (`TASK-089` s/d `TASK-095`)
* **FASE 15: Remediasi Kritis P0 & Zero-Secret Persistence Gate [AUD4-002 s.d. AUD4-007, UX-01 s.d. UX-03]** (`TASK-096` s/d `TASK-100`)
* **FASE 16: Peningkatan UX P1, Ergonomi Tablet & Integritas Alur Kerja [AUD4-004, AUD4-010, UX-04 s.d. UX-11]** (`TASK-101` s/d `TASK-106`)
* **FASE 17: Polishing P2, Paritas Dokumentasi, Tab Diagnostik & Rilis GA Final** (`TASK-107` s/d `TASK-111`)
* **FASE 18: Remediasi Hasil Review Frontend PWA Ulang (11 Nov 2026) & Penyeragaman Identitas Rilis (ZLCEv4Mobile) [R-01 s.d. R-12]** (`TASK-112` s/d `TASK-118`)
* **FASE 19: Penyederhanaan Frontend PWA Menjadi Dashboard Teknis Ringkas** (`TASK-119` s/d `TASK-124`)
* **FASE 20: Penyelarasan Penuh Berkas Kontrol ZLCE (Mode FULL & LITE), Arsip Audit, Paritas Dokumentasi & Bundel v4.1.0 GA** (`TASK-125` s/d `TASK-129`)
* **FASE 21: Konsolidasi Single Source of Truth, Eliminasi Duplikasi & Optimasi Ukuran Repo/PWA [Opsi B]** (`TASK-130` s/d `TASK-134`)

---

## 2. RINCIAN TASK ATOMIK

### ============================================================================
### FASE 0: BASELINE & PERSIAPAN LINGKUNGAN UJI
### ============================================================================

### TASK-001: Verifikasi Baseline Uji & Test Runner
* **Fase:** FASE 0
* **Deskripsi:** Memverifikasi integritas repositori kerja, memastikan skrip `npm test`, linter, dan validator ZLCE berada dalam kondisi 0 error sebagai fondasi awal Track 2.
* **Dependensi:** -
* **File:** `package.json`, `tsconfig.json`
* **Docs Terkait:** `docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md`, `10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `npm test` atau runner test eksisting lulus 100% tanpa error.
  2. `npm run lint` menghasilkan 0 error dan 0 fatal warning.
  3. `npm run build` sukses menghasilkan bundel produksi Vite.
* **Test Case:** `TC-P0-01`
* **Metode Verifikasi:** Jalankan `npm test`, `npm run lint`, dan `npm run build`; tempel output log.

---

### TASK-002: Penyiapan Struktur Direktori Komponen Mobile & Types
* **Fase:** FASE 0
* **Deskripsi:** Membuat direktori terisolasi `src/components/mobile/` dan berkas tipe data TypeScript (`src/types/mobile.ts`) untuk memfasilitasi penambahan modul tablet tanpa merusak kode desktop eksisting.
* **Dependensi:** `TASK-001`
* **File:** `src/types/mobile.ts`, `src/components/mobile/`
* **Docs Terkait:** `docs/mobile/blueprint/06_REPOSITORY_CHANGES.md`, `02_COMPONENT_ARCHITECTURE.md`
* **Docs Impact:** `src/types/index.ts`
* **Acceptance Criteria:**
  1. Direktori `src/components/mobile/` terbuat dan terisolasi.
  2. Berkas `src/types/mobile.ts` memuat tipe `TeamMember`, `ProjectMeta`, `ContextPack`, `CommandTemplate`, `TerminalPasteResult`.
  3. Tipe TypeScript tervalidasi bersih saat `npm run build`.
* **Test Case:** `TC-P0-02`
* **Metode Verifikasi:** Kompilasi proyek dengan TypeScript compiler (`npm run build`).

---

### ============================================================================
### FASE 1: FONDASI PWA TABLET ANDROID & ERGONOMI LAYAR SENTUH
### ============================================================================

### TASK-003: Web App Manifest & Aset Ikon PWA Standalone
* **Fase:** FASE 1
* **Deskripsi:** Membuat berkas Web App Manifest (`manifest.webmanifest`) dengan display mode `standalone`, orientasi `any`, theme color gelap, dan ikon PWA lengkap (192x192, 512x512, maskable) untuk mendukung instalasi ke layar utama Android.
* **Dependensi:** `TASK-002`
* **File:** `public/manifest.webmanifest`, `index.html`, `public/icons/*`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`
* **Docs Impact:** `index.html`
* **Acceptance Criteria:**
  1. `manifest.webmanifest` valid sesuai spesifikasi W3C dengan `display: "standalone"` dan short name.
  2. Tag `<link rel="manifest">` dan meta theme-color terpasang di `index.html`.
  3. Ikon 192px dan 512px terhubung dengan benar.
* **Test Case:** `TC-P1-01`
* **Metode Verifikasi:** Validasi manifest via browser audit dan inspeksi DOM di Chrome DevTools.

---

### TASK-004: Service Worker & Strategi Offline Shell Caching
* **Fase:** FASE 1
* **Deskripsi:** Mengimplementasikan Service Worker (`public/sw.js`) dan modul pendaftaran (`src/sw-register.ts`) dengan strategi caching: Cache-First untuk aset statis (HTML/JS/CSS/ikon) dan Network-First/Fallback untuk konten dinamis.
* **Dependensi:** `TASK-003`
* **File:** `public/sw.js`, `src/sw-register.ts`, `src/main.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`
* **Docs Impact:** `src/main.tsx`
* **Acceptance Criteria:**
  1. Service Worker terdaftar sukses saat aplikasi dimuat.
  2. Aplikasi dapat dibuka kembali dan beroperasi secara utuh saat jaringan dimatikan (Offline/Mode Pesawat).
  3. Pembaruan cache otomatis tertrigger saat ada versi aplikasi baru.
* **Test Case:** `TC-P1-02`
* **Metode Verifikasi:** Nonaktifkan koneksi jaringan di DevTools (Offline mode) lalu refresh halaman.

---

### TASK-005: Adaptasi Ergonomi Tablet 8.7" & Viewport Awareness
* **Fase:** FASE 1
* **Deskripsi:** Mengoptimalkan tata letak CSS Tailwind untuk layar 8.7 inci (1340x800): menerapkan target sentuh minimal 44x44 piksel pada semua tombol aksi, spasi kontrol ramah jempol, dan penanganan keyboard virtual melalui `visualViewport` API agar input tidak tertutup.
* **Dependensi:** `TASK-004`
* **File:** `src/index.css`, `src/components/mobile/MobileLayout.tsx`, `src/App.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `03_PWA_ARCHITECTURE.md`
* **Docs Impact:** `src/App.tsx`
* **Acceptance Criteria:**
  1. Seluruh tombol interaktif utama memiliki tinggi minimal 44px (`min-h-[44px]`).
  2. Panel input dan tombol aksi utama tetap terlihat saat keyboard virtual Android aktif (`window.visualViewport`).
  3. Antarmuka responsif tanpa horizontal scrollbar yang tidak diinginkan pada resolusi 1340x800 dan orientasi potret/lanskap.
* **Test Case:** `TC-P1-03`
* **Metode Verifikasi:** Uji visual pada preset resolusi 1340x800 dan simulasi resize viewport keyboard virtual.

---

### TASK-006: Komponen Active Member Selector di Header
* **Fase:** FASE 1
* **Deskripsi:** Membangun komponen `ActiveMemberSelector.tsx` di bilah atas PWA yang memungkinkan pemilihan instan salah satu dari 8 anggota tim, menampilkan avatar/inisial, dan menyimpan anggota aktif di LocalStorage.
* **Dependensi:** `TASK-005`
* **File:** `src/components/mobile/ActiveMemberSelector.tsx`, `src/components/Header.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`, `08_SECURITY_MODEL.md`
* **Docs Impact:** `src/components/Header.tsx`
* **Acceptance Criteria:**
  1. Komponen dropdown/modal cepat menampilkan 8 anggota tim (Budi, Siti, Agus, Dewi, Eko, Rina, Fajar, Hani).
  2. Memilih anggota mengubah state global dan tersimpan di `localStorage.getItem('zlce_active_member')`.
  3. Header menampilkan badge visual anggota yang sedang memegang tablet.
* **Test Case:** `TC-P1-04`
* **Metode Verifikasi:** Pilih anggota di UI, refresh halaman, verifikasi state anggota aktif bertahan.

---

### TASK-007: Komponen Project Switcher & Registry Ringan
* **Fase:** FASE 1
* **Deskripsi:** Membangun komponen `ProjectSwitcher.tsx` untuk mengelola daftar proyek yang dikerjakan pada tablet, memungkinkan penambahan proyek baru, pergantian proyek aktif, dan pencatatan path Termux masing-masing.
* **Dependensi:** `TASK-006`
* **File:** `src/components/mobile/ProjectSwitcher.tsx`, `src/hooks/useProjectRegistry.ts`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`
* **Docs Impact:** `src/components/Header.tsx`
* **Acceptance Criteria:**
  1. Registry multi-proyek tersimpan di `localStorage.getItem('zlce_projects_registry')`.
  2. Pengguna dapat menambah, mengedit, dan berpindah antar proyek secara instan.
  3. Berganti proyek memuat context dan draft yang sesuai untuk proyek bersangkutan.
* **Test Case:** `TC-P1-05`
* **Metode Verifikasi:** Tambahkan 2 proyek uji ("Proyek A", "Proyek B"), lakukan pergantian dan verifikasi isolasi state.

---

### ============================================================================
### FASE 2: MARKDOWN WORKSPACE & MANAJEMEN MULTI-PROYEK
### ============================================================================

### TASK-008: Workspace Reader & Parser Dokumen Kontrol ZLCE
* **Fase:** FASE 2
* **Deskripsi:** Membangun parser berkas Markdown kontrol ZLCE (`BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`) untuk mengekstrak metadata, daftar task, status aktif, dan entri WAL ke dalam objek terstruktur di memori PWA.
* **Dependensi:** `TASK-007`
* **File:** `src/utils/markdownParser.ts`, `src/components/mobile/WorkspaceReader.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `templates/`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Parser mampu membedakan format dokumen `SESSION_STATE.md`, `TASKS.md`, dan `BLUEPRINT.md`.
  2. Matriks task diparsing menjadi array objek dengan ID, Nama, Dependensi, Status, dan Disetujui.
  3. Tidak memicu crash bila terdapat baris Markdown tak terduga.
* **Test Case:** `TC-P2-01`
* **Metode Verifikasi:** Uji unit parsing terhadap berkas contoh di `templates/` dan `examples/`.

---

### TASK-009: Workspace Editor & Integrasi File Picker Impor
* **Fase:** FASE 2
* **Deskripsi:** Membangun antarmuka editor Markdown yang responsif dengan tombol File Picker eksplisit (`input type="file"`) untuk membaca berkas Markdown dari penyimpanan tablet ke editor PWA.
* **Dependensi:** `TASK-008`
* **File:** `src/components/mobile/WorkspaceEditor.tsx`, `src/hooks/useFileImport.ts`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Tombol "Buka Berkas .md" membuka pemilih file bawaan Android tanpa error.
  2. Isi berkas Markdown terimpor langsung ke state editor PWA.
  3. Memberikan feedback visual ukuran berkas dan waktu impor.
* **Test Case:** `TC-P2-02`
* **Metode Verifikasi:** Pilih berkas `.md` lokal via file input dan pastikan teks muncul di editor.

---

### TASK-010: Markdown Exporter & Unduh Berkas Blob
* **Fase:** FASE 2
* **Deskripsi:** Mengimplementasikan fungsi ekspor instan Markdown ke berkas fisik yang dapat diunduh langsung ke folder `Download/` tablet Android via Blob URL dan tombol salin 1-ketukan ke clipboard.
* **Dependensi:** `TASK-009`
* **File:** `src/utils/fileExport.ts`, `src/components/mobile/WorkspaceExportBar.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Tombol "Unduh .md" mengunduh berkas dengan penamaan yang benar (misal: `SESSION_STATE.md`).
  2. Tombol "Salin Seluruh Markdown" menyalin teks lengkap ke clipboard Android dengan feedback visual.
  3. Karakter baris baru LF dipertahankan secara utuh tanpa rusak menjadi CRLF.
* **Test Case:** `TC-P2-03`
* **Metode Verifikasi:** Unduh berkas uji, periksa kelengkapan konten dan integritas karakter baris baru.

---

### TASK-011: Penegakan Integritas SESSION_STATE sebagai Single Source of Truth
* **Fase:** FASE 2
* **Deskripsi:** Memastikan format berkas `SESSION_STATE.md` yang dihasilkan dan disunting di PWA 100% mematuhi aturan kanonik ZLCE Core (nomor bagian 0–7, header, format tabel matriks task, dan format WAL).
* **Dependensi:** `TASK-010`
* **File:** `src/utils/sessionStateValidator.ts`, `src/components/SessionStateTab.tsx`
* **Docs Terkait:** `templates/SESSION_STATE.template.md`, `docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md`
* **Docs Impact:** `src/components/SessionStateTab.tsx`
* **Acceptance Criteria:**
  1. Output `SESSION_STATE.md` lulus validasi skrip `scripts/zlce-check.py` tanpa error format.
  2. Kolom matriks task memuat header `| ID Task | Nama | Dependensi | Status | Bukti Verifikasi | Disetujui |`.
  3. Bagian 3 (WAL) mematuhi format 7 butir kanonik.
* **Test Case:** `TC-P2-04`
* **Metode Verifikasi:** Validasi teks SESSION_STATE yang dihasilkan PWA menggunakan `scripts/zlce-check.py`.

---

### TASK-012: Cache Draft LocalStorage dengan Debounce 400ms & Auto-Sync
* **Fase:** FASE 2
* **Deskripsi:** Membangun mekanisme persistensi draft lokal di LocalStorage dengan debounce 400ms untuk melindungi perubahan pengguna saat PWA ditutup atau dibunuh oleh Android LMK saat beralih aplikasi.
* **Dependensi:** `TASK-011`
* **File:** `src/hooks/useAutoDraftCache.ts`, `src/components/mobile/WorkspaceEditor.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Setiap ketikan pengguna disimpan otomatis ke LocalStorage setelah jeda 400ms.
  2. Saat aplikasi dibuka kembali setelah di-refresh atau ditutup paksa, draft terakhir dipulihkan secara transparan.
  3. Menampilkan indikator visual ringkas "Draft tersimpan" di sudut layar.
* **Test Case:** `TC-P2-05`
* **Metode Verifikasi:** Ketik perubahan teks, tutup tab / refresh paksa browser, buka kembali, pastikan teks tidak hilang.

---

### ============================================================================
### FASE 3: MULTI-AI & CONTEXT PACK PORTABEL [PRIORITAS UTAMA]
### ============================================================================

### TASK-013: Portable Context Pack Generator (Schema-before-Data)
* **Fase:** FASE 3
* **Deskripsi:** Membangun generator paket konteks mandiri yang merangkum ringkasan proyek, blueprint, task aktif, status sesi terkini, dan keputusan teknis dalam format Markdown terstruktur yang siap dikirimkan ke model AI mana pun.
* **Dependensi:** `TASK-012`
* **File:** `src/utils/contextPackGenerator.ts`, `src/components/mobile/ContextPackTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `src/components/PromptEngineTab.tsx`
* **Acceptance Criteria:**
  1. Context Pack memuat blok metadata wajib (Proyek, Task ID, Anggota Aktif, AI Target, Timestamp).
  2. Menyertakan seluruh informasi yang dibutuhkan AI tanpa mengharuskan riwayat chat sebelumnya (Invarian I1 & I2).
  3. Struktur output konsisten dan deterministik.
* **Test Case:** `TC-P3-01`
* **Metode Verifikasi:** Bangkitkan Context Pack untuk task aktif dan verifikasi kelengkapan komponen konteks.

---

### TASK-014: Context Budget Manager & Adapter Kuota Token per Model AI
* **Fase:** FASE 3
* **Deskripsi:** Membangun modul pengatur anggaran token yang menyesuaikan kedalaman dan panjang Context Pack berdasarkan profil model AI target (misal: mode komprehensif untuk Gemini 1M token vs mode ringkas terkonsolidasi untuk Claude/ChatGPT 8K–30K token).
* **Dependensi:** `TASK-013`
* **File:** `src/utils/tokenBudgetAdapter.ts`, `src/components/mobile/TokenBudgetSelector.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `src/components/TokenUsageGauge.tsx`
* **Acceptance Criteria:**
  1. Tersedia pilihan profil AI: Gemini (Large Context), Claude (Mid Context), ChatGPT (Compact Context).
  2. Estimasi token ditampilkan secara visual sebelum menyalin Context Pack.
  3. Context Pack otomatis memotong lampiran historis berlebih saat memilih profil kompak agar tidak melampaui kuota.
* **Test Case:** `TC-P3-02`
* **Metode Verifikasi:** Beralih antar profil AI dan periksa variasi panjang teks hasil Context Pack.

---

### TASK-015: Prompt Generator Multi-Model Terstruktur
* **Fase:** FASE 3
* **Deskripsi:** Mengintegrasikan Context Pack dengan instruksi peran AI yang presisi (Landing Prompt, Task Execution Prompt, Review Prompt, Handover Prompt) yang dioptimalkan untuk respons deterministik bebas halusinasi.
* **Dependensi:** `TASK-014`
* **File:** `src/utils/promptGenerator.ts`, `src/components/mobile/PromptStudio.tsx`
* **Docs Terkait:** `LANDING_PROMPT.md`, `HANDOVER_PROMPT.md`, `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `src/components/PromptEngineTab.tsx`
* **Acceptance Criteria:**
  1. Generator menghasilkan prompt siap pakai yang menggabungkan Context Pack dan instruksi tugas.
  2. Format prompt menegaskan aturan "Schema-before-Data" dan pelarangan kode placeholder.
  3. Tombol "Salin Prompt Lengkap" menyalin seluruh teks dengan 1 ketukan.
* **Test Case:** `TC-P3-03`
* **Metode Verifikasi:** Salin prompt ke clipboard dan periksa kecocokan teks yang ditempelkan.

---

### TASK-016: Result Capture Module dengan Injeksi Provenance Otomatis
* **Fase:** FASE 3
* **Deskripsi:** Membangun antarmuka untuk menempelkan hasil jawaban dari Browser AI, mengekstrak blok kode/solusi, dan secara otomatis menyematkan metadata *provenance* (Model AI, Alias Akun, Nama Anggota, Timestamp, Task ID).
* **Dependensi:** `TASK-015`
* **File:** `src/components/mobile/ResultCaptureTab.tsx`, `src/utils/provenanceInjector.ts`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`, `08_SECURITY_MODEL.md`
* **Docs Impact:** `src/components/RecoveryTab.tsx`
* **Acceptance Criteria:**
  1. Antarmuka Result Capture menyediakan area tempel hasil AI berukuran besar.
  2. Provenance terinjeksi otomatis dalam format tag komentar Markdown atau baris metadata.
  3. Hasil dapat langsung dialirkan untuk memperbarui draft `SESSION_STATE.md` atau WAL.
* **Test Case:** `TC-P3-04`
* **Metode Verifikasi:** Tempel teks solusi AI, verifikasi tag metadata provenance terbentuk dengan lengkap.

---

### TASK-017: Handover Manager Lintas AI & Deteksi Konflik Keputusan
* **Fase:** FASE 3
* **Deskripsi:** Membangun modul serah terima (*Handover Manager*) saat berpindah dari satu AI ke AI lain (misal dari Claude yang kehabisan limit ke Gemini), termasuk deteksi inkonsistensi keputusan antar-model AI dan pencatatan eskalasi.
* **Dependensi:** `TASK-016`
* **File:** `src/components/mobile/AiHandoverWizard.tsx`, `src/utils/conflictDetector.ts`
* **Docs Terkait:** `HANDOVER_PROMPT.md`, `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Wizard memandu pembuatan handover lintas AI dalam 3 langkah sederhana.
  2. Bila terdeteksi perbedaan keputusan antar AI, sistem menandainya sebagai `CONFLICT_DECISION` dan meminta konfirmasi manusia.
  3. Catatan serah terima terangkum di Bagian 6 `SESSION_STATE.md`.
* **Test Case:** `TC-P3-05`
* **Metode Verifikasi:** Jalankan wizard handover AI dan verifikasi teks handover prompt yang dihasilkan.

---

### TASK-018: Test Suite Uji Cold-Start Lintas AI (Claude -> Gemini)
* **Fase:** FASE 3
* **Deskripsi:** Mengimplementasikan test suite otomatis dan skenario uji verifikasi bahwa sesi pekerjaan dapat dilanjutkan oleh model AI baru secara murni hanya dari berkas repositori dan Context Pack tanpa riwayat chat (Invarian I2).
* **Dependensi:** `TASK-017`
* **File:** `src/tests/coldStartAi.test.ts`, `src/components/TestHarnessTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`, `14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `src/components/TestHarnessTab.tsx`
* **Acceptance Criteria:**
  1. Test harness memverifikasi bahwa Context Pack memuat 100% parameter pemulihan state.
  2. Skenario uji pergantian Claude -> Gemini menghasilkan instruksi kelanjutan yang valid dan identik.
  3. Test suite lulus dengan status PASS pada runner uji.
* **Test Case:** `TC-P3-06`
* **Metode Verifikasi:** Eksekusi test suite via `npm test` atau tombol uji di Test Harness tab PWA.

---

### ============================================================================
### FASE 4: MULTI-AKUN & TIM ESTAFET 8 ANGGOTA [PRIORITAS UTAMA]
### ============================================================================

### TASK-019: Team Member Registry (8 Profil Alias Non-Kredensial)
* **Fase:** FASE 4
* **Deskripsi:** Membangun registry profil 8 anggota tim estafet (Budi, Siti, Agus, Dewi, Eko, Rina, Fajar, Hani) dengan atribut nama alias, email publik non-rahasia, peran, dan preferensi AI — dengan penegakan keras *Zero-Secret Policy* (nol token/password).
* **Dependensi:** `TASK-018`
* **File:** `src/data/teamMembers.ts`, `src/components/mobile/TeamRegistryModal.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`, `08_SECURITY_MODEL.md`
* **Docs Impact:** `src/types/mobile.ts`
* **Acceptance Criteria:**
  1. Terdaftar 8 profil anggota dengan data valid tanpa informasi rahasia.
  2. Pengguna dapat mengubah email commit publik masing-masing anggota.
  3. Registry tersimpan di LocalStorage dengan fallback data default yang aman.
* **Test Case:** `TC-P4-01`
* **Metode Verifikasi:** Buka modal registry tim di PWA, ubah profil, dan pastikan data tersimpan.

---

### TASK-020: Mekanisme Klaim Task & Penegakan Aturan 1 Task IN_PROGRESS
* **Fase:** FASE 4
* **Deskripsi:** Mengimplementasikan aturan kolaborasi tablet bersama: hanya satu task yang diizinkan berstatus `IN_PROGRESS` pada satu waktu di tablet, dengan pencatatan anggota yang mengklaim task dan waktu mulai klaim.
* **Dependensi:** `TASK-019`
* **File:** `src/utils/taskClaimManager.ts`, `src/components/mobile/TaskClaimBanner.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `src/components/SessionStateTab.tsx`
* **Acceptance Criteria:**
  1. Sistem menolak transisi status menjadi `IN_PROGRESS` bila sudah ada task lain yang berstatus `IN_PROGRESS`.
  2. Task yang sedang dikerjakan menampilkan badge nama anggota pemegang klaim.
  3. Tombol rilis/selesai klaim tersedia secara jelas.
* **Test Case:** `TC-P4-02`
* **Metode Verifikasi:** Coba klaim TASK-002 saat TASK-001 masih IN_PROGRESS; verifikasi muncul peringatan penolakan.

---

### TASK-021: Pencatatan Persetujuan Gerbang Kualitas Bersama Provenance Penyetuju
* **Fase:** FASE 4
* **Deskripsi:** Mengimplementasikan hak persetujuan Gerbang Kualitas bagi seluruh 8 anggota (ADR-07) dengan kewajiban mencatatkan nama anggota penyetuju pada kolom `Disetujui` di matriks task (`Disetujui: ya (oleh: [Nama])`) dan di log audit.
* **Dependensi:** `TASK-020`
* **File:** `src/utils/gateApprovalManager.ts`, `src/components/mobile/GateApprovalModal.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/12_ARCHITECTURE_DECISIONS.md`, `14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `src/utils/zlceValidator.ts`
* **Acceptance Criteria:**
  1. Modal persetujuan gerbang meminta konfirmasi anggota aktif yang sedang memegang tablet.
  2. Kolom `Disetujui` di `SESSION_STATE.md` diperbarui dengan format `ya (oleh: Budi)`.
  3. Log audit Bagian 7 otomatis bertambah satu baris pencatatan persetujuan.
  4. Validator `zlceValidator.ts` memvalidasi keabsahan format nama penyetuju.
* **Test Case:** `TC-P4-03`
* **Metode Verifikasi:** Berikan persetujuan task di PWA, verifikasi teks `SESSION_STATE.md` dan validasi linter.

---

### TASK-022: Device Handover Checklist Wizard & Prosedur Serah Terima Tablet
* **Fase:** FASE 4
* **Deskripsi:** Membangun wizard interaktif 4-langkah serah terima tablet sebelum tablet dioper ke anggota berikutnya: (1) Verifikasi task commit/push, (2) Update catatan handover, (3) Salin perintah `zlce clean-auth` untuk menghapus token di RAM, (4) Pengalihan profil anggota aktif.
* **Dependensi:** `TASK-021`
* **File:** `src/components/mobile/DeviceHandoverModal.tsx`, `src/utils/handoverChecklist.ts`
* **Docs Terkait:** `docs/mobile/blueprint/07_WORKFLOW_DESIGN.md`, `08_SECURITY_MODEL.md`
* **Docs Impact:** `src/components/Header.tsx`
* **Acceptance Criteria:**
  1. Wizard serah terima menampilkan 4 checklist yang wajib dicentang.
  2. Menyediakan tombol 1-ketukan untuk menyalin perintah pembersihan kredensial Termux (`git credential-cache exit`).
  3. Mengalihkan profil aktif ke anggota berikutnya setelah wizard selesai.
* **Test Case:** `TC-P4-04`
* **Metode Verifikasi:** Jalankan alur wizard serah terima di UI dan pastikan semua langkah checklist tereksekusi.

---

### TASK-023: Session History Timeline & Audit Log Terpadu
* **Fase:** FASE 4
* **Deskripsi:** Membangun penampil visual riwayat snapshot sesi (hingga 35 snapshot) dan log audit kronologis yang mencatat setiap peristiwa task, commit, dan pergantian anggota tim di tablet.
* **Dependensi:** `TASK-022`
* **File:** `src/components/mobile/SessionTimelineTab.tsx`, `src/hooks/useSessionHistory.ts`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Timeline menampilkan daftar riwayat snapshot dengan cap waktu dan nama anggota.
  2. Pengguna dapat melihat diff atau memulihkan draft dari snapshot sebelumnya.
  3. Ukuran data riwayat di LocalStorage dibatasi secara aman agar tidak melampaui kuota browser.
* **Test Case:** `TC-P4-05`
* **Metode Verifikasi:** Lakukan beberapa modifikasi state, buka tab riwayat, dan verifikasi entri snapshot tercatat.

---

### TASK-024: Test Suite Uji Cold-Start Lintas Anggota (Anggota A -> Anggota B)
* **Fase:** FASE 4
* **Deskripsi:** Membangun skenario uji otomatis untuk memverifikasi bahwa Anggota B dapat melanjutkan pengerjaan task yang ditinggalkan oleh Anggota A secara mulus hanya dengan membaca berkas repositori dan catatan serah terima (Invarian I2 & I3).
* **Dependensi:** `TASK-023`
* **File:** `src/tests/coldStartMember.test.ts`, `src/components/TestHarnessTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`, `14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `src/components/TestHarnessTab.tsx`
* **Acceptance Criteria:**
  1. Uji mensimulasikan pergantian giliran dari Budi ke Siti.
  2. Memverifikasi status task, WAL, dan identitas commit otomatis teralihkan ke Siti.
  3. Seluruh invarian I1–I5 terkonfirmasi terpenuhi tanpa anomali data.
* **Test Case:** `TC-P4-06`
* **Metode Verifikasi:** Jalankan test runner untuk skenario cold-start anggota tim.

---

### ============================================================================
### FASE 5: COMMAND HUB & TERMUX DISPATCHER
### ============================================================================

### TASK-025: Katalog Template Perintah Berversi (Git & CLI ZLCE)
* **Fase:** FASE 5
* **Deskripsi:** Menyusun katalog perintah berversi di repositori yang memuat template perintah operasional: pemeriksaan validator (`zlce-check`), snapshot (`zlce-snapshot`), git status, commit atomik, push, pull aman, dan clean-auth, lengkap dengan label risiko.
* **Dependensi:** `TASK-024`
* **File:** `src/data/commandTemplates.ts`, `src/components/mobile/CommandHubTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/13_COMMAND_TEMPLATES.md`, `04_TERMUX_INTEGRATION.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Seluruh 8 template kanonik dari Blueprint 13 terdaftar dengan skema berversi.
  2. Setiap perintah memiliki badge label risiko yang jelas (🟢 Safe, 🟡 Mutating, 🔴 High-Risk).
  3. Tidak ada perintah destruktif (`reset --hard`, `push --force`) di katalog bawaan.
* **Test Case:** `TC-P5-01`
* **Metode Verifikasi:** Periksa daftar template perintah di tab Command Hub PWA.

---

### TASK-026: Command Parameter Binder & Strict Shell Sanitizer (Anti-Injection)
* **Fase:** FASE 5
* **Deskripsi:** Mengimplementasikan mesin pengikat parameter otomatis (Task ID, Nama Cabang, Nama Anggota, Pesan Commit) yang dilengkapi fungsi sanitasi dan escaping shell bash ketat guna mencegah celah *command injection*.
* **Dependensi:** `TASK-025`
* **File:** `src/utils/commandSanitizer.ts`, `src/utils/commandBinder.ts`
* **Docs Terkait:** `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`, `08_SECURITY_MODEL.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Seluruh parameter dinamis otomatis terisi dari context proyek dan anggota aktif.
  2. Karakter berbahaya (`"`, `'`, `;`, `&`, `|`, `$`, `` ` ``, `\n`) di-escape secara aman dengan penandaan kutip POSIX standar.
  3. Uji injeksi shell gagal mengeksekusi perintah susupan.
* **Test Case:** `TC-P5-02`
* **Metode Verifikasi:** Uji masukan pesan commit dengan karakter injeksi `; rm -rf /` dan verifikasi string hasil escaping aman.

---

### TASK-027: One-Tap Copy Button dengan Status Feedback & Fallback Seleksi
* **Fase:** FASE 5
* **Deskripsi:** Membangun tombol salin satu ketukan (*One-Tap Copy*) menggunakan Clipboard API peramban, dilengkapi animasi feedback visual "Tersalin!", dan fallback seleksi teks manual jika izin clipboard ditolak.
* **Dependensi:** `TASK-026`
* **File:** `src/components/mobile/OneTapCopyButton.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Tombol salin memiliki target sentuh minimal 44x44px ramah jari tablet.
  2. Menekan tombol langsung menyalin teks perintah ke clipboard Android.
  3. Menampilkan status konfirmasi visual selama 2 detik setelah berhasil menyalin.
* **Test Case:** `TC-P5-03`
* **Metode Verifikasi:** Ketuk tombol di UI, tempel ke aplikasi catatan atau terminal, verifikasi isi teks identik.

---

### TASK-028: CLI Dispatcher `zlce` di Termux (`scripts/zlce/zlce`)
* **Fase:** FASE 5
* **Deskripsi:** Membuat skrip shell POSIX ringan `scripts/zlce/zlce` (dan panduan symlink ke `~/bin/zlce`) yang bertindak sebagai dispatcher lokal di Termux dengan allowlist subperintah (`check`, `snapshot`, `collect`, `pull`, `push`, `clean-auth`).
* **Dependensi:** `TASK-027`
* **File:** `scripts/zlce/zlce`, `scripts/zlce/README.md`
* **Docs Terkait:** `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`, `13_COMMAND_TEMPLATES.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Skrip `zlce` mengeksekusi subperintah yang terdaftar di allowlist dengan benar.
  2. Menolak subperintah yang tidak dikenal dengan pesan error edukatif.
  3. Memiliki bit eksekusi `chmod +x` dan akhir baris Unix LF murni.
* **Test Case:** `TC-P5-04`
* **Metode Verifikasi:** Jalankan `./scripts/zlce/zlce check --help` dan `./scripts/zlce/zlce unknown` di lingkungan shell.

---

### TASK-029: Paste-Back Parser untuk Keluaran Terminal & Update Status Visual
* **Fase:** FASE 5
* **Deskripsi:** Membangun komponen modal `PasteBackModal.tsx` yang menerima teks hasil eksekusi terminal (keluaran `zlce-check.py` atau `git status`), memparsing hasil status, dan otomatis memperbarui badge status visual di PWA.
* **Dependensi:** `TASK-028`
* **File:** `src/components/mobile/PasteBackModal.tsx`, `src/utils/terminalParser.ts`
* **Docs Terkait:** `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`
* **Docs Impact:** `src/components/mobile/CommandHubTab.tsx`
* **Acceptance Criteria:**
  1. Parser mengenali output `RESULT: OK` (0 error) dan menandai verifikasi sukses.
  2. Parser mendeteksi pesan error linter dan menampilkan rincian baris penyebab kegagalan.
  3. Badge verifikasi pada task aktif otomatis terbarui setelah tempel hasil.
* **Test Case:** `TC-P5-05`
* **Metode Verifikasi:** Tempel output log terminal uji ke dalam kotak paste-back, verifikasi perubahan status badge.

---

### TASK-030: Integrasi Protokol Recovery Kasus A–D ke Template Command Hub
* **Fase:** FASE 5
* **Deskripsi:** Mengintegrasikan prosedur pemulihan darurat kanonik ZLCE (Kasus A: Sesi Terputus, Kasus B: Inkonsistensi Dokumen, Kasus C: File Rusak/Hilang, Kasus D: Konflik Git) ke dalam tombol pintas template pemulihan di Command Hub PWA.
* **Dependensi:** `TASK-029`
* **File:** `src/components/mobile/RecoveryCommandSection.tsx`, `src/components/RecoveryTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** `src/components/RecoveryTab.tsx`
* **Acceptance Criteria:**
  1. Tersedia 4 panel pemulihan sesuai Kasus A–D dengan instruksi langkah-demi-langkah.
  2. Perintah pemulihan snapshot lokal dan pemeriksaan integritas dapat disalin dengan 1 ketukan.
  3. Tidak menyertakan perintah berbahaya yang menghapus data tanpa konfirmasi.
* **Test Case:** `TC-P5-06`
* **Metode Verifikasi:** Buka tab Recovery, verifikasi ketersediaan template pemulihan Kasus A–D.

---

### ============================================================================
### FASE 6: GIT SYNC & KOLABORASI CABANG TIM
### ============================================================================

### TASK-031: Template Git Branch per Task (`task/TASK-xxx`) & Proteksi `main`
* **Fase:** FASE 6
* **Deskripsi:** Membangun generator perintah Git branch per task yang otomatis membuat cabang kerja terisolasi `task/TASK-xxx` saat task dimulai, mencegah commit langsung ke cabang `main` yang diproteksi.
* **Dependensi:** `TASK-030`
* **File:** `src/utils/gitBranchManager.ts`, `src/components/mobile/GitSyncTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/07_WORKFLOW_DESIGN.md`, `12_ARCHITECTURE_DECISIONS.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Template checkout cabang otomatis menghasilkan: `git checkout -b task/TASK-xxx`.
  2. PWA memperingatkan pengguna bila bekerja langsung pada branch `main`.
  3. Menampilkan status nama cabang aktif yang sinkron dengan Task ID.
* **Test Case:** `TC-P6-01`
* **Metode Verifikasi:** Periksa kesesuaian perintah checkout yang dihasilkan saat memilih task aktif.

---

### TASK-032: Injeksi Flag Identitas Commit Otomatis (`-c user.name=...`)
* **Fase:** FASE 6
* **Deskripsi:** Mengimplementasikan injeksi flag identitas dinamis pada seluruh template perintah commit Git (`git -c user.name="Budi" -c user.email="..." commit -m "..."`) sesuai anggota aktif yang dipilih, tanpa merusak konfigurasi Git global (ADR-05).
* **Dependensi:** `TASK-031`
* **File:** `src/utils/gitCommitFormatter.ts`, `src/components/mobile/GitSyncTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/12_ARCHITECTURE_DECISIONS.md`, `08_SECURITY_MODEL.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Template commit memuat flag `-c user.name` dan `-c user.email` anggota aktif.
  2. Pesan commit diawali dengan Task ID atomik (misal: `TASK-001: feat(pwa) ...`).
  3. Ganti anggota aktif di PWA seketika mengubah atribusi identitas pada template commit.
* **Test Case:** `TC-P6-02`
* **Metode Verifikasi:** Ganti anggota dari Budi ke Siti, pastikan flag identitas commit berubah seketika.

---

### TASK-033: Safe Pull Template (`--ff-only`) & Sinkronisasi Bertahap
* **Fase:** FASE 6
* **Deskripsi:** Membangun template penarikan pembaruan aman dari remote GitHub menggunakan flag `--ff-only` untuk mencegah merge commit tak disengaja di tablet, serta panduan rebase bila cabang bercabang.
* **Dependensi:** `TASK-032`
* **File:** `src/components/mobile/GitPullSection.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`, `07_WORKFLOW_DESIGN.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Template pull default menggunakan: `git pull --ff-only origin <branch>`.
  2. Menampilkan petunjuk langkah yang harus dilakukan bila fast-forward gagal.
  3. Memberikan panduan fetch status sebelum memulai task baru.
* **Test Case:** `TC-P6-03`
* **Metode Verifikasi:** Verifikasi sintaks template safe pull yang dihasilkan di tab Git Sync.

---

### TASK-034: Git Credential Cache Manager (`cache --timeout=900`) & Script `clean-auth`
* **Fase:** FASE 6
* **Deskripsi:** Membangun modul pengaturan cache kredensial Git di memori RAM Termux (timeout 15 menit / 900 detik) dan skrip `zlce clean-auth` untuk menghapus token seketika saat pergantian pemegang tablet (ADR-04).
* **Dependensi:** `TASK-033`
* **File:** `scripts/zlce/clean-auth.sh`, `src/components/mobile/SecurityAuthTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`, `12_ARCHITECTURE_DECISIONS.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Template konfigurasi cache menghasilkan: `git config --global credential.helper "cache --timeout=900"`.
  2. Skrip `clean-auth.sh` mematikan daemon credential cache: `git credential-cache exit`.
  3. Nol token atau password tersimpan di disk atau repositori.
* **Test Case:** `TC-P6-04`
* **Metode Verifikasi:** Jalankan skrip `clean-auth.sh` di Termux dan periksa pembersihan socket cache git.

---

### TASK-035: Deteksi & Panduan Resolusi Konflik Cabang Antar-Anggota
* **Fase:** FASE 6
* **Deskripsi:** Membangun antarmuka panduan resolusi konflik cabang Git: memberikan langkah terstruktur bila terjadi konflik saat merge/rebase antar-anggota tanpa menggunakan opsi destruktif (`--force`).
* **Dependensi:** `TASK-034`
* **File:** `src/components/mobile/ConflictResolutionWizard.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`, `07_WORKFLOW_DESIGN.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Wizard mendeteksi laporan konflik Git dari keluaran terminal paste-back.
  2. Menampilkan panduan membuka berkas berkonflik di editor terminal `micro`.
  3. Memandu verifikasi ulang via `zlce-check` sebelum menandai konflik terselesaikan.
* **Test Case:** `TC-P6-05`
* **Metode Verifikasi:** Tempelkan contoh output git conflict dan pastikan wizard panduan aktif.

---

### ============================================================================
### FASE 7: UJI INTEGRASI PENUH & VERIFIKASI TABLET FISIK SM-T225
### ============================================================================

### TASK-036: End-to-End Test Suite 14 Skenario ZLCE di Tablet
* **Fase:** FASE 7
* **Deskripsi:** Mengeksekusi dan memvalidasi seluruh 14 skenario operasional ZLCE (alur lengkap mulai dari pembuatan proyek, task breakdown, eksekusi AI, validasi WAL, hingga commit/push) di lingkungan tablet.
* **Dependensi:** `TASK-035`
* **File:** `src/tests/e2eScenarios.test.ts`, `src/components/TestHarnessTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`
* **Docs Impact:** `src/components/TestHarnessTab.tsx`
* **Acceptance Criteria:**
  1. Seluruh 14 skenario uji tereksekusi dengan status PASS 100%.
  2. Tidak ada kebocoran state antar skenario uji.
  3. Hasil uji terekam pada log pengujian terverifikasi.
* **Test Case:** `TC-P7-01`
* **Metode Verifikasi:** Jalankan test harness di browser dan periksa rekapitulasi kelulusan 14/14.

---

### TASK-037: Uji Ketahanan Android Low Memory Killer (LMK) & Recovery State
* **Fase:** FASE 7
* **Deskripsi:** Menguji dan memverifikasi ketahanan state PWA saat aplikasi diminimalkan atau dibunuh oleh Android LMK di latar belakang ketika pengguna berpindah ke Termux atau Browser AI pada perangkat RAM 3GB.
* **Dependensi:** `TASK-036`
* **File:** `src/tests/lmkRecovery.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`, `01_SYSTEM_OVERVIEW.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Draft editor dan state aktif pulih 100% setelah simulasi pemutusan memori / reload paksa.
  2. Zero loss context: tidak ada ketikan pengguna yang hilang melebihi batas debounce 400ms.
  3. Indikator pemulihan sesi tampil mengonfirmasi keberhasilan restorasi data.
* **Test Case:** `TC-P7-02`
* **Metode Verifikasi:** Simulasikan force kill tab di browser devtools, buka kembali dan verifikasi keutuhan state.

---

### TASK-038: Uji Operasi Offline 100% (Mode Pesawat) & Service Worker Cache
* **Fase:** FASE 7
* **Deskripsi:** Memverifikasi bahwa seluruh antarmuka PWA, perakit Context Pack, template Command Hub, dan pembaca dokumen beroperasi 100% secara lokal tanpa koneksi internet sama sekali.
* **Dependensi:** `TASK-037`
* **File:** `src/tests/offlineOperation.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Seluruh tab PWA dapat diakses saat koneksi offline / Mode Pesawat aktif.
  2. Service Worker menyajikan bundel aset dari cache tanpa error network.
  3. Penyimpanan draft dan generator template bekerja normal secara offline.
* **Test Case:** `TC-P7-03`
* **Metode Verifikasi:** Putuskan koneksi internet sepenuhnya, operasikan PWA, dan amati kelancaran fungsi.

---

### TASK-039: Verifikasi Fisik Ergonomi Layar Sentuh & Target 44px+ di SM-T225
* **Fase:** FASE 7
* **Deskripsi:** Melakukan audit ergonomi fisik antarmuka pada layar 8.7 inci Samsung Galaxy Tab A7 Lite: memastikan kenyamanan sentuhan jari tanpa stylus/keyboard eksternal dan tidak ada elemen UI yang terpotong.
* **Dependensi:** `TASK-038`
* **File:** `src/components/mobile/MobileLayout.tsx`, `docs/mobile/DEVICE_AUDIT.md`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `10_TEST_STRATEGY.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Semua tombol aksi memiliki target sentuh terukur >= 44x44px.
  2. Kontrol utama dapat dijangkau nyaman oleh jempol tangan pada posisi pegang tablet lanskap/potret.
  3. Teks terbaca jelas dengan kontras memadai pada layar WXGA+ (1340x800).
* **Test Case:** `TC-P7-04`
* **Metode Verifikasi:** Audit ukuran elemen via inspektur DOM dan checklist uji fisik perangkat.

---

### TASK-040: Audit Keamanan Zero-Secret & Verifikasi Pembersihan Token
* **Fase:** FASE 7
* **Deskripsi:** Melakukan pemindaian keamanan menyeluruh pada seluruh berkas repositori, draft LocalStorage, dan riwayat clipboard untuk memastikan nol rahasia (token, password, key) yang bocor atau tersimpan permanen.
* **Dependensi:** `TASK-039`
* **File:** `scripts/security-audit.sh`, `docs/mobile/SECURITY_AUDIT.md`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Pemindaian regex mendeteksi 0 Personal Access Token GitHub (`ghp_*`) dan 0 API key di repo.
  2. LocalStorage hanya memuat metadata publik dan draft Markdown.
  3. Perintah `clean-auth` terbukti membersihkan memori cache kredensial secara tuntas.
* **Test Case:** `TC-P7-05`
* **Metode Verifikasi:** Jalankan skrip pemindai pola rahasia terhadap seluruh direktori kerja.

---

### ============================================================================
### FASE 8: DOKUMENTASI & PANDUAN OPERASIONAL TERPADU
### ============================================================================

### TASK-041: Panduan Instalasi Tablet & Penyiapan Termux (`INSTALLATION.md`)
* **Fase:** FASE 8
* **Deskripsi:** Menyusun panduan instalasi langkah-demi-langkah yang presisi untuk Samsung Galaxy Tab A7 Lite: instalasi Termux dari F-Droid, penyiapan paket Linux (Python, Git, Micro), cloning repositori ke Termux Home, dan instalasi PWA ke layar utama.
* **Dependensi:** `TASK-040`
* **File:** `docs/mobile/INSTALLATION.md`, `docs/mobile/TERMUX_SETUP.md`
* **Docs Terkait:** `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`, `05_STORAGE_AND_SYNC.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Panduan memuat perintah copy-paste lengkap penyiapan Termux dari nol.
  2. Memuat instruksi instalasi PWA dari browser Chrome Android.
  3. Bahasa instruktif, jelas, dan bebas ambiguitas teknis.
* **Test Case:** `TC-P8-01`
* **Metode Verifikasi:** Review dokumen instalasi dan uji pembacaan alur instruksi.

---

### TASK-042: Panduan Pengguna & Alur Kerja Estafet 8 Anggota (`USER_GUIDE.md`)
* **Fase:** FASE 8
* **Deskripsi:** Menyusun panduan operasional harian bagi 8 anggota tim estafet: alur kerja 8 langkah, penggunaan selektor profil, pembagian tugas cabang, pengisian Context Pack, hingga checklist serah terima perangkat fisik.
* **Dependensi:** `TASK-041`
* **File:** `docs/mobile/USER_GUIDE.md`
* **Docs Terkait:** `docs/mobile/blueprint/07_WORKFLOW_DESIGN.md`, `14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Panduan mengilustrasikan alur kerja harian secara visual dan sistematis.
  2. Memuat protokol pergantian giliran tablet antar anggota tim.
  3. Tersedia panduan ringkas tips efisiensi RAM pada perangkat 3GB.
* **Test Case:** `TC-P8-02`
* **Metode Verifikasi:** Review dokumen panduan pengguna dan kelengkapan materi alur kerja.

---

### TASK-043: Panduan Penanganan Masalah & Recovery Mandiri (`TROUBLESHOOTING.md`)
* **Fase:** FASE 8
* **Deskripsi:** Menyusun panduan pemecahan masalah operasional umum di tablet: penanganan aplikasi terbunuh LMK, pemulihan draft sesi yang belum ter-commit, resolusi error izin penyimpanan, dan recovery Kasus A–D.
* **Dependensi:** `TASK-042`
* **File:** `docs/mobile/TROUBLESHOOTING.md`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Memuat daftar gejala error umum dan solusinya dalam bentuk matriks tanya-jawab.
  2. Menyediakan perintah recovery mandiri yang siap disalin ke Termux.
  3. Menegaskan larangan penggunaan perintah destruktif tanpa backup.
* **Test Case:** `TC-P8-03`
* **Metode Verifikasi:** Review matriks troubleshoot dan verifikasi keabsahan perintah recovery.

---

### ============================================================================
### FASE 9: AUDIT, TESTING & REVIEW MULTI-AI EKSTERNAL (CLAUDE, CHATGPT, DEEPSEEK)
### ============================================================================

### TASK-044: Generator Prompt Audit & Bundel File ZIP Review Multi-AI (Step 1)
* **Fase:** FASE 9
* **Deskripsi:** Membangun generator prompt audit, testing, dan arsitektur review komprehensif untuk Claude, ChatGPT, dan DeepSeek dengan format bahasa teknis, singkat, terstruktur, berbasis bukti nyata (anti-placeholder), siap unduh (.md), serta menyiapkan skrip dan berkas bundel ZIP proyek lengkap (public/assets/zlce-audit-review-bundle.zip, 69 berkas).
* **Dependensi:** `TASK-043`
* **File:** `src/utils/auditPromptGenerator.ts`, `scripts/create-audit-bundle.py`, `src/components/mobile/FeedbackReviewTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`, `CLAUDE_CHATGPT_HANDOVER.md`
* **Docs Impact:** `src/components/Header.tsx`, `src/App.tsx`
* **Acceptance Criteria:**
  1. Generator menghasilkan prompt mandat audit terstruktur dengan stop token model sasaran (Claude, ChatGPT, DeepSeek, Gemini).
  2. Prompt mewajibkan jawaban teknis tanpa basa-basi, berbasis bukti kode konkret, dan mengusulkan task terstruktur.
  3. Tersedia skrip pembundel ZIP otomatis yang mengemas 69 berkas kontrol, blueprint, dan kode ke `public/assets/zlce-audit-review-bundle.zip`.
  4. Tersedia aksi 1-ketukan salin, unduh file prompt `.md`, dan unduh bundel ZIP di tab Audit & Feedback.
* **Test Case:** `TC-P9-01`
* **Metode Verifikasi:** Bangkitkan prompt audit untuk 3 model, unduh berkas .md, dan verifikasi integritas berkas bundel ZIP.

---

### TASK-045: Modul Tanggapan Tanya-Jawab & Klarifikasi Permintaan File AI Eksternal (Step 2)
* **Fase:** FASE 9
* **Deskripsi:** Membangun modul dialog teknis untuk menanggapi pertanyaan klarifikasi arsitektur, review awal, dan permintaan berkas dari Claude, ChatGPT, atau DeepSeek saat mereka mengevaluasi proyek.
* **Dependensi:** `TASK-044`
* **File:** `src/utils/auditPromptGenerator.ts`, `src/components/mobile/FeedbackReviewTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`, `08_SECURITY_MODEL.md`
* **Docs Impact:** -
* **Acceptance Criteria:**
  1. Tersedia kolom input pertanyaan dan tombol cepat preset topik umum (LMK RAM 3GB, Zero-Secret, Ergonomi 44px, Offline 100%).
  2. Generator menghasilkan jawaban teknis terstruktur berbasis Single Source of Truth proyek dengan referensi berkas terkait.
  3. Menyediakan tombol 1-ketukan salin tanggapan untuk dikirimkan kembali ke AI peninjau.
* **Test Case:** `TC-P9-02`
* **Metode Verifikasi:** Masukkan pertanyaan klarifikasi dan verifikasi akurasi serta kelengkapan cuplikan jawaban teknis.

---

### TASK-046: Integrator Review Final & Perencana Task Perbaikan Terstruktur (Step 3)
* **Fase:** FASE 9
* **Deskripsi:** Membangun antarmuka dan modul parser ulasan review final eksternal yang membedah hasil temuan (skor, kelebihan, celah arsitektur), menawarkan proposal tindakan perbaikan, membaginya ke dalam sub-task terstruktur, dan meminta persetujuan pengguna sebelum dialirkan ke backlog.
* **Dependensi:** `TASK-045`
* **File:** `src/utils/auditPromptGenerator.ts`, `src/components/mobile/FeedbackReviewTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/07_WORKFLOW_DESIGN.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Tersedia area upload/tempel laporan review final dari Claude, ChatGPT, atau DeepSeek.
  2. Parser mengekstrak skor kesiapan produksi, ringkasan eksekutif, dan temuan risiko beserta tingkat keparahan.
  3. Fitur "Tawarkan Tindakan Perbaikan" memecah rekomendasi menjadi usulan task baru dengan pilihan persetujuan interaktif (checkbox).
  4. Penegakan prinsip kehati-hatian: task baru hanya diterapkan ke `SESSION_STATE.md` setelah tombol persetujuan ditekan oleh pengguna.
* **Test Case:** `TC-P9-03`
* **Metode Verifikasi:** Muat contoh laporan review, periksa daftar usulan task, dan uji integrasi task yang disetujui ke status sesi.

---

### ============================================================================
### FASE 10: REMEDIASI AUDIT & PENGERASAN SISTEM (AUD-001 s/d AUD-014)
### ============================================================================

### TASK-047: Zero-Secret Pre-Commit Hardening (AUD-001)
* **Fase:** FASE 10 (P0 - CRITICAL)
* **Deskripsi:** Membangun skrip instalasi git hook pre-commit otomatis (`scripts/install-hooks.sh`) yang mengeksekusi `scripts/security-audit.sh` secara mandatori di Termux sebelum setiap `git commit` diizinkan, mencegah kebocoran token ghp_*, PAT, dan private key.
* **Dependensi:** `TASK-046`
* **File:** `scripts/install-hooks.sh`, `scripts/security-audit.sh`, `docs/mobile/SECURITY_AUDIT.md`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Skrip `scripts/install-hooks.sh` mengonfigurasi `.git/hooks/pre-commit` dengan izin eksekusi (`chmod +x`).
  2. Pre-commit hook memblokir commit jika terdeteksi pola secret sensitif dengan exit code != 0.
  3. Menyediakan pesan instruksi pembersihan ramah layar sentuh jika commit dibatalkan.
* **Test Case:** `TC-P10-01`
* **Metode Verifikasi:** Jalankan `bash scripts/install-hooks.sh` dan simulasi commit dengan secret tiruan.

---

### TASK-048: LMK Hook Integration Lifecycle Test (AUD-002)
* **Fase:** FASE 10 (P0 - CRITICAL)
* **Deskripsi:** Mengimplementasikan uji integrasi siklus hidup React nyata untuk hook `useAutoDraftCache` pada event `visibilitychange` 'hidden' dan `pagehide`, membuktikan synchronous cache flush sebelum memori dihentikan Android LMK.
* **Dependensi:** `TASK-047`
* **File:** `src/tests/lmkRecovery.test.ts`, `src/hooks/useAutoDraftCache.ts`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Pengujian memvalidasi eksekusi synchronous flush saat transisi tab ke background.
  2. Data draft LocalStorage tidak terpotong (zero data loss) saat komponen di-unmount tiba-tiba.
* **Test Case:** `TC-P10-02`
* **Metode Verifikasi:** Jalankan unit test lmkRecovery dan verifikasi persistensi buffer draft.

---

### TASK-049: Browser Restart Validation (AUD-003)
* **Fase:** FASE 10 (P0 - CRITICAL)
* **Deskripsi:** Memvalidasi pemulihan draft sesi setelah browser di-restart penuh (cold-start recovery) dari LocalStorage tanpa kehilangan status atau dependensi task.
* **Dependensi:** `TASK-048`
* **File:** `src/tests/browserRecovery.test.ts`, `src/hooks/useAutoDraftCache.ts`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Skenario cold-start browser memulihkan status sesi terakhir dari storage secara otomatis.
  2. State yang dipulihkan tervalidasi 100% lulus aturan kanonik Invarian I1-I5.
* **Test Case:** `TC-P10-03`
* **Metode Verifikasi:** Eksekusi skenario uji cold-start pemulihan LocalStorage.

---

### TASK-050: Physical SM-T225 LMK Verification (AUD-004)
* **Fase:** FASE 10 (P0 - CRITICAL)
* **Deskripsi:** Menyusun panduan protokol dan skrip pengujian alokasi beban RAM nyata di Termux (`scripts/test-lmk-physical.sh`) untuk memicu LMK pada tablet Samsung Galaxy Tab A7 Lite fisik.
* **Dependensi:** `TASK-049`
* **File:** `docs/mobile/DEVICE_AUDIT.md`, `scripts/test-lmk-physical.sh`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Skrip `test-lmk-physical.sh` mampu mengalokasikan RAM bertahap (1.5GB - 2.2GB) untuk memicu sinyal LMK Android secara aman.
  2. Prosedur pemulihan PWA setelah terminasi background tercatat di DEVICE_AUDIT.md.
* **Test Case:** `TC-P10-04`
* **Metode Verifikasi:** Jalankan skrip alokasi di terminal dan catat log pemulihan state.

---

### TASK-051: Browser Multi-User Session Isolation (AUD-005)
* **Fase:** FASE 10 (P0 - CRITICAL)
* **Deskripsi:** Menerapkan partisi namespace LocalStorage/draft per anggota tim aktif (`zlce_draft_[memberId]`) agar pergantian anggota di tablet bersama tidak menimpa pekerjaan draft anggota lain.
* **Dependensi:** `TASK-050`
* **File:** `src/hooks/useAutoDraftCache.ts`, `src/data/teamMembers.ts`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Kunci cache draft otomatis menyertakan alias/ID anggota aktif.
  2. Pergantian anggota tim memuat draft milik anggota terkait tanpa kontaminasi.
* **Test Case:** `TC-P10-05`
* **Metode Verifikasi:** Beralih antar 2 anggota dan periksa independensi isi draft masing-masing.

---

### TASK-052: Task Claim Exclusivity & Conflict Guard (AUD-006)
* **Fase:** FASE 10 (P1 - HIGH)
* **Deskripsi:** Memperkuat pengaman integritas status klaim task untuk mencegah race condition atau klaim ganda tak sengaja pada mode offline.
* **Dependensi:** `TASK-051`
* **File:** `src/utils/taskClaimManager.ts`, `src/types/mobile.ts`
* **Docs Terkait:** `docs/mobile/blueprint/07_WORKFLOW_DESIGN.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Penolakan mutlak klaim jika ada task lain yang sedang berstatus IN_PROGRESS.
  2. Dialog konfirmasi eksplisit jika anggota ingin mengambil alih task dari anggota lain.
* **Test Case:** `TC-P10-06`
* **Metode Verifikasi:** Jalankan unit test taskClaimManager pada skenario tumpang-tindih.

---

### TASK-053: Transactional File Persistence (AUD-007)
* **Fase:** FASE 10 (P1 - HIGH)
* **Deskripsi:** Mengimplementasikan pola penulisan transaksional (double-buffering / temporary file) pada penulisan berkas kontrol untuk mencegah korupsi berkas saat daya baterai habis.
* **Dependensi:** `TASK-052`
* **File:** `src/utils/fileExport.ts`, `src/hooks/useAutoDraftCache.ts`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Data ditulis ke buffer sementara sebelum menggantikan target utama.
  2. Mekanisme checksum verifikasi integritas sebelum komit penyimpanan.
* **Test Case:** `TC-P10-07`
* **Metode Verifikasi:** Simulasikan kegagalan penulisan di tengah proses dan verifikasi preservasi state sebelumnya.

---

### TASK-054: Offline E2E Navigation & SW Cache Check (AUD-008)
* **Fase:** FASE 10 (P1 - HIGH)
* **Deskripsi:** Memverifikasi secara menyeluruh seluruh rute navigasi tab, aset ikon, dan komputasi lokal berfungsi 100% saat Service Worker offline tanpa koneksi internet.
* **Dependensi:** `TASK-053`
* **File:** `public/sw.js`, `src/tests/offlineOperation.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Tidak ada permintaan jaringan eksternal yang menyebabkan UI hang saat offline.
  2. Seluruh 10 tab mobile workbench dapat diakses mulus tanpa sambungan data.
* **Test Case:** `TC-P10-08`
* **Metode Verifikasi:** Jalankan offline test suite dan verifikasi kelengkapan cache sw.js.

---

### TASK-055: Git Workflow Canonicalization (AUD-009)
* **Fase:** FASE 10 (P1 - HIGH)
* **Deskripsi:** Menstandarkan alur kerja git estafet multi-cabang tanpa opsi berbahaya (`--force`), melengkapi template penarikan cepat `--ff-only`, dan panduan resolusi konflik cabang.
* **Dependensi:** `TASK-054`
* **File:** `src/data/commandTemplates.ts`, `docs/mobile/blueprint/06_REPOSITORY_CHANGES.md`
* **Docs Terkait:** `docs/mobile/blueprint/06_REPOSITORY_CHANGES.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Katalog perintah menolak seluruh varian perintah non-fast-forward destruktif.
  2. Panduan langkah resolusi konflik cabang terdokumentasi terpadu.
* **Test Case:** `TC-P10-09`
* **Metode Verifikasi:** Verifikasi template perintah git via commandSanitizer dan verifier rules.

---

### TASK-056: Test Suite Normalization (AUD-010)
* **Fase:** FASE 10 (P1 - HIGH)
* **Deskripsi:** Mengonsolidasikan seluruh unit test, linter, dan pemeriksaan integrasi ke dalam runner CLI tunggal yang terintegrasi dengan `npm test` dan CI/CD pipeline.
* **Dependensi:** `TASK-055`
* **File:** `scripts/run-tests.py`, `package.json`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Perintah `npm test` menjalankan runner komprehensif dengan laporan ringkas per fase.
  2. Exit code 0 jika seluruh check pass, exit code 1 jika ada kegagalan.
* **Test Case:** `TC-P10-10`
* **Metode Verifikasi:** Jalankan `npm test` dan periksa status ringkasan akhir.

---

### TASK-057: Blueprint Release Baseline Sync (AUD-011)
* **Fase:** FASE 10 (P2 - MEDIUM)
* **Deskripsi:** Melakukan sinkronisasi silang antara 14 dokumen cetak biru dengan implementasi kode nyata agar tidak ada disparitas atau over-claiming dalam dokumentasi arsitektur.
* **Dependensi:** `TASK-056`
* **File:** `docs/mobile/MOBILE_BLUEPRINT.md`, `docs/mobile/blueprint/*`
* **Docs Terkait:** `docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Seluruh referensi berkas dan komponen di cetak biru sesuai dengan file tree aktual.
  2. Status implementasi pada master blueprint mencerminkan kondisi riil v4.0.0.
* **Test Case:** `TC-P10-11`
* **Metode Verifikasi:** Jalankan inspeksi integritas tautan dan berkas pada dokumen cetak biru.

---

### TASK-058: Audit Bundle Reproducibility (AUD-012)
* **Fase:** FASE 10 (P2 - MEDIUM)
* **Deskripsi:** Menjamin determinisme dan keterulangan pembuatan berkas bundel ZIP audit dengan pemetaan checksum SHA-256 berkas kontrol.
* **Dependensi:** `TASK-057`
* **File:** `scripts/create-audit-bundle.py`, `scripts/sync-assets.mjs`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Generator bundel menghasilkan checksum manifest yang dapat diverifikasi ulang.
  2. Ukuran dan daftar berkas bundel sinkron di seluruh environment.
* **Test Case:** `TC-P10-12`
* **Metode Verifikasi:** Eksekusi skrip bundel dan bandingkan hash berkas output.

---

### TASK-059: React State Updater Purity (AUD-013)
* **Fase:** FASE 10 (P2 - LOW)
* **Deskripsi:** Mengaudit dan membersihkan pemanggilan fungsi mutasi state pada komponen-komponen mobile agar bebas dari efek samping (functional state updater discipline).
* **Dependensi:** `TASK-058`
* **File:** `src/components/mobile/FeedbackReviewTab.tsx`, `src/App.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Seluruh setState berbasis previous state menggunakan fungsi arrow murni `(prev => ...)`.
  2. Tidak ada mutasi langsung terhadap array atau objek state.
* **Test Case:** `TC-P10-13`
* **Metode Verifikasi:** Linting dan pengujian rendering React component.

---

### TASK-060: Documentation & Troubleshooting Revision (AUD-014)
* **Fase:** FASE 10 (P2 - LOW)
* **Deskripsi:** Memperbarui buku panduan operasional pengguna (`USER_GUIDE.md`) dan matriks pemecahan masalah (`TROUBLESHOOTING.md`) dengan temuan audit terbaru.
* **Dependensi:** `TASK-059`
* **File:** `docs/mobile/USER_GUIDE.md`, `docs/mobile/TROUBLESHOOTING.md`
* **Docs Terkait:** `docs/mobile/blueprint/07_WORKFLOW_DESIGN.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Panduan memuat solusi untuk seluruh 14 temuan audit AUD-001 s/d AUD-014.
  2. Langkah penanganan kegagalan termutakhirkan dengan skrip-skrip baru.
* **Test Case:** `TC-P10-14`
* **Metode Verifikasi:** Tinjau kelengkapan dokumen USER_GUIDE.md dan TROUBLESHOOTING.md.

---

### ============================================================================
### FASE 11: REMEDIASI AUDIT LANJUTAN [CLAUDE 5.5 REVIEW - AUD-015 s.d. AUD-028]
### ============================================================================

### TASK-061: Bundle Closure Verification Gate (AUD-015)
* **Fase:** FASE 11 (P1 - HIGH)
* **Deskripsi:** Memperbarui generator bundel `scripts/create-audit-bundle.py` agar menyertakan seluruh modul dependensi yang hilang (`markdownParser`, `zlceValidator`, `relayHandoverGenerator`, `auditPromptGenerator`, `src/components/**`, `src/index.css`, `package-lock.json`, `scripts/zlce-collect.py`), serta menambahkan fungsi gerbang build `verify_bundle_closure()` yang memvalidasi bahwa seluruh berkas impor relatif terselesaikan sempurna di dalam bundel ZIP.
* **Dependensi:** `TASK-060`
* **File:** `scripts/create-audit-bundle.py`, `scripts/sync-assets.mjs`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `FILES_TO_BUNDLE` mencakup seluruh berkas pustaka dan utilitas TypeScript yang diimpor oleh tes dan modul mobile.
  2. Fungsi `verify_bundle_closure` mengaudit AST/regex import di dalam arsip ZIP sebelum selesai dan menghentikan proses (exit 1) jika ada broken import.
  3. Pembuatan bundel ZIP bersih lulus verifikasi closure 100% tanpa celah module tidak ditemukan.
* **Test Case:** `TC-P11-01`
* **Metode Verifikasi:** Jalankan `python3 scripts/create-audit-bundle.py` dan verifikasi bahwa closure check lulus dengan 0 missing modules.

---

### TASK-062: Runner Metrics Truthfulness & Dynamic Counter (AUD-016)
* **Fase:** FASE 11 (P1 - HIGH)
* **Deskripsi:** Mengganti string statis/hardcoded "44/44 checks OK" pada `scripts/run-tests.py` dengan kelas `Counter` dinamis yang mencatat jumlah pemeriksaan nyata. Memperbarui banner runner ke v4.0.0/v4.1.0 dan menyelaraskan versi di `package.json` dari 0.0.0 menjadi 4.0.0.
* **Dependensi:** `TASK-061`
* **File:** `scripts/run-tests.py`, `package.json`, `SESSION_STATE.md`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `run-tests.py` menghitung total step dan pass/fail secara real-time via `counter.record(ok)`.
  2. Banner dan keluaran teks mencerminkan versi rilis v4.0.0/v4.1.0 secara konsisten.
  3. `package.json` memiliki field version `4.0.0` sinkron dengan dokumentasi.
* **Test Case:** `TC-P11-02`
* **Metode Verifikasi:** Jalankan `python3 scripts/run-tests.py` dan periksa kesesuaian angka hasil penghitungan dinamis dan banner.

---

### TASK-063: Strict Shell Injection Hardening & POSIX Quoting (AUD-017)
* **Fase:** FASE 11 (P1 - HIGH)
* **Deskripsi:** Menutup celah injeksi argumen dan opsi git (`-c core.hooksPath=...`, `git add --force *`) pada pembangun perintah commit. Menerapkan POSIX single-quote escaping `shellQuote`, validasi ketat path repositori `assertSafeRepoPath`, sanitasi nama/email anggota, dan penolakan eksplisit pada taskId tidak valid (throw error alih-alih silent fallback ke TASK-001).
* **Dependensi:** `TASK-062`
* **File:** `src/utils/commandSanitizer.ts`, `src/utils/gitCommitFormatter.ts`, `src/utils/commandBinder.ts`, `src/data/commandTemplates.ts`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Impact:** `src/tests/gitWorkflow.test.ts`
* **Acceptance Criteria:**
  1. `shellQuote` membungkus argumen dengan kutip tunggal POSIX (`'...'`) dengan escaping `'` yang aman.
  2. `assertSafeRepoPath` menolak flag argumen (`--force`), wildcard (`*`), direktori sensitif (`.git`, `.env`), dan traversal (`..`).
  3. Format `git add` menggunakan pemisah opsi eksplisit `git add -- <files>`.
  4. Unit test memverifikasi penolakan injeksi konfigurasi git dan karakter escape shell (`!`, `"`, `$`).
* **Test Case:** `TC-P11-03`
* **Metode Verifikasi:** Eksekusi unit test `gitWorkflow.test.ts` dan jalankan skenario injeksi payload berbahaya.

---

### TASK-064: Shared Tablet Draft Isolation & Stale Closure Fix (AUD-018)
* **Fase:** FASE 11 (P1 - HIGH)
* **Deskripsi:** Memperbaiki kebocoran draft antar-anggota tim di tablet bersama pada hook `useAutoDraftCache.ts`. Menghilangkan stale closure saat pergantian `zlce_active_member_id`, menghapus fallback berbahaya ke global key `localStorage.getItem(storageKey)`, menggunakan `dirtyKeyRef` untuk pencatatan flush, dan memindahkan side-effects keluar dari updater fungsi state React.
* **Dependensi:** `TASK-063`
* **File:** `src/hooks/useAutoDraftCache.ts`, `src/tests/multiUserIsolation.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`, `14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Kunci penyimpanan selalu dikomputasi secara dinamis saat operasi baca/tulis draft dilakukan (`getScopedStorageKey`).
  2. Pergantian anggota aktif memuat draft bersih khusus anggota tersebut tanpa ada kontaminasi draft anggota sebelumnya.
  3. Pemanggilan `setDraftContentState` murni tanpa efek samping asynchronous.
  4. Pengujian multiUserIsolation membuktikan isolasi storage sempurna antara Anggota A dan Anggota B.
* **Test Case:** `TC-P11-04`
* **Metode Verifikasi:** Jalankan unit test `multiUserIsolation.test.ts` dan verifikasi simulasi ganti anggota.

---

### TASK-065: Termux Dispatcher Robustness & Safe Pull (AUD-019)
* **Fase:** FASE 11 (P2 - MEDIUM)
* **Deskripsi:** Memperbaiki logika `pull` pada CLI dispatcher `scripts/zlce/zlce` agar tidak memanggil `checkout -B ... --ff-only` (yang menyebabkan exit 129 atau penghapusan unpushed local commit). Menggantinya dengan alur aman: verifikasi working tree bersih, `fetch origin <branch>`, `checkout <branch>`, dan `merge --ff-only origin/<branch>`. Memblokir `push` langsung ke cabang `main` (exit 1), dan menyatukan pemanggilan `clean-auth` ke skrip kanonik.
* **Dependensi:** `TASK-064`
* **File:** `scripts/zlce/zlce`, `scripts/zlce/README.md`
* **Docs Terkait:** `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`, `06_REPOSITORY_CHANGES.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `zlce pull` menjalankan fast-forward pull tanpa opsi checkout yang tidak valid.
  2. Perintah menolak pull jika working tree dalam keadaan kotor dan tidak pernah menghapus commit lokal yang belum dipush.
  3. `zlce push main` diblokir dengan exit 1 untuk melindungi integritas branch utama.
  4. `zlce clean-auth` mendelegasikan eksekusi langsung ke `clean-auth.sh`.
* **Test Case:** `TC-P11-05`
* **Metode Verifikasi:** Jalankan perintah `zlce pull`, `zlce push main`, dan `zlce clean-auth` di repositori uji.

---

### TASK-066: Security Audit Coverage & Fail-Closed Pre-Commit Hook (AUD-020)
* **Fase:** FASE 11 (P2 - MEDIUM)
* **Deskripsi:** Memperluas cakupan pemindaian `scripts/security-audit.sh` dan memperkeras pre-commit hook. Memperbaiki regex AUDIT 4 agar mendeteksi kredensial berkutip tunggal (`token: '...'`), menambahkan AUDIT 4b untuk URL remote berkredensial (`https://user:token@...`) dan token tambahan (`ghs_`, `sk-ant-`, `xox*`), membuat AUDIT 6 fail-closed jika interpreter tidak tersedia. Pre-commit hook memindai staged diff (`git diff --cached`) dan fail-closed jika audit script absen.
* **Dependensi:** `TASK-065`
* **File:** `scripts/security-audit.sh`, `scripts/install-hooks.sh`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `security-audit.sh` mendeteksi penetapan variabel dengan kutip tunggal, ganda, maupun URL remote dengan user:token.
  2. Pemeriksaan katalog perintah pada AUDIT 6 menangani ketiadaan modul tanpa mematikan skrip diam-diam.
  3. Pre-commit hook memblokir commit yang memuat secret di staged changes dan mencegah bypass fail-open.
* **Test Case:** `TC-P11-06`
* **Metode Verifikasi:** Jalankan `bash scripts/security-audit.sh` dan uji penolakan commit bertoken dengan hook pre-commit.

---

### TASK-067: Bundle Archive File Permissions Normalization (AUD-021)
* **Fase:** FASE 11 (P2 - MEDIUM)
* **Deskripsi:** Menetapkan atribut eksekusi POSIX (`external_attr = 0o100755 << 16` untuk berkas `.sh` dan skrip CLI `zlce`, serta `0o100644 << 16` untuk berkas reguler) di dalam `scripts/create-audit-bundle.py` dan `scripts/create-lmk-bundle.py`. Memperbarui seluruh pemanggilan skrip shell agar menggunakan `bash <skrip>` eksplisit untuk toleransi sistem file Android FAT/sdcard.
* **Dependensi:** `TASK-066`
* **File:** `scripts/create-audit-bundle.py`, `scripts/create-lmk-bundle.py`, `scripts/security-audit.sh`
* **Docs Terkait:** `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Berkas zip yang dihasilkan memiliki permission file `rwxr-xr-x` untuk seluruh skrip bash.
  2. Ekstraksi zip pada lingkungan Linux bersih langsung mempertahankan hak eksekusi skrip tanpa perlu `chmod +x` manual.
  3. Seluruh skrip audit dan runner memanggil skrip melalui interpreter `bash` eksplisit.
* **Test Case:** `TC-P11-07`
* **Metode Verifikasi:** Buat bundel zip, ekstrak di folder terisolasi, periksa permission berkas dengan `ls -la scripts/`.

---

### TASK-068: Unified Handover Clean-Auth & Credential Verification (AUD-022)
* **Fase:** FASE 11 (P2 - MEDIUM)
* **Deskripsi:** Menyatukan implementasi pembersihan autentikasi serah terima tablet pada `scripts/zlce/clean-auth.sh`, `src/utils/handoverChecklist.ts`, dan katalog template. Menghapus socket git credential cache di semua lokasi standar (`$HOME/.git-credential-cache` dan `$XDG_CACHE_HOME/git/credential`), melepas identitas global `user.name` & `user.email`, dan memverifikasi bahwa URL remote tidak mengandung token tertanam.
* **Dependensi:** `TASK-067`
* **File:** `scripts/zlce/clean-auth.sh`, `src/utils/handoverChecklist.ts`, `src/data/commandTemplates.ts`, `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `clean-auth.sh` mematikan daemon credential-cache, menghapus file socket dari kedua path XDG dan HOME, serta melepas konfigurasi global git.
  2. Skrip melakukan verifikasi pasca-pembersihan dan mengembalikan exit code 1 jika ada kredensial yang masih tersisa.
  3. Komponen handover checklist dan panduan operasional merefleksikan instruksi sourcing shell dan pembersihan riwayat terminal.
* **Test Case:** `TC-P11-08`
* **Metode Verifikasi:** Jalankan `bash scripts/zlce/clean-auth.sh` dan verifikasi luaran status bersih 100%.

---

### TASK-069: Active Secret Redaction Layer on Storage & Context Pack (AUD-023)
* **Fase:** FASE 11 (P2 - MEDIUM)
* **Deskripsi:** Membangun modul utilitas `src/utils/redactSecrets.ts` untuk menyaring dan menyamarkan token/kunci API sensitif (`ghp_`, `github_pat_`, `sk-ant-`, `AIza`, AWS, private keys, URL berkredensial) menjadi `[REDACTED]`. Mengintegrasikan fungsi redaksi ini pada penyimpanan auto-draft `useAutoDraftCache`, generator context pack `contextPackGenerator.ts`, dan ekspor berkas `fileExport.ts`.
* **Dependensi:** `TASK-068`
* **File:** `src/utils/redactSecrets.ts`, `src/hooks/useAutoDraftCache.ts`, `src/utils/contextPackGenerator.ts`, `src/utils/fileExport.ts`, `src/utils/promptGenerator.ts`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`, `03_PWA_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Teks yang memuat pola token rahasia otomatis diredaksi sebelum disimpan ke LocalStorage atau diekspor ke context pack.
  2. UI memberikan feedback/peringatan visual jika ada token yang diredaksi dari masukan editor.
  3. Unit test memverifikasi tidak ada token yang lolos ke hasil generate context pack.
* **Test Case:** `TC-P11-09`
* **Metode Verifikasi:** Uji input berisikan sample dummy token dan verifikasi redaksi string pada hasil ekspor.

---

### TASK-070: LMK Documentation Accuracy & Physical Verification Log (AUD-024)
* **Fase:** FASE 11 (P2 - MEDIUM)
* **Deskripsi:** Mengoreksi pernyataan teknis pada `docs/mobile/DEVICE_AUDIT.md` mengenai mekanisme Android LMK (menjelaskan bahwa LMK kernel mengirim SIGKILL saat krisis memori, sedangkan `visibilitychange`/`pagehide` dipicu oleh siklus hidup peramban web saat backgrounding). Memperbarui skrip `scripts/test-lmk-physical.sh` agar mencatat log uji terstruktur berbasis `MemAvailable` dan menghasilkan output bukti uji verifikasi fisik.
* **Dependensi:** `TASK-069`
* **File:** `docs/mobile/DEVICE_AUDIT.md`, `scripts/test-lmk-physical.sh`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Dokumentasi arsitektur akurat menjelaskan perbedaan antara sinyal daur hidup browser dan tindakan kernel SIGKILL.
  2. `test-lmk-physical.sh` membaca `/proc/meminfo` secara adaptif dan membuat berkas log fisik bertimestamp di Termux.
  3. Batas uji alokasi memori disesuaikan dengan kuota aman perangkat 3GB (maksimum 60% sisa memori).
* **Test Case:** `TC-P11-10`
* **Metode Verifikasi:** Jalankan `bash scripts/test-lmk-physical.sh` dan periksa berkas log hasil pengujian memori.

---

### TASK-071: Localhost Binding & Environment Decoupling (AUD-025)
* **Fase:** FASE 11 (P2 - MEDIUM)
* **Deskripsi:** Mengamankan pengikatan host dev server Vite menjadi `127.0.0.1` pada konfigurasi lokal tablet mandiri guna mencegah akses tanpa otorisasi via jaringan lokal Wi-Fi bersama. Membersihkan capability server AI Studio yang usang pada `metadata.json` (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`) untuk konsistensi model murni offline & zero-secret, serta memastikan kestabilan dependensi.
* **Dependensi:** `TASK-070`
* **File:** `package.json`, `metadata.json`, `vite.config.ts`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Dev server mengikat IP localhost lokal `127.0.0.1` secara default untuk mode mandiri.
  2. `metadata.json` bebas dari capability backend eksternal yang tidak digunakan.
  3. Seluruh skrip npm beroperasi tanpa warning konfigurasi port/host.
* **Test Case:** `TC-P11-11`
* **Metode Verifikasi:** Periksa luaran startup server Vite dan inspeksi isi `metadata.json`.

---

### TASK-072: zlce-check Verification Evidence & Approval Authentication (AUD-026)
* **Fase:** FASE 11 (P2 - MEDIUM)
* **Deskripsi:** Memperketat validasi `scripts/zlce-check.py` terhadap integritas tabel SESSION_STATE. Kolom 'Bukti Verifikasi' diwajibkan memiliki rujukan ID test runner valid (`TC-P\d+-\d+`) atau hash commit git yang dapat diverifikasi saat bendera `--git` aktif. Menolak persetujuan kosong atau format nama di luar daftar registri anggota yang sah pada kolom 'Disetujui'.
* **Dependensi:** `TASK-071`
* **File:** `scripts/zlce-check.py`, `SESSION_STATE.md`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `zlce-check.py` memvalidasi keberadaan test case ID pada berkas runner uji untuk setiap task `DONE`.
  2. Nilai bukti verifikasi acak/palsu menghasilkan error/warning saat pemeriksaan `--strict`.
  3. Format persetujuan `ya (oleh: Nama)` divalidasi terhadap daftar anggota terdaftar.
* **Test Case:** `TC-P11-12`
* **Metode Verifikasi:** Jalankan `python3 scripts/zlce-check.py . --strict --no-git` dan uji dengan sampel data bukti palsu.

---

### TASK-073: Quantitative Touch Target & Ergonomics Verification (AUD-027)
* **Fase:** FASE 11 (P3 - LOW)
* **Deskripsi:** Mengganti pengujian tautologis TC-P7-04 pada `scripts/run-tests.py` dengan pemeriksaan kuantitatif terhadap pemenuhan standar ergonomi layar sentuh 8.7" (resolusi 1340x800 & 800x1340). Memverifikasi bahwa seluruh tombol dan elemen input interaktif di `src/components/mobile/` menerapkan utilitas kelas `touch-target-44`, `min-h-[44px]`, atau `min-w-[44px]` secara konsisten.
* **Dependensi:** `TASK-072`
* **File:** `scripts/run-tests.py`, `src/tests/touchTarget.test.ts`, `docs/mobile/DEVICE_AUDIT.md`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Seluruh komponen interaktif mobile divalidasi memiliki deklarasi ukuran sentuh minimal 44x44px.
  2. Test runner menguji kepatuhan kelas ergonomi pada seluruh elemen tombol dan tab secara terprogram.
  3. Dokumen `DEVICE_AUDIT.md` diperbarui dengan metodologi pengujian kuantitatif.
* **Test Case:** `TC-P11-13`
* **Metode Verifikasi:** Eksekusi unit test `touchTarget.test.ts` dan jalankan runner uji terpadu.

---

### TASK-074: Token Budget Safety Factor & Multi-Model Parameterization (AUD-028)
* **Fase:** FASE 11 (P3 - LOW)
* **Deskripsi:** Menyesuaikan faktor keamanan konversi token pada `tokenBudgetAdapter.ts` dan `contextPackGenerator.ts` (menggunakan rasio konservatif 3.0-3.2 char/token untuk teks bilingual & kode terformat). Memparameterisasi pilihan model AI sehingga mendukung keluarga model `Claude 3.5 Sonnet`, `Claude 5.5 Sonnet`, `Gemini 1.5/2.0 Pro/Flash`, dan `GPT-4o` secara dinamis tanpa hardcoded string model tunggal pada test runner.
* **Dependensi:** `TASK-073`
* **File:** `src/utils/contextPackGenerator.ts`, `src/utils/tokenBudgetAdapter.ts`, `src/components/mobile/TokenBudgetSelector.tsx`, `scripts/run-tests.py`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Estimator token menerapkan rasio aman (3 char/token) pada preset kompak untuk mencegah truncate di LLM eksternal.
  2. Selector dan adapter model mendukung pemilihan model Claude 5.5 Sonnet dan Claude 3.5 Sonnet sebagai parameter dinamis.
  3. Test case `TC-P9-03` menerima identitas model multi-versi secara fleksibel.
* **Test Case:** `TC-P11-14`
* **Metode Verifikasi:** Jalankan unit test token budget dan uji pembuatan context pack dengan preset Claude 5.5 Sonnet.

---

### ============================================================================
### FASE 12: GA PRODUCTION HARDENING & CHATGPT GPT-6 AUDIT REMEDIATION
### ============================================================================

### TASK-075: Bundle Closure & Export Parity Gate (AUD2-001)
* **Fase:** FASE 12 (P0 - CRITICAL)
* **Deskripsi:** Memperbaiki `scripts/create-audit-bundle.py` agar menyertakan modul `src/utils/redactSecrets.ts` dan `src/tests/touchTarget.test.ts` ke dalam `FILES_TO_BUNDLE`. Membangun verifikasi penutup otomatis (*closure checker*) dinamis yang memindai seluruh berkas kode di bawah `src/` dan memastikan 100% berkas produksi dan pengujian masuk ke dalam bundel ZIP tanpa ada berkas yang tertinggal. Menghasilkan ulang bundel ZIP `public/assets/zlce-audit-review-bundle.zip` lengkap dengan `SHA256SUMS.txt`.
* **Dependensi:** `TASK-074`
* **File:** `scripts/create-audit-bundle.py`, `public/assets/zlce-audit-review-bundle.zip`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `src/utils/redactSecrets.ts` dan `src/tests/touchTarget.test.ts` hadir dalam bundel ZIP.
  2. `create-audit-bundle.py` memiliki dynamic closure check yang memvalidasi tidak ada berkas `.ts`/`.tsx` di `src/` yang tertinggal.
  3. Bundel ZIP baru berhasil dibuat dengan status closure 100% PASS dan berkas `SHA256SUMS.txt` tervalidasi.
* **Test Case:** `TC-P12-01`
* **Metode Verifikasi:** Jalankan `python3 scripts/create-audit-bundle.py` dan verifikasi isi arsip ZIP serta integritas checksum.

---

### TASK-076: Non-Destructive Auto-Draft Cache & Secret Warning (AUD2-002)
* **Fase:** FASE 12 (P0 - CRITICAL)
* **Deskripsi:** Memperbaiki `src/hooks/useAutoDraftCache.ts` agar tidak memutasi teks draft kerja secara destruktif saat auto-save ke LocalStorage. Draft kerja disimpan murni apa adanya di namespace lokal terisolasi pengguna. Membangun deteksi rahasia (*secret warning banner*) yang memberikan peringatan visual jika terdeteksi kredensial tanpa merusak teks asli. Memindahkan redaksi aktif hanya ke pintu keluar ekspor (*Export Barrier* / Context Pack). Menambahkan pelacakan revisi monotonic (`lastPersistedRevision`, `lastEditedRevision`).
* **Dependensi:** `TASK-075`
* **File:** `src/hooks/useAutoDraftCache.ts`, `src/components/mobile/WorkspaceEditor.tsx`, `src/tests/transactionalPersistence.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`, `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `persistDraft` menyimpan teks murni tanpa menimpa substring pengguna dengan tag `[REDACTED_...]`.
  2. Saat draft dipulihkan (`restoreStoredDraft`), teks kembali 100% identik dengan teks yang diketik pengguna (`restore(persist(x)) === x`).
  3. Status deteksi secret diekspos sebagai metadata peringatan visual non-destruktif.
  4. Revisi draft dilacak dengan `lastPersistedRevision` dan `lastEditedRevision`.
* **Test Case:** `TC-P12-02`
* **Metode Verifikasi:** Jalankan uji round-trip persist-restore dan periksa tidak adanya mutasi diam-diam pada teks berformat template.

---

### TASK-077: RPO-Bounded LMK Model & Parameterized Physical Test (AUD2-003)
* **Fase:** FASE 12 (P0 - CRITICAL)
* **Deskripsi:** Merekonsiliasi dokumentasi LMK pada `docs/mobile/DEVICE_AUDIT.md` dan `docs/mobile/MOBILE_BLUEPRINT.md`: mengganti klaim "Zero Data Loss absolut" menjadi model ketahanan terukur **Loss-Bounded Persistence (RPO ≤ 400ms)** dan mendokumentasikan batas teknis kernel `SIGKILL` Android secara arsitektural. Memperbarui `scripts/test-lmk-physical.sh` agar membedakan dengan tegas mode sintaks `--verify-only` dengan prosedur pembebanan memori fisik aktual bertahap.
* **Dependensi:** `TASK-076`
* **File:** `docs/mobile/DEVICE_AUDIT.md`, `docs/mobile/MOBILE_BLUEPRINT.md`, `scripts/test-lmk-physical.sh`
* **Docs Terkait:** `docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** `SESSION_STATE.md`, `docs/mobile/DEVICE_AUDIT.md`
* **Acceptance Criteria:**
  1. Dokumentasi secara jujur menyatakan model RPO $\le 400$ ms untuk penulisan normal dan RPO = 0 pada transisi terencana, serta menjelaskan batasan `SIGKILL`.
  2. `scripts/test-lmk-physical.sh` memiliki pemisahan yang jelas antara `--verify-only` dan pengujian pembebanan RAM nyata.
  3. Log pengujian mencerminkan parameter target SM-T225 terukur.
* **Test Case:** `TC-P12-03`
* **Metode Verifikasi:** Jalankan `bash scripts/test-lmk-physical.sh --verify-only` dan periksa keselarasan dokumen arsitektur.

---

### TASK-078: Credential Handover Scope Correction (AUD2-004)
* **Fase:** FASE 12 (P1 - HIGH)
* **Deskripsi:** Memperbaiki cakupan pembersihan kredensial pada `scripts/zlce/clean-auth.sh` dan `src/utils/handoverChecklist.ts`. Mengganti klaim luas dengan pelaporan status granular per kontrol (daemon RAM dihentikan, socket dibersihkan, remote URL divalidasi). Memeriksa seluruh helper aktif via `git config --show-origin --get-all credential.helper` dan menghindari penghapusan destruktif identitas global pengguna (`user.name`/`user.email`). Menambahkan checklist serah terima untuk penutupan tab AI peramban, pembersihan clipboard, dan pembersihan riwayat terminal (`history -c`).
* **Dependensi:** `TASK-077`
* **File:** `scripts/zlce/clean-auth.sh`, `src/utils/handoverChecklist.ts`, `docs/mobile/SECURITY_AUDIT.md`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `clean-auth.sh` mematikan daemon RAM, membersihkan socket, dan memverifikasi remote URL tanpa merusak identitas pengguna.
  2. Status diekspos sebagai status per kontrol terperinci (PASS/WARN/ADVISORY).
  3. Handover checklist mencakup item sesi peramban AI dan riwayat terminal.
* **Test Case:** `TC-P12-04`
* **Metode Verifikasi:** Jalankan `bash scripts/zlce/clean-auth.sh` dan verifikasi pelaporan status per kontrol.

---

### TASK-079: Deterministic Offline App Shell (AUD2-005)
* **Fase:** FASE 12 (P1 - HIGH)
* **Deskripsi:** Memperbaiki Service Worker (`public/sw.js`) dan modul pendaftaran (`src/sw-register.ts`) agar mem-precache bundel aplikasi produksi secara deterministik. Memisahkan aset shell wajib dari aset opsional, menambahkan message listener `REGISTER_BUILD_ASSETS`, dan menyiarkan seluruh tag script & stylesheet DOM ke Service Worker saat halaman dimuat sehingga offline cold-start terjamin 100%.
* **Dependensi:** `TASK-078`
* **File:** `public/sw.js`, `src/sw-register.ts`, `src/tests/offlineOperation.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `sw.js` memisahkan aset inti wajib dan menangani kegagalan tanpa silent swallow.
  2. Listener `REGISTER_BUILD_ASSETS` mampu menyimpan berkas JS/CSS produksi ke Cache Storage secara deterministik.
  3. Aplikasi siap offline cold-start tanpa bergantung pada pemuatan chunk lambat.
* **Test Case:** `TC-P12-05`
* **Metode Verifikasi:** Jalankan unit test offlineOperation dan audit event message `REGISTER_BUILD_ASSETS`.

---

### TASK-080: Atomic Task Claim Guard (AUD2-006)
* **Fase:** FASE 12 (P1 - HIGH)
* **Deskripsi:** Memperkuat mekanisme klaim task pada `src/utils/taskClaimManager.ts` dengan pelacakan urutan nomor revisi monotonik (`revision: number`) dan proteksi Compare-and-Swap (CAS) optimis (`expectedRevision`). Menolak mutasi klaim jika terdeteksi konflik revisi usang dari tab/konteks lain. Memperbarui `src/tests/taskClaim.test.ts` dengan pengujian CAS multi-konteks.
* **Dependensi:** `TASK-079`
* **File:** `src/utils/taskClaimManager.ts`, `src/tests/taskClaim.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Setiap mutasi klaim menaikkan nomor revisi monotonik (`incrementClaimRevision`).
  2. Pemanggilan `claimTask` atau `takeoverTaskClaim` dengan `expectedRevision` yang tidak cocok ditolak dengan `STALE_REVISION`.
  3. Uji unit `taskClaim.test.ts` membuktikan penolakan race condition dan mutasi basi.
* **Test Case:** `TC-P12-06`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/taskClaim.test.ts` dan verifikasi kelulusan 7/7 checks.

---

### TASK-081: Test Runner Reconciliation (AUD2-007)
* **Fase:** FASE 12 (P1 - HIGH)
* **Deskripsi:** Merekonsiliasi `scripts/run-tests.py` agar mencakup seluruh fase pengujian hingga FASE 12. Mengintegrasikan penutupan bundel (`create-audit-bundle.py`), uji sentuh ergonomis tablet 44px (`touchTarget.test.ts`), dan inspeksi kredensial clean-auth (`clean-auth.sh`), dengan penghitungan dinamis passing rate nyata.
* **Dependensi:** `TASK-080`
* **File:** `scripts/run-tests.py`, `package.json`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `run-tests.py` memuat langkah pengujian terintegrasi untuk seluruh fase FASE 0 s/d FASE 12.
  2. Seluruh langkah pengujian lulus 100% tanpa error.
  3. Pelaporan ringkasan runner mencerminkan jumlah checks aktual secara dinamis.
* **Test Case:** `TC-P12-07`
* **Metode Verifikasi:** Jalankan `python3 scripts/run-tests.py` dan verifikasi kelulusan penuh.

---

### TASK-082: Release Documentation Baseline (AUD2-008)
* **Fase:** FASE 12 (P1 - HIGH)
* **Deskripsi:** Memperbarui baseline dokumentasi arsitektur: menetapkan status resmi seluruh 14 dokumen cetak biru menjadi `APPROVED / AS-BUILT (v4.0.0 GA)`, merekonsiliasi evolusi roadmap (43 baseline -> 46 review -> 60 hardening -> 74 remediasi -> 82 GA tuntas) pada `docs/mobile/MOBILE_BLUEPRINT.md`, serta memperbaiki sintaks perintah `git checkout`/`git pull` pada `05_STORAGE_AND_SYNC.md`.
* **Dependensi:** `TASK-081`
* **File:** `docs/mobile/MOBILE_BLUEPRINT.md`, `docs/mobile/blueprint/*`, `SESSION_STATE.md`, `TASKS.md`
* **Docs Terkait:** `docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Seluruh dokumen cetak biru berstatus `APPROVED / AS-BUILT` (tidak lagi DRAFT).
  2. Release Manifest pada master blueprint mendokumentasikan rekonsiliasi jumlah task secara transparan.
  3. Perintah Git pada dokumen sinkronisasi valid dan teruji di Termux.
* **Test Case:** `TC-P12-08`
* **Metode Verifikasi:** Periksa konsistensi seluruh dokumen cetak biru dan jalankan `python3 scripts/zlce-check.py .`.

---

### ============================================================================
### FASE 13: FINAL REVIEW AUDIT REMEDIATION & DOCUMENTATION POLISH
### ============================================================================

### TASK-083: Zero-Secret Email Hygiene & Shell Command Syntax Fix (AUD3-001)
* **Fase:** FASE 13 (P0 - CRITICAL)
* **Deskripsi:** Menuntaskan penegakan kebijakan Zero-Secret dan kebersihan email di seluruh repositori: memastikan seluruh profil anggota tim memakai alamat email alias publik non-kredensial `@zlce.local` (termasuk `eko@zlce.local`), serta mengoreksi setiap sintaks panggilan perintah `git commit` di `src/utils/auditPromptGenerator.ts` menjadi bentuk POSIX kanonik `git -c user.name=... -c user.email=... commit`.
* **Dependensi:** `TASK-082`
* **File:** `src/data/teamMembers.ts`, `docs/mobile/USER_GUIDE.md`, `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`, `src/utils/auditPromptGenerator.ts`
* **Docs Terkait:** `docs/mobile/SECURITY_AUDIT.md`, `docs/mobile/blueprint/08_SECURITY_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Tidak ada surel pribadi (seperti `@gmail.com`) pada kode sumber, tipe data, maupun dokumen panduan.
  2. Seluruh 8 anggota tim menggunakan alamat domain `@zlce.local`.
  3. Sintaks commit pada seluruh generator perintah mematuhi format `git -c user.name=... -c user.email=... commit`.
* **Test Case:** `TC-P13-01`
* **Metode Verifikasi:** Jalankan `bash scripts/security-audit.sh` dan verifikasi 0 temuan email pribadi atau kebocoran kredensial.

---

### TASK-084: Team Roles & 8-Step Relay Workflow Harmonization (AUD3-002)
* **Fase:** FASE 13 (P1 - HIGH)
* **Deskripsi:** Menyelaraskan peran 8 anggota tim estafet di seluruh dokumen panduan (`USER_GUIDE.md` dan `PRODUCTION_OPERATIONS.md`) dengan `src/data/teamMembers.ts` sebagai sumber kebenaran tunggal (SSOT). Menyeragamkan urutan alur 8 langkah estafet harian (1. Ambil Tablet -> 2. Pilih Anggota -> 3. Klaim Task -> 4. Context Pack -> 5. Eksekusi AI -> 6. Validasi, Commit & Pengesahan -> 7. Push Branch -> 8. Serah Terima & Clean-Auth) serta konsistensi batas tab peramban (2-3 tab) di Samsung Galaxy Tab A7 Lite.
* **Dependensi:** `TASK-083`
* **File:** `docs/mobile/USER_GUIDE.md`, `docs/mobile/PRODUCTION_OPERATIONS.md`, `src/data/teamMembers.ts`
* **Docs Terkait:** `docs/mobile/blueprint/07_WORKFLOW_DESIGN.md`, `14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Deskripsi peran 8 anggota tim identik di `teamMembers.ts`, `USER_GUIDE.md`, dan `PRODUCTION_OPERATIONS.md`.
  2. Urutan 8 langkah estafet harian konsisten di seluruh dokumen operasional.
  3. Batas tab peramban Chrome/Samsung Internet seragam pada rekomendasi 2–3 tab.
* **Test Case:** `TC-P13-02`
* **Metode Verifikasi:** Verifikasi silang teks peran dan alur 8 langkah antar dokumen panduan dan jalankan `python3 scripts/run-tests.py` step 31 & 32.

---

### TASK-085: Master README & Documentation Index Modernization (AUD3-003)
* **Fase:** FASE 13 (P1 - HIGH)
* **Deskripsi:** Memutakhirkan `README.md` utama di root repositori dengan struktur rilis v4.0.0 GA yang mengarah ke jalur dokumen aktif `docs/mobile/*`, menyertakan penjelasan peranan `zlce-starter-kit/` (template bersih untuk proyek baru pengguna) versus root repositori (state aktif ZLCE Studio), merapikan `docs/README.md` menjadi indeks "Saya ingin...", merekonsiliasi versi rilis di `docs/USAGE.md`, serta memperbarui `CHANGELOG.md` untuk rilis General Availability (GA).
* **Dependensi:** `TASK-084`
* **File:** `README.md`, `docs/README.md`, `docs/USAGE.md`, `CHANGELOG.md`
* **Docs Terkait:** `docs/mobile/MOBILE_BLUEPRINT.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `README.md` memuat badge versi 4.0.0 GA, status 88/88 DONE, tautan `docs/mobile/*` yang valid, dan instruksi quickstart Termux yang akurat.
  2. Perbedaan `zlce-starter-kit/` vs root terdokumentasi dengan jelas.
  3. `docs/USAGE.md` dan `CHANGELOG.md` mencerminkan status rilis v4.0.0 GA.
* **Test Case:** `TC-P13-03`
* **Metode Verifikasi:** Periksa seluruh tautan internal pada README dan jalankan validator `python3 scripts/zlce-check.py .`.

---

### TASK-086: Production Operations Security & Network Isolation (AUD3-004)
* **Fase:** FASE 13 (P1 - HIGH)
* **Deskripsi:** Meningkatkan keamanan operasional tablet bersama: mendokumentasikan dan mengonfigurasi opsi pengikatan jaringan `HOST=127.0.0.1` pada `scripts/zlce-prod-start.sh` untuk membatasi akses aplikasi hanya pada tablet lokal (mencegah eksposur tidak disengaja ke jaringan Wi-Fi bersama), memutakhirkan panduan `INSTALLATION.md` untuk branching dan keluaran CLI `zlce --help`, serta menambahkan deklarasi runtime `"engines": { "node": ">=20.19.0" }` di `package.json`.
* **Dependensi:** `TASK-085`
* **File:** `scripts/zlce-prod-start.sh`, `docs/mobile/PRODUCTION_OPERATIONS.md`, `docs/mobile/INSTALLATION.md`, `package.json`
* **Docs Terkait:** `docs/mobile/SECURITY_AUDIT.md`, `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `zlce-prod-start.sh` mendukung variabel `HOST` dengan dokumentasi isolasi `127.0.0.1`.
  2. `INSTALLATION.md` memuat instruksi branching aman dan contoh keluaran bantuan CLI yang akurat.
  3. `package.json` memuat bidang `engines` dengan Node >= 20.19.0.
* **Test Case:** `TC-P13-04`
* **Metode Verifikasi:** Validasi sintaks `package.json`, inspeksi variabel HOST pada skrip produksi, dan uji eksekusi `zlce help`.

---

### TASK-087: FeedbackReviewTab & CommandHub Polish & Tab Routing Test (AUD3-005)
* **Fase:** FASE 13 (P2 - MEDIUM)
* **Deskripsi:** Menyempurnakan komponen antarmuka web ZLCE Studio: menambahkan tombol pemuatan berkas `LAPORAN_TINJAUAN_KEDUA_ZLCE_1d0ccc58.md` pada `FeedbackReviewTab.tsx`, menghubungkan badge panduan di `CommandHubTab.tsx` ke rute Blueprint 13 dan TROUBLESHOOTING.md, menambahkan unit test otomatis untuk parsing URL parameter `?tab=` di `src/tests/tabRouting.test.ts`, serta mengintegrasikan plugin `vite-session-sync.ts`.
* **Dependensi:** `TASK-086`
* **File:** `src/components/mobile/FeedbackReviewTab.tsx`, `src/components/mobile/CommandHubTab.tsx`, `src/tests/tabRouting.test.ts`, `vite-session-sync.ts`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `13_COMMAND_TEMPLATES.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `FeedbackReviewTab` memiliki aksi langsung memuat laporan tinjauan kedua dan mengekstrak temuan B1–B9 secara otomatis.
  2. `CommandHubTab` menyediakan tombol navigasi cepat ke dokumentasi panduan terkait.
  3. `src/tests/tabRouting.test.ts` membuktikan penanganan seluruh 18 nilai tab dan fallback `dashboard` lulus 100%.
* **Test Case:** `TC-P13-05`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/tabRouting.test.ts` dan verifikasi kelulusan 6/6 checks.

---

### TASK-088: Test Suite & Final Quality Gate Reconciliation (AUD3-006)
* **Fase:** FASE 13 (P0 - CRITICAL)
* **Deskripsi:** Merekonsiliasi test runner otomatis `scripts/run-tests.py` dengan menambahkan Step 48 (`TC-P13-05`), memastikan seluruh 48/48 checks lulus 100%, memverifikasi kepatuhan kanonik 0 error dan 0 warning pada `python3 scripts/zlce-check.py .`, serta mencatat serah terima akhir dan pengesahan seluruh gerbang kualitas v4.0.0 GA di `SESSION_STATE.md`.
* **Dependensi:** `TASK-087`
* **File:** `scripts/run-tests.py`, `SESSION_STATE.md`, `TASKS.md`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`, `docs/USAGE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `scripts/run-tests.py` mencakup seluruh 48 automated checks dan lulus 100% PASS.
  2. `python3 scripts/zlce-check.py .` menghasilkan status `RESULT: OK (0 error, 0 warn, 88 task)`.
  3. Matriks task dan WAL di `SESSION_STATE.md` mencerminkan penyelesaian FASE 13 secara atomik.
* **Test Case:** `TC-P13-06`
* **Metode Verifikasi:** Jalankan `python3 scripts/run-tests.py` dan `python3 scripts/zlce-check.py .`.

---

### ============================================================================
### FASE 14: PEMISAHAN & INTEGRASI DOKUMENTASI PROYEK, TUTORIAL ANDROID (TERMUX ➔ PWA), & PANDUAN PEMAKAIAN MOBILE
### ============================================================================

### TASK-089: Pemisahan Dokumentasi Arsitektur Proyek ZLCE Mobile v4.0.0 (DOC-001)
* **Fase:** FASE 14 (P1 - HIGH)
* **Deskripsi:** Memisahkan secara bersih dokumentasi spesifikasi arsitektur proyek ZLCE Mobile v4.0.0 dari materi tutorial dasar: menyempurnakan `docs/mobile/MOBILE_BLUEPRINT.md` dan `README.md` sebagai gerbang arsitektur mandiri yang merangkum 14 Modul Cetak Biru, 9 Catatan Keputusan Arsitektur (ADR-01 s/d ADR-09), spesifikasi Zero-Secret, model memori LMK RPO ≤ 400ms, serta taksonomi model multi-AI tanpa bercampur-aduk dengan langkah klik-demi-klik instalasi atau tutorial pemula.
* **Dependensi:** `TASK-088`
* **File:** `docs/mobile/MOBILE_BLUEPRINT.md`, `README.md`, `docs/README.md`
* **Docs Terkait:** `docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md`, `12_ARCHITECTURE_DECISIONS.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `docs/mobile/MOBILE_BLUEPRINT.md` murni berfokus pada cetak biru arsitektur, spesifikasi sistem, dan indeks 14 modul.
  2. Tautan ke panduan instalasi dan panduan pemakaian dipisahkan secara tegas dan berurutan.
  3. Dokumen `docs/README.md` memetakan jalur pembaca: Arsitektur Proyek, Tutorial Instalasi Android, dan Tutorial Pemakaian Mobile.
* **Test Case:** `TC-P14-01`
* **Metode Verifikasi:** Verifikasi silang teks arsitektur dan kepatuhan navigasi tanpa tautan rusak.

---

### TASK-090: Penyusunan Tutorial Instalasi Android Mandiri: Termux s/d PWA (DOC-002)
* **Fase:** FASE 14 (P0 - CRITICAL)
* **Deskripsi:** Menyusun panduan instalasi langkah-demi-langkah berurutan khusus platform Android (baik tablet Samsung Galaxy Tab A7 Lite maupun smartphone Android) di `docs/mobile/INSTALLATION_ANDROID.md` (dan integrasi terperinci di `docs/mobile/INSTALLATION.md` & `TERMUX_SETUP.md`): memandu persiapan perangkat, unduh Termux resmi dari F-Droid (peringatan keras Play Store deprecated), penyiapan paket Linux (Node.js LTS, Python, Git, Micro), cloning repositori, symlink dispatcher `zlce`, menjalankan server lokal mandiri (`HOST=127.0.0.1:3000`), hingga penambahan PWA ke layar utama (*Add to Home screen / Standalone Mode*) dan verifikasi diagnostik awal.
* **Dependensi:** `TASK-089`
* **File:** `docs/mobile/INSTALLATION_ANDROID.md`, `docs/mobile/INSTALLATION.md`, `docs/mobile/TERMUX_SETUP.md`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`, `04_TERMUX_INTEGRATION.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Dokumen menyajikan alur 8 langkah berurutan dari Termux hingga PWA standalone tanpa terputus.
  2. Seluruh blok perintah shell siap salin 1-ketukan (*copy-paste ready*) dan teruji di lingkungan Android.
  3. Memuat petunjuk visual penambahan PWA ke Layar Utama di Google Chrome dan Samsung Internet.
* **Test Case:** `TC-P14-02`
* **Metode Verifikasi:** Review alur 8 langkah instalasi dan uji sintaks perintah shell di Termux.

---

### TASK-091: Penyusunan Tutorial Pemakaian ZLCE Mobile & Alur Operasional Harian (DOC-003)
* **Fase:** FASE 14 (P0 - CRITICAL)
* **Deskripsi:** Menyusun panduan operasional pemakaian ZLCE Mobile yang terstruktur, informatif, dan tidak tumpang tindih di `docs/mobile/USAGE_MOBILE.md` (dan harmonisasi di `docs/mobile/USER_GUIDE.md` & `docs/mobile/PRODUCTION_OPERATIONS.md`): memandu alur kerja harian 10 langkah (Pemilihan profil anggota Zero-Secret, pembacaan dokumen di Workspace Reader, aturan 1 task IN_PROGRESS + WAL, pembuatan Context Pack, eksekusi browser AI zero-loss, Result Capture & provenance, pengujian `zlce check`, Git branching & commit beridentitas `-c user.name=...`, handover estafet & `zlce clean-auth`, serta penanganan LMK dan offline).
* **Dependensi:** `TASK-090`
* **File:** `docs/mobile/USAGE_MOBILE.md`, `docs/mobile/USER_GUIDE.md`, `docs/mobile/PRODUCTION_OPERATIONS.md`, `docs/mobile/TROUBLESHOOTING.md`
* **Docs Terkait:** `docs/mobile/blueprint/07_WORKFLOW_DESIGN.md`, `14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Panduan memuat alur operasional 10 langkah komprehensif tanpa redundansi materi instalasi dasar.
  2. Memuat penjelasan peran antarmuka ZLCE Studio (Header, Context Pack, Command Hub, Result Capture, Timeline).
  3. Memuat tabel matriks penanganan masalah darurat dan pemulihan cepat (Kasus A–D & LMK).
* **Test Case:** `TC-P14-03`
* **Metode Verifikasi:** Review keselarasan alur 10 langkah dan kepatuhan invarian ZLCE.

---

### TASK-092: Penataan Ulang Pustaka Dokumen & Integrasi Preview Studio (DOC-004)
* **Fase:** FASE 14 (P1 - HIGH)
* **Deskripsi:** Merevitalisasi pustaka dokumen dan antarmuka panduan di ZLCE Studio preview: merestrukturisasi `TutorialTab.tsx` menjadi 4 pilar terpadu (1. Tutorial Instalasi Android Termux ➔ PWA dengan checklist interaktif & tombol salin; 2. Tutorial Pemakaian ZLCE Mobile; 3. Pustaka Dokumentasi Arsitektur v4.0.0; 4. AI Handover Studio); memperbarui pemilih dokumen di `WorkspaceReader.tsx` menjadi 4 kategori yang jelas; serta memperbarui `src/data/templates.ts` dengan ekspor dokumen panduan baru yang sinkron.
* **Dependensi:** `TASK-091`
* **File:** `src/components/TutorialTab.tsx`, `src/components/mobile/WorkspaceReader.tsx`, `src/data/templates.ts`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `03_PWA_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. `TutorialTab.tsx` menyediakan navigasi 4 pilar yang elegan, responsif, dan ramah layar sentuh 44px+.
  2. `WorkspaceReader.tsx` mengelompokkan dokumen ke dalam 4 kategori terpisah tanpa tumpang tindih.
  3. Seluruh template dokumen dapat dimuat langsung di peramban tanpa koneksi server eksternal.
* **Test Case:** `TC-P14-04`
* **Metode Verifikasi:** Inspeksi antarmuka tab Tutorial dan tab Workspace Reader di browser, uji alur switching mode.

---

### TASK-093: Uji Otomatis Paritas Dokumentasi & Rekonsiliasi Test Runner (DOC-005)
* **Fase:** FASE 14 (P0 - CRITICAL)
* **Deskripsi:** Membangun unit test otomatis `src/tests/documentationParity.test.ts` untuk memverifikasi integritas pemisahan dokumen, ketiadaan link broken internal, dan registrasi pustaka di preview studio; memperbarui `scripts/run-tests.py` dengan menambahkan Step 49 (`TC-P14-05`); mendaftarkan berkas baru ke `FILES_TO_BUNDLE` di `scripts/create-audit-bundle.py`; memastikan `python3 scripts/zlce-check.py .` menghasilkan 0 error dan 0 warning untuk seluruh 93 task; serta mencatat serah terima di `SESSION_STATE.md`.
* **Dependensi:** `TASK-092`
* **File:** `src/tests/documentationParity.test.ts`, `scripts/run-tests.py`, `scripts/create-audit-bundle.py`, `SESSION_STATE.md`, `TASKS.md`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `src/tests/documentationParity.test.ts` memverifikasi ketersediaan dan non-overlap seluruh berkas dokumen pilar 1, 2, dan 3.
  2. `scripts/run-tests.py` meloloskan seluruh 49 checks (100% PASS).
  3. `create-audit-bundle.py` lulus 100% pada gerbang closure parity.
  4. `python3 scripts/zlce-check.py .` menghasilkan `RESULT: OK (0 error, 0 warn, 93 task)`.
* **Test Case:** `TC-P14-05`
* **Metode Verifikasi:** Jalankan `python3 scripts/run-tests.py` dan `python3 scripts/zlce-check.py .`.

---

### TASK-094: Modul Log Kerja Anggota & Penyuntingan Catatan Aktivitas Tim Estafet (LOG-001)
* **Fase:** FASE 14 (P1 - HIGH)
* **Deskripsi:** Membangun modul dan antarmuka pencatatan log kerja tim estafet 8 anggota tablet bersama (`src/utils/memberWorkLogs.ts` & `src/components/mobile/MemberWorkLogSection.tsx`): memfasilitasi penambahan log aktivitas baru, penyuntingan catatan kerja (*note*) secara mandiri, filter per anggota & status pengerjaan, ekspor ringkasan Markdown, tombol salin 1-ketukan, integrasi tab ganda di `SessionTimelineTab.tsx`, penegakan sanitasi Zero-Secret Policy (menolak/menyensor token `ghp_*` / `sk-*`), serta unit test otomatis di `src/tests/memberWorkLogs.test.ts`.
* **Dependensi:** `TASK-093`
* **File:** `src/types/mobile.ts`, `src/utils/memberWorkLogs.ts`, `src/components/mobile/MemberWorkLogSection.tsx`, `src/components/mobile/SessionTimelineTab.tsx`, `src/tests/memberWorkLogs.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`, `docs/mobile/USAGE_MOBILE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Pengguna dapat menambah entri log aktivitas baru dan menyunting catatan (*note*) yang sudah tersimpan.
  2. Perubahan catatan (*note*) tersimpan di LocalStorage dan tersinkronisasi lintas tab/komponen secara real-time.
  3. Sanitasi Zero-Secret Policy aktif menyensor token atau kredensial rahasia menjadi `[REDACTED_SECRET]`.
  4. Tersedia tombol unduh ringkasan Markdown `.md` dan tombol salin 1-ketukan ramah jempol tablet.
  5. Seluruh 6 unit test pada `src/tests/memberWorkLogs.test.ts` lulus 100% PASS.
* **Test Case:** `TC-P14-06`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/memberWorkLogs.test.ts` dan `python3 scripts/run-tests.py`.

---

### TASK-095: Pembuatan Prompt Review Frontend PWA ChatGPT & Claude serta Bundel ZIP (AUD4-001 / REV-PWA-01)
* **Fase:** FASE 14 (P1 - HIGH)
* **Deskripsi:** Membangun generator prompt review mandatori untuk model ChatGPT (GPT-4o/5/6) dan Claude (Claude 3.5/3.7 Sonnet) yang berfokus mendalam pada evaluasi Frontend PWA: (1) *User-Friendly* (ergonomi layar 8.7" tablet SM-T225 & mobile, target sentuh 44px/48px, kontras, visualViewport keyboard); (2) *Komunikatif* (kejelasan pesan, toast feedback, petunjuk interaktif, kejelasan bahasa); (3) *Mudah Dipakai* (operasi 1-ketukan, minim friksi antar Termux/browser AI, auto-draft cache recovery); (4) *Efisien* (alokasi memori RAM 3GB, zero lag re-renders, caching offline Service Worker instan); dan (5) *Powerful* (kelengkapan 18 tab ZLCE Mobile Workbench: Workspace Reader, Context Pack, Result Capture, Command Hub, Session Timeline, Log Kerja Anggota, Git Sync, Recovery Kasus A-D). Membangun skrip pembundel ZIP khusus `scripts/create-pwa-review-bundle.py` yang mengemas seluruh komponen UI, hooks, styles, PWA manifest/sw, dan dokumen arsitektur ke `public/assets/zlce-pwa-frontend-review-bundle.zip`, serta mengintegrasikannya ke `FeedbackReviewTab.tsx` dan test suite otomatis `src/tests/pwaReviewPrompt.test.ts`.
* **Dependensi:** `TASK-094`
* **File:** `src/utils/auditPromptGenerator.ts`, `scripts/create-pwa-review-bundle.py`, `src/components/mobile/FeedbackReviewTab.tsx`, `src/utils/fileExport.ts`, `vite-session-sync.ts`, `src/tests/pwaReviewPrompt.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `03_PWA_ARCHITECTURE.md`, `docs/mobile/USAGE_MOBILE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Generator menghasilkan prompt review Frontend PWA khusus untuk ChatGPT dan Claude dengan 5 pilar (User-Friendly, Komunikatif, Mudah Dipakai, Efisien, Powerful) dan stop tokens baku.
  2. Skrip `scripts/create-pwa-review-bundle.py` menghasilkan berkas ZIP mandiri `public/assets/zlce-pwa-frontend-review-bundle.zip` lengkap dengan `SHA256SUMS.txt`.
  3. `FeedbackReviewTab.tsx` menyediakan tombol 1-ketuk untuk men-generate prompt review PWA UX dan mengunduh berkas bundel ZIP.
  4. Unit test `src/tests/pwaReviewPrompt.test.ts` memverifikasi struktur prompt, kelengkapan 5 pilar, stop tokens, dan integritas berkas bundel ZIP (100% PASS).
  5. Seluruh 51 pemeriksaan di `scripts/run-tests.py` lulus 100% tanpa error.
* **Test Case:** `TC-P14-07`
* **Metode Verifikasi:** Jalankan `python3 scripts/create-pwa-review-bundle.py && npx tsx src/tests/pwaReviewPrompt.test.ts && python3 scripts/run-tests.py`.

---

### ============================================================================
### FASE 15: REMEDIASI KRITIS P0 & ZERO-SECRET PERSISTENCE GATE
### ============================================================================

### TASK-096: Zero-Secret Persistence Gate pada Cache Draft & Export (AUD4-002 / SEC-001)
* **Fase:** FASE 15 (P0 - CRITICAL)
* **Deskripsi:** Menutup celah penyimpanan kredensial pada auto-draft cache (`useAutoDraftCache.ts`). Mengubah mekanisme dari deteksi pasif menjadi gerbang penolakan/redaksi otomatis sebelum teks ditulis ke `localStorage`. Menetapkan bahwa status `isDraftSaved` tidak boleh disetel `true` apabila persistensi ditolak/gagal karena deteksi secret. Memastikan teks berisiko divalidasi atau disensor sebelum masuk persistent browser storage, IndexedDB, ekspor clipboard, dan Context Pack.
* **Dependensi:** `TASK-095`
* **File:** `src/hooks/useAutoDraftCache.ts`, `src/utils/redactSecrets.ts`, `src/components/mobile/WorkspaceEditor.tsx`, `src/tests/zeroSecretPersistence.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/08_SECURITY_MODEL.md`, `05_STORAGE_AND_SYNC.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Secret terdeteksi tidak pernah tersimpan dalam bentuk plaintext ke key `localStorage` atau `sessionStorage`.
  2. Status `isDraftSaved` disetel `false` dengan indikator visual status merah/oranye jika persistensi diblokir karena deteksi token.
  3. Menyediakan tombol konfirmasi pengguna eksplisit untuk menyensor otomatis token sintetis/asli sebelum penyimpanan.
  4. Unit test `src/tests/zeroSecretPersistence.test.ts` (TC-P15-01) memverifikasi ketiadaan token sintetis di seluruh penyimpanan persisten (100% PASS).
* **Test Case:** `TC-P15-01`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/zeroSecretPersistence.test.ts && bash scripts/security-audit.sh`.

---

### TASK-097: Credential Helper Fail-Closed & Source-Safe Sanitizer (AUD4-003 / SEC-002)
* **Fase:** FASE 15 (P0 - CRITICAL)
* **Deskripsi:** Memperbaiki logika evaluasi keamanan kredensial pada `scripts/zlce/clean-auth.sh`. Mengubah kebijakan toleran `[WARN]` pada helper persisten (`store`, `manager`, helper plaintext tak dikenal) menjadi penegakan ketat *fail-closed* dengan `EXIT_CODE=1`. Mengimplementasikan eksekusi *source-safe* yang menggunakan `return` saat skrip di-source di lingkungan shell induk dan `exit` saat dieksekusi sebagai subproses mandiri.
* **Dependensi:** `TASK-096`
* **File:** `scripts/zlce/clean-auth.sh`, `src/tests/cleanAuthPolicy.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`, `08_SECURITY_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `clean-auth.sh` mengembalikan exit code 1 jika `git config credential.helper` disetel ke `store`, `manager`, atau helper persisten selain `cache`.
  2. Skrip aman dijalankan via `source scripts/zlce/clean-auth.sh` tanpa mematikan sesi terminal induk Termux jika terjadi error/exit.
  3. Integration test `src/tests/cleanAuthPolicy.test.ts` memverifikasi 4 skenario: helper kosong, `cache`, `store`, dan helper kustom (100% PASS).
* **Test Case:** `TC-P15-02`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/cleanAuthPolicy.test.ts && bash scripts/zlce/clean-auth.sh --status`.

---

### TASK-098: Keyboard-Aware Viewport & Dynamic Sticky Form Actions (UX-01 / ERG-001)
* **Fase:** FASE 15 (P0 - CRITICAL)
* **Deskripsi:** Mengimplementasikan adaptasi keyboard virtual Android yang sesungguhnya pada layar 8.7" WXGA+ (1340x800). Membangun custom hook `src/hooks/useKeyboardAwareFocus.ts` yang mendengarkan event `visualViewport.resize` dan secara otomatis memanggil `scrollIntoView({ block: 'center', behavior: 'smooth' })` pada field textarea/input yang sedang aktif. Menerapkan footer aksi sticky sadar tinggi keyboard `calc(var(--keyboard-height) + var(--safe-bottom))` pada semua form dan modal (`ResultCaptureTab`, `PasteBackModal`, `AiHandoverWizard`, `MemberWorkLogSection`, `ConflictResolutionWizard`).
* **Dependensi:** `TASK-097`
* **File:** `src/hooks/useKeyboardAwareFocus.ts`, `src/components/mobile/MobileLayout.tsx`, `src/index.css`, `src/tests/keyboardViewport.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `docs/mobile/DEVICE_AUDIT.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Input teks dan tombol Simpan/Aksi utama tidak pernah tertutup oleh keyboard virtual Android pada posisi potret maupun lanskap.
  2. Modal memiliki batas tinggi maksimum dinamis `max-h-[var(--viewport-height)]` dengan overflow scrolling internal yang mulus.
  3. Unit test `src/tests/keyboardViewport.test.ts` (TC-P15-03) memverifikasi kalkulasi resize viewport dan pemanggilan scrollIntoView (100% PASS).
* **Test Case:** `TC-P15-03`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/keyboardViewport.test.ts`.

---

### TASK-099: Universal DraftTextarea & Unified Storage Checkpoint (UX-02 / AUD4-006 / DAT-001)
* **Fase:** FASE 15 (P0 - CRITICAL)
* **Deskripsi:** Memperluas perlindungan auto-draft cache yang sebelumnya hanya ada di 2 komponen menjadi komponen universal `DraftTextarea.tsx`. Memasang komponen ini pada seluruh 6 alur input rawan hilang data: Result Capture, Paste-Back, AI Handover, Catatan Log Kerja Anggota, Wizard Resolusi Konflik, dan Context Pack. Mengintegrasikan penyimpanan konten dan metadata dalam 1 record atomic checkpoint terpadu dengan key terisolasi per anggota dan per task.
* **Dependensi:** `TASK-098`
* **File:** `src/components/mobile/DraftTextarea.tsx`, `src/components/mobile/ResultCaptureTab.tsx`, `src/components/mobile/PasteBackModal.tsx`, `src/components/mobile/AiHandoverWizard.tsx`, `src/components/mobile/MemberWorkLogSection.tsx`, `src/tests/universalDraftCache.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`, `09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Seluruh 6 area input kritis menyimpan draft otomatis dengan debounce 400ms dan flush instan pada lifecycle exit.
  2. Indikator visual "Draft tersimpan HH:mm" tampil seragam pada setiap form.
  3. Menutup tab atau beralih aplikasi ke Termux saat mengetik menjamin data pulih utuh saat kembali ke PWA.
  4. Unit test `src/tests/universalDraftCache.test.ts` (TC-P15-04) memverifikasi pemulihan draft di seluruh 6 komponen (100% PASS).
* **Test Case:** `TC-P15-04`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/universalDraftCache.test.ts`.

---

### TASK-100: Deterministic Offline Service Worker & Tolerant Precache (UX-03 / AUD4-007 / PWA-001)
* **Fase:** FASE 15 (P0 - CRITICAL)
* **Deskripsi:** Memperbaiki arsitektur offline Service Worker di `public/sw.js` dan `src/sw-register.ts`. Menerapkan `Promise.allSettled` untuk aset sekunder sehingga kegagalan satu berkas ikon tidak menggagalkan seluruh caching App Shell inti. Menerapkan strategi navigasi Cache-First dengan timeout revalidasi 2.5 detik. Menghilangkan `skipWaiting()` otomatis di tengah sesi dan menggantikannya dengan toast pembaruan non-destruktif "Versi baru tersedia, Muat Ulang".
* **Dependensi:** `TASK-099`
* **File:** `public/sw.js`, `src/sw-register.ts`, `src/main.tsx`, `src/tests/resilientServiceWorker.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`, `10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Instalasi awal PWA dalam Mode Pesawat (Airplane Mode) berhasil memuat shell navigasi 100% tanpa layar putih.
  2. Operasi caching menggunakan `event.waitUntil()` untuk menjamin proses selesai sebelum service worker tidur.
  3. Pengguna menerima notifikasi toast saat terdapat pembaruan rilis tanpa terputus sesi kerjanya secara mendadak.
  4. Unit test `src/tests/resilientServiceWorker.test.ts` (TC-P15-05) memverifikasi toleransi precache dan fallback navigasi timeout (100% PASS).
* **Test Case:** `TC-P15-05`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/resilientServiceWorker.test.ts`.

---

### ============================================================================
### FASE 16: PENINGKATAN UX P1, ERGONOMI TABLET & INTEGRITAS ALUR KERJA
### ============================================================================

### TASK-101: Atomic Task Claim Guard & Proteksi Klaim Anggota Lain (AUD4-004 / UX-07 / FLW-001)
* **Fase:** FASE 16 (P1 - HIGH)
* **Deskripsi:** Memperkuat integritas klaim task dan proteksi kepemilikan antar-anggota tim di `src/utils/taskClaimManager.ts` dan `src/components/mobile/TaskClaimBanner.tsx`. Menghilangkan tombol mutasi langsung ("Rilis Klaim", "Selesaikan") apabila tablet dipegang oleh anggota yang bukan pemilik klaim aktif, menggantikannya dengan dialog konfirmasi eksplisit "Ambil Alih Task". Menghilangkan efek samping klaim otomatis senyap saat berpindah profil anggota.
* **Dependensi:** `TASK-100`
* **File:** `src/utils/taskClaimManager.ts`, `src/components/mobile/TaskClaimBanner.tsx`, `src/tests/atomicClaimProtection.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`, `07_WORKFLOW_DESIGN.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Anggota B tidak dapat merilis atau menyelesaikan task anggota A tanpa dialog modal konfirmasi ambil alih.
  2. Pengambilalihan task mencatat nama anggota asal dan anggota pengambil alih pada audit log provenance.
  3. Beralih anggota aktif di header tidak otomatis memicu klaim task baru secara senyap.
  4. Unit test `src/tests/atomicClaimProtection.test.ts` (TC-P16-01) memverifikasi proteksi kepemilikan klaim (100% PASS).
* **Test Case:** `TC-P16-01`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/atomicClaimProtection.test.ts`.

---

### TASK-102: Dialog Konfirmasi & Toast Aksesibel Bersama (UX-06 / UI-001)
* **Fase:** FASE 16 (P1 - HIGH)
* **Deskripsi:** Menghilangkan seluruh 15 pemanggilan `confirm()` dan `alert()` bawaan browser yang memblokir main thread JavaScript dan merusak ergonomi tablet. Membangun komponen bersama `src/components/mobile/ConfirmDialog.tsx` dan `src/components/mobile/ToastContainer.tsx` dengan tombol aksi minimal 48px, fokus otomatis (focus trap), penutup tombol `Escape`, backdrop blur, serta dukungan pembaca layar melalui `aria-modal` dan `aria-live`.
* **Dependensi:** `TASK-101`
* **File:** `src/components/mobile/ConfirmDialog.tsx`, `src/components/mobile/ToastContainer.tsx`, `src/components/mobile/TaskClaimBanner.tsx`, `src/components/mobile/MemberWorkLogSection.tsx`, `src/tests/accessibleDialogs.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. 0 pemanggilan `confirm(` atau `alert(` tersisa di seluruh direktori `src/`.
  2. Dialog konfirmasi memiliki target sentuh $\ge 48\text{px}$, trap focus pada tombol aksi, dan dapat ditutup via tombol Escape atau tap luar.
  3. Toast feedback memiliki kontras tinggi dan diumumkan secara tepat ke assistive technologies via `aria-live="polite"`.
  4. Unit test `src/tests/accessibleDialogs.test.ts` (TC-P16-02) memverifikasi ketiadaan dialog native dan fungsionalitas modal kustom (100% PASS).
* **Test Case:** `TC-P16-02`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/accessibleDialogs.test.ts && grep -rnE "confirm\(|alert\(" src/`.

---

### TASK-103: Standardisasi Target Sentuh Tablet 44px+ & Skala Tipografi (UX-04 / UX-05 / ERG-002)
* **Fase:** FASE 16 (P1 - HIGH)
* **Deskripsi:** Membangun komponen dasar ramah tablet `src/components/mobile/IconButton.tsx` dan `src/components/mobile/SelectInput.tsx` dengan ukuran sentuh minimal $\ge 44\times 44\text{px}$. Merefaktor seluruh kontrol kecil (<44px) seperti tombol tutup 24px di `ActiveMemberSelector` dan selektor status di `MemberWorkLogSection`. Menetapkan skala tipografi minimum (*typography floor*): 12px untuk teks pendukung/badge dan 14px untuk kontrol form/label.
* **Dependensi:** `TASK-102`
* **File:** `src/components/mobile/IconButton.tsx`, `src/components/mobile/SelectInput.tsx`, `src/components/mobile/ActiveMemberSelector.tsx`, `src/components/mobile/MemberWorkLogSection.tsx`, `src/tests/touchTargetTypography.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `docs/mobile/DEVICE_AUDIT.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Seluruh tombol interaktif dan kontrol select memenuhi batas minimum 44px pada layar sentuh.
  2. Tidak ada teks informatif di bawah 12px (menghilangkan pemakaian `text-[9px]` dan `text-[10px]` yang sulit dibaca).
  3. Unit test `src/tests/touchTargetTypography.test.ts` (TC-P16-03) memverifikasi dimensi elemen dan skala tipografi (100% PASS).
* **Test Case:** `TC-P16-03`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/touchTargetTypography.test.ts`.

---

### TASK-104: Code Splitting Tab dengan React.lazy & Skeleton Loaders (UX-08 / PERF-001)
* **Fase:** FASE 16 (P1 - HIGH)
* **Deskripsi:** Mengoptimalkan performa startup dan efisiensi memori RAM 3GB pada tablet Samsung Galaxy Tab A7 Lite. Mengubah arsitektur impor statis 18 tab pada `src/App.tsx` (~14.000 baris) menjadi modul dinamis berbasis `React.lazy` dan `Suspense`. Membangun komponen skeleton loader seragam yang mempertahankan kestabilan layout (*zero layout shift*) saat pengguna beralih antar tab.
* **Dependensi:** `TASK-103`
* **File:** `src/App.tsx`, `src/components/mobile/TabSkeleton.tsx`, `src/tests/codeSplitting.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `docs/mobile/DEVICE_AUDIT.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Ukuran bundle JavaScript awal berkurang terukur karena pembagian chunk dinamis per tab.
  2. Beralih tab menampilkan skeleton loader ringan tanpa kedipan layar atau freeze memori.
  3. Unit test `src/tests/codeSplitting.test.ts` (TC-P16-04) memverifikasi lazy loading dan integrasi Suspense (100% PASS).
* **Test Case:** `TC-P16-04`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/codeSplitting.test.ts && npm run build`.

---

### TASK-105: Penanganan Storage Quota, Fallback Salin & Stack Banner Dinamis (UX-09 / UX-10 / UX-11 / UI-002)
* **Fase:** FASE 16 (P1 - HIGH)
* **Deskripsi:** Meningkatkan ketahanan antarmuka pada skenario kegagalan: (1) Menangkap galat `QuotaExceededError` di `useSessionPersistence.ts` dan menampilkan banner merah darurat dengan opsi ekspor berkas cadangan `.md`, (2) Memperbaiki tombol "Pilih Manual" pada `OneTapCopyButton.tsx` agar membuka panel teks yang otomatis terseleksi saat Clipboard API gagal, (3) Menata ulang banner offline dan banner install PWA agar berada di bawah navbar header secara bertumpuk rapi tanpa saling menimpa.
* **Dependensi:** `TASK-104`
* **File:** `src/hooks/useSessionPersistence.ts`, `src/components/mobile/OneTapCopyButton.tsx`, `src/components/mobile/MobileLayout.tsx`, `src/tests/uiResilience.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`, `09_FAILURE_AND_RECOVERY.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Galat kepenuhan kuota storage memicu banner peringatan persisten dan tidak pernah gagal secara senyap.
  2. Fallback salin manual membuka dialog seleksi teks yang siap disalin manual oleh pengguna.
  3. Banner offline dan install PWA tidak pernah menutupi baris tab navigasi.
  4. Unit test `src/tests/uiResilience.test.ts` (TC-P16-05) memverifikasi penanganan kuota, fallback salin, dan tata letak banner (100% PASS).
* **Test Case:** `TC-P16-05`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/uiResilience.test.ts`.

---

### TASK-106: Hard Token Budget Enforcement & Context Pruning (AUD4-010 / AI-001)
* **Fase:** FASE 16 (P1 - HIGH)
* **Deskripsi:** Memperbaiki pembuatan Context Pack di `src/utils/contextPackGenerator.ts` agar secara tegas menerapkan pemangkasan token berbasis prioritas (`pruneContextForBudget()`). Menjamin payload markdown yang diekspor untuk Claude (30k), GPT (128k), Gemini (1M), Compact (8k), dan FreeBuff (4k) tidak pernah melebihi kuota keras model tujuan, menyisakan reserve buffer untuk instruksi dan reasoning token.
* **Dependensi:** `TASK-105`
* **File:** `src/utils/contextPackGenerator.ts`, `src/utils/tokenBudgetAdapter.ts`, `src/tests/tokenBudgetHardCap.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Generator otomatis memangkas lampiran historis berlebih sebelum finalisasi berkas markdown jika estimasi token melebihi budget.
  2. Menampilkan badge peringatan jika payload mendekati 95% dari kuota preset.
  3. Unit test `src/tests/tokenBudgetHardCap.test.ts` (TC-P16-06) memverifikasi penegakan batas keras token untuk seluruh model AI (100% PASS).
* **Test Case:** `TC-P16-06`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/tokenBudgetHardCap.test.ts`.

---

### ============================================================================
### FASE 17: POLISHING P2, PARITAS DOKUMENTASI, TAB DIAGNOSTIK PERFORMA PWA & PENGESAHAN RILIS GA FINAL
### ============================================================================

### TASK-107: Rekonsiliasi 14 Blueprint As-Built & Identitas Rilis Kanonik (AUD4-009 / UX-12 / DOC-001)
* **Fase:** FASE 17 (P2 - POLISH)
* **Deskripsi:** Menuntaskan seluruh temuan dokumentasi dan inkonsistensi metadata: (1) Memperbarui status header seluruh 14 cetak biru di `docs/mobile/blueprint/01_*.md` s.d. `14_*.md` dari `DRAFT BLUEPRINT` menjadi `APPROVED / AS-BUILT`, (2) Merekonsiliasi total 111 task di `MOBILE_BLUEPRINT.md`, `TASKS.md`, dan `SESSION_STATE.md`, (3) Mengubah atribut `<html lang="en">` menjadi `<html lang="id">` di `index.html`, dan (4) Menyeragamkan identitas penamaan aplikasi menjadi "ZLCE Mobile Workbench v4.0.0 GA" di manifest, index.html, dan footer.
* **Dependensi:** `TASK-106`
* **File:** `docs/mobile/blueprint/01_*.md` s.d. `14_*.md`, `docs/mobile/MOBILE_BLUEPRINT.md`, `index.html`, `public/manifest.webmanifest`, `src/tests/blueprintParity.test.ts`
* **Docs Terkait:** `docs/mobile/MOBILE_BLUEPRINT.md`, `docs/README.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Seluruh 14 header berkas blueprint berstatus `APPROVED / AS-BUILT`.
  2. Jumlah task di seluruh dokumen master selaras pada angka 111 task.
  3. Atribut bahasa dokumen `lang="id"` dan nama produk seragam di semua platform.
  4. Unit test `src/tests/blueprintParity.test.ts` (TC-P17-01) memverifikasi paritas header dan metadata dokumen (100% PASS).
* **Test Case:** `TC-P17-01`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/blueprintParity.test.ts`.

---

### TASK-108: Polishing CSS Tailwind, Jargon Clarity, Reduced Motion & Nav (UX-13 / UX-14 / UX-15 / UX-16 / UI-003)
* **Fase:** FASE 17 (P2 - POLISH)
* **Deskripsi:** Memoles kualitas tampilan dan kenyamanan visual: (1) Memperbaiki 41 lokasi pemakaian kelas CSS Tailwind tidak valid `py-0.2` dan `px-0.2`, (2) Membahasakan ulang istilah teknis internal di UI (seperti jargon jam/invarian) menjadi bahasa operasional ramah pengguna, (3) Menambahkan dukungan `@media (prefers-reduced-motion)` pada animasi UI, (4) Menambahkan tombol Undo/Redo sentuh di header, dan (5) Mengonsolidasikan tab navigasi yang merender komponen identik.
* **Dependensi:** `TASK-107`
* **File:** `src/index.css`, `src/components/Header.tsx`, `src/App.tsx`, `src/components/mobile/MemberWorkLogSection.tsx`, `src/tests/uiPolishing.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. 0 kelas CSS Tailwind tidak valid tersisa di berkas komponen.
  2. Antarmuka menggunakan bahasa komunikatif tanpa jargon kriptik.
  3. Animasi pulse/bounce otomatis dinonaktifkan saat preferensi reduced-motion aktif.
  4. Unit test `src/tests/uiPolishing.test.ts` (TC-P17-02) memverifikasi perbaikan CSS dan kontrol aksesibilitas (100% PASS).
* **Test Case:** `TC-P17-02`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/uiPolishing.test.ts`.

---

### TASK-109: Telemetri Pengujian Fisik SM-T225 & Runtime Test Quality (AUD4-005 / AUD4-008 / AUD4-011 / QA-001)
* **Fase:** FASE 17 (P2 - POLISH)
* **Deskripsi:** Meningkatkan akuntabilitas bukti pengujian perangkat fisik dan lingkungan build: (1) Memperbarui skrip `scripts/test-lmk-physical.sh` agar mencatat PID proses browser, konsumsi PSS memori, dan nilai `/proc/<pid>/oom_score_adj`, (2) Memperbaiki unit test runtime agar mengukur bounding client rect dan event browser nyata, (3) Memastikan keberadaan file dependensi terkunci untuk instalasi deterministik offline.
* **Dependensi:** `TASK-108`
* **File:** `scripts/test-lmk-physical.sh`, `src/tests/physicalTelemetryAndQuality.test.ts`, `docs/mobile/DEVICE_AUDIT.md`
* **Docs Terkait:** `docs/mobile/DEVICE_AUDIT.md`, `docs/mobile/blueprint/10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Skrip `test-lmk-physical.sh` menghasilkan log telemetri memori terstruktur dengan timestamp dan verifikasi recovery.
  2. Pengujian otomatis memvalidasi lifecycle browser nyata tanpa mengandalkan mock statis semata.
  3. Unit test `src/tests/physicalTelemetryAndQuality.test.ts` (TC-P17-03) lulus 100% tanpa error.
* **Test Case:** `TC-P17-03`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/physicalTelemetryAndQuality.test.ts`.

---

### TASK-110: Rekonsiliasi Master Test Runner, Verifikasi Bundel & Pengesahan Gerbang (FIN-001)
* **Fase:** FASE 17 (P1 - HIGH)
* **Deskripsi:** Merekonsiliasi seluruh step pengujian baru (`TC-P15-01` s/d `TC-P17-03`) ke dalam runner otomatis utama `scripts/run-tests.py`. Menjalankan bundle closure gate di `scripts/create-audit-bundle.py` dan `scripts/create-pwa-review-bundle.py`. Menjalankan pemindaian keamanan `scripts/security-audit.sh` dan pemeriksaan kanonik `scripts/zlce-check.py .`. Mencatat pengesahan gerbang rilis GA secara resmi oleh 8 anggota tim estafet.
* **Dependensi:** `TASK-109`
* **File:** `scripts/run-tests.py`, `scripts/create-audit-bundle.py`, `scripts/create-pwa-review-bundle.py`, `SESSION_STATE.md`, `CHANGELOG.md`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`, `12_ARCHITECTURE_DECISIONS.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Seluruh pengujian otomatis di `scripts/run-tests.py` lulus 100% tanpa kegagalan.
  2. Generator bundel ZIP menghasilkan arsip valid lengkap dengan `SHA256SUMS.txt` tanpa broken import.
  3. Pemindai keamanan melaporkan 0 celah kredensial dan `zlce-check.py` melaporkan 0 error dan 0 warning.
  4. Pengesahan gerbang rilis GA ditandatangani oleh anggota resmi.
* **Test Case:** `TC-P17-FIN`
* **Metode Verifikasi:** Jalankan `python3 scripts/run-tests.py && python3 scripts/zlce-check.py .`.

---

### TASK-111: Tab Diagnostik & Audit Performa PWA di UI Studio (UX-18 / PERF-002)
* **Fase:** FASE 17 (P1 - HIGH)
* **Deskripsi:** Membangun tab baru 'Performance Audit' (`performance-audit`) pada antarmuka ZLCE Studio yang menampilkan metrik diagnostik PWA secara komprehensif: (1) Status Offline/Online (navigator.onLine, jenis koneksi jaringan), (2) Estimasi Ukuran Cache Storage (pengukuran total cached requests dan perkiraan byte via StorageManager API / caches.keys()), (3) Status Registrasi Service Worker (controller, active/waiting/installing state, update prompt handler), serta (4) Tombol interaktif 'Check Optimization' yang menjalankan simulasi audit performa frontend PWA (First Contentful Paint, rasio kepatuhan target sentuh 44px+, estimasi konsumsi heap RAM untuk target SM-T225 <150MB, status auto-draft listeners, dan rasio pemakaian kuota storage) dengan scorecard visual 0-100, badge status, rekomendasi aksi, dan tombol 1-ketuk salin/ekspor laporan ke Markdown.
* **Dependensi:** `TASK-110`
* **File:** `src/components/mobile/PerformanceAuditTab.tsx`, `src/App.tsx`, `src/components/Header.tsx`, `src/tests/performanceAudit.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`, `02_COMPONENT_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Tab 'Performance Audit' terdaftar pada navigasi utama Studio dan dapat diakses langsung via URL `?tab=performance-audit`.
  2. Menampilkan kartu metrik diagnostik real-time untuk status koneksi jaringan (online/offline), estimasi ukuran cache storage, dan status pendaftaran Service Worker.
  3. Tombol 'Check Optimization' mengeksekusi simulasi audit performa frontend PWA dan menghasilkan skor kesiapan 0-100 beserta rincian indikator ramah tablet.
  4. Menyediakan tombol 1-ketuk untuk menyalin ringkasan audit ke clipboard atau mengunduhnya sebagai berkas laporan `.md`.
  5. Unit test `src/tests/performanceAudit.test.ts` (TC-P17-04) memverifikasi rendering tab, pembacaan diagnostik, eksekusi tombol audit optimasi, dan integritas metrik PWA (100% PASS).
* **Test Case:** `TC-P17-04`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/performanceAudit.test.ts && python3 scripts/run-tests.py`.

---

### ============================================================================
### FASE 18: REMEDIASI HASIL REVIEW FRONTEND PWA ULANG (11 NOV 2026) & PENYERAGAMAN IDENTITAS RILIS (ZLCEv4Mobile) [R-01 s.d. R-12]
### ============================================================================

### TASK-112: Penyeragaman Identitas Proyek & PWA: "ZLCE Mobile Workbench v4.0.0" & "ZLCEv4Mobile" (R-06 / REV-ID-01)
* **Fase:** FASE 18 (P1 - HIGH)
* **Deskripsi:** Menyeragamkan identitas resmi produk menjadi "ZLCE Mobile Workbench v4.0.0" (nama lengkap) dan "ZLCEv4Mobile" (nama ringkas/identitas PWA) di seluruh dokumen kendali ZLCE, Web App Manifest, HTML `<title>`, OpenGraph metadata, splash screen, sidebar, footer, dan test harness, serta membersihkan sisa referensi versi lama "v3.2.2".
* **Dependensi:** `TASK-111`
* **File:** `public/manifest.webmanifest`, `index.html`, `src/App.tsx`, `src/components/Header.tsx`, `src/components/PersistentSidebar.tsx`, `src/components/TestHarnessTab.tsx`, `src/tests/blueprintParity.test.ts`, `README.md`, `docs/mobile/MOBILE_BLUEPRINT.md`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`, `public/assets/aistudio/Skor_dan_Usulan_Review_ZLCE_v4.0.0_GA_8bd021f7.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `manifest.webmanifest` mendefinisikan `name: "ZLCE Mobile Workbench v4.0.0"` dan `short_name: "ZLCEv4Mobile"`.
  2. `index.html` menyelaraskan `<title>ZLCEv4Mobile - ZLCE Mobile Workbench v4.0.0</title>`, meta description, dan splash screen.
  3. Antarmuka UI (Header, Sidebar, Footer, Test Harness) terbebas dari sisa label "v3.2.2" dan menampilkan identitas v4.0.0 yang konsisten.
  4. Pengujian otomatis `src/tests/blueprintParity.test.ts` (TC-P18-01) memvalidasi keseragaman identitas produk rilis 100% PASS.
* **Test Case:** `TC-P18-01`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/blueprintParity.test.ts && python3 scripts/zlce-check.py . --strict --no-git`.

---

### TASK-113: Integritas Ikon PWA & Cek Pasca-Build Caching Offline (R-01 / P0-01)
* **Fase:** FASE 18 (P0 - CRITICAL)
* **Deskripsi:** Memastikan seluruh aset ikon PWA (`public/icons/*` 192x192, 512x512, maskable, apple-touch-icon) selalu disertakan dalam bundel build, memiliki header caching yang tepat, dan diverifikasi otomatis melalui script uji pasca-build sehingga memenuhi 100% kriteria Lighthouse PWA "Installable" dengan 0 kesalahan 404 pada mode offline.
* **Dependensi:** `TASK-112`
* **File:** `public/icons/`, `scripts/run-tests.py`, `src/tests/pwaIconsIntegrity.test.ts`, `package.json`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Seluruh ikon PWA (192px, 512px, maskable, apple-touch-icon) terverifikasi keberadaan dan integritas filenya.
  2. Skrip pengujian otomatis memverifikasi bahwa build output Vite menyertakan seluruh aset ikon tanpa 404.
  3. Lolos kriteria PWA installable audit tanpa peringatan aset ikon hilang.
* **Test Case:** `TC-P18-02`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/pwaIconsIntegrity.test.ts`.

---

### TASK-114: Komponen ModalShell Bersama & Focus Trap Aksesibel (R-02 / P1-01)
* **Fase:** FASE 18 (P1 - HIGH)
* **Deskripsi:** Mengabstraksikan struktur modal dialog ke dalam komponen `ModalShell` bersama dengan kepatuhan W3C ARIA (`role="dialog"`, `aria-modal="true"`), penanganan tombol keyboard Escape yang andal, focus trap otomatis, dan hook keyboard terpadu, lalu memigrasikan seluruh modal dialog yang ada (PasteBackModal, DeviceHandoverModal, GateApprovalModal, SmartTaskCheckModal, dll.) ke `ModalShell`.
* **Dependensi:** `TASK-113`
* **File:** `src/components/mobile/ModalShell.tsx`, `src/components/mobile/DeviceHandoverModal.tsx`, `src/components/mobile/PasteBackModal.tsx`, `src/components/mobile/GateApprovalModal.tsx`, `src/components/DashboardTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Komponen `ModalShell` menyediakan penanganan tombol Escape, penangkapan fokus keyboard (focus trap), dan atribut `aria-modal="true"` secara terpadu.
  2. Seluruh dialog modal di antarmuka ZLCE termigrasi dan konsisten terhadap interaksi keyboard tablet.
  3. 0 dialog modal tanpa penanganan Escape dan atribut aksesibilitas.
* **Test Case:** `TC-P18-03`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/accessibleDialogs.test.ts`.

---

### TASK-115: Ekspansi Universal DraftTextarea ke Seluruh Form Kritis (R-03 / P1-02)
* **Fase:** FASE 18 (P1 - HIGH)
* **Deskripsi:** Menggantikan seluruh elemen `<textarea>` mentah yang tersisa (bukti verifikasi DashboardTab, alasan ambil alih klaim TaskClaimBanner, catatan serah terima DeviceHandoverModal, input PromptStudio, SessionState, dan catatan recovery) dengan komponen `DraftTextarea` yang memiliki sistem penyimpanan draft otomatis terlindung dari Android Low Memory Killer (LMK) dan penutupan tab tak disengaja.
* **Dependensi:** `TASK-114`
* **File:** `src/components/DashboardTab.tsx`, `src/components/mobile/TaskClaimBanner.tsx`, `src/components/mobile/DeviceHandoverModal.tsx`, `src/components/PromptEngineTab.tsx`, `src/components/RecoveryTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/05_STORAGE_AND_SYNC.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Seluruh area input teks panjang pada formulir kritis terlindungi oleh auto-draft caching 400ms.
  2. Saat browser dimatikan paksa (simulasi LMK) di tengah pengetikan bukti atau catatan, teks dapat dipulihkan 100%.
  3. Uji otomatis memverifikasi pemulihan draft di seluruh form target.
* **Test Case:** `TC-P18-04`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/universalDraftCache.test.ts`.

---

### TASK-116: Dinamisasi Filter & Pemetaan Fase Lengkap (Fase 0 s/d 18) di Seluruh UI Dashboard & Komponen Terkait (R-09 / UX-02 / FE-001)
* **Fase:** FASE 18 (P1 - HIGH)
* **Deskripsi:** Menghilangkan pembatasan statis 9 fase (Fase 0 s/d 8) pada antarmuka: (1) Memperluas katalog `TASK_PHASES` di `DashboardTab.tsx` mencakup seluruh 19 fase lengkap (Fase 0 s/d Fase 18) dari TASK-001 hingga seluruh task aktif, (2) Mengganti teks statis seperti "9 Fase Eksekusi" dan "Matriks Backlog 43 Task Atomik (Fase 0 s/d 8)" menjadi dinamis sesuai jumlah fase dan task riil, (3) Memperbaiki indikator ringkasan fase selesai di kartu metrik menjadi penghitung dinamis, (4) Menyelaraskan teks paritas pada `TutorialTab.tsx`, `templates.ts`, dan dokumen terkait.
* **Dependensi:** `TASK-115`
* **File:** `src/components/DashboardTab.tsx`, `src/components/TutorialTab.tsx`, `src/data/templates.ts`, `src/tests/dashboardPhaseFilter.test.ts`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `01_SYSTEM_OVERVIEW.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Filter fase pada DashboardTab menampilkan seluruh 19 fase (Fase 0 hingga Fase 18) dan opsi "Semua Task".
  2. Memilih tombol fase (misal Fase 9, Fase 14, atau Fase 18) menyaring task dengan akurat sesuai rentang task pada fase tersebut.
  3. Header backlog dan kartu metrik menampilkan jumlah task dan fase aktual secara dinamis tanpa hardcoded "43 Task" atau "9 Fase".
  4. Uji otomatis memverifikasi keutuhan rentang dan filter seluruh 19 fase tanpa regresi.
* **Test Case:** `TC-P18-05`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/dashboardPhaseFilter.test.ts`.

---

### TASK-117: Dynamic Stack Banner `--header-h`, Tipografi Bersih & Refaktor Jargon UI (R-04 / R-05 / R-07 / UX-POLISH)
* **Fase:** FASE 18 (P1 - HIGH)
* **Deskripsi:** Memoles ergonomi dan keterbacaan antarmuka: (1) Menggunakan `ResizeObserver` pada header untuk mengatur variabel CSS `--header-h` secara presisi sehingga tumpukan banner peringatan tidak pernah menutupi baris tab navigasi, (2) Menata ulang skala tipografi agar seluruh teks informatif memiliki ukuran minimal 12px/14px (0 `text-[9px]` atau `text-[10px]` pada teks informatif), dan (3) Membahasakan ulang jargon internal ("Fix X1", "Invarian I1-I5") menjadi kalimat bahasa Indonesia operasional yang lugas dan ramah bagi anggota non-teknis.
* **Dependensi:** `TASK-116`
* **File:** `src/components/Header.tsx`, `src/components/mobile/MobileLayout.tsx`, `src/components/mobile/TaskClaimBanner.tsx`, `src/App.tsx`, `src/components/DashboardTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `01_SYSTEM_OVERVIEW.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Banner stack memiliki offset dinamis berbasis `--header-h` aktual dan tidak pernah menghalangi navigasi tab.
  2. 0 teks informatif yang menggunakan font di bawah 12px.
  3. Istilah status di antarmuka menggunakan bahasa yang mudah dipahami tanpa kode internal kriptik.
* **Test Case:** `TC-P18-06`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/touchTargetTypography.test.ts && npx tsx src/tests/uiResilience.test.ts`.

---

### TASK-118: Penyelarasan Status Live Bridge, Manifest PWA & Rekonsiliasi Bundel Rilis (R-08 / R-10 / R-11 / R-12 / FIN-002)
* **Fase:** FASE 18 (P1 - HIGH)
* **Deskripsi:** Melakukan rekonsiliasi akhir rilis ZLCEv4Mobile: (1) Memberikan status transparan "Live Bridge tidak aktif (Mode Statis PWA)" pada antarmuka saat `/api/session-state` 404 tanpa memicu console error yang mengganggu, (2) Membersihkan sisa fallback literal `TASK-013`, menstandarkan zona waktu WIB, dan melengkapi blok `catch {}`, (3) Menyertakan direktori `scripts/` dan suite pengujian ke dalam generator bundel review, dan (4) Menyempurnakan manifest PWA serta banner `aria-live` untuk audit Lighthouse PWA tanpa peringatan.
* **Dependensi:** `TASK-117`
* **File:** `src/hooks/useSessionPersistence.ts`, `src/components/DashboardTab.tsx`, `scripts/create-pwa-review-bundle.py`, `public/manifest.webmanifest`, `src/components/mobile/MobileLayout.tsx`, `SESSION_STATE.md`, `CHANGELOG.md`
* **Docs Terkait:** `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`, `10_TEST_STRATEGY.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Penanganan status Live Bridge berjalan mulus baik di mode offline/statis maupun mode backend lokal.
  2. 0 kode literal task default yang tidak terurus, format timestamp terstandarisasi WIB.
  3. Bundel review memuat seluruh skrip verifikasi yang dapat dieksekusi secara mandiri.
  4. Seluruh rangkaian test runner `run-tests.py` dan validator `zlce-check.py` lulus 100% tanpa error.
* **Test Case:** `TC-P18-FIN`
* **Metode Verifikasi:** Jalankan `python3 scripts/run-tests.py && python3 scripts/zlce-check.py . --strict --no-git`.

---

### ============================================================================
### FASE 19: PENYEDERHANAAN FRONTEND PWA MENJADI DASHBOARD TEKNIS RINGKAS
### ============================================================================

### TASK-119: Pengarsipan Komponen Lama ke Folder Arsip (`src/archive/components/`)
* **Fase:** FASE 19 (P1 - HIGH)
* **Deskripsi:** Menyiapkan folder arsip `src/archive/components/` dan menyalin seluruh komponen modul asli yang akan dikonsolidasi sebagai cadangan aman sebelum penyederhanaan antarmuka.
* **Dependensi:** `TASK-118`
* **File:** `src/archive/components/`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Direktori arsip `src/archive/components/` terbuat dan terisi salinan komponen lama.
  2. Komponen arsip tidak menimbulkan kesalahan kompilasi TypeScript (`tsc --noEmit`).
  3. Verifikasi ketersediaan berkas arsip lengkap.
* **Test Case:** `TC-P19-01`
* **Metode Verifikasi:** Jalankan `ls -la src/archive/components/ && npx tsc --noEmit`.

---

### TASK-120: Restrukturisasi Tipe Navigasi (`src/types/zlce.ts`), Header 6-Tab Bersih & Routing Dasar
* **Fase:** FASE 19 (P1 - HIGH)
* **Deskripsi:** Merefaktor tipe navigasi `TabType` menjadi 6 tab terstruktur (`dashboard`, `session`, `ai-workbench`, `terminal-git`, `diagnostics`, `docs`) dengan dukungan alias navigasi lama. Memperbarui `Header.tsx` dengan baris navigasi 6 tombol yang bersih, tanpa tombol toggle lipat, dan langsung pas di layar tablet 1340x800.
* **Dependensi:** `TASK-119`
* **File:** `src/types/zlce.ts`, `src/components/Header.tsx`, `src/App.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `docs/mobile/USAGE_MOBILE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `TabType` memiliki 6 nilai kanonik terstruktur dan alias kompatibel.
  2. `Header.tsx` merender tepat 6 tab utama berukuran minimal 44px tanpa tombol overflow.
  3. Routing dasar di `App.tsx` merespons pergantian 6 tab dengan benar.
* **Test Case:** `TC-P19-02`
* **Metode Verifikasi:** Jalankan `npx tsc --noEmit && npm run lint`.

---

### TASK-121: Konsolidasi AI Workbench (`src/components/mobile/AiWorkbenchTab.tsx`) dengan Sub-Segmen
* **Fase:** FASE 19 (P1 - HIGH)
* **Deskripsi:** Membangun modul terpadu `AiWorkbenchTab.tsx` yang menggabungkan Context Pack Generator, Token Budget Selector, Result Capture dengan injeksi provenance otomatis, dan Wizard Serah Terima AI (Handover & Conflict Resolution) menggunakan toggle sub-segmen ringkas (`[1. Rakit Prompt] | [2. Tangkap Hasil & Estafet]`).
* **Dependensi:** `TASK-120`
* **File:** `src/components/mobile/AiWorkbenchTab.tsx`, `src/App.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`, `docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `AiWorkbenchTab` menyediakan toggle sub-segmen yang mulus tanpa muat ulang.
  2. Sub-segmen 1 merakit Context Pack dengan seleksi task dan kuota token AI.
  3. Sub-segmen 2 menampung kode jawaban AI dan menginjeksi metadata provenance secara otomatis.
  4. Fitur deteksi konflik keputusan dan estafet antar-AI terintegrasi penuh.
* **Test Case:** `TC-P19-03`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/coldStartAi.test.ts`.

---

### TASK-122: Konsolidasi Terminal & Git Dispatcher (`src/components/mobile/TerminalGitTab.tsx`) dengan Sub-Segmen
* **Fase:** FASE 19 (P1 - HIGH)
* **Deskripsi:** Membangun modul terpadu `TerminalGitTab.tsx` yang menyatukan katalog perintah ZLCE (`zlce check`, `snapshot`), alur kerja cabang Git (`task/TASK-xxx`), commit beridentitas anggota, safe pull `--ff-only`, push remote, panel paste-back terminal, dan tindakan clean-auth RAM menggunakan sub-segmen (`[1. Perintah Teknis & ZLCE] | [2. Git Workflow & Cabang] | [3. Pemulihan Darurat A-D]`).
* **Dependensi:** `TASK-121`
* **File:** `src/components/mobile/TerminalGitTab.tsx`, `src/App.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/04_TERMUX_INTEGRATION.md`, `06_REPOSITORY_CHANGES.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Seluruh perintah shell aman termux dan Git terkonsolidasi dalam satu konsol.
  2. Template commit menginjeksi identitas anggota aktif saat ini secara akurat.
  3. Panel paste-back memvalidasi keluaran `RESULT: OK` dari Termux.
  4. Tombol dan template perintah clean-auth RAM tersedia dan tervalidasi.
* **Test Case:** `TC-P19-04`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/gitWorkflow.test.ts`.

---

### TASK-123: Redesain DashboardTab Menjadi Dasbor Teknis Fokus
* **Fase:** FASE 19 (P1 - HIGH)
* **Deskripsi:** Mengeliminasi elemen kosmetik berlebih (gradien dekoratif, banner promosi panjang, animasi ping/bounce yang tidak fungsional). Menata ulang tata letak menjadi dasbor teknis berdensitas informasi tinggi: strip status sistem ringkas (Cabang, Driver, Disk Sync, Health), panel fokus eksekusi aktif dengan tombol 1-ketuk langsung, dan tabel matriks backlog dengan filter fase/status yang responsif.
* **Dependensi:** `TASK-122`
* **File:** `src/components/DashboardTab.tsx`
* **Docs Terkait:** `docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md`, `02_COMPONENT_ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Tidak ada elemen gradien dekoratif berat atau animasi kosmetik yang tidak fungsional.
  2. Status sistem, task aktif, dan akses aksi teknis terlihat jelas di atas lipatan layar tablet (*above-the-fold*).
  3. Validasi aturan 1 task IN_PROGRESS dan Smart Task Check tetap berfungsi sempurna.
* **Test Case:** `TC-P19-05`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/smartTaskCheck.test.ts && npx tsx src/tests/dashboardPhaseFilter.test.ts`.

---

### TASK-124: Penyatuan Diagnostik (`DiagnosticsTab.tsx`) & Dokumentasi Referensi (`DocsReferenceTab.tsx`), Serta Rekonsiliasi Paritas Test Runner & ZLCE-Check
* **Fase:** FASE 19 (P1 - HIGH)
* **Deskripsi:** Menggabungkan alat diagnostik teknis (Test Harness, Triase Revisi, Performance Audit) ke dalam `DiagnosticsTab.tsx`; menggabungkan seluruh materi referensi (Workspace Reader dokumen markdown, Tutorial operasional 10 langkah, panduan Termux, dan template) ke dalam `DocsReferenceTab.tsx` di urutan paling akhir. Melakukan rekonsiliasi pengujian akhir dan verifikasi `zlce-check.py` 124 task.
* **Dependensi:** `TASK-123`
* **File:** `src/components/DiagnosticsTab.tsx`, `src/components/DocsReferenceTab.tsx`, `src/App.tsx`, `scripts/run-tests.py`, `SESSION_STATE.md`, `CHANGELOG.md`
* **Docs Terkait:** `docs/mobile/blueprint/10_TEST_STRATEGY.md`, `docs/mobile/USAGE_MOBILE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `DiagnosticsTab` menyajikan sub-segmen Test Harness, Triase Revisi, dan Audit Performa.
  2. `DocsReferenceTab` menyajikan pembaca dokumen markdown dan tutorial di bagian paling akhir tab.
  3. `scripts/run-tests.py` dan `scripts/zlce-check.py` meluluskan seluruh 124 task dengan 0 error dan 0 warning.
* **Test Case:** `TC-P19-FIN`
* **Metode Verifikasi:** Jalankan `python3 scripts/run-tests.py && python3 scripts/zlce-check.py . --strict --no-git`.

---

### ============================================================================
### FASE 20: PENYELARASAN PENUH BERKAS KONTROL ZLCE (MODE FULL & LITE), ARSIP AUDIT, PARITAS DOKUMENTASI & BUNDEL v4.1.0 GA
### ============================================================================

### TASK-125: Penambahan `AI_WORKFLOW.md` & `HANDOVER.md` Kanonik di Root Repositori
* **Fase:** FASE 20 (P0 - CRITICAL)
* **Deskripsi:** Melengkapi berkas kendali inti ZLCE di root repositori dengan membuat `/AI_WORKFLOW.md` (disesuaikan dari `templates/AI_WORKFLOW.template.md` untuk ekosistem `ZLCEv4.1Mob` 6-tab + Termux relay + Aturan X1) dan `/HANDOVER.md` (salinan verbatim blok prompt dari `/HANDOVER_PROMPT.md` sesuai Gerbang 4 `LANDING_PROMPT.md`).
* **Dependensi:** `TASK-124`
* **File:** `AI_WORKFLOW.md`, `HANDOVER.md`
* **Docs Terkait:** `LANDING_PROMPT.md`, `HANDOVER_PROMPT.md`, `templates/AI_WORKFLOW.template.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `/AI_WORKFLOW.md` tersedia di root memuat seluruh 10 bagian kanonik ZLCE beserta konvensi `ZLCE Mobile Workbench v4.1.0 GA` (`ZLCEv4.1Mob`).
  2. `/HANDOVER.md` merupakan salinan verbatim blok prompt dari `/HANDOVER_PROMPT.md` (baris 15–68).
  3. `python3 scripts/zlce-check.py . --strict --no-git` tetap 0 error dan 0 warning.
* **Test Case:** `TC-P20-01`
* **Metode Verifikasi:** Verifikasi kesamaan byte blok prompt `HANDOVER_PROMPT.md` vs `HANDOVER.md` dan jalankan `python3 scripts/zlce-check.py . --strict --no-git`.

---

### TASK-126: Kelengkapan 5 Indeks Kontrol Mode FULL (`BLUEPRINT.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `TESTING.md`, `CHECKLISTS.md`) & Perbaikan Kelengkapan Berkas Mode LITE
* **Fase:** FASE 20 (P0 - CRITICAL)
* **Deskripsi:** Melengkapi seluruh 10/10 berkas kendali Mode FULL di root repositori dengan membuat indeks kanonik `/BLUEPRINT.md`, `/ARCHITECTURE.md`, `/DATA_MODEL.md`, `/TESTING.md`, dan `/CHECKLISTS.md` yang terhubung ke `docs/mobile/blueprint/` dan `scripts/run-tests.py`. Sekaligus memeriksa dan memperbaiki kelengkapan berkas Mode LITE pada `zlce-starter-kit/` (`BLUEPRINT.md` dengan §7–§8 Mode LITE, `HANDOVER.md` verbatim, pembaruan `zlce-starter-kit/README.md`, `zlce-starter-kit/SESSION_STATE.md` 7 seksi kanonik, dan penyelarasan `zlce-starter-kit/TASKS.md` + `scripts/sync-assets.mjs`).
* **Dependensi:** `TASK-125`
* **File:** `BLUEPRINT.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `TESTING.md`, `CHECKLISTS.md`, `zlce-starter-kit/BLUEPRINT.md`, `zlce-starter-kit/HANDOVER.md`, `zlce-starter-kit/README.md`, `zlce-starter-kit/SESSION_STATE.md`, `zlce-starter-kit/TASKS.md`, `scripts/sync-assets.mjs`
* **Docs Terkait:** `LANDING_PROMPT.md`, `templates/`, `docs/mobile/MOBILE_BLUEPRINT.md`, `zlce-starter-kit/README.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Seluruh 10/10 berkas kendali Mode FULL (`CONTROL` set) tersedia utuh di root repositori tanpa duplikasi konten SSOT `docs/mobile/blueprint/`.
  2. `zlce-starter-kit/` lengkap 4 berkas inti Mode LITE (`BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`) sesuai `LANDING_PROMPT.md` dan `templates/AI_WORKFLOW.template.md` §10.
  3. `python3 scripts/zlce-check.py zlce-starter-kit --strict --no-git` dan `python3 scripts/zlce-check.py . --strict --no-git` lulus 0 error, 0 warning.
* **Test Case:** `TC-P20-02`
* **Metode Verifikasi:** Jalankan `node scripts/sync-assets.mjs` dan `python3 scripts/zlce-check.py zlce-starter-kit --strict --no-git`.

---

### TASK-127: Penataan `TASKS.md`, Normalisasi Slot Revisi `TASK-REV-NN` & Pengarsipan Log Audit Lama ke `docs/archive/`
* **Fase:** FASE 20 (P1 - HIGH)
* **Deskripsi:** Menambahkan entri `FASE 17` yang terlewat di Bagian 1 `TASKS.md`, menormalkan ID slot revisi pada `SESSION_STATE.md` Bagian 5 dari `REV-AUD-02..05` ke konvensi `TASK-REV-01..04` sesuai Aturan R7 `LANDING_PROMPT.md`, serta mengarsipkan entri log audit historis (Fase 0 s/d Fase 18) dari Bagian 7 `SESSION_STATE.md` ke `/docs/archive/AUDIT_LOG_FASE_0_TO_18.md` sambil mempertahankan log Fase 19+ dan catatan pengesahan 8 anggota resmi tim pada `SESSION_STATE.md` agar paritas test runner terjaga 100%.
* **Dependensi:** `TASK-126`
* **File:** `TASKS.md`, `SESSION_STATE.md`, `docs/archive/AUDIT_LOG_FASE_0_TO_18.md`
* **Docs Terkait:** `LANDING_PROMPT.md`, `AI_WORKFLOW.md`
* **Docs Impact:** `TASKS.md`, `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Peta Fase `TASKS.md` Bagian 1 memuat FASE 0 s/d FASE 20 lengkap tanpa celah.
  2. Slot revisi di `SESSION_STATE.md` Bagian 5 menggunakan pola ID baku `TASK-REV-NN` dan sinkron dengan `TASKS.md` bila diperlukan atau dicatat tertib.
  3. `/docs/archive/AUDIT_LOG_FASE_0_TO_18.md` menyimpan log audit historis secara utuh, ukuran `SESSION_STATE.md` menyusut signifikan, dan seluruh nama 8 anggota resmi tim tetap terjaga untuk paritas test.
* **Test Case:** `TC-P20-03`
* **Metode Verifikasi:** Jalankan `python3 scripts/zlce-check.py . --strict --no-git` dan periksa kelengkapan arsip.

---

### TASK-128: Sinkronisasi Dokumentasi Utama, Paritas UI & Suite Uji v4.1.0 GA
* **Fase:** FASE 20 (P1 - HIGH)
* **Deskripsi:** Memperbarui `README.md`, `docs/README.md`, `docs/mobile/MOBILE_BLUEPRINT.md`, dan `CLAUDE_CHATGPT_HANDOVER.md` agar merefleksikan metrik terbaru (`129 task`, `73+ checks`), navigasi 6 tab kanonik, 4 komponen tab konsolidasi FASE 19 (`AiWorkbenchTab`, `TerminalGitTab`, `DiagnosticsTab`, `DocsReferenceTab`), bridge lokal `vite-session-sync.ts`, serta menyelaraskan `src/data/taskPhases.ts`, `src/data/templates.ts`, `src/components/TutorialTab.tsx`, dan asersi `src/tests/blueprintParity.test.ts` + `src/tests/dashboardPhaseFilter.test.ts`.
* **Dependensi:** `TASK-127`
* **File:** `README.md`, `docs/README.md`, `docs/mobile/MOBILE_BLUEPRINT.md`, `CLAUDE_CHATGPT_HANDOVER.md`, `src/data/taskPhases.ts`, `src/data/templates.ts`, `src/components/TutorialTab.tsx`, `src/tests/blueprintParity.test.ts`, `src/tests/dashboardPhaseFilter.test.ts`
* **Docs Terkait:** `TASKS.md`, `SESSION_STATE.md`, `ARCHITECTURE.md`
* **Docs Impact:** `README.md`, `docs/README.md`, `docs/mobile/MOBILE_BLUEPRINT.md`, `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Tidak ada lagi klaim metrik usang (`49/49`, `93/93`, `82/82`, `18 tab`) di dokumentasi aktif root/docs.
  2. `src/data/taskPhases.ts` mencakup `fase-20` (`TASK-125` s/d `TASK-129`) dan deskripsi `templates.ts` / `TutorialTab.tsx` selaras dengan v4.1.0 GA.
  3. Seluruh pengujian paritas (`blueprintParity.test.ts`, `documentationParity.test.ts`, `dashboardPhaseFilter.test.ts`) lulus 100%.
* **Test Case:** `TC-P20-04`
* **Metode Verifikasi:** Jalankan `npx tsx src/tests/blueprintParity.test.ts && npx tsx src/tests/documentationParity.test.ts && npx tsx src/tests/dashboardPhaseFilter.test.ts`.

---

### TASK-129: Konsolidasi Arsip Komponen, Pembaruan Generator Bundel ZIP & Verifikasi Penuh
* **Fase:** FASE 20 (P1 - HIGH)
* **Deskripsi:** Memindahkan konten `src/archive/components/README.md` ke `/archive/components/README.md` (memperbarui versi ke `v4.1.0 GA` / `ZLCEv4.1Mob`) dan membersihkan `src/archive/` dari pohon `src/`, memperbarui `scripts/create-pwa-review-bundle.py` (komentar 6 tab terpadu + seluruh berkas kontrol baru), `scripts/create-audit-bundle.py` (seluruh berkas kontrol Mode FULL, `docs/archive/`, dan Mode LITE starter kit baru), `scripts/create-claude-bundle.py`, serta `scripts/run-tests.py` Step 4, lalu meregenerasi seluruh bundel `.zip` dan menjalankan seluruh gerbang build/test/security/zlce-check.
* **Dependensi:** `TASK-128`
* **File:** `archive/components/README.md`, `src/archive/components/README.md`, `scripts/create-pwa-review-bundle.py`, `scripts/create-audit-bundle.py`, `scripts/create-claude-bundle.py`, `scripts/run-tests.py`, `public/assets/*.zip`
* **Docs Terkait:** `ARCHITECTURE.md`, `TESTING.md`, `CHECKLISTS.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `src/archive/` bersih dan `/archive/components/README.md` terdokumentasi lengkap untuk `v4.1.0 GA`.
  2. Seluruh generator bundel (`create-audit-bundle.py`, `create-pwa-review-bundle.py`, `create-claude-bundle.py`, `create-lmk-bundle.py`) menghasilkan arsip valid dengan 0 broken import dan SHA256SUMS cocok.
  3. `npm run sync:assets`, `npm run build`, `npx tsc --noEmit`, `npm run lint`, `python3 scripts/run-tests.py`, dan `python3 scripts/zlce-check.py . --strict --no-git` lulus 100% (0 error, 0 warning).
* **Test Case:** `TC-P20-FIN`
* **Metode Verifikasi:** Jalankan `npm run sync:assets && npm run build && python3 scripts/run-tests.py && python3 scripts/zlce-check.py . --strict --no-git`.

---

### ============================================================================
### FASE 21: KONSOLIDASI SINGLE SOURCE OF TRUTH, ELIMINASI DUPLIKASI & OPTIMASI UKURAN REPO/PWA
### ============================================================================

### TASK-130: Pembersihan Komponen Legacy Yatim & Rekonsiliasi Suite Uji 6-Tab
* **Fase:** FASE 21 (P1 - HIGH)
* **Deskripsi:** Menghapus 4 komponen legacy yatim pasca-konsolidasi 6 tab kanonik FASE 19 yang tidak lagi di-import di aplikasi (`src/components/PersistentSidebar.tsx`, `src/components/RuntimeEngineTab.tsx`, `src/components/PromptEngineTab.tsx`, `src/components/RecoveryTab.tsx`), memperbarui daftar komponen pada generator bundel (`scripts/create-audit-bundle.py`, `scripts/create-pwa-review-bundle.py`), menyelaraskan referensi komponen pada suite uji (`src/tests/offlineOperation.test.ts`, `src/tests/universalDraftCache.test.ts`) serta label referensi di `src/components/TestHarnessTab.tsx`, dan mendaftarkan `FASE 21` di `src/data/taskPhases.ts` & `src/tests/dashboardPhaseFilter.test.ts`.
* **Dependensi:** `TASK-129`
* **File:** `src/components/PersistentSidebar.tsx`, `src/components/RuntimeEngineTab.tsx`, `src/components/PromptEngineTab.tsx`, `src/components/RecoveryTab.tsx`, `src/components/TestHarnessTab.tsx`, `src/data/taskPhases.ts`, `src/tests/dashboardPhaseFilter.test.ts`, `src/tests/offlineOperation.test.ts`, `src/tests/universalDraftCache.test.ts`, `scripts/create-audit-bundle.py`, `scripts/create-pwa-review-bundle.py`
* **Docs Terkait:** `ARCHITECTURE.md`, `archive/components/README.md`, `TESTING.md`
* **Docs Impact:** `TASKS.md`, `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Ke-4 komponen legacy yatim bersih dari `src/components/`, dan tidak ada import/referensi rusak di `src/`, `scripts/create-audit-bundle.py`, maupun `scripts/create-pwa-review-bundle.py`.
  2. `src/data/taskPhases.ts` dan `src/tests/dashboardPhaseFilter.test.ts` sinkron mencakup `FASE 0` s/d `FASE 21` (`134 task`) tanpa celah rentang.
  3. `npx tsc --noEmit`, `npm run build`, `python3 scripts/run-tests.py`, dan `python3 scripts/zlce-check.py . --strict --no-git` lulus 100% (0 error).
* **Test Case:** `TC-P21-01`
* **Metode Verifikasi:** Jalankan `npx tsc --noEmit && npm run build && python3 scripts/run-tests.py && python3 scripts/zlce-check.py . --strict --no-git`.

---

### TASK-131: Dedup Aset `public/assets/`, Pembaruan Starter-Kit ZIP & Lockfile Tunggal
* **Fase:** FASE 21 (P1 - HIGH)
* **Deskripsi:** Menghapus duplikat identik `public/assets/aistudio/ZLCEv3.2.2-main_56612ab6.zip` dan lockfile ganda `bun.lock` (menstandardisasi `package-lock.json`), mempertahankan di `public/assets/aistudio/` hanya 3 berkas aktif yang direferensikan UI/skrip sambil mengarsipkan laporan historis lainnya ke `docs/archive/reports/`, serta memperbarui generator/bundel starter kit dari `zlce-starter-kit-v3.2.2.zip` ke paket bersih `v4.1.0 GA` pada `TemplatesTab.tsx` dan `LandingWizardTab.tsx`.
* **Dependensi:** `TASK-130`
* **File:** `public/assets/aistudio/*`, `docs/archive/reports/`, `bun.lock`, `src/components/TemplatesTab.tsx`, `src/components/LandingWizardTab.tsx`, `scripts/create-audit-bundle.py`, `scripts/create-pwa-review-bundle.py`
* **Docs Terkait:** `docs/README.md`, `docs/revisi/AUDIT_3.22.md`, `BLUEPRINT.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`, `docs/README.md`
* **Acceptance Criteria:**
  1. 0 duplikat ZIP biner identik dan `bun.lock` bersih (npm tunggal).
  2. `public/assets/aistudio/` hanya memuat berkas rujukan aktif sehingga beban copy ke `dist/assets/` menyusut signifikan, dan tautan unduh starter kit UI mengarah ke paket `v4.1.0 GA`.
  3. `FeedbackReviewTab` asset fetch, `pwaIconsIntegrity.test.ts`, `security-audit.sh`, dan `run-tests.py` lulus 100%.
* **Test Case:** `TC-P21-02`
* **Metode Verifikasi:** Jalankan `npm run build && python3 scripts/run-tests.py && bash scripts/security-audit.sh`.

---

### TASK-132: Single Source Sync Penuh & Eliminasi Duplikat Statis `ZLCE_KIT_SINGLE.md`
* **Fase:** FASE 21 (P1 - HIGH)
* **Deskripsi:** Memperluas `scripts/sync-assets.mjs` agar seluruh berkas bersama (`templates/`, `examples/`, `scripts/README.md`, `HANDOVER*`, `LANDING_PROMPT.md`, `.gitignore`, dan `scripts/zlce-*`) tersinkron satu arah dari satu sumber kanonik tanpa duplikasi suntingan manual, serta mengeliminasi duplikat statis `ZLCE_KIT_SINGLE.md` (menjadikannya output generator dari `templates/`).
* **Dependensi:** `TASK-131`
* **File:** `scripts/sync-assets.mjs`, `ZLCE_KIT_SINGLE.md`, `zlce-starter-kit/ZLCE_KIT_SINGLE.md`, `src/components/DocsReferenceTab.tsx`, `src/tests/documentationParity.test.ts`, `scripts/run-tests.py`
* **Docs Terkait:** `AI_WORKFLOW.md`, `scripts/README.md`, `zlce-starter-kit/README.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. `npm run sync:assets` menyinkronkan seluruh berkas bersama dari sumber kanonik tunggal dengan verifikasi integritas di `run-tests.py` Step 4.
  2. Tidak ada salinan statis ganda `ZLCE_KIT_SINGLE.md` yang memicu drift; generasi paket satu-berkas bersumber langsung dari `templates/`.
  3. `python3 scripts/zlce-check.py zlce-starter-kit --strict --no-git` dan `run-tests.py` lulus 100%.
* **Test Case:** `TC-P21-03`
* **Metode Verifikasi:** Jalankan `npm run sync:assets && python3 scripts/zlce-check.py zlce-starter-kit --strict --no-git && python3 scripts/run-tests.py`.

---

### TASK-133: Pemisahan Bundel ZIP Generator dari `public/assets/` untuk Optimasi `dist/` PWA
* **Fase:** FASE 21 (P0 - CRITICAL)
* **Deskripsi:** Memindahkan direktori output 4 generator bundel ZIP (~2.35 MB: `zlce-audit-review-bundle.zip`, `zlce-pwa-frontend-review-bundle.zip`, `zlce-claude-chatgpt-bundle.zip`, `zlce-lmk-recovery-bundle.zip`) dari `public/assets/` ke folder terpisah `release-bundles/` (tidak ikut disalin Vite ke `dist/assets/` maupun membebani Service Worker PWA tablet), serta memperbarui path pada `scripts/create-*-bundle.py`, `src/tests/pwaReviewPrompt.test.ts`, `src/tests/physicalTelemetryAndQuality.test.ts`, `scripts/run-tests.py`, dan `.gitignore`.
* **Dependensi:** `TASK-132`
* **File:** `scripts/create-audit-bundle.py`, `scripts/create-pwa-review-bundle.py`, `scripts/create-claude-bundle.py`, `scripts/create-lmk-bundle.py`, `src/tests/pwaReviewPrompt.test.ts`, `src/tests/physicalTelemetryAndQuality.test.ts`, `scripts/run-tests.py`, `package.json`, `.gitignore`
* **Docs Terkait:** `TESTING.md`, `docs/mobile/blueprint/03_PWA_ARCHITECTURE.md`, `README.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`, `README.md`
* **Acceptance Criteria:**
  1. `public/assets/` bebas dari 4 bundel ZIP audit/review sehingga ukuran `dist/` produksi turun >2 MB.
  2. Ke-4 generator bundel menghasilkan arsip valid di `release-bundles/` dengan `0 broken import` dan `SHA256SUMS.txt` terverifikasi.
  3. Seluruh pengujian (`pwaReviewPrompt.test.ts`, `pwaIconsIntegrity.test.ts`, `run-tests.py`, `vite build`) lulus 100%.
* **Test Case:** `TC-P21-04`
* **Metode Verifikasi:** Jalankan `npm run build` (periksa ukuran `dist/`), lalu `python3 scripts/run-tests.py`.

---

### TASK-134: Refaktor `TutorialTab.tsx` ke Sumber Markdown Tunggal & Finalisasi FASE 21
* **Fase:** FASE 21 (P1 - HIGH)
* **Deskripsi:** Menyederhanakan `src/components/TutorialTab.tsx` (177 KB) dengan menghapus blok duplikat panduan panjang inline dan merujuk langsung pada berkas kanonik `docs/mobile/*.md` & `docs/USAGE.md` melalui `src/data/templates.ts` (`?raw`), serta menyelesaikan verifikasi penuh paritas dokumentasi, ukuran chunk `dist/`, keamanan, dan validator ZLCE.
* **Dependensi:** `TASK-133`
* **File:** `src/components/TutorialTab.tsx`, `src/data/templates.ts`, `src/tests/documentationParity.test.ts`, `src/tests/uiPolishing.test.ts`
* **Docs Terkait:** `docs/mobile/INSTALLATION_ANDROID.md`, `docs/mobile/USAGE_MOBILE.md`, `docs/USAGE.md`, `ARCHITECTURE.md`
* **Docs Impact:** `SESSION_STATE.md`, `CHANGELOG.md`
* **Acceptance Criteria:**
  1. Teks panduan berulang di `TutorialTab.tsx` dirujuk langsung ke sumber Markdown tunggal melalui `templates.ts` sehingga ukuran `TutorialTab.tsx` & chunk JS turun signifikan.
  2. Seluruh pemeriksaan `documentationParity.test.ts`, `uiPolishing.test.ts`, `run-tests.py`, `security-audit.sh`, `vite build`, `tsc --noEmit`, dan `zlce-check.py --strict --no-git` lulus 100% (0 error, 0 warning).
* **Test Case:** `TC-P21-FIN`
* **Metode Verifikasi:** Jalankan `npm run build && npx tsc --noEmit && python3 scripts/run-tests.py && bash scripts/security-audit.sh && python3 scripts/zlce-check.py . --strict --no-git`.

---

## 3. ATURAN EKSEKUSI TASK (P2-CP6 PREPARATION)

1. **Aturan 1 Task IN_PROGRESS:** Tidak boleh ada lebih dari 1 task berstatus `IN_PROGRESS` pada waktu yang sama di tablet bersama.
2. **Definisi Selesai (Definition of Done):** Suatu task hanya boleh diubah statusnya menjadi `DONE` apabila:
   - Seluruh Acceptance Criteria terpenuhi.
   - Perubahan telah diuji secara nyata dengan bukti terlampir pada kolom `Bukti Verifikasi`.
   - Lulus linter dan validator ZLCE dengan 0 error.
   - Disetujui oleh anggota aktif yang dicatat namanya pada kolom `Disetujui`.
3. **Pencatatan WAL Mandatori:** Sebelum menyentuh berkas kode multi-file, rincian langkah wajib ditulis di Bagian 3 (WAL) `SESSION_STATE.md`.
4. **Zero Unapproved Tasks:** Tidak ada pekerjaan di luar nomor task yang terdaftar dalam backlog ini.
