import { describe, expect, it } from 'vitest';

import { buildDensityMap, runGroupScheduleSolver, sanitizeGroupMember } from '../../../src/features/group-schedule/services/group-scheduler';
import type { GroupMemberToken } from '../../../src/features/group-schedule/types';
import { encodeScheduleToMask } from '../../../src/logic/Utils';

function member(overrides: Partial<GroupMemberToken> = {}): GroupMemberToken {
  return {
    nickname: 'Member',
    sharedCourses: ['CSC10009'],
    personalCourses: [],
    busyMask: Array(10).fill(0),
    ...overrides,
  };
}

const database = [
  {
    id: 'CSC10009',
    name: 'Database',
    credits: 4,
    classes: [
      { id: 'A', schedule: ['T2(1-2)'] },
      { id: 'B', schedule: ['T3(1-2)'] },
    ],
  },
];

describe('group scheduler', () => {
  it('preserves personal busy slots, class filters and preferences while sanitizing', () => {
    const busyMask = encodeScheduleToMask('T2(1-2)').parts;
    const sanitized = sanitizeGroupMember(member({
      nickname: '  Khoi  ',
      sharedCourses: ['csc10009', 'CSC10009'],
      personalCourses: ['CSC10009', 'CSC10007'],
      busyMask,
      preferredClasses: { CSC10009: { excluded: ['A'], required: ['B'] } },
      personalConfig: { session: '1', noGaps: true },
    }));

    expect(sanitized).toMatchObject({
      nickname: 'Khoi',
      sharedCourses: ['CSC10009'],
      personalCourses: ['CSC10007'],
      busyMask,
      preferredClasses: { CSC10009: { excluded: ['A'], preferred: [], required: ['B'] } },
      personalConfig: { session: '1', noGaps: true, daysOff: [] },
    });
  });

  it('defaults a shared course to one required class for all subscribers', () => {
    const density = buildDensityMap([member({ nickname: 'A' }), member({ nickname: 'B' })]);

    expect(density).toHaveLength(1);
    expect(density[0]).toMatchObject({
      courseId: 'CSC10009',
      assignmentKey: 'CSC10009',
      subscribers: [0, 1],
      sharingMode: 'required',
      isShared: true,
    });
  });

  it('never places a member into a class that overlaps their busy mask', () => {
    const busyMask = encodeScheduleToMask('T2(1-2)').parts;
    const result = runGroupScheduleSolver(database, [member({ busyMask })], {}, 5);

    expect(result.solutions.length).toBeGreaterThan(0);
    result.solutions.forEach((solution) => {
      expect(solution.schedules[0].items[0].classId).toBe('B');
    });
  });

  it('respects a member-level required class in strict solutions', () => {
    const result = runGroupScheduleSolver(database, [member({
      preferredClasses: { CSC10009: { required: ['B'] } },
    })], {}, 5);

    expect(result.solutions.length).toBeGreaterThan(0);
    expect(result.solutions[0].schedules[0].items[0].classId).toBe('B');
  });
});
