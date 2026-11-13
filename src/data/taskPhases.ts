/**
 * ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)
 * Katalog 22 Fase Eksekusi & Pemetaan Rentang Task (Fase 0 s/d Fase 21)
 * Single Source of Truth definisi fase untuk filter Dashboard dan reader.
 */

export interface TaskPhaseDefinition {
  id: string;
  name: string;
  range: string;
  count: number;
  priority?: boolean;
  minNum: number;
  maxNum: number;
}

export const TASK_PHASES: TaskPhaseDefinition[] = [
  { id: 'all', name: 'Semua Task', range: 'TASK-001 s/d TASK-134', count: 134, minNum: 1, maxNum: 999 },
  { id: 'fase-0', name: 'Fase 0: Baseline & Lingkungan Uji', range: 'TASK-001 s/d TASK-002', count: 2, minNum: 1, maxNum: 2 },
  { id: 'fase-1', name: 'Fase 1: PWA & Ergonomi Tablet', range: 'TASK-003 s/d TASK-007', count: 5, minNum: 3, maxNum: 7 },
  { id: 'fase-2', name: 'Fase 2: Markdown Workspace', range: 'TASK-008 s/d TASK-012', count: 5, minNum: 8, maxNum: 12 },
  { id: 'fase-3', name: 'Fase 3: Multi-AI & Context Pack', range: 'TASK-013 s/d TASK-018', count: 6, priority: true, minNum: 13, maxNum: 18 },
  { id: 'fase-4', name: 'Fase 4: Multi-Akun & Tim Estafet', range: 'TASK-019 s/d TASK-024', count: 6, priority: true, minNum: 19, maxNum: 24 },
  { id: 'fase-5', name: 'Fase 5: Command Hub & Termux', range: 'TASK-025 s/d TASK-030', count: 6, minNum: 25, maxNum: 30 },
  { id: 'fase-6', name: 'Fase 6: Git Sync & Kolaborasi Cabang', range: 'TASK-031 s/d TASK-035', count: 5, minNum: 31, maxNum: 35 },
  { id: 'fase-7', name: 'Fase 7: Uji Fisik SM-T225 & Integrasi', range: 'TASK-036 s/d TASK-040', count: 5, minNum: 36, maxNum: 40 },
  { id: 'fase-8', name: 'Fase 8: Dokumentasi & Panduan', range: 'TASK-041 s/d TASK-043', count: 3, minNum: 41, maxNum: 43 },
  { id: 'fase-9', name: 'Fase 9: Review Multi-AI Eksternal', range: 'TASK-044 s/d TASK-046', count: 3, minNum: 44, maxNum: 46 },
  { id: 'fase-10', name: 'Fase 10: Remediasi Audit & Pengerasan', range: 'TASK-047 s/d TASK-060', count: 14, minNum: 47, maxNum: 60 },
  { id: 'fase-11', name: 'Fase 11: Remediasi Audit Lanjutan', range: 'TASK-061 s/d TASK-074', count: 14, minNum: 61, maxNum: 74 },
  { id: 'fase-12', name: 'Fase 12: Production Hardening GA', range: 'TASK-075 s/d TASK-082', count: 8, minNum: 75, maxNum: 82 },
  { id: 'fase-13', name: 'Fase 13: Final Review & Polish', range: 'TASK-083 s/d TASK-088', count: 6, minNum: 83, maxNum: 88 },
  { id: 'fase-14', name: 'Fase 14: Dokumentasi, Tutorial & Log', range: 'TASK-089 s/d TASK-095', count: 7, minNum: 89, maxNum: 95 },
  { id: 'fase-15', name: 'Fase 15: Remediasi P0 & Zero-Secret Gate', range: 'TASK-096 s/d TASK-100', count: 5, minNum: 96, maxNum: 100 },
  { id: 'fase-16', name: 'Fase 16: Peningkatan UX P1 & Alur Tim', range: 'TASK-101 s/d TASK-106', count: 6, minNum: 101, maxNum: 106 },
  { id: 'fase-17', name: 'Fase 17: Diagnostik PWA & Gerbang GA', range: 'TASK-107 s/d TASK-111', count: 5, minNum: 107, maxNum: 111 },
  { id: 'fase-18', name: 'Fase 18: Remediasi Frontend PWA & ZLCEv4Mobile', range: 'TASK-112 s/d TASK-118', count: 7, minNum: 112, maxNum: 118 },
  { id: 'fase-19', name: 'Fase 19: Penyederhanaan Frontend PWA & Dashboard Teknis', range: 'TASK-119 s/d TASK-124', count: 6, priority: true, minNum: 119, maxNum: 124 },
  { id: 'fase-20', name: 'Fase 20: Penyelarasan Kontrol FULL/LITE & v4.1.0 GA', range: 'TASK-125 s/d TASK-129', count: 5, priority: true, minNum: 125, maxNum: 129 },
  { id: 'fase-21', name: 'Fase 21: Single Source of Truth & Optimasi Repo/PWA', range: 'TASK-130 s/d TASK-134', count: 5, priority: true, minNum: 130, maxNum: 999 }
];
