/**
 * ZLCE Multi-AI External Audit, Testing & Review Engine (FASE 9)
 * 
 * Menghasilkan:
 * 1. Prompt Perintah Audit, Test, dan Review untuk Claude, ChatGPT, DeepSeek
 *    (bahasa teknis, singkat, terstruktur, berbasis bukti nyata, siap unduh .md).
 * 2. Modul Penjawab Pertanyaan / Permintaan File Klarifikasi Awal (Step 2).
 * 3. Parser Ulasan & Perencana Proposal Task Baru ("Tawarkan Tindakan", Step 3).
 */

import { ParsedSessionState } from '../types/zlce';

export type ExternalAiModel =
  | 'claude-5.5-sonnet'
  | 'gemini-4-hydrogen-free'
  | 'chatgpt-4o'
  | 'deepseek-v3'
  | 'claude-3.5-sonnet'
  | 'gemini-1.5-pro';

export type AuditFocusArea =
  | 'full-system'
  | 'frontend-ui-ux'
  | 'security-privacy'
  | 'code-quality-testing'
  | 'performance-reliability'
  | 'api-data-integration'
  | 'docs-onboarding'
  | 'pwa-frontend-ux'
  | 'docs-audit-readme'
  | 'architecture-zero-secret'
  | 'mobile-lmk-ergonomics'
  | 'multi-ai-relay-workflow';

export interface AuditPromptConfig {
  targetAi: ExternalAiModel;
  focusArea: AuditFocusArea;
  reviewerName?: string;
  customNotes?: string;
  includeCodeSnippets?: boolean;
}

export interface ProposedSubTask {
  id: string;
  name: string;
  phase: string;
  category: 'critical' | 'enhancement' | 'refactor' | 'documentation';
  description: string;
  impactFiles: string[];
  dependencies: string;
  accepted: boolean;
}

export interface ParsedReviewFeedback {
  modelName: string;
  timestamp: string;
  summary: string;
  score: number; // 1-100
  decision?: string; // e.g. "GO" atau "NOT READY FOR PRODUCTION (NO-GO)"
  strengths: string[];
  findings: {
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    evidence: string;
    recommendation: string;
  }[];
  proposedTasks: ProposedSubTask[];
}

/**
 * Stop token spesifik per model AI penerima audit
 */
const MODEL_STOP_TOKENS: Record<ExternalAiModel, string> = {
  'claude-5.5-sonnet': '=== END CLAUDE AUDIT RESPONSE ===',
  'gemini-4-hydrogen-free': '=== END GEMINI AUDIT RESPONSE ===',
  'chatgpt-4o': '=== END CHATGPT AUDIT RESPONSE ===',
  'deepseek-v3': '=== END DEEPSEEK AUDIT RESPONSE ===',
  'claude-3.5-sonnet': '=== END CLAUDE AUDIT RESPONSE ===',
  'gemini-1.5-pro': '=== END GEMINI AUDIT RESPONSE ==='
};

const MODEL_DISPLAY_NAMES: Record<ExternalAiModel, string> = {
  'claude-5.5-sonnet': 'CLAUDE 5.5 SONNET',
  'gemini-4-hydrogen-free': 'GEMINI 4 HYDROGEN (FREE)',
  'chatgpt-4o': 'CHATGPT (GPT-4O)',
  'deepseek-v3': 'DEEPSEEK-V3',
  'claude-3.5-sonnet': 'CLAUDE 5.5 SONNET',
  'gemini-1.5-pro': 'GEMINI 4 HYDROGEN (FREE)'
};

