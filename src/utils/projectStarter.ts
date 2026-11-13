import { ProjectWorkflowMode } from '../types/mobile';
import { shellQuote } from './commandSanitizer';

export interface FreshProjectStarterOptions {
  projectName: string;
  stack?: string;
  mode: 'FULL' | 'LITE';
  workflow: ProjectWorkflowMode;
  branch?: string;
  termuxPath?: string;
  description?: string;
}

export function getWorkflowLabel(workflow?: ProjectWorkflowMode): string {
  switch (workflow) {
    case 'CONTINUE':
      return 'Lanjutan Setengah Jadi';
    case 'MODIFY':
      return 'Update & Modifikasi';
    case 'NEW':
    default:
      return 'Proyek Baru';
  }
}

export function getWorkflowShortTag(workflow?: ProjectWorkflowMode): string {
  switch (workflow) {
    case 'CONTINUE':
      return 'LANJUTAN';
    case 'MODIFY':
      return 'MODIFIKASI';
    case 'NEW':
    default:
      return 'BARU';
  }
}

/**
 * Menghasilkan SESSION_STATE.md awal yang valid 100% sesuai aturan kanonik ZLCE
 * (8 bagian + header matriks 6 kolom + 7 butir WAL kosong + Aturan X1).
 */
export function buildFreshSessionStateMarkdown(opts: FreshProjectStarterOptions): string {
  const name = (opts.projectName || 'Proyek Baru').trim();
  const stack = (opts.stack || 'React / TypeScript / Node.js').trim();
  const mode = opts.mode || 'LITE';
  const branch = (opts.branch || 'main').trim() || 'main';
  const today = new Date().toISOString().slice(0, 10);
  const timestampAudit = `${today} jam: ?`;

  if (opts.workflow === 'CONTINUE') {
    return `# STATUS SESI (SESSION_STATE.md): ${name}

Sumber kebenaran tunggal status task, catatan serah terima, WAL checkpoint, dan audit state ZLCE.

---

## 0. KONTEKS PROYEK (statis)

* **Proyek:** ${name}
* **Stack:** ${stack}
* **MODE:** ${mode}
* **Kemampuan Tulis Berkas AI:** YA (atau gunakan Checkpoint Block)
* **Kemampuan Eksekusi AI:** YA, Pengguna menjalankan verifikasi via Termux / Command Hub

---

## 1. STATUS AKTIF

* **Timestamp Audit:** ${timestampAudit}
* **Cabang Git:** \`${branch}\`
* **Task Terakhir DONE:** -
* **Task Aktif:** \`TASK-001\`
* **Status Task Aktif:** READY
* **Task Berikutnya:** \`TASK-002\`

---

## 2. MATRIKS TASK

| ID Task | Nama | Dependensi | Status | Bukti Verifikasi | Disetujui |
| :--- | :--- | :--- | :--- | :--- | :--- |
| \`TASK-001\` | Audit Read-Only Kode Eksisting & Pemetaan Fitur Tersisa | - | READY | - | - |
| \`TASK-002\` | Rekonsiliasi \`BLUEPRINT.md\` & Backlog \`TASKS.md\` Proyek Lanjutan | TASK-001 | PENDING | - | - |
| \`TASK-003\` | Lanjutkan Eksekusi Modul Prioritas Berikutnya | TASK-002 | PENDING | - | - |

---

## 3. WORK IN PROGRESS (WAL)

Catatan tulis-dahulu: isi SEBELUM memulai langkah multi-berkas, perbarui SESUDAH langkah selesai. Kosongkan (semua \`-\`) saat task \`DONE\`.

* **Task:** -
* **Langkah Sedang Dikerjakan:** -
* **Berkas Direncanakan/Disentuh:** -
* **Sudah Dilakukan:** -
* **Langkah Berikutnya (persis):** -
* **Perintah Verifikasi:** -
* **Diperbarui:** -

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

| ID | Jenis | Isi | Dampak jika salah | Status |
| :--- | :--- | :--- | :--- | :--- |
| \`ASM-01\` | Asumsi | Proyek merupakan lanjutan kode setengah jadi yang direstrukturisasi ke alur ZLCE (${mode}) | Bila sudah memakai ZLCE sebelumnya, impor \`SESSION_STATE.md\` eksisting dan gunakan \`HANDOVER_PROMPT.md\` | OPEN |

---

## 5. SLOT REVISI AKTIF

| ID | Level (S/M/L) | Deskripsi | Tindakan |
| :--- | :--- | :--- | :--- |
| - | - | Tidak ada revisi aktif saat ini | - |

---

## 6. CATATAN SERAH TERIMA (ditimpa; maks. ~10 baris)

* ${today}: Workspace lanjutan untuk **${name}** (${opts.termuxPath || '~/projects/proyek-lanjutan'}) disiapkan dalam mode ${mode}.
* Jika proyek sudah memiliki \`SESSION_STATE.md\` sebelumnya, gunakan menu **Impor .md** atau tempelkan isinya lalu lanjutkan dengan \`HANDOVER_PROMPT.md\`.
* Jika proyek setengah jadi belum memiliki berkas kontrol ZLCE, gunakan \`LANDING_PROMPT.md\` dengan \`Aksi: RESTRUKTURISASI proyek existing\` (audit baca-saja dahulu).

---

## 7. LOG AUDIT (terbaru di atas; arsipkan entri lama ke \`docs/archive/\`)

* **${timestampAudit}:** Inisiasi workspace lanjutan proyek setengah jadi untuk ${name} (Mode ${mode}). Status awal: \`TASK-001\` \`READY\`.
`;
  }

  if (opts.workflow === 'MODIFY') {
    return `# STATUS SESI (SESSION_STATE.md): ${name}

Sumber kebenaran tunggal status task, catatan serah terima, WAL checkpoint, dan audit state ZLCE.

---

## 0. KONTEKS PROYEK (statis)

* **Proyek:** ${name}
* **Stack:** ${stack}
* **MODE:** ${mode}
* **Kemampuan Tulis Berkas AI:** YA (atau gunakan Checkpoint Block)
* **Kemampuan Eksekusi AI:** YA, Pengguna menjalankan verifikasi via Termux / Command Hub

---

## 1. STATUS AKTIF

* **Timestamp Audit:** ${timestampAudit}
* **Cabang Git:** \`${branch}\`
* **Task Terakhir DONE:** -
* **Task Aktif:** \`TASK-REV-01\`
* **Status Task Aktif:** READY
* **Task Berikutnya:** \`TASK-REV-02\`

---

## 2. MATRIKS TASK

| ID Task | Nama | Dependensi | Status | Bukti Verifikasi | Disetujui |
| :--- | :--- | :--- | :--- | :--- | :--- |
| \`TASK-REV-01\` | Audit Dampak Modifikasi & Pembaruan Spesifikasi (\`BLUEPRINT.md\`) | - | READY | - | - |
| \`TASK-REV-02\` | Implementasi Update & Modifikasi Modul Target | TASK-REV-01 | PENDING | - | - |
| \`TASK-REV-03\` | Uji Regresi, Sinkronisasi \`Docs Impact\` & Rilis Update | TASK-REV-02 | PENDING | - | - |

---

## 3. WORK IN PROGRESS (WAL)

Catatan tulis-dahulu: isi SEBELUM memulai langkah multi-berkas, perbarui SESUDAH langkah selesai. Kosongkan (semua \`-\`) saat task \`DONE\`.

* **Task:** -
* **Langkah Sedang Dikerjakan:** -
* **Berkas Direncanakan/Disentuh:** -
* **Sudah Dilakukan:** -
* **Langkah Berikutnya (persis):** -
* **Perintah Verifikasi:** -
* **Diperbarui:** -

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

| ID | Jenis | Isi | Dampak jika salah | Status |
| :--- | :--- | :--- | :--- | :--- |
| \`ASM-01\` | Asumsi | Perubahan dikelola pada branch terpisah (\`task/TASK-REV-01\`) tanpa mengubah \`main\` secara langsung | Wajib patuhi \`git pull --ff-only\` & PR review sebelum merge ke \`main\` | OPEN |

---

## 5. SLOT REVISI AKTIF

| ID | Level (S/M/L) | Deskripsi | Tindakan |
| :--- | :--- | :--- | :--- |
| \`TASK-REV-01\` | M | Siklus update & modifikasi terstruktur untuk ${name} | Jalankan audit dampak -> implementasi -> uji regresi & perbarui \`CHANGELOG.md\` |

---

## 6. CATATAN SERAH TERIMA (ditimpa; maks. ~10 baris)

* ${today}: Workspace update & modifikasi untuk **${name}** (${opts.termuxPath || '~/projects/proyek-update'}) siap dimulai pada \`TASK-REV-01\`.
* Untuk perubahan sangat kecil (Level S: <= 1 berkas & <= 20 baris tanpa ubah kontrak/keamanan), eksekusi langsung dengan commit \`[MINOR]\` dan catat di \`CHANGELOG.md\`.
* Untuk perubahan fitur/arsitektur (Level M/L), kerjakan berurutan melalui \`TASK-REV-01\` s/d \`TASK-REV-03\`.

---

## 7. LOG AUDIT (terbaru di atas; arsipkan entri lama ke \`docs/archive/\`)

* **${timestampAudit}:** Inisiasi workspace modifikasi/update untuk ${name} (Mode ${mode}). Status awal: \`TASK-REV-01\` \`READY\`.
`;
  }

  // Default: workflow === 'NEW' (Proyek Baru)
  return `# STATUS SESI (SESSION_STATE.md): ${name}

Sumber kebenaran tunggal status task, catatan serah terima, WAL checkpoint, dan audit state ZLCE.

---

## 0. KONTEKS PROYEK (statis)

* **Proyek:** ${name}
* **Stack:** ${stack}
* **MODE:** ${mode}
* **Kemampuan Tulis Berkas AI:** YA (atau gunakan Checkpoint Block)
* **Kemampuan Eksekusi AI:** YA, Pengguna menjalankan verifikasi via Termux / Command Hub

---

## 1. STATUS AKTIF

* **Timestamp Audit:** ${timestampAudit}
* **Cabang Git:** \`${branch}\`
* **Task Terakhir DONE:** -
* **Task Aktif:** \`TASK-001\`
* **Status Task Aktif:** READY
* **Task Berikutnya:** \`TASK-002\`

---

## 2. MATRIKS TASK

| ID Task | Nama | Dependensi | Status | Bukti Verifikasi | Disetujui |
| :--- | :--- | :--- | :--- | :--- | :--- |
| \`TASK-001\` | Inisialisasi Repositori & Dokumen Kontrol ZLCE (${mode}) | - | READY | - | - |
| \`TASK-002\` | Finalisasi Spesifikasi & Model Data (\`BLUEPRINT.md\`) | TASK-001 | PENDING | - | - |
| \`TASK-003\` | Implementasi Modul Pertama & Uji Awal | TASK-002 | PENDING | - | - |

---

## 3. WORK IN PROGRESS (WAL)

Catatan tulis-dahulu: isi SEBELUM memulai langkah multi-berkas, perbarui SESUDAH langkah selesai. Kosongkan (semua \`-\`) saat task \`DONE\`.

* **Task:** -
* **Langkah Sedang Dikerjakan:** -
* **Berkas Direncanakan/Disentuh:** -
* **Sudah Dilakukan:** -
* **Langkah Berikutnya (persis):** -
* **Perintah Verifikasi:** -
* **Diperbarui:** -

---

## 4. ASSUMPTIONS & OPEN QUESTIONS

| ID | Jenis | Isi | Dampak jika salah | Status |
| :--- | :--- | :--- | :--- | :--- |
| \`ASM-01\` | Asumsi | Proyek dimulai menggunakan Mode ${mode} (${mode === 'LITE' ? '4 berkas kontrol inti' : '10 berkas kontrol penuh'}) | ${mode === 'LITE' ? 'Beralih ke Mode FULL jika proyek > 15 task atau multi-service' : 'Pastikan 4 Gerbang Persetujuan dijalankan berurutan'} | OPEN |

---

## 5. SLOT REVISI AKTIF

| ID | Level (S/M/L) | Deskripsi | Tindakan |
| :--- | :--- | :--- | :--- |
| - | - | Tidak ada revisi aktif saat ini | - |

---

## 6. CATATAN SERAH TERIMA (ditimpa; maks. ~10 baris)

* ${today}: Workspace proyek baru **${name}** (${opts.termuxPath || '~/projects/proyek-baru'}) siap dimulai dari \`TASK-001\`.
* Ekstrak \`zlce-starter-kit-v4.1.0.zip\` ke direktori proyek di Termux lalu tempel \`LANDING_PROMPT.md\` (\`Aksi: BARU\`, \`MODE: ${mode}\`) ke sesi AI pertama.

---

## 7. LOG AUDIT (terbaru di atas; arsipkan entri lama ke \`docs/archive/\`)

* **${timestampAudit}:** Inisiasi workspace proyek baru ${name} (Mode ${mode}). Status awal: \`TASK-001\` \`READY\`.
`;
}

