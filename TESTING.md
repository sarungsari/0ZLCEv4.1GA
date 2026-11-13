# SPESIFIKASI PENGUJIAN & MATRIKS QA: ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)

Strategi pengujian otomatis, matriks test case per fase, dan kondisi batas perangkat tablet. Runner utama: [`scripts/run-tests.py`](scripts/run-tests.py). Referensi blueprint: [`docs/mobile/blueprint/10_TEST_STRATEGY.md`](docs/mobile/blueprint/10_TEST_STRATEGY.md).

---

## 1. ATRIBUT KUALITAS KRITIS

1. **Integritas State & Cold-Start (Invarian I1–I5):** `SESSION_STATE.md` dan `TASKS.md` lulus `zlce-check.py --strict` dengan 0 error/0 warning; handoff lintas AI (`coldStartAi.test.ts`) dan lintas anggota (`coldStartMember.test.ts`) bebas hilang konteks.
2. **Keamanan Zero-Secret & Anti-Injection:** 0 kebocoran secret (`scripts/security-audit.sh`, `zeroSecretPersistence.test.ts`), sanitasi POSIX shell ketat (`commandSanitizer.ts`), dan fail-closed `clean-auth.sh`.
3. **Ergonomi Tablet & Offline Resilience:** 100% kontrol interaktif $\ge 44\times 44\text{px}$ (`touchTargetTypography.test.ts`), `RPO <= 400ms` (`lmkRecovery.test.ts`, `universalDraftCache.test.ts`), dan caching App Shell `sw.js` (`offlineOperation.test.ts`, `pwaIconsIntegrity.test.ts`).

---

## 2. MATRIKS TEST CASE RINGKAS

| Rentang TC | Fase / Cakupan | Skrip / Suite Uji Utama | Perintah Eksekusi |
| :--- | :--- | :--- | :--- |
| `TC-P0..P2` | TypeScript, Parser, State Validator | `run-tests.py` Steps 1–6 | `npm test` |
| `TC-P3..P4` | Context Pack, Prompt, Provenance, Cold-Start AI/Member | `coldStartAi.test.ts`, `coldStartMember.test.ts` | `npx tsx src/tests/coldStartAi.test.ts` |
| `TC-P5..P6` | Command Binder, Anti-Injection, Git Workflow | `gitWorkflow.test.ts` | `npx tsx src/tests/gitWorkflow.test.ts` |
| `TC-P7..P9` | E2E 14 Skenario, LMK, Offline, Ergonomi, Review Bundle | `e2eScenarios.test.ts`, `lmkRecovery.test.ts`, `offlineOperation.test.ts` | `npx tsx src/tests/e2eScenarios.test.ts` |
| `TC-P10..P13` | Browser Restart, Multi-User Isolation, CAS Claim, Tab Routing | `multiUserIsolation.test.ts`, `taskClaim.test.ts`, `tabRouting.test.ts` | `npx tsx src/tests/taskClaim.test.ts` |
| `TC-P14..P16` | Doc Parity, Zero-Secret Gate, Keyboard Viewport, Code Splitting | `documentationParity.test.ts`, `zeroSecretPersistence.test.ts`, `codeSplitting.test.ts` | `npx tsx src/tests/zeroSecretPersistence.test.ts` |
| `TC-P17..P18` | Blueprint Parity, PWA Icons, ModalShell, Phase Filter, Stack Banner | `blueprintParity.test.ts`, `pwaIconsIntegrity.test.ts`, `accessibleDialogs.test.ts`, `layoutHeaderBannerStack.test.ts` | `npm run test:icons` |
| `TC-P19..P21` | 6-Tab Konsolidasi, Full/Lite Mode, Single Source Sync, `release-bundles/`, Refaktor `TutorialTab` | `uiPolishing.test.ts`, `performanceAudit.test.ts`, `documentationParity.test.ts`, `run-tests.py`, `zlce-check.py` | `python3 scripts/run-tests.py` |

---

## 3. KONDISI BATAS (BOUNDARY CONDITIONS)

1. **Viewport Tablet SM-T225:** Lanskap `1340x800`, Potret `800x1340`, dan penyusutan keyboard virtual `800px -> 480px` (`--viewport-height` tanpa menutupi input/action footer).
2. **Kuota Storage & Memori RAM 3GB:** Penanganan `QuotaExceededError` di `useSessionPersistence.ts`, isolasi 16 lazy chunk tab, dan pemangkasan hard cap profil `freebuff-4k` (4.000 token).
3. **Kegagalan Clipboard & Static PWA Hosting:** Fallback modal seleksi manual pada `OneTapCopyButton.tsx` dan penanganan HTTP `404` non-destruktif untuk `/api/session-state` pada hosting PWA statis.
