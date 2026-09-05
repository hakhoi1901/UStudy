import { describe, expect, it } from 'vitest';

import { mergeHistoricalStudyPlan } from '../../../src/features/study-plan/semester-utils';
import type { StudyPlanStorage } from '../../../src/features/study-plan/types';

describe('study plan registration reconciliation', () => {
  it('removes a registered course from an editable semester regardless of code casing', () => {
    const previous: StudyPlanStorage = {
      semesters: [{ id: 'future', label: 'HK2 (2026-2027)' }],
      plan: { future: [' csc10009 ', 'CSC10007'] },
    };
    const scaffold: StudyPlanStorage['semesters'] = [
      { id: 'future', label: 'HK2 (2026-2027)' },
    ];
    const historical: StudyPlanStorage = {
      semesters: [{ id: 'current', label: 'HK1 (2026-2027)', isHistorical: true, isCurrent: true }],
      plan: { current: ['CSC10009'] },
    };

    const result = mergeHistoricalStudyPlan(previous, scaffold, historical);

    expect(result.plan.current).toEqual(['CSC10009']);
    expect(result.plan.future).toEqual(['CSC10007']);
  });
});
