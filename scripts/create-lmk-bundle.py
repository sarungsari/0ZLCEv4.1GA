#!/usr/bin/env python3
"""
Script pembuat berkas bundel ZIP khusus Arsitektur Ketahanan Android LMK & Recovery ZLCE (v4.1.0 GA).
Membundel 5 berkas kunci + SHA256SUMS.txt:
1. SESSION_STATE.md (Status sesi & Sumber Kebenaran Tunggal)
2. docs/mobile/MOBILE_BLUEPRINT.md (Cetak Biru Utama Mobile ZLCE)
3. src/hooks/useAutoDraftCache.ts (Implementasi debounce & visibilitychange lifecycle flush)
4. src/tests/lmkRecovery.test.ts (Suite uji simulasi Android LMK & pemulihan memori 3GB)
5. docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md (Protokol kegagalan & strategi LMK)

Target output: release-bundles/zlce-lmk-recovery-bundle.zip
"""

import hashlib
import os
import re
import sys
import zipfile

FILES_TO_BUNDLE = [
    "SESSION_STATE.md",
    "docs/mobile/MOBILE_BLUEPRINT.md",
    "src/hooks/useAutoDraftCache.ts",
    "src/tests/lmkRecovery.test.ts",
    "docs/mobile/blueprint/09_FAILURE_AND_RECOVERY.md"
]

OUTPUT_ZIP = "release-bundles/zlce-lmk-recovery-bundle.zip"
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

    print(f"[*] Menyiapkan bundel ZIP LMK Recovery di: {OUTPUT_ZIP}")
    unique_files = sorted(set(FILES_TO_BUNDLE))
    missing = [rel for rel in unique_files if not os.path.exists(os.path.join(base_dir, rel))]
    if missing:
        print(f"[FATAL] Berkas tidak ditemukan: {missing}")
        return 0

    fixed_time = (2026, 11, 13, 0, 0, 0)
    manifest_lines = [
        "# SHA256 Manifest: ZLCE LMK Recovery Bundle (v4.1.0 GA)",
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
    print(f"[OK] Berhasil membuat bundel LMK Recovery: {OUTPUT_ZIP} ({included_count}/{len(unique_files)} berkas + manifest, {zip_size_kb:.1f} KB)")
    return included_count


if __name__ == "__main__":
    count = create_bundle()
    if count == 0:
        sys.exit(1)
    sys.exit(0)
