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
    [key: string]: unknown;
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
    [key: string]: unknown;
}

interface RawRegistration {
    id: string;
    name: string;
    classGroup: string;
    regType: string;
    courseType: string;
    schedule: string;
    startWeek: string;
    semester?: string;
}

interface RawData {
    name: string;
    grades: RawGrade[];
    exams: {
        midterm: RawExamEntry[];
        final: RawExamEntry[];
    };
    tuition: Record<string, {
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
    }>;
    registrations: RawRegistration[];
    courses: RawOpenClass[];
    [key: string]: unknown;
}

interface EnrollmentSnapshot {
    capacity: number | null;
    enrolled: number | null;
    remaining: number | null;
    rawCapacity: string;
    rawEnrolled: string;
}

interface ProcessedClassComponent {
    group: string;
    schedule: string[];
    rawSchedules: string[];
    locations: string[];
    enrollment: EnrollmentSnapshot;
}

interface ProcessedOpenClass {
    id: string;
    schedule: string[];
    components: {
        theory: ProcessedClassComponent;
        practical: ProcessedClassComponent | null;
        exercise: ProcessedClassComponent | null;
    };
    enrollment: {
        theory: EnrollmentSnapshot;
        practical: EnrollmentSnapshot | null;
        exercise: EnrollmentSnapshot | null;
    };
}

interface GroupedSubClass {
    schedule: string[];
    records: RawSubClass[];
}

