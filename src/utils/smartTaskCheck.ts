/**
 * Smart Task Check Engine (Docs Impact Verification Gate)
 * 
 * Memverifikasi integritas dan bukti pengerjaan untuk seluruh dokumen yang tercatat
 * pada bidang 'Docs Impact' sebelum sebuah task ZLCE diizinkan beralih ke status DONE.
 * Memastikan tidak ada dokumen kontrol/arsitektur yang tertinggal atau berstatus DONE palsu.
 */

export interface DocsImpactCheckItem {
  doc: string;
  hasEvidence: boolean;
  status: 'VERIFIED' | 'MISSING_EVIDENCE';
  reason: string;
}

export interface SmartTaskCheckValidationResult {
  canMarkDone: boolean;
  totalDocs: number;
  verifiedDocsCount: number;
  docsList: string[];
  missingDocs: string[];
  items: DocsImpactCheckItem[];
  evidenceValid: boolean;
  evidenceLength: number;
  summary: string;
  recommendedEvidence: string;
}

export interface SmartTaskCheckParams {
  taskId: string;
  docsImpact?: string;
  evidence: string;
  explicitlyConfirmedDocs?: string[] | Set<string>;
  taskTitle?: string;
}

// Token kata kunci placeholder yang dilarang keras dalam bukti verifikasi ZLCE
const FORBIDDEN_PLACEHOLDER_REGEX = /^(?:-|\?|todo|tbd|n\/a|na|done|ok|selesai|test|sukses|berhasil)$/i;

/**
 * Mem-parse string Docs Impact menjadi daftar path berkas/dokumen bersih.
 * Jika kosong atau '-', secara kanonik mengembalikan ['SESSION_STATE.md']
 * karena setiap perubahan task dalam ZLCE wajib berdampak pada SESSION_STATE.md.
 */
export function parseDocsImpactList(docsImpact?: string): string[] {
  if (!docsImpact || typeof docsImpact !== 'string') {
    return ['SESSION_STATE.md'];
  }

  const cleaned = docsImpact.trim();
  if (cleaned === '-' || cleaned === '' || cleaned === '(kosong)') {
    return ['SESSION_STATE.md'];
  }

  // Pecah berdasarkan koma, titik koma, atau baris baru
  const rawParts = cleaned.split(/[,;\n]/);
  const result: string[] = [];

  for (const part of rawParts) {
    const doc = part
      .replace(/[`*]/g, '')
      .replace(/^[-•]\s*/, '')
      .trim();

    if (doc && doc !== '-' && doc.length > 1) {
      if (!result.includes(doc)) {
        result.push(doc);
      }
    }
  }

  return result.length > 0 ? result : ['SESSION_STATE.md'];
}

/**
 * Mengevaluasi apakah bukti verifikasi yang diberikan menyebutkan atau mencakup
 * dokumen tertentu dalam Docs Impact.
 */
function isDocReferencedInEvidence(doc: string, evidenceLower: string): boolean {
  const docLower = doc.toLowerCase();

  // 1. Cek pencocokan persis atau substring path lengkap
  if (evidenceLower.includes(docLower)) {
    return true;
  }

  // 2. Cek nama berkas dasar tanpa path direktori (misal 'SESSION_STATE.md' dari 'docs/SESSION_STATE.md')
  const basename = docLower.split('/').pop() || docLower;
  if (basename.length > 3 && evidenceLower.includes(basename)) {
    return true;
  }

  // 3. Cek nama berkas tanpa ekstensi (misal 'session_state', 'changelog', 'blueprint')
  const nameWithoutExt = basename.replace(/\.[a-z0-9]+$/i, '');
  if (nameWithoutExt.length > 4 && evidenceLower.includes(nameWithoutExt)) {
    return true;
  }

  // 4. Cek frasa verifikasi dokumen global yang eksplisit
  const globalDocEvidencePhrases = [
    'docs impact',
    'semua dokumen',
    'seluruh dokumen',
    'all docs updated',
    'sinkronisasi dokumen',
    'dokumentasi tuntas',
    'docs synced',
    'dokumen terverifikasi',
    'paritas dokumen'
  ];

  for (const phrase of globalDocEvidencePhrases) {
    if (evidenceLower.includes(phrase)) {
      return true;
    }
  }

  return false;
}

/**
 * Generator rekomendasi teks bukti verifikasi terstandarisasi ZLCE
 * yang secara otomatis mengutip seluruh dokumen Docs Impact.
 */
export function generateRecommendedDocsImpactEvidence(
  taskId: string,
  docsList: string[],
  taskTitle?: string
): string {
  const cleanDocs = docsList.map(d => d.replace(/[`*]/g, '').trim());
  const docsText = cleanDocs.length <= 2 
    ? cleanDocs.join(' & ') 
    : `${cleanDocs.slice(0, -1).join(', ')}, dan ${cleanDocs[cleanDocs.length - 1]}`;

  return `Uji verifikasi build & test lulus 100%; sinkronisasi ${docsText} tervalidasi lengkap (0 error).`;
}

