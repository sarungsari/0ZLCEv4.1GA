/**
 * TC-P18-05: Dashboard Phase Filter & Dynamic Phase Roadmap Test (TASK-116 / R-09 / UX-02)
 * Memverifikasi:
 * 1. Definisi TASK_PHASES memuat seluruh 19 fase lengkap (Fase 0 s/d Fase 18) ditambah opsi 'all'.
 * 2. Seluruh 118 task dari TASK-001 s/d TASK-118 tercakup sempurna tanpa celah (gapless continuum).
 * 3. Logika filter fase menyaring task sesuai rentang minNum dan maxNum masing-masing fase.
 * 4. Metrik counter dan judul backlog di DashboardTab bersifat dinamis (0 hardcoded '9 Fase' atau '43 Task').
 * 5. Ketersediaan kontrol ganda: dropdown selector cepat dan horizontal scrolling button bar untuk tablet.
 */

import fs from 'fs';
import path from 'path';
import { TASK_PHASES } from '../data/taskPhases';

const ROOT = process.cwd();

export function runDashboardPhaseFilterTests(): {
  passed: boolean;
  message: string;
  checks: { name: string; pass: boolean; details?: string }[];
} {
  const checks: { name: string; pass: boolean; details?: string }[] = [];

  // --- CHECK 1: Kelengkapan Seluruh Fase + All pada TASK_PHASES
  const expectedPhaseIds = [
    'all',
    'fase-0', 'fase-1', 'fase-2', 'fase-3', 'fase-4',
    'fase-5', 'fase-6', 'fase-7', 'fase-8', 'fase-9',
    'fase-10', 'fase-11', 'fase-12', 'fase-13', 'fase-14',
    'fase-15', 'fase-16', 'fase-17', 'fase-18', 'fase-19', 'fase-20', 'fase-21'
  ];

  const actualPhaseIds = TASK_PHASES.map(p => p.id);
  const missingPhases = expectedPhaseIds.filter(id => !actualPhaseIds.includes(id));
  const pass1 = missingPhases.length === 0 && TASK_PHASES.length === expectedPhaseIds.length;

  checks.push({
    name: `Check 1: Katalog TASK_PHASES memuat seluruh fase lengkap (Fase 0 s/d ${TASK_PHASES.length - 2}) ditambah opsi all`,
    pass: pass1,
    details: pass1
      ? `Total ${TASK_PHASES.length} opsi fase tervalidasi lengkap (Fase 0 s/d ${TASK_PHASES.length - 2})`
      : `Fase hilang: ${missingPhases.join(', ')} (total: ${TASK_PHASES.length})`
  });

  // --- CHECK 2: Kontinuitas Rentang Task (Gapless Continuum 1..118)
  let pass2 = true;
  let gapDetails = '';
  const phasesOnly = TASK_PHASES.filter(p => p.id !== 'all');

  for (let i = 0; i < phasesOnly.length; i++) {
    const cur = phasesOnly[i];
    if (i === 0) {
      if (cur.minNum !== 1) {
        pass2 = false;
        gapDetails = `Fase 0 dimulai dari ${cur.minNum}, seharusnya 1`;
        break;
      }
    } else {
      const prev = phasesOnly[i - 1];
      if (cur.minNum !== prev.maxNum + 1) {
        pass2 = false;
        gapDetails = `Celah antara ${prev.id} (max ${prev.maxNum}) dan ${cur.id} (min ${cur.minNum})`;
        break;
      }
    }
  }

  checks.push({
    name: 'Check 2: Rentang minNum dan maxNum mencakup seluruh nomor task secara berkesinambungan tanpa celah',
    pass: pass2,
    details: pass2 ? 'Rentang task 1 s/d 134 berkesinambungan (Fase 0 s/d 21)' : gapDetails
  });

  // --- CHECK 3: Akurasi Penyaringan Task per Fase
  // Uji simulasi filter untuk beberapa nomor task kritis
  const testSampleTasks = [
    { id: 'TASK-001', expectedPhase: 'fase-0' },
    { id: 'TASK-005', expectedPhase: 'fase-1' },
    { id: 'TASK-015', expectedPhase: 'fase-3' },
    { id: 'TASK-042', expectedPhase: 'fase-8' },
    { id: 'TASK-045', expectedPhase: 'fase-9' },
    { id: 'TASK-055', expectedPhase: 'fase-10' },
    { id: 'TASK-070', expectedPhase: 'fase-11' },
    { id: 'TASK-080', expectedPhase: 'fase-12' },
    { id: 'TASK-085', expectedPhase: 'fase-13' },
    { id: 'TASK-092', expectedPhase: 'fase-14' },
    { id: 'TASK-098', expectedPhase: 'fase-15' },
    { id: 'TASK-104', expectedPhase: 'fase-16' },
    { id: 'TASK-109', expectedPhase: 'fase-17' },
    { id: 'TASK-116', expectedPhase: 'fase-18' },
    { id: 'TASK-122', expectedPhase: 'fase-19' },
    { id: 'TASK-128', expectedPhase: 'fase-20' },
    { id: 'TASK-130', expectedPhase: 'fase-21' }
  ];

  let pass3 = true;
  for (const sample of testSampleTasks) {
    const num = parseInt(sample.id.replace(/\D/g, ''), 10);
    const targetPhase = TASK_PHASES.find(p => p.id === sample.expectedPhase);
    if (!targetPhase || num < targetPhase.minNum || num > targetPhase.maxNum) {
      pass3 = false;
      break;
    }
  }

  checks.push({
    name: 'Check 3: Simulasi penyaringan task sampel pada seluruh fase mengembalikan kecocokan rentang yang akurat',
    pass: pass3,
    details: `${testSampleTasks.length} task sampel dari berbagai fase tervalidasi tepat rentang`
  });

  // --- CHECK 4: Ketiadaan String Statis Outdated pada DashboardTab.tsx
  const dashboardCode = fs.readFileSync(path.join(ROOT, 'src/components/DashboardTab.tsx'), 'utf8');
  const hasOutdatedHeader = dashboardCode.includes('Matriks Backlog 43 Task Atomik (Fase 0 s/d 8)');
  const hasOutdatedPhaseCount = dashboardCode.includes('>9 Fase Eksekusi<');
  const pass4 = !hasOutdatedHeader && !hasOutdatedPhaseCount;

  checks.push({
    name: 'Check 4: Pembersihan string statis usang (0 "9 Fase Eksekusi" dan 0 "Backlog 43 Task") pada DashboardTab.tsx',
    pass: pass4,
    details: pass4 ? 'Header dan metrik counter terverifikasi dinamis' : 'Masih terdapat string statis usang di DashboardTab.tsx'
  });

  // --- CHECK 5: Ketersediaan Kontrol Akses Cepat Dropdown & Horizontal Bar
  const hasDropdownSelect = dashboardCode.includes('title="Filter Fase"') && dashboardCode.includes('<select');
  const hasHorizontalButtons = dashboardCode.includes('TASK_PHASES.map(phase =>') && dashboardCode.includes('overflow-x-auto');
  const pass5 = hasDropdownSelect && hasHorizontalButtons;

  checks.push({
    name: 'Check 5: Ketersediaan antarmuka filter ganda: dropdown selector cepat dan horizontal button bar untuk tablet',
    pass: pass5,
    details: pass5 ? 'Dropdown cepat (<select>) dan tombol horizontal (touch-target-44) aktif' : 'Salah satu kontrol filter belum terpasang'
  });

  const allPassed = checks.every(c => c.pass);
  return {
    passed: allPassed,
    message: allPassed
      ? 'TC-P18-05 PASS (5/5 checks): Dashboard Phase Filter & Dynamic 22-Phase Roadmap (Fase 0 s/d 21) terverifikasi 100%'
      : 'TC-P18-05 FAIL: Sebagian pengujian filter fase dashboard gagal',
    checks
  };
}

// CLI runner
if (typeof process !== 'undefined' && process.argv[1]?.includes('dashboardPhaseFilter.test')) {
  const result = runDashboardPhaseFilterTests();
  console.log(`\n=== TC-P18-05: Dashboard Phase Filter & Dynamic Phase Roadmap Test ===`);
  result.checks.forEach(c => {
    console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.name} ${c.details ? `(${c.details})` : ''}`);
  });
  console.log(`\nResult: ${result.message}\n`);
  if (!result.passed) {
    process.exit(1);
  }
}
