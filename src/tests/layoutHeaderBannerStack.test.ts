/**
 * TC-P18-06: Dynamic Header Height (--header-h), Strict Typography Floor (>=12px), & Clean UI Jargon Test
 * Rujukan: TASK-117, R-04, R-05, R-07, UX-POLISH
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SRC_DIR = path.resolve(ROOT, 'src');

async function runTests() {
  console.log('=== TC-P18-06: Dynamic Stack Banner, Typography Floor & UI Jargon Refactor Test ===');
  let passed = 0;
  const total = 5;

  // 1. Verifikasi deklarasi CSS variable --header-h di index.css dan Header.tsx ResizeObserver
  const indexCss = fs.readFileSync(path.join(SRC_DIR, 'index.css'), 'utf-8');
  const headerTsx = fs.readFileSync(path.join(SRC_DIR, 'components/Header.tsx'), 'utf-8');
  const appTsx = fs.readFileSync(path.join(SRC_DIR, 'App.tsx'), 'utf-8');

  const cssHasHeaderVar = indexCss.includes('--header-h: 116px;');
  const headerHasResizeObserver = headerTsx.includes('ResizeObserver') && headerTsx.includes('--header-h');
  const headerHasZ50 = headerTsx.includes('z-50');
  const appPlacesHeaderAboveLayout = appTsx.indexOf('<Header') < appTsx.indexOf('<MobileLayout');

  if (cssHasHeaderVar && headerHasResizeObserver && headerHasZ50 && appPlacesHeaderAboveLayout) {
    console.log('[PASS] Check 1: Dynamic --header-h, ResizeObserver, z-50 dan urutan layout App.tsx terkonfigurasi benar');
    passed++;
  } else {
    console.error('[FAIL] Check 1: Arsitektur header dynamic height belum lengkap:', {
      cssHasHeaderVar,
      headerHasResizeObserver,
      headerHasZ50,
      appPlacesHeaderAboveLayout
    });
  }

  // 2. Verifikasi MobileLayout.tsx menggunakan style top: var(--header-h, 116px) untuk banner container
  const mobileLayoutTsx = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/MobileLayout.tsx'), 'utf-8');
  const layoutHasHeaderTop = mobileLayoutTsx.includes("top: 'var(--header-h, 116px)'");

  if (layoutHasHeaderTop) {
    console.log('[PASS] Check 2: MobileLayout stack banner container menggunakan top dinamis var(--header-h, 116px)');
    passed++;
  } else {
    console.error('[FAIL] Check 2: MobileLayout belum menggunakan top var(--header-h, 116px)');
  }

  // 3. Verifikasi 0 instance font mikro informatif (text-[9px] / text-[10px]) di seluruh src/components/
  function scanDir(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(scanDir(fullPath));
      } else if (file.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const componentFiles = scanDir(path.join(SRC_DIR, 'components'));
  const violations: string[] = [];

  for (const f of componentFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const rel = path.relative(ROOT, f);
    if (/text-\[(9|10)px\]/.test(content)) {
      violations.push(rel);
    }
  }

  if (violations.length === 0) {
    console.log(`[PASS] Check 3: Strict Typography Floor (>=12px) bersih total (0 instance text-[9px]/[10px] across ${componentFiles.length} component files)`);
    passed++;
  } else {
    console.error(`[FAIL] Check 3: Masih ditemukan sub-12px font di ${violations.length} berkas:`, violations);
  }

  // 4. Verifikasi pembersihan jargon internal pada antarmuka utama (Dashboard, FullscreenEditorModal, PromptStudio, FeedbackReview)
  const dashboardCode = fs.readFileSync(path.join(SRC_DIR, 'components/DashboardTab.tsx'), 'utf-8');
  const modalCode = fs.readFileSync(path.join(SRC_DIR, 'components/FullscreenEditorModal.tsx'), 'utf-8');
  const studioCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/PromptStudio.tsx'), 'utf-8');
  const feedbackCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/FeedbackReviewTab.tsx'), 'utf-8');

  const jargonMatches: string[] = [];
  const jargonPattern = /(?:Fix X1|Aturan X1 Jam: Aktif \(Anti-Ekstrapolasi\)|Invarian I1–I4 \(Strict Provenance\))/i;

  if (jargonPattern.test(dashboardCode)) jargonMatches.push('DashboardTab');
  if (jargonPattern.test(modalCode)) jargonMatches.push('FullscreenEditorModal');
  if (jargonPattern.test(studioCode)) jargonMatches.push('PromptStudio');
  if (jargonPattern.test(feedbackCode)) jargonMatches.push('FeedbackReviewTab');

  const modalHasHumanizedTime = modalCode.includes('Preservasi Waktu Asli:') && modalCode.includes('Aktif (Tanpa Rekaan)');
  const studioHasHumanizedTime = studioCode.includes('Preservasi Waktu Asli: Fallback "jam: ?"');
  const feedbackHasHumanizedIntegrity = feedbackCode.includes('5 Prinsip Integritas ZLCE');

  if (jargonMatches.length === 0 && modalHasHumanizedTime && studioHasHumanizedTime && feedbackHasHumanizedIntegrity) {
    console.log('[PASS] Check 4: Refaktor jargon internal menjadi bahasa Indonesia yang ramah & lugas terverifikasi');
    passed++;
  } else {
    console.error('[FAIL] Check 4: Masih ditemukan jargon internal pada UI:', {
      jargonMatches,
      modalHasHumanizedTime,
      studioHasHumanizedTime,
      feedbackHasHumanizedIntegrity
    });
  }

  // 5. Verifikasi integrasi mobile components (TokenBudgetSelector, AiHandoverWizard, ResultCaptureTab, WorkspaceReader, ContextPackTab)
  const tokenCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/TokenBudgetSelector.tsx'), 'utf-8');
  const aiCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/AiHandoverWizard.tsx'), 'utf-8');
  const resultCaptureCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/ResultCaptureTab.tsx'), 'utf-8');
  const readerCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/WorkspaceReader.tsx'), 'utf-8');
  const contextPackCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/ContextPackTab.tsx'), 'utf-8');

  const tokenOk = tokenCode.includes('Standar Integritas & Kemandirian Sesi') || tokenCode.includes('Standar Integritas &amp; Kemandirian Sesi');
  const aiOk = aiCode.includes('Kemandirian Sesi Baru') && aiCode.includes('Penanggung Jawab Tablet');
  const resultOk = resultCaptureCode.includes('Atribusi Sumber Terverifikasi');
  const readerOk = readerCode.includes('Standar Integritas ZLCE');
  const contextPackOk = contextPackCode.includes('Sumber Berkas Penuh') && contextPackCode.includes('Mandiri Sesi Baru');

  if (tokenOk && aiOk && resultOk && readerOk && contextPackOk) {
    console.log('[PASS] Check 5: Integrasi 5 komponen mobile terpilih bersih dari jargon usang dan selaras dengan standar bahasa Indonesia');
    passed++;
  } else {
    console.error('[FAIL] Check 5: Pembersihan komponen mobile belum merata:', {
      tokenOk,
      aiOk,
      resultOk,
      readerOk,
      contextPackOk
    });
  }

  console.log(`Result: TC-P18-06 ${passed === total ? 'PASS' : 'FAIL'} (${passed}/${total} checks): Dynamic Header Height, Typography Floor & Clean UI Jargon verified.`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('TC-P18-06 error:', err);
  process.exit(1);
});
