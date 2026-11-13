#!/usr/bin/env python3
"""
Script Pembuat Berkas Bundel ZIP Khusus Review Frontend PWA ZLCE Mobile Workbench
Target: Reviewer Eksternal (ChatGPT & Claude) untuk Evaluasi UX, Ergonomi Tablet & Keandalan PWA
Output: release-bundles/zlce-pwa-frontend-review-bundle.zip

Fokus Evaluasi:
1. User-Friendly: Ergonomi layar 8.7" tablet SM-T225 & mobile, target sentuh >= 44px, kontras, visualViewport
2. Komunikatif: Kejelasan pesan, umpan balik status, kejelasan panduan, bahasa manusiawi
3. Mudah Dipakai: 1-tap actions, minim friksi, transparent auto-draft restore
4. Efisien: Konsumsi RAM ringan (3GB aware), zero lag, caching offline Service Worker instan
5. Powerful: Kelengkapan 6 tab kanonik terpadu ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)
"""

import hashlib
import os
import re
import sys
import tempfile
import zipfile

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_ZIP = os.path.join(ROOT_DIR, "release-bundles", "zlce-pwa-frontend-review-bundle.zip")

PWA_REVIEW_FILES = [
    # 1. Shell & Entry
    "index.html",
    "metadata.json",
    ".env.example",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "vite-session-sync.ts",
    "src/main.tsx",
    "src/App.tsx",
    "src/index.css",
    "src/vite-env.d.ts",

    # 2. PWA Core
    "public/manifest.webmanifest",
    "public/sw.js",
    "src/sw-register.ts",
    "public/icons/apple-touch-icon.png",
    "public/icons/icon-192x192.png",
    "public/icons/icon-512x512-maskable.png",
    "public/icons/icon-512x512.png",

    # 3. Komponen Utama & 6 Tab Kanonik
    "src/components/Header.tsx",
    "src/components/DashboardTab.tsx",
    "src/components/DiagnosticsTab.tsx",
    "src/components/DocsReferenceTab.tsx",
    "src/components/SessionStateTab.tsx",
    "src/components/TutorialTab.tsx",
    "src/components/FullscreenEditorModal.tsx",
    "src/components/TokenUsageGauge.tsx",
    "src/components/LandingWizardTab.tsx",
    "src/components/RevisionTriageTab.tsx",
    "src/components/TestHarnessTab.tsx",
    "src/components/TemplatesTab.tsx",

    # 4. Komponen Mobile & Tablet Ergonomi (src/components/mobile/)
    "src/components/mobile/MobileLayout.tsx",
    "src/components/mobile/ModalShell.tsx",
    "src/components/mobile/ActiveMemberSelector.tsx",
    "src/components/mobile/ProjectSwitcher.tsx",
    "src/components/mobile/WorkspaceReader.tsx",
    "src/components/mobile/WorkspaceEditor.tsx",
    "src/components/mobile/WorkspaceExportBar.tsx",
    "src/components/mobile/DraftTextarea.tsx",
    "src/components/mobile/ContextPackTab.tsx",
    "src/components/mobile/ResultCaptureTab.tsx",
    "src/components/mobile/AiHandoverWizard.tsx",
    "src/components/mobile/AiWorkbenchTab.tsx",
    "src/components/mobile/SessionTimelineTab.tsx",
    "src/components/mobile/MemberWorkLogSection.tsx",
    "src/components/mobile/CommandHubTab.tsx",
    "src/components/mobile/ConfirmDialog.tsx",
    "src/components/mobile/ConflictResolutionWizard.tsx",
    "src/components/mobile/GitSyncTab.tsx",
    "src/components/mobile/FeedbackReviewTab.tsx",
    "src/components/mobile/GateApprovalModal.tsx",
    "src/components/mobile/IconButton.tsx",
    "src/components/mobile/DeviceHandoverModal.tsx",
    "src/components/mobile/TeamRegistryModal.tsx",
    "src/components/mobile/TokenBudgetSelector.tsx",
    "src/components/mobile/ToastContainer.tsx",
    "src/components/mobile/OneTapCopyButton.tsx",
    "src/components/mobile/PasteBackModal.tsx",
    "src/components/mobile/RecoveryCommandSection.tsx",
    "src/components/mobile/SecurityAuthTab.tsx",
    "src/components/mobile/SelectInput.tsx",
    "src/components/mobile/GitPullSection.tsx",
    "src/components/mobile/PromptStudio.tsx",
    "src/components/mobile/PerformanceAuditTab.tsx",
    "src/components/mobile/TabSkeleton.tsx",
    "src/components/mobile/TaskClaimBanner.tsx",
    "src/components/mobile/TerminalGitTab.tsx",
    "src/components/mobile/index.ts",

    # 5. Data & Types
    "src/types/mobile.ts",
    "src/types/zlce.ts",
    "src/data/teamMembers.ts",
    "src/data/templates.ts",
    "src/data/commandTemplates.ts",
    "src/data/scenarios.ts",
    "src/data/taskPhases.ts",

    # 6. Hooks Ergonomi & Persistence
    "src/hooks/useAutoDraftCache.ts",
    "src/hooks/useSessionPersistence.ts",
    "src/hooks/useProjectRegistry.ts",
    "src/hooks/useSessionHistory.ts",
    "src/hooks/useFileImport.ts",
    "src/hooks/useKeyboardAwareFocus.ts",

    # 7. Utilitas UX & Logika Inti
    "src/utils/auditPromptGenerator.ts",
    "src/utils/memberWorkLogs.ts",
    "src/utils/fileExport.ts",
    "src/utils/clipboard.ts",
    "src/utils/commandBinder.ts",
    "src/utils/commandSanitizer.ts",
    "src/utils/conflictDetector.ts",
    "src/utils/contextPackGenerator.ts",
    "src/utils/gateApprovalManager.ts",
    "src/utils/gitBranchManager.ts",
    "src/utils/gitCommitFormatter.ts",
    "src/utils/handoverChecklist.ts",
    "src/utils/markdownParser.ts",
    "src/utils/promptGenerator.ts",
    "src/utils/provenanceInjector.ts",
    "src/utils/redactSecrets.ts",
    "src/utils/relayHandoverGenerator.ts",
    "src/utils/sessionStateValidator.ts",
    "src/utils/taskClaimManager.ts",
    "src/utils/terminalParser.ts",
    "src/utils/tokenBudgetAdapter.ts",
    "src/utils/uuid.ts",
    "src/utils/zlceValidator.ts",
    "src/utils/performanceAuditEngine.ts",
    "src/utils/projectStarter.ts",
    "src/utils/smartTaskCheck.ts",

    # 8. Seluruh 34 Berkas Test Suite & Test Harness (R-08 / FIN-002)
    "src/tests/accessibleDialogs.test.ts",
    "src/tests/atomicClaimProtection.test.ts",
    "src/tests/blueprintParity.test.ts",
    "src/tests/browserRecovery.test.ts",
    "src/tests/cleanAuthPolicy.test.ts",
    "src/tests/codeSplitting.test.ts",
    "src/tests/coldStartAi.test.ts",
    "src/tests/coldStartMember.test.ts",
    "src/tests/dashboardPhaseFilter.test.ts",
    "src/tests/documentationParity.test.ts",
    "src/tests/e2eScenarios.test.ts",
    "src/tests/freshWorkspaceMultiProject.test.ts",
    "src/tests/gitWorkflow.test.ts",
    "src/tests/keyboardViewport.test.ts",
    "src/tests/layoutHeaderBannerStack.test.ts",
    "src/tests/lmkRecovery.test.ts",
    "src/tests/memberWorkLogs.test.ts",
    "src/tests/multiUserIsolation.test.ts",
    "src/tests/offlineOperation.test.ts",
    "src/tests/performanceAudit.test.ts",
    "src/tests/physicalTelemetryAndQuality.test.ts",
    "src/tests/pwaIconsIntegrity.test.ts",
    "src/tests/pwaReviewPrompt.test.ts",
    "src/tests/resilientServiceWorker.test.ts",
    "src/tests/smartTaskCheck.test.ts",
    "src/tests/tabRouting.test.ts",
    "src/tests/taskClaim.test.ts",
    "src/tests/tokenBudgetHardCap.test.ts",
    "src/tests/touchTarget.test.ts",
    "src/tests/touchTargetTypography.test.ts",
    "src/tests/transactionalPersistence.test.ts",
    "src/tests/uiPolishing.test.ts",
    "src/tests/uiResilience.test.ts",
    "src/tests/universalDraftCache.test.ts",
    "src/tests/zeroSecretPersistence.test.ts",

    # 9. Skrip Verifikasi, Runner Uji, Validator & Dispatcher (R-08 / FIN-002)
    "scripts/README.md",
    "scripts/run-tests.py",
    "scripts/zlce-check.py",
    "scripts/zlce-collect.py",
    "scripts/zlce-snapshot.sh",
    "scripts/zlce-prod-start.sh",
    "scripts/security-audit.sh",
    "scripts/install-hooks.sh",
    "scripts/test-lmk-physical.sh",
    "scripts/sync-assets.mjs",
    "scripts/create-audit-bundle.py",
    "scripts/create-pwa-review-bundle.py",
    "scripts/zlce/README.md",
    "scripts/zlce/zlce",
    "scripts/zlce/clean-auth.sh",
    "scripts/zlce/zlce-check.py",
    "scripts/zlce/zlce-collect.py",
    "scripts/zlce/zlce-snapshot.sh",

    # 9. Template & Contoh Kanonik (diimpor ?raw oleh src/data/templates.ts)
    "templates/SESSION_STATE.template.md",
    "templates/BLUEPRINT.template.md",
    "templates/TASKS.template.md",
    "templates/AI_WORKFLOW.template.md",
    "templates/ARCHITECTURE.template.md",
    "templates/DATA_MODEL.template.md",
    "templates/TESTING.template.md",
    "templates/CHECKLISTS.template.md",
    "templates/CHANGELOG.template.md",
    "templates/profiles/DOMAIN_BOOKING.profile.md",
    "examples/SESSION_STATE.example.md",
    "examples/TASKS.example.md",
    "examples/AI_WORKFLOW.example.md",
    "examples/BLUEPRINT.example.md",

    # 10. Dokumentasi Terkait UX, Panduan, Blueprint & 10 Berkas Kontrol Mode FULL
    "docs/README.md",
    "docs/USAGE.md",
    "docs/archive/AUDIT_LOG_FASE_0_TO_18.md",
    "docs/mobile/INSTALLATION.md",
    "docs/mobile/INSTALLATION_ANDROID.md",
    "docs/mobile/TERMUX_SETUP.md",
    "docs/mobile/USAGE_MOBILE.md",
    "docs/mobile/USER_GUIDE.md",
    "docs/mobile/PRODUCTION_OPERATIONS.md",
    "docs/mobile/TROUBLESHOOTING.md",
    "docs/mobile/DEVICE_AUDIT.md",
    "docs/mobile/MOBILE_BLUEPRINT.md",
    "docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md",
    "docs/mobile/blueprint/03_PWA_ARCHITECTURE.md",
    "docs/mobile/blueprint/07_WORKFLOW_DESIGN.md",
    "docs/mobile/blueprint/10_TEST_STRATEGY.md",
    "docs/mobile/blueprint/12_ARCHITECTURE_DECISIONS.md",
    "docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md",
    "AI_WORKFLOW.md",
    "BLUEPRINT.md",
    "ARCHITECTURE.md",
    "DATA_MODEL.md",
    "TESTING.md",
    "CHECKLISTS.md",
    "HANDOVER.md",
    "HANDOVER_PROMPT.md",
    "LANDING_PROMPT.md",
    "CLAUDE_CHATGPT_HANDOVER.md",
    "SESSION_STATE.md",
    "TASKS.md",
    "CHANGELOG.md",
    "README.md",
    "archive/components/README.md"
]

