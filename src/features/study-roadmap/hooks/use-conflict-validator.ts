import { useMemo } from 'react';
import { getConflicts } from '../../../logic/ScheduleValidator';
import type { ClassSection } from '../../../types';
import type { DraftSelection, ScheduleConflict } from '../types/schedule-builder-types';

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface UseConflictValidatorReturn {
  conflicts: ScheduleConflict[];
  hasErrors: boolean;
  getConflictsForCourse(courseCode: string): ScheduleConflict[];
}

export function useConflictValidator(
  selections: DraftSelection[],
  allSections: ClassSection[],
): UseConflictValidatorReturn {
  const conflicts = useMemo(() => {
    const result: ScheduleConflict[] = [];
    const seen = new Set<string>();

    // 1. Time overlap detection
    for (const section of allSections) {
      const overlapping = getConflicts(section, allSections);
      for (const other of overlapping) {
        // Create a stable key so we don't duplicate A↔B and B↔A
        const key = [
          section.id,
          other.id,
        ].sort().join('::');
        if (seen.has(key)) continue;
        seen.add(key);

        const sectionName =
          section.courseCode === other.courseCode
            ? section.courseCode
            : `${section.courseCode} ↔ ${other.courseCode}`;

        const dayLabel = section.day === 8 ? 'CN' : `T${section.day}`;

        result.push({
          type: 'time_overlap',
          severity: 'error',
          message: `Trùng lịch ${dayLabel} tiết ${section.startPeriod}: ${sectionName}`,
          involvedCourses: [section.courseCode, other.courseCode],
        });
      }
    }

    // 2. Missing component check — warn if a course has TH/BT classes but none are selected
    //    (This is a best-effort check: we can't know for certain without richer metadata,
    //     but if the classId pattern contains _TH_ or _BT_ we know the course has sub-components.)
    // For now, we skip this check as course_db_offline structure varies. Can be added in Phase 2.

    return result;
  }, [selections, allSections]);

  const hasErrors = conflicts.some(c => c.severity === 'error');

  const getConflictsForCourse = (courseCode: string): ScheduleConflict[] => {
    return conflicts.filter(c => c.involvedCourses.includes(courseCode));
  };

  return { conflicts, hasErrors, getConflictsForCourse };
}
