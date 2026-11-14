import { TemplateItem } from '../types/zlce';

// Canonical raw imports from templates/ directory (Single Source of Truth)
import sessionStateTemplate from '../../templates/SESSION_STATE.template.md?raw';
import blueprintTemplate from '../../templates/BLUEPRINT.template.md?raw';
import tasksTemplate from '../../templates/TASKS.template.md?raw';
import aiWorkflowTemplate from '../../templates/AI_WORKFLOW.template.md?raw';
import architectureTemplate from '../../templates/ARCHITECTURE.template.md?raw';
import dataModelTemplate from '../../templates/DATA_MODEL.template.md?raw';
import testingTemplate from '../../templates/TESTING.template.md?raw';
import checklistsTemplate from '../../templates/CHECKLISTS.template.md?raw';
import changelogTemplate from '../../templates/CHANGELOG.template.md?raw';
import domainBookingProfile from '../../templates/profiles/DOMAIN_BOOKING.profile.md?raw';
import sessionStateExample from '../../examples/SESSION_STATE.example.md?raw';
import tasksExample from '../../examples/TASKS.example.md?raw';
import aiWorkflowExample from '../../examples/AI_WORKFLOW.example.md?raw';
import blueprintExample from '../../examples/BLUEPRINT.example.md?raw';

// Live current active project & canonical docs imports
import currentProjectSessionState from '../../SESSION_STATE.md?raw';
import currentProjectTasks from '../../TASKS.md?raw';
import canonicalUsageGuide from '../../docs/USAGE.md?raw';

// Standalone Android, Mobile & Blueprint Suite imports (Pilar 1, 2, 3)
import installationAndroidGuide from '../../docs/mobile/INSTALLATION_ANDROID.md?raw';
import usageMobileGuide from '../../docs/mobile/USAGE_MOBILE.md?raw';
import mobileBlueprintIndex from '../../docs/mobile/MOBILE_BLUEPRINT.md?raw';
import installationGuide from '../../docs/mobile/INSTALLATION.md?raw';
import termuxSetupGuide from '../../docs/mobile/TERMUX_SETUP.md?raw';
import userGuideDoc from '../../docs/mobile/USER_GUIDE.md?raw';
import productionOperationsGuide from '../../docs/mobile/PRODUCTION_OPERATIONS.md?raw';
import troubleshootingGuide from '../../docs/mobile/TROUBLESHOOTING.md?raw';
import landingPromptDoc from '../../LANDING_PROMPT.md?raw';
import handoverPromptDoc from '../../HANDOVER_PROMPT.md?raw';
import aiWorkflowDoc from '../../AI_WORKFLOW.md?raw';
import starterBlueprintLite from '../../zlce-starter-kit/BLUEPRINT.md?raw';
import starterTasksLite from '../../zlce-starter-kit/TASKS.md?raw';
import starterSessionStateLite from '../../zlce-starter-kit/SESSION_STATE.md?raw';
import starterHandoverLite from '../../zlce-starter-kit/HANDOVER.md?raw';

export const CURRENT_PROJECT_SESSION_STATE_MD = currentProjectSessionState;
export const CURRENT_PROJECT_TASKS_MD = currentProjectTasks;
export const CANONICAL_USAGE_GUIDE_MD = canonicalUsageGuide;
export const INSTALLATION_ANDROID_MD = installationAndroidGuide;
export const USAGE_MOBILE_MD = usageMobileGuide;
export const MOBILE_BLUEPRINT_MD = mobileBlueprintIndex;
export const INSTALLATION_MD = installationGuide;
export const TERMUX_SETUP_MD = termuxSetupGuide;
export const USER_GUIDE_MD = userGuideDoc;
export const PRODUCTION_OPERATIONS_MD = productionOperationsGuide;
export const TROUBLESHOOTING_MD = troubleshootingGuide;
export const LANDING_PROMPT_MD = landingPromptDoc;
export const HANDOVER_PROMPT_MD = handoverPromptDoc;
export const AI_WORKFLOW_MD = aiWorkflowDoc;
export const STARTER_BLUEPRINT_LITE_MD = starterBlueprintLite;
export const STARTER_TASKS_LITE_MD = starterTasksLite;
export const STARTER_SESSION_STATE_LITE_MD = starterSessionStateLite;
export const STARTER_HANDOVER_LITE_MD = starterHandoverLite;

