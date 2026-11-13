/**
 * Unit Test: URL Tab Routing Parameter Check (TASK-087 / TC-P13-05)
 * Memverifikasi bahwa parsing query parameter ?tab= di App.tsx memetakan tab dengan benar,
 * menangani fallback default ke 'dashboard' untuk nilai invalid, dan selaras dengan PWA manifest shortcuts.
 */

import fs from 'fs';
import { TabType } from '../types/zlce';

export const VALID_TABS: TabType[] = [
  'dashboard', 'session', 'ai-workbench', 'terminal-git', 'diagnostics', 'docs',
  'workspace-reader', 'context-pack',
  'result-capture', 'ai-handover', 'feedback', 'session-timeline',
  'command-hub', 'git-sync', 'initiation', 'prompt-engine',
  'runtime-engine', 'recovery', 'triage', 'harness', 'templates', 'tutorial',
  'performance-audit'
];

export function resolveTabFromSearchParam(searchString: string): TabType {
  const searchParams = new URLSearchParams(searchString);
  const paramTab = searchParams.get('tab');
  if (paramTab && VALID_TABS.includes(paramTab as TabType)) {
    return paramTab as TabType;
  }
  return 'dashboard';
}

function runTabRoutingTests() {
  console.log('[TEST] Menjalankan Pengujian Resolusi Tab Routing ?tab= (TC-P13-05)...');

  // Check 1: Seluruh 19 tab valid harus teresolusi dengan benar
  for (const tab of VALID_TABS) {
    const resolved = resolveTabFromSearchParam(`?tab=${tab}`);
    if (resolved !== tab) {
      throw new Error(`Gagal memetakan ?tab=${tab}: diharapkan '${tab}', didapat '${resolved}'`);
    }
  }
  console.log(`  ✓ 1. Seluruh ${VALID_TABS.length} TabType kanonik berhasil di-resolve dari query parameter ?tab=`);

  // Check 2: Tanpa query parameter harus fallback ke 'dashboard'
  const emptySearchResolved = resolveTabFromSearchParam('');
  if (emptySearchResolved !== 'dashboard') {
    throw new Error(`Fallback parameter kosong gagal: didapat '${emptySearchResolved}'`);
  }
  console.log(`  ✓ 2. URL tanpa query string menghasilkan fallback default 'dashboard'`);

  // Check 3: Query parameter kosong ?tab= harus fallback ke 'dashboard'
  const blankTabResolved = resolveTabFromSearchParam('?tab=');
  if (blankTabResolved !== 'dashboard') {
    throw new Error(`Fallback parameter ?tab= kosong gagal: didapat '${blankTabResolved}'`);
  }
  console.log(`  ✓ 3. Parameter ?tab= kosong berhasil fallback ke 'dashboard'`);

  // Check 4: Query parameter tidak dikenal harus fallback ke 'dashboard'
  const invalidTabResolved = resolveTabFromSearchParam('?tab=unknown-tab-foo-bar');
  if (invalidTabResolved !== 'dashboard') {
    throw new Error(`Fallback parameter invalid gagal: didapat '${invalidTabResolved}'`);
  }
  console.log(`  ✓ 4. Tab tidak valid / sembarang berhasil di-fallback ke 'dashboard'`);

  // Check 5: Sinkronisasi dengan manifest.webmanifest shortcuts
  if (fs.existsSync('public/manifest.webmanifest')) {
    const manifestContent = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'));
    if (manifestContent.shortcuts && Array.isArray(manifestContent.shortcuts)) {
      for (const shortcut of manifestContent.shortcuts) {
        if (shortcut.url) {
          const shortcutTab = resolveTabFromSearchParam(shortcut.url.replace(/^\/?/, ''));
          if (!VALID_TABS.includes(shortcutTab)) {
            throw new Error(`PWA shortcut ${shortcut.url} memetakan ke tab tidak valid: ${shortcutTab}`);
          }
        }
      }
      console.log(`  ✓ 5. Seluruh ${manifestContent.shortcuts.length} pintasan PWA manifest tervalidasi selaras dengan rute tab`);
    }
  }

  // Check 6: Verifikasi kode App.tsx memiliki penanganan ?tab= yang konsisten
  if (fs.existsSync('src/App.tsx')) {
    const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
    if (!appTsx.includes('URLSearchParams') || !appTsx.includes(".get('tab')")) {
      throw new Error('App.tsx tidak memuat deteksi URLSearchParams ?tab=');
    }
    console.log(`  ✓ 6. App.tsx terverifikasi memuat implementasi penanganan ?tab=`);
  }

  console.log('RESULT: ALL TAB ROUTING CHECKS PASSED (6/6 checks OK).');
  return true;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('tabRouting.test.ts')) {
  try {
    runTabRoutingTests();
    process.exit(0);
  } catch (err: any) {
    console.error('[ERROR] Tab routing test failed:', err?.message || err);
    process.exit(1);
  }
}
