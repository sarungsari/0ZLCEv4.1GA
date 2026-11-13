# BLUEPRINT 11: PETA JALAN IMPLEMENTASI (IMPLEMENTATION ROADMAP)
## Tahapan Pengembangan Bertahap dari Fase 0 hingga Fase 21 (134 Task Tuntas)

Tanggal: 2026-11-13  
Status: **APPROVED / AS-BUILT**  
Rujukan Dokumen: `TASKS.md`, `SESSION_STATE.md`, `docs/mobile/MOBILE_BLUEPRINT.md`

---

## 1. URUTAN PRIORITAS PENGEMBANGAN

Sesuai arahan arsitektur ZLCE Mobile Workbench v4.1.0 GA (`ZLCEv4.1Mob`):
- **Prioritas Utama:** Fitur **Multi-AI, Multi-Akun, dan Tim Estafet** didahulukan (Fase 3 & Fase 4).
- **Eksklusi Obsidian (`ADR-09`):** Integrasi Obsidian/Joplin dikeluarkan dari core sejak Fase 8 demi keandalan RAM 3GB; dokumentasi & pustaka panduan mandiri disediakan di dalam PWA (`Fase 8`, `Fase 14`, `Fase 21`).
- **Pengerasan & Konsolidasi Lanjutan:** Audit keamanan/LMK (`Fase 9–13`), pemisahan 3 pilar dokumentasi & UX tablet (`Fase 14–18`), penyederhanaan 6-tab (`Fase 19`), keselarasan kontrol Mode `FULL`/`LITE` (`Fase 20`), dan konsolidasi Single Source of Truth (`Fase 21`).

```
[ Fase 0–2: Baseline, Fondasi PWA 8.7" & Markdown Workspace (TASK-001..012) ]
                                    │
                                    ▼
[ Fase 3–4: Multi-AI Context Pack & Tim Estafet 8 Anggota (TASK-013..024) ]
                                    │
                                    ▼
[ Fase 5–7: Command Hub, Termux Git Sync & Uji Fisik SM-T225 (TASK-025..040) ]
                                    │
                                    ▼
[ Fase 8–9: Panduan Operasional & Review Multi-AI Eksternal (TASK-041..046) ]
                                    │
                                    ▼
[ Fase 10–13: Remediasi Audit, Hardening GA & Final Polish (TASK-047..088) ]
                                    │
                                    ▼
[ Fase 14–18: 3 Pilar Docs, Zero-Secret Gate, UX P1 & Review PWA (TASK-089..118) ]
                                    │
                                    ▼
[ Fase 19–21: 6-Tab Kanonik, Mode FULL/LITE & Single Source of Truth (TASK-119..134) ]
```

---

## 2. RINCIAN TAHAPAN PER FASE (FASE 0 s/d FASE 21)

### Fase 0 — Baseline Uji & Persiapan (`TASK-001` s/d `TASK-002`)
- **Fokus:** Menetapkan tag `baseline-track1-revised`, memverifikasi test runner baseline, dan menyiapkan direktori terisolasi `src/components/mobile/` serta `src/types/mobile.ts`.
- **Versi:** `v3.3.0` (2 task `DONE`)

### Fase 1 — Fondasi PWA & Ergonomi Tablet Android (`TASK-003` s/d `TASK-007`)
- **Fokus:**
  - Web App Manifest (`manifest.webmanifest`) dengan display standalone, Service Worker (`sw.js`), dan aset ikon PWA (`192x192`, `512x512`, maskable).
  - Penyesuaian layout tablet 8.7" (target sentuh `>= 44px` dan `visualViewport` API).
  - Komponen bilah atas: **Active Member Selector** dan **Project Switcher**.
- **Versi:** `v4.0.0-alpha.1` (5 task `DONE`)

### Fase 2 — Workspace Markdown & Manajemen Multi-Proyek (`TASK-008` s/d `TASK-012`)
- **Fokus:**
  - Parser & Reader dokumen kontrol ZLCE (`markdownParser.ts`, `WorkspaceReader.tsx`), File Picker impor, dan Exporter Blob `.md`.
  - Penegakan integritas `SESSION_STATE.md` (`sessionStateValidator.ts`) dan auto-draft cache LocalStorage dengan debounce `400ms`.
- **Versi:** `v4.0.0-alpha.2` (5 task `DONE`)

### Fase 3 — Multi-AI & Context Pack (`TASK-013` s/d `TASK-018`) [PRIORITAS UTAMA]
- **Fokus:**
  - Portable Context Pack Generator (*Schema-before-Data*), adapter kuota token multi-AI, Prompt Studio terstruktur, Result Capture dengan injeksi *provenance*, Handover Manager lintas AI, dan uji Cold-Start Lintas AI (`Claude -> Gemini`).