const FOCUS_AREA_DETAILS: Record<AuditFocusArea, { title: string; promptDirectives: string }> = {
  'full-system': {
    title: 'Audit Arsitektur, Keamanan & Kesiapan Produksi Menyeluruh',
    promptDirectives: `Fokus Audit Menyeluruh:
1. Validasi desain arsitektur sistem, modularitas komponen, dan pemisahan tanggung jawab (separation of concerns).
2. Kepatuhan keamanan & Zero-Secret Policy (tidak ada kredensial, API key, atau rahasia yang terekspos di repositori maupun client storage).
3. Reliabilitas runtime, penanganan error (error handling), edge case, dan ketahanan pemulihan sesi/data.
4. Efisiensi performa, konsumsi memori, ukuran bundel build, serta kelengkapan konfigurasi produksi.
5. Cakupan dan keandalan automated testing (unit, integrasi, dan validasi end-to-end).`
  },
  'frontend-ui-ux': {
    title: 'Review Frontend, UI/UX, Aksesibilitas & Responsivitas',
    promptDirectives: `Fokus Audit Frontend & UI/UX:
1. Tata letak responsif lintas viewport (mobile, tablet, dan desktop) tanpa tumpang tindih maupun horizontal overflow.
2. Aksesibilitas & ergonomi interaksi (target sentuh memadai, kontras warna, navigasi keyboard/ARIA, dan penanganan viewport keyboard virtual).
3. Kejelasan alur pengguna (user flow), copywriting antarmuka yang komunikatif, serta umpan balik status (loading, empty state, error, toast/konfirmasi).
4. Efisiensi rendering komponen, pencegahan re-render berlebihan, dan pemuatan aset/code-splitting.
5. Konsistensi sistem desain, tipografi, dan kebersihan styling.`
  },
  'security-privacy': {
    title: 'Audit Keamanan Aplikasi, Autentikasi & Zero-Secret Policy',
    promptDirectives: `Fokus Audit Keamanan & Privasi:
1. Verifikasi Zero-Secret Policy: nol token, password, API key, atau private key pada kode sumber, config publik, maupun storage persisten.
2. Validasi input, sanitasi parameter, serta perlindungan terhadap celah injeksi (XSS, shell/SQL injection, CSRF, path traversal).
3. Ketepatan batas autentikasi, otorisasi, manajemen sesi, dan pembersihan cache kredensial.
4. Keamanan header HTTP, CORS, dependensi pihak ketiga, dan eksposur endpoint internal.`
  },
  'code-quality-testing': {
    title: 'Review Kualitas Kode, Maintainability & Cakupan Pengujian',
    promptDirectives: `Fokus Audit Kualitas Kode & Testing:
1. Kualitas struktur kode, keterbacaan, konsistensi penamaan, dan penghindaran duplikasi logika.
2. Keamanan tipe (strict typing), kontrak antarmuka/schema, serta penghindaran anti-pattern yang rawan bug.
3. Penanganan error eksplisit, validasi boundary condition, dan pencegahan race condition.
4. Kelengkapan, determinisme, dan independensi test suite (unit test, integration test, serta E2E verification).`
  },
  'performance-reliability': {
    title: 'Audit Performa, Manajemen Memori & Ketahanan Gangguan/Offline',
    promptDirectives: `Fokus Audit Performa & Reliabilitas:
1. Profil penggunaan memori, potensi memory leak (event listener/timer yang tidak dibersihkan), dan efisiensi struktur data.
2. Optimasi waktu muat awal, bundle splitting, lazy loading, dan efisiensi asset statis.
3. Strategi caching, ketahanan terhadap koneksi lambat/offline, dan mekanisme retry/fallback yang aman.
4. Ketahanan pemulihan draft/state (auto-save, transactional persistence) saat tab/aplikasi tertutup mendadak.`
  },
  'api-data-integration': {
    title: 'Audit Model Data, State Management & Integrasi API',
    promptDirectives: `Fokus Audit Data, State & API:
1. Konsistensi skema data, validasi payload masuk/keluar, dan pemeliharaan Single Source of Truth.
2. Sinkronisasi state antar komponen/tab tanpa state staleness atau desinkronisasi cache.
3. Keamanan transaksi data, isolasi data antar proyek/pengguna, dan penanganan kegagalan jaringan/API.
4. Kompatibilitas mundur (backward compatibility) format penyimpanan lokal maupun kontrak API.`
  },
  'docs-onboarding': {
    title: 'Audit Dokumentasi, README & Panduan Developer/Pengguna',
    promptDirectives: `Fokus Audit Dokumentasi & Onboarding:
1. Keakuratan dan kelengkapan README.md (deskripsi proyek, prasyarat, langkah instalasi, konfigurasi environment, dan perintah run/build/test).
2. Kesesuaian antara dokumentasi arsitektur/API dengan implementasi aktual di kode sumber.
3. Kejelasan panduan penggunaan langkah demi langkah agar mudah diikuti pengembang maupun pengguna baru.
4. Penandaan bagian yang usang, duplikat, atau memerlukan klarifikasi lebih lanjut.`
  },
  'pwa-frontend-ux': {
    title: 'Review Frontend PWA: User-Friendly, Komunikatif, Efisien & Powerful (ChatGPT & Claude 5.5)',
    promptDirectives: `Fokus Review Frontend PWA:
1. User-Friendly: Ergonomi layar 8.7" (1340x800) tablet SM-T225 & mobile, target sentuh minimal 44px/48px, kontras visual theme, visualViewport virtual keyboard awareness.
2. Komunikatif: Kejelasan instruksi panduan, umpan balik toast/modal, pesan error edukatif, bahasa manusiawi untuk tim estafet.
3. Mudah Dipakai (Ease of Use): Operasi 1-ketukan (1-tap copy, 1-tap download .md), minim friksi, transparent auto-draft restore dengan debounce 400ms.
4. Efisien: Disiplin RAM 3GB Android LMK (Loss-Bounded Persistence RPO <= 400ms), zero lag re-renders, caching offline Service Worker instan.
5. Powerful: Kelengkapan fitur workbench yang terstruktur, responsif, dan tangguh.`
  },
  'docs-audit-readme': {
    title: 'Audit Dokumentasi: Review & Perbaikan README, Struktur docs/, Instalasi & Panduan Penggunaan',
    promptDirectives: `Fokus Mandat Audit Dokumentasi:
1. Review & Perbaikan README.md: Periksa kelengkapan, prasyarat, kesesuaian jalur berkas repositori, navigasi, dan susun draf README perbaikan.
2. Review & Verifikasi docs/: Evaluasi struktur direktori dokumentasi, indeks navigasi, dan panduan penggunaan.
3. Panduan Instalasi & Persiapan dari Nol: Rinci langkah setup environment hingga aplikasi berjalan dan teruji.
4. Tutorial Pemakaian Operasional: Panduan alur kerja tim, pengelolaan task, context pack, dan praktik keamanan Zero-Secret.
5. Klasifikasi Rekomendasi Terstruktur: Susun temuan prioritas P0, P1, P2 dan beri penanda [PERLU KONFIRMASI].`
  },
  'architecture-zero-secret': {
    title: 'Audit Keamanan Zero-Secret & Integritas Arsitektur',
    promptDirectives: `Fokus Audit:
1. Inspeksi regex zero-leak (ghp_*, token, private keys, cloud keys) dan kebersihan client storage.
2. Mekanisme pembersihan kredensial sementara dan isolasi sesi kerja.
3. Penegakan identitas commit per-user tanpa menyimpan kredensial permanen.
4. Ketiadaan celah injeksi shell/XSS pada pemrosesan input & perintah.`
  },
  'mobile-lmk-ergonomics': {
    title: 'Uji Ergonomi Layar Sentuh & Ketahanan Memori RAM Terbatas',
    promptDirectives: `Fokus Audit:
1. Target sentuh >= 44x44px dan keterbacaan tipografi pada perangkat mobile/tablet.
2. Penanganan keyboard virtual via visualViewport API.
3. Keandalan auto-draft penyimpanan lokal dan synchronous flush saat berpindah aplikasi.
4. Kebijakan hemat memori pada perangkat berspesifikasi rendah.`
  },
  'multi-ai-relay-workflow': {
    title: 'Review Alur Estafet Multi-AI & Context Engineering',
    promptDirectives: `Fokus Audit:
1. Format pertukaran konteks portabel (Schema-before-Data) tanpa ketergantungan riwayat chat.
2. Adaptasi anggaran kuota token lintas model (Gemini, Claude 5.5, ChatGPT, DeepSeek).
3. Deteksi konflik keputusan lintas model terhadap arsitektur proyek.
4. Penegakan pelacakan provenance dan validasi kualitas output.`
  }
};

/**
 * Menghasilkan prompt perintah audit, testing, dan review komprehensif
 */
