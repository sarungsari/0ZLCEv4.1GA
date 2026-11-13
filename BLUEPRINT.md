# SPESIFIKASI TEKNIS & BLUEPRINT SISTEM: ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)

Indeks spesifikasi sistem tingkat root. Sumber kebenaran terperinci arsitektur mobile berada di [`docs/mobile/MOBILE_BLUEPRINT.md`](docs/mobile/MOBILE_BLUEPRINT.md) dan [`docs/mobile/blueprint/`](docs/mobile/blueprint/).

---

## 1. PARAMETER SISTEM & LINGKUNGAN

* **Nama Sistem:** ZLCE Mobile Workbench v4.1.0 GA (`ZLCEv4.1Mob`)
* **Profil Domain:** `none` (Stasiun kerja PWA & Termux rekayasa konteks multi-AI untuk tablet Android)
* **Lingkungan Produksi:**
  - Runtime: Node.js `>=20.19.0`, Python `3.10+` (standard library)
  - Terminal & Git Bridge: Termux Linux (Android), Bash, Git (`--ff-only`, branch per task)
  - Server Lokal / Bridge: Vite dev/preview bridge (`vite-session-sync.ts`, loopback opsional `HOST=127.0.0.1:3000`)
  - Frontend Framework: React `^19.0.1` + TypeScript `^7.0.2` + Vite `^8.3.0` + Tailwind CSS `^4.3.3` PWA
* **Versi Dependensi Terverifikasi (`package.json`):**

| Dependensi | Versi | Sumber Verifikasi | Tanggal |
| :--- | :--- | :--- | :--- |
| `react` / `react-dom` | `^19.0.1` | `package.json`, `package-lock.json` | 2026-11-13 |
| `vite` | `^8.3.0` | `package.json`, `npm run build` | 2026-11-13 |
| `@vitejs/plugin-react` | `^6.1.1` | `package.json` | 2026-11-13 |
| `@tailwindcss/vite` / `tailwindcss` | `^4.3.3` | `package.json`, `src/index.css` | 2026-11-13 |
| `lucide-react` | `^0.546.0` | `package.json` | 2026-11-13 |
| `motion` | `^12.23.24` | `package.json` | 2026-11-13 |
| `typescript` / `tsx` | `^7.0.2` / `^4.21.0` | `package.json`, `tsc --noEmit` | 2026-11-13 |

* **Standar Keamanan:**
  - Lingkungan lokal/offline-first (`HOST=127.0.0.1` untuk tablet bersama).
  - Masukan: validasi skema `zlce-check.py`, sanitasi shell POSIX `commandSanitizer.ts`, dan pemblokiran injeksi.
  - Rahasia: **Zero-Secret Policy** (`redactSecrets.ts`, `security-audit.sh`, `clean-auth.sh`), profil tim `@zlce.local` non-kredensial, 0 token di LocalStorage maupun repositori.

---

## 2. BATASAN DOMAIN BISNIS

1. **Aturan Bisnis (BR-xx):**
   - `BR-01`: Tepat 1 task berstatus `IN_PROGRESS` pada satu waktu (`taskClaimManager.ts`, `zlce-check.py`).
   - `BR-02`: Status `DONE` wajib disertai bukti verifikasi nyata ($\ge 5$ karakter), lulus `Smart Task Check` (`Docs Impact`), dan disetujui (`ya (oleh: Nama)`).
   - `BR-03`: Setiap perubahan kode diisolasi ke branch `task/TASK-XXX` dengan atribusi per-commit `-c user.name` & `-c user.email` (dilarang push ke `main`).
   - `BR-04`: Ketahanan data bekerja dengan model Loss-Bounded Persistence (`RPO <= 400ms` debounce, flush sinkron `visibilitychange`/`pagehide`).
