# QUALITY GATE CHECKLIST: ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)

Centang `[x]` hanya dengan bukti verifikasi nyata (output perintah, log uji, atau checksum). Dilarang mencentang berdasarkan asumsi.

---

## 1. PRE-MERGE (PER TASK / BRANCH `task/TASK-XXX`)

- [ ] **Arsitektur & Navigasi:** mematuhi lapisan `ARCHITECTURE.md`; perubahan 6-tab menjaga kompatibilitas alias `?tab=` dan tidak merusak kompilasi (`npx tsc --noEmit`).
- [ ] **Ergonomi & Aksesibilitas:** seluruh kontrol sentuh baru/diubah memenuhi `touch-target-44 min-h-[44px]`, lantai tipografi `>= 12px` (`text-xs`), dan bebas `window.alert`/`confirm` native.
- [ ] **Keamanan & Zero-Secret:** input CLI/form tervalidasi (`commandSanitizer.ts`, `redactSecrets.ts`); `bash scripts/security-audit.sh` lolos dengan 0 kebocoran kredensial.
- [ ] **State Machine & Smart Check:** tepat <= 1 task `IN_PROGRESS`; seluruh berkas `Docs Impact` diperbarui sebelum status `DONE`.
- [ ] **Lint, Build & Test:** `npm run lint`, `npm run build`, dan `python3 scripts/run-tests.py` lulus 100%.
- [ ] **Validator Kanonik:** `python3 scripts/zlce-check.py . --strict` (atau `--no-git` di sandbox) menghasilkan `0 error, 0 warn`.
- [ ] **WAL & Atribusi:** WAL `SESSION_STATE.md` Bagian 3 dikosongkan (`-`) saat `DONE`, kolom `Disetujui` mencatat `ya (oleh: NamaAnggota)`, dan commit memakai `-c user.name` & `-c user.email` (`@zlce.local`).

---

## 2. PRE-PRODUCTION & HANDOVER TABLET BERSAMA

- [ ] **Sinkronisasi Aset Kit & Bundel ZIP On-Demand:** `npm run sync:assets` dijalankan dan seluruh generator bundel (`create-starter-kit-bundle.py`, `create-audit-bundle.py`, `create-pwa-review-bundle.py`, `create-claude-bundle.py`, `create-lmk-bundle.py`) lolos closure gate & `SHA256SUMS.txt` (lalu bersihkan arsip `.zip` sementara bila tidak didistribusikan ke repo).
- [ ] **Isolasi Jaringan Tablet:** server produksi lokal tablet bersama diluncurkan dengan `HOST=127.0.0.1 bash scripts/zlce-prod-start.sh` bila berada di jaringan publik.
- [ ] **PWA & Offline Ready:** `public/manifest.webmanifest` (`ZLCE Mobile Workbench v4.1.0 GA` / `ZLCEv4.1Mob`) tervalidasi dan aset build ter-precache di `public/sw.js` (`zlce-mobile-v4.1.0`).
- [ ] **Pembersihan Kredensial Serah Terima:** `bash scripts/zlce/clean-auth.sh` dijalankan sebelum menyerahkan fisik tablet SM-T225 ke anggota estafet berikutnya.
