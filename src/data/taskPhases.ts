/**
 * ZLCE Mobile Workbench v4.1.0 GA (ZLCEv4.1Mob)
 * Katalog Fase Operasional Baseline Terkunci (Fase 0)
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
  { id: 'all', name: 'Semua Task', range: 'TASK-001 s/d TASK-003', count: 3, minNum: 1, maxNum: 999 },
  { id: 'fase-0', name: 'Fase 0: Baseline Terkunci v4.1.0 GA', range: 'TASK-001 s/d TASK-003', count: 3, priority: true, minNum: 1, maxNum: 999 }
];