2. **Lingkup & Batas Operasional:**
   - Perangkat target: Tablet Android Samsung Galaxy Tab A7 Lite (SM-T225, 8.7", 1340x800 / 800x1340, RAM 3GB).
   - Pengguna: 8 anggota tim estafet resmi (`Eko`, `Oned`, `Cxperia`, `Sulistiyani`, `Layang`, `Acimau`, `Kepek`, `Gete`).
3. **Out of Scope:**
   - Aplikasi pencatat eksternal berat (Obsidian/Joplin dieksklusikan per `ADR-09`).
   - Penyimpanan token/PAT persisten di LocalStorage atau server database eksternal.

---

## 3. MATRIKS MODUL (6-TAB KANONIK FASE 19)

| ID Modul | Nama Modul | Fungsi Utama | Dependensi |
| :--- | :--- | :--- | :--- |
| `MOD-01` | Shell & PWA Core | `Header.tsx` (6-tab), `MobileLayout.tsx`, `sw.js`, `manifest.webmanifest`, `useVisualViewport` | React 19, Tailwind |
| `MOD-02` | `DashboardTab` | Strip status teknis, task spotlight 1-ketuk, Smart Task Check, matriks backlog 22 fase (Fase 0 s/d 21) | `MOD-01`, `taskPhases.ts` |
| `MOD-03` | `SessionStateTab` | Visual Studio `SESSION_STATE.md`, Raw Markdown, WAL/Import/Export, `SessionTimelineTab` | `MOD-01`, `sessionStateValidator.ts` |
| `MOD-04` | `AiWorkbenchTab` | `ContextPackTab`, `PromptStudio`, `ResultCaptureTab` (Invarian I4), `AiHandoverWizard`, `FeedbackReviewTab` | `MOD-03`, `tokenBudgetAdapter.ts` |
| `MOD-05` | `TerminalGitTab` | `CommandHubTab`, `GitSyncTab`, `RecoveryCommandSection` (Kasus A–D), `SecurityAuthTab` (`clean-auth`) | `MOD-01`, `commandSanitizer.ts` |
| `MOD-06` | `DiagnosticsTab` | `TestHarnessTab` (73+ checks), `RevisionTriageTab` (S/M/L), `PerformanceAuditTab` | `MOD-01`, `performanceAuditEngine.ts` |
| `MOD-07` | `DocsReferenceTab` | `WorkspaceReader` (4 pilar), `TutorialTab` (10 langkah), `TemplatesTab` + `ZLCE_KIT_SINGLE.md` | `MOD-01`, `templates.ts` |

---

## 4. INTEGRASI & JEMBATAN SISTEM

* **Vite Disk Bridge (`vite-session-sync.ts`):** Sinkronisasi dua arah `/api/session-state` & SSE `/api/session-state/watch` saat dev-server aktif; fallback halus ke Mode Statis PWA + LocalStorage saat offline/hosting statis.
* **Termux CLI Dispatcher (`scripts/zlce/zlce`):** Eksekusi sadar oleh pengguna (copy 1-tap) untuk `zlce check`, `zlce snapshot`, `zlce push`, `zlce clean-auth`.
* **Cetak Biru Lengkap (`14 Modul`):** Lihat indeks [`docs/mobile/MOBILE_BLUEPRINT.md`](docs/mobile/MOBILE_BLUEPRINT.md) dan [`docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md`](docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md) s/d [`14_MULTI_AI_TEAM_MODEL.md`](docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md).

---

## 5. NON-FUNCTIONAL REQUIREMENTS (NFR)

1. **Ergonomi Sentuh Tablet:** 100% kontrol interaktif $\ge 44\times 44\text{px}$ (`touch-target-44 min-h-[44px]`), tipografi informatif $\ge 12\text{px}$ (`text-xs`), 0 horizontal overflow di `1340x800` & `800x1340`.
2. **Ketahanan Offline & Memori (RAM 3GB):** App Shell PWA Cache-First (`zlce-mobile-v4.1.0`), lazy code splitting per tab, debounce auto-draft `400ms` + flush sinkron `visibilitychange`/`pagehide`.
3. **Auditability & Zero-Secret:** Atribusi provenance penuh `[Aktor, Model, Akun, Timestamp WIB, Task ID]`, 0 kebocoran kredensial (`scripts/security-audit.sh`).

---

## 6. ASUMSI & KEPUTUSAN TERKONFIRMASI

Seluruh asumsi aktif (`ASM-01` s/d `ASM-03`) berstatus `CONFIRMED` di [`SESSION_STATE.md`](SESSION_STATE.md) Bagian 4. Rincian 9 keputusan arsitektur tercatat di [`docs/mobile/blueprint/12_ARCHITECTURE_DECISIONS.md`](docs/mobile/blueprint/12_ARCHITECTURE_DECISIONS.md).

---

## 7. PETA FASE IMPLEMENTASI TERKUNCI (FASE 0 s/d FASE 21 — 134/134 TASK DONE)

Seluruh 22 fase telah diaudit bebas *crosslink* (0 dependensi maju, 0 siklus, rentang task berkesinambungan 1–134, 100% sinkron antara [`TASKS.md`](TASKS.md), [`SESSION_STATE.md`](SESSION_STATE.md), [`src/data/taskPhases.ts`](src/data/taskPhases.ts), dan [`docs/mobile/blueprint/11_IMPLEMENTATION_ROADMAP.md`](docs/mobile/blueprint/11_IMPLEMENTATION_ROADMAP.md)):

| Fase | Rentang Task | Jumlah | Fokus Utama | Status |
| :--- | :--- | :---: | :--- | :---: |
| **Fase 0** | `TASK-001` s/d `TASK-002` | 2 | Baseline uji, test runner & struktur komponen mobile | DONE |
| **Fase 1** | `TASK-003` s/d `TASK-007` | 5 | Fondasi PWA, manifest, Service Worker, ergonomi 8.7", Member & Project Switcher | DONE |
| **Fase 2** | `TASK-008` s/d `TASK-012` | 5 | Workspace Markdown, parser, file picker, exporter & auto-draft cache 400ms | DONE |
| **Fase 3** | `TASK-013` s/d `TASK-018` | 6 | Portable Context Pack, token budget adapter, prompt studio, provenance & cold-start AI | DONE |
| **Fase 4** | `TASK-019` s/d `TASK-024` | 6 | Tim estafet 8 anggota, aturan 1 task `IN_PROGRESS`, persetujuan gerbang & handover | DONE |
| **Fase 5** | `TASK-025` s/d `TASK-030` | 6 | Command Hub, shell sanitizer POSIX, One-Tap Copy, CLI `zlce` & paste-back | DONE |
| **Fase 6** | `TASK-031` s/d `TASK-035` | 5 | Git branch per task, `-c user.name`, safe pull `--ff-only`, `clean-auth` & resolusi konflik | DONE |
| **Fase 7** | `TASK-036` s/d `TASK-040` | 5 | Uji E2E 14 skenario, LMK recovery, offline 100%, ergonomi SM-T225 & Zero-Secret | DONE |
| **Fase 8** | `TASK-041` s/d `TASK-043` | 3 | Panduan instalasi tablet, user guide tim estafet & troubleshooting Kasus A–D | DONE |
| **Fase 9** | `TASK-044` s/d `TASK-046` | 3 | Generator prompt audit multi-AI, bundel ZIP review, Q&A & integrator revisi | DONE |
| **Fase 10** | `TASK-047` s/d `TASK-060` | 14 | Remediasi audit `AUD-001..014`: pre-commit hook, LMK lifecycle, isolation & atomic write | DONE |
| **Fase 11** | `TASK-061` s/d `TASK-074` | 14 | Remediasi Claude 5.5 `AUD-015..028`: closure gate, POSIX quoting, redaksi & target sentuh | DONE |
| **Fase 12** | `TASK-075` s/d `TASK-082` | 8 | Production Hardening `AUD2-001..008`: RPO <= 400ms, CAS claim guard & deterministic SW | DONE |
| **Fase 13** | `TASK-083` s/d `TASK-088` | 6 | Final polish `AUD3-001..006`: email `@zlce.local`, `HOST=127.0.0.1` & tab routing | DONE |
| **Fase 14** | `TASK-089` s/d `TASK-095` | 7 | Pemisahan 3 pilar dokumentasi, tutorial Android, log kerja anggota & review PWA | DONE |
| **Fase 15** | `TASK-096` s/d `TASK-100` | 5 | Remediasi P0: Zero-Secret persistence gate, fail-closed `clean-auth`, keyboard & SW | DONE |
| **Fase 16** | `TASK-101` s/d `TASK-106` | 6 | Peningkatan UX P1: atomic claim, accessible dialogs, `React.lazy` & hard token cap | DONE |
| **Fase 17** | `TASK-107` s/d `TASK-111` | 5 | Rekonsiliasi 14 blueprint `AS-BUILT`, Tailwind polish, telemetri SM-T225 & audit performa | DONE |
| **Fase 18** | `TASK-112` s/d `TASK-118` | 7 | Remediasi review PWA ulang `R-01..R-12`, ikon PWA, `ModalShell`, `DraftTextarea` & `--header-h` | DONE |
| **Fase 19** | `TASK-119` s/d `TASK-124` | 6 | Penyederhanaan frontend PWA ke 6 tab kanonik & dasbor teknis berdensitas tinggi | DONE |
| **Fase 20** | `TASK-125` s/d `TASK-129` | 5 | Kelengkapan 10 dokumen Mode `FULL`, Mode `LITE` starter kit, arsip audit & bundel v4.1.0 GA | DONE |
| **Fase 21** | `TASK-130` s/d `TASK-134` | 5 | Single Source of Truth, hapus 4 komponen yatim, `sync-assets` 25 target, `release-bundles/` & refaktor `TutorialTab` | DONE |
| **TOTAL** | `TASK-001` s/d `TASK-134` | **134** | **Seluruh 22 Fase Terintegrasi, Bebas Crosslink & Terkunci (`v4.1.0 GA / v4.1.1`)** | **100% DONE** |
