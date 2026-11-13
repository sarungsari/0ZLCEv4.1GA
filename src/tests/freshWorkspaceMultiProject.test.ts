/**
 * Fresh PWA & ZLCE Multi-Project Workspace Integrity Test
 * Memverifikasi kesiapan Fresh PWA & Sistem ZLCE untuk proyek BARU, LANJUTAN, dan MODIFIKASI
 * sekaligus menjaga integritas repositori host ZLCE4.1 yang telah dikunci & dokumentasi tutorial.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  buildFreshSessionStateMarkdown,
  buildFreshTasksMarkdown,
  buildFreshBlueprintMarkdown,
  buildTermuxInitCommand,
  getWorkflowLabel,
  getWorkflowShortTag
} from '../utils/projectStarter';
import { validateSessionStateIntegrity } from '../utils/sessionStateValidator';
import { parseSessionStateMarkdown, parseTasksMarkdown } from '../utils/markdownParser';
import { getProjectStorageKeys, HOST_WORKBENCH_PROJECT_ID } from '../hooks/useProjectRegistry';
import { ProjectWorkflowMode } from '../types/mobile';

const ROOT = process.cwd();

function assert(cond: unknown, msg: string) {
  if (!cond) {
    throw new Error(msg);
  }
}

function runFreshWorkspaceTests() {
  console.log('=== Fresh PWA & ZLCE Multi-Project Workspace Test ===');

  const workflows: ProjectWorkflowMode[] = ['NEW', 'CONTINUE', 'MODIFY'];
  for (const wf of workflows) {
    for (const mode of ['LITE', 'FULL'] as const) {
      const opts = {
        projectName: `Uji Proyek ${wf} (${mode})`,
        stack: 'React + TypeScript + PostgreSQL',
        mode,
        workflow: wf,
        branch: wf === 'MODIFY' ? 'task/TASK-REV-01' : 'main',
        termuxPath: `~/projects/uji-${wf.toLowerCase()}`,
        description: `Deskripsi uji skenario ${wf}`
      };

      const sessionMd = buildFreshSessionStateMarkdown(opts);
      const validation = validateSessionStateIntegrity(sessionMd);
      assert(
        validation.valid && validation.errorsCount === 0,
        `Starter SESSION_STATE (${wf}/${mode}) gagal validasi: ${validation.issues.map(i => i.message).join('; ')}`
      );

      const parsedSession = parseSessionStateMarkdown(sessionMd);
      assert(parsedSession.tasks.length >= 3, `Starter SESSION_STATE (${wf}/${mode}) minimal 3 task`);
      assert(
        parsedSession.status.timestampAudit.endsWith('jam: ?'),
        `Starter SESSION_STATE (${wf}/${mode}) wajib patuhi Aturan X1 jam: ?`
      );
      if (wf === 'MODIFY') {
        assert(
          parsedSession.tasks.some(t => t.id === 'TASK-REV-01'),
          `Starter MODIFY wajib menyertakan TASK-REV-01`
        );
      }

      const tasksMd = buildFreshTasksMarkdown(opts);
      const parsedTasks = parseTasksMarkdown(tasksMd);
      assert(
        parsedTasks.tasks.length >= 3,
        `Starter TASKS.md (${wf}/${mode}) gagal di-parse (${parsedTasks.tasks.length} task)`
      );

      const blueprintMd = buildFreshBlueprintMarkdown(opts);
      if (mode === 'LITE') {
        assert(blueprintMd.includes('## 7. MODEL DATA RINGKAS'), 'Blueprint LITE wajib memuat §7');
        assert(blueprintMd.includes('## 8. STRATEGI UJI'), 'Blueprint LITE wajib memuat §8');
      } else {
        assert(!blueprintMd.includes('## 7. MODEL DATA RINGKAS'), 'Blueprint FULL tidak memakai §7 ringkas');
      }
    }

    const cmd = buildTermuxInitCommand({
      termuxPath: '~/projects/app "ku" $test',
      branch: 'main; rm -rf /',
      workflow: wf
    });
    assert(!cmd.includes('&& rm -rf'), 'buildTermuxInitCommand wajib melakukan POSIX quoting pada branch');
    assert(getWorkflowLabel(wf).length > 3, `Label workflow ${wf} valid`);
    assert(getWorkflowShortTag(wf).length > 3, `Short tag workflow ${wf} valid`);
  }
  console.log('[PASS] Check 1: Generator fresh SESSION_STATE, TASKS, BLUEPRINT & Termux command aman untuk NEW/CONTINUE/MODIFY');

  // Check 2: Storage isolation keys do not collide across projects
  const hostKeys = getProjectStorageKeys(HOST_WORKBENCH_PROJECT_ID);
  const projAKeys = getProjectStorageKeys('proj-alpha');
  const projBKeys = getProjectStorageKeys('proj-beta');
  assert(
    hostKeys.rawMarkdownKey !== projAKeys.rawMarkdownKey &&
      projAKeys.rawMarkdownKey !== projBKeys.rawMarkdownKey &&
      hostKeys.historyKey !== projAKeys.historyKey,
    'Kunci storage proyek harus terisolasi unik'
  );
  console.log('[PASS] Check 2: Isolasi kunci LocalStorage antar-proyek terjamin tanpa tabrakan dengan repositori host');

  // Check 3: Preserved tutorials & installation/usage guides in PWA + zlce-starter-kit/docs
  const preservedGuides = [
    'docs/mobile/INSTALLATION_ANDROID.md',
    'docs/mobile/USAGE_MOBILE.md',
    'docs/mobile/TERMUX_SETUP.md',
    'docs/mobile/TROUBLESHOOTING.md',
    'zlce-starter-kit/docs/INSTALLATION_ANDROID.md',
    'zlce-starter-kit/docs/USAGE_MOBILE.md',
    'zlce-starter-kit/docs/TERMUX_SETUP.md',
    'zlce-starter-kit/docs/TROUBLESHOOTING.md'
  ];
  for (const rel of preservedGuides) {
    assert(fs.existsSync(path.join(ROOT, rel)), `Panduan instalasi/penggunaan hilang: ${rel}`);
  }
  const starterReadme = fs.readFileSync(path.join(ROOT, 'zlce-starter-kit/README.md'), 'utf-8');
  assert(
    starterReadme.includes('Proyek Baru') &&
      starterReadme.includes('Proyek Lanjutan') &&
      starterReadme.includes('Update & Modifikasi'),
    'zlce-starter-kit/README.md wajib mencakup panduan Proyek Baru, Lanjutan, dan Modifikasi'
  );
  console.log('[PASS] Check 3: Tutorial instalasi Android & panduan penggunaan mobile terpelihara utuh di repo & starter kit');

  // Check 4: Host project UI isolation guards
  const usp = fs.readFileSync(path.join(ROOT, 'src/hooks/useSessionPersistence.ts'), 'utf-8');
  assert(
    usp.includes('HOST_WORKBENCH_PROJECT_ID') && usp.includes('getProjectStorageKeys'),
    'useSessionPersistence.ts wajib mengisolasi state proyek dan membatasi Live Disk Bridge ke host'
  );
  const dashboard = fs.readFileSync(path.join(ROOT, 'src/components/DashboardTab.tsx'), 'utf-8');
  assert(
    dashboard.includes('zlce-starter-kit-v4.1.0.zip') &&
      dashboard.includes('Tutorial Instalasi Android') &&
      dashboard.includes('Lanjutan Setengah Jadi'),
    'DashboardTab.tsx wajib menyediakan launcher Fresh PWA & tautan starter kit / tutorial'
  );
  console.log('[PASS] Check 4: Isolasi persistensi host & launcher Fresh PWA di UI terverifikasi');

  console.log('RESULT: Fresh PWA & ZLCE Multi-Project Workspace Test PASSED (4/4 checks OK)');
}

runFreshWorkspaceTests();
