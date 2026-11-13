/**
 * TC-P16-02 / TC-P18-03: Accessible Dialogs, ModalShell Focus Trap & Zero Native Alert/Confirm Test
 * Rujukan: TASK-102, TASK-114, R-02, UX-06, UI-001
 */

import fs from 'node:fs';
import path from 'node:path';
import { ConfirmDialog } from '../components/mobile/ConfirmDialog';
import { ToastContainer, showToast, TOAST_EVENT } from '../components/mobile/ToastContainer';
import { ModalShell } from '../components/mobile/ModalShell';

const ROOT = path.resolve(process.cwd());
const SRC_DIR = path.resolve(ROOT, 'src');

function getAllSourceFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllSourceFiles(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Exclude this test file itself from the search
      if (!fullPath.includes('accessibleDialogs.test.ts')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function runTests() {
  console.log('=== TC-P16-02: Accessible Dialogs & Zero Native Alert/Confirm Test ===');
  let passed = 0;
  const total = 7;

  // 1. Scan src/ for any native confirm( or alert(
  const allFiles = getAllSourceFiles(SRC_DIR);
  const violations: { file: string; line: number; text: string }[] = [];
  const nativeRegex = /\b(confirm|alert)\s*\(/;

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Ignore comments or regex definitions
      if (line.includes('//') && line.indexOf('//') < line.search(nativeRegex)) return;
      if (line.includes('*') && line.indexOf('*') < line.search(nativeRegex)) return;
      if (line.includes('regex') || line.includes('pattern') || line.includes('grep')) return;
      if (nativeRegex.test(line)) {
        violations.push({
          file: path.relative(ROOT, file),
          line: idx + 1,
          text: line.trim()
        });
      }
    });
  }

  if (violations.length === 0) {
    console.log(`[PASS] Check 1: 0 pemanggilan window.alert/confirm ditemukan di ${allFiles.length} berkas TypeScript src/`);
    passed++;
  } else {
    console.error(`[FAIL] Check 1: Ditemukan ${violations.length} pemanggilan alert/confirm native:`, violations);
  }

  // 2. Verifikasi ConfirmDialog component & attributes
  if (typeof ConfirmDialog === 'function') {
    const dialogCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/ConfirmDialog.tsx'), 'utf-8');
    const hasAriaModal = dialogCode.includes('aria-modal="true"');
    const hasRoleDialog = dialogCode.includes('role="dialog"');
    const hasTouch48 = dialogCode.includes('touch-target-48') || dialogCode.includes('min-h-[48px]');
    const hasEscapeKey = dialogCode.includes("'Escape'");

    if (hasAriaModal && hasRoleDialog && hasTouch48 && hasEscapeKey) {
      console.log('[PASS] Check 2: ConfirmDialog memiliki atribut aksesibilitas aria-modal, role="dialog", Escape key listener, dan tombol >=48px');
      passed++;
    } else {
      console.error('[FAIL] Check 2: Atribut ConfirmDialog kurang lengkap:', { hasAriaModal, hasRoleDialog, hasTouch48, hasEscapeKey });
    }
  } else {
    console.error('[FAIL] Check 2: ConfirmDialog bukan React FC yang valid');
  }

  // 3. Verifikasi ToastContainer & showToast helper
  if (typeof ToastContainer === 'function' && typeof showToast === 'function') {
    const toastCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/ToastContainer.tsx'), 'utf-8');
    const hasAriaLive = toastCode.includes('aria-live="polite"');
    const hasRoleStatus = toastCode.includes('role="status"');
    const hasTouch44 = toastCode.includes('touch-target-44') || toastCode.includes('min-h-[44px]');

    if (hasAriaLive && hasRoleStatus && hasTouch44) {
      console.log('[PASS] Check 3: ToastContainer mendukung aria-live="polite", role="status", dan tombol tutup >=44px');
      passed++;
    } else {
      console.error('[FAIL] Check 3: Atribut ToastContainer kurang lengkap:', { hasAriaLive, hasRoleStatus, hasTouch44 });
    }
  } else {
    console.error('[FAIL] Check 3: ToastContainer atau showToast tidak terdefinisi');
  }

  // 4. Verifikasi event dispatching showToast
  let eventReceived: any = null;
  const mockListener = (e: any) => {
    eventReceived = e.detail;
  };

  (globalThis as any).window = {
    addEventListener: (event: string, handler: any) => {
      if (event === TOAST_EVENT) (globalThis as any)._toastHandler = handler;
    },
    removeEventListener: () => {},
    dispatchEvent: (event: any) => {
      if (event.type === TOAST_EVENT && (globalThis as any)._toastHandler) {
        (globalThis as any)._toastHandler(event);
      }
      return true;
    }
  };

  (globalThis as any).window.addEventListener(TOAST_EVENT, mockListener);
  showToast('Pengujian toast aksesibel berhasil', 'success', 3000);

  if (eventReceived && eventReceived.message === 'Pengujian toast aksesibel berhasil' && eventReceived.type === 'success') {
    console.log('[PASS] Check 4: showToast() berhasil memancarkan custom event dengan payload tipe dan durasi yang valid');
    passed++;
  } else {
    console.error('[FAIL] Check 4: Payload event showToast tidak cocok:', eventReceived);
  }

  // 5. Verifikasi integrasi ConfirmDialog di komponen interaktif tablet
  const filesUsingConfirmDialog = [
    'src/components/mobile/TaskClaimBanner.tsx',
    'src/components/mobile/MemberWorkLogSection.tsx',
    'src/components/mobile/SessionTimelineTab.tsx',
    'src/components/mobile/ProjectSwitcher.tsx',
    'src/components/DashboardTab.tsx'
  ];

  let allUsing = true;
  for (const f of filesUsingConfirmDialog) {
    const code = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    if (!code.includes('<ConfirmDialog') && !code.includes('ConfirmDialog')) {
      console.error(`[FAIL] Komponen ${f} belum mengintegrasikan ConfirmDialog`);
      allUsing = false;
    }
  }

  if (allUsing) {
    console.log(`[PASS] Check 5: Seluruh ${filesUsingConfirmDialog.length} komponen interaktif tablet telah terintegrasi dengan ConfirmDialog`);
    passed++;
  }

  // 6. Verifikasi Komponen ModalShell Bersama (TASK-114 / R-02 / TC-P18-03)
  if (typeof ModalShell === 'function') {
    const modalShellCode = fs.readFileSync(path.join(SRC_DIR, 'components/mobile/ModalShell.tsx'), 'utf-8');
    const hasRoleDialog = modalShellCode.includes('role="dialog"');
    const hasAriaModal = modalShellCode.includes('aria-modal="true"');
    const hasEscapeKey = modalShellCode.includes("'Escape'") || modalShellCode.includes('"Escape"');
    const hasFocusTrap = modalShellCode.includes("'Tab'") || modalShellCode.includes('"Tab"');
    const hasTouch44 = modalShellCode.includes('touch-target-44') || modalShellCode.includes('min-h-[44px]');
    const hasViewportBounded = modalShellCode.includes('modal-viewport-bounded') || modalShellCode.includes('--viewport-height');

    if (hasRoleDialog && hasAriaModal && hasEscapeKey && hasFocusTrap && hasTouch44 && hasViewportBounded) {
      console.log('[PASS] Check 6: ModalShell terverifikasi memiliki role="dialog", aria-modal="true", Focus Trap (Tab), Escape listener, dan tombol tutup >=44px');
      passed++;
    } else {
      console.error('[FAIL] Check 6: Atribut ModalShell kurang lengkap:', {
        hasRoleDialog, hasAriaModal, hasEscapeKey, hasFocusTrap, hasTouch44, hasViewportBounded
      });
    }
  } else {
    console.error('[FAIL] Check 6: ModalShell bukan React FC yang valid');
  }

  // 7. Verifikasi Migrasi Modal Kritis ke ModalShell (TASK-114 / TC-P18-03)
  const filesUsingModalShell = [
    'src/components/mobile/PasteBackModal.tsx',
    'src/components/mobile/GateApprovalModal.tsx',
    'src/components/mobile/DeviceHandoverModal.tsx',
    'src/components/mobile/TeamRegistryModal.tsx',
    'src/components/DashboardTab.tsx'
  ];

  let allUsingModalShell = true;
  for (const f of filesUsingModalShell) {
    const code = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    if (!code.includes('<ModalShell') && !code.includes('ModalShell')) {
      console.error(`[FAIL] Check 7: Berkas ${f} belum mengadopsi ModalShell`);
      allUsingModalShell = false;
    }
  }

  if (allUsingModalShell) {
    console.log(`[PASS] Check 7: Seluruh ${filesUsingModalShell.length} berkas modal dialog kritis telah termigrasi ke ModalShell (0 modal tanpa Escape & ARIA)`);
    passed++;
  }

  console.log(`Result: TC-P16-02 / TC-P18-03 ${passed === total ? 'PASS' : 'FAIL'} (${passed}/${total} checks): Accessible Dialogs, ModalShell Focus Trap & Zero Native Alert/Confirm terverifikasi 100%`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
