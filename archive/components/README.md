# Direktori Arsip Komponen Asli (FASE 19 – TASK-119 / Konsolidasi TASK-129)

Direktori ini memuat dokumentasi dan referensi arsip komponen antarmuka pra-penyederhanaan sebelum konsolidasi 6 tab kanonik pada **ZLCE Mobile Workbench v4.1.0 GA (`ZLCEv4.1Mob`)**:

1. `AiHandoverWizard.tsx` → dikonsolidasikan ke `src/components/mobile/AiWorkbenchTab.tsx`
2. `CommandHubTab.tsx` → dikonsolidasikan ke `src/components/mobile/TerminalGitTab.tsx`
3. `ContextPackTab.tsx` → dikonsolidasikan ke `src/components/mobile/AiWorkbenchTab.tsx`
4. `FeedbackReviewTab.tsx` → dikonsolidasikan ke `src/components/mobile/AiWorkbenchTab.tsx`
5. `GitSyncTab.tsx` → dikonsolidasikan ke `src/components/mobile/TerminalGitTab.tsx`
6. `LandingWizardTab.tsx` → dipertahankan sebagai modul lazy opsional (`?tab=initiation`)
7. `PerformanceAuditTab.tsx` → dikonsolidasikan ke `src/components/DiagnosticsTab.tsx`
8. `ResultCaptureTab.tsx` → dikonsolidasikan ke `src/components/mobile/AiWorkbenchTab.tsx`
9. `RevisionTriageTab.tsx` → dikonsolidasikan ke `src/components/DiagnosticsTab.tsx`
10. `SessionTimelineTab.tsx` → dikonsolidasikan ke `src/components/SessionStateTab.tsx`
11. `TestHarnessTab.tsx` → dikonsolidasikan ke `src/components/DiagnosticsTab.tsx`
12. `TutorialTab.tsx` → dikonsolidasikan ke `src/components/DocsReferenceTab.tsx`
13. `WorkspaceReader.tsx` → dikonsolidasikan ke `src/components/DocsReferenceTab.tsx`

Direktori ini dikecualikan dari kompilasi TypeScript (`"exclude": ["dist", "archive"]` pada `tsconfig.json`) dan `src/archive/` telah dibersihkan pada `TASK-129` agar pohon `src/` tetap bersih dan terstruktur.
