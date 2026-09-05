import { describe, expect, it } from 'vitest';

import { buildDensityMap, isDuplicateMember, runGroupScheduleSolver, sanitizeGroupMember } from '../../../src/features/group-schedule/services/group-scheduler';
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

  it('allows different members to register the exact same courses', () => {
    const existing = member({ id: 'member-khoa', nickname: 'Khoa' });
    const sameCoursesDifferentPerson = member({ id: 'member-khoi', nickname: 'Khôi' });

    expect(isDuplicateMember(sameCoursesDifferentPerson, [existing])).toBe(false);
    expect(isDuplicateMember(member({ id: 'member-khoa', nickname: 'Khoa' }), [existing])).toBe(true);
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

  it('ranks across the search budget instead of stopping at the first solutions', () => {
    const fillerClasses = Array.from({ length: 50 }, (_, index) => ({
      id: `F${String(index + 1).padStart(2, '0')}`,
      schedule: ['T3(1-2)'],
    }));
    const rankingDatabase = [
      {
        id: 'CSC10009',
        name: 'Database',
        credits: 4,
        classes: [
          { id: 'AFTERNOON', schedule: ['T2(7-8)'] },
          { id: 'MORNING', schedule: ['T2(1-2)'] },
        ],
      },
      {
        id: 'CSC10010',
        name: 'Second course',
        credits: 4,
        classes: fillerClasses,
      },
    ];
    const members = [
      member({ nickname: 'A', sharedCourses: ['CSC10009', 'CSC10010'] }),
      member({ nickname: 'B', sharedCourses: ['CSC10009', 'CSC10010'] }),
    ];

    const unrestricted = runGroupScheduleSolver(rankingDatabase, members, { session: '1' }, 50);
    const withoutAfternoon = runGroupScheduleSolver(rankingDatabase, members, {
      session: '1',
      groupPreferredClasses: { CSC10009: { excluded: ['AFTERNOON'] } },
    }, 50);

    const unrestrictedClass = unrestricted.solutions[0].schedules[0].items
      .find((item) => item.courseId === 'CSC10009')?.classId;
    expect(unrestrictedClass).toBe('MORNING');
    expect(unrestricted.solutions[0].fitness).toBe(withoutAfternoon.solutions[0].fitness);
  });
});