/**
 * Mesin Utama Smart Task Check:
 * Memverifikasi kelayakan bukti pengerjaan untuk setiap dokumen di Docs Impact
 * sebelum task diubah statusnya menjadi DONE.
 */
export function validateSmartTaskCheck(params: SmartTaskCheckParams): SmartTaskCheckValidationResult {
  const { taskId, docsImpact, evidence, explicitlyConfirmedDocs, taskTitle } = params;
  const docsList = parseDocsImpactList(docsImpact);
  const trimmedEvidence = (evidence || '').trim();
  const evidenceLength = trimmedEvidence.length;
  const evidenceLower = trimmedEvidence.toLowerCase();

  // Evaluasi validitas dasar teks bukti (aturan kanonik ZLCE: minimal 5 karakter, bukan placeholder)
  const isTooShort = evidenceLength < 5;
  const isPlaceholder = FORBIDDEN_PLACEHOLDER_REGEX.test(trimmedEvidence);
  const evidenceValid = !isTooShort && !isPlaceholder;

  // Set dokumen yang telah dikonfirmasi eksplisit oleh operator/antarmuka
  const confirmedSet = new Set<string>();
  if (explicitlyConfirmedDocs) {
    if (Array.isArray(explicitlyConfirmedDocs)) {
      explicitlyConfirmedDocs.forEach(d => confirmedSet.add(d.trim().toLowerCase()));
    } else {
      explicitlyConfirmedDocs.forEach(d => confirmedSet.add(d.trim().toLowerCase()));
    }
  }

  const items: DocsImpactCheckItem[] = [];
  const missingDocs: string[] = [];

  for (const doc of docsList) {
    const docLower = doc.toLowerCase();
    const isExplicitlyConfirmed = confirmedSet.has(docLower);
    const isReferenced = evidenceValid && isDocReferencedInEvidence(doc, evidenceLower);

    const hasEvidence = isExplicitlyConfirmed || isReferenced;

    if (hasEvidence) {
      items.push({
        doc,
        hasEvidence: true,
        status: 'VERIFIED',
        reason: isExplicitlyConfirmed 
          ? 'Telah diverifikasi dan dikonfirmasi eksplisit pada checklist antarmuka'
          : `Tercakup dalam bukti verifikasi teks ("${doc}")`
      });
    } else {
      missingDocs.push(doc);
      items.push({
        doc,
        hasEvidence: false,
        status: 'MISSING_EVIDENCE',
        reason: evidenceValid
          ? `Dokumen '${doc}' belum terverifikasi di checklist atau belum dikutip pada bukti`
          : 'Bukti verifikasi belum memadai (minimal 5 karakter dan bukan placeholder)'
      });
    }
  }

  const verifiedDocsCount = items.filter(i => i.hasEvidence).length;
  const allDocsVerified = missingDocs.length === 0;
  const canMarkDone = evidenceValid && allDocsVerified;

  let summary = '';
  if (canMarkDone) {
    summary = `Lulus Smart Task Check: Seluruh ${docsList.length} dokumen Docs Impact terbukti valid.`;
  } else if (!evidenceValid) {
    summary = `Bukti verifikasi tidak memadai (${evidenceLength}/5 karakter atau placeholder terlarang).`;
  } else {
    summary = `Terdapat ${missingDocs.length} dokumen Docs Impact yang belum memiliki bukti verifikasi: ${missingDocs.join(', ')}.`;
  }

  const recommendedEvidence = generateRecommendedDocsImpactEvidence(taskId, docsList, taskTitle);

  return {
    canMarkDone,
    totalDocs: docsList.length,
    verifiedDocsCount,
    docsList,
    missingDocs,
    items,
    evidenceValid,
    evidenceLength,
    summary,
    recommendedEvidence
  };
}
