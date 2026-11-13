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

## 7. PETA FASE BASELINE OPERASIONAL TERKUNCI (v4.1.0 GA)

Riwayat pengembangan FASE 0 s/d FASE 21 (`TASK-001` s/d `TASK-134`) telah dikunci dan diarsipkan di `archive/history/`. Berkas kontrol aktif memuat baseline bersih siap pakai untuk 3 alur proyek (`NEW`, `CONTINUE`, `MODIFY`) yang tersinkron 1:1 antara [`TASKS.md`](TASKS.md), [`SESSION_STATE.md`](SESSION_STATE.md), dan [`src/data/taskPhases.ts`](src/data/taskPhases.ts):

| Fase | Rentang Task | Jumlah | Fokus Baseline Terkunci | Status |
| :--- | :--- | :---: | :--- | :---: |
| **Fase 0** | `TASK-001` s/d `TASK-003` | 3 | Baseline inti PWA 6-tab & offline SW, isolasi multi-proyek & starter-kit bersih, validasi Zero-Secret GA | DONE |
| **TOTAL** | `TASK-001` s/d `TASK-003` | **3** | **Baseline Operasional Terkunci & Bersih (`v4.1.0 GA`)** | **100% DONE** |
