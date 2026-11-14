# SPESIFIKASI ARSITEKTUR SISTEM: ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)

Arsitektur 4-lapisan PWA + Termux, pohon direktori aktual, dan indeks Architectural Decision Records (ADR). Diperbarui bila task dengan `Docs Impact: ARCHITECTURE` selesai. Referensi rinci: [`docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md`](docs/mobile/blueprint/02_COMPONENT_ARCHITECTURE.md) & [`12_ARCHITECTURE_DECISIONS.md`](docs/mobile/blueprint/12_ARCHITECTURE_DECISIONS.md).

---

## 1. POLA & LAYER ARSITEKTUR

```text
PRESENTATION   Header (6 Tab Kanonik), MobileLayout, ModalShell, DraftTextarea, Tab Views
     | aksi sentuh >= 44px & visualViewport events
APPLICATION    Hooks (useSessionPersistence, useAutoDraftCache, useProjectRegistry, useSessionHistory)
     | state tervalidasi & draft scoped per anggota
DOMAIN         Utils Murni (markdownParser, sessionStateValidator, contextPackGenerator,
               promptGenerator, provenanceInjector, commandSanitizer, taskClaimManager, redactSecrets)
     | persistensi lokal / SSE bridge / clipboard 1-tap
INFRASTRUCTURE LocalStorage + Service Worker (public/sw.js Cache-First) + Vite Bridge (/api/session-state)
               + Termux CLI (scripts/zlce/zlce, zlce-check.py, clean-auth.sh)
```

Aturan dependensi: panah hanya ke bawah; lapisan `src/utils/` bersifat murni tanpa dependensi komponen UI (`src/components/`). Tidak ada ketergantungan aplikasi eksternal (Obsidian dieksklusikan per `ADR-09`).

---

## 2. POHON DIREKTORI AKTUAL

```text
ZLCE4.1/
├── BLUEPRINT.md  ARCHITECTURE.md  DATA_MODEL.md
├── AI_WORKFLOW.md  TASKS.md  SESSION_STATE.md  TESTING.md
├── CHECKLISTS.md  HANDOVER.md  CHANGELOG.md  README.md
├── LANDING_PROMPT.md  HANDOVER_PROMPT.md
├── index.html  package.json  tsconfig.json  vite.config.ts  vite-session-sync.ts
├── public/
│   ├── manifest.webmanifest  sw.js
│   └── icons/                # Ikon PWA 192, 512, maskable, apple-touch-icon
├── release-bundles/          # Keluaran on-demand bundel ZIP + SHA256SUMS.txt (gitignored)
├── src/
│   ├── App.tsx  main.tsx  index.css  sw-register.ts
│   ├── types/                # zlce.ts (6 TabType kanonik), mobile.ts
│   ├── data/                 # teamMembers.ts, taskPhases.ts, commandTemplates.ts, scenarios.ts, templates.ts
│   ├── hooks/                # useAutoDraftCache, useSessionPersistence, useProjectRegistry, dll.
│   ├── utils/                # Validator, parser, sanitizer, redaksi, generator, CAS claim guard
│   ├── components/           # DashboardTab, SessionStateTab, DiagnosticsTab, DocsReferenceTab, Header, dll.
│   │   └── mobile/           # AiWorkbenchTab, TerminalGitTab, ModalShell, DraftTextarea, MobileLayout, dll.
│   └── tests/                # 34+ suite uji otomatis TypeScript/Chromium
├── archive/                  # Arsip riwayat dev, laporan review & komponen pra-FASE 19 (gitignored)
├── docs/
│   ├── README.md  USAGE.md
│   └── mobile/               # Pilar 1-3 + blueprint/ (14 modul blueprint APPROVED/AS-BUILT)
├── scripts/                  # run-tests.py, zlce-check.py, sync-assets.mjs, create-*-bundle.py, zlce/
├── templates/                # 9 template dokumen kontrol + profiles/DOMAIN_BOOKING.profile.md
└── zlce-starter-kit/         # Starter kit skeleton bersih siap salin untuk proyek baru (Mode LITE & FULL)
```

---

## 3. INDEKS ARCHITECTURAL DECISION RECORDS (ADR)

Rincian konteks, keputusan, dan mitigasi lengkap tersedia di [`docs/mobile/blueprint/12_ARCHITECTURE_DECISIONS.md`](docs/mobile/blueprint/12_ARCHITECTURE_DECISIONS.md):

| ID | Keputusan Arsitektural | Status |
| :--- | :--- | :--- |
| **ADR-01** | PWA React/Vite + Termux CLI 1-ketukan salin (tanpa daemon latar belakang di Android) | Accepted |
| **ADR-02** | Model ketahanan Loss-Bounded Persistence (`RPO <= 400ms` + flush sinkron `visibilitychange`) | Accepted |
| **ADR-03** | 1 Repositori bersama + branch isolasi per task (`task/TASK-XXX`) dengan proteksi `main` | Accepted |
| **ADR-04** | Kebijakan **Zero-Secret** mutlak: cache RAM sementara 900s + `clean-auth.sh` saat serah terima | Accepted |
| **ADR-05** | Atribusi identitas per-commit `-c user.name` & `-c user.email` (`@zlce.local`) | Accepted |
| **ADR-06** | Target sentuh minimal `44x44px` & penyesuaian `visualViewport` keyboard virtual Android | Accepted |
| **ADR-07** | Hak pengesahan gerbang kualitas merata oleh 8 anggota estafet dengan provenance eksplisit | Accepted |
| **ADR-08** | Isolasi komponen & utilisasi `Archive` serta pre-warming lazy chunk untuk mode offline | Accepted |
| **ADR-09** | Eksklusi Obsidian/Joplin dari core demi efisiensi RAM 3GB (100% self-contained PWA) | Accepted |
