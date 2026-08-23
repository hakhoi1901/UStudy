import type { ClassSection } from '../../../types';

// ─── Draft Selection ────────────────────────────────────────────────────────

/** Một lớp đã được chọn trong builder (thủ công hoặc bởi solver). */
export interface DraftSelection {
  courseCode: string;
  courseName: string;
  classId: string;
  locked: boolean;
  source: 'manual' | 'solver';
  preferredClassId?: string;
  classSections: ClassSection[];
}

// ─── Conflict ───────────────────────────────────────────────────────────────

export type ConflictType = 'time_overlap' | 'missing_component';
export type ConflictSeverity = 'error' | 'warning';

export interface ScheduleConflict {
  type: ConflictType;
  severity: ConflictSeverity;
  message: string;
  involvedCourses: string[];
}

// ─── Draft ──────────────────────────────────────────────────────────────────

export interface ScheduleDraft {
  selections: DraftSelection[];
  conflicts: ScheduleConflict[];
}

// ─── Available Class (from course_db_offline) ───────────────────────────────

export interface AvailableClassScheduleEntry {
  day: number;
  period: number;
  duration: number;
  room?: string;
}

export interface AvailableClass {
  id: string;
  courseCode: string;
  schedule: AvailableClassScheduleEntry[];
  scheduleLabel: string;
}
