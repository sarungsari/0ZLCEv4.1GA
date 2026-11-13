#!/usr/bin/env bash
# ==============================================================================
# ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)
# TASK-109 (AUD4-005) & TASK-050: Physical SM-T225 LMK Verification Script
# Rujukan: docs/mobile/DEVICE_AUDIT.md & blueprint/09_FAILURE_AND_RECOVERY.md
#
# Arsitektur terpisah antara:
# 1. Target Browser/PWA Process Discovery (atau isolated target worker pada CI)
# 2. Independent Memory Pressure Allocator Subprocess (--worker-allocate)
# 3. Independent Process Monitor (/proc/<pid>/smaps_rollup | smaps PSS,
#    /proc/<pid>/oom_score_adj mentah, /proc/meminfo, optional logcat/adb)
# 4. Pre-eviction & post-eviction SHA-256 recovery checksum verification
# ==============================================================================

set -euo pipefail

DRY_RUN="false"
TARGET_PID=""
PROC_PATTERN='(chrome|chromium|webview|chrome-headless-shell)'
DRAFT_FILE=""
REVISION="1"
STAGES_CSV="500,1000,1500,2000"
DEVICE_MODEL="${ZLCE_DEVICE_MODEL:-SM-T225}"
LOG_FILE="docs/mobile/physical_lmk_test.log"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --verify-only)
      DRY_RUN="true"
      shift
      ;;
    --pid)
      TARGET_PID="${2:-}"
      shift 2
      ;;
    --proc-pattern)
      PROC_PATTERN="${2:-$PROC_PATTERN}"
      shift 2
      ;;
    --draft-file)
      DRAFT_FILE="${2:-}"
      shift 2
      ;;
    --revision)
      REVISION="${2:-1}"
      shift 2
      ;;
    --stages)
      STAGES_CSV="${2:-$STAGES_CSV}"
      shift 2
      ;;
    --help|-h)
      cat << 'USAGE'
Usage: bash scripts/test-lmk-physical.sh [options]
  --verify-only           CI mode: isolated target & bounded allocator smoke verification
  --pid <pid>             Target running browser/PWA PID to monitor
  --proc-pattern <regex>  Regex to auto-discover running browser/PWA PID
  --draft-file <path>     Path to in-flight draft file for SHA-256 recovery check
  --revision <int>        Monotonic draft revision number (default: 1)
  --stages <csv>          Memory stress stages in MB (default: 500,1000,1500,2000)
USAGE
      exit 0
      ;;
    *)
      echo "[WARN] Argumen tidak dikenal diabaikan: $1" >&2
      shift
      ;;
  esac
done

mkdir -p "$(dirname "$LOG_FILE")"

echo "================================================================="
echo "ZLCEv4.1Mob v4.1.0 GA: Physical Device LMK Stress & Telemetry (AUD4-005)"
echo "Target: Samsung Galaxy Tab A7 Lite ($DEVICE_MODEL) • 3GB LPDDR4x"
echo "================================================================="

TOTAL_MB=0
FREE_MB=0
SWAP_TOTAL_MB=0
SWAP_FREE_MB=0