/**
 * Menghasilkan starter TASKS.md yang selaras dengan SESSION_STATE.md awal proyek baru/lanjutan/modifikasi.
 */
export function buildFreshTasksMarkdown(opts: FreshProjectStarterOptions): string {
  const name = (opts.projectName || 'Proyek Baru').trim();
  const mode = opts.mode || 'LITE';

  if (opts.workflow === 'MODIFY') {
    return `# BACKLOG TASK MODIFIKASI: ${name}

Definisi task atomik untuk pembaruan & modifikasi proyek. **Status task tidak ditulis di sini**; status dikelola di \`SESSION_STATE.md\`.

---

## 1. PETA FASE

* **FASE REVISI: Siklus Update & Modifikasi Terstruktur** (\`TASK-REV-01\` s/d \`TASK-REV-03\`)

---

## 2. RINCIAN TASK MODIFIKASI

### TASK-REV-01: Audit Dampak Modifikasi & Pembaruan Spesifikasi (\`BLUEPRINT.md\`)
* **Fase:** FASE REVISI
* **Deskripsi:** Memetakan berkas terdampak, dependensi, skema data, dan kebutuhan uji sebelum melakukan modifikasi pada proyek ${name}.
* **Dependensi:** -
* **File:** \`BLUEPRINT.md\`, \`TASKS.md\`, \`SESSION_STATE.md\`
* **Docs Terkait:** \`BLUEPRINT.md\`
* **Docs Impact:** \`BLUEPRINT\`, \`TASKS\`
* **Acceptance Criteria:**
  1. Daftar berkas terdampak dan risiko regresi tercatat jelas.
  2. Perubahan spesifikasi pada \`BLUEPRINT.md\` disetujui pengguna.
* **Test Case:** \`zlce-check::strict\`
* **Metode Verifikasi:** \`python3 scripts/zlce/zlce-check.py . --strict --no-git\`

---

### TASK-REV-02: Implementasi Update & Modifikasi Modul Target
* **Fase:** FASE REVISI
* **Deskripsi:** Menerapkan perubahan kode/fitur pada cabang \`task/TASK-REV-02\` secara atomik dengan pencatatan WAL sebelum menyentuh multi-berkas.
* **Dependensi:** \`TASK-REV-01\`
* **File:** Berkas modul target & unit test terkait
* **Docs Terkait:** \`BLUEPRINT.md\`, \`ARCHITECTURE.md\`
* **Docs Impact:** \`BLUEPRINT\`
* **Acceptance Criteria:**
  1. Modifikasi memenuhi seluruh syarat fungsional tanpa merusak fitur eksisting.
  2. Zero-Secret & linter lulus tanpa error.
* **Test Case:** \`npm test\`
* **Metode Verifikasi:** Jalankan test unit, linter, dan \`build\` proyek; tempel hasil ke \`SESSION_STATE.md\`.

---

### TASK-REV-03: Uji Regresi, Sinkronisasi \`Docs Impact\` & Rilis Update
* **Fase:** FASE REVISI
* **Deskripsi:** Memastikan seluruh suite regresi lulus 100%, memperbarui \`CHANGELOG.md\` dan dokumentasi terdampak, lalu menutup siklus modifikasi.
* **Dependensi:** \`TASK-REV-02\`
* **File:** \`CHANGELOG.md\`, \`SESSION_STATE.md\`, berkas uji regresi
* **Docs Terkait:** \`TESTING.md\`, \`CHANGELOG.md\`
* **Docs Impact:** \`CHANGELOG\`
* **Acceptance Criteria:**
  1. Seluruh pengujian regresi lulus 100% tanpa error.
  2. \`python3 scripts/zlce/zlce-check.py . --strict\` menghasilkan 0 error, 0 warning.
* **Test Case:** \`regression_suite\`
* **Metode Verifikasi:** Jalankan test runner penuh dan \`zlce-check.py --strict\`.
`;
  }

  if (opts.workflow === 'CONTINUE') {
    return `# BACKLOG TASK LANJUTAN: ${name}

Definisi task atomik untuk melanjutkan/merestrukturisasi proyek setengah jadi. **Status task tidak ditulis di sini**; status ada di \`SESSION_STATE.md\`.

---

## 1. PETA FASE

* **FASE 0: Audit Eksisting & Rekonsiliasi ZLCE** (\`TASK-001\`, \`TASK-002\`)
* **FASE 1: Eksekusi Lanjutan Modul Prioritas** (\`TASK-003\`)

---

## 2. RINCIAN TASK

### TASK-001: Audit Read-Only Kode Eksisting & Pemetaan Fitur Tersisa
* **Fase:** FASE 0
* **Deskripsi:** Melakukan pemeriksaan baca-saja terhadap struktur direktori, dependensi, test yang ada, dan fitur yang sudah vs belum selesai pada ${name}.
* **Dependensi:** -
* **File:** Struktur repositori eksisting, \`package.json\` / manifest runtime
* **Docs Terkait:** \`BLUEPRINT.md\`
* **Docs Impact:** \`BLUEPRINT\`
* **Acceptance Criteria:**
  1. Seluruh modul yang sudah selesai dan modul yang setengah jadi terdokumentasi akurat tanpa mengubah kode.
  2. Kondisi baseline test dan linter tercatat nyata.
* **Test Case:** \`baseline_audit\`
* **Metode Verifikasi:** Jalankan build/test eksisting saat ini dan lampirkan output sebenarnya.

---

### TASK-002: Rekonsiliasi \`BLUEPRINT.md\` & Backlog \`TASKS.md\` Proyek Lanjutan
* **Fase:** FASE 0
* **Deskripsi:** Menyusun \`BLUEPRINT.md\` aktual dan memecah sisa pekerjaan menjadi task atomik bernomor berurutan di \`TASKS.md\`.
* **Dependensi:** \`TASK-001\`
* **File:** \`BLUEPRINT.md\`, \`TASKS.md\`, \`SESSION_STATE.md\`
* **Docs Terkait:** \`BLUEPRINT.md\`
* **Docs Impact:** \`BLUEPRINT\`, \`TASKS\`
* **Acceptance Criteria:**
  1. \`BLUEPRINT.md\` dan \`TASKS.md\` disetujui sebelum penulisan kode lanjutan.
  2. \`python3 scripts/zlce/zlce-check.py . --strict\` lulus 0 error.
* **Test Case:** \`zlce-check::strict\`
* **Metode Verifikasi:** \`python3 scripts/zlce/zlce-check.py . --strict --no-git\`

---

### TASK-003: Lanjutkan Eksekusi Modul Prioritas Berikutnya
* **Fase:** FASE 1
* **Deskripsi:** Menyelesaikan implementasi modul prioritas pertama yang belum rampung sesuai backlog yang disetujui pada \`TASK-002\`.
* **Dependensi:** \`TASK-002\`
* **File:** Modul sumber kode prioritas & test terkait
* **Docs Terkait:** \`BLUEPRINT.md\`
* **Docs Impact:** \`BLUEPRINT\`
* **Acceptance Criteria:**
  1. Modul berjalan stabil dan lulus pengujian unit/integrasi.
  2. Tidak ada regresi pada fitur yang sudah selesai sebelumnya.
* **Test Case:** \`module_priority_test\`
* **Metode Verifikasi:** Eksekusi test suite proyek dan \`zlce-check.py --strict\`.
`;
  }

  return `# BACKLOG TASK PENGEMBANGAN: ${name}

Definisi task atomik Mode ${mode}. **Status task tidak ditulis di sini**; status ada di \`SESSION_STATE.md\`.

---

## 1. PETA FASE

* **FASE 0: Pondasi & Spesifikasi Mode ${mode}** (\`TASK-001\`, \`TASK-002\`)
* **FASE 1: Implementasi Fitur Inti** (\`TASK-003\`)

---

## 2. RINCIAN TASK ATOMIK

### TASK-001: Inisialisasi Repositori & Dokumen Kontrol ZLCE (${mode})
* **Fase:** FASE 0
* **Deskripsi:** Menyiapkan repositori Git, \`.gitignore\`, linter/formatter, \`.env.example\`, dan memverifikasi dokumen kontrol Mode ${mode}.
* **Dependensi:** -
* **File:** \`.gitignore\`, \`.env.example\`, \`BLUEPRINT.md\`, \`TASKS.md\`, \`SESSION_STATE.md\`, \`HANDOVER.md\`
* **Docs Terkait:** \`BLUEPRINT.md\`
* **Docs Impact:** \`BLUEPRINT\`
* **Acceptance Criteria:**
  1. Repositori bersih tanpa rahasia dan linter dasar berjalan 0 error.
  2. \`python3 scripts/zlce/zlce-check.py . --strict\` lulus 0 error.
* **Test Case:** \`zlce-check::strict\`
* **Metode Verifikasi:** \`python3 scripts/zlce/zlce-check.py . --strict --no-git\`

---

### TASK-002: Finalisasi Spesifikasi & Model Data (\`BLUEPRINT.md\`)
* **Fase:** FASE 0
* **Deskripsi:** Menetapkan parameter runtime, struktur modul, batasan domain, model data, dan strategi pengujian pada \`BLUEPRINT.md\` (Gerbang 1).
* **Dependensi:** \`TASK-001\`
* **File:** \`BLUEPRINT.md\`
* **Docs Terkait:** \`BLUEPRINT.md\`
* **Docs Impact:** \`BLUEPRINT\`
* **Acceptance Criteria:**
  1. Seluruh bagian \`BLUEPRINT.md\` terisi lengkap tanpa placeholder kritis.
  2. Gerbang 1 disetujui pengguna di \`SESSION_STATE.md\`.
* **Test Case:** \`blueprint_gate_1\`
* **Metode Verifikasi:** Review spesifikasi bersama pengguna; setujui di \`SESSION_STATE.md\`.

---

### TASK-003: Implementasi Modul Pertama & Uji Awal
* **Fase:** FASE 1
* **Deskripsi:** Membangun modul/fitur fungsional tahap pertama sesuai spesifikasi pada \`BLUEPRINT.md\`.
* **Dependensi:** \`TASK-002\`
* **File:** Berkas sumber kode modul pertama & test terkait
* **Docs Terkait:** \`BLUEPRINT.md\`
* **Docs Impact:** \`BLUEPRINT\`
* **Acceptance Criteria:**
  1. Unit test modul lulus 100%.
  2. \`python3 scripts/zlce/zlce-check.py . --strict\` lulus 0 error.
* **Test Case:** \`module_one_happy_path\`
* **Metode Verifikasi:** Jalankan suite test lokal dan verifikasi \`zlce-check.py --strict\`.
`;
}

