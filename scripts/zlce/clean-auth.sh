#!/usr/bin/env bash
# ==============================================================================
# ZLCE Mobile Workbench: Git Credential Cache Cleaner (clean-auth)
# Blueprint 08 (Security Model), ADR-04 (In-Memory Credential Cache), AUD2-004, AUD4-003
#
# Mematikan daemon git-credential-cache di memori RAM Termux, menghapus soket,
# memverifikasi remote URL, dan memeriksa status credential helper tanpa
# merusak identitas global yang sah, serta memberikan penegakan Fail-Closed (TASK-097).
#
# Source-safe: jika dijalankan via `source clean-auth.sh`, menggunakan return alih-alih exit.
# ==============================================================================

# Deteksi apakah skrip di-source atau dieksekusi sebagai subproses mandiri
_is_sourced() {
  [ "${BASH_SOURCE[0]}" != "${0}" ]
}

_finish() {
  local code="${1:-0}"
  if _is_sourced; then
    return "$code" 2>/dev/null || exit "$code"
  else
    exit "$code"
  fi
}

if ! _is_sourced; then
  set -euo pipefail
fi

EXIT_CODE=0
FAIL_REASONS=()

echo "==> [ZLCE clean-auth] Memulai pembersihan kredensial RAM & inspeksi kontrol tablet..."

# 1. Hentikan daemon cache kredensial git di memori RAM
if git credential-cache exit 2>/dev/null; then
  echo "    [PASS] git-credential-cache daemon berhasil dihentikan dari RAM."
else
  echo "    [PASS] Tidak ada daemon git-credential-cache aktif di memori."
fi

# 2. Hapus seluruh soket dan direktori sementara credential cache
SOCKET_PATHS=(
  "$HOME/.git-credential-cache"
  "${XDG_CACHE_HOME:-$HOME/.cache}/git/credential"
  "/data/data/com.termux/files/usr/tmp/.git-credential-cache"
  "/tmp/.git-credential-cache"
)

SOCKETS_CLEARED=0
for p in "${SOCKET_PATHS[@]}"; do
  if [ -e "$p" ]; then
    rm -rf "$p" 2>/dev/null || true
    echo "    [PASS] File soket/cache dibersihkan: $p"
    SOCKETS_CLEARED=$((SOCKETS_CLEARED + 1))
  fi
done
if [ "$SOCKETS_CLEARED" -eq 0 ]; then
  echo "    [PASS] Tidak ditemukan file soket residual pada filesystem."
fi

# 3. Periksa seluruh konfigurasi credential.helper aktif (deteksi non-RAM helper - Fail-Closed AUD4-003)
echo "    [INFO] Memeriksa konfigurasi credential.helper aktif..."
ACTIVE_HELPERS=$(git config --show-origin --get-all credential.helper 2>/dev/null || true)
if [ -n "$ACTIVE_HELPERS" ]; then
  echo "    [INFO] Helper aktif terdeteksi:"
  echo "$ACTIVE_HELPERS" | sed 's/^/           /'
  
  # Fail-Closed: Hanya helper 'cache' yang diizinkan (misal 'cache' atau 'cache --timeout=900')
  # Helper persisten seperti 'store', 'manager', 'osxkeychain', 'wincred', dsb. diblokir mutlak
  HAS_UNSAFE_HELPER=0
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    # Ambil nilai helper setelah pemisah spasi/tab dari --show-origin
    helper_val=$(echo "$line" | sed -E 's/^[^[:space:]]+[[:space:]]+//')
    if ! echo "$helper_val" | grep -qE '^cache([[:space:]]|$)'; then
      HAS_UNSAFE_HELPER=1
      break
    fi
  done <<< "$ACTIVE_HELPERS"

  if [ "$HAS_UNSAFE_HELPER" -eq 1 ]; then
    echo "    [FAIL] Terdeteksi credential helper persisten yang menyimpan kredensial ke disk!"
    echo "           Kebijakan Zero-Secret (AUD4-003 / SEC-002) melarang keras helper disk (store, manager, dsb)."
    echo "           Remediasi: Jalankan 'git config --unset-all credential.helper' atau gunakan 'git config credential.helper \"cache --timeout=900\"'."
    EXIT_CODE=1
    FAIL_REASONS+=("Credential helper persisten terdeteksi di git config")
  else
    echo "    [PASS] Seluruh credential helper terkonfirmasi berbasis memori RAM sementara ('cache')."
  fi
else
  echo "    [PASS] Tidak ada credential.helper terdaftar (kredensial hanya diminta per sesi)."
fi

# 4. Unset environment variables pada proses saat ini
unset GIT_AUTHOR_NAME 2>/dev/null || true
unset GIT_AUTHOR_EMAIL 2>/dev/null || true
unset GIT_COMMITTER_NAME 2>/dev/null || true
unset GIT_COMMITTER_EMAIL 2>/dev/null || true
unset GITHUB_TOKEN 2>/dev/null || true
unset GH_TOKEN 2>/dev/null || true
echo "    [PASS] Variabel lingkungan autentikasi pada sub-proses telah di-unset."
echo "    [ADVISORY] Untuk membersihkan environment shell induk Termux, jalankan: source scripts/zlce/clean-auth.sh"

# 5. Verifikasi integritas Git Remote URL (Zero-Secret di level remote)
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  LEAKED_REMOTE=$(git remote -v 2>/dev/null | grep -E 'https?://[^/[:space:]@:]+:[^/[:space:]@]+@' || true)
  if [ -n "$LEAKED_REMOTE" ]; then
    echo "    [FAIL] Terdeteksi kredensial tertanam di git remote URL!"
    echo "    $LEAKED_REMOTE"
    echo "    Remediasi: Jalankan 'git remote set-url origin https://github.com/USER/REPO.git' tanpa user:token."
    EXIT_CODE=1
    FAIL_REASONS+=("Kredensial tertanam pada git remote URL")
  else
    echo "    [PASS] Verifikasi Remote Git: Bersih dari token tertanam pada URL."
  fi
fi

# 6. Saran kebersihan sesi peramban dan riwayat shell
echo "    [CHECKLIST] Rekomendasi serah terima tablet:"
echo "                1. Tutup tab sesi AI di browser peramban Android."
echo "                2. Jalankan 'history -c' di Termux jika pernah mengetik token manual."
echo "                3. Salin teks kosong ke clipboard untuk membersihkan buffer RAM."

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "==> [ZLCE clean-auth] STATUS: VERIFIKASI SELESAI (RAM daemon dihentikan, socket dibersihkan, remote URL & helper aman)."
  _finish 0
else
  echo "==> [ZLCE clean-auth] STATUS: GAGAL. ${FAIL_REASONS[*]:-Ditemukan pelanggaran keamanan!}"
  _finish 1
fi