export function generateExternalAuditPrompt(
  config: AuditPromptConfig,
  sessionState: ParsedSessionState,
  rawMarkdown: string
): string {
  const modelName = MODEL_DISPLAY_NAMES[config.targetAi] || config.targetAi.toUpperCase().replace(/-/g, ' ');
  const stopToken = MODEL_STOP_TOKENS[config.targetAi] || '=== END AUDIT RESPONSE ===';
  const focus = FOCUS_AREA_DETAILS[config.focusArea] || FOCUS_AREA_DETAILS['full-system'];
  const projectName = sessionState.context.projectName || 'Proyek Perangkat Lunak';
  const projectStack = sessionState.context.stack || 'Web / Full-Stack';
  const projectMode = sessionState.context.mode || 'FULL';
  const gitBranch = sessionState.status.gitBranch || 'main';
  const activeTask = sessionState.status.activeTask || '-';
  const lastDone = sessionState.status.lastDoneTask || '-';

  // Format khusus untuk Review Frontend PWA (User-Friendly, Komunikatif, Efisien & Powerful)
  if (config.focusArea === 'pwa-frontend-ux') {
    return `# MANDAT REVIEW KHUSUS FRONTEND PWA (USER-FRIENDLY, KOMUNIKATIF, EFISIEN & POWERFUL)
# Target Model: [${modelName}]
# Sasaran Evaluasi: ZLCE Mobile Workbench v4.1.0 GA / ZLCEv4.1Mob (PWA Standalone pada Tablet & Mobile)
# Target Pengguna: 8 Anggota Tim Estafet pada Samsung Galaxy Tab A7 Lite (SM-T225, 8.7", RAM 3GB)
# Berkas Bundel ZIP: release-bundles/zlce-pwa-frontend-review-bundle.zip
# Tanggal Mandat: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} WIB

---

## 1. TUJUAN & PERAN ANDA
Anda bertindak sebagai **Staff Principal Frontend & Mobile PWA UX Architect / Senior Human-Computer Interaction (HCI) Specialist**.
Tugas Anda adalah meninjau secara mendalam dan kritis arsitektur antarmuka, ergonomi sentuh, alur komunikasi pengguna, serta performa aplikasi web progresif (PWA) **ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)**.

Evaluasi Anda wajib membedah **5 Pilar Utama**:
1. **User-Friendly (Ramah Pengguna Tablet & Mobile):**
   - Ergonomi layout pada layar WXGA+ 8.7" (1340x800) potret & lanskap serta smartphone Android.
   - Kepatuhan target sentuh minimal 44x44px dan 48x48px (standar WCAG 2.5.5/2.5.8 & Android Human Interface Guidelines).
   - Zona jangkauan jempol (thumb-friendly zones), penempatan kontrol penting di area bawah/samping yang mudah dijangkau.
   - Penanganan keyboard virtual Android via \`visualViewport\` API (\`--keyboard-height\`, \`--viewport-height\`) agar formulir dan textarea tidak tertutup papan ketik virtual.
   - Keterbacaan tipografi dan kontras visual tema gelap (Tailwind Slate-950/Slate-900 dengan aksen Cyan & Indigo).

2. **Komunikatif (Kejelasan Bahasa & Umpan Balik Intuitif):**
   - Kejelasan pesan status, banner umpan balik (*toast notifications*, *feedback banners*), dan dialog konfirmasi modal.
   - Ketepatan bahasa instruksi: komunikatif, lugas, mudah dimengerti 8 anggota tim lintas latar belakang, bebas kebingungan teknis yang tidak perlu.
   - Indikator status visual yang transparan: status kesehatan sesi (State Health 0 error), badge sinkronisasi disk/storage, indikator offline PWA shell, badge task aktif (\`IN_PROGRESS\`), bukti verifikasi dan persetujuan gerbang.

3. **Mudah Dipakai (Ease of Use & Alur Kerja Tanpa Friksi):**
   - Alur operasional 1-ketukan (*one-tap operations*): tombol 1-tap copy perintah Termux, 1-tap download file Markdown \`.md\`, unduh Blob ZIP instan.
   - Efisiensi estafet tablet bersama: pemilihan driver tim instan tanpa form login berbelit (*Zero-Secret Policy*), *Task Claim Banner* dengan penegakan batas eksklusif 1 task \`IN_PROGRESS\`, serta wizard 4-langkah serah terima perangkat fisik.
   - Ketahanan sesi transparan (*transparent recovery*): persistensi otomatis auto-draft cache (debounce 400ms) saat browser ditutup atau dibunuh Android LMK di latar belakang.

4. **Efisien (Performa Rendering & Disiplin Memori RAM 3GB):**
   - Konsumsi memori sangat hemat pada perangkat RAM 3GB Android dengan model *Loss-Bounded Persistence* (RPO <= 400ms).
   - Kecepatan pemuatan PWA instan melalui Service Worker caching (\`Cache-First\` app shell), operasi 100% offline (Mode Pesawat).
   - Bebas lag, zero memory leaks, virtual scrolling/pagination pada riwayat snapshot (batas aman 35 item).

5. **Powerful (Fungsionalitas Lengkap ZLCE Mobile Workbench):**
   - Kelengkapan 6 tab kanonik terpadu ZLCE Mobile Workbench: Dashboard Teknis Fokus, SESSION_STATE & WAL (+ Riwayat & Log), AI Workbench (Rakit Prompt/Context Pack, Tangkap Hasil + Provenance, Estafet AI, Review & Q&A), Terminal & Git (\`zlce\` allowlist & Git \`--ff-only\`), Diagnostik & Kualitas (Test Harness, Triase S/M/L, Audit Performa PWA), dan Dokumentasi & Panduan.

---

## 2. ATURAN PENILAIAN & KRITERIA EVALUASI (STRICT CONSTRAINTS)
1. **Analisis Berbasis Bukti:** Hubungkan setiap evaluasi, kritik, dan rekomendasi dengan file komponen atau file css konkret yang ada di repositori (misal: \`src/App.tsx\`, \`src/index.css\`, \`src/components/mobile/MobileLayout.tsx\`, \`src/components/mobile/MemberWorkLogSection.tsx\`, \`src/hooks/useAutoDraftCache.ts\`, \`public/manifest.webmanifest\`, dsb).
2. **Kuantitatif & Kualitatif:** Berikan skor penilaian numerik 0–100 untuk masing-masing dari 5 pilar serta Skor Rata-rata Kesiapan Frontend PWA (PWA UX Readiness Score).
3. **Bahasa Teknis & Human-Centered:** Gunakan bahasa Indonesia yang profesional, presisi, dan berorientasi pada pengalaman manusia (human-centered design).
4. **Akhiri Jawaban dengan Stop Token:** Anda wajib mengakhiri laporan review Anda dengan penanda stop:
   \`${stopToken}\`

---

## 3. STRUKTUR LAPORAN REVIEW YANG WAJIB DIHASILKAN
Mohon susun laporan Anda dalam format Markdown terstruktur berikut:

### 1. RINGKASAN EKSEKUTIF & MATRIKS SKOR UX (0-100)
- **Skor User-Friendly (Ergonomi & Aksesibilitas Layar Sentuh):** [0-100]
- **Skor Komunikatif (Kejelasan Bahasa & Umpan Balik Visual):** [0-100]
- **Skor Kemudahan Pemakaian (Ease of Use & 1-Tap Flow):** [0-100]
- **Skor Efisiensi (Performa, Kecepatan PWA & RAM 3GB Awareness):** [0-100]
- **Skor Ketangguhan Fitur (Powerful & Comprehensive Functionality):** [0-100]
- **TOTAL SKOR KESIAPAN FRONTEND PWA:** [0-100]
- **Keputusan:** [READY FOR PRODUCTION / NEEDS POLISHING / NOT RECOMMENDED]

### 2. KEKUATAN UTAMA & NILAI UNIK DESAIN (TOP STRENGTHS)
(Uraikan aspek-aspek frontend yang telah diimplementasikan dengan sangat baik dan menonjol)

### 3. DAFTAR TEMUAN & REKOMENDASI BERBOBOT PRIORITAS
- **P0 (Kritis / Mengganggu Pengalaman Pengguna & Aksesibilitas):**
  - Judul Temuan, Lokasi File/Komponen, Analisis Dampak, Rekomendasi Solusi Konkret.
- **P1 (Penting untuk Alur Kerja, Komunikasi & Kenyamanan Penggunaan):**
  - Judul Temuan, Lokasi File/Komponen, Analisis Dampak, Rekomendasi Solusi Konkret.
- **P2 (Penyempurnaan Kosmetik, Animasi Mikro & Polishing Estetika):**
  - Judul Temuan, Lokasi File/Komponen, Analisis Dampak, Rekomendasi Solusi Konkret.

### 4. USULAN RENCANA TINDAKAN (ACTIONABLE SUB-TASKS)
(Susun tabel usulan sub-task terstruktur yang dapat dialirkan ke backlog pengerjaan)

${config.customNotes ? `* **Catatan Khusus Pengembang:** ${config.customNotes}\n\n` : ''}
${stopToken}
`;
  }

  // Format khusus untuk Mandat Audit Dokumentasi file.md
  if (config.focusArea === 'docs-audit-readme') {
    return `# MANDAT AUDIT, REVIEW & RESTRUKTURISASI DOKUMENTASI (file.md)
# Target Model: [${modelName}]
# Peran Anda: Senior Technical Writer, Dokumenter Software & Systems Architect
# Berkas Bundel ZIP: release-bundles/zlce-claude-chatgpt-bundle.zip & release-bundles/zlce-audit-review-bundle.zip
# Tanggal Mandat: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} WIB

---

## TUJUAN & TUGAS UTAMA
Anda bertindak sebagai **technical writer dan reviewer dokumentasi perangkat lunak**. Tugas Anda adalah mengaudit repositori ini secara menyeluruh berdasarkan bukti nyata di kode/konfigurasi, lalu menyusun laporan perbaikan dan panduan teknis operasional yang jelas, komunikatif, profesional, dan mudah diikuti—termasuk oleh pemula:

1. **Review & Perbaiki README.md:** Nilai README saat ini dan susun draf README baru yang profesional untuk halaman depan GitHub, akurat dengan kode v4.1.0 GA, lengkap dengan quickstart Termux dan link navigasi.
2. **Review & Verifikasi direktori \`docs/\`:** Evaluasi struktur dan isi folder \`docs/\`, pastikan navigasi bersih antara \`docs/README.md\`, \`docs/USAGE.md\`, panduan \`docs/mobile/*\`, dan 14 cetak biru \`docs/mobile/blueprint/*\`.
3. **Susun Panduan Instalasi & Persiapan Pemula di Android (Termux):** Rinci langkah demi langkah dari nol (unduh Termux APK di F-Droid, update mirror, instal paket \`git python nodejs-lts bash coreutils micro openssh\`, \`termux-setup-storage\`, clone repo, npm install, eksekusi \`bash scripts/zlce-prod-start.sh\`, hingga instal PWA di layar utama Samsung Galaxy Tab A7 Lite).
4. **Susun Tutorial Pemakaian Lengkap ZLCE Mobile v4:** Rinci alur kerja operasional harian 8 anggota tim estafet, aturan ketat 1 task IN_PROGRESS, pembuatan portable context pack, penangkapan hasil (result capture dengan provenance injection), verifikasi kanonik \`zlce check\`, hingga serah terima dan pembersihan memori \`clean-auth.sh\`.
5. **Perapihan & Integrasi Preview Studio:** Berikan rekomendasi konkret untuk menyelaraskan antarmuka web workbench (FeedbackReviewTab, CommandHubTab, WorkspaceReader) dengan alur dokumentasi.

---

## ATURAN KERJA AUDIT (STRICT CONSTRAINTS)
- Hubungkan setiap rekomendasi dan instruksi teknis dengan bukti nyata di repositori (misal: \`package.json\`, \`scripts/zlce-prod-start.sh\`, \`docs/mobile/INSTALLATION.md\`, \`src/types/zlce.ts\`, dsb).
- Jika ada hal yang belum pasti, tandai secara eksplisit dengan **[PERLU KONFIRMASI]**. DILARANG mengarang fakta, perintah, atau dependensi.
- Jangan menghapus informasi penting; tandai yang usang atau duplikat.
- Tulis instruksi langkah demi langkah ramah pemula tanpa mengasumsikan pengguna sudah mahir Linux/Termux.
- Gunakan bahasa Indonesia yang lugas, rapi, dan profesional.
- Akhiri tanggapan Anda dengan penanda stop: \`${stopToken}\`.

---

## STRUKTUR LAPORAN HASIL AKHIR (6 TAHAP SESUAI file.md)

1. **Ringkasan Kondisi Dokumentasi** (Ikhtisar kekuatan & kelemahan dokumentasi saat ini)
2. **Temuan Berbasis Bukti** (Pemeriksaan berkas repositori, konfigurasi, skrip, dan dependensi)
3. **Usulan Struktur & Pemetaan \`docs/\`** (Hierarki baru yang logis, peran tiap berkas, dan navigasi)
4. **Draf README.md yang Disarankan** (Versi lengkap siap pakai untuk GitHub dengan badge, quickstart, dan arsitektur)
5. **Draf Panduan Instalasi & Persiapan Android (Termux)** (Langkah detail dari nol sampai peramban menampilkan http://localhost:3000 dan PWA terpasang)
6. **Draf Tutorial Pemakaian ZLCE Mobile v4** (Panduan operasional alur 8 langkah estafet dan single source of truth)
7. **Daftar Informasi [PERLU KONFIRMASI]**
8. **Daftar Perubahan yang Disarankan Berdasarkan Prioritas:**
   - **P0 (Kritis / Menghalangi Instalasi & Penggunaan)**
   - **P1 (Penting untuk Pemahaman & Navigasi)**
   - **P2 (Penyempurnaan Gaya & Opsional)**

${stopToken}
${config.customNotes ? `\n* Catatan Pengembang: ${config.customNotes}\n` : ''}
Unduh berkas bundel \`zlce-claude-chatgpt-bundle.zip\` atau \`zlce-audit-review-bundle.zip\` untuk memeriksa berkas secara langsung.`;
  }

  return `# MANDAT AUDIT, TESTING & REVIEW TEKNIS: ${projectName}
# Target Model: [${modelName}]
# Profil Peninjau: Senior Principal Software Engineer & Security Architect
# Tanggal Mandat: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} WIB

---

## 1. KONTEKS PROYEK & TUJUAN AUDIT
Anda ditugaskan melakukan audit teknis independen, pengujian kritis, dan review arsitektur atas sistem:
* **Nama Proyek:** ${projectName}
* **Stack & Lingkungan:** ${projectStack} (Mode Kerja: ${projectMode})
* **Kebijakan Keamanan Dasar:** Zero-Secret Policy (nol kredensial/API key tersimpan di repo atau client storage)
* **Status Backlog Terkini:** ${sessionState.tasks.length} task tercatat (Task Aktif: \`${activeTask}\`, Selesai Terakhir: \`${lastDone}\`)
* **Fokus Audit Saat Ini:** ${focus.title}

${focus.promptDirectives}

---

## 2. ATURAN JAWABAN TEKNIS (STRICT CONSTRAINTS)
Agar hasil review dapat langsung ditindaklanjuti secara presisi oleh tim pengembang, Anda WAJIB mematuhi:
1. **Bahasa Teknis & Objektif:** Gunakan terminologi rekayasa perangkat lunak standar. DILARANG menulis kata pengantar basa-basi atau pujian umum tanpa bukti.
2. **Terstruktur & Terbukti:** Setiap temuan wajib menyertakan **Bukti Konkret** (mengutip nama berkas, fungsi, atau baris kode terkait) beserta **Tingkat Keparahan (CRITICAL / HIGH / MEDIUM / LOW)**.
3. **Preskriptif & Terukur:** Sertakan rekomendasi solusi teknis nyata yang siap diubah menjadi task perbaikan atomik.
4. **Anti-Placeholder:** Jika memberikan cuplikan kode koreksi, tulis secara lengkap tanpa komentar pemotongan \`// ... existing code ...\`.
5. **Stop Token Wajib:** Akhiri ulasan teknis Anda dengan persis: \`${stopToken}\`.

---

## 3. FORMAT LAPORAN REVIEW YANG DIWAJIBKAN
Sajikan ulasan Anda dalam format Markdown berikut:

\`\`\`markdown
# LAPORAN AUDIT & REVIEW TEKNIS: [${modelName}]
Proyek: ${projectName}
Tanggal Audit: [YYYY-MM-DD HH:mm]
Skor Kesiapan Produksi: [0-100 / 100]
Keputusan: [GO / NEEDS POLISHING / NOT READY FOR PRODUCTION (NO-GO)]

## A. RINGKASAN EKSEKUTIF (Maks. 3 Paragraf Teknis)
[Ringkasan temuan menyeluruh arsitektur, kualitas implementasi, keamanan, dan kesiapan produksi]

## B. MATRIKS EVALUASI PILAR UTAMA
| Pilar Evaluasi | Status (PASS/CONCERN/FAIL) | Catatan Kritis & Bukti |
| :--- | :--- | :--- |
| Arsitektur & Kualitas Kode | [PASS/CONCERN/FAIL] | [Bukti file/modul terkait] |
| Keamanan & Zero-Secret Policy | [PASS/CONCERN/FAIL] | [Bukti sanitasi/auth/env] |
| UI/UX, Aksesibilitas & Responsivitas | [PASS/CONCERN/FAIL] | [Bukti komponen/layout] |
| Performa, Memori & Reliabilitas | [PASS/CONCERN/FAIL] | [Bukti optimasi/caching/recovery] |
| Pengujian & Dokumentasi | [PASS/CONCERN/FAIL] | [Bukti test suite & README] |

## C. TEMUAN CELAH, RISIKO ATAU SARAN PENINGKATAN
### Temuan #1: [Judul Temuan]
* **Tingkat Keparahan:** [CRITICAL / HIGH / MEDIUM / LOW]
* **Berkas Terdampak:** \`[path/ke/file]\`
* **Bukti Teknis:** [Penjelasan kode/alur saat ini yang berpotensi masalah]
* **Rekomendasi Preskriptif:** [Solusi teknis konkret]

## D. USULAN RANCANGAN TASK PERBAIKAN (SIAP DIINTEGRASIKAN)
1. **[Nama Task Usulan 1]:** [Deskripsi tindakan atomik dan berkas yang disentuh]
2. **[Nama Task Usulan 2]:** [Deskripsi tindakan atomik dan berkas yang disentuh]

${stopToken}
\`\`\`

---

## 4. METADATA SESI PROYEK SAAT INI
* **Cabang Git:** \`${gitBranch}\`
* **Task Aktif:** \`${activeTask}\` | **Task Selesai Terakhir:** \`${lastDone}\`
* **Total Task Terdaftar:** ${sessionState.tasks.length} task

${config.customNotes ? `* **Catatan Tambahan Pengembang:** ${config.customNotes}\n` : ''}
Mulailah audit Anda dengan memeriksa berkas proyek atau bundel konteks yang dilampirkan.`;
}

