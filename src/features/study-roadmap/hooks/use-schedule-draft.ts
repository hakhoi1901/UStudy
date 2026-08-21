import { useState, useCallback, useEffect, useMemo } from 'react';
import { readFromStorage, saveToStorage } from '../../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../../config';
import { UI_COLORS } from '../../../config';
import type { ClassSection, Course } from '../../../types';
import type { DraftSelection } from '../types/schedule-builder-types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const PALETTE = UI_COLORS.SCHEDULE_PALETTE;

/** Parse schedule string "T2(1-3)" → { day: 2, startPeriod: 1, endPeriod: 3 } */
function parseScheduleEntry(str: string): { day: number; startPeriod: number; endPeriod: number } | null {
  const match = str.match(/T(\d|CN)\s*\((\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\)/);
  if (!match) return null;
  const day = match[1] === 'CN' ? 8 : parseInt(match[1]);
  return {
    day,
    startPeriod: parseFloat(match[2]),
    endPeriod: parseFloat(match[3]),
  };
}

/** Decode a class from course_db_offline into ClassSection[] for calendar display. */
function decodeClassToSections(
  courseCode: string,
  courseName: string,
  classData: { id: string; schedule?: string[]; room?: string },
  color: string,
  credits: number,
): ClassSection[] {
  const scheduleArr = classData.schedule;
  if (!scheduleArr || !Array.isArray(scheduleArr) || scheduleArr.length === 0) return [];

  const sections: ClassSection[] = [];
  for (const entry of scheduleArr) {
    const parsed = parseScheduleEntry(entry);
    if (!parsed) continue;

    sections.push({
      id: `${courseCode}-${classData.id}-d${parsed.day}-p${parsed.startPeriod}`,
      courseCode,
      courseName,
      courseNameVi: courseName,
      sectionNumber: classData.id,
      selectedClassId: classData.id,
      lecturer: 'Chưa cập nhật',
      room: classData.room ?? '---',
      day: parsed.day,
      startPeriod: parsed.startPeriod,
      endPeriod: parsed.endPeriod,
      color,
      isConfirmed: true,
      credits,
    });
  }

  return sections;
}

/** Get deterministic color for a course based on its index among selected courses. */
function getCourseColor(courseCode: string, allCourseCodes: string[]): string {
  const idx = allCourseCodes.indexOf(courseCode);
  return PALETTE[(idx >= 0 ? idx : 0) % PALETTE.length];
}

// ─── Persisted Draft Shape ──────────────────────────────────────────────────

interface PersistedDraft {
  selections: Array<{
    courseCode: string;
    courseName: string;
    classId: string;
    locked: boolean;
    source: 'manual' | 'solver';
    preferredClassId?: string;
  }>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface UseScheduleDraftReturn {
  selections: DraftSelection[];
  allSections: ClassSection[];
  selectClass(courseCode: string, classId: string, allCourses: Course[]): void;
  removeSelection(courseCode: string): void;
  clearDraft(): void;
  importSolverResult(classSections: ClassSection[], selectedCourseIds: Set<string>, allCourses: Course[]): void;
  getLockedConstraints(): { courseCode: string; classId: string }[];
  getUnfilledCourses(
    selectedCourseIds: Set<string>,
    allCourses: Course[]
  ): string[];
  pruneSelections(
    selectedCourseIds: Set<string>,
    allCourses: Course[]
  ): void;
  hasAnySelection: boolean;
  hasLockedSelections: boolean;
}

export function useScheduleDraft(): UseScheduleDraftReturn {
  const [selections, setSelections] = useState<DraftSelection[]>(() => {
    const saved = readFromStorage<PersistedDraft | null>(STORAGE_KEYS.SCHEDULE_BUILDER_DRAFT, null);
    if (!saved?.selections?.length) return [];

    // Restore: we need to re-decode class sections from course_db_offline
    const courseDb = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);
    const allCourseCodes = saved.selections.map(s => s.courseCode);

    return saved.selections
      .map((s): DraftSelection | null => {
        const courseData = courseDb.find((c: any) => c.id === s.courseCode);
        if (!courseData) return null;
        const classData = courseData.classes?.find((cls: any) => cls.id === s.classId);
        if (!classData) return null;

        const color = getCourseColor(s.courseCode, allCourseCodes);
        const classSections = decodeClassToSections(
          s.courseCode,
          s.courseName,
          classData,
          color,
          courseData.credits ?? 0,
        );

        return {
          courseCode: s.courseCode,
          courseName: s.courseName,
          classId: s.classId,
          locked: s.locked,
          source: s.source,
          preferredClassId: s.preferredClassId,
          classSections,
        };
      })
      .filter((s): s is DraftSelection => s !== null);
  });

  // Persist to localStorage
  useEffect(() => {
    const persisted: PersistedDraft = {
      selections: selections.map(s => ({
        courseCode: s.courseCode,
        courseName: s.courseName,
        classId: s.classId,
        locked: s.locked,
        source: s.source,
        preferredClassId: s.preferredClassId,
      })),
    };
    saveToStorage(STORAGE_KEYS.SCHEDULE_BUILDER_DRAFT, persisted);
  }, [selections]);

  // All ClassSection[] flattened for calendar rendering
  const allSections = useMemo(
    () => selections.flatMap(s => s.classSections),
    [selections],
  );

  const selectClass = useCallback((courseCode: string, classId: string, allCourses: Course[]) => {
    const courseDb = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);
    const courseData = courseDb.find((c: any) => c.id === courseCode);
    if (!courseData) return;
    const classData = courseData.classes?.find((cls: any) => cls.id === classId);
    if (!classData) return;

    const courseInfo = allCourses.find(c => c.code === courseCode || c.id === courseCode);
    const courseName = courseInfo?.nameVi ?? courseData.name ?? courseCode;
    const credits = courseInfo?.credits ?? courseData.credits ?? 0;

    setSelections(prev => {
      const allCourseCodes = Array.from(new Set([...prev.map(s => s.courseCode), courseCode]));
      const color = getCourseColor(courseCode, allCourseCodes);

      const classSections = decodeClassToSections(courseCode, courseName, classData, color, credits);
      if (classSections.length === 0) return prev;

      const newSelection: DraftSelection = {
        courseCode,
        courseName,
        classId,
        // A class clicked from the builder is an explicit, mandatory choice.
        locked: true,
        source: 'manual',
        preferredClassId: classId,
        classSections,
      };

      // Replace any existing suggestion or lock for this course with this hard choice.
      const existing = prev.find(s => s.courseCode === courseCode);
      if (existing) {
        return prev.map(s => s.courseCode === courseCode ? newSelection : s);
      }
      return [...prev, newSelection];
    });
  }, []);

  const removeSelection = useCallback((courseCode: string) => {
    setSelections(prev => prev.filter(s => s.courseCode !== courseCode));
  }, []);

  const clearDraft = useCallback(() => {
    setSelections([]);
  }, []);

  const importSolverResult = useCallback((
    classSections: ClassSection[],
    selectedCourseIds: Set<string>,
    allCourses: Course[]
  ) => {
    // Normalize basket hiện tại về canonical course.code
    const selectedCodes = new Set(
      Array.from(selectedCourseIds)
        .map(id =>
          allCourses.find(
            c => c.id === id || c.code === id
          )
        )
        .filter((c): c is Course => !!c)
        .map(c => c.code)
    );

    setSelections(prev => {
      // Chỉ giữ locked selection nếu môn đó
      // vẫn còn trong basket
      const locked = prev.filter(
        s =>
          s.locked &&
          selectedCodes.has(s.courseCode)
      );

      const lockedCodes = new Set(
        locked.map(s => s.courseCode)
      );

      // Group solver sections by courseCode
      const solverByCourse = new Map<string, ClassSection[]>();
      for (const section of classSections) {
        // QUAN TRỌNG:
        // Không import môn đã bị xóa khỏi basket
        if (!selectedCodes.has(section.courseCode)) {
          continue;
        }

        // Không overwrite lớp đã khóa
        if (lockedCodes.has(section.courseCode)) {
          continue;
        }

        const existing = solverByCourse.get(section.courseCode) ?? [];
        existing.push(section);
        solverByCourse.set(section.courseCode, existing);
      }

      const solverSelections: DraftSelection[] = [];
      for (const [courseCode, sections] of solverByCourse) {
        const first = sections[0];
        const classId = first.selectedClassId || first.sectionNumber;
        
        const previous = prev.find(s => s.courseCode === courseCode);
        let source: 'manual' | 'solver' = 'solver';
        let preferredClassId: string | undefined;

        if (previous?.source === 'manual' && previous.classId === classId) {
          source = 'manual';
          preferredClassId = previous.preferredClassId ?? previous.classId;
        } else if (previous?.preferredClassId || previous?.source === 'manual') {
          source = 'solver';
          preferredClassId = previous.preferredClassId ?? previous.classId;
        }

        solverSelections.push({
          courseCode,
          courseName: first.courseNameVi || first.courseName,
          classId,
          locked: false,
          source,
          preferredClassId,
          classSections: sections,
        });
      }

      return [...locked, ...solverSelections];
    });
  }, []);

  const getLockedConstraints = useCallback(() => {
    return selections
      .filter(s => s.locked)
      .map(s => ({ courseCode: s.courseCode, classId: s.classId }));
  }, [selections]);

  const getUnfilledCourses = useCallback(
    (
      selectedCourseIds: Set<string>,
      allCourses: Course[]
    ) => {
      const filledCodes = new Set(
        selections.map(s => s.courseCode)
      );

      return Array.from(selectedCourseIds)
        .map(id =>
          allCourses.find(
            c => c.id === id || c.code === id
          )
        )
        .filter((c): c is Course => !!c)
        .map(c => c.code)
        .filter(code => !filledCodes.has(code));
    },
    [selections]
  );

  const pruneSelections = useCallback(
    (
      selectedCourseIds: Set<string>,
      allCourses: Course[]
    ) => {
      // Convert selectedCourses về canonical courseCode
      const selectedCodes = new Set(
        Array.from(selectedCourseIds)
          .map(id =>
            allCourses.find(
              c => c.id === id || c.code === id
            )
          )
          .filter((c): c is Course => !!c)
          .map(c => c.code)
      );

      setSelections(prev => {
        const next = prev.filter(selection =>
          selectedCodes.has(selection.courseCode)
        );

        return next.length === prev.length ? prev : next;
      });
    },
    []
  );

  const hasAnySelection = selections.length > 0;
  const hasLockedSelections = selections.some(s => s.locked);

  return {
    selections,
    allSections,
    selectClass,
    removeSelection,
    clearDraft,
    importSolverResult,
    getLockedConstraints,
    getUnfilledCourses,
    pruneSelections,
    hasAnySelection,
    hasLockedSelections,
  };
}
