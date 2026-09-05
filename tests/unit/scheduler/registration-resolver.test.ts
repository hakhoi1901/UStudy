import { describe, expect, it } from 'vitest';

import { decodeScheduleMask } from '../../../src/logic/Utils';
import {
  computeCombinedMask,
  normalizeSemester,
  resolveRegistrations,
} from '../../../src/logic/scheduler/RegistrationResolver';

describe('RegistrationResolver', () => {
  it('normalizes semester names from Portal and application config', () => {
    expect(normalizeSemester('HK1 (2026-2027)')).toEqual({ academicYear: '2026-2027', semester: 1 });
    expect(normalizeSemester({ year: '26-27', sem: 1 })).toEqual({ academicYear: '2026-2027', semester: 1 });
  });

  it('groups registered components and separates room text from schedule tokens', () => {
    const [course] = resolveRegistrations([
      { id: 'CSC10009', name: 'Database', classGroup: '24CTT1', courseType: 'LT', schedule: 'T2(1-3) - F202', semester: 'HK1 (2026-2027)' },
      { id: 'CSC10009', name: 'Database', classGroup: '24CTT1', courseType: 'TH', schedule: 'T4(4-5) - I42', semester: 'HK1 (2026-2027)' },
      { id: 'CSC10007', name: 'Old course', courseType: 'LT', schedule: 'T3(1-2)', semester: 'HK2 (2025-2026)' },
    ], {
      currentSemester: { academicYear: '2026-2027', semester: 1 },
    });

    expect(course.courseCode).toBe('CSC10009');
    expect(course.components).toEqual([
      { courseType: 'LT', classGroup: '24CTT1', schedule: 'T2(1-3)', room: 'F202' },
      { courseType: 'TH', classGroup: '24CTT1', schedule: 'T4(4-5)', room: 'I42' },
    ]);
    expect(decodeScheduleMask(course.scheduleMask)).toEqual(expect.arrayContaining([
      { day: 0, period: 1 },
      { day: 0, period: 3 },
      { day: 2, period: 4 },
      { day: 2, period: 5 },
    ]));
  });

  it('normalizes registered course codes before grouping components', () => {
    const courses = resolveRegistrations([
      { id: ' csc10009 ', courseType: 'LT', schedule: 'T2(1-3)' },
      { id: 'CSC10009', courseType: 'TH', schedule: 'T4(4-5)' },
    ]);

    expect(courses).toHaveLength(1);
    expect(courses[0].courseCode).toBe('CSC10009');
    expect(courses[0].components).toHaveLength(2);
  });

  it('combines registered courses into a fixed busy mask for the solver', () => {
    const courses = resolveRegistrations([
      { id: 'CSC10001', courseType: 'LT', schedule: 'T2(1-2)' },
      { id: 'CSC10002', courseType: 'LT', schedule: 'T3(3-4)' },
    ]);

    const slots = decodeScheduleMask(computeCombinedMask(courses));
    expect(slots).toEqual(expect.arrayContaining([
      { day: 0, period: 1 },
      { day: 1, period: 3 },
    ]));
  });
});