export const ZLCE_TEMPLATES: TemplateItem[] = [
  {
    id: 'session-state',
    title: 'SESSION_STATE.md (Single Source of Truth)',
    filename: 'SESSION_STATE.md',
    category: 'state',
    description: 'Sumber kebenaran tunggal status task, catatan serah terima, WAL checkpoint, dan audit state.',
    content: sessionStateTemplate
  },
  {
    id: 'blueprint',
    title: 'BLUEPRINT.md (Gerbang 1)',
    filename: 'BLUEPRINT.md',
    category: 'spec',
    description: 'Visi produk, batasan teknis (non-goals), acceptance criteria, dan daftar modul.',
    content: blueprintTemplate
  },
  {
    id: 'tasks',
    title: 'TASKS.md (Daftar Tugas Atomik)',
    filename: 'TASKS.md',
    category: 'workflow',
    description: 'Daftar seluruh task terstruktur (TASK-001, TASK-002, dst.) dengan dependensi dan kriteria verifikasi.',
    content: tasksTemplate
  },
  {
    id: 'ai-workflow',
    title: 'AI_WORKFLOW.md (Aturan Eksekusi Agen)',
    filename: 'AI_WORKFLOW.md',
    category: 'workflow',
    description: 'Instruksi sistem interaksi AI, protokol commit Git, format Checkpoint Block, dan aturan WAL.',
    content: aiWorkflowTemplate
  },
  {
    id: 'architecture',
    title: 'ARCHITECTURE.md (Arsitektur Sistem)',
    filename: 'ARCHITECTURE.md',
    category: 'spec',
    description: 'Struktur modul, diagram relasi, batasan lapisan, dan keputusan arsitektural (ADR).',
    content: architectureTemplate
  },
  {
    id: 'data-model',
    title: 'DATA_MODEL.md (Skema & Migrasi DB)',
    filename: 'DATA_MODEL.md',
    category: 'spec',
    description: 'Skema tabel, relasi entitas, indeks, dan strategi migrasi database.',
    content: dataModelTemplate
  },
  {
    id: 'testing',
    title: 'TESTING.md (Spesifikasi Pengujian)',
    filename: 'TESTING.md',
    category: 'workflow',
    description: 'Strategi pengujian, test matrix per task, dan ambang batas kelulusan verifikasi.',
    content: testingTemplate
  },
  {
    id: 'checklists',
    title: 'CHECKLISTS.md (Daftar Periksa Kualitas)',
    filename: 'CHECKLISTS.md',
    category: 'workflow',
    description: 'Pre-merge checklist, security checklist, dan deployment release gates.',
    content: checklistsTemplate
  },
  {
    id: 'changelog',
    title: 'CHANGELOG.md (Catatan Perubahan SemVer)',
    filename: 'CHANGELOG.md',
    category: 'workflow',
    description: 'Catatan rilis versi terstruktur mengikuti kaidah Semantic Versioning.',
    content: changelogTemplate
  },
  {
    id: 'domain-booking',
    title: 'DOMAIN_BOOKING.profile.md (Profil Reservasi)',
    filename: 'DOMAIN_BOOKING.profile.md',
    category: 'profile',
    description: 'Profil domain spesifik untuk reservasi rental, booking harian, dan ketersediaan unit.',
    content: domainBookingProfile
  },
  {
    id: 'example-session-state',
    title: 'SESSION_STATE.example.md (Contoh Terisi)',
    filename: 'SESSION_STATE.example.md',
    category: 'example',
    description: 'Contoh nyata status sesi Todo API (FastAPI / SQLite / pytest, WAL, Matriks Task, Asumsi).',
    content: sessionStateExample
  },
  {
    id: 'example-tasks',
    title: 'TASKS.example.md (Contoh Backlog Atomik)',
    filename: 'TASKS.example.md',
    category: 'example',
    description: 'Contoh nyata backlog tugas atomik terstruktur (TASK-001 s/d TASK-005) dengan kriteria uji.',
    content: tasksExample
  },
  {
    id: 'example-ai-workflow',
    title: 'AI_WORKFLOW.example.md (Contoh Tata Kelola AI)',
    filename: 'AI_WORKFLOW.example.md',
    category: 'example',
    description: 'Contoh aturan kerja AI, enum tunggal, checkpoint format, dan Aturan X1 Jam.',
    content: aiWorkflowExample
  },
  {
    id: 'example-blueprint',
    title: 'BLUEPRINT.example.md (Contoh Spesifikasi Gerbang 1)',
    filename: 'BLUEPRINT.example.md',
    category: 'example',
    description: 'Contoh spesifikasi teknis, non-goals, matriks modul, dan standar keamanan sistem.',
    content: blueprintExample
  },
  {
    id: 'current-project-session-state',
    title: 'SESSION_STATE.md (Proyek Aktif: ZLCE Mobile Workbench v4.1.0 GA)',
    filename: 'SESSION_STATE.md',
    category: 'state',
    description: 'Status sesi baseline terkunci ZLCE Mobile Workbench v4.1.0 GA / ZLCEv4.1Mob (siap dipakai di proyek baru, lanjutan, atau modifikasi).',
    content: currentProjectSessionState
  },
  {
    id: 'current-project-tasks',
    title: 'TASKS.md (Baseline Terkunci ZLCEv4.1Mob)',
    filename: 'TASKS.md',
    category: 'workflow',
    description: 'Baseline task operasional terkunci v4.1.0 GA untuk verifikasi PWA, keamanan Zero-Secret, dan integritas repositori.',
    content: currentProjectTasks
  },
  {
    id: 'canonical-usage-guide',
    title: 'USAGE.md (Panduan Pemakaian Lengkap ZLCE)',
    filename: 'USAGE.md',
    category: 'spec',
    description: 'Dokumen kanonik panduan pemakaian metodologi ZLCE: Matriks situasi, 3 jalur alur kerja, Kasus A–D, dan Triase R1–R7.',
    content: canonicalUsageGuide
  },
  {
    id: 'installation-android',
    title: 'INSTALLATION_ANDROID.md (Tutorial Instalasi Android Terurut)',
    filename: 'INSTALLATION_ANDROID.md',
    category: 'install',
    description: 'Panduan langkah-demi-langkah berurutan dari Termux hingga PWA standalone di tablet/HP Android.',
    content: installationAndroidGuide
  },
  {
    id: 'usage-mobile',
    title: 'USAGE_MOBILE.md (Tutorial Pemakaian ZLCE Mobile)',
    filename: 'USAGE_MOBILE.md',
    category: 'usage',
    description: 'Tutorial pemakaian operasional harian 10 langkah bagi tim estafet di tablet bersama Samsung A7 Lite.',
    content: usageMobileGuide
  },
  {
    id: 'mobile-blueprint',
    title: 'MOBILE_BLUEPRINT.md (Indeks Cetak Biru Arsitektur Mobile)',
    filename: 'MOBILE_BLUEPRINT.md',
    category: 'blueprint',
    description: 'Ringkasan eksekutif arsitektur mobile, 14 cetak biru, 9 ADR, model memori LMK RPO <= 400ms, dan baseline rilis v4.1.0 GA terkunci.',
    content: mobileBlueprintIndex
  },
  {
    id: 'termux-setup',
    title: 'TERMUX_SETUP.md (Contekan Lingkungan Termux)',
    filename: 'TERMUX_SETUP.md',
    category: 'install',
    description: 'Contekan pengaturan ~/.bashrc, alias shortcut (cdp, zcheck), editor sentuh micro, dan zero-daemon.',
    content: termuxSetupGuide
  },
  {
    id: 'production-operations',
    title: 'PRODUCTION_OPERATIONS.md (Operasi Produksi Nyata)',
    filename: 'PRODUCTION_OPERATIONS.md',
    category: 'usage',
    description: 'Manual operasional tablet lapangan, peluncuran 1-ketuk, mitigasi Android Low Memory Killer (RAM 3GB).',
    content: productionOperationsGuide
  },
  {
    id: 'troubleshooting',
    title: 'TROUBLESHOOTING.md (Matriks Pemecahan Masalah & Kasus A-D)',
    filename: 'TROUBLESHOOTING.md',
    category: 'usage',
    description: 'Penanganan insiden, pemulihan crash sesi, resolusi konflik Git, dan penyelamatan darurat.',
    content: troubleshootingGuide
  }
];

// Initial prefilled session state for the workspace (Current running project: ZLCE Mobile Workbench v4.1.0 GA / ZLCEv4.1Mob)
export const INITIAL_SESSION_STATE_MD = currentProjectSessionState;
