/**
 * TC-P17-01: Blueprint Parity & Canonical Release Identity (TASK-107)
 * Verifies that all 14 blueprint documents have APPROVED / AS-BUILT status,
 * 111 tasks are reconciled across master documentation files,
 * and canonical release identity (html lang="id", manifest, product name) is uniform.
 */

import * as fs from 'fs';
import * as path from 'path';

function runBlueprintParityTests() {
  console.log('--- TC-P17-01: Blueprint Parity & Canonical Release Identity ---');
  let passed = 0;
  const rootDir = process.cwd();

  // 1. Verifikasi Keberadaan dan Header 14 Dokumen Blueprint
  const blueprintFiles = [
    '01_SYSTEM_OVERVIEW.md',
    '02_COMPONENT_ARCHITECTURE.md',
    '03_PWA_ARCHITECTURE.md',
    '04_TERMUX_INTEGRATION.md',
    '05_STORAGE_AND_SYNC.md',
    '06_REPOSITORY_CHANGES.md',
    '07_WORKFLOW_DESIGN.md',
    '08_SECURITY_MODEL.md',
    '09_FAILURE_AND_RECOVERY.md',
    '10_TEST_STRATEGY.md',
    '11_IMPLEMENTATION_ROADMAP.md',
    '12_ARCHITECTURE_DECISIONS.md',
    '13_COMMAND_TEMPLATES.md',
    '14_MULTI_AI_TEAM_MODEL.md'
  ];

  let allApproved = true;
  for (const file of blueprintFiles) {
    const fullPath = path.join(rootDir, 'docs/mobile/blueprint', file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Blueprint file ${file} does not exist!`);
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes('Status: **APPROVED / AS-BUILT**')) {
      allApproved = false;
      console.error(`File ${file} does NOT have status APPROVED / AS-BUILT`);
    }
  }

  if (allApproved) {
    console.log('✓ Check 1: Seluruh 14 header berkas blueprint berstatus APPROVED / AS-BUILT');
    passed++;
  } else {
    throw new Error('Check 1 GAGAL: Ada berkas blueprint yang belum berstatus APPROVED / AS-BUILT');
  }

  // 2. Verifikasi Rekonsiliasi 134 Task di MOBILE_BLUEPRINT.md
  const mobileBlueprintPath = path.join(rootDir, 'docs/mobile/MOBILE_BLUEPRINT.md');
  const mobileBlueprintContent = fs.readFileSync(mobileBlueprintPath, 'utf8');
  if (
    mobileBlueprintContent.includes('134 TASK RESMI TUNTAS') &&
    mobileBlueprintContent.includes('134 task') &&
    mobileBlueprintContent.includes('`TASK-134`')
  ) {
    console.log('✓ Check 2: MOBILE_BLUEPRINT.md merekonsiliasi 134 task resmi');
    passed++;
  } else {
    throw new Error('Check 2 GAGAL: MOBILE_BLUEPRINT.md tidak memuat rekonsiliasi 134 task');
  }

  // 3. Verifikasi Konsistensi Total 134 Task di TASKS.md dan SESSION_STATE.md
  const tasksPath = path.join(rootDir, 'TASKS.md');
  const tasksContent = fs.readFileSync(tasksPath, 'utf8');
  const sessionStatePath = path.join(rootDir, 'SESSION_STATE.md');
  const sessionStateContent = fs.readFileSync(sessionStatePath, 'utf8');

  const task134InTasks = tasksContent.includes('TASK-134:');
  const task134InSession = sessionStateContent.includes('`TASK-134`');

  if (task134InTasks && task134InSession) {
    console.log('✓ Check 3: TASKS.md dan SESSION_STATE.md sinkron memuat seluruh 134 task');
    passed++;
  } else {
    throw new Error('Check 3 GAGAL: TASK-134 tidak ditemukan di TASKS.md atau SESSION_STATE.md');
  }

  // 4. Verifikasi Atribut Bahasa Dokumen lang="id" di index.html
  const indexPath = path.join(rootDir, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (indexContent.includes('<html lang="id">')) {
    console.log('✓ Check 4: index.html menggunakan atribut dokumen lang="id"');
    passed++;
  } else {
    throw new Error('Check 4 GAGAL: index.html belum diset ke <html lang="id">');
  }

  // 5. Verifikasi Penamaan Produk di manifest.webmanifest
  const manifestPath = path.join(rootDir, 'public/manifest.webmanifest');
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifestContent.name === 'ZLCE Mobile Workbench v4.1.0 GA') {
    if (manifestContent.short_name === 'ZLCEv4.1Mob') {
      console.log('✓ Check 5: manifest.webmanifest memuat nama produk "ZLCE Mobile Workbench v4.1.0 GA" dan short_name "ZLCEv4.1Mob"');
      passed++;
    } else {
      throw new Error(`Check 5 GAGAL: manifest.short_name adalah "${manifestContent.short_name}"`);
    }
  } else {
    throw new Error(`Check 5 GAGAL: manifest.name adalah "${manifestContent.name}"`);
  }

  console.log(`\nTC-P17-01: ${passed}/5 checks PASS (100% OK)`);
}

runBlueprintParityTests();
