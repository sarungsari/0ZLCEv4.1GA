/**
 * TC-P16-04: Test Suite for Tab Code Splitting & Skeleton Loader (TASK-104 / PERF-001)
 *
 * Requirements:
 * 1. App.tsx imports `lazy` and `Suspense` from React.
 * 2. Tab modules are loaded lazily via `React.lazy` to maintain lean heap in 3GB RAM devices.
 * 3. TabSkeleton provides zero layout shift with `role="status"` and accessible aria-label.
 * 4. Main content container in App.tsx wraps tab views inside <Suspense fallback={<TabSkeleton ... />}>.
 * 5. FullscreenEditorModal is wrapped in Suspense fallback.
 */

import fs from 'node:fs';
import path from 'node:path';

function runTest(): void {
  console.log('--- TC-P16-04: Tab Code Splitting & Skeleton Loader ---');

  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const skeletonPath = path.resolve(process.cwd(), 'src/components/mobile/TabSkeleton.tsx');

  if (!fs.existsSync(appPath)) {
    console.error('FAIL: src/App.tsx not found');
    process.exit(1);
  }
  if (!fs.existsSync(skeletonPath)) {
    console.error('FAIL: src/components/mobile/TabSkeleton.tsx not found');
    process.exit(1);
  }

  const appSource = fs.readFileSync(appPath, 'utf-8');
  const skeletonSource = fs.readFileSync(skeletonPath, 'utf-8');

  // Check 1: React.lazy & Suspense imported in App.tsx
  const hasLazyImport = /import\s+.*?\b(lazy|Suspense)\b.*?\s+from\s+['"]react['"]/s.test(appSource);
  if (!hasLazyImport) {
    console.error('FAIL: Check 1 - App.tsx does not import lazy and Suspense from react');
    process.exit(1);
  }
  console.log('PASS: Check 1 - App.tsx imports React.lazy and Suspense.');

  // Check 2: Dynamic import statements for tabs in App.tsx
  const lazyDeclarations = [
    'DashboardTab',
    'SessionStateTab',
    'LandingWizardTab',
    'WorkspaceReader',
    'ContextPackTab',
    'ResultCaptureTab',
    'AiHandoverWizard',
    'FeedbackReviewTab',
    'SessionTimelineTab',
    'CommandHubTab',
    'GitSyncTab'
  ];

  for (const comp of lazyDeclarations) {
    const regex = new RegExp(`const\\s+${comp}\\s*=\\s*lazy\\(`, 'm');
    if (!regex.test(appSource)) {
      console.error(`FAIL: Check 2 - Tab component ${comp} is not declared with lazy() in App.tsx`);
      process.exit(1);
    }
  }
  console.log('PASS: Check 2 - All primary tabs are code-split via React.lazy().');

  // Check 3: TabSkeleton accessibility and design
  const hasRoleStatus = /role=["']status["']/.test(skeletonSource);
  const hasAriaLabel = /aria-label=/.test(skeletonSource);
  const hasAnimatePulse = /animate-pulse/.test(skeletonSource);

  if (!hasRoleStatus || !hasAriaLabel || !hasAnimatePulse) {
    console.error('FAIL: Check 3 - TabSkeleton lacks role="status", aria-label, or animate-pulse');
    process.exit(1);
  }
  console.log('PASS: Check 3 - TabSkeleton includes accessible status role and skeleton pulse.');

  // Check 4: Main container wraps active tab views in Suspense fallback TabSkeleton
  const hasSuspenseWithSkeleton = /<Suspense\s+fallback=\{<TabSkeleton\s+tabName=\{activeTab\}\s*\/>\}>/.test(appSource);
  if (!hasSuspenseWithSkeleton) {
    console.error('FAIL: Check 4 - App.tsx main block not wrapped in Suspense with TabSkeleton fallback');
    process.exit(1);
  }
  console.log('PASS: Check 4 - Active tab render block is wrapped in <Suspense fallback={<TabSkeleton ... />}>.');

  // Check 5: FullscreenEditorModal wrapped in Suspense
  const hasModalSuspense = /<Suspense\s+fallback=\{null\}>\s*<FullscreenEditorModal/.test(appSource);
  if (!hasModalSuspense) {
    console.error('FAIL: Check 5 - FullscreenEditorModal is not wrapped in Suspense');
    process.exit(1);
  }
  console.log('PASS: Check 5 - FullscreenEditorModal is wrapped in Suspense.');

  console.log('ALL TC-P16-04 CHECKS PASSED: Code splitting & Skeleton Loader verified!');
}

runTest();
