import { describe, expect, it } from 'vitest';

import { AcademicRulesEngine } from '../../../src/features/grades/services/academic-rules-engine';

describe('AcademicRulesEngine', () => {
  it('treats an empty Portal score as an ongoing course', () => {
    expect(AcademicRulesEngine.parseRawScore('')).toBeNull();
    expect(AcademicRulesEngine.evaluateCourseStatus(null)).toBe('ongoing');
    expect(AcademicRulesEngine.getCourseStatus('CSC10009', [
      { id: 'CSC10009', score: '' },
    ], false)).toBe('studying');
  });

  it('counts only passed, non-excluded courses toward GPA and earned credits', () => {
    expect(AcademicRulesEngine.calculateAccumulationParams('CSC10009', 4, 8, 'passed')).toEqual({
      pointsForGPA: 32,
      creditsForGPA: 4,
      earnedCredits: 4,
    });
    expect(AcademicRulesEngine.calculateAccumulationParams('CSC10009', 4, 4, 'retake')).toEqual({
      pointsForGPA: 0,
      creditsForGPA: 0,
      earnedCredits: 0,
    });
    expect(AcademicRulesEngine.calculateAccumulationParams('ADD00031', 3, 9, 'passed')).toEqual({
      pointsForGPA: 0,
      creditsForGPA: 0,
      earnedCredits: 0,
    });
  });

  it('uses the improvement record as the effective course attempt', () => {
    const effective = AcademicRulesEngine.resolveEffectiveGrades([
      { id: 'CSC10009', score: '6.0', type: 'LT' },
      { id: 'CSC10009', score: '8.5', type: 'CT' },
    ]);

    expect(effective).toHaveLength(1);
    expect(effective[0]).toMatchObject({ id: 'CSC10009', score: '8.5', type: 'CT' });
  });

  it('excludes ungraded courses from cumulative GPA and credits', () => {
    const grades = [
      { id: 'CSC10001', name: 'CSC10001 - Intro', credits: '4', score: '8', semester: '25-26/2', type: 'LT' },
      { id: 'CSC10009', name: 'CSC10009 - Database', credits: '4', score: '', semester: '25-26/3', type: 'LT' },
    ];
    const summary = AcademicRulesEngine.calculateGPASummary(
      grades,
      AcademicRulesEngine.resolveEffectiveGrades(grades),
      false,
      [],
      '25-26/3',
    );

    expect(summary.currentGPA).toBe(8);
    expect(summary.accumulatedCredits).toBe(4);
    expect(summary.gradesHistory.find((course) => course.code === 'CSC10009')).toMatchObject({
      hasGrade: false,
      status: 'ongoing',
      isCurrentSemester: true,
    });
  });
});