interface GroupedOpenClass {
    theorySchedule: string[];
    theoryRows: RawOpenClass[];
    practical: Record<string, GroupedSubClass>;
    exercise: Record<string, GroupedSubClass>;
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
/**
 * Xử lý học phí: parse map các học kỳ
 */
function processTuition(rawTuitionMap: RawData['tuition']) {
    if (!rawTuitionMap) return {};

    const processedMap: Record<string, any> = {};

    for (const [period, rawTuition] of Object.entries(rawTuitionMap)) {
        const details = rawTuition.details.map(d => {
            // Parse "[CODE/CLASS]Name" format
            const codeMatch = d.subject.match(/\[(.*?)\]/);
            const code = codeMatch ? codeMatch[1]?.split('/')[0] : ""; // Lấy mã môn, bỏ lớp
            const name = d.subject.replace(/\[.*?\]/g, '').trim();

            return {
                code,
                name,
                credits: parseFloat(d.credits) || 0,
                fee: parseFloat(d.fee?.replace(/,/g, '')) || 0,
                actualFee: parseFloat(d.cost?.replace(/,/g, '')) || 0,
                periods: parseFloat(d.periods) || 0,
                tuitionCredits: parseFloat(d.tuitionCredits) || 0,
                classId: codeMatch ? codeMatch[1]?.split('/')[1] : ""
            };
        });

        processedMap[period] = {
            total: rawTuition.totals.totalDue || "0",
            fee: rawTuition.totals.fee || "0",
            actualFee: rawTuition.totals.actualFee || "0",
            details,
            year: rawTuition.year,
            sem: rawTuition.sem,
            updatedDate: rawTuition.updatedDate
        };
    }

    return processedMap;
}

function uniqueStrings(values: unknown[]): string[] {
    return [...new Set(values.map(value => String(value ?? '').trim()).filter(Boolean))];
}

function parsePortalCount(value: unknown): number | null {
    const match = String(value ?? '').match(/-?\d+/);
    if (!match) return null;
    const parsed = Number.parseInt(match[0], 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function buildEnrollment(capacityValue: unknown, enrolledValue: unknown): EnrollmentSnapshot {
    const rawCapacity = String(capacityValue ?? '').trim();
    const rawEnrolled = String(enrolledValue ?? '').trim();
    const capacity = parsePortalCount(rawCapacity);
    const enrolled = parsePortalCount(rawEnrolled);
    return {
        capacity,
        enrolled,
        remaining: capacity !== null && enrolled !== null ? Math.max(0, capacity - enrolled) : null,
        rawCapacity,
        rawEnrolled,
    };
}

function firstNonEmpty(values: unknown[]): string {
    return values.map(value => String(value ?? '').trim()).find(Boolean) ?? '';
}

function buildTheoryComponent(classID: string, rows: RawOpenClass[], schedule: string[]): ProcessedClassComponent {
    return {
        group: classID,
        schedule,
        rawSchedules: uniqueStrings(rows.map(row => row.schedule)),
        locations: uniqueStrings(rows.map(row => row.location)),
        enrollment: buildEnrollment(
            firstNonEmpty(rows.map(row => row.capacity)),
            firstNonEmpty(rows.map(row => row.enrolled)),
        ),
    };
}

function buildSubClassComponent(group: string, data: GroupedSubClass): ProcessedClassComponent {
    return {
        group,
        schedule: uniqueStrings(data.schedule),
        rawSchedules: uniqueStrings(data.records.map(record => record.LichHoc)),
        locations: uniqueStrings(data.records.flatMap(record => [record.DiaDiem, record.MaDiaDiem])),
        enrollment: buildEnrollment(
            firstNonEmpty(data.records.map(record => record.SiSo)),
            firstNonEmpty(data.records.map(record => record.DaDK)),
        ),
    };
}

/**
 * Keep the complete Portal rows while deriving a scheduler-friendly class list.
 */
function processOpenClasses(rawClasses: RawOpenClass[] = []) {
    const courseMap: Record<string, {
        id: string;
        name: string;
        credits: number;
        classes: ProcessedOpenClass[];
        source: { portalRows: RawOpenClass[] };
    }> = {};
    const groupedData: Record<string, Record<string, GroupedOpenClass>> = {};

    for (const row of rawClasses) {
        const subjID = String(row?.id ?? '').trim();
        if (!subjID) continue;

        if (!groupedData[subjID]) {
            groupedData[subjID] = {};
            courseMap[subjID] = {
                id: subjID,
                name: row.name,
                credits: Number.parseFloat(row.credits) || 0,
                classes: [],
                source: { portalRows: [] },
            };
        }
        courseMap[subjID].source.portalRows.push(row);

        const classID = String(row.className ?? '').trim() || 'Unknown';
        groupedData[subjID][classID] ??= {
            theorySchedule: [],
            theoryRows: [],
            practical: {},
            exercise: {},
        };

        const classData = groupedData[subjID][classID];
        classData.theoryRows.push(row);
        classData.theorySchedule.push(...ScheduleLogic.parseScheduleSlots(row.schedule || ''));

        for (const practical of Array.isArray(row.practicalClasses) ? row.practicalClasses : []) {
            const group = String(practical.Nhom ?? '').trim() || 'Unknown';
            classData.practical[group] ??= { schedule: [], records: [] };
            classData.practical[group].schedule.push(...ScheduleLogic.parseScheduleSlots(practical.LichHoc || ''));
            classData.practical[group].records.push(practical);
        }

        for (const exercise of Array.isArray(row.exerciseClasses) ? row.exerciseClasses : []) {
            const group = String(exercise.Nhom ?? '').trim() || 'Unknown';
            classData.exercise[group] ??= { schedule: [], records: [] };
            classData.exercise[group].schedule.push(...ScheduleLogic.parseScheduleSlots(exercise.LichHoc || ''));
            classData.exercise[group].records.push(exercise);
        }
    }

    for (const subjID of Object.keys(groupedData)) {
        for (const [classID, classData] of Object.entries(groupedData[subjID])) {
            const theory = buildTheoryComponent(classID, classData.theoryRows, uniqueStrings(classData.theorySchedule));
            const practicalGroups = Object.entries(classData.practical);
            const exerciseGroups = Object.entries(classData.exercise);
            const practicalChoices: Array<[string, GroupedSubClass | null]> = practicalGroups.length > 0 ? practicalGroups : [['', null]];
            const exerciseChoices: Array<[string, GroupedSubClass | null]> = exerciseGroups.length > 0 ? exerciseGroups : [['', null]];

            for (const [practicalGroup, practicalData] of practicalChoices) {
                for (const [exerciseGroup, exerciseData] of exerciseChoices) {
                    const practical = practicalData ? buildSubClassComponent(practicalGroup, practicalData) : null;
                    const exercise = exerciseData ? buildSubClassComponent(exerciseGroup, exerciseData) : null;
                    const combinedSchedule = uniqueStrings([
                        ...theory.schedule,
                        ...(practical?.schedule ?? []),
                        ...(exercise?.schedule ?? []),
                    ]);
                    if (combinedSchedule.length === 0) continue;

                    let classOptionID = classID;
                    if (practicalGroup) classOptionID += `_TH_${practicalGroup.replace(/\s+/g, '')}`;
                    if (exerciseGroup) classOptionID += `_BT_${exerciseGroup.replace(/\s+/g, '')}`;

                    const existing = courseMap[subjID].classes.find(option => option.id === classOptionID);
                    if (existing) {
                        existing.schedule = uniqueStrings([...existing.schedule, ...combinedSchedule]);
                        continue;
                    }

                    courseMap[subjID].classes.push({
                        id: classOptionID,
                        schedule: combinedSchedule,
                        components: { theory, practical, exercise },
                        enrollment: {
                            theory: theory.enrollment,
                            practical: practical?.enrollment ?? null,
                            exercise: exercise?.enrollment ?? null,
                        },
                    });
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
    const processedGrades = processGrades(Array.isArray(rawData.grades) ? rawData.grades : []);

    // Xử lý tuition
    const processedTuition = processTuition(rawData.tuition || {});

    // Xử lý open classes
    const processedCourses = processOpenClasses(Array.isArray(rawData.courses) ? rawData.courses : []);

    const knownFields = new Set(['name', 'grades', 'exams', 'tuition', 'registrations', 'courses']);
    const additionalPortalFields = Object.fromEntries(
        Object.entries(rawData).filter(([key]) => !knownFields.has(key)),
    );

    // Build student payload (format cũ cho student_db_full)
    const studentPayload = {
        name: rawData.name,
        grades: processedGrades,
        exams: rawData.exams || {},  // Exams giữ nguyên format (đã có đủ fields)
        tuition: processedTuition,
        registrations: Array.isArray(rawData.registrations) ? rawData.registrations : [],  // Registrations giữ nguyên
        program: [],
        source: {
            additionalPortalFields,
        },
    };

    return {
        student: studentPayload,
        courses: processedCourses
    };
}
