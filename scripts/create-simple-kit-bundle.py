#!/usr/bin/env python3
"""
Generator deterministik paket ringkas ZLCE Mode SIMPLE / LITE (Single-Mode Bundle v4.1.0 GA).
Membundel khusus 4 berkas kontrol inti Mode LITE + prompt inisiasi/handover + ZLCE_KIT_SIMPLE.md
+ skrip CLI inti + SHA256SUMS.txt ke `release-bundles/zlce-simple-kit-v4.1.0.zip`.
"""

import hashlib
import os
import re
import sys
import zipfile

SOURCE_DIR = "zlce-starter-kit"
OUTPUT_ZIP = "release-bundles/zlce-simple-kit-v4.1.0.zip"
MANIFEST_FILE = "SHA256SUMS.txt"

SIMPLE_DISK_FILES = [
    (f"{SOURCE_DIR}/.gitignore", ".gitignore"),
    ("LANDING_PROMPT.md", "LANDING_PROMPT.md"),
    ("HANDOVER_PROMPT.md", "HANDOVER_PROMPT.md"),
    (f"{SOURCE_DIR}/BLUEPRINT.md", "BLUEPRINT.md"),
    (f"{SOURCE_DIR}/TASKS.md", "TASKS.md"),
    (f"{SOURCE_DIR}/SESSION_STATE.md", "SESSION_STATE.md"),
    (f"{SOURCE_DIR}/HANDOVER.md", "HANDOVER.md"),
    ("scripts/zlce-check.py", "scripts/zlce-check.py"),
    ("scripts/zlce-snapshot.sh", "scripts/zlce-snapshot.sh"),
    ("scripts/zlce-collect.py", "scripts/zlce-collect.py"),
    ("scripts/README.md", "scripts/README.md"),
    ("docs/mobile/INSTALLATION_ANDROID.md", "docs/INSTALLATION_ANDROID.md"),
    ("docs/mobile/USAGE_MOBILE.md", "docs/USAGE_MOBILE.md"),
]

SINGLE_KIT_SIMPLE_SOURCES = [
    ("LANDING_PROMPT.md", "LANDING_PROMPT.md"),
    ("HANDOVER_PROMPT.md", "HANDOVER_PROMPT.md"),
    (f"{SOURCE_DIR}/BLUEPRINT.md", "BLUEPRINT.md"),
    (f"{SOURCE_DIR}/TASKS.md", "TASKS.md"),
    (f"{SOURCE_DIR}/SESSION_STATE.md", "SESSION_STATE.md"),
    (f"{SOURCE_DIR}/HANDOVER.md", "HANDOVER.md"),
]


def build_simple_kit_bytes(base_dir: str) -> bytes:
    lines = [
        "# ZLCE KIT MODE SIMPLE (SATU BERKAS LITE) v4.1.0 GA",
        "",
        "Bundel tunggal ringkas Mode SIMPLE / LITE (4 berkas kontrol inti + Landing & Handover Prompt) untuk proyek < ~15 task dan AI chat/prompt tunggal.",
        "",
        "Setiap berkas di dalamnya dibatasi penanda:",
        "<<<FILE: path>>> dan <<<END FILE>>>.",
        "Perlakukan tiap bagian sebagai berkas terpisah dengan path tersebut.",
        "",
        "MODE: SIMPLE (LITE - 6 Berkas Inti)",
        "DAFTAR BERKAS:",
        *[f"- {label}" for _, label in SINGLE_KIT_SIMPLE_SOURCES],
        "",
    ]
    body_parts = []
    for src_rel, label in SINGLE_KIT_SIMPLE_SOURCES:
        full_path = os.path.join(base_dir, src_rel)
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
        body_parts.append(f"\n<<<FILE: {label}>>>\n{content}\n<<<END FILE>>>\n")
    return ("\n".join(lines) + "".join(body_parts)).encode("utf-8")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def is_executable(arc_path: str) -> bool:
    return os.path.splitext(arc_path)[1] in (".sh", ".py")


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


def create_simple_kit_bundle() -> int:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base_dir)

    entries: list[tuple[str, bytes]] = []
    for src_rel, arc_path in SIMPLE_DISK_FILES:
        abs_path = os.path.join(base_dir, src_rel)
        if not os.path.isfile(abs_path):
            print(f"[FATAL] Sumber Mode SIMPLE tidak ditemukan: {src_rel}")
            return 0
        with open(abs_path, "rb") as f:
            entries.append((arc_path, f.read()))

    entries.append(("ZLCE_KIT_SIMPLE.md", build_simple_kit_bytes(base_dir)))
    entries.sort(key=lambda item: item[0])

    os.makedirs(os.path.dirname(OUTPUT_ZIP), exist_ok=True)
    fixed_time = (2026, 11, 13, 0, 0, 0)

    manifest_lines = [
        "# SHA256 Manifest: ZLCE Mode SIMPLE / LITE Single Bundle v4.1.0 GA",
        f"# Total Berkas: {len(entries)}",
        "# ------------------------------------------------------------------",
    ]
    for arc_path, data in entries:
        manifest_lines.append(f"{sha256_bytes(data)}  {arc_path}")
    manifest_text = "\n".join(manifest_lines) + "\n"

    with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        m_info = zipfile.ZipInfo(MANIFEST_FILE, date_time=fixed_time)
        m_info.external_attr = 0o100644 << 16
        m_info.compress_type = zipfile.ZIP_DEFLATED
        zipf.writestr(m_info, manifest_text.encode("utf-8"))

        for arc_path, data in entries:
            zinfo = zipfile.ZipInfo(arc_path, date_time=fixed_time)
            zinfo.external_attr = (0o100755 if is_executable(arc_path) else 0o100644) << 16
            zinfo.compress_type = zipfile.ZIP_DEFLATED
            zipf.writestr(zinfo, data)

    sha_errors = verify_sha256_manifest(OUTPUT_ZIP)
    if sha_errors:
        print(f"[FATAL] Verifikasi {MANIFEST_FILE} GAGAL: {sha_errors}")
        return 0

    zip_size_kb = os.path.getsize(OUTPUT_ZIP) / 1024
    print(f"[OK] Mode SIMPLE Kit ZIP dibuat: {OUTPUT_ZIP} ({len(entries)} berkas + manifest, {zip_size_kb:.1f} KB)")
    return len(entries)


if __name__ == "__main__":
    count = create_simple_kit_bundle()
    if count == 0:
        sys.exit(1)
    sys.exit(0)
