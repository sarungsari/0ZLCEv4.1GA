/**
 * Unit Test: Frontend PWA Review Prompt & ZIP Bundle Verification (TASK-095 / TC-P14-07)
 * Memverifikasi pembuatan prompt review khusus ChatGPT & Claude dengan 5 pilar UX
 * (User-Friendly, Komunikatif, Mudah Dipakai, Efisien, Powerful) serta integritas
 * berkas bundel ZIP release-bundles/zlce-pwa-frontend-review-bundle.zip.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { 
  generateExternalAuditPrompt, 
  AuditPromptConfig 
} from '../utils/auditPromptGenerator';
import { parseSessionStateMarkdown } from '../utils/markdownParser';

export function runPwaReviewPromptTests() {
  console.log('[TEST] Menjalankan Pengujian Prompt Review Frontend PWA & Bundel ZIP (TC-P14-07)...');

  const rootDir = process.cwd();
  const sessionMdPath = path.resolve(rootDir, 'SESSION_STATE.md');
  const sessionMd = fs.readFileSync(sessionMdPath, 'utf-8');
  const sessionState = parseSessionStateMarkdown(sessionMd);

  // Check 1: Prompt generator untuk Claude 3.5 Sonnet memuat stop token dan mandat PWA
  const claudeConfig: AuditPromptConfig = {
    targetAi: 'claude-3.5-sonnet',
    focusArea: 'pwa-frontend-ux',
    customNotes: 'Fokuskan review pada visualViewport virtual keyboard dan jangkauan jempol.'
  };
  const claudePrompt = generateExternalAuditPrompt(claudeConfig, sessionState, sessionMd);
  if (!claudePrompt.includes('MANDAT REVIEW KHUSUS FRONTEND PWA')) {
    throw new Error('Prompt Claude tidak memuat judul Mandat Review Khusus Frontend PWA');
  }
  if (!claudePrompt.includes('=== END CLAUDE AUDIT RESPONSE ===')) {
    throw new Error('Prompt Claude tidak memuat stop token spesifik Claude');
  }
  console.log('  ✓ 1. Prompt review Claude terverifikasi memuat judul mandat dan stop token baku');

  // Check 2: Prompt generator untuk ChatGPT-4o memuat stop token dan mandat PWA
  const gptConfig: AuditPromptConfig = {
    targetAi: 'chatgpt-4o',
    focusArea: 'pwa-frontend-ux',
    customNotes: 'Pastikan evaluasi konsumsi memori RAM 3GB Android LMK.'
  };
  const gptPrompt = generateExternalAuditPrompt(gptConfig, sessionState, sessionMd);
  if (!gptPrompt.includes('MANDAT REVIEW KHUSUS FRONTEND PWA')) {
    throw new Error('Prompt ChatGPT tidak memuat judul Mandat Review Khusus Frontend PWA');
  }
  if (!gptPrompt.includes('=== END CHATGPT AUDIT RESPONSE ===')) {
    throw new Error('Prompt ChatGPT tidak memuat stop token spesifik ChatGPT');
  }
  console.log('  ✓ 2. Prompt review ChatGPT terverifikasi memuat judul mandat dan stop token baku');

  // Check 3: Verifikasi kelengkapan 5 Pilar Inti Evaluasi UX
  const fivePillars = [
    'User-Friendly',
    'Komunikatif',
    'Mudah Dipakai',
    'Efisien',
    'Powerful'
  ];

  for (const pillar of fivePillars) {
    if (!claudePrompt.includes(pillar) || !gptPrompt.includes(pillar)) {
      throw new Error(`Prompt review tidak memuat pilar wajib: ${pillar}`);
    }
  }
  console.log('  ✓ 3. Seluruh 5 pilar inti (User-Friendly, Komunikatif, Mudah Dipakai, Efisien, Powerful) tercakup utuh');

  // Check 4: Verifikasi rujukan bundel ZIP khusus dan perangkat acuan tablet SM-T225
  const expectedZipRef = 'release-bundles/zlce-pwa-frontend-review-bundle.zip';
  if (!claudePrompt.includes(expectedZipRef) || !gptPrompt.includes(expectedZipRef)) {
    throw new Error(`Prompt review tidak menyertakan rujukan berkas bundel: ${expectedZipRef}`);
  }
  if (!claudePrompt.includes('SM-T225') || !claudePrompt.includes('8.7"')) {
    throw new Error('Prompt review tidak mencantumkan spesifikasi tablet acuan SM-T225 8.7"');
  }
  console.log('  ✓ 4. Rujukan bundel ZIP zlce-pwa-frontend-review-bundle.zip dan profil tablet SM-T225 valid');

  // Check 5: Verifikasi pembentukan on-demand & ukuran berkas bundel ZIP (tanpa meninggalkan file .zip statis)
  const releaseDir = path.resolve(rootDir, 'release-bundles');
  const zipPath = path.resolve(releaseDir, 'zlce-pwa-frontend-review-bundle.zip');
  const existedBefore = fs.existsSync(zipPath);
  const releaseDirExistedBefore = fs.existsSync(releaseDir);
  try {
    if (!existedBefore) {
      execSync('python3 scripts/create-pwa-review-bundle.py', { cwd: rootDir, stdio: 'pipe' });
    }
    if (!fs.existsSync(zipPath)) {
      throw new Error(`Berkas fisik bundel ZIP gagal dibentuk di: ${zipPath}`);
    }
    const stat = fs.statSync(zipPath);
    if (stat.size < 100 * 1024) {
      throw new Error(`Ukuran berkas ZIP terlalu kecil (${stat.size} bytes), diduga berkas korup`);
    }
    console.log(`  ✓ 5. Bundel ZIP on-demand terverifikasi (${(stat.size / 1024).toFixed(1)} KB, bersih tanpa residu .zip)`);
  } finally {
    if (!existedBefore && fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    if (!releaseDirExistedBefore && fs.existsSync(releaseDir) && fs.readdirSync(releaseDir).length === 0) {
      fs.rmdirSync(releaseDir);
    }
  }

  // Check 6: Verifikasi skrip pembuat bundel scripts/create-pwa-review-bundle.py
  const scriptPath = path.resolve(rootDir, 'scripts/create-pwa-review-bundle.py');
  if (!fs.existsSync(scriptPath)) {
    throw new Error('Skrip scripts/create-pwa-review-bundle.py tidak ditemukan di repositori');
  }
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
  if (!scriptContent.includes('SHA256SUMS.txt') || !scriptContent.includes('PWA_REVIEW_FILES')) {
    throw new Error('Skrip pembundel tidak memuat pembentukan manifest SHA256SUMS atau daftar berkas');
  }
  console.log('  ✓ 6. Skrip scripts/create-pwa-review-bundle.py terverifikasi memiliki generator SHA256SUMS');

  // Check 7: Verifikasi custom notes injection
  if (!claudePrompt.includes('visualViewport virtual keyboard') || !gptPrompt.includes('RAM 3GB Android LMK')) {
    throw new Error('Custom notes tidak terinjeksi dengan benar ke dalam prompt review');
  }
  console.log('  ✓ 7. Injeksi instruksi khusus pengembang (custom notes) terverifikasi presisi');

  console.log('RESULT: ALL FRONTEND PWA REVIEW PROMPT & BUNDLE CHECKS PASSED (7/7 checks OK).');
  return true;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('pwaReviewPrompt.test.ts')) {
  try {
    runPwaReviewPromptTests();
    process.exit(0);
  } catch (err: any) {
    console.error('[ERROR] PWA review prompt test failed:', err?.message || err);
    process.exit(1);
  }
}
