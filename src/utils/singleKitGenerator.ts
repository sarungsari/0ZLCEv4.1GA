import {
  ZLCE_TEMPLATES,
  LANDING_PROMPT_MD,
  HANDOVER_PROMPT_MD,
  STARTER_BLUEPRINT_LITE_MD,
  STARTER_TASKS_LITE_MD,
  STARTER_SESSION_STATE_LITE_MD,
  STARTER_HANDOVER_LITE_MD
} from '../data/templates';

export type SingleKitMode = 'simple' | 'full';

export interface SingleKitCustomProject {
  projectName?: string;
  blueprintMd?: string;
  tasksMd?: string;
  sessionStateMd?: string;
  handoverMd?: string;
}

export interface SingleKitOutput {
  mode: SingleKitMode;
  filename: string;
  filesList: string[];
  filesCount: number;
  markdown: string;
  estimatedTokens: number;
  byteSize: number;
}

const FULL_TEMPLATE_IDS = [
  'ai-workflow',
  'blueprint',
  'architecture',
  'data-model',
  'tasks',
  'session-state',
  'testing',
  'checklists',
  'changelog',
  'domain-booking'
] as const;

export function generateSingleKitBundle(
  mode: SingleKitMode = 'simple',
  customProject?: SingleKitCustomProject
): SingleKitOutput {
  const entries: { path: string; content: string }[] =
    mode === 'simple'
      ? [
          { path: 'LANDING_PROMPT.md', content: LANDING_PROMPT_MD },
          { path: 'HANDOVER_PROMPT.md', content: HANDOVER_PROMPT_MD },
          { path: 'BLUEPRINT.md', content: customProject?.blueprintMd || STARTER_BLUEPRINT_LITE_MD },
          { path: 'TASKS.md', content: customProject?.tasksMd || STARTER_TASKS_LITE_MD },
          { path: 'SESSION_STATE.md', content: customProject?.sessionStateMd || STARTER_SESSION_STATE_LITE_MD },
          { path: 'HANDOVER.md', content: customProject?.handoverMd || STARTER_HANDOVER_LITE_MD }
        ]
      : [
          { path: 'LANDING_PROMPT.md', content: LANDING_PROMPT_MD },
          { path: 'HANDOVER_PROMPT.md', content: HANDOVER_PROMPT_MD },
          ...FULL_TEMPLATE_IDS.map((id) => {
            const found = ZLCE_TEMPLATES.find((t) => t.id === id);
            if (!found) {
              throw new Error(`Template kanonik tidak ditemukan untuk Single Kit FULL: ${id}`);
            }
            const targetPath =
              id === 'domain-booking'
                ? `templates/profiles/${found.filename}`
                : `templates/${found.filename}`;
            return { path: targetPath, content: found.content };
          })
        ];

  const filesList = entries.map((e) => e.path);
  const title =
    mode === 'simple'
      ? '# ZLCE KIT MODE SIMPLE (SATU BERKAS LITE) v4.1.0 GA'
      : '# ZLCE KIT (SATU BERKAS MODE FULL) v4.1.0 GA';
  const subtitle =
    mode === 'simple'
      ? 'Bundel tunggal ringkas Mode SIMPLE / LITE (4 berkas kontrol inti + Landing & Handover Prompt) untuk proyek < ~15 task dan AI berbasis chat/prompt tunggal.'
      : 'Bundel tunggal Mode FULL ZLCE v4.1.0 GA dari sumber kanonik LANDING_PROMPT.md, HANDOVER_PROMPT.md, dan 10 template baku.';

  const headerLines = [
    title,
    ...(customProject?.projectName ? [`Proyek: ${customProject.projectName}`] : []),
    '',
    subtitle,
    '',
    'Setiap berkas di dalamnya dibatasi penanda:',
    '<<<FILE: path>>> dan <<<END FILE>>>.',
    'Perlakukan tiap bagian sebagai berkas terpisah dengan path tersebut. Jaga aturan preservasi waktu asli ("jam: ?").',
    '',
    `MODE: ${mode === 'simple' ? 'SIMPLE (LITE - 6 Berkas Inti)' : 'FULL (12 Berkas Lengkap)'}`,
    'DAFTAR BERKAS:',
    ...filesList.map((f) => `- ${f}`),
    ''
  ];

  const body = entries
    .map((e) => `<<<FILE: ${e.path}>>>\n${e.content.trim()}\n<<<END FILE>>>`)
    .join('\n\n');

  const markdown = `${headerLines.join('\n')}\n${body}\n`;
  const safeProj = customProject?.projectName
    ? customProject.projectName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '')
    : '';
  const baseFilename = mode === 'simple' ? 'ZLCE_KIT_SIMPLE.md' : 'ZLCE_KIT_SINGLE.md';
  const filename = safeProj ? `${safeProj}-${baseFilename}` : baseFilename;

  return {
    mode,
    filename,
    filesList,
    filesCount: entries.length,
    markdown,
    estimatedTokens: Math.ceil(markdown.length / 4),
    byteSize: new TextEncoder().encode(markdown).length
  };
}
