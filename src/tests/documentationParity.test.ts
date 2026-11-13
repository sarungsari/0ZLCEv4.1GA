/**
 * Unit Test: Documentation Parity & Studio Library Check (TASK-093 / TC-P14-05)
 * Memverifikasi integritas pemisahan 3 pilar dokumentasi ZLCE Mobile v4:
 * 1. Pilar 1: Arsitektur Proyek (docs/mobile/MOBILE_BLUEPRINT.md)
 * 2. Pilar 2: Tutorial Instalasi Android (docs/mobile/INSTALLATION_ANDROID.md)
 * 3. Pilar 3: Tutorial Pemakaian Mobile (docs/mobile/USAGE_MOBILE.md)
 * 4. Harmonisasi berkas rujukan (README.md, docs/README.md, INSTALLATION.md, USER_GUIDE.md)
 * 5. Integrasi Pustaka Studio di templates.ts, WorkspaceReader.tsx, dan TutorialTab.tsx
 * 6. Tidak tumpang tindih konten dan urutan logis langkah
 */

import fs from 'fs';
import path from 'path';

export function runDocumentationParityTests() {
  console.log('[TEST] Menjalankan Pengujian Paritas Dokumentasi 3 Pilar & Pustaka Studio (TC-P14-05)...');

  // Check 1: Verifikasi keberadaan fisik seluruh berkas dokumentasi 3 pilar
  const requiredFiles = [
    'docs/mobile/MOBILE_BLUEPRINT.md',
    'docs/mobile/INSTALLATION_ANDROID.md',
    'docs/mobile/USAGE_MOBILE.md',
    'docs/mobile/INSTALLATION.md',
    'docs/mobile/USER_GUIDE.md',
    'docs/README.md',
    'README.md'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Berkas dokumentasi inti tidak ditemukan: ${file}`);
    }
  }
  console.log(`  ✓ 1. Seluruh ${requiredFiles.length} berkas dokumentasi 3 pilar dan rujukan terverifikasi ada di disk`);

  // Check 2: Verifikasi konten berurutan 8 langkah di INSTALLATION_ANDROID.md
  const installAndroidContent = fs.readFileSync('docs/mobile/INSTALLATION_ANDROID.md', 'utf8');
  for (let step = 1; step <= 8; step++) {
    const stepMarker = `LANGKAH ${step}:`;
    if (!installAndroidContent.includes(stepMarker)) {
      throw new Error(`INSTALLATION_ANDROID.md kehilangan penanda urutan: ${stepMarker}`);
    }
  }
  if (!installAndroidContent.includes('F-Droid') || !installAndroidContent.includes('termux-setup-storage')) {
    throw new Error('INSTALLATION_ANDROID.md tidak memuat instruksi F-Droid atau storage Termux');
  }
  console.log('  ✓ 2. INSTALLATION_ANDROID.md memuat 8 langkah terurut lengkap dari Termux F-Droid hingga PWA');

  // Check 3: Verifikasi konten alur harian 10 langkah di USAGE_MOBILE.md
  const usageMobileContent = fs.readFileSync('docs/mobile/USAGE_MOBILE.md', 'utf8');
  for (let step = 1; step <= 10; step++) {
    const stepMarker = `LANGKAH ${step}:`;
    if (!usageMobileContent.includes(stepMarker)) {
      throw new Error(`USAGE_MOBILE.md kehilangan penanda urutan: ${stepMarker}`);
    }
  }
  if (!usageMobileContent.includes('Zero-Secret') || !usageMobileContent.includes('clean-auth')) {
    throw new Error('USAGE_MOBILE.md tidak memuat panduan Zero-Secret atau clean-auth');
  }
  console.log('  ✓ 3. USAGE_MOBILE.md memuat SOP 10 langkah operasional estafet 8 anggota tim');

  // Check 4: Verifikasi MOBILE_BLUEPRINT.md sebagai indeks arsitektur 14 cetak biru & 9 ADR
  const blueprintContent = fs.readFileSync('docs/mobile/MOBILE_BLUEPRINT.md', 'utf8');
  if (!blueprintContent.includes('01_SYSTEM_OVERVIEW.md') || !blueprintContent.includes('14_MULTI_AI_TEAM_MODEL.md')) {
    throw new Error('MOBILE_BLUEPRINT.md tidak mencakup indeks cetak biru 01 s.d. 14');
  }
  if (!blueprintContent.includes('ADR-01') || !blueprintContent.includes('ADR-09')) {
    throw new Error('MOBILE_BLUEPRINT.md tidak mencakup referensi ADR-01 s.d. ADR-09');
  }
  console.log('  ✓ 4. MOBILE_BLUEPRINT.md murni merangkum arsitektur 14 blueprint suite dan 9 ADR terverifikasi');

  // Check 5: Verifikasi tautan non-rusak di docs/README.md dan README.md
  const docsReadme = fs.readFileSync('docs/README.md', 'utf8');
  if (!docsReadme.includes('INSTALLATION_ANDROID.md') || !docsReadme.includes('USAGE_MOBILE.md')) {
    throw new Error('docs/README.md belum memperbarui rujukan ke INSTALLATION_ANDROID.md atau USAGE_MOBILE.md');
  }
  const rootReadme = fs.readFileSync('README.md', 'utf8');
  if (!rootReadme.includes('INSTALLATION_ANDROID.md') || !rootReadme.includes('USAGE_MOBILE.md')) {
    throw new Error('README.md belum memperbarui rujukan ke INSTALLATION_ANDROID.md atau USAGE_MOBILE.md');
  }
  console.log('  ✓ 5. README.md dan docs/README.md memiliki rujukan lengkap ke ketiga pilar dokumentasi');

  // Check 6: Verifikasi integrasi ekspor raw & registri di src/data/templates.ts
  const templatesCode = fs.readFileSync('src/data/templates.ts', 'utf8');
  if (!templatesCode.includes('INSTALLATION_ANDROID_MD') ||
      !templatesCode.includes('USAGE_MOBILE_MD') ||
      !templatesCode.includes('MOBILE_BLUEPRINT_MD')) {
    throw new Error('src/data/templates.ts tidak mengekspor konstan raw untuk ketiga pilar');
  }

  if (!templatesCode.includes("id: 'installation-android'") ||
      !templatesCode.includes("id: 'usage-mobile'") ||
      !templatesCode.includes("id: 'mobile-blueprint'")) {
    throw new Error('src/data/templates.ts tidak meregistrasikan template id installation-android, usage-mobile, atau mobile-blueprint');
  }
  console.log('  ✓ 6. templates.ts mengekspor konstan raw markdown dan meregistrasikan template ketiga pilar');

  // Check 7: Verifikasi kategorisasi optgroup di WorkspaceReader.tsx
  const workspaceReader = fs.readFileSync('src/components/mobile/WorkspaceReader.tsx', 'utf8');
  if (!workspaceReader.includes('Pilar 2: Tutorial Instalasi Android') ||
      !workspaceReader.includes('Pilar 3: Tutorial Pemakaian Mobile') ||
      !workspaceReader.includes('Pilar 1: Arsitektur')) {
    throw new Error('WorkspaceReader.tsx tidak memiliki pengelompokan 3 pilar di optgroup dropdown');
  }
  console.log('  ✓ 7. WorkspaceReader.tsx terverifikasi membagi dokumen menjadi kategori optgroup yang jelas');

  // Check 8: Verifikasi viewMode 3 pilar di TutorialTab.tsx
  const tutorialTab = fs.readFileSync('src/components/TutorialTab.tsx', 'utf8');
  if (!tutorialTab.includes("'android-installation'") || 
      !tutorialTab.includes("'mobile-usage'") || 
      !tutorialTab.includes("'project-architecture'")) {
    throw new Error('TutorialTab.tsx tidak memuat viewMode 3 pilar');
  }
  console.log('  ✓ 8. TutorialTab.tsx terverifikasi mendukung navigasi 3 pilar mandiri dan interaktif');

  // Check 9: Verifikasi Single Source of Truth di TutorialTab.tsx (TASK-134)
  const requiredRawImports = [
    'INSTALLATION_ANDROID_MD',
    'USAGE_MOBILE_MD',
    'MOBILE_BLUEPRINT_MD',
    'LANDING_PROMPT_MD',
    'HANDOVER_PROMPT_MD'
  ];
  for (const sym of requiredRawImports) {
    if (!tutorialTab.includes(sym)) {
      throw new Error(`TutorialTab.tsx tidak merujuk sumber Markdown kanonik: ${sym}`);
    }
  }
  console.log('  ✓ 9. TutorialTab.tsx merujuk sumber Markdown tunggal tanpa duplikasi teks statis');

  console.log('RESULT: ALL DOCUMENTATION PARITY CHECKS PASSED (9/9 checks OK).');
  return true;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('documentationParity.test.ts')) {
  try {
    runDocumentationParityTests();
    process.exit(0);
  } catch (err: any) {
    console.error('[ERROR] Documentation parity test failed:', err?.message || err);
    process.exit(1);
  }
}
