import { describe, expect, it } from 'vitest';

import { GPACalculator } from '../../../src/features/grades/services/gpa-calculator';
import type { StudentCourseGrade } from '../../../src/features/grades/types';

function grade(overrides: Partial<StudentCourseGrade>): StudentCourseGrade {
  return {
    code: 'CSC10001',
    nameVi: 'Course',
    credits: 4,
    grade: 8,
    semester: '25-26/1',
    status: 'passed',
    ...overrides,
  };
}

describe('GPACalculator', () => {
  it('replaces an earlier attempt when the same course has a projected score', () => {
    const result = GPACalculator.calculateProjectedGPA([
      grade({ code: 'CSC10001', grade: 6 }),
      grade({ code: 'CSC10002', credits: 2, grade: 8 }),
      grade({ code: 'CSC10003', status: 'ongoing', grade: 0 }),
    ], [
      { code: 'CSC10001', credits: 4, projectedGrade: 9 },
    ]);

    expect(result).toBeCloseTo((8 * 2 + 9 * 4) / 6, 8);
  });

  it('reports targets that are already achieved or impossible', () => {
    const history = [grade({ credits: 100, grade: 9 })];

    expect(GPACalculator.calculateRequiredAverageForTargetGPA(history, 7.5, 120)).toMatchObject({
      success: true,
      alreadyAchieved: true,
    });
    expect(GPACalculator.calculateRequiredAverageForTargetGPA([
      grade({ credits: 100, grade: 5 }),
    ], 9.5, 120)).toMatchObject({
      success: false,
      impossible: true,
    });
  });

  it('calculates four-point GPA from each eligible course weighted by credits', () => {
    const result = GPACalculator.calculateFourPointGPA([
      { code: 'CSC10001', credits: 4, score10: 9, status: 'passed' },
      { code: 'CSC10002', credits: 2, score10: 8, status: 'passed' },
      { code: 'CSC10003', credits: 3, score10: 10, status: 'ongoing' },
      { code: 'ADD00031', credits: 3, score10: 10, status: 'passed' },
      { code: 'CSC10004', credits: 4, score10: 4, status: 'retake' },
    ]);

    expect(result).toBeCloseTo((4 * 4 + 3.5 * 2) / 6, 8);
  });
});
