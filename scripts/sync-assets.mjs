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

const SINGLE_KIT_FULL_ITEMS = [
  { src: 'LANDING_PROMPT.md', label: 'LANDING_PROMPT.md' },
  { src: 'HANDOVER_PROMPT.md', label: 'HANDOVER_PROMPT.md' },
  { src: 'templates/AI_WORKFLOW.template.md', label: 'templates/AI_WORKFLOW.template.md' },
  { src: 'templates/BLUEPRINT.template.md', label: 'templates/BLUEPRINT.template.md' },
  { src: 'templates/ARCHITECTURE.template.md', label: 'templates/ARCHITECTURE.template.md' },
  { src: 'templates/DATA_MODEL.template.md', label: 'templates/DATA_MODEL.template.md' },
  { src: 'templates/TASKS.template.md', label: 'templates/TASKS.template.md' },
  { src: 'templates/SESSION_STATE.template.md', label: 'templates/SESSION_STATE.template.md' },
  { src: 'templates/TESTING.template.md', label: 'templates/TESTING.template.md' },
  { src: 'templates/CHECKLISTS.template.md', label: 'templates/CHECKLISTS.template.md' },
  { src: 'templates/CHANGELOG.template.md', label: 'templates/CHANGELOG.template.md' },
  { src: 'templates/profiles/DOMAIN_BOOKING.profile.md', label: 'templates/profiles/DOMAIN_BOOKING.profile.md' }
];

const SINGLE_KIT_SIMPLE_ITEMS = [
  { src: 'LANDING_PROMPT.md', label: 'LANDING_PROMPT.md' },
  { src: 'HANDOVER_PROMPT.md', label: 'HANDOVER_PROMPT.md' },
  { src: 'zlce-starter-kit/BLUEPRINT.md', label: 'BLUEPRINT.md' },
  { src: 'zlce-starter-kit/TASKS.md', label: 'TASKS.md' },
  { src: 'zlce-starter-kit/SESSION_STATE.md', label: 'SESSION_STATE.md' },
  { src: 'zlce-starter-kit/HANDOVER.md', label: 'HANDOVER.md' }
];

export function buildSingleKitMarkdown(baseDir = root, mode = 'full') {
  const normalized = String(mode || 'full').toLowerCase();
  const isSimple = normalized === 'simple' || normalized === 'lite';
  const items = isSimple ? SINGLE_KIT_SIMPLE_ITEMS : SINGLE_KIT_FULL_ITEMS;

  const title = isSimple
    ? '# ZLCE KIT MODE SIMPLE (SATU BERKAS LITE) v4.1.0 GA'
    : '# ZLCE KIT (SATU BERKAS MODE FULL) v4.1.0 GA';

  const subtitle = isSimple
    ? 'Bundel tunggal ringkas Mode SIMPLE / LITE (4 berkas kontrol inti + Landing & Handover Prompt) untuk proyek < ~15 task dan AI berbasis chat/prompt tunggal.'
    : 'Berkas ini adalah bundel tunggal (*derived artifact*) Zero-Loss Context Engineering (ZLCE) v4.1.0 GA. Dihasilkan otomatis dari sumber kanonik `LANDING_PROMPT.md`, `HANDOVER_PROMPT.md`, dan `templates/` agar kompatibel dengan AI berbasis chat/prompt tunggal tanpa multi-upload.';

  const header = [
    title,
    '',
    subtitle,
    '',
    'Setiap berkas di dalamnya dibatasi penanda:',
    '<<<FILE: path>>> dan <<<END FILE>>>.',
    'Perlakukan tiap bagian sebagai berkas terpisah dengan path tersebut.',
    '',
    `MODE: ${isSimple ? 'SIMPLE (LITE - 6 Berkas Inti)' : 'FULL (12 Berkas Lengkap)'}`,
    'DAFTAR BERKAS:',
    ...items.map((f) => `- ${f.label}`),
    ''
  ].join('\n');

  let body = '';
  for (const item of items) {
    const abs = path.join(baseDir, item.src);
    if (!fs.existsSync(abs)) {
      throw new Error(`Missing canonical source for single-kit (${normalized}): ${item.src}`);
    }
    const content = fs.readFileSync(abs, 'utf8').trim();
    body += `\n<<<FILE: ${item.label}>>>\n${content}\n<<<END FILE>>>\n`;
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
const modeIdx = args.indexOf('--mode');
const explicitMode = modeIdx !== -1 && args[modeIdx + 1] ? args[modeIdx + 1].toLowerCase() : null;
const simpleKitIdx = args.indexOf('--simple-kit');
const singleKitIdx = args.indexOf('--single-kit');

if (simpleKitIdx !== -1 || singleKitIdx !== -1) {
  const flagIdx = simpleKitIdx !== -1 ? simpleKitIdx : singleKitIdx;
  const mode = simpleKitIdx !== -1 ? 'simple' : (explicitMode || 'full');
  const defaultOut = mode === 'simple' || mode === 'lite' ? 'dist/ZLCE_KIT_SIMPLE.md' : 'dist/ZLCE_KIT_SINGLE.md';
  const targetArg = args[flagIdx + 1] && !args[flagIdx + 1].startsWith('--')
    ? args[flagIdx + 1]
    : defaultOut;
  const outPath = path.isAbsolute(targetArg) ? targetArg : path.join(root, targetArg);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const md = buildSingleKitMarkdown(root, mode);
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`[OK] Generated derived single-file kit (${mode}) at ${path.relative(root, outPath) || outPath} (${Buffer.byteLength(md, 'utf8')} bytes).`);
} else {
  runSync();
}