IMPORT_RE = re.compile(r"""(?:from|import)\s*\(?\s*['"](\.{1,2}/[^'"]+)['"]""")
EXTS = (".ts", ".tsx", ".js", ".mjs", ".json", ".css", ".md")


def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def resolves_in_tree(base_dir, spec):
    clean_spec = spec.split("?")[0]
    target = os.path.normpath(os.path.join(base_dir, clean_spec))
    candidates = [target] + [target + e for e in EXTS] + [os.path.join(target, "index" + e) for e in EXTS]
    return any(os.path.isfile(c) for c in candidates)


def verify_bundle_closure(zip_path):
    """Memverifikasi 100% relative import (termasuk ?raw markdown) terselesaikan di dalam ZIP."""
    missing = set()
    with tempfile.TemporaryDirectory() as tmp:
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(tmp)
        for root, _, files in os.walk(tmp):
            for name in files:
                if not name.endswith((".ts", ".tsx", ".js", ".mjs")):
                    continue
                fpath = os.path.join(root, name)
                with open(fpath, encoding="utf-8") as f:
                    text = f.read()
                for spec in IMPORT_RE.findall(text):
                    if not resolves_in_tree(root, spec):
                        missing.add(f"{os.path.relpath(fpath, tmp)} -> {spec}")
    return sorted(missing)


