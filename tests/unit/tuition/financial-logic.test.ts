import { describe, expect, it } from 'vitest';

import { FinancialLogic } from '../../../src/features/tuition/services/financial-logic';

const rates = {
  default_price: 900_000,
  rates: {
    CSC: 1_000_000,
    CSC10: 1_200_000,
  },
};

const metadata = [
  { course_id: 'CSC10009', credits: 4, theory_hours: 45, lab_hours: 30, exercise_hours: 0 },
  { course_id: 'MTH00001', credits: 3, theory_hours: 45, lab_hours: 0, exercise_hours: 0 },
];

describe('FinancialLogic', () => {
  it('uses the longest matching course-code prefix', () => {
    expect(FinancialLogic.lookupPricePerCredit('CSC10009', rates)).toBe(1_200_000);
    expect(FinancialLogic.lookupPricePerCredit('CSC20001', rates)).toBe(1_000_000);
    expect(FinancialLogic.lookupPricePerCredit('MTH00001', rates)).toBe(900_000);
  });

  it('calculates billing credits from total teaching hours', () => {
    expect(FinancialLogic.calculateBillingCredits(metadata[0], 4)).toBe(5);
    expect(FinancialLogic.calculateCourseFee('CSC10009', 4, rates, metadata)).toEqual({
      pricePerCredit: 1_200_000,
      billingCredits: 5,
      courseFee: 6_000_000,
      missingMeta: false,
    });
  });

  it('deduplicates current registrations and reports their source', () => {
    const result = FinancialLogic.calculateTuitionData(
      '26-27/1',
      'Học kỳ 1, 2026-2027',
      {
        registrations: [
          { id: 'CSC10009', name: 'Database', credits: 4, courseType: 'LT', classGroup: '24CTT1' },
          { id: 'CSC10009', name: 'Database', credits: 4, courseType: 'LT', classGroup: '24CTT1' },
        ],
        grades: [],
        tuition: {},
      },
      { params: { registration: { year: '2026-2027', sem: 1 } } },
      rates,
      metadata,
    );

    expect(result.source).toBe('registration');
    expect(result.courses.filter((course) => course.courseCode === 'CSC10009')).toHaveLength(1);
    expect(result.summary.totalFee).toBeGreaterThan(0);
  });

  it('falls back to historical grades when the selected semester is not current registration', () => {
    const result = FinancialLogic.calculateTuitionData(
      '25-26/2',
      undefined,
      {
        registrations: [],
        grades: [{ id: 'MTH00001', name: 'Math', credits: 3, class: '24CTT1', semester: '25-26/2' }],
        tuition: {},
      },
      { params: { registration: { year: '2026-2027', sem: 1 } } },
      rates,
      metadata,
    );

    expect(result.source).toBe('grades');
    expect(result.summary.status).toBe('paid');
    expect(result.summary.amountDue).toBe(0);
  });
});
