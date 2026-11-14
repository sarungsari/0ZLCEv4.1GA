import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Download,
  Package,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { ZLCE_TEMPLATES } from '../data/templates';
import { TemplateItem } from '../types/zlce';
import { copyText } from '../utils/clipboard';
import { downloadMarkdownBlob, generateAndDownloadZipBundle } from '../utils/fileExport';
import { generateSingleKitBundle, SingleKitMode } from '../utils/singleKitGenerator';
import { showToast } from './mobile/ToastContainer';

export const TemplatesTab: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem>(ZLCE_TEMPLATES[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedPack, setCopiedPack] = useState(false);
  const [singleKitMode, setSingleKitMode] = useState<SingleKitMode>('simple');
  const [showPackModal, setShowPackModal] = useState(true);
  const [isDownloadingZip, setIsDownloadingZip] = useState<'simple' | 'full' | null>(null);

  const filtered = ZLCE_TEMPLATES.filter((t) => {
    if (categoryFilter === 'all') return true;
    return t.category === categoryFilter;
  });

  const singleKit = useMemo(() => generateSingleKitBundle(singleKitMode), [singleKitMode]);

  const handleCopyFile = async () => {
    const success = await copyText(selectedTemplate.content);
    if (success) {
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    downloadMarkdownBlob(selectedTemplate.content, { filename: selectedTemplate.filename });
  };

  const handleCopyPack = async () => {
    const success = await copyText(singleKit.markdown);
    if (success) {
      setCopiedPack(true);
      showToast(`${singleKit.filename} (${singleKit.filesCount} berkas) disalin ke clipboard.`, 'success');
      setTimeout(() => setCopiedPack(false), 2000);
    }
  };

  const handleDownloadPack = () => {
    const res = downloadMarkdownBlob(singleKit.markdown, { filename: singleKit.filename });
    if (res.success) {
      showToast(`Berkas ${singleKit.filename} (${singleKit.filesCount} berkas) berhasil diunduh.`, 'success');
    }
  };

  const handleDownloadZip = async (zipMode: 'simple' | 'full') => {
    setIsDownloadingZip(zipMode);
    try {
      const res = await generateAndDownloadZipBundle({
        type: zipMode === 'simple' ? 'simple-kit' : 'starter-kit',
        filename: zipMode === 'simple' ? 'zlce-simple-kit-v4.1.0.zip' : 'zlce-starter-kit-v4.1.0.zip'
      });
      if (res.success) {
        showToast(`Bundel ${res.filename} berhasil di-generate & diunduh.`, 'success');
      } else {
        showToast(
          zipMode === 'simple'
            ? 'Mode Statis PWA: jalankan "python3 scripts/create-simple-kit-bundle.py" di Termux, atau gunakan tombol Unduh .md di sebelah kiri.'
            : 'Mode Statis PWA: jalankan "npm run bundles" atau "python3 scripts/create-starter-kit-bundle.py" di Termux.',
          'warning'
        );
      }
    } finally {
      setIsDownloadingZip(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Pustaka Template Kontrol &amp; Pack Studio (ZLCE v4.1.0 GA)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bundel Single-File Kit untuk <strong>Mode SIMPLE (LITE · 6 berkas hemat token)</strong> maupun <strong>Mode FULL (12 berkas lengkap)</strong>, plus generator ZIP on-demand.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isDownloadingZip !== null}
            onClick={() => handleDownloadZip('simple')}
            className="touch-target-44 min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow transition disabled:opacity-60"
            title="Generate on-demand ZIP ringkas khusus Mode SIMPLE / LITE (6 berkas inti + ZLCE_KIT_SIMPLE.md + CLI scripts)"
          >
            <Zap className="w-4 h-4" />
            <span>{isDownloadingZip === 'simple' ? 'Memproses...' : 'Bundel Mode SIMPLE (.ZIP)'}</span>
          </button>

          <button
            type="button"
            disabled={isDownloadingZip !== null}
            onClick={() => handleDownloadZip('full')}
            className="touch-target-44 min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition disabled:opacity-60"
            title="Generate on-demand ZIP lengkap berisi ZLCE_KIT_SIMPLE.md, ZLCE_KIT_SINGLE.md, 10 template, contoh, panduan mobile, dan skrip CLI"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingZip === 'full' ? 'Memproses...' : 'Starter Kit Lengkap (.ZIP)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPackModal(!showPackModal)}
            className="touch-target-44 min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
          >
            <Package className="w-4 h-4" />
            <span>{showPackModal ? 'Sembunyikan Single Kit' : 'Buka Generator Single Kit'}</span>
          </button>
        </div>
      </div>

      {/* Single Kit Packer Panel (Mode SIMPLE / LITE vs Mode FULL) */}
      {showPackModal && (
        <div className="p-4 sm:p-5 rounded-xl bg-indigo-950/30 border border-indigo-800/60 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <h3 className="text-sm font-bold text-indigo-100">
                  Generator Kit Satu Berkas: <code className="text-cyan-300 font-mono">{singleKit.filename}</code>
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-900 text-emerald-300 border border-emerald-700/50">
                  {singleKit.filesCount} Berkas · ~{singleKit.estimatedTokens.toLocaleString()} token
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {singleKitMode === 'simple'
                  ? 'Mode SIMPLE (LITE): hanya menyertakan LANDING_PROMPT, HANDOVER_PROMPT, dan 4 berkas kontrol inti LITE (BLUEPRINT, TASKS, SESSION_STATE, HANDOVER). Ideal untuk AI web/mobile chat & hemat kuota token.'
                  : 'Mode FULL: menyertakan LANDING_PROMPT, HANDOVER_PROMPT, 9 template kontrol lengkap + profil domain booking untuk proyek skala besar (>15 task / multi-service).'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSingleKitMode('simple')}
                className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold border transition ${
                  singleKitMode === 'simple'
                    ? 'bg-amber-600 border-amber-400 text-white shadow'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Mode SIMPLE (LITE · 6 Berkas)
              </button>
              <button
                type="button"
                onClick={() => setSingleKitMode('full')}
                className={`touch-target-44 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold border transition ${
                  singleKitMode === 'full'
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Mode FULL (12 Berkas)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-900/50">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-300">
              {singleKit.filesList.map((fname) => (
                <span key={fname} className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-cyan-300">
                  {fname}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyPack}
                className="touch-target-44 min-h-[44px] text-xs px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition"
              >
                {copiedPack ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPack ? 'Tersalin!' : `Salin ${singleKit.filename}`}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPack}
                className="touch-target-44 min-h-[44px] text-xs px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh {singleKit.filename}</span>
              </button>
            </div>
          </div>

          <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-xs max-h-44 overflow-y-auto rounded-lg border border-indigo-900/40 whitespace-pre-wrap">
            {singleKit.markdown.substring(0, 900)}... ({singleKit.filesCount} berkas lengkap siap tempel)
          </pre>
        </div>
      )}

      {/* Main Grid: Template browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Template List */}
        <div className="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {filtered.length} Berkas Pustaka
            </span>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="touch-target-44 min-h-[44px] text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none"
            >
              <option value="all">Semua Kategori ({ZLCE_TEMPLATES.length})</option>
              <option value="state">State (Session)</option>
              <option value="workflow">Workflow &amp; Tata Kelola</option>
              <option value="spec">Spesifikasi Arsitektur</option>
              <option value="profile">Profil Domain</option>
              <option value="example">Contoh Terisi (.example.md)</option>
              <option value="install">Panduan Instalasi</option>
              <option value="usage">Panduan Pemakaian</option>
              <option value="blueprint">Arsitektur Blueprint</option>
            </select>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[560px] overflow-y-auto">
            {filtered.map((item) => {
              const isSelected = item.id === selectedTemplate.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTemplate(item)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/40 border-l-4 border-cyan-400'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-200 truncate pr-2">
                      {item.filename}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-slate-800 text-cyan-300">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-xs text-slate-300 font-medium mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Template Content Preview */}
        <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold block">
                {selectedTemplate.filename}
              </span>
              <span className="text-xs text-slate-400">{selectedTemplate.description}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFile}
                className="touch-target-44 min-h-[44px] flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFile ? 'Tersalin' : 'Salin'}
              </button>
              <button
                type="button"
                onClick={handleDownloadFile}
                className="touch-target-44 min-h-[44px] flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition"
              >
                <Download className="w-3.5 h-3.5" /> Unduh .md
              </button>
            </div>
          </div>

          <pre className="flex-1 p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-y-auto max-h-[520px] whitespace-pre-wrap leading-relaxed">
            {selectedTemplate.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
