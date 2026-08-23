import { describe, expect, it } from 'vitest';

import {
  buildProjectionSemesters,
  createGradeAttemptKey,
  normalizeProjectionSemester,
} from '../../../src/features/grades/services/semester-grade-projection';

describe('semester grade projection', () => {
  it('normalizes the supported Portal semester formats', () => {
    expect(normalizeProjectionSemester('Học kỳ 1, 2026-2027')).toBe('26-27/1');
    expect(normalizeProjectionSemester('2025-2026/3')).toBe('25-26/3');
  });

  it('keeps multiple open semesters independent and applies projections per attempt', () => {
    const currentAttempt = createGradeAttemptKey('25-26/3', 'CSC10009');
    const nextAttempt = createGradeAttemptKey('26-27/1', 'CSC10007');
    const semesters = buildProjectionSemesters({
      rawGrades: [
        { id: 'CSC10009', name: 'CSC10009 - Database', credits: '4', score: '', semester: '25-26/3' },
      ],
      registrations: [
        { id: 'CSC10007', name: 'Operating systems', credits: '4', courseType: 'LT', semester: '26-27/1' },
      ],
      gradesHistory: [],
      allCoursesMeta: [],
      projectedGrades: { [currentAttempt]: 8, [nextAttempt]: 9 },
    });

    expect(semesters.map((semester) => semester.id)).toEqual(['26-27/1', '25-26/3']);
    expect(semesters[0]).toMatchObject({ knownCredits: 4, projectedCredits: 4, semesterGPA: 9 });
    expect(semesters[1]).toMatchObject({ knownCredits: 4, projectedCredits: 4, semesterGPA: 8 });
  });

  it('prefers an official score over a projected score for the same attempt', () => {
    const attempt = createGradeAttemptKey('25-26/3', 'CSC10009');
    const [semester] = buildProjectionSemesters({
      rawGrades: [
        { id: 'CSC10009', name: 'Database', credits: '4', score: '7.5', semester: '25-26/3' },
        { id: 'CSC10010', name: 'AI', credits: '4', score: '', semester: '25-26/3' },
      ],
      registrations: [],
      gradesHistory: [],
      allCoursesMeta: [],
      projectedGrades: { [attempt]: 10 },
    });

    expect(semester.courses.find((course) => course.code === 'CSC10009')).toMatchObject({
      currentGrade: 7.5,
      projectedGrade: null,
      source: 'official',
    });
  });
});