/**
 * Menghasilkan template awal BLUEPRINT.md untuk proyek baru/lanjutan/modifikasi.
 */
export function buildFreshBlueprintMarkdown(opts: FreshProjectStarterOptions): string {
  const name = (opts.projectName || 'Proyek Baru').trim();
  const stack = (opts.stack || 'React / TypeScript / Node.js').trim();
  const mode = opts.mode || 'LITE';
  const desc = (opts.description || 'Deskripsi singkat tujuan proyek dan ruang lingkup.').trim();

  return `# SPESIFIKASI TEKNIS & BLUEPRINT SISTEM (MODE ${mode}): ${name}

Dokumen kontrol Gerbang 1 untuk proyek **${name}** (${getWorkflowLabel(opts.workflow)}). Diperbarui setiap kali task dengan \`Docs Impact: BLUEPRINT\` diselesaikan.

---

## 1. PARAMETER SISTEM & LINGKUNGAN

* **Nama Sistem:** ${name}
* **MODE:** \`${mode}\`
* **Skenario Kerja:** ${getWorkflowLabel(opts.workflow)}
* **Stack Target:** ${stack}
* **Ringkasan Proyek:** ${desc}
* **Standar Keamanan:**
  - Validasi ketat seluruh input pengguna dan sanitasi output.
  - Zero-Secret Policy: rahasia hanya melalui \`.env\` / secret manager; dilarang commit kredensial ke Git.

---

## 2. BATASAN DOMAIN BISNIS

1. **Aturan Bisnis (BR-xx):**
   - \`BR-01\`: [Tetapkan aturan bisnis utama pertama]
   - \`BR-02\`: [Tetapkan aturan bisnis utama kedua]
2. **Out of Scope:**
   - [Daftar fitur yang secara eksplisit tidak termasuk pada rilis saat ini]

---

## 3. MATRIKS MODUL

| ID Modul | Nama Modul | Fungsi Utama | Dependensi |
| :--- | :--- | :--- | :--- |
| \`MOD-01\` | Core & Konfigurasi | Inisialisasi environment & utilitas dasar | Runtime |
| \`MOD-02\` | Layanan / Logika Inti | Logika bisnis utama aplikasi | \`MOD-01\` |
| \`MOD-03\` | Antarmuka / API | Titik masuk pengguna atau endpoint | \`MOD-02\` |

---

## 4. INTEGRASI EKSTERNAL

* [Daftar layanan/API eksternal atau tulis \`-\` bila mandiri]

---

## 5. NFR (NON-FUNCTIONAL REQUIREMENTS)

1. Performa & keandalan operasional terukur.
2. Kepatuhan penuh Zero-Loss Context Engineering (\`SESSION_STATE.md\` + \`zlce-check.py --strict\`).

---

## 6. ASUMSI & PERTANYAAN TERBUKA AWAL

Lihat daftar aktif di \`SESSION_STATE.md\` Bagian 4 (\`ASM-xx\` / \`Q-xx\`).

${mode === 'LITE' ? `---

## 7. MODEL DATA RINGKAS (MODE LITE)

* **Entitas Utama:** \`[nama_entitas]\` (\`id\`, \`[atribut_inti]\`, \`status\`, \`created_at\`, \`updated_at\`)

---

## 8. STRATEGI UJI (MODE LITE)

* **Tipe Uji:** Unit test + smoke integration test.
* **Perintah Verifikasi:** \`[perintah test proyek]\` & \`python3 scripts/zlce/zlce-check.py . --strict\`
` : ''}
`;
}

/**
 * Menghasilkan perintah Termux aman (POSIX quoted) untuk menyiapkan folder proyek & mengekstrak starter kit.
 */
export function buildTermuxInitCommand(opts: {
  termuxPath: string;
  branch?: string;
  workflow?: ProjectWorkflowMode;
}): string {
  const rawPath = (opts.termuxPath || '~/projects/proyek-baru').trim();
  const safePathArg = rawPath.startsWith('~/')
    ? `"$HOME/${rawPath.slice(2).replace(/(["$`\\])/g, '\\$1')}"`
    : shellQuote(rawPath);
  const safeBranch = shellQuote((opts.branch || 'main').trim() || 'main');

  if (opts.workflow === 'MODIFY') {
    return [
      `cd ${safePathArg}`,
      `git fetch origin`,
      `git checkout -b task/TASK-REV-01 ${safeBranch} 2>/dev/null || git checkout ${safeBranch}`,
      `python3 scripts/zlce/zlce-check.py . --strict || python3 scripts/zlce-check.py . --strict`
    ].join(' && ');
  }

  if (opts.workflow === 'CONTINUE') {
    return [
      `mkdir -p ${safePathArg}`,
      `cd ${safePathArg}`,
      `[ -f SESSION_STATE.md ] || unzip -n ~/storage/downloads/zlce-starter-kit-v4.1.0.zip -d /tmp/zlce-kit && [ -f SESSION_STATE.md ] || cp -rn /tmp/zlce-kit/zlce-starter-kit/* .`,
      `python3 scripts/zlce-check.py . --strict --no-git || python3 scripts/zlce/zlce-check.py . --strict --no-git`
    ].join(' && ');
  }

  return [
    `mkdir -p ${safePathArg}`,
    `cd ${safePathArg}`,
    `git init -b ${safeBranch}`,
    `unzip -o ~/storage/downloads/zlce-starter-kit-v4.1.0.zip -d /tmp/zlce-kit && cp -r /tmp/zlce-kit/zlce-starter-kit/. .`,
    `python3 scripts/zlce-check.py . --strict --no-git`
  ].join(' && ');
}
