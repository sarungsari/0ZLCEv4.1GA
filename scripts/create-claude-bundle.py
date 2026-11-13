#!/usr/bin/env python3
"""
Script pembuat berkas bundel ZIP ZLCE untuk serah terima ke Claude atau ChatGPT (v4.1.0 GA).
Membundel seluruh berkas kontrol Mode FULL, status sesi, backlog task, blueprint, panduan handover,
serta komponen 6 tab kanonik dan SHA256SUMS.txt ke dalam release-bundles/zlce-claude-chatgpt-bundle.zip.
"""

import hashlib
import os
import re
import sys
import zipfile

FILES_TO_BUNDLE = [
    # 1. Dokumen Kontrol Utama (10 Berkas Mode FULL + Handover)
    "README.md",
    "AI_WORKFLOW.md",
    "BLUEPRINT.md",
    "ARCHITECTURE.md",
    "DATA_MODEL.md",
    "TESTING.md",
    "CHECKLISTS.md",
    "HANDOVER.md",
    "HANDOVER_PROMPT.md",
    "LANDING_PROMPT.md",
    "SESSION_STATE.md",
    "TASKS.md",
    "CHANGELOG.md",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "LICENSE",

    # 2. Arsip Komponen Internal
    "archive/components/README.md",

    # 3. Dokumentasi Lengkap & Panduan Mobile (3 Pilar)
    "docs/README.md",
    "docs/USAGE.md",
    "docs/mobile/INSTALLATION.md",
    "docs/mobile/INSTALLATION_ANDROID.md",
    "docs/mobile/USAGE_MOBILE.md",
    "docs/mobile/TERMUX_SETUP.md",
    "docs/mobile/USER_GUIDE.md",
    "docs/mobile/PRODUCTION_OPERATIONS.md",
    "docs/mobile/TROUBLESHOOTING.md",
    "docs/mobile/SECURITY_AUDIT.md",
    "docs/mobile/DEVICE_AUDIT.md",
    "docs/mobile/MOBILE_BLUEPRINT.md",

    # 4. Seluruh 14 Cetak Biru Arsitektur Mobile
    "docs/mobile/blueprint/01_SYSTEM_OVERVIEW.md",
    "docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md",
    "docs/mobile/blueprint/03_PWA_ARCHITECTURE.md",
    "docs/mobile/blueprint/04_TERMUX_INTEGRATION.md",
    "docs/mobile/blueprint/05_STORAGE_AND_SYNC.md",
    "docs/mobile/blueprint/06_REPOSITORY_CHANGES.md",
    "docs/mobile/blueprint/07_WORKFLOW_DESIGN.md",
    "docs/mobile/blueprint/08_SECURITY_MODEL.md",
    "docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md",
    "docs/mobile/blueprint/10_TEST_STRATEGY.md",
    "docs/mobile/blueprint/11_IMPLEMENTATION_ROADMAP.md",
    "docs/mobile/blueprint/12_ARCHITECTURE_DECISIONS.md",
    "docs/mobile/blueprint/13_COMMAND_TEMPLATES.md",
    "docs/mobile/blueprint/14_MULTI_AI_TEAM_MODEL.md",

    # 5. Skrip Eksekusi & Starter Produksi
    "scripts/zlce-prod-start.sh",
    "scripts/create-starter-kit-bundle.py",
    "scripts/create-claude-bundle.py",
    "scripts/create-audit-bundle.py",
    "scripts/create-pwa-review-bundle.py",
    "scripts/create-lmk-bundle.py",
    "scripts/sync-assets.mjs",
    "scripts/run-tests.py",
    "scripts/security-audit.sh",
    "scripts/zlce-check.py",
    "scripts/zlce-snapshot.sh",
    "scripts/zlce-collect.py",
    "scripts/zlce/zlce",
    "scripts/zlce/clean-auth.sh",

    # 7. Kode Referensi, Types, & 6 Tab Kanonik
    "src/App.tsx",
    "src/types/zlce.ts",
    "src/types/mobile.ts",
    "src/utils/contextPackGenerator.ts",
    "src/utils/auditPromptGenerator.ts",
    "src/utils/commandBinder.ts",
    "src/data/teamMembers.ts",
    "src/data/taskPhases.ts",
    "src/data/scenarios.ts",
    "src/components/Header.tsx",
    "src/components/DashboardTab.tsx",
    "src/components/SessionStateTab.tsx",
    "src/components/DiagnosticsTab.tsx",
    "src/components/DocsReferenceTab.tsx",
    "src/components/mobile/AiWorkbenchTab.tsx",
    "src/components/mobile/TerminalGitTab.tsx",
    "src/components/mobile/ContextPackTab.tsx",
    "src/components/mobile/FeedbackReviewTab.tsx",
    "src/components/mobile/CommandHubTab.tsx",
    "src/components/mobile/WorkspaceReader.tsx",
    "src/components/TokenUsageGauge.tsx",

    # 8. PWA Shell & Icons
    "public/manifest.webmanifest",
    "public/sw.js",
    "public/icons/apple-touch-icon.png",
    "public/icons/icon-192x192.png",
    "public/icons/icon-512x512-maskable.png",
    "public/icons/icon-512x512.png",

    # 9. Konfigurasi
    ".env.example",
    "metadata.json",
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "vite-session-sync.ts"
]

