import { describe, expect, it } from 'vitest';

import {
  excludeRegisteredSections,
  omitRegisteredCourseEntries,
  reconcileSelectedCourseIds,
} from '../../../src/logic/course-identity';
import type { ClassSection, Course } from '../../../src/types';

const catalog = [
  { id: 'course-csc10009', code: 'CSC10009' },
  { id: 'CSC10007', code: 'CSC10007' },
] satisfies Array<Pick<Course, 'id' | 'code'>>;

describe('course registration reconciliation', () => {
  it('removes a newly registered course from the pending selection using its canonical code', () => {
    const result = reconcileSelectedCourseIds(
      ['course-csc10009', 'CSC10007'],
      [' csc10009 '],
      catalog,
    );

    expect(Array.from(result.selectedCourseIds)).toEqual(['CSC10007']);
    expect(result.removedCourseIds).toEqual(['course-csc10009']);
  });

  it('is idempotent after the registered course has already been removed', () => {
    const first = reconcileSelectedCourseIds(['CSC10009'], ['CSC10009'], catalog);
    const second = reconcileSelectedCourseIds(first.selectedCourseIds, ['CSC10009'], catalog);

    expect(Array.from(second.selectedCourseIds)).toEqual([]);
    expect(second.removedCourseIds).toEqual([]);
  });

  it('removes only class preferences owned by registered courses', () => {
    const preferences = {
      'course-csc10009': ['24CTT1'],
      CSC10007: ['24CTT2'],
    };

    expect(omitRegisteredCourseEntries(preferences, ['CSC10009'], catalog)).toEqual({
      CSC10007: ['24CTT2'],
    });
  });

  it('drops every stale LT and TH section for a registered course', () => {
    const sections = [
      { id: 'lt', courseCode: 'csc10009' },
      { id: 'th', courseCode: 'CSC10009' },
      { id: 'other', courseCode: 'CSC10007' },
    ] as ClassSection[];

    expect(excludeRegisteredSections(sections, ['CSC10009']).map((section) => section.id)).toEqual(['other']);
  });
});