def verify_sha256_manifest(zip_path):
    """Memverifikasi SHA256SUMS.txt tersedia dan seluruh checksum member ZIP akurat."""
    with zipfile.ZipFile(zip_path, "r") as zf:
        if "SHA256SUMS.txt" not in zf.namelist():
            return ["SHA256SUMS.txt tidak ditemukan di dalam arsip ZIP"]
        manifest_text = zf.read("SHA256SUMS.txt").decode("utf-8")
        mismatches = []
        entries_checked = 0
        for line in manifest_text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            m = re.match(r"^([0-9a-f]{64})\s{2}(.+)$", line)
            if not m:
                mismatches.append(f"Format baris manifest tidak valid: {line}")
                continue
            expected_hash, member = m.group(1), m.group(2)
            if member not in zf.namelist():
                mismatches.append(f"Berkas manifest hilang dari arsip: {member}")
                continue
            actual_hash = hashlib.sha256(zf.read(member)).hexdigest()
            if actual_hash != expected_hash:
                mismatches.append(f"Checksum mismatch pada {member}")
            entries_checked += 1
        if entries_checked == 0:
            mismatches.append("SHA256SUMS.txt tidak memuat entri berkas")
        return mismatches


def create_pwa_review_bundle():
    print(f"[*] Menyiapkan bundle ZIP Frontend PWA Review di: {os.path.relpath(OUTPUT_ZIP, ROOT_DIR)}")
    os.makedirs(os.path.dirname(OUTPUT_ZIP), exist_ok=True)

    verified_files = []
    missing_files = []

    for rel_path in sorted(set(PWA_REVIEW_FILES)):
        full_path = os.path.join(ROOT_DIR, rel_path)
        if os.path.exists(full_path):
            verified_files.append(rel_path)
        else:
            missing_files.append(rel_path)

    if missing_files:
        print(f"[FATAL] {len(missing_files)} berkas terdaftar di PWA_REVIEW_FILES tidak ditemukan di disk:")
        for m in missing_files:
            print(f"  - {m}")
        return 0, 0.0

    # Buat ZIP deterministik dengan timestamp tetap & normalisasi permissions POSIX
    fixed_time = (2026, 11, 11, 0, 0, 0)
    manifest_lines = [
        "# SHA256 Manifest: ZLCE Mobile Workbench Frontend PWA Review Bundle",
        f"# Target AI: ChatGPT & Claude | Total Berkas: {len(verified_files)}",
        "# ------------------------------------------------------------------"
    ]

    with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for rel_path in sorted(verified_files):
            full_path = os.path.join(ROOT_DIR, rel_path)
            checksum = sha256_file(full_path)
            manifest_lines.append(f"{checksum}  {rel_path}")

            with open(full_path, "rb") as f:
                content = f.read()

            zinfo = zipfile.ZipInfo(rel_path, date_time=fixed_time)
            # Normalisasi permission POSIX: 0755 untuk executable/scripts, 0644 untuk dokumen (AUD-021)
            is_exec = rel_path.endswith(".sh") or rel_path == "scripts/zlce/zlce" or rel_path.endswith(".py")
            zinfo.external_attr = (0o100755 if is_exec else 0o100644) << 16
            zinfo.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(zinfo, content)

        # Tulis SHA256SUMS.txt di dalam bundel ZIP
        manifest_text = "\n".join(manifest_lines) + "\n"
        m_info = zipfile.ZipInfo("SHA256SUMS.txt", date_time=fixed_time)
        m_info.external_attr = 0o100644 << 16
        m_info.compress_type = zipfile.ZIP_DEFLATED
        zf.writestr(m_info, manifest_text.encode("utf-8"))

    # Verifikasi closure import dan SHA256SUMS manifest secara fail-closed
    gaps = verify_bundle_closure(OUTPUT_ZIP)
    if gaps:
        print(f"[FATAL] PWA Review Bundle Closure Gate GAGAL! Ditemukan {len(gaps)} import hilang:")
        for gap in gaps:
            print(f"  [MISSING] {gap}")
        return 0, 0.0

    sha_errors = verify_sha256_manifest(OUTPUT_ZIP)
    if sha_errors:
        print(f"[FATAL] Verifikasi SHA256SUMS.txt GAGAL:")
        for err in sha_errors:
            print(f"  [SHA256] {err}")
        return 0, 0.0

    zip_size_kb = os.path.getsize(OUTPUT_ZIP) / 1024
    print(f"[PASS] Closure Gate & SHA256SUMS LULUS: 0 broken import ({len(verified_files)} berkas self-contained).")
    print(f"[OK] Berkas ZIP berhasil dibuat: {os.path.relpath(OUTPUT_ZIP, ROOT_DIR)} ({len(verified_files)} berkas + manifest, {zip_size_kb:.1f} KB)")
    return len(verified_files), zip_size_kb


if __name__ == "__main__":
    count, size = create_pwa_review_bundle()
    sys.exit(0 if count > 0 else 1)