OUTPUT_ZIP = "release-bundles/zlce-claude-chatgpt-bundle.zip"
MANIFEST_FILE = "SHA256SUMS.txt"


def sha256_file(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def is_executable(rel_path: str) -> bool:
    if rel_path.startswith("scripts/"):
        ext = os.path.splitext(rel_path)[1]
        if ext in (".sh", ".py", ""):
            return True
    return False


def verify_sha256_manifest(zip_path: str):
    with zipfile.ZipFile(zip_path, "r") as zf:
        if MANIFEST_FILE not in zf.namelist():
            return [f"{MANIFEST_FILE} tidak ditemukan di arsip"]
        mismatches = []
        checked = 0
        for line in zf.read(MANIFEST_FILE).decode("utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            m = re.match(r"^([0-9a-f]{64})\s{2}(.+)$", line)
            if not m:
                mismatches.append(f"Format baris tidak valid: {line}")
                continue
            expected_hash, member = m.group(1), m.group(2)
            if member not in zf.namelist():
                mismatches.append(f"Berkas hilang: {member}")
                continue
            actual_hash = hashlib.sha256(zf.read(member)).hexdigest()
            if actual_hash != expected_hash:
                mismatches.append(f"Checksum mismatch: {member}")
            checked += 1
        if checked == 0:
            mismatches.append("SHA256SUMS.txt kosong")
        return mismatches


def create_bundle():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base_dir)

    os.makedirs(os.path.dirname(OUTPUT_ZIP), exist_ok=True)

    print(f"[*] Menyiapkan bundle ZIP di: {OUTPUT_ZIP}")
    unique_files = sorted(set(FILES_TO_BUNDLE))
    missing_files = [rel for rel in unique_files if not os.path.exists(os.path.join(base_dir, rel))]
    if missing_files:
        print(f"[FATAL] {len(missing_files)} berkas tidak ditemukan:")
        for mf in missing_files:
            print(f"  [-] {mf}")
        return 0

    fixed_time = (2026, 11, 13, 0, 0, 0)
    manifest_lines = [
        "# SHA256 Manifest: ZLCE Claude & ChatGPT Handover Bundle (v4.1.0 GA)",
        f"# Total Berkas: {len(unique_files)}",
        "# ------------------------------------------------------------------"
    ]
    for rel_path in unique_files:
        manifest_lines.append(f"{sha256_file(os.path.join(base_dir, rel_path))}  {rel_path}")
    manifest_text = "\n".join(manifest_lines) + "\n"

    included_count = 0
    with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        m_info = zipfile.ZipInfo(MANIFEST_FILE, date_time=fixed_time)
        m_info.external_attr = 0o100644 << 16
        m_info.compress_type = zipfile.ZIP_DEFLATED
        zipf.writestr(m_info, manifest_text.encode("utf-8"))

        for rel_path in unique_files:
            full_path = os.path.join(base_dir, rel_path)
            with open(full_path, "rb") as f:
                data = f.read()
            zinfo = zipfile.ZipInfo(rel_path, date_time=fixed_time)
            zinfo.external_attr = (0o100755 if is_executable(rel_path) else 0o100644) << 16
            zinfo.compress_type = zipfile.ZIP_DEFLATED
            zipf.writestr(zinfo, data)
            included_count += 1

    sha_errors = verify_sha256_manifest(OUTPUT_ZIP)
    if sha_errors:
        print(f"[FATAL] Verifikasi {MANIFEST_FILE} GAGAL: {sha_errors}")
        return 0

    zip_size_kb = os.path.getsize(OUTPUT_ZIP) / 1024
    print(f"[OK] Berhasil membuat bundle: {OUTPUT_ZIP} ({included_count} berkas + manifest, {zip_size_kb:.1f} KB)")
    return included_count


if __name__ == "__main__":
    count = create_bundle()
    if count == 0:
        sys.exit(1)
    sys.exit(0)