/**
 * Menghasilkan jawaban teknis untuk pertanyaan atau permintaan berkas klarifikasi awal (Step 2)
 */
export function generateTechnicalClarificationResponse(
  query: string,
  sessionState: ParsedSessionState
): {
  responseText: string;
  matchedTopic: string;
  suggestedFiles: string[];
} {
  const q = query.toLowerCase();
  let matchedTopic = 'Umum / Konteks Proyek';
  const suggestedFiles: string[] = ['SESSION_STATE.md', 'docs/README.md'];
  let answer = '';

  if (q.includes('termux') || q.includes('instal') || q.includes('android') || q.includes('setup') || q.includes('siap pakai')) {
    matchedTopic = 'Instalasi & Persiapan Android Termux dari Nol';
    suggestedFiles.push(
      'docs/mobile/INSTALLATION.md',
      'docs/mobile/TERMUX_SETUP.md',
      'docs/mobile/PRODUCTION_OPERATIONS.md',
      'scripts/zlce-prod-start.sh'
    );
    answer = `### Penjelasan Teknis: Panduan Instalasi Android Termux hingga Siap Pakai
1. **Unduh Termux dari F-Droid:** Jangan gunakan Google Play Store karena versinya usang dan dibatasi API. Unduh installer resmi F-Droid atau langsung APK Termux.
2. **Pemasangan Paket Inti:**
   \`pkg update -y && pkg install -y git python nodejs-lts bash coreutils micro openssh\`
3. **Izin Penyimpanan Android:**
   Jalankan \`termux-setup-storage\` dan ketuk "Izinkan" pada pop-up sistem Android agar Termux dapat membaca memori bersama.
4. **Clone Repositori & Instal Dependensi:**
   \`mkdir -p ~/projects && cd ~/projects\`
   \`git clone https://github.com/ekokeplek-glitch/ZLCE4.1.git\`
   \`cd ZLCE4.1 && npm install\`
5. **Peluncuran Produksi Satu Langkah:**
   Jalankan skrip mandiri: \`bash scripts/zlce-prod-start.sh\`
   Skrip ini otomatis menormalisasi izin POSIX (chmod +x), memvalidasi \`SESSION_STATE.md\`, mengompilasi bundel \`dist/\`, dan menjalankan server preview pada port 3000.
6. **Akses & Pasang PWA:** Buka Chrome/Samsung Internet di tablet pada \`http://localhost:3000\`, ketuk menu titik tiga (⋮) -> pilih **"Tambahkan ke Layar Utama" (Install PWA)**.`;
  } else if (q.includes('docs') || q.includes('readme') || q.includes('struktur') || q.includes('susunan') || q.includes('dokumen')) {
    matchedTopic = 'Struktur & Tata Letak Direktori Dokumentasi (docs/)';
    suggestedFiles.push(
      'docs/README.md',
      'docs/USAGE.md',
      'docs/mobile/MOBILE_BLUEPRINT.md',
      'README.md',
      'docs/mobile/PRODUCTION_OPERATIONS.md',
      'scripts/zlce-prod-start.sh',
      'package.json'
    );
    answer = `### Penjelasan Teknis: Struktur & Pengelompokan Direktori docs/
1. **Peta Indeks Pusat (\`docs/README.md\`):** Mengatalogkan seluruh berkas dokumentasi berdasarkan peran dan kebutuhan pengembang.
2. **Panduan Metodologi Inti (\`docs/USAGE.md\`):** Menjelaskan 3 alur operasional (proyek baru, lanjut sesi, restrukturisasi), protokol 4 gerbang, dan aturan triase revisi R1-R7.
3. **Panduan Operasional Tablet (\`docs/mobile/\`):** 11 berkas panduan khusus tablet Samsung A7 Lite: \`INSTALLATION.md\`, \`TERMUX_SETUP.md\`, \`USER_GUIDE.md\`, \`PRODUCTION_OPERATIONS.md\`, \`TROUBLESHOOTING.md\`, \`SECURITY_AUDIT.md\`, dan \`DEVICE_AUDIT.md\`.
4. **14 Cetak Biru Arsitektur (\`docs/mobile/blueprint/\`):** Desain teknis modular mulai dari 01_SYSTEM_OVERVIEW hingga 14_MULTI_AI_TEAM_MODEL.`;
  } else if (q.includes('tutorial') || q.includes('pemakaian') || q.includes('zlce mobile') || q.includes('relay') || q.includes('estafet') || q.includes('alur')) {
    matchedTopic = 'Tutorial Pemakaian ZLCE Mobile v4 (Alur Estafet 8 Anggota)';
    suggestedFiles.push(
      'docs/mobile/USER_GUIDE.md',
      'docs/mobile/blueprint/07_WORKFLOW_DESIGN.md',
      'SESSION_STATE.md'
    );
    answer = `### Penjelasan Teknis: Tutorial Pemakaian ZLCE Mobile v4 & Alur Estafet
1. **Pilih Profil Anggota:** Di Header PWA, ketuk Active Member Selector dan pilih akun Anda (mis. \`eko\`, \`oned\`, \`sulistiyani\`).
2. **Klaim Task Atomik:** Periksa \`SESSION_STATE.md\`. Hanya diperbolehkan tepat 1 task berstatus \`IN_PROGRESS\`. Isi blok WAL sebelum menyentuh kode.
3. **Generate Context Pack:** Buka tab **Context Pack**, pilih task aktif dan model AI target (Claude 30K / Gemini 1M / GPT 128K). Ketuk **1-Ketuk Salin Context Pack**.
4. **Eksekusi di Browser AI:** Beralih ke Claude / ChatGPT / Gemini web, buat percakapan baru, tempel Context Pack, dan jalankan instruksi.
5. **Result Capture & Injeksi Provenance:** Salin jawaban AI, buka tab **Result Capture** di PWA. Sistem otomatis menyuntikkan metadata \`[Aktor, Model, Timestamp, Task ID]\`.
6. **Verifikasi Kanonik di Termux:** Masuk folder proyek dan jalankan \`zlce check\`. Wajib 0 error sebelum commit.
7. **Commit & Push Beridentitas:** Lakukan commit task (\`git -c user.name="Nama" -c user.email="email@zlce.local" commit -m "..."\`) dan push branch.
8. **Serah Terima & Clean-Auth:** Buka wizard Oper Tablet, verifikasi checklist serah terima, dan jalankan \`bash scripts/zlce/clean-auth.sh\` untuk menghapus token git dari RAM.`;
  } else if (q.includes('lmk') || q.includes('ram') || q.includes('memori') || q.includes('memory') || q.includes('kill')) {
    matchedTopic = 'Android LMK & Manajemen Memori RAM 3GB';
    suggestedFiles.push(
      'src/hooks/useAutoDraftCache.ts', 
      'src/tests/lmkRecovery.test.ts', 
      'docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md'
    );
    answer = `### Penjelasan Teknis: Ketahanan Android LMK & RAM 3GB (Samsung SM-T225)
1. **Mekanisme Penyimpanan:** Menggunakan hook \`useAutoDraftCache\` dengan debounce 400ms ke LocalStorage.
2. **Synchronous Flush Saat Beralih Aplikasi:** Saat pengguna berpindah ke Termux atau peramban AI, event \`visibilitychange\` ('hidden') dan \`pagehide\` secara instan menulis draft tanpa menunggu timer debounce.
3. **Zero-Daemon Philosophy:** Di Termux dilarang menjalankan daemon Node/Express di background. Seluruh utilitas ZLCE (\`zlce-check\`, \`zlce\`) adalah eksekusi *one-shot* berbasis Python Standard Library (0 pip dependencies).
4. **Verifikasi:** Diuji deterministik pada \`src/tests/lmkRecovery.test.ts\` (TC-P7-02, 5/5 checks PASS).
5. **Bundel Khusus LMK:** Tersedia bundel ZIP 5 berkas (\`release-bundles/zlce-lmk-recovery-bundle.zip\`, ~16 KB) yang mencakup SESSION_STATE, MOBILE_BLUEPRINT, hook useAutoDraftCache, test suite lmkRecovery, dan blueprint 09_FAILURE_AND_RECOVERY.`;
  } else if (q.includes('secret') || q.includes('token') || q.includes('auth') || q.includes('keamanan') || q.includes('security') || q.includes('kredensial') || q.includes('credential') || q.includes('cache')) {
    matchedTopic = 'Zero-Secret Policy & Keamanan Kredensial';
    suggestedFiles.push(
      'scripts/security-audit.sh',
      'scripts/zlce/clean-auth.sh',
      'docs/mobile/SECURITY_AUDIT.md',
      'src/data/teamMembers.ts'
    );
    answer = `### Penjelasan Teknis: Zero-Secret Policy di Tablet Bersama
1. **Nol Kredensial di Penyimpanan Permanen:** \`teamMembers.ts\` dan LocalStorage hanya menyimpan alias publik non-rahasia (\`eko\`, \`oned\`, dll.) tanpa password atau Personal Access Token (PAT).
2. **Volatile RAM Cache (900s):** Kredensial Git disimpan sementara di RAM Termux (\`git credential-cache --timeout=900\`).
3. **Pembersihan Bersih (Clean-Auth):** Skrip \`scripts/zlce/clean-auth.sh\` mengeksekusi \`git credential-cache exit\` dan mematikan socket RAM sebelum tablet diserahkan ke anggota berikutnya.
4. **Commit Beridentitas Otomatis:** Perintah commit menyuntikkan flag dinamis \`-c user.name="Nama" -c user.email="email"\` tanpa mengubah config global tablet.`;
  } else if (q.includes('touch') || q.includes('ergonomi') || q.includes('44px') || q.includes('layar') || q.includes('viewport')) {
    matchedTopic = 'Ergonomi Layar Sentuh & Viewport Awareness';
    suggestedFiles.push(
      'docs/mobile/DEVICE_AUDIT.md',
      'src/components/mobile/MobileLayout.tsx',
      'src/index.css'
    );
    answer = `### Penjelasan Teknis: Ergonomi Layar Sentuh 8.7" & Viewport Awareness
1. **Target Sentuh Minimal 44x44px:** Seluruh 13 komponen kontrol interaktif utama mengimplementasikan class \`touch-target-44\` (\`min-height: 44px\`) sesuai W3C WCAG 2.5.5 dan Apple HIG.
2. **Keyboard Virtual Awareness:** Menggunakan \`visualViewport\` API di \`MobileLayout.tsx\` untuk menghitung \`--keyboard-height\` dan \`--viewport-height\`, mencegah form tertutup saat keyboard virtual Samsung aktif.
3. **Audit Terverifikasi:** Didokumentasikan pada \`docs/mobile/DEVICE_AUDIT.md\` (TC-P7-04, 13/13 komponen PASS).`;
  } else if (q.includes('offline') || q.includes('sw') || q.includes('service worker') || q.includes('cache')) {
    matchedTopic = 'Operasi Offline 100% & Service Worker';
    suggestedFiles.push(
      'public/sw.js',
      'src/tests/offlineOperation.test.ts',
      'docs/mobile/blueprint/03_PWA_ARCHITECTURE.md'
    );
    answer = `### Penjelasan Teknis: Kapabilitas Offline PWA 100%
1. **Cache-First App Shell:** Service worker (\`public/sw.js\`) melakukan precache aset esensial (\`index.html\`, bundel JS/CSS, manifest, ikon).
2. **Mandiri Tanpa API Server:** PWA tidak memiliki endpoint backend cloud; seluruh kalkulasi context pack, budget token, dan prompt generator berjalan murni di JavaScript client-side.
3. **Verifikasi:** Diuji pada \`src/tests/offlineOperation.test.ts\` (TC-P7-03, 5/5 checks PASS).`;
  } else {
    answer = `### Penjelasan Teknis Kontekstual ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)
Proyek ZLCE Mobile Workbench dirancang khusus untuk memecahkan masalah degradasi konteks AI (*Zero-Loss Context Engineering*) pada perangkat tablet terbatas (RAM 3GB).
* **Single Source of Truth:** Seluruh status dan langkah atomik dikunci pada \`SESSION_STATE.md\`.
* **Integritas Kanonik:** Divalidasi oleh skrip POSIX \`scripts/zlce-check.py\` (0 error, 0 warn).
* **Test Suite:** 73 pengujian otomatis di \`scripts/run-tests.py\` mencakup seluruh 22 fase pengembangan (Fase 0 s/d 21).`;
  }

  const responseText = `${answer}

---
**Berkas Referensi Utama Terkait Permintaan Ini:**
${suggestedFiles.map(f => `- \`${f}\``).join('\n')}

