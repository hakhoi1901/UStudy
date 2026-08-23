import { describe, expect, it } from 'vitest';

import { encodeScheduleToMask } from '../../../src/logic/Utils';
import CourseDatabase from '../../../src/logic/scheduler/CourseDatabase';
import { filterCoursesAgainstRegisteredMask } from '../../../src/logic/scheduler/Scheduler';

const database = [
  {
    id: 'CSC10009',
    name: 'Database',
    classes: [
      { id: 'A', schedule: ['T2(1-2)'] },
      { id: 'B', schedule: ['T3(1-2)'] },
    ],
  },
];

describe('personal schedule solver', () => {
  it('treats Portal registrations as a hard baseline constraint', () => {
    const courseDatabase = new CourseDatabase();
    courseDatabase.loadData(database);
    const registeredMask = encodeScheduleToMask('T2(1-2)').parts;
    const course = courseDatabase.getCourse('CSC10009');
    const filtered = filterCoursesAgainstRegisteredMask([course], registeredMask);

    expect(filtered[0].classes.map((courseClass: any) => courseClass.id)).toEqual(['B']);
    expect(course.classes.map((courseClass: any) => courseClass.id)).toEqual(['A', 'B']);
  });

  it('fails clearly when every open class overlaps a registered course', () => {
    const courseDatabase = new CourseDatabase();
    courseDatabase.loadData(database);
    const registeredMask = encodeScheduleToMask(['T2(1-2)', 'T3(1-2)']).parts;

    expect(() => filterCoursesAgainstRegisteredMask(
      [courseDatabase.getCourse('CSC10009')],
      registeredMask,
    ))
      .toThrow(/CSC10009|Database/);
  });
});
