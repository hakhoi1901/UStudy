/**
 * dataProcessor.ts
 * 
 * Chuyển đổi raw data từ Bookmarklet (nguyên vẹn HTML) thành format
 * mà code hiện tại (useStudentGradeData, useCourseData) đang sử dụng.
 * 
 * Bookmarklet gửi: { raw, meta }
 * App cần lưu: student_db_full (processed) + course_db_offline (processed)
 */

import { ScheduleLogic } from './ScheduleLogic';

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

interface RawSubClass {
    MaLopMoTH?: string;
    MaLopMoBT?: string;
    MaLopMoID?: string;
    Nhom?: string;
    SiSo?: string;
    DaDK?: string;
    MaDiaDiem?: string;
    DiaDiem?: string;
    LichHoc?: string;
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
    practicalGroupRaw: string;
    exerciseGroupRaw: string;
    location: string;
    practicalClasses: RawSubClass[];
    exerciseClasses: RawSubClass[];
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
 * Xử lý lớp mở: group by courseId → build courseMap với classes + parsed schedule
 */
function processOpenClasses(rawClasses: RawOpenClass[]) {
    const courseMap: Record<string, {
        id: string;
        name: string;
        credits: number;
        classes: { id: string; schedule: string[] }[];
    }> = {};

    // Group rows by SubjectID -> ClassID
    // To handle edge cases where the university splits a single class LT into multiple rows
    const groupedData: Record<string, Record<string, { 
        lt: string[], 
        th: Record<string, string[]>, 
        bt: Record<string, string[]> 
    }>> = {};

    for (const row of rawClasses) {
        const subjID = row.id;
        if (!subjID) continue;

        if (!groupedData[subjID]) {
            groupedData[subjID] = {};
            courseMap[subjID] = {
                id: subjID,
                name: row.name,
                credits: parseInt(row.credits) || 0,
                classes: []
            };
        }

        const classID = row.className;
        if (!groupedData[subjID][classID]) {
            groupedData[subjID][classID] = { lt: [], th: {}, bt: {} };
        }

        const parsedSchedule = ScheduleLogic.parseScheduleSlots(row.schedule);
        if (parsedSchedule.length > 0) {
            groupedData[subjID][classID].lt.push(...parsedSchedule);
        }

        // Add practical classes (TH)
        if (Array.isArray(row.practicalClasses)) {
            for (const th of row.practicalClasses) {
                const thSched = ScheduleLogic.parseScheduleSlots(th.LichHoc || "");
                const thNhom = th.Nhom || "Unknown";
                if (!groupedData[subjID][classID].th[thNhom]) {
                    groupedData[subjID][classID].th[thNhom] = [];
                }
                groupedData[subjID][classID].th[thNhom].push(...thSched);
            }
        }

        // Add exercise classes (BT)
        if (Array.isArray(row.exerciseClasses)) {
            for (const bt of row.exerciseClasses) {
                const btSched = ScheduleLogic.parseScheduleSlots(bt.LichHoc || "");
                const btNhom = bt.Nhom || "Unknown";
                if (!groupedData[subjID][classID].bt[btNhom]) {
                    groupedData[subjID][classID].bt[btNhom] = [];
                }
                groupedData[subjID][classID].bt[btNhom].push(...btSched);
            }
        }
    }

    // Cross-join lấy tổ hợp hợp lệ
    for (const subjID in groupedData) {
        for (const classID in groupedData[subjID]) {
            const classData = groupedData[subjID][classID];
            
            // Lọc unique các ca LT
            const combinedLTSchedule = [...new Set(classData.lt)];

            const thGroups = Object.entries(classData.th);
            const btGroups = Object.entries(classData.bt);

            // Dummy values để map cross-join nếu không có mảng con
            const thMultiplier = thGroups.length > 0 ? thGroups : [["", []] as [string, string[]]];
            const btMultiplier = btGroups.length > 0 ? btGroups : [["", []] as [string, string[]]];

            for (const [thNhom, thSched] of thMultiplier) {
                for (const [btNhom, btSched] of btMultiplier) {
                    
                    const combinedSchedule = [...new Set([
                        ...combinedLTSchedule, 
                        ...thSched, 
                        ...btSched
                    ])];
                    
                    if (combinedSchedule.length > 0) {
                        let newClassID = classID;
                        if (thNhom) {
                            newClassID += `_TH_${thNhom.replace(/\s+/g, '')}`;
                        }
                        if (btNhom) {
                            newClassID += `_BT_${btNhom.replace(/\s+/g, '')}`;
                        }

                        // Không được thêm trùng id (hãn hữu xảy ra)
                        const exists = courseMap[subjID].classes.find(c => c.id === newClassID);
                        if (!exists) {
                            courseMap[subjID].classes.push({
                                id: newClassID,
                                schedule: combinedSchedule
                            });
                        } else {
                            exists.schedule = [...new Set([...exists.schedule, ...combinedSchedule])];
                        }
                    }
                }
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
