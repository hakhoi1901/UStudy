import CourseDatabase from './CourseDatabase.js';
import GeneticSolver from './GeneticSolver.js';
import { FitnessEvaluator } from './FitnessValuator.js';
import { Bitset } from './Bitset.js';

/**
 * @param registeredMask Serialized baseline mask (number[]).
 *   Classes conflicting with this mask are filtered OUT before the GA runs.
 *   Invariant: solver filtering does NOT mutate the original course DB — courses are cloned.
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

    // --- LỌC BASELINE REGISTERED (HARD CONSTRAINT) ---
    // Clone courses — KHÔNG mutate course DB gốc.
    // Invariant: filteredCourses chỉ dùng trong lần solve này.
    let filteredCourses = selectedCourses;

    if (registeredMask && Array.isArray(registeredMask) && registeredMask.some(v => v !== 0)) {
        const baselineMask = new Bitset();
        baselineMask.loadFromData(registeredMask);

        filteredCourses = selectedCourses.map((course: any) => ({
            ...course,
            // Shallow-clone classes array, giữ nguyên class objects (chúng là read-only trong solver)
            classes: course.classes.filter((cls: any) => {
                const clsMask: Bitset | undefined = cls.scheduleMask;
                if (!clsMask) return true; // Không có mask → không thể kiểm tra → giữ lại
                return !baselineMask.anyCommon(clsMask);
            }),
        }));

        // Fail-fast: Nếu có môn không còn lớp nào hợp lệ → báo lỗi rõ ràng
        const impossibleCourse = filteredCourses.find((c: any) => c.classes.length === 0);
        if (impossibleCourse) {
            throw new Error(
                `Không thể xếp môn "${impossibleCourse.name || impossibleCourse.id}" vì tất cả các lớp mở đều trùng lịch với môn đã đăng ký. Hãy kiểm tra lại lịch hoặc bỏ môn này ra khỏi giỏ.`
            );
        }
    }

    // --- CHẠY THUẬT TOÁN ---
    const valuator = new FitnessEvaluator(preferences);
    const solver = new GeneticSolver(filteredCourses, valuator);
    const rawResults = solver.solve(5);

    // --- TỔNG HỢP KẾT QUẢ ---
    // --- MAPPING VỀ FORMAT UI ---
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

