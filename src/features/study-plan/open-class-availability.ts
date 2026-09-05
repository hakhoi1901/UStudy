import { openClassSemesters } from '../../assets/data/academic-programs/khoa-cntt/cong-nghe-thong-tin/open-class';
import type { CourseOpenClassAvailability } from './types';

const OPEN_CLASS_FACULTY_ID = 'khoa-cntt';
const EMPTY_AVAILABILITY: readonly CourseOpenClassAvailability[] = [];
const availabilityByCourse = new Map<string, CourseOpenClassAvailability[]>();

openClassSemesters.forEach((semester) => {
    semester['open-class'].forEach((course) => {
        const years = [...new Set(course['open-for'].filter(Number.isInteger))].sort((first, second) => first - second);
        const availability = availabilityByCourse.get(course.course_code) || [];
        availability.push({ semester: semester.semester, years });
        availabilityByCourse.set(course.course_code, availability);
    });
});

/**
 * Returns the scheduled opening semesters for a course. Programs without a
 * matching source intentionally return an empty list so the planner stays quiet.
 */
export function getCourseOpenClassAvailability(
    facultyId: string,
    courseId: string,
): readonly CourseOpenClassAvailability[] {
    if (facultyId !== OPEN_CLASS_FACULTY_ID) {
        return EMPTY_AVAILABILITY;
    }

    return availabilityByCourse.get(courseId) ?? EMPTY_AVAILABILITY;
}
