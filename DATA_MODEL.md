# SPESIFIKASI SKEMA DATA & MODEL STATE: ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)

Definisi entitas TypeScript, struktur persistensi LocalStorage/Markdown, state machine task, dan formula kalkulasi inti. Sumber skema kode: [`src/types/zlce.ts`](src/types/zlce.ts) dan [`src/types/mobile.ts`](src/types/mobile.ts).

---

## 1. ENTITAS UTAMA

### Entitas: `ZLCETask` & `ParsedSessionState` (`src/types/zlce.ts`)
* **Penyimpanan Fisik:** `SESSION_STATE.md` (Markdown SSOT) + cache scoped LocalStorage + bridge `/api/session-state`.
* **Atribut Inti:**

| Field | Tipe | Constraint / Format | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Regex `^TASK-(?:REV-)?\d+$`, UNIQUE | ID task atomik (`TASK-001`, `TASK-REV-01`) |
| `name` | `string` | NOT NULL | Nama ringkas task pada matriks Bagian 2 |
| `dependencies` | `string` | `-` atau daftar `TASK-XXX` | Seluruh dependensi wajib `DONE` sebelum `IN_PROGRESS` |
| `status` | `TaskStatus` | Enum: `PENDING \| READY \| IN_PROGRESS \| BLOCKED \| DONE` | Nilai lain ditolak oleh `zlce-check.py` |
| `evidence` | `string` | Wajib `>= 5` karakter nyata saat `DONE` | Dilarang `-`, `ok`, `done`, `pass` saat `DONE` |
| `approved` | `string` | `ya` / `ya (oleh: NamaAnggota)` | Penyetuju diverifikasi dari 8 anggota resmi |

### Entitas: `TeamMember` (`src/data/teamMembers.ts` & `src/types/mobile.ts`)
* **Penyimpanan:** Konstanta statis `TEAM_MEMBERS` (8 profil) + ID aktif di `localStorage['zlce_active_member_id']`.
* **Constraint:** Nol rahasia/kredensial; surel sintetik wajib domain `@zlce.local` (`eko@zlce.local`, dst.).

### Entitas: `ScopedDraftEntry` (`src/hooks/useAutoDraftCache.ts`)
* **Kunci Penyimpanan:** `zlce_draft::<memberId>::<projectId>::<fieldKey>` (`getScopedStorageKey`).
* **Kebijakan Keamanan:** Pemindaian regex fail-closed menolak penyimpanan plaintext kredensial (`ghp_*`, `sk-*`, private key).

---

## 2. STATE MACHINE

### Entitas: `ZLCETask.status`

| Dari | Ke | Pemicu | Guard (Syarat Wajib) |
| :--- | :--- | :--- | :--- |
| `PENDING` | `READY` | Dependensi selesai | Semua task pada kolom `Dependensi` berstatus `DONE` |
| `READY` | `IN_PROGRESS` | Klaim task (`claimTask` CAS) | Belum ada task lain yang berstatus `IN_PROGRESS`; WAL diisi |
| `IN_PROGRESS` | `BLOCKED` | Blocker / preempt `TASK-REV-NN` | Alasan dicatat di Bagian 4/6 `SESSION_STATE.md` |
| `BLOCKED` | `IN_PROGRESS` | Blocker teratasi | Tidak ada task lain yang `IN_PROGRESS`; WAL dipulihkan |
| `IN_PROGRESS` | `DONE` | Gerbang Kualitas + Smart Check | AC 100% + `Docs Impact` tercentang + `evidence >= 5 char` + `approved` sah + WAL dikosongkan (`-`) |

Transisi di luar tabel (misal melompat dari `PENDING` ke `DONE` atau dua task `IN_PROGRESS` bersamaan) bersifat ilegal dan ditolak oleh `taskClaimManager.ts`, `Smart Task Check`, serta `scripts/zlce-check.py`.

---

## 3. FORMULA BISNIS & KETAHANAN

1. **Estimasi Kuota Token Multi-AI (`src/utils/tokenBudgetAdapter.ts`):**
   - `estimatedTokens = Math.ceil(characterCount / 3.2)` dengan *safety buffer* per profil (`freebuff-4k`, `compact-8k`, `claude-30k`, `copilot-32k`, `deepseek-64k`, `cursor-64k`, `gpt-128k`, `gemini-1m`) dan pemotongan otomatis konten historis saat mendekati hard cap ($\ge 95\%$).
2. **Model Ketahanan Memori LMK (`RPO <= 400ms`):**
   - Penulisan normal menggunakan debounce `400ms`; event `visibilitychange ('hidden')` dan `pagehide` memicu *synchronous pre-eviction flush* (`dirtyKeyRef`) ke LocalStorage dalam $< 5\text{ms}$ (`RPO = 0` saat berpindah ke Termux/browser AI).
3. **Checksum Integritas Transaksional (`transactionalPersistence.ts`):**
   - Hash deterministik 32-bit DJB2a (`hashString`) memverifikasi penulisan staging LocalStorage terhadap korupsi parsial.