- **Versi:** `v4.0.0-beta.1` (6 task `DONE`)

### Fase 4 — Multi-Akun & Tim Estafet (`TASK-019` s/d `TASK-024`) [PRIORITAS UTAMA]
- **Fokus:**
  - Registry 8 anggota tim (`teamMembers.ts`, alias non-kredensial), aturan 1 task `IN_PROGRESS`, persetujuan Gerbang Kualitas dengan provenance penyetuju (`ya (oleh: Nama)`), Device Handover Wizard, Session History Timeline, dan uji Cold-Start Lintas Anggota.
- **Versi:** `v4.0.0-beta.2` (6 task `DONE`)

### Fase 5 — Command & Template Hub Termux (`TASK-025` s/d `TASK-030`)
- **Fokus:**
  - Katalog template perintah berversi berlabel risiko, Parameter Binder & Strict Shell Sanitizer POSIX, `OneTapCopyButton`, CLI Dispatcher `scripts/zlce/zlce`, Paste-Back Parser, dan protokol pemulihan Kasus A–D.
- **Versi:** `v4.0.0-rc.1` (6 task `DONE`)

### Fase 6 — Git & Sinkronisasi Cabang Tim (`TASK-031` s/d `TASK-035`)
- **Fokus:**
  - Branch per task (`task/TASK-xxx`) & proteksi `main`, injeksi identitas `-c user.name=...`, safe pull (`--ff-only`), cache kredensial RAM `900s` + `clean-auth.sh`, dan wizard resolusi konflik cabang.
- **Versi:** `v4.0.0-rc.2` (5 task `DONE`)

### Fase 7 — Pengujian Integrasi Penuh pada Tablet Fisik SM-T225 (`TASK-036` s/d `TASK-040`)
- **Fokus:**
  - E2E 14 skenario ZLCE, uji ketahanan Android LMK, operasi offline 100% (Mode Pesawat), verifikasi ergonomi layar sentuh 8.7" (`44px+`), dan audit keamanan Zero-Secret (`security-audit.sh`).
- **Versi:** `v4.0.0-rc.3` (5 task `DONE`)

### Fase 8 — Dokumentasi & Panduan Operasional Terpadu (`TASK-041` s/d `TASK-043`)
- **Fokus:**
  - `docs/mobile/INSTALLATION.md`, `TERMUX_SETUP.md`, `USER_GUIDE.md`, dan `TROUBLESHOOTING.md` (Kasus A–D & mitigasi LMK). Obsidian/Joplin dikeluarkan secara permanen per `ADR-09`.
- **Versi:** `v4.0.0-rc.4` (3 task `DONE`)

### Fase 9 — Audit, Testing & Review Multi-AI Eksternal (`TASK-044` s/d `TASK-046`)
- **Fokus:**
  - `TASK-044`: Generator prompt mandat audit terstruktur ber-stop token dan bundel ZIP proyek (`scripts/create-audit-bundle.py`, output dipindahkan ke `release-bundles/zlce-audit-review-bundle.zip` pada Fase 21).
  - `TASK-045`: Modul tanggapan tanya-jawab & klarifikasi berkas referensi untuk AI peninjau.
  - `TASK-046`: Integrator review final dan perencana task perbaikan terstruktur.
- **Versi:** `v4.0.0` (46/46 Task Awal `DONE`, 35/35 Checks PASS)

### Fase 10 — Remediasi Audit & Pengerasan Sistem (`TASK-047` s/d `TASK-060`)
- **Fokus:** Menuntaskan temuan audit `AUD-001` s/d `AUD-014`: pre-commit hook Zero-Secret (`install-hooks.sh`), uji lifecycle LMK, browser restart validation, telemetri fisik SM-T225, isolasi sesi multi-user, eksklusivitas klaim task, atomic persistence, navigasi offline 10 tab, kanonisasi Git workflow, normalisasi test runner, sinkronisasi baseline blueprint, dan determinisme bundel ZIP.
- **Capaian:** 14 task `DONE` (`TC-P10-01` s/d `TC-P10-14`).

