import CourseDatabase from './CourseDatabase.js';
import GeneticSolver from './GeneticSolver.js';
import { FitnessEvaluator } from './FitnessValuator.js';
export function runScheduleSolver(dbData: any, userWants: any, fixedClasses: any, preferences: any) {
    const db = new CourseDatabase();
    const data = (typeof dbData === 'string') ? JSON.parse(dbData) : dbData;
    db.loadData(data);

    const selectedCourses: any[] = [];

    // --- LỌC DỮ LIỆU ---
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

    // --- CHẠY THUẬT TOÁN ---
    const valuator = new FitnessEvaluator(preferences);
    const solver = new GeneticSolver(selectedCourses, valuator);
    const rawResults = solver.solve(5);

    // --- TỔNG HỢP KẾT QUẢ ---
    // --- MAPPING VỀ FORMAT UI ---
    const mappedResults = rawResults.map((ind, index) => {
        const scheduleList: any[] = [];
        ind.genes.forEach((classIdx, courseIdx) => {
            if (classIdx !== -1) {
                const course = selectedCourses[courseIdx];
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
