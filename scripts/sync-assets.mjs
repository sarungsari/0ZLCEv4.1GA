#!/usr/bin/env node
/**
 * ZLCE Canonical Asset Synchronizer & Single-Kit Generator
 * Syncs all canonical files from root, scripts/, templates/, and examples/
 * one-way to scripts/zlce/ and zlce-starter-kit/, and generates ZLCE_KIT_SINGLE.md on demand.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

export const SYNC_PAIRS = [
  // Scripts: from scripts/ to scripts/zlce/ and zlce-starter-kit/scripts/
  {
    src: 'scripts/zlce-check.py',
    destinations: ['scripts/zlce/zlce-check.py', 'zlce-starter-kit/scripts/zlce-check.py'],
    chmod: 0o755
  },
  {
    src: 'scripts/zlce-collect.py',
    destinations: ['scripts/zlce/zlce-collect.py', 'zlce-starter-kit/scripts/zlce-collect.py'],
    chmod: 0o755
  },
  {
    src: 'scripts/zlce-snapshot.sh',
    destinations: ['scripts/zlce/zlce-snapshot.sh', 'zlce-starter-kit/scripts/zlce-snapshot.sh'],
    chmod: 0o755
  },
  {
    src: 'scripts/README.md',
    destinations: ['zlce-starter-kit/scripts/README.md']
  },
  // Repo config & prompts: from root to zlce-starter-kit/
  {
    src: '.gitignore',
    destinations: ['zlce-starter-kit/.gitignore']
  },
  {
    src: 'LANDING_PROMPT.md',
    destinations: ['zlce-starter-kit/LANDING_PROMPT.md']
  },
  {
    src: 'HANDOVER_PROMPT.md',
    destinations: ['zlce-starter-kit/HANDOVER_PROMPT.md']
  },
  {
    src: 'HANDOVER.md',
    destinations: ['zlce-starter-kit/HANDOVER.md']
  },
  // Canonical Examples: from examples/ to zlce-starter-kit/examples/
  {
    src: 'examples/AI_WORKFLOW.example.md',
    destinations: ['zlce-starter-kit/examples/AI_WORKFLOW.example.md']
  },
  {
    src: 'examples/BLUEPRINT.example.md',
    destinations: ['zlce-starter-kit/examples/BLUEPRINT.example.md']
  },
  {
    src: 'examples/SESSION_STATE.example.md',
    destinations: ['zlce-starter-kit/examples/SESSION_STATE.example.md']
  },
  {
    src: 'examples/TASKS.example.md',
    destinations: ['zlce-starter-kit/examples/TASKS.example.md']
  },
  // Canonical Templates: from templates/ to zlce-starter-kit/templates/
  {
    src: 'templates/AI_WORKFLOW.template.md',
    destinations: ['zlce-starter-kit/templates/AI_WORKFLOW.template.md']
  },
  {
    src: 'templates/ARCHITECTURE.template.md',
    destinations: ['zlce-starter-kit/templates/ARCHITECTURE.template.md']
  },
  {
    src: 'templates/BLUEPRINT.template.md',
    destinations: ['zlce-starter-kit/templates/BLUEPRINT.template.md']
  },
  {
    src: 'templates/CHANGELOG.template.md',
    destinations: ['zlce-starter-kit/templates/CHANGELOG.template.md']
  },
  {
    src: 'templates/CHECKLISTS.template.md',
    destinations: ['zlce-starter-kit/templates/CHECKLISTS.template.md']
  },
  {
    src: 'templates/DATA_MODEL.template.md',
    destinations: ['zlce-starter-kit/templates/DATA_MODEL.template.md']
  },
  {
    src: 'templates/SESSION_STATE.template.md',
    destinations: ['zlce-starter-kit/templates/SESSION_STATE.template.md']
  },
  {
    src: 'templates/TASKS.template.md',
    destinations: ['zlce-starter-kit/templates/TASKS.template.md']
  },
  {
    src: 'templates/TESTING.template.md',
    destinations: ['zlce-starter-kit/templates/TESTING.template.md']
  },
  {
    src: 'templates/profiles/DOMAIN_BOOKING.profile.md',
    destinations: ['zlce-starter-kit/templates/profiles/DOMAIN_BOOKING.profile.md']
  },
  // Preserved Installation, Tutorial & Usage Guides: from docs/mobile/ to zlce-starter-kit/docs/
  {
    src: 'docs/mobile/INSTALLATION_ANDROID.md',
    destinations: ['zlce-starter-kit/docs/INSTALLATION_ANDROID.md']
  },
  {
    src: 'docs/mobile/USAGE_MOBILE.md',
    destinations: ['zlce-starter-kit/docs/USAGE_MOBILE.md']
  },
  {
    src: 'docs/mobile/TERMUX_SETUP.md',
    destinations: ['zlce-starter-kit/docs/TERMUX_SETUP.md']
  },
  {
    src: 'docs/mobile/TROUBLESHOOTING.md',
    destinations: ['zlce-starter-kit/docs/TROUBLESHOOTING.md']
  }
];

const SINGLE_KIT_FILES = [
  'LANDING_PROMPT.md',
  'HANDOVER_PROMPT.md',
  'templates/AI_WORKFLOW.template.md',
  'templates/BLUEPRINT.template.md',
  'templates/ARCHITECTURE.template.md',
  'templates/DATA_MODEL.template.md',
  'templates/TASKS.template.md',
  'templates/SESSION_STATE.template.md',
  'templates/TESTING.template.md',
  'templates/CHECKLISTS.template.md',
  'templates/CHANGELOG.template.md',
  'templates/profiles/DOMAIN_BOOKING.profile.md'
];

export function buildSingleKitMarkdown(baseDir = root) {
  const header = [
    '# ZLCE KIT (SATU BERKAS) v4.1.0 GA',
    '',
    'Berkas ini adalah bundel tunggal (*derived artifact*) Zero-Loss Context Engineering (ZLCE) v4.1.0 GA.',
    'Dihasilkan otomatis dari sumber kanonik `LANDING_PROMPT.md`, `HANDOVER_PROMPT.md`, dan `templates/` agar kompatibel dengan AI berbasis chat/prompt tunggal tanpa multi-upload.',
    '',
    'Setiap berkas di dalamnya dibatasi penanda:',
    '<<<FILE: path>>> dan <<<END FILE>>>.',
    'Perlakukan tiap bagian sebagai berkas terpisah dengan path tersebut.',
    '',
    'DAFTAR BERKAS:',
    ...SINGLE_KIT_FILES.map((f) => `- ${f}`),
    ''
  ].join('\n');

  let body = '';
  for (const rel of SINGLE_KIT_FILES) {
    const abs = path.join(baseDir, rel);
    if (!fs.existsSync(abs)) {
      throw new Error(`Missing canonical source for single-kit: ${rel}`);
    }
    const content = fs.readFileSync(abs, 'utf8').trim();
    body += `\n<<<FILE: ${rel}>>>\n${content}\n<<<END FILE>>>\n`;
  }

  return `${header}${body}`;
}

function runSync() {
  let syncCount = 0;
  let missingCount = 0;
  for (const item of SYNC_PAIRS) {
    const srcPath = path.join(root, item.src);
    if (!fs.existsSync(srcPath)) {
      console.error(`[ERROR] Canonical source not found: ${item.src}`);
      missingCount++;
      continue;
    }
    const content = fs.readFileSync(srcPath);

    for (const dest of item.destinations) {
      const destPath = path.join(root, dest);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, content);
      if (item.chmod) {
        try {
          fs.chmodSync(destPath, item.chmod);
        } catch {
          // ignore on filesystems without chmod
        }
      }
      syncCount++;
    }
  }

  if (missingCount > 0) {
    process.exitCode = 1;
    return;
  }
  console.log(`[OK] Synchronized ${syncCount} target files from ${SYNC_PAIRS.length} canonical sources.`);
}

const args = process.argv.slice(2);
const singleKitIdx = args.indexOf('--single-kit');
if (singleKitIdx !== -1) {
  const targetArg = args[singleKitIdx + 1] && !args[singleKitIdx + 1].startsWith('--')
    ? args[singleKitIdx + 1]
    : 'dist/ZLCE_KIT_SINGLE.md';
  const outPath = path.isAbsolute(targetArg) ? targetArg : path.join(root, targetArg);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const md = buildSingleKitMarkdown(root);
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`[OK] Generated derived single-file kit at ${path.relative(root, outPath) || outPath} (${Buffer.byteLength(md, 'utf8')} bytes).`);
} else {
  runSync();
}