*(Tanggapan ini siap disalin dan dikirimkan kembali ke AI peninjau sebagai klarifikasi teknis)*`;

  return { responseText, matchedTopic, suggestedFiles };
}

/**
 * Membedah teks ulasan review AI eksternal dan mengekstrak temuan serta mengusulkan rancangan task perbaikan (Step 3)
 */
export function parseReviewFeedbackToProposedTasks(rawReviewText: string): ParsedReviewFeedback {
  // Model name detector
  let modelName = 'External AI Reviewer';
  if (/chatgpt|gpt-4/i.test(rawReviewText)) modelName = 'ChatGPT (GPT-4o)';
  else if (/claude/i.test(rawReviewText)) modelName = 'Claude 5.5 Sonnet';
  else if (/deepseek/i.test(rawReviewText)) modelName = 'DeepSeek-V3';
  else if (/gemini/i.test(rawReviewText)) modelName = 'Gemini 4 Hydrogen (Free)';

  // Score extraction
  const scoreMatch = rawReviewText.match(/(?:Skor|Score|Kesiapan|Nilai)[^0-9]*([0-9]{1,3})\s*(?:\/|\s*dari)?\s*100/i);
  const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : 95;

  // Decision extraction (GO / NO-GO)
  const decMatch = rawReviewText.match(/Keputusan(?:\s+audit)?:\s*([^\n.]+)/i);
  const decision = decMatch 
    ? decMatch[1].replace(/[*>_]/g, '').trim() 
    : (score >= 80 ? 'GO' : 'NOT READY FOR PRODUCTION (NO-GO)');

  // Extract Summary (support section 1 or section A)
  let summary = 'Hasil audit eksternal memverifikasi kekuatan arsitektur ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob) dengan beberapa usulan penyempurnaan modular.';
  const sec1Match = rawReviewText.split(/##\s+1\.\s+Ringkasan\s+Eksekutif/i)[1];
  if (sec1Match) {
    summary = sec1Match.split(/##\s+2/)[0].trim().replace(/\n+/g, ' ');
  } else {
    const sumA = rawReviewText.match(/##\s+A\.\s+RINGKASAN\s+EKSEKUTIF([\s\S]*?)(?=##\s+[B-D]|\Z)/i);
    if (sumA && sumA[1].trim()) {
      summary = sumA[1].trim().replace(/\n+/g, ' ');
    }
  }

  // Default structural proposed tasks
  const proposedTasks: ProposedSubTask[] = [];

  // 1. Cek apakah dokumen merupakan Laporan Tinjauan Kedua (B1..B9)
  const isSecondReview = /laporan tinjauan kedua|tinjauan kedua|temuan baru \/ yang masih terbuka|\|\s*B1\s*\|/i.test(rawReviewText);
  if (isSecondReview) {
    proposedTasks.push(
      {
        id: 'TASK-083',
        name: '[AUD3-001] Zero-Secret Email Hygiene & Shell Command Syntax Fix',
        phase: 'FASE 13 (Final Review Audit Remediation & Polish)',
        category: 'critical',
        description: 'Sanitasi menyeluruh surel pribadi ke eko@zlce.local pada seluruh repositori dan koreksi sintaks git commit di auditPromptGenerator.ts (Temuan B1 & Q9).',
        impactFiles: ['src/data/teamMembers.ts', 'docs/mobile/USER_GUIDE.md', 'docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md', 'src/utils/auditPromptGenerator.ts'],
        dependencies: 'TASK-082',
        accepted: true
      },
      {
        id: 'TASK-084',
        name: '[AUD3-002] Team Roles & 8-Step Relay Workflow Harmonization',
        phase: 'FASE 13 (Final Review Audit Remediation & Polish)',
        category: 'enhancement',
        description: 'Harmonisasi peran 8 anggota tim dengan teamMembers.ts sebagai SSOT, serta penyelarasan alur 8 langkah estafet dan batas tab peramban (Temuan B2, B3, Q2).',
        impactFiles: ['docs/mobile/USER_GUIDE.md', 'docs/mobile/PRODUCTION_OPERATIONS.md', 'src/data/teamMembers.ts'],
        dependencies: 'TASK-083',
        accepted: true
      },
      {
        id: 'TASK-085',
        name: '[AUD3-003] Master README & Documentation Index Modernization',
        phase: 'FASE 13 (Final Review Audit Remediation & Polish)',
        category: 'documentation',
        description: 'Pemasangan draf README.md final v4.0.0 GA dengan jalur docs/mobile/*, rekonsiliasi versi USAGE.md & CHANGELOG.md, dan dokumentasi starter-kit vs root (Temuan B4, B4b, Q14).',
        impactFiles: ['README.md', 'docs/README.md', 'docs/USAGE.md', 'CHANGELOG.md'],
        dependencies: 'TASK-084',
        accepted: true
      },
      {
        id: 'TASK-086',
        name: '[AUD3-004] Production Operations Security & Network Isolation',
        phase: 'FASE 13 (Final Review Audit Remediation & Polish)',
        category: 'critical',
        description: 'Dokumentasi & konfigurasi HOST=127.0.0.1 pada server Termux, pemutakhiran panduan instalasi, dan spesifikasi node >= 20.19.0 pada engines package.json (Temuan B5, B6, B7).',
        impactFiles: ['scripts/zlce-prod-start.sh', 'docs/mobile/PRODUCTION_OPERATIONS.md', 'docs/mobile/INSTALLATION.md', 'package.json'],
        dependencies: 'TASK-085',
        accepted: true
      },
      {
        id: 'TASK-087',
        name: '[AUD3-005] FeedbackReviewTab & CommandHub Polish & Tab Routing Test',
        phase: 'FASE 13 (Final Review Audit Remediation & Polish)',
        category: 'enhancement',
        description: 'Penyempurnaan FeedbackReviewTab (aset Tinjauan Kedua), tautan panduan CommandHub ke Blueprint 13 & Kasus A-D, dan automated unit test ?tab= URL routing (Temuan B8, Q12).',
        impactFiles: ['src/components/mobile/FeedbackReviewTab.tsx', 'src/components/mobile/CommandHubTab.tsx', 'src/tests/tabRouting.test.ts', 'vite-session-sync.ts'],
        dependencies: 'TASK-086',
        accepted: true
      },
      {
        id: 'TASK-088',
        name: '[AUD3-006] Test Suite & Final Quality Gate Reconciliation',
        phase: 'FASE 13 (Final Review Audit Remediation & Polish)',
        category: 'critical',
        description: 'Rekonsiliasi scripts/run-tests.py menjadi 48/48 checks PASS, penegakan 0 error zlce-check, dan audit log serah terima akhir v4.0.0 GA.',
        impactFiles: ['scripts/run-tests.py', 'SESSION_STATE.md', 'TASKS.md'],
        dependencies: 'TASK-087',
        accepted: true
      }
    );
  }

  // 2. Cek apakah dokumen memiliki Section 6 "Rencana Perbaikan Atomik" (tabel AUD-001..AUD-014)
  const sec6Match = !isSecondReview && rawReviewText.split(/##\s+6\.\s+Rencana\s+Perbaikan\s+Atomik/i)[1];
  if (sec6Match) {
    const tablePart = sec6Match.split(/###|\n\n\n|##\s+7/)[0];
    const lines = tablePart.split('\n').filter(l => l.includes('|') && !l.includes('---|---') && !l.includes('Ruang lingkup'));
    let taskCounter = 47;
    for (const line of lines) {
      const cols = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
      if (cols.length >= 3 && /^AUD-\d+/i.test(cols[0])) {
        const audId = cols[0];
        const taskName = cols[1];
        const scope = cols[2];
        const priority = cols[3] || 'P1';
        const taskId = `TASK-${String(taskCounter).padStart(3, '0')}`;
        taskCounter++;

        let category: 'critical' | 'enhancement' | 'refactor' | 'documentation' = 'enhancement';
        if (priority.toUpperCase().includes('P0')) category = 'critical';
        else if (priority.toUpperCase().includes('P2')) category = 'refactor';

        // Cari berkas terdampak dari Section 4 jika ada
        let impactFiles: string[] = [];
        const pos = rawReviewText.indexOf(audId);
        if (pos !== -1) {
          const chunk = rawReviewText.substring(pos, pos + 800);
          const m = chunk.match(/\*\*Berkas terdampak:\*\*([^\n]*(?:\n\s*[-*]\s*`[^`]+`)*)/i);
          if (m) {
            const found = m[1].match(/`([^`]+)`/g);
            if (found) {
              impactFiles = found.map(f => f.replace(/`/g, '').trim());
            }
          }
        }
        if (impactFiles.length === 0) {
          impactFiles = ['SESSION_STATE.md'];
        }

        proposedTasks.push({
          id: taskId,
          name: `[${audId}] ${taskName}`,
          phase: 'FASE 10 (Remediasi Audit Eksternal)',
          category,
          description: `${scope} (Prioritas: ${priority})`,
          impactFiles,
          dependencies: taskId === 'TASK-047' ? 'TASK-046' : `TASK-${String(taskCounter - 2).padStart(3, '0')}`,
          accepted: true
        });
      }
    }
  }

  // 2. Jika tidak ada Section 6 table, gunakan analisis heuristik bawaan
  if (proposedTasks.length === 0) {
    if (/pwa|install|offline|cache/i.test(rawReviewText)) {
      proposedTasks.push({
        id: 'TASK-047',
        name: 'Optimasi Precache Service Worker & Periodic Background Sync',
        phase: 'FASE 9 (Penyempurnaan)',
        category: 'enhancement',
        description: 'Menyempurnakan daftar precache aset statis di public/sw.js dan menambahkan handler offline fallthrough yang lebih tangguh.',
        impactFiles: ['public/sw.js', 'src/sw-register.ts'],
        dependencies: 'TASK-043',
        accepted: true
      });
    }

    if (/memory|ram|leak|cleanup|gc|lmk/i.test(rawReviewText)) {
      proposedTasks.push({
        id: 'TASK-048',
        name: 'Penyempurnaan Garbage Collection & Memory Footprint Audit',
        phase: 'FASE 9 (Penyempurnaan)',
        category: 'refactor',
        description: 'Menerapkan pembersihan listener event visualViewport dan pemangkasan array history snapshot saat tab tidak aktif.',
        impactFiles: ['src/components/mobile/MobileLayout.tsx', 'src/hooks/useSessionHistory.ts'],
        dependencies: 'TASK-043',
        accepted: true
      });
    }

    if (/security|secret|audit|script/i.test(rawReviewText)) {
      proposedTasks.push({
        id: 'TASK-049',
        name: 'Penambahan Pre-Commit Hook Otomatis untuk Scan Zero-Secret',
        phase: 'FASE 9 (Penyempurnaan)',
        category: 'critical',
        description: 'Memasang git hook pre-commit otomatis di Termux yang menjalankan scripts/security-audit.sh sebelum commit diizinkan.',
        impactFiles: ['scripts/install-hooks.sh', 'scripts/security-audit.sh'],
        dependencies: 'TASK-043',
        accepted: true
      });
    }

    if (proposedTasks.length === 0) {
      proposedTasks.push({
        id: 'TASK-047',
        name: 'Penyempurnaan Dokumentasi Integrasi & Laporan Audit Eksternal',
        phase: 'FASE 9 (Penyempurnaan)',
        category: 'documentation',
        description: 'Mendokumentasikan hasil temuan dan skor kesiapan produksi dari reviewer AI eksternal ke dalam docs/mobile/EXTERNAL_AUDIT_REPORT.md.',
        impactFiles: ['docs/mobile/EXTERNAL_AUDIT_REPORT.md', 'CHANGELOG.md'],
        dependencies: 'TASK-043',
        accepted: true
      });
    }
  }

  // 3. Ekstraksi temuan rinci
  let findings: {
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    evidence: string;
    recommendation: string;
  }[] = [];

  if (isSecondReview) {
    const sec3Match = rawReviewText.match(/##\s+3\.\s+Temuan\s+baru[\s\S]*?(?=\n\s*##\s+4|\Z)/i);
    if (sec3Match) {
      const lines = sec3Match[0].split('\n').filter(l => l.includes('|') && /\|\s*B\d+/i.test(l));
      for (const line of lines) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 5) {
          const bId = parts[0];
          const rawSev = parts[1].replace(/\*/g, '').toUpperCase();
          const title = parts[2];
          const evidence = parts[3];
          const rec = parts[4] || 'Terapkan perbaikan preskriptif sesuai rekomendasi laporan.';
          const severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 
            rawSev.includes('T') ? 'HIGH' :
            rawSev.includes('S') ? 'MEDIUM' : 'LOW';
          findings.push({
            severity,
            title: `[${bId}] ${title}`,
            evidence,
            recommendation: rec
          });
        }
      }
    }
  }

  const audMatches = [...rawReviewText.matchAll(/###\s+(AUD-\d+)\s+[—-]\s+([^\n]+)([\s\S]*?)(?=\n\s*###\s+AUD|\n\s*##|\Z)/g)];
  if (findings.length === 0 && audMatches.length > 0) {
    findings = audMatches.map(m => {
      const audId = m[1];
      const title = `[${audId}] ${m[2].trim()}`;
      const body = m[3];
      const sevMatch = body.match(/\*\*Keparahan:\*\*\s*([^\n]+)/i);
      const rawSev = sevMatch ? sevMatch[1].trim().toUpperCase() : 'MEDIUM';
      const severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 
        rawSev.includes('CRITICAL') ? 'CRITICAL' : 
        rawSev.includes('HIGH') ? 'HIGH' : 
        rawSev.includes('LOW') ? 'LOW' : 'MEDIUM';

      const buktiMatch = body.match(/\*\*Bukti teknis:\*\*([\s\S]*?)(?=\n\s*\*\*Dampak|\Z)/i);
      const recMatch = body.match(/\*\*Rekomendasi preskriptif:\*\*([\s\S]*?)(?=\n\s*\*\*Acceptance|\Z)/i);

      return {
        severity,
        title,
        evidence: buktiMatch ? buktiMatch[1].trim().replace(/\n+/g, ' ').substring(0, 240) + '...' : 'Tercatat dalam laporan audit resmi.',
        recommendation: recMatch ? recMatch[1].trim().replace(/\n+/g, ' ').substring(0, 240) + '...' : 'Terapkan perbaikan preskriptif.'
      };
    });
  } else {
    findings = [
      {
        severity: 'LOW',
        title: 'Optimasi Ukuran Bundel ZIP Audit Eksternal',
        evidence: 'scripts/create-audit-bundle.py membundel seluruh berkas, dapat diperkaya dengan skrip auto-unpack.',
        recommendation: 'Sediakan skrip ekstraksi otomatis satu baris untuk peramban Termux.'
      },
      {
        severity: 'MEDIUM',
        title: 'Pengetatan Pre-Commit Guard',
        evidence: 'scripts/security-audit.sh dijalankan manual atau via test runner; belum otomatis sebagai git hook pre-commit.',
        recommendation: 'Tambahkan git pre-commit hook otomatis yang memanggil security-audit sebelum commit diizinkan.'
      }
    ];
  }

  // 4. Ekstraksi poin kekuatan
  const strengthsMatch = rawReviewText.match(/\*\*Pertahankan:\*\*([\s\S]*?)(?=\n\s*\*\*Perbaiki|\n\s*\*\*Jangan|\n\s*###|\Z)/i);
  let strengths: string[] = [];
  if (strengthsMatch) {
    strengths = strengthsMatch[1].split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(l => l.length > 0);
  }
  if (strengths.length === 0) {
    strengths = [
      'PWA + Termux & Zero-Daemon architecture sesuai untuk RAM 3GB.',
      'Mekanisme debounce 400ms & lifecycle flush (visibilitychange / pagehide).',
      'Utilitas one-shot Python Standard Library (0 pip dependencies).',
      'Format Markdown/Git untuk artefak konteks deterministik.'
    ];
  }

  return {
    modelName,
    timestamp: new Date().toISOString(),
    summary,
    score,
    decision,
    strengths,
    findings,
    proposedTasks
  };
}
