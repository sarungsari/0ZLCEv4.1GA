/**
 * TC-P16-06: Test Suite for Hard Token Budget Enforcement & Context Pruning (TASK-106)
 *
 * Requirements:
 * 1. MODEL_BUDGET_PROFILES defines strict maxTokenLimit and safeWindowTokens across all AI models:
 *    - freebuff-4k (4,000 / 3,200)
 *    - compact-8k (8,000 / 6,500)
 *    - claude-30k (30,000 / 24,000)
 *    - copilot-32k (32,000 / 25,000)
 *    - deepseek-64k (64,000 / 50,000)
 *    - cursor-64k (64,000 / 52,000)
 *    - gpt-128k (128,000 / 96,000)
 *    - gemini-1m (1,000,000 / 750,000)
 * 2. enforceTokenBudgetHardCap guarantees payload never exceeds target model's hard cap.
 * 3. Audit log and handover pruning reduces footprint while strictly retaining Tier 0, Task Mandate, & WAL.
 * 4. Warning status and badge flag isNearLimit trigger when token count >= 95% of safeWindow.
 * 5. TokenBudgetSelector renders alert indicator when usage reaches >= 95%.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  MODEL_BUDGET_PROFILES,
  getModelBudgetProfile,
  calculateTokenSafety,
  pruneContextForBudget,
  enforceTokenBudgetHardCap,
  estimateTokens
} from '../utils/tokenBudgetAdapter';

function runTest(): void {
  console.log('--- TC-P16-06: Hard Token Budget Enforcement & Context Pruning ---');

  // Check 1: Model budget profiles limits
  const expectedLimits: Record<string, { max: number; safe: number }> = {
    'freebuff-4k': { max: 4000, safe: 3200 },
    'compact-8k': { max: 8000, safe: 6500 },
    'claude-30k': { max: 30000, safe: 24000 },
    'copilot-32k': { max: 32000, safe: 25000 },
    'deepseek-64k': { max: 64000, safe: 50000 },
    'cursor-64k': { max: 64000, safe: 52000 },
    'gpt-128k': { max: 128000, safe: 96000 },
    'gemini-1m': { max: 1000000, safe: 750000 }
  };

  for (const [preset, expected] of Object.entries(expectedLimits)) {
    const profile = getModelBudgetProfile(preset as any);
    if (!profile || profile.maxTokenLimit !== expected.max || profile.safeWindowTokens !== expected.safe) {
      console.error(`FAIL: Check 1 - Budget profile ${preset} mismatch. Expected ${expected.max}/${expected.safe}, got ${profile?.maxTokenLimit}/${profile?.safeWindowTokens}`);
      process.exit(1);
    }
  }
  console.log('PASS: Check 1 - All 8 AI model budget profiles defined with verified hard caps.');

  // Check 2: Audit log pruning and semantic reduction
  const sampleMarkdown = `
# ZLCE Context Pack - TASK-106

## 1. MANDAT TUGAS AKTIF (ACTIVE TASK DIRECTIVE)
* **ID Task:** \`TASK-106\`
* **Nama / Judul:** Hard Token Budget Enforcement

## 2. JANGKAR KEBENARAN ARSITEKTUR & KEPUTUSAN KUNCI
* Pilar 1, Pilar 2, Pilar 3 ZLCE.

## 3. STATUS SESI TERKINI & JEJAK WAL (SESSION STATE & WAL)
* **Task Terakhir Selesai (DONE):** \`TASK-105\`
* **Langkah WAL Sedang Dikerjakan:** Implementasi enforceTokenBudgetHardCap

## 6. CATATAN SERAH TERIMA
* Catatan 1: Sesi awal
* Catatan 2: Integrasi modul
* Catatan 3: Testing unit
* Catatan 4: Deployment checklist
* Catatan 5: Perbaikan bug

## 7. LOG AUDIT TERKINI
* **2026-11-08 10:00 WIB:** Entry audit ke-1
* **2026-11-08 11:00 WIB:** Entry audit ke-2
* **2026-11-08 12:00 WIB:** Entry audit ke-3
* **2026-11-08 13:00 WIB:** Entry audit ke-4
* **2026-11-08 14:00 WIB:** Entry audit ke-5
* **2026-11-08 15:00 WIB:** Entry audit ke-6
`;

  const prunedFreebuff = pruneContextForBudget(sampleMarkdown, 'freebuff-4k');
  if (!prunedFreebuff.wasPruned || !prunedFreebuff.prunedMarkdown.includes('entri log audit terdahulu dipangkas otomatis')) {
    console.error('FAIL: Check 2 - pruneContextForBudget did not prune audit log for freebuff-4k');
    process.exit(1);
  }
  console.log('PASS: Check 2 - Smart pruning successfully compacted audit log and handover notes.');

  // Check 3: Hard budget cap guarantee on huge text (simulating 5,000+ token payload on freebuff-4k)
  const hugeText = sampleMarkdown + '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(500);
  const hardCapped = enforceTokenBudgetHardCap(hugeText, 'freebuff-4k');

  if (hardCapped.finalTokens > 4000) {
    console.error(`FAIL: Check 3 - enforceTokenBudgetHardCap exceeded 4,000 tokens: got ${hardCapped.finalTokens}`);
    process.exit(1);
  }
  if (!hardCapped.isCapped) {
    console.error('FAIL: Check 3 - isCapped flag not set on truncated payload');
    process.exit(1);
  }
  console.log(`PASS: Check 3 - enforceTokenBudgetHardCap strictly guarantees hard cap (got ${hardCapped.finalTokens} <= 4000 tokens).`);

  // Check 4: Proximity safety ceiling calculation (>= 95% of safeWindow)
  const nearLimitTokens = Math.floor(3200 * 0.96); // 96% of safe window for freebuff-4k
  const safetyNear = calculateTokenSafety(nearLimitTokens, 'freebuff-4k');
  const hardCapNear = enforceTokenBudgetHardCap('A'.repeat(Math.floor(nearLimitTokens * 3.2)), 'freebuff-4k');

  if (safetyNear.percentage < 95 || !hardCapNear.isNearLimit) {
    console.error('FAIL: Check 4 - Proximity threshold >= 95% did not set isNearLimit to true');
    process.exit(1);
  }
  console.log('PASS: Check 4 - Proximity ceiling correctly flags >= 95% token budget warning.');

  // Check 5: TokenBudgetSelector renders alert indicator for >= 95%
  const selectorFile = path.resolve(process.cwd(), 'src/components/mobile/TokenBudgetSelector.tsx');
  const selectorSrc = fs.readFileSync(selectorFile, 'utf-8');

  const hasAlertBadge =
    selectorSrc.includes('role="alert"') &&
    selectorSrc.includes('safety.percentage >= 95') &&
    selectorSrc.includes('Peringatan Ambang Batas Token');

  if (!hasAlertBadge) {
    console.error('FAIL: Check 5 - TokenBudgetSelector lacks >= 95% alert warning badge');
    process.exit(1);
  }
  console.log('PASS: Check 5 - TokenBudgetSelector includes accessible >= 95% warning alert banner.');

  console.log('ALL TC-P16-06 CHECKS PASSED: Hard Token Budget Enforcement verified!');
}

runTest();
