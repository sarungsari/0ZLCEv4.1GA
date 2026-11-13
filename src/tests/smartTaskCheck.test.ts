/**
 * Test Suite: Smart Task Check Engine (Docs Impact Verification Gate)
 * Memvalidasi kepatuhan verifikasi dokumen Docs Impact sebelum task berstatus DONE.
 */

import {
  parseDocsImpactList,
  validateSmartTaskCheck,
  generateRecommendedDocsImpactEvidence
} from '../utils/smartTaskCheck';

export function runSmartTaskCheckTests(): {
  passed: boolean;
  message: string;
  checks: { name: string; pass: boolean; details?: string }[];
} {
  const checks: { name: string; pass: boolean; details?: string }[] = [];

  // Check 1: Parsing Docs Impact string kanonik & fallback
  try {
    const list1 = parseDocsImpactList('`SESSION_STATE.md`, `CHANGELOG.md`, `docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md`');
    const list2 = parseDocsImpactList('-');
    const list3 = parseDocsImpactList('');
    const list4 = parseDocsImpactList('src/types/index.ts, README.md');

    const pass1 = 
      list1.length === 3 &&
      list1[0] === 'SESSION_STATE.md' &&
      list1[1] === 'CHANGELOG.md' &&
      list1[2] === 'docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md' &&
      list2.length === 1 && list2[0] === 'SESSION_STATE.md' &&
      list3.length === 1 && list3[0] === 'SESSION_STATE.md' &&
      list4.length === 2 && list4[0] === 'src/types/index.ts';

    checks.push({
      name: 'Check 1: Parser Docs Impact & Fallback SESSION_STATE.md',
      pass: pass1,
      details: pass1 ? `Berhasil mem-parse variasi Docs Impact (termasuk strip backtick & fallback kanonik).` : 'Gagal mem-parse Docs Impact.'
    });
  } catch (e: any) {
    checks.push({ name: 'Check 1: Parser Docs Impact & Fallback', pass: false, details: e.message });
  }

  // Check 2: Bukti verifikasi tidak memadai (< 5 karakter atau placeholder) wajib ditolak
  try {
    const resShort = validateSmartTaskCheck({
      taskId: 'TASK-013',
      docsImpact: 'SESSION_STATE.md',
      evidence: 'ok'
    });

    const resPlaceholder = validateSmartTaskCheck({
      taskId: 'TASK-013',
      docsImpact: 'SESSION_STATE.md',
      evidence: 'todo'
    });

    const resEmpty = validateSmartTaskCheck({
      taskId: 'TASK-013',
      docsImpact: 'SESSION_STATE.md',
      evidence: '-'
    });

    const pass2 = !resShort.canMarkDone && !resPlaceholder.canMarkDone && !resEmpty.canMarkDone;
    checks.push({
      name: 'Check 2: Penolakan Bukti Tidak Memadai (< 5 Karakter / Placeholder)',
      pass: pass2,
      details: pass2 ? 'Seluruh input placeholder (ok, todo, -) berhasil diblokir dari status DONE.' : 'Ada placeholder yang lolos.'
    });
  } catch (e: any) {
    checks.push({ name: 'Check 2: Penolakan Bukti Tidak Memadai', pass: false, details: e.message });
  }

  // Check 3: Penolakan jika salah satu dokumen di Docs Impact belum memiliki bukti
  try {
    const resPartial = validateSmartTaskCheck({
      taskId: 'TASK-041',
      docsImpact: 'SESSION_STATE.md, CHANGELOG.md, docs/mobile/INSTALLATION.md',
      evidence: 'npm test lulus 100% dan SESSION_STATE.md telah diperbarui.'
    });

    const pass3 = 
      !resPartial.canMarkDone &&
      resPartial.missingDocs.includes('CHANGELOG.md') &&
      resPartial.missingDocs.includes('docs/mobile/INSTALLATION.md') &&
      resPartial.verifiedDocsCount === 1;

    checks.push({
      name: 'Check 3: Pemblokiran DONE jika Ada Dokumen Docs Impact yang Belum Memiliki Bukti',
      pass: pass3,
      details: pass3 ? `Terdeteksi ${resPartial.missingDocs.length} dokumen tanpa bukti (${resPartial.missingDocs.join(', ')}).` : 'Gagal mendeteksi dokumen yang tertinggal.'
    });
  } catch (e: any) {
    checks.push({ name: 'Check 3: Pemblokiran DONE Dokumen Tertinggal', pass: false, details: e.message });
  }

  // Check 4: Lulus validasi saat semua dokumen terverifikasi via teks atau konfirmasi eksplisit
  try {
    const resTextAll = validateSmartTaskCheck({
      taskId: 'TASK-085',
      docsImpact: 'SESSION_STATE.md, CHANGELOG.md',
      evidence: 'Build tsc ok, sinkronisasi SESSION_STATE.md dan CHANGELOG.md lengkap 0 error.'
    });

    const resCheckbox = validateSmartTaskCheck({
      taskId: 'TASK-085',
      docsImpact: 'SESSION_STATE.md, CHANGELOG.md',
      evidence: 'Verifikasi unit test 67/67 PASS pada Samsung SM-T225.',
      explicitlyConfirmedDocs: ['SESSION_STATE.md', 'CHANGELOG.md']
    });

    const pass4 = resTextAll.canMarkDone && resCheckbox.canMarkDone && resCheckbox.missingDocs.length === 0;
    checks.push({
      name: 'Check 4: Kelulusan Smart Task Check saat Semua Dokumen Docs Impact Terverifikasi',
      pass: pass4,
      details: pass4 ? 'Berhasil meloloskan verifikasi baik via referensi teks maupun konfirmasi checklist antarmuka.' : 'Gagal meloloskan verifikasi valid.'
    });
  } catch (e: any) {
    checks.push({ name: 'Check 4: Kelulusan Smart Task Check', pass: false, details: e.message });
  }

  // Check 5: Generator rekomendasi teks bukti verifikasi otomatis
  try {
    const rec = generateRecommendedDocsImpactEvidence('TASK-022', ['SESSION_STATE.md', 'CHANGELOG.md', 'USER_GUIDE.md']);
    const pass5 = 
      rec.includes('SESSION_STATE.md') &&
      rec.includes('CHANGELOG.md') &&
      rec.includes('USER_GUIDE.md') &&
      rec.length >= 20;

    checks.push({
      name: 'Check 5: Generator Rekomendasi Bukti Dokumen Terstandarisasi',
      pass: pass5,
      details: pass5 ? `Rekomendasi bukti terbuat: "${rec}"` : 'Rekomendasi bukti tidak lengkap.'
    });
  } catch (e: any) {
    checks.push({ name: 'Check 5: Generator Rekomendasi Bukti', pass: false, details: e.message });
  }

  const allPassed = checks.every(c => c.pass);
  return {
    passed: allPassed,
    message: allPassed 
      ? `SMART TASK CHECK TEST: ALL ${checks.length} CHECKS PASSED.`
      : `SMART TASK CHECK TEST FAILED: ${checks.filter(c => !c.pass).length} checks failed.`,
    checks
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = runSmartTaskCheckTests();
  console.log('='.repeat(65));
  console.log(result.message);
  result.checks.forEach((c, idx) => {
    console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${idx + 1}. ${c.name} -> ${c.details || ''}`);
  });
  console.log('='.repeat(65));
  process.exit(result.passed ? 0 : 1);
}