### Fase 11 — Remediasi Audit Lanjutan Claude 5.5 Review (`TASK-061` s/d `TASK-074`)
- **Fokus:** Menuntaskan temuan `AUD-015` s/d `AUD-028`: Bundle Closure Verification Gate, runner counter dinamis, POSIX shell quoting ketat, perbaikan stale closure draft shared tablet, robust Termux dispatcher, fail-closed `security-audit.sh`, normalisasi izin file ZIP, `clean-auth` socket cleanup, redaksi secret aktif (`redactSecrets.ts`), akurasi dokumentasi SIGKILL LMK, isolasi `127.0.0.1`, autentikasi 8 anggota di `zlce-check`, uji kuantitatif touch target `44px+`, dan safety factor estimasi token `3.2`.
- **Capaian:** 14 task `DONE` (`TC-P11-01` s/d `TC-P11-14`).

### Fase 12 — GA Production Hardening & GPT-6 Remediation (`TASK-075` s/d `TASK-082`)
- **Fokus:** Menuntaskan `AUD2-001` s/d `AUD2-008`: paritas closure ekspor bundel, non-destructive draft cache `restore(persist(x)) === x`, model ketahanan Loss-Bounded Persistence (`RPO <= 400ms`), cakupan handover credential, deterministic SW build assets precache, Atomic Task Claim CAS Guard (`taskClaimManager.ts`), rekonsiliasi test runner, dan sinkronisasi baseline dokumentasi rilis.
- **Capaian:** 8 task `DONE` (`TC-P12-01` s/d `TC-P12-08`).

### Fase 13 — Final Review Audit Remediation & Documentation Polish (`TASK-083` s/d `TASK-088`)
- **Fokus:** Menuntaskan `AUD3-001` s/d `AUD3-006`: higienitas email `@zlce.local`, harmonisasi peran & alur estafet 8 langkah, pembaruan indeks `README.md`, isolasi loopback `HOST=127.0.0.1` & syarat `Node >=20.19.0`, polesan tab routing `?tab=`, serta rekonsiliasi test suite & gerbang kualitas final.
- **Capaian:** 6 task `DONE` (`TC-P13-01` s/d `TC-P13-06`).

### Fase 14 — Pemisahan 3 Pilar Dokumentasi, Log Kerja & Review PWA (`TASK-089` s/d `TASK-095`)
- **Fokus:** Memisahkan secara tegas Pilar 1 Arsitektur (`MOBILE_BLUEPRINT.md`), Pilar 2 Instalasi Android (`INSTALLATION_ANDROID.md`), dan Pilar 3 Pemakaian Harian (`USAGE_MOBILE.md`), menata ulang Pustaka Studio 4 pilar, menambahkan uji otomatis `documentationParity.test.ts`, membangun modul catatan log kerja tim (`MemberWorkLogSection.tsx`), dan generator prompt + bundel review Frontend PWA (`create-pwa-review-bundle.py`).
- **Capaian:** 7 task `DONE` (`TC-P14-01` s/d `TC-P14-07`).

### Fase 15 — Remediasi Kritis P0 & Zero-Secret Persistence Gate (`TASK-096` s/d `TASK-100`)
- **Fokus:** Menuntaskan temuan kritis `AUD4-002..007` & `UX-01..03`: penolakan/redaksi secret fail-closed sebelum penulisan cache draft (`zeroSecretPersistence.test.ts`), `clean-auth.sh` fail-closed & source-safe, `useKeyboardAwareFocus.ts` + sticky footer sadar keyboard virtual, `DraftTextarea` universal lintas 6 form kritis, dan Service Worker toleran (`Promise.allSettled`) tanpa interupsi `skipWaiting()` mendadak.
- **Capaian:** 5 task `DONE` (`TC-P15-01` s/d `TC-P15-05`).

### Fase 16 — Peningkatan UX P1, Ergonomi Tablet & Integritas Alur (`TASK-101` s/d `TASK-106`)
- **Fokus:** Perlindungan kepemilikan klaim task antar-anggota (`atomicClaimProtection.test.ts`), penggantian seluruh dialog native `alert()`/`confirm()` dengan `ConfirmDialog` & `ToastContainer` aksesibel, komponen `IconButton` & `SelectInput` `>= 44px`, code splitting `React.lazy` + `TabSkeleton`, penanganan `QuotaExceededError` + fallback salin manual, serta hard token budget pruning.
- **Capaian:** 6 task `DONE` (`TC-P16-01` s/d `TC-P16-06`).

### Fase 17 — Polishing P2, Paritas Blueprint & Audit Performa PWA (`TASK-107` s/d `TASK-111`)
- **Fokus:** Rekonsiliasi 14 dokumen blueprint ke status `APPROVED / AS-BUILT`, `<html lang="id">`, pembersihan CSS Tailwind invalid & dukungan `prefers-reduced-motion`, telemetri uji fisik SM-T225 (548 kontrol terukur di Chromium), rekonsiliasi master test runner, dan penambahan tab diagnostik `PerformanceAuditTab.tsx`.
- **Capaian:** 5 task `DONE` (`TC-P17-01` s/d `TC-P17-04`, `TC-P17-FIN`).

