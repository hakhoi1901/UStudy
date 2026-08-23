import CourseDatabase from './CourseDatabase.js';
import GeneticSolver from './GeneticSolver.js';
import { FitnessEvaluator } from './FitnessValuator.js';
import { Bitset } from './Bitset.js';

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
    let filteredCourses = selectedCourses;

    if (registeredMask && Array.isArray(registeredMask) && registeredMask.some(v => v !== 0)) {
        const baselineMask = new Bitset();
        baselineMask.loadFromData(registeredMask);

        filteredCourses = selectedCourses.map((course: any) => ({
            ...course,
            // Shallow-clone classes array, giá»¯ nguyÃªn class objects (chÃºng lÃ  read-only trong solver)
            classes: course.classes.filter((cls: any) => {
                const clsMask: Bitset | undefined = cls.scheduleMask;
                if (!clsMask) return true; // KhÃ´ng cÃ³ mask â†’ khÃ´ng thá»ƒ kiá»ƒm tra â†’ giá»¯ láº¡i
                return !baselineMask.anyCommon(clsMask);
            }),
        }));

        // Fail-fast: Náº¿u cÃ³ mÃ´n khÃ´ng cÃ²n lá»›p nÃ o há»£p lá»‡ â†’ bÃ¡o lá»—i rÃµ rÃ ng
        const impossibleCourse = filteredCourses.find((c: any) => c.classes.length === 0);
        if (impossibleCourse) {
            throw new Error(
                `KhÃ´ng thá»ƒ xáº¿p mÃ´n "${impossibleCourse.name || impossibleCourse.id}" vÃ¬ táº¥t cáº£ cÃ¡c lá»›p má»Ÿ Ä‘á»u trÃ¹ng lá»‹ch vá»›i mÃ´n Ä‘Ã£ Ä‘Äƒng kÃ½. HÃ£y kiá»ƒm tra láº¡i lá»‹ch hoáº·c bá» mÃ´n nÃ y ra khá»i giá».`
            );
        }
    }

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

