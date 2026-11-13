/**
 * TC-P17-02: UI Polishing, Tailwind CSS Hygiene & Reduced Motion Audit (TASK-108)
 * Verifies 0 invalid Tailwind CSS classes (px-0.2, py-0.2),
 * operational jargon clarity in navigation badges,
 * @media (prefers-reduced-motion: reduce) in index.css,
 * and touch-accessible Undo/Redo controls in Header.tsx.
 */

import * as fs from 'fs';
import * as path from 'path';

function runUiPolishingTests() {
  console.log('--- TC-P17-02: UI Polishing, Tailwind Hygiene & Reduced Motion ---');
  let passed = 0;
  const rootDir = process.cwd();

  // 1. Verifikasi 0 kelas CSS Tailwind tidak valid (px-0.2, py-0.2) di seluruh direktori src/
  function scanDir(dir: string, regex: RegExp, matches: string[]) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'tests') {
          scanDir(fullPath, regex, matches);
        }
      } else if (/\.(tsx|ts|css|html)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (regex.test(content)) {
          matches.push(fullPath);
        }
      }
    }
  }

  const invalidClassMatches: string[] = [];
  scanDir(path.join(rootDir, 'src'), /\b(px-0\.2|py-0\.2)\b/, invalidClassMatches);

  if (invalidClassMatches.length === 0) {
    console.log('✓ Check 1: 0 kelas Tailwind tidak valid (px-0.2/py-0.2) tersisa di seluruh src/');
    passed++;
  } else {
    throw new Error(`Check 1 GAGAL: Ditemukan kelas tidak valid di: ${invalidClassMatches.join(', ')}`);
  }

  // 2. Verifikasi Keberadaan @media (prefers-reduced-motion) di src/index.css
  const indexCssPath = path.join(rootDir, 'src/index.css');
  const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');

  if (
    indexCssContent.includes('@media (prefers-reduced-motion: reduce)') &&
    indexCssContent.includes('animation-duration: 0.01ms !important') &&
    indexCssContent.includes('transition-duration: 0.01ms !important')
  ) {
    console.log('✓ Check 2: Dukungan prefers-reduced-motion tervalidasi lengkap di src/index.css');
    passed++;
  } else {
    throw new Error('Check 2 GAGAL: index.css tidak memuat aturan prefers-reduced-motion yang tepat');
  }

  // 3. Verifikasi Kejelasan Jargon & Navigasi 6 Tab Kanonik Bersih pada Header.tsx (FASE 19)
  const headerPath = path.join(rootDir, 'src/components/Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  const diagnosticsContent = fs.readFileSync(path.join(rootDir, 'src/components/DiagnosticsTab.tsx'), 'utf8');

  const hasCleanTabs =
    headerContent.includes('Dashboard') &&
    headerContent.includes('SESSION_STATE') &&
    headerContent.includes('AI Workbench') &&
    headerContent.includes('Terminal &amp; Git') &&
    headerContent.includes('Diagnostik &amp; Kualitas') &&
    headerContent.includes('Dokumentasi &amp; Panduan');
  const hasNoOldJargon = !headerContent.includes('Prompt Studio I1') && !headerContent.includes('Fix X1');

  if (hasCleanTabs && hasNoOldJargon) {
    console.log('✓ Check 3: Header menggunakan 6 tab kanonik bersih bebas jargon kriptik');
    passed++;
  } else {
    throw new Error('Check 3 GAGAL: Header.tsx belum memuat 6 tab kanonik bersih atau masih memuat jargon lama');
  }

  // 4. Verifikasi Tombol Sentuh Undo / Redo di Header.tsx (Min 44px)
  const hasUndoTouch = headerContent.includes('aria-label="Undo"') && 
                       headerContent.includes('touch-target-44 min-h-[44px] min-w-[44px]');
  const hasRedoTouch = headerContent.includes('aria-label="Redo"') && 
                       headerContent.includes('touch-target-44 min-h-[44px] min-w-[44px]');

  if (hasUndoTouch && hasRedoTouch) {
    console.log('✓ Check 4: Tombol Undo dan Redo sentuh ramah tablet (min 44px) terpasang di Header.tsx');
    passed++;
  } else {
    throw new Error('Check 4 GAGAL: Tombol Undo / Redo sentuh tidak ditemukan di Header.tsx');
  }

  // 5. Verifikasi Konsolidasi Navigasi Audit Performa di DiagnosticsTab & Header
  const hasDiagnosticsInHeader = headerContent.includes("'diagnostics'");
  const hasPerformanceAuditInDiagnostics = diagnosticsContent.includes('PerformanceAuditTab') &&
                                           diagnosticsContent.includes('Audit Performa PWA');
  if (hasDiagnosticsInHeader && hasPerformanceAuditInDiagnostics) {
    console.log('✓ Check 5: Audit Performa PWA terkonsolidasi rapi di bawah tab Diagnostik & Kualitas');
    passed++;
  } else {
    throw new Error('Check 5 GAGAL: Audit Performa PWA belum terintegrasi di DiagnosticsTab / Header');
  }

  console.log(`\nTC-P17-02: ${passed}/5 checks PASS (100% OK)`);
}

runUiPolishingTests();
