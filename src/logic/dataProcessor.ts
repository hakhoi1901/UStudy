/**
 * dataProcessor.ts
 * 
 * Chuyển đổi raw data từ Bookmarklet (nguyên vẹn HTML) thành format
 * mà code hiện tại (useStudentGradeData, useCourseData) đang sử dụng.
 * 
 * Bookmarklet gửi: { raw, meta }
 * App cần lưu: student_db_full (processed) + course_db_offline (processed)
 */

// === TYPES ===

interface RawGrade {
    semester: string;
    id: string;
    name: string;
    credits: string;
    class: string;
    type: string;
    score: string;
    notes: string;
}

interface RawExamEntry {
    stt: string;
    id: string;
    name: string;
    group: string;
    date: string;
    time: string;
    room: string;
    place: string;
    notes: string;
    type: string;
}

interface RawTuitionDetail {
    stt: string;
    semester: string;
    subject: string;
    credits: string;
    periods: string;
    tuitionCredits: string;
    originalFee: string;
    discount: string;
    support: string;
    fee: string;
    cost: string;
    notes: string;
}

interface RawOpenClass {
    id: string;
    name: string;
    className: string;
    credits: string;
    capacity: string;
    enrolled: string;
    cohort: string;
    schedule: string;
    practicalGroup: string;
    exerciseGroup: string;
    location: string;
}

interface RawRegistration {
    id: string;
    name: string;
    classGroup: string;
    regType: string;
    courseType: string;
    schedule: string;
    startWeek: string;
}

interface RawData {
    name: string;
    grades: RawGrade[];
    exams: {
        midterm: RawExamEntry[];
        final: RawExamEntry[];
    };
    tuition: {
        details: RawTuitionDetail[];
        totals: {
            credits: string;
            periods: string;
            tuitionCredits: string;
            fee: string;
            actualFee: string;
            totalDue: string;
        };
        updatedDate: string;
        year: string;
        sem: string;
    };
    registrations: RawRegistration[];
    courses: RawOpenClass[];
}

// === PROCESSORS ===

/**
 * Xử lý điểm: parse score thành number
 */
function processGrades(rawGrades: RawGrade[]) {
    return rawGrades.map(g => {
        const rawScore = g.score;
        const score = !isNaN(parseFloat(rawScore)) ? parseFloat(rawScore) : rawScore;
        return {
            semester: g.semester,
            id: g.id,
            name: g.name,
            credits: g.credits,
            class: g.class,
            type: g.type,
            score,
            notes: g.notes
        };
    });
}

/**
 * Xử lý học phí: parse code/name từ subject raw string
 */
function processTuition(rawTuition: RawData['tuition']) {
    const details = rawTuition.details.map(d => {
        // Parse "[CODE/CLASS]Name" format
        const codeMatch = d.subject.match(/\[(.*?)\]/);
        const code = codeMatch ? codeMatch[1] : "";
        const name = d.subject.replace(/\[.*?\]/g, '').trim();

        return {
            code,
            name,
            credits: d.credits,
            fee: d.fee
        };
    });

    return {
        total: rawTuition.totals.totalDue || "0",
        details,
        year: rawTuition.year,
        sem: rawTuition.sem
    };
}

/**
 * Parse lịch học string thành mảng schedule entries (vd: "T2(6-9)")
 */
function parseScheduleString(str: string): string[] {
    if (!str) return [];
    const regex = /T(\d|CN)\((\d+(\.\d+)?)-(\d+(\.\d+)?)\)/g;
    const matches = str.match(regex);
    return matches ? matches : [];
}

/**
 * Xử lý lớp mở: group by courseId → build courseMap với classes + parsed schedule
 */
function processOpenClasses(rawClasses: RawOpenClass[]) {
    const courseMap: Record<string, {
        id: string;
        name: string;
        credits: number;
        classes: { id: string; schedule: string[] }[];
    }> = {};

    for (const row of rawClasses) {
        const subjID = row.id;
        if (!subjID) continue;

        if (!courseMap[subjID]) {
            courseMap[subjID] = {
                id: subjID,
                name: row.name,
                credits: parseInt(row.credits) || 0,
                classes: []
            };
        }

        const ltSchedule = parseScheduleString(row.schedule);
        const ltClassID = row.className;

        const exists = courseMap[subjID].classes.find(c => c.id === ltClassID);
        if (!exists) {
            courseMap[subjID].classes.push({ id: ltClassID, schedule: ltSchedule });
        } else {
            if (ltSchedule.length > 0) {
                exists.schedule = [...new Set([...exists.schedule, ...ltSchedule])];
            }
        }
    }

    return Object.values(courseMap);
}

/**
 * Hàm chính: chuyển đổi raw data từ Bookmarklet thành format cũ 
 * cho student_db_full và course_db_offline
 */
export function processRawData(rawData: RawData) {
    // Xử lý grades
    const processedGrades = processGrades(rawData.grades);

    // Xử lý tuition
    const processedTuition = processTuition(rawData.tuition);

    // Xử lý open classes
    const processedCourses = processOpenClasses(rawData.courses);

    // Build student payload (format cũ cho student_db_full)
    const studentPayload = {
        name: rawData.name,
        grades: processedGrades,
        exams: rawData.exams,  // Exams giữ nguyên format (đã có đủ fields)
        tuition: processedTuition,
        registrations: rawData.registrations,  // Registrations giữ nguyên
        program: []
    };

    return {
        student: studentPayload,
        courses: processedCourses
    };
}