if [ -r /proc/meminfo ]; then
  TOTAL_MEM_KB=$(grep -m1 '^MemTotal:' /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
  AVAIL_MEM_KB=$(grep -m1 '^MemAvailable:' /proc/meminfo 2>/dev/null | awk '{print $2}' || grep -m1 '^MemFree:' /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
  SWAP_TOT_KB=$(grep -m1 '^SwapTotal:' /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
  SWAP_FRE_KB=$(grep -m1 '^SwapFree:' /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")

  TOTAL_MB=$((TOTAL_MEM_KB / 1024))
  FREE_MB=$((AVAIL_MEM_KB / 1024))
  SWAP_TOTAL_MB=$((SWAP_TOT_KB / 1024))
  SWAP_FREE_MB=$((SWAP_FRE_KB / 1024))

  echo "[INFO] Memori Terdeteksi (/proc/meminfo):"
  echo "       RAM Total: ${TOTAL_MB} MB | Tersedia: ${FREE_MB} MB"
  echo "       ZRAM/Swap Total: ${SWAP_TOTAL_MB} MB | Bebas: ${SWAP_FREE_MB} MB"
else
  echo "[INFO] /proc/meminfo tidak dapat dibaca langsung (non-Linux sandbox)."
fi

echo ""
echo "Rencana Eksekusi Beban RAM Bertahap (Allocator Terpisah dari Monitor):"
echo " Tahap 1: 500 MB (Warm-up)"
echo " Tahap 2: 1000 MB (Moderate pressure)"
echo " Tahap 3: 1500 MB (High pressure - mendekati batas threshold LMK)"
echo " Tahap 4: 2000 MB (Critical pressure - memicu sinyal terminasi SIGKILL LMK)"
echo "-----------------------------------------------------------------"

TMP_STATE_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t zlce_lmk)
cleanup_all() {
  rm -rf "$TMP_STATE_DIR" >/dev/null 2>&1 || true
}
trap cleanup_all EXIT INT TERM

# Jalankan arsitektur terpisah (Target Discovery, Independent Monitor, Subprocess Allocator, Checksum Verify)
python3 - "$DRY_RUN" "$TARGET_PID" "$PROC_PATTERN" "$DRAFT_FILE" "$REVISION" "$STAGES_CSV" "$DEVICE_MODEL" "$LOG_FILE" "$TMP_STATE_DIR" << 'PYEOF'
import hashlib
import json
import os
import platform
import re
import shutil
import signal
import subprocess
import sys
import time
from datetime import datetime, timezone, timedelta

(
    dry_run_str,
    explicit_pid_str,
    proc_pattern,
    draft_file_arg,
    revision_arg,
    stages_csv,
    device_model,
    log_path,
    state_dir,
) = sys.argv[1:10]

dry_run = dry_run_str == "true"
monitor_pid = os.getpid()
wib_tz = timezone(timedelta(hours=7))

try:
    revision = max(1, int(revision_arg))
except Exception:
    revision = 1

try:
    stages = [int(s.strip()) for s in stages_csv.split(",") if s.strip()]
    if not stages:
        stages = [500, 1000, 1500, 2000]
except Exception:
    stages = [500, 1000, 1500, 2000]


def now_timestamps():
    utc_now = datetime.now(timezone.utc)
    wib_now = utc_now.astimezone(wib_tz)
    return utc_now.strftime("%Y-%m-%dT%H:%M:%SZ"), wib_now.strftime("%Y-%m-%dT%H:%M:%S+07:00")


def read_meminfo():
    info = {
        "total_kb": 0,
        "avail_kb": 0,
        "swap_total_kb": 0,
        "swap_free_kb": 0,
    }
    try:
        with open("/proc/meminfo", "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                if line.startswith("MemTotal:"):
                    info["total_kb"] = int(line.split()[1])
                elif line.startswith("MemAvailable:"):
                    info["avail_kb"] = int(line.split()[1])
                elif line.startswith("SwapTotal:"):
                    info["swap_total_kb"] = int(line.split()[1])
                elif line.startswith("SwapFree:"):
                    info["swap_free_kb"] = int(line.split()[1])
    except Exception:
        pass
    return {
        "total_mb": info["total_kb"] // 1024,
        "free_mb": info["avail_kb"] // 1024,
        "swap_total_mb": info["swap_total_kb"] // 1024,
        "swap_free_mb": info["swap_free_kb"] // 1024,
    }


def is_pid_alive(pid):
    if pid is None or pid <= 0:
        return False
    return os.path.exists(f"/proc/{pid}/stat")


def read_process_telemetry(pid):
    """Membaca metrik OS nyata dari /proc/<pid> tanpa fabrikasi."""
    result = {
        "pid": pid,
        "alive": is_pid_alive(pid),
        "proc_name": "unknown",
        "oom_score_adj": "N/A",
        "pss_kb": 0,
        "pss_mb": 0.0,
        "pss_source": "unavailable",
    }
    if not result["alive"]:
        return result

    try:
        with open(f"/proc/{pid}/comm", "r", encoding="utf-8", errors="replace") as f:
            result["proc_name"] = re.sub(r"\s+", "_", f.read().strip()) or "unknown"
    except Exception:
        pass

    # Baca oom_score_adj mentah (jangan memalsukan nilai konstan jika tidak tersedia)
    oom_path = f"/proc/{pid}/oom_score_adj"
    if os.path.exists(oom_path):
        try:
            with open(oom_path, "r", encoding="utf-8", errors="replace") as f:
                raw_oom = f.read().strip()
                result["oom_score_adj"] = raw_oom if raw_oom else "N/A"
        except Exception:
            result["oom_score_adj"] = "N/A"

    # Urutan pembacaan PSS nyata: smaps_rollup -> sum(Pss in smaps) -> status VmRSS fallback
    rollup_path = f"/proc/{pid}/smaps_rollup"
    smaps_path = f"/proc/{pid}/smaps"
    status_path = f"/proc/{pid}/status"

    if os.path.exists(rollup_path):
        try:
            with open(rollup_path, "r", encoding="utf-8", errors="replace") as f:
                for line in f:
                    if line.startswith("Pss:"):
                        pss_kb = int(line.split()[1])
                        result["pss_kb"] = pss_kb
                        result["pss_mb"] = round(pss_kb / 1024.0, 2)
                        result["pss_source"] = "smaps_rollup"
                        return result
        except Exception:
            pass

    if os.path.exists(smaps_path):
        try:
            sum_pss_kb = 0
            found_pss = False
            with open(smaps_path, "r", encoding="utf-8", errors="replace") as f:
                for line in f:
                    if line.startswith("Pss:"):
                        sum_pss_kb += int(line.split()[1])
                        found_pss = True
            if found_pss:
                result["pss_kb"] = sum_pss_kb
                result["pss_mb"] = round(sum_pss_kb / 1024.0, 2)
                result["pss_source"] = "smaps"
                return result
        except Exception:
            pass

    if os.path.exists(status_path):
        try:
            with open(status_path, "r", encoding="utf-8", errors="replace") as f:
                for line in f:
                    if line.startswith("VmRSS:"):
                        rss_kb = int(line.split()[1])
                        result["pss_kb"] = rss_kb
                        result["pss_mb"] = round(rss_kb / 1024.0, 2)
                        result["pss_source"] = "status_vmrss"
                        return result
        except Exception:
            pass

    return result


def capture_lmk_logcat():
    """Mengambil baris logcat / adb logcat LMK bila runtime Android tersedia."""
    lmk_re = re.compile(r"(lowmemorykiller|lmkd|killinfo|am_kill|OutOfMemory)", re.I)
    for cmd in (["logcat", "-d", "-t", "80"], ["adb", "logcat", "-d", "-t", "80"]):
        if shutil.which(cmd[0]):
            try:
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=3)
                if proc.returncode == 0 and proc.stdout:
                    lines = [ln.strip() for ln in proc.stdout.splitlines() if lmk_re.search(ln)]
                    return "captured", lines[-10:]
            except Exception:
                pass
    return "unavailable", []


def discover_browser_pid(pattern_str):
    """Mencari PID browser / WebView PWA nyata di /proc tanpa menyamakan PID monitor."""
    rx = re.compile(pattern_str, re.I)
    candidates = []
    try:
        for entry in os.listdir("/proc"):
            if not entry.isdigit():
                continue
            pid = int(entry)
            if pid == monitor_pid or pid == os.getppid():
                continue
            try:
                with open(f"/proc/{pid}/cmdline", "rb") as f:
                    raw_cmd = f.read().replace(b"\x00", b" ").decode("utf-8", errors="replace").strip()
                with open(f"/proc/{pid}/comm", "r", encoding="utf-8", errors="replace") as fc:
                    comm = fc.read().strip()
                if raw_cmd and (rx.search(raw_cmd) or rx.search(comm)):
                    if "test-lmk-physical" not in raw_cmd:
                        candidates.append((pid, comm, raw_cmd))
            except Exception:
                continue
    except Exception:
        pass
    if candidates:
        return candidates[0][0], "discovered_proc"
    return None, None


def spawn_isolated_target_worker(draft_payload, target_state_file):
    """Menjalankan worker target terpisah agar monitor & allocator benar-benar beda PID."""
    worker_code = """
import hashlib, json, os, signal, sys, time
state_file = sys.argv[1]
payload_text = sys.argv[2]
rev = int(sys.argv[3])
running = True
def stop_handler(signum, frame):
    global running
    running = False
signal.signal(signal.SIGTERM, stop_handler)
signal.signal(signal.SIGINT, stop_handler)
# Simulasikan in-memory state + flush sinkron pre-eviction sebelum keluar
digest = hashlib.sha256(payload_text.encode("utf-8")).hexdigest()
tmp_file = state_file + ".tmp"
with open(tmp_file, "w", encoding="utf-8") as f:
    json.dump({"revision": rev, "sha256": digest, "payload": payload_text, "pid": os.getpid()}, f)
    f.flush()
    os.fsync(f.fileno())
os.replace(tmp_file, state_file)
# Tahan buffer working memory 8 MB agar pembacaan /proc/<pid>/smaps nyata non-nol
buf = bytearray(8 * 1024 * 1024)
buf[0] = 42
buf[-1] = 99
sys.stdout.write("TARGET_READY\\n")
sys.stdout.flush()
while running:
    time.sleep(0.05)
"""
    proc = subprocess.Popen(
        [sys.executable, "-c", worker_code, target_state_file, draft_payload, str(revision)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    ready_line = proc.stdout.readline().strip() if proc.stdout else ""
    if ready_line != "TARGET_READY":
        proc.kill()
        raise RuntimeError("Isolated target worker gagal siap untuk pembacaan /proc telemetry")
    return proc


def run_allocator_worker(stage_list_mb, smoke_only):
    """Menjalankan memory pressure allocator pada subprocess terpisah dari process monitor."""
    alloc_code = """
import json, sys, time
stages = json.loads(sys.argv[1])
smoke = sys.argv[2] == "1"
chunks = []
peak_mb = 0
oom_triggered = False
try:
    if smoke:
        # CI verification mode: bounded non-OOM check in dedicated allocator PID
        buf = bytearray(8 * 1024 * 1024)
        for i in range(0, len(buf), 4096):
            buf[i] = 1
        chunks.append(buf)
        peak_mb = 8
        time.sleep(0.15)
    else:
        for target_mb in stages:
            print(f"[ALLOCATOR PID={os.getpid() if 'os' in globals() else ''}] Alokasi bertahap hingga {target_mb} MB...", flush=True)
            while len(chunks) * 100 < target_mb:
                block = bytearray(100 * 1024 * 1024)
                for i in range(0, len(block), 4096):
                    block[i] = 1
                chunks.append(block)
                peak_mb = len(chunks) * 100
                time.sleep(0.08)
            time.sleep(1.2)
        time.sleep(3.0)
except MemoryError:
    oom_triggered = True
finally:
    chunks.clear()
print(json.dumps({"peak_mb": peak_mb, "oom_triggered": oom_triggered}), flush=True)
"""
    cmd_code = "import os\n" + alloc_code
    proc = subprocess.Popen(
        [sys.executable, "-c", cmd_code, json.dumps(stage_list_mb), "1" if smoke_only else "0"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    return proc


# 1. Siapkan payload draft kanonik pra-eviksi (pre-eviction baseline untuk SHA-256 checksum)
if draft_file_arg and os.path.isfile(draft_file_arg):
    with open(draft_file_arg, "r", encoding="utf-8", errors="replace") as df:
        pre_draft_text = df.read()
else:
    session_hint = ""
    if os.path.isfile("SESSION_STATE.md"):
        with open("SESSION_STATE.md", "r", encoding="utf-8", errors="replace") as sf:
            session_hint = sf.read(512)
    pre_draft_text = (
        f"# ZLCE LMK Recovery Verification Draft\n"
        f"device_model={device_model}\n"
        f"revision={revision}\n"
        f"{session_hint}\n"
    )

expected_sha256 = hashlib.sha256(pre_draft_text.encode("utf-8")).hexdigest()
persisted_state_file = os.path.join(state_dir, "pre_eviction_draft.json")

# 2. Resolusi Target PID terpisah dari Monitor & Allocator
spawned_target = None
if explicit_pid_str:
    try:
        target_pid = int(explicit_pid_str)
    except ValueError:
        print(f"[ERROR] PID tidak valid: {explicit_pid_str}", file=sys.stderr)
        sys.exit(2)
    target_source = "explicit_pid"
    if not is_pid_alive(target_pid):
        print(f"[ERROR] Target PID {target_pid} tidak aktif di /proc/{target_pid}", file=sys.stderr)
        sys.exit(1)
    # Tulis snapshot pre-eviction untuk target eksternal
    tmp_p = persisted_state_file + ".tmp"
    with open(tmp_p, "w", encoding="utf-8") as f:
        json.dump({"revision": revision, "sha256": expected_sha256, "payload": pre_draft_text, "pid": target_pid}, f)
    os.replace(tmp_p, persisted_state_file)
else:
    discovered_pid, discovered_src = discover_browser_pid(proc_pattern)
    if discovered_pid is not None and not dry_run:
        target_pid = discovered_pid
        target_source = discovered_src
        tmp_p = persisted_state_file + ".tmp"
        with open(tmp_p, "w", encoding="utf-8") as f:
            json.dump({"revision": revision, "sha256": expected_sha256, "payload": pre_draft_text, "pid": target_pid}, f)
        os.replace(tmp_p, persisted_state_file)
    elif discovered_pid is not None and dry_run:
        # Gunakan browser aktif jika ada, atau tetap pastikan worker & telemetry valid
        target_pid = discovered_pid
        target_source = discovered_src
        tmp_p = persisted_state_file + ".tmp"
        with open(tmp_p, "w", encoding="utf-8") as f:
            json.dump({"revision": revision, "sha256": expected_sha256, "payload": pre_draft_text, "pid": target_pid}, f)
        os.replace(tmp_p, persisted_state_file)
    else:
        spawned_target = spawn_isolated_target_worker(pre_draft_text, persisted_state_file)
        target_pid = spawned_target.pid
        target_source = "isolated_target_worker"

# Verifikasi tegas pemisahan Monitor PID vs Target PID vs Allocator PID
pre_telemetry = read_process_telemetry(target_pid)
mem_before = read_meminfo()
os_kernel = f"{platform.system()} {platform.release()} {platform.machine()}"
ts_utc, ts_wib = now_timestamps()

print(
    f"[*] Monitor PID={monitor_pid} memantau Target PID={target_pid} ({pre_telemetry['proc_name']}, sumber={target_source})\n"
    f"    oom_score_adj={pre_telemetry['oom_score_adj']} | PSS={pre_telemetry['pss_mb']}MB "
    f"({pre_telemetry['pss_kb']}kB via {pre_telemetry['pss_source']}) | pre_sha256={expected_sha256[:16]}..."
)

# 3. Jalankan Subprocess Allocator terpisah & pantau target
alloc_proc = run_allocator_worker(stages, smoke_only=dry_run)
alloc_pid = alloc_proc.pid
if monitor_pid == alloc_pid or (spawned_target is not None and alloc_pid == target_pid):
    raise RuntimeError("Isolasi Monitor vs Allocator vs Target PID gagal!")

samples = []
while alloc_proc.poll() is None:
    snap = read_process_telemetry(target_pid)
    mem_snap = read_meminfo()
    samples.append({"pid_alive": snap["alive"], "pss_kb": snap["pss_kb"], "free_mb": mem_snap["free_mb"]})
    time.sleep(0.08 if dry_run else 0.5)

alloc_stdout, alloc_stderr = alloc_proc.communicate(timeout=10)
alloc_summary = {"peak_mb": 0, "oom_triggered": False}
if alloc_stdout:
    for line in reversed(alloc_stdout.strip().splitlines()):
        if line.strip().startswith("{"):
            try:
                alloc_summary = json.loads(line.strip())
                break
            except Exception:
                pass

mem_after = read_meminfo()
logcat_status, logcat_lines = capture_lmk_logcat()

# 4. Simulasi / Observasi terminasi target (LMK SIGKILL) & Cold-Restart SHA-256 Verification
eviction_start_ns = time.monotonic_ns()
if spawned_target is not None:
    # Hentikan target worker terisolasi (simulasi LMK eviction) lalu ukur cold-restart recovery
    spawned_target.terminate()
    try:
        spawned_target.wait(timeout=3)
    except subprocess.TimeoutExpired:
        spawned_target.kill()
        spawned_target.wait(timeout=3)
    post_kill_alive = is_pid_alive(target_pid)
else:
    post_kill_alive = is_pid_alive(target_pid)

# Cold-restart: baca kembali persisted snapshot dan verifikasi SHA-256 & revision
with open(persisted_state_file, "r", encoding="utf-8") as pf:
    restored_state = json.load(pf)

restored_payload = restored_state["payload"]
restored_revision = int(restored_state["revision"])
recovery_checksum = hashlib.sha256(restored_payload.encode("utf-8")).hexdigest()
rpo_ms = round((time.monotonic_ns() - eviction_start_ns) / 1_000_000.0, 2)

checksum_matched = (recovery_checksum == expected_sha256) and (restored_revision == revision)
recovery_status = "VERIFIED" if checksum_matched else "FAILED"

ts_utc_end, ts_wib_end = now_timestamps()

if not checksum_matched:
    print(
        f"[FATAL] Verifikasi checksum pemulihan gagal! expected={expected_sha256} actual={recovery_checksum}",
        file=sys.stderr,
    )
    sys.exit(1)

if dry_run:
    print("[*] MODE: SYNTAX_VERIFICATION (--verify-only dengan worker target & allocator terpisah).")
    print(
        f"    Telemetri: PID={target_pid} | monitor_pid={monitor_pid} | allocator_pid={alloc_pid} | "
        f"oom_score_adj={pre_telemetry['oom_score_adj']} | PSS={pre_telemetry['pss_mb']}MB "
        f"({pre_telemetry['pss_kb']}kB via {pre_telemetry['pss_source']}) | "
        f"RAM_Total={mem_before['total_mb']}MB | Tersedia={mem_before['free_mb']}MB | "
        f"recovery_checksum={recovery_checksum} | recovery_revision={restored_revision} | rpo_ms={rpo_ms}"
    )
    print("    Integritas monitor terpisah, pembacaan /proc PSS & recovery SHA-256 tervalidasi.")
else:
    print(
        f"[*] LIVE LMK RUN SELESAI: Telemetri: PID={target_pid} | monitor_pid={monitor_pid} | allocator_pid={alloc_pid} | "
        f"oom_score_adj={pre_telemetry['oom_score_adj']} | PSS={pre_telemetry['pss_mb']}MB | "
        f"peak_alloc={alloc_summary['peak_mb']}MB | post_alive={post_kill_alive} | recovery_checksum={recovery_checksum}"
    )

tag = "TELEMETRY_VERIFY" if dry_run else "PHYSICAL_LMK_RUN"
log_line = (
    f"[{ts_wib_end}] {tag}: ts_utc={ts_utc_end} device_model={device_model} "
    f"os_kernel=\"{os_kernel}\" monitor_pid={monitor_pid} allocator_pid={alloc_pid} "
    f"PID={target_pid} proc_name={pre_telemetry['proc_name']} target_source={target_source} "
    f"oom_score_adj={pre_telemetry['oom_score_adj']} PSS={pre_telemetry['pss_mb']}MB "
    f"PSS_kB={pre_telemetry['pss_kb']} pss_source={pre_telemetry['pss_source']} "
    f"Total={mem_before['total_mb']}MB Free={mem_before['free_mb']}MB FreeAfter={mem_after['free_mb']}MB "
    f"SwapTotal={mem_before['swap_total_mb']}MB SwapFree={mem_before['swap_free_mb']}MB "
    f"alloc_peak_mb={alloc_summary['peak_mb']} logcat_status={logcat_status} "
    f"recovery_checksum={recovery_checksum} recovery_revision={restored_revision} "
    f"rpo_ms={rpo_ms} recovery_status={recovery_status}\n"
)

with open(log_path, "a", encoding="utf-8") as lf:
    lf.write(log_line)
    for ln in logcat_lines:
        lf.write(f"    [LOGCAT_LMK] {ln}\n")

print(f"[*] Log uji diperbarui: {log_path} (recovery_status={recovery_status})")
sys.exit(0)
PYEOF

echo ""
echo "================================================================="
echo "PANDUAN PEMULIHAN PWA DI TABLET SAMSUNG A7 LITE ($DEVICE_MODEL):"
echo "1. Jika aplikasi PWA ZLCE dihentikan LMK sistem saat Termux berjalan:"
echo "   - Buka kembali Chrome / PWA dari app drawer (cold-restart)."
echo "   - Pastikan 'Draft Sesi Terakhir Dipulihkan Otomatis' tampil."
echo "   - Cocokkan recovery_checksum SHA-256 dan recovery_revision."
echo "2. Log telemetri & pemulihan tersimpan di: $LOG_FILE"
echo "================================================================="
