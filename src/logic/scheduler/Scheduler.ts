import CourseDatabase from './CourseDatabase.js';
import GeneticSolver from './GeneticSolver.js';
import { FitnessEvaluator } from './FitnessValuator.js';
export function runScheduleSolver(dbData: any, userWants: any, fixedClasses: any, preferences: any) {
    console.group("DEBUG: Dữ liệu nhận được tại Scheduler.js");

    console.log("Danh sách môn muốn học (User Wants):", userWants);

    console.log("Danh sách lớp đã chọn (Fixed Classes):");
    console.table(fixedClasses); // In dạng bảng cho dễ nhìn
    console.log("   -> Raw object:", fixedClasses); // In raw để check kiểu dữ liệu

    console.log("Tùy chọn (Preferences):", preferences);
    console.groupEnd();

    const startTime = performance.now();

    const solverLog = {
        timestamp: new Date().toLocaleTimeString(),
        input: {
            userWants: userWants,
            fixedClasses: fixedClasses,
            preferences: preferences
        },
        process: {
            totalSubjects: 0,
            filteredSubjects: [] as any[]
        },
        result: {
            found: 0,
            bestScore: null as number | null,
            bestSolutionAnalysis: null, // Phân tích tại sao phương án tốt nhất lại có điểm đó
            executionTime: ""
        }
    };

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
            let classCountOriginal = course.classes.length;
            let classCountFiltered = classCountOriginal;

            if (allowedClasses && Array.isArray(allowedClasses) && allowedClasses.length > 0) {
                const allowedSet = new Set(allowedClasses.map((id: any) => String(id).trim()));
                const filteredClasses = course.classes.filter((c: any) => allowedSet.has(String(c.id).trim()));

                if (filteredClasses.length > 0) {
                    classCountFiltered = filteredClasses.length;
                    selectedCourses.push({ ...course, classes: filteredClasses });
                } else {
                    console.error(`❌ Lỗi: Môn ${cleanID} chọn lớp ${allowedClasses} nhưng không tìm thấy.`);
                    return [];
                }
            } else {
                selectedCourses.push(course);
            }

            // Ghi log quá trình lọc
            solverLog.process.filteredSubjects.push({
                id: cleanID,
                original: classCountOriginal,
                kept: classCountFiltered
            });

        } else {
            console.warn(`⚠️ Không tìm thấy môn [${cleanID}]`);
        }
    });

    if (selectedCourses.length === 0) return [];
    solverLog.process.totalSubjects = selectedCourses.length;

    // --- CHẠY THUẬT TOÁN ---
    const valuator = new FitnessEvaluator(preferences);
    const solver = new GeneticSolver(selectedCourses, valuator);
    const rawResults = solver.solve(5);

    // --- TỔNG HỢP KẾT QUẢ ---
    solverLog.result.found = rawResults.length;
    solverLog.result.executionTime = (performance.now() - startTime).toFixed(2) + "ms";

    if (rawResults.length > 0) {
        const bestInd = rawResults[0];
        solverLog.result.bestScore = bestInd.fitness;

        // Gọi hàm phân tích (getInsights) để xem chi tiết
        //solverLog.result.bestSolutionAnalysis = valuator.getInsights(bestInd, selectedCourses);
    }

    // 🔥🔥🔥 IN LOG RA MÀN HÌNH 🔥🔥🔥
    console.log("%c📊 BÁO CÁO XẾP LỊCH (SOLVER REPORT)", "color: #004A98; font-size: 14px; font-weight: bold;");
    console.log(solverLog);
    // Nếu muốn xem dạng bảng cho phần input
    // console.table(solverLog.process.filteredSubjects);

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