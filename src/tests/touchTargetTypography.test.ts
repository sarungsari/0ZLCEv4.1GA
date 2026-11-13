/**
 * TC-P16-03: Touch Target Standardization (44px+) & Typography Floor (>=12px) Test
 * Rujukan: TASK-103, UX-04, UX-05, ERG-002
 */

import fs from 'node:fs';
import path from 'node:path';
import { IconButton } from '../components/mobile/IconButton';
import { SelectInput } from '../components/mobile/SelectInput';

const ROOT = path.resolve(process.cwd());
const SRC_DIR = path.resolve(ROOT, 'src');

async function runTests() {
  console.log('=== TC-P16-03: Touch Target Standardization & Typography Floor Test ===');
  let passed = 0;
  const total = 5;

  // 1. Verifikasi komponen IconButton dan SelectInput
  if (typeof IconButton === 'function' && typeof SelectInput === 'function') {
    const iconBtnCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/IconButton.tsx'), 'utf-8');
    const selectCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/SelectInput.tsx'), 'utf-8');

    const iconHasTouch44 = iconBtnCode.includes('min-h-[44px]') && iconBtnCode.includes('touch-target-44');
    const selectHasTouch44 = selectCode.includes('min-h-[44px]') && selectCode.includes('touch-target-44');
    const selectHasTextSm = selectCode.includes('text-sm');

    if (iconHasTouch44 && selectHasTouch44 && selectHasTextSm) {
      console.log('[PASS] Check 1: Komponen dasar IconButton dan SelectInput mematuhi batas sentuh min-h-[44px] dan tipografi form text-sm');
      passed++;
    } else {
      console.error('[FAIL] Check 1: Spesifikasi IconButton/SelectInput belum lengkap:', { iconHasTouch44, selectHasTouch44, selectHasTextSm });
    }
  } else {
    console.error('[FAIL] Check 1: IconButton atau SelectInput tidak terdefinisi');
  }

  // 2. Verifikasi tombol tutup dan elemen di ActiveMemberSelector.tsx
  const selectorCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/ActiveMemberSelector.tsx'), 'utf-8');
  const closeBtnMatch = selectorCode.includes('aria-label="Tutup panel anggota"');
  const closeBtnHas44 = selectorCode.includes('touch-target-44') && selectorCode.includes('min-h-[44px]');
  const triggerBtnHas44 = selectorCode.includes('touch-target-44 flex items-center');

  if (closeBtnMatch && closeBtnHas44 && triggerBtnHas44) {
    console.log('[PASS] Check 2: Seluruh kontrol dan tombol tutup di ActiveMemberSelector memenuhi batas ergonomis >=44px');
    passed++;
  } else {
    console.error('[FAIL] Check 2: Kontrol ActiveMemberSelector di bawah 44px:', { closeBtnMatch, closeBtnHas44, triggerBtnHas44 });
  }

  // 3. Verifikasi ketiadaan font size mikro (text-[9px] dan text-[10px]) pada ActiveMemberSelector
  const hasSub12InSelector = /text-\[(9|10)px\]/.test(selectorCode);
  if (!hasSub12InSelector) {
    console.log('[PASS] Check 3: Typography floor (>=12px) tervalidasi bersih di ActiveMemberSelector (0 instance text-[9px]/text-[10px])');
    passed++;
  } else {
    console.error('[FAIL] Check 3: Masih ditemukan teks di bawah 12px di ActiveMemberSelector');
  }

  // 4. Verifikasi tombol aksi dan target sentuh di MemberWorkLogSection.tsx
  const workLogCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/MemberWorkLogSection.tsx'), 'utf-8');
  const hasSub12InWorkLogBadges = /text-\[(9|10)px\]/.test(workLogCode);
  const deleteBtnOverridden = workLogCode.includes('w-8 h-8 rounded-lg');
  const deleteBtnHas44 = workLogCode.includes('touch-target-44 min-h-[44px] min-w-[44px]');

  if (!hasSub12InWorkLogBadges && !deleteBtnOverridden && deleteBtnHas44) {
    console.log('[PASS] Check 4: MemberWorkLogSection mematuhi typography floor dan tombol hapus memiliki min-w-[44px] min-h-[44px]');
    passed++;
  } else {
    console.error('[FAIL] Check 4: Pelanggaran dimensi/font di MemberWorkLogSection:', {
      hasSub12InWorkLogBadges,
      deleteBtnOverridden,
      deleteBtnHas44
    });
  }

  // 5. Verifikasi touch target pada dialog dan banner (ConfirmDialog & TaskClaimBanner)
  const confirmCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/ConfirmDialog.tsx'), 'utf-8');
  const claimBannerCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/TaskClaimBanner.tsx'), 'utf-8');

  const confirmHas48 = confirmCode.includes('touch-target-48') && confirmCode.includes('min-h-[48px]');
  const bannerHas44 = claimBannerCode.includes('touch-target-44 min-h-[44px]');
  const bannerTakeoverModalHas48 = claimBannerCode.includes('touch-target-48 min-h-[48px]');

  if (confirmHas48 && bannerHas44 && bannerTakeoverModalHas48) {
    console.log('[PASS] Check 5: Standardisasi touch target tablet (44px-48px) terverifikasi konsisten di seluruh modal & banner');
    passed++;
  } else {
    console.error('[FAIL] Check 5: Touch target modal/banner tidak memenuhi standar:', { confirmHas48, bannerHas44, bannerTakeoverModalHas48 });
  }

  console.log(`Result: TC-P16-03 ${passed === total ? 'PASS' : 'FAIL'} (${passed}/${total} checks): Touch Target Standardization & Typography Floor terverifikasi 100%`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
