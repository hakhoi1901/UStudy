import CourseDatabase from './CourseDatabase.js';
import GeneticSolver from './GeneticSolver.js';
import { FitnessEvaluator } from './FitnessValuator.js';
import { Bitset } from './Bitset.js';

export function filterCoursesAgainstRegisteredMask(selectedCourses: any[], registeredMask?: number[]) {
    if (!registeredMask || !registeredMask.some((value) => value !== 0)) return selectedCourses;

    const baselineMask = new Bitset();
    baselineMask.loadFromData(registeredMask);
    const filteredCourses = selectedCourses.map((course: any) => ({
        ...course,
        classes: course.classes.filter((courseClass: any) => {
            const classMask: Bitset | undefined = courseClass.scheduleMask;
            return !classMask || !baselineMask.anyCommon(classMask);
        }),
    }));

    const impossibleCourse = filteredCourses.find((course: any) => course.classes.length === 0);
    if (impossibleCourse) {
        throw new Error(
            `Không thể xếp môn "${impossibleCourse.name || impossibleCourse.id}" vì tất cả các lớp mở đều trùng lịch với môn đã đăng ký.`,
        );
    }

    return filteredCourses;
}

/**
 * @param registeredMask Serialized baseline mask (number[]).
 *   Classes conflicting with this mask are filtered OUT before the GA runs.
 *   Invariant: solver filtering does NOT mutate the original course DB â€” courses are cloned.
 */
export function runScheduleSolver(
    dbData: any,
    userWants: any,
    fixedClasses: any,
    preferences: any,
    registeredMask?: number[],
) {
    const db = new CourseDatabase();
    const data = (typeof dbData === 'string') ? JSON.parse(dbData) : dbData;
    db.loadData(data);

    const selectedCourses: any[] = [];

    // --- Lá»ŒC Dá»® LIá»†U ---
    userWants.forEach((subjID: any) => {
        const cleanID = String(subjID).trim();
        const course = db.getCourse(cleanID);

        if (course) {
            let allowedClasses = fixedClasses[cleanID];

            if (allowedClasses && Array.isArray(allowedClasses) && allowedClasses.length > 0) {
                const allowedSet = new Set(allowedClasses.map((id: any) => String(id).trim()));
                const filteredClasses = course.classes.filter((c: any) => allowedSet.has(String(c.id).trim()));

                if (filteredClasses.length > 0) {
                    selectedCourses.push({ ...course, classes: filteredClasses });
                } else {
                    return [];
                }
            } else {
                selectedCourses.push(course);
            }

        }
    });

    if (selectedCourses.length === 0) return [];

    // --- Lá»ŒC BASELINE REGISTERED (HARD CONSTRAINT) ---
    // Clone courses â€” KHÃ”NG mutate course DB gá»‘c.
    // Invariant: filteredCourses chá»‰ dÃ¹ng trong láº§n solve nÃ y.
    const filteredCourses = filterCoursesAgainstRegisteredMask(selectedCourses, registeredMask);

    // --- CHáº Y THUáº¬T TOÃN ---
    const valuator = new FitnessEvaluator(preferences);
    const solver = new GeneticSolver(filteredCourses, valuator);
    const rawResults = solver.solve(50);

    // --- Tá»”NG Há»¢P Káº¾T QUáº¢ ---
    // --- MAPPING Vá»€ FORMAT UI ---
    const mappedResults = rawResults.map((ind, index) => {
        const scheduleList: any[] = [];
        ind.genes.forEach((classIdx, courseIdx) => {
            if (classIdx !== -1) {
                const course = filteredCourses[courseIdx];
                const classObj = course.classes[classIdx];
                if (!classObj) return;

                let visualMask = classObj.mask;
                if (!visualMask && classObj.scheduleMask) {
                    visualMask = classObj.scheduleMask.parts;
                }

                scheduleList.push({
                    subjectID: course.id,
                    classID: classObj.id,
                    mask: visualMask || [0, 0, 0, 0],
                    schedule: classObj.schedule
                });
            }
        });

        return {
            option: index + 1,
            fitness: ind.fitness,
            schedule: scheduleList
        };
    });

    return mappedResults;
}