### Fase 18 — Remediasi Review Frontend PWA Ulang `R-01..R-12` (`TASK-112` s/d `TASK-118`)
- **Fokus:** Penyeragaman identitas rilis, validasi biner & pasca-build `dist/icons/` (`pwaIconsIntegrity.test.ts`), `ModalShell.tsx` dengan focus trap W3C ARIA, ekspansi `DraftTextarea` ke seluruh form kritis, dinamisasi filter & peta fase di `taskPhases.ts`, pengukuran dinamis `--header-h` via `ResizeObserver`, pembersihan sub-12px font & jargon kriptik, serta penyelarasan Live Bridge Mode Statis PWA.
- **Capaian:** 7 task `DONE` (`TC-P18-01` s/d `TC-P18-06`, `TC-P18-FIN`).

### Fase 19 — Penyederhanaan Frontend PWA Menjadi 6-Tab Kanonik (`TASK-119` s/d `TASK-124`)
- **Fokus:** Pengarsipan 13 komponen awal ke `archive/components/`, penyederhanaan navigasi `Header.tsx` menjadi 6 tab kanonik (`Dashboard`, `SESSION_STATE & WAL`, `AI Workbench`, `Terminal & Git`, `Diagnostik & Kualitas`, `Dokumentasi & Panduan`), konsolidasi `AiWorkbenchTab.tsx`, `TerminalGitTab.tsx`, `DiagnosticsTab.tsx`, `DocsReferenceTab.tsx`, dan redesain `DashboardTab.tsx` menjadi dasbor teknis ringkas.
- **Capaian:** 6 task `DONE` (`TC-P19-01` s/d `TC-P19-FIN`).

### Fase 20 — Penyelarasan Penuh Berkas Kontrol Mode FULL/LITE & v4.1.0 GA (`TASK-125` s/d `TASK-129`)
- **Fokus:** Pemenuhan 10 berkas kontrol Mode `FULL` di root (`AI_WORKFLOW.md`, `HANDOVER.md`, `BLUEPRINT.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `TESTING.md`, `CHECKLISTS.md`), perbaikan Mode `LITE` pada `zlce-starter-kit/`, pengarsipan 62 log historis ke `docs/archive/AUDIT_LOG_FASE_0_TO_18.md`, penyelarasan paritas dokumentasi/UI, dan regenerasi 4 bundel rilis `ZLCEv4.1Mob`.
- **Capaian:** 5 task `DONE` (`TC-P20-01` s/d `TC-P20-04`, `TC-P20-FIN`).

### Fase 21 — Konsolidasi Single Source of Truth & Optimasi Repo/PWA (`TASK-130` s/d `TASK-134`)
- **Fokus:** Penghapusan 4 komponen legacy yatim pasca-FASE 19, deduplikasi `public/assets/` & penetapan lockfile tunggal `package-lock.json`, ekspansi `scripts/sync-assets.mjs` (22 sumber -> 25 target + `--single-kit` dinamis pengganti `ZLCE_KIT_SINGLE.md` statis), pemindahan output 4 bundel ZIP audit/review ke `release-bundles/` (mengecilkan payload `dist/`), dan refaktor `TutorialTab.tsx` (177 KB -> 76 KB) agar merujuk langsung berkas Markdown kanonik via `src/data/templates.ts`.
- **Capaian:** 5 task `DONE` (`TC-P21-01` s/d `TC-P21-04`, `TC-P21-FIN`).

---

## 3. STATUS KUNCI ROADMAP (LOCKED AS-BUILT)

- **Versi Rilis Terkunci:** **`v4.1.0 GA / v4.1.1` (`ZLCEv4.1Mob`)**
- **Cakupan Fase:** **22 Fase Lengkap (`Fase 0` s/d `Fase 21`) — `134/134` Task `DONE` (100%)**
- **Integritas Ketergantungan (Zero-Crosslink):** 0 dependensi maju, 0 dependensi melingkar (*circular*), 0 celah rentang task (`1..134`), dan 100% paritas antara `TASKS.md`, `SESSION_STATE.md`, `src/data/taskPhases.ts`, `BLUEPRINT.md`, dan `MOBILE_BLUEPRINT.md`.
- **Verifikasi Rilis:** `zlce-check.py --strict` (`0 error, 0 warn`), `run-tests.py` (`73/73 PASS`), `security-audit.sh` (`0 leak`), `tsc --noEmit` (`0 error`), `vite build` sukses.

