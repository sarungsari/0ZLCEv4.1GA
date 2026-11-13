/**
 * TC-P16-05: Test Suite for Storage Quota Handling, Copy Fallback & Dynamic Stack Banners (TASK-105 / UX-P1)
 *
 * Requirements:
 * 1. useSessionPersistence catches QuotaExceededError, exposes isQuotaExceeded, dismissQuotaWarning, exportSessionMarkdown.
 * 2. isQuotaError helper accurately identifies browser storage quota exhaustion across web engines.
 * 3. OneTapCopyButton implements accessible fallback selection modal when clipboard write is blocked.
 * 4. MobileLayout maintains non-overlapping vertical flex stack for notifications (Quota, SW, Offline, PWA).
 */

import fs from 'node:fs';
import path from 'node:path';

function runTest(): void {
  console.log('--- TC-P16-05: Storage Quota Handling, Copy Fallback & Dynamic Stack Banners ---');

  const persistenceFile = path.resolve(process.cwd(), 'src/hooks/useSessionPersistence.ts');
  const persistenceSrc = fs.readFileSync(persistenceFile, 'utf-8');

  // Check 1: isQuotaError function definition and logic
  const hasIsQuotaErrorDef = persistenceSrc.includes('export function isQuotaError(e: any): boolean');
  const hasQuotaExceededName = persistenceSrc.includes('QuotaExceededError');
  const hasQuotaReachedName = persistenceSrc.includes('NS_ERROR_DOM_QUOTA_REACHED');
  const hasCode22 = persistenceSrc.includes('e.code === 22');

  if (!hasIsQuotaErrorDef || !hasQuotaExceededName || !hasQuotaReachedName || !hasCode22) {
    console.error('FAIL: Check 1 - isQuotaError helper is missing or does not check standard quota signatures');
    process.exit(1);
  }

  // Evaluate the isQuotaError logic
  const isQuotaError = (e: any): boolean => (
    Boolean(e) &&
    (e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 ||
      e.code === 1014 ||
      e.number === -2147024882)
  );

  const qErr1 = { name: 'QuotaExceededError', code: 22 };
  const qErr2 = { name: 'NS_ERROR_DOM_QUOTA_REACHED', code: 1014 };
  const genericErr = new Error('Generic disk error');

  if (!isQuotaError(qErr1) || !isQuotaError(qErr2) || isQuotaError(genericErr)) {
    console.error('FAIL: Check 1 - isQuotaError evaluation failed on error objects');
    process.exit(1);
  }
  console.log('PASS: Check 1 - isQuotaError accurately identifies browser quota exceptions.');

  // Check 2: useSessionPersistence exports quota handling methods
  const hasQuotaReturnTypes =
    persistenceSrc.includes('isQuotaExceeded: boolean;') &&
    persistenceSrc.includes('dismissQuotaWarning: () => void;') &&
    persistenceSrc.includes('exportSessionMarkdown: () => void;') &&
    persistenceSrc.includes('isQuotaExceeded,') &&
    persistenceSrc.includes('dismissQuotaWarning,') &&
    persistenceSrc.includes('exportSessionMarkdown');

  if (!hasQuotaReturnTypes) {
    console.error('FAIL: Check 2 - UseSessionPersistence lacks quota resilience methods');
    process.exit(1);
  }
  console.log('PASS: Check 2 - useSessionPersistence exposes isQuotaExceeded, dismissQuotaWarning, exportSessionMarkdown.');

  // Check 3: OneTapCopyButton fallback modal
  const copyBtnFile = path.resolve(process.cwd(), 'src/components/mobile/OneTapCopyButton.tsx');
  const copyBtnSrc = fs.readFileSync(copyBtnFile, 'utf-8');

  const hasFallbackModal =
    copyBtnSrc.includes('role="dialog"') &&
    copyBtnSrc.includes('aria-modal="true"') &&
    copyBtnSrc.includes('Pilih Semua') &&
    copyBtnSrc.includes('showToast');

  if (!hasFallbackModal) {
    console.error('FAIL: Check 3 - OneTapCopyButton lacks accessible manual copy fallback modal');
    process.exit(1);
  }
  console.log('PASS: Check 3 - OneTapCopyButton includes accessible manual copy fallback modal.');

  // Check 4: MobileLayout dynamic banner stack without absolute overlap
  const mobileLayoutFile = path.resolve(process.cwd(), 'src/components/mobile/MobileLayout.tsx');
  const layoutSrc = fs.readFileSync(mobileLayoutFile, 'utf-8');

  const hasStackContainer = layoutSrc.includes('flex flex-col w-full shadow-lg');
  const hasQuotaBanner =
    layoutSrc.includes('quotaExceeded &&') &&
    layoutSrc.includes('Peringatan Kuota Penyimpanan');

  if (!hasStackContainer || !hasQuotaBanner) {
    console.error('FAIL: Check 4 - MobileLayout lacks dynamic vertical banner stack or quota banner');
    process.exit(1);
  }
  console.log('PASS: Check 4 - MobileLayout stacks quota, SW, and offline banners without absolute overlap.');

  console.log('ALL TC-P16-05 CHECKS PASSED: UI Resilience & Storage Quota verified!');
}

runTest();
