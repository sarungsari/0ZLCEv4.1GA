/**
 * TC-P15-02: Credential Helper Fail-Closed & Source-Safe Sanitizer Test (TASK-097 / AUD4-003 / SEC-002)
 * Memverifikasi:
 * 1. Helper kosong (unset) -> Exit code 0 (PASS)
 * 2. Helper 'cache' (RAM temporary) -> Exit code 0 (PASS)
 * 3. Helper 'store' (disk persistent) -> Exit code 1 (FAIL-CLOSED)
 * 4. Helper 'manager' / kustom -> Exit code 1 (FAIL-CLOSED)
 * 5. Eksekusi source-safe via `source clean-auth.sh` tidak mematikan shell induk Termux
 */

import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function runCleanAuthPolicyTests(): {
  passed: boolean;
  message: string;
  checks: { name: string; pass: boolean; details?: string }[];
} {
  const checks: { name: string; pass: boolean; details?: string }[] = [];
  const rootDir = process.cwd();
  const cleanAuthScript = path.join(rootDir, 'scripts/zlce/clean-auth.sh');

  // Siapkan direktori kerja pengujian terisolasi
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zlce-clean-auth-test-'));
  const fakeGlobalConfig = path.join(tempDir, '.gitconfig');
  fs.writeFileSync(fakeGlobalConfig, '');

  const baseEnv = {
    ...process.env,
    HOME: tempDir,
    GIT_CONFIG_GLOBAL: fakeGlobalConfig,
    GIT_CONFIG_NOSYSTEM: '1'
  };

  try {
    // Inisialisasi git repo kosong di tempDir
    execSync('git init -b main', { cwd: tempDir, env: baseEnv, stdio: 'pipe' });

    // --- SKENARIO 1: Helper Kosong (No credential.helper)
    execSync('git config --unset-all credential.helper || true', { cwd: tempDir, env: baseEnv, stdio: 'pipe' });
    const run1 = spawnSync('bash', [cleanAuthScript], { cwd: tempDir, env: baseEnv, encoding: 'utf-8' });
    const pass1 = run1.status === 0 && run1.stdout.includes('Tidak ada credential.helper terdaftar');
    checks.push({
      name: 'Check 1: Helper kosong menghasilkan exit code 0 (PASS)',
      pass: pass1,
      details: `Exit code: ${run1.status}`
    });

    // --- SKENARIO 2: Helper 'cache' (RAM Temporary)
    execSync('git config credential.helper "cache --timeout=900"', { cwd: tempDir, env: baseEnv, stdio: 'pipe' });
    const run2 = spawnSync('bash', [cleanAuthScript], { cwd: tempDir, env: baseEnv, encoding: 'utf-8' });
    const pass2 = run2.status === 0 && run2.stdout.includes("terkonfirmasi berbasis memori RAM sementara ('cache')");
    checks.push({
      name: "Check 2: Helper 'cache --timeout=900' menghasilkan exit code 0 (PASS)",
      pass: pass2,
      details: `Exit code: ${run2.status}`
    });

    // --- SKENARIO 3: Helper 'store' (Disk Plaintext Persistent) -> FAIL-CLOSED
    execSync('git config credential.helper store', { cwd: tempDir, env: baseEnv, stdio: 'pipe' });
    const run3 = spawnSync('bash', [cleanAuthScript], { cwd: tempDir, env: baseEnv, encoding: 'utf-8' });
    const pass3 = run3.status === 1 && run3.stdout.includes('FAIL') && run3.stdout.includes('Terdeteksi credential helper persisten');
    checks.push({
      name: "Check 3: Helper 'store' menghasilkan exit code 1 (FAIL-CLOSED penegakan Zero-Secret)",
      pass: pass3,
      details: `Exit code: ${run3.status}`
    });

    // --- SKENARIO 4: Helper 'manager' / Kustom Tak Dikenal -> FAIL-CLOSED
    execSync('git config credential.helper manager-core', { cwd: tempDir, env: baseEnv, stdio: 'pipe' });
    const run4 = spawnSync('bash', [cleanAuthScript], { cwd: tempDir, env: baseEnv, encoding: 'utf-8' });
    const pass4 = run4.status === 1 && run4.stdout.includes('FAIL');
    checks.push({
      name: "Check 4: Helper kustom 'manager-core' menghasilkan exit code 1 (FAIL-CLOSED)",
      pass: pass4,
      details: `Exit code: ${run4.status}`
    });

    // --- SKENARIO 5: Uji Eksekusi Source-Safe pada Lingkungan Shell Induk
    // Pastikan skrip di-source dapat mengembalikan kode status via return tanpa membunuh proses induk bash
    execSync('git config credential.helper "cache --timeout=900"', { cwd: tempDir, env: baseEnv, stdio: 'pipe' });
    const sourceCommandPass = `source "${cleanAuthScript}"; echo "PROCEED_CODE_$?"`;
    const runSourcePass = spawnSync('bash', ['-c', sourceCommandPass], { cwd: tempDir, env: baseEnv, encoding: 'utf-8' });
    const pass5a = runSourcePass.stdout.includes('PROCEED_CODE_0');

    // Source saat helper store (return 1)
    execSync('git config credential.helper store', { cwd: tempDir, env: baseEnv, stdio: 'pipe' });
    const sourceCommandFail = `source "${cleanAuthScript}" || true; echo "PROCEED_CODE_CAPTURED"`;
    const runSourceFail = spawnSync('bash', ['-c', sourceCommandFail], { cwd: tempDir, env: baseEnv, encoding: 'utf-8' });
    const pass5b = runSourceFail.stdout.includes('PROCEED_CODE_CAPTURED');

    const pass5 = pass5a && pass5b;
    checks.push({
      name: 'Check 5: Eksekusi source-safe aman via `source clean-auth.sh` tanpa mematikan sesi terminal induk Termux',
      pass: pass5,
      details: `source success captured: ${pass5a}, source failure captured without killing parent: ${pass5b}`
    });

  } finally {
    // Bersihkan direktori sementara
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Abaikan
    }
  }

  const allPassed = checks.every(c => c.pass);
  return {
    passed: allPassed,
    message: allPassed
      ? 'TC-P15-02 PASS (5/5 checks): Credential Helper Fail-Closed & Source-Safe Sanitizer terverifikasi 100%'
      : 'TC-P15-02 FAIL: Sebagian pengujian clean-auth policy gagal',
    checks
  };
}

// CLI runner
if (typeof process !== 'undefined' && process.argv[1]?.includes('cleanAuthPolicy.test')) {
  const result = runCleanAuthPolicyTests();
  console.log(`\n=== TC-P15-02: Clean-Auth Policy & Fail-Closed Test ===`);
  result.checks.forEach(c => {
    console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.name} ${c.details ? `(${c.details})` : ''}`);
  });
  console.log(`\nResult: ${result.message}\n`);
  if (!result.passed) {
    process.exit(1);
  }
}
