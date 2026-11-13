#!/usr/bin/env python3
"""
Generator deterministik paket bersih ZLCE Starter Kit v4.1.0 GA (Mode LITE + Templates).
Membundel seluruh berkas resmi di direktori `zlce-starter-kit/` + `SHA256SUMS.txt`
ke `release-bundles/zlce-starter-kit-v4.1.0.zip` dengan izin POSIX yang seragam.
"""

import hashlib
import os
import re
import sys
import zipfile

SOURCE_DIR = "zlce-starter-kit"
OUTPUT_ZIP = "release-bundles/zlce-starter-kit-v4.1.0.zip"
MANIFEST_FILE = "SHA256SUMS.txt"


SINGLE_KIT_SOURCES = [
    "LANDING_PROMPT.md",
    "HANDOVER_PROMPT.md",
    "templates/AI_WORKFLOW.template.md",
    "templates/BLUEPRINT.template.md",
    "templates/ARCHITECTURE.template.md",
    "templates/DATA_MODEL.template.md",
    "templates/TASKS.template.md",
    "templates/SESSION_STATE.template.md",
    "templates/TESTING.template.md",
    "templates/CHECKLISTS.template.md",
    "templates/CHANGELOG.template.md",
    "templates/profiles/DOMAIN_BOOKING.profile.md",
]


def build_single_kit_bytes(base_dir: str) -> bytes:
    lines = [
        "# ZLCE KIT (SATU BERKAS) v4.1.0 GA",
        "",
        "Berkas ini adalah bundel tunggal (*derived artifact*) Zero-Loss Context Engineering (ZLCE) v4.1.0 GA.",
        "Dihasilkan otomatis dari sumber kanonik `LANDING_PROMPT.md`, `HANDOVER_PROMPT.md`, dan `templates/`.",
        "",
        "Setiap berkas di dalamnya dibatasi penanda:",
        "<<<FILE: path>>> dan <<<END FILE>>>.",
        "Perlakukan tiap bagian sebagai berkas terpisah dengan path tersebut.",
        "",
        "DAFTAR BERKAS:",
        *[f"- {rel}" for rel in SINGLE_KIT_SOURCES],
        "",
    ]
    body_parts = []
    for rel in SINGLE_KIT_SOURCES:
        full_path = os.path.join(base_dir, rel)
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
        body_parts.append(f"\n<<<FILE: {rel}>>>\n{content}\n<<<END FILE>>>\n")
    return ("\n".join(lines) + "".join(body_parts)).encode("utf-8")


def sha256_file(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def is_executable(rel_path: str) -> bool:
    ext = os.path.splitext(rel_path)[1]
    return ext in (".sh", ".py")


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


def create_starter_kit_bundle() -> int:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base_dir)

    src_root = os.path.join(base_dir, SOURCE_DIR)
    if not os.path.isdir(src_root):
        print(f"[FATAL] Direktori {SOURCE_DIR} tidak ditemukan")
        return 0

    virtual_files = {
        f"{SOURCE_DIR}/ZLCE_KIT_SINGLE.md": build_single_kit_bytes(base_dir)
    }

    disk_entries = []
    for root, _, files in os.walk(src_root):
        for fname in files:
            full_path = os.path.join(root, fname)
            rel_path = os.path.relpath(full_path, base_dir).replace(os.sep, "/")
            if rel_path in virtual_files:
                continue
            disk_entries.append(rel_path)

    all_rel_paths = sorted(set(disk_entries) | set(virtual_files.keys()))
    os.makedirs(os.path.dirname(OUTPUT_ZIP), exist_ok=True)

    fixed_time = (2026, 11, 13, 0, 0, 0)
    manifest_lines = [
        "# SHA256 Manifest: ZLCE Starter Kit v4.1.0 GA (Mode LITE)",
        f"# Total Berkas: {len(all_rel_paths)}",
        "# ------------------------------------------------------------------"
    ]
    for rel_path in all_rel_paths:
        if rel_path in virtual_files:
            digest = hashlib.sha256(virtual_files[rel_path]).hexdigest()
        else:
            digest = sha256_file(os.path.join(base_dir, rel_path))
        manifest_lines.append(f"{digest}  {rel_path}")
    manifest_text = "\n".join(manifest_lines) + "\n"

    with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        m_info = zipfile.ZipInfo(MANIFEST_FILE, date_time=fixed_time)
        m_info.external_attr = 0o100644 << 16
        m_info.compress_type = zipfile.ZIP_DEFLATED
        zipf.writestr(m_info, manifest_text.encode("utf-8"))

        for rel_path in all_rel_paths:
            if rel_path in virtual_files:
                data = virtual_files[rel_path]
            else:
                with open(os.path.join(base_dir, rel_path), "rb") as f:
                    data = f.read()
            zinfo = zipfile.ZipInfo(rel_path, date_time=fixed_time)
            zinfo.external_attr = (0o100755 if is_executable(rel_path) else 0o100644) << 16
            zinfo.compress_type = zipfile.ZIP_DEFLATED
            zipf.writestr(zinfo, data)

    sha_errors = verify_sha256_manifest(OUTPUT_ZIP)
    if sha_errors:
        print(f"[FATAL] Verifikasi {MANIFEST_FILE} GAGAL: {sha_errors}")
        return 0

    zip_size_kb = os.path.getsize(OUTPUT_ZIP) / 1024
    print(f"[OK] Starter Kit ZIP dibuat: {OUTPUT_ZIP} ({len(all_rel_paths)} berkas + manifest, {zip_size_kb:.1f} KB)")
    return len(all_rel_paths)


if __name__ == "__main__":
    count = create_starter_kit_bundle()
    if count == 0:
        sys.exit(1)
    sys.exit(0)
