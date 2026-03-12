/**
 * ScheduleLogic.ts
 *
 * Domain Logic: Parsing và xử lý chuỗi lịch học.
 * Không phụ thuộc React — có thể test/import độc lập.
 */

import { timePeriods } from '../constants/timetable';
import { type ScheduleSession, type WeeklySchedule } from '../types/Schedule';

// ─── Types ───────────────────────────────────────────────────────────

export interface ParsedScheduleEntry {
    /** "T2", "T3", ..., "T7", "TCN" */
    dayStr: string;
    /** Số ngày trong tuần (0=T2, 1=T3, ..., 5=T7, 6=CN) */
    dayIndex: number;
    /** Tiết bắt đầu (có thể là decimal, vd 3.5) */
    startPeriod: number;
    /** Tiết kết thúc (có thể là decimal, vd 7.5) */
    endPeriod: number;
    /** Phòng học (nếu có trong chuỗi) */
    room?: string;
    /** Phần raw string gốc */
    raw: string;
}

export type ScheduleColor = 'blue' | 'green' | 'yellow' | 'purple';

// ─── Regex ────────────────────────────────────────────────────────────

/**
 * Regex thống nhất hỗ trợ:
 * - T2(1-5), T7(6.5-10), TCN(1-3)
 * - T2(1-5) - F301: Room (optional)
 * - T3 (3.5-5.5) - Phòng TH: Room name with space (optional)
 */
const SCHEDULE_REGEX = /T(\d|CN)\s*\(([\d.]+)-([\d.]+)\)(?:\s*-\s*([^,:]+))?/g;

/**
 * Regex đơn giản chỉ match phần Tx(n-m), dùng cho dataProcessor (không cần room).
 */
const SCHEDULE_REGEX_SIMPLE = /T(\d|CN)\(([\d.]+)-([\d.]+)\)/g;

/** Regex cho parse từng phần schedule (non-global, dùng cho match đơn) */
const SCHEDULE_PART_REGEX = /T(\d|CN)\s*\(([\d.]+)-([\d.]+)\)(?:\s*-\s*([^:]+)(?::\s*(.*))?)?/;

// ─── Core Functions ─────────────────────────────────────────────────

export const ScheduleLogic = {

    /**
     * Parse chuỗi lịch học thành mảng entries chi tiết.
     * Ví dụ: "T2(1-5) - F301, T5(6-10) - E404"
     *       → [{ dayStr:"T2", dayIndex:0, startPeriod:1, endPeriod:5, room:"F301", raw:"T2(1-5)" }, ...]
     */
    parseScheduleString: (scheduleStr: string): ParsedScheduleEntry[] => {
        if (!scheduleStr) return [];

        const results: ParsedScheduleEntry[] = [];
        // Reset lastIndex cho global regex
        SCHEDULE_REGEX.lastIndex = 0;

        let match;
        while ((match = SCHEDULE_REGEX.exec(scheduleStr)) !== null) {
            const dayStr = match[1];
            const dayIndex = dayStr === 'CN' ? 6 : parseInt(dayStr) - 2;
            const startPeriod = parseFloat(match[2]);
            const endPeriod = parseFloat(match[3]);
            const room = match[4]?.trim() || undefined;

            results.push({
                dayStr: `T${dayStr}`,
                dayIndex,
                startPeriod,
                endPeriod,
                room,
                raw: `T${dayStr}(${match[2]}-${match[3]})`,
            });
        }

        return results;
    },

    /**
     * Parse đơn giản: trả về mảng các chuỗi match dạng "T2(1-5)".
     * Dùng cho dataProcessor và nơi không cần chi tiết.
     */
    parseScheduleSlots: (scheduleStr: string): string[] => {
        if (!scheduleStr) return [];
        SCHEDULE_REGEX_SIMPLE.lastIndex = 0;
        const matches = scheduleStr.match(SCHEDULE_REGEX_SIMPLE);
        return matches ?? [];
    },

    /**
     * Parse ngày dd/mm/yyyy thành Date object.
     * Trả về null nếu parse thất bại.
     */
    parseDateDMY: (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;

        const [day, month, year] = parts.map(Number);
        const d = new Date(year, month - 1, day);
        return isNaN(d.getTime()) ? null : d;
    },

    /**
     * Format Date thành chuỗi dd/mm/yyyy.
     */
    formatDateDMY: (date: Date): string => {
        const dd = date.getDate().toString().padStart(2, '0');
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    },

    // ─── Schedule Processing (từ useSchedule.ts) ─────────────────────

    /**
     * Gán màu theo mã môn học.
     * - MTH/MTT → green (Toán)
     * - BAA/ADD → yellow (thể chất, anh văn, chính trị)
     * - 3-4 chữ cái + số 1 → blue (cơ sở/chuyên ngành)
     * - Khác → purple
     */
    getColorForCourse: (courseId: string): ScheduleColor => {
        const cid = courseId.toUpperCase();
        if (cid.startsWith('MTH') || cid.startsWith('MTT')) return 'green';
        if (cid.startsWith('BAA') || cid.startsWith('ADD')) return 'yellow';
        if (/^[A-Z]{3,4}1/.test(cid)) return 'blue';
        return 'purple';
    },

    /**
     * Điều chỉnh tiết bắt đầu/kết thúc cho lớp TH/BT.
     * Lớp thực hành luôn có duration = 2.5 tiết.
     */
    adjustPeriodsForPractical: (
        courseType: string,
        startPeriod: number,
        endPeriod: number
    ): { startPeriod: number; endPeriod: number; duration: number } => {
        if (courseType !== 'TH' && courseType !== 'BT') {
            const duration = endPeriod - startPeriod + (startPeriod % 1 !== 0 ? 0.5 : 1);
            return { startPeriod, endPeriod, duration };
        }

        // Lớp thực hành/bài tập hiển thị 2 tiết
        const duration = 2;
        let adjustedStart = startPeriod;
        let adjustedEnd = startPeriod + duration - 1;

        return { startPeriod: adjustedStart, endPeriod: adjustedEnd, duration };
    },

    /**
     * Chuyển đổi tiết học (period) thành chuỗi giờ (ví dụ "07:30").
     * Hỗ trợ các tiết lẻ 3.5 và 8.5 cho lớp TH/BT.
     */
    periodToTimeString: (period: number, isStart: boolean): string => {
        // Các tiết đặc biệt cho TH/BT
        if (isStart) {
            if (period === 3.5) return '09:45';
            if (period === 8.5) return '14:55';
            const obj = timePeriods.find(p => p.period === Math.floor(period));
            return obj ? obj.time.split(' - ')[0].trim() : '00:00';
        } else {
            if (period === 2.5) return '09:35';
            if (period === 7.5) return '14:45';
            const obj = timePeriods.find(p => p.period === Math.ceil(period));
            return obj ? obj.time.split(' - ')[1].trim() : '00:00';
        }
    },

    /**
     * Giải quyết ngày bắt đầu/kết thúc cho một session.
     * Bao gồm logic kế thừa startWeek từ LT → TH/BT (+14 ngày).
     */
    resolveStartDate: (
        startWeekRaw: string | undefined,
        courseStartWeeks: Map<string, string>,
        courseId: string,
        courseType: string,
        partIdx: number,
        schedulePartsCount: number,
        totalWeeks: number
    ): {
        startDateStr: string;
        endDateStr: string;
        startDateParsed: Date | undefined;
        endDateParsed: Date | undefined;
    } => {
        let isInheritedStartWeek = false;
        let startDateStr = startWeekRaw || '';
        if (!startDateStr) {
            startDateStr = courseStartWeeks.get(courseId) || '';
            if (startDateStr) isInheritedStartWeek = true;
        }

        let endDateStr = '';
        let startDateParsed: Date | undefined = undefined;
        let endDateParsed: Date | undefined = undefined;

        if (!startDateStr) {
            return { startDateStr, endDateStr, startDateParsed, endDateParsed };
        }

        // Handle multiple dates separated by comma
        const datePartsOfStartWeek = startDateStr.split(',').map((s: string) => s.trim()).filter(Boolean);
        if (datePartsOfStartWeek.length > 0) {
            startDateStr = datePartsOfStartWeek.length === schedulePartsCount
                ? datePartsOfStartWeek[partIdx]
                : datePartsOfStartWeek[0];
        }

        const parts = startDateStr.split('/');
        if (parts.length !== 3) {
            console.warn("Invalid start date format, expected dd/mm/yyyy", startDateStr);
            return { startDateStr, endDateStr, startDateParsed, endDateParsed };
        }

        const [day, month, year] = parts.map(Number);
        const startD = new Date(year, month - 1, day);

        // Tịnh tiến thêm 2 tuần nếu TH/BT vay mượn ngày bắt đầu từ LT
        if (isInheritedStartWeek && (courseType === 'TH' || courseType === 'BT')) {
            startD.setDate(startD.getDate() + 14);
            startDateStr = ScheduleLogic.formatDateDMY(startD);
        }

        if (!isNaN(startD.getTime())) {
            startDateParsed = startD;
            const actualWeeks = totalWeeks > 0 ? totalWeeks : 15;
            const endD = new Date(startD);
            endD.setDate(endD.getDate() + (actualWeeks - 1) * 7 + 6);
            endDateParsed = endD;
            endDateStr = ScheduleLogic.formatDateDMY(endD);
        }

        return { startDateStr, endDateStr, startDateParsed, endDateParsed };
    },

    /**
     * Xây dựng toàn bộ sessions từ danh sách đăng ký + metadata khóa học.
     * Orchestrator function thay thế mega-loop trong useSchedule.ts.
     */
    buildScheduleSessions: (
        coursesRegistered: any[],
        allCoursesMeta: any[],
        metadata: any
    ): WeeklySchedule => {
        const semester = metadata?.params?.registration?.sem || '1';
        const year = metadata?.params?.registration?.year || '24-25';

        let totalCourses = 0;
        let totalCredits = 0;
        let totalPeriodsPerWeek = 0;
        let totalHoursPerWeek = 0;
        let earliestDate: Date | null = null;
        const sessions: ScheduleSession[] = [];

        // Build startWeek map: LT course → startWeek (TH/BT sẽ kế thừa)
        const courseStartWeeks = new Map<string, string>();
        coursesRegistered.forEach((c: any) => {
            if (c.startWeek && c.startWeek.trim() !== '') {
                const existing = courseStartWeeks.get(c.id) || '';
                if (c.startWeek.length > existing.length) {
                    courseStartWeeks.set(c.id, c.startWeek);
                }
            }
        });

        coursesRegistered.forEach((course: any, index: number) => {
            const meta = allCoursesMeta.find((m: any) => m.course_id === course.id);
            const credits = parseInt(meta?.credits as any) || 0;
            const theoryHours = parseInt(meta?.theory_hours as any) || 0;
            const labHours = parseInt(meta?.lab_hours as any) || 0;
            const exerciseHours = parseInt(meta?.exercise_hours as any) || 0;

            const scheduleStr = course.schedule || '';
            const scheduleParts = scheduleStr.split(',').map((s: string) => s.trim()).filter(Boolean);

            if (scheduleParts.length > 0 && course.courseType === 'LT') {
                totalCourses++;
                totalCredits += credits;
            }

            const color = ScheduleLogic.getColorForCourse(course.id);
            const cType = (course.courseType || 'LT') as 'LT' | 'TH' | 'BT';

            scheduleParts.forEach((part: string, partIdx: number) => {
                const match = part.match(SCHEDULE_PART_REGEX);
                if (!match) return;

                const dayStr = match[1];
                const dayOfWeek = (dayStr === 'CN' ? 8 : parseInt(dayStr, 10)) as ScheduleSession['dayOfWeek'];

                const rawStart = parseFloat(match[2]);
                const rawEnd = parseFloat(match[3]);
                const room = match[5];

                const adjusted = ScheduleLogic.adjustPeriodsForPractical(cType, rawStart, rawEnd);
                const startTimeStr = ScheduleLogic.periodToTimeString(adjusted.startPeriod, true);
                const endTimeStr = ScheduleLogic.periodToTimeString(adjusted.endPeriod, false);
                const sessionParams = Math.floor(adjusted.startPeriod) <= 5 ? 'morning' as const : 'afternoon' as const;

                totalPeriodsPerWeek += adjusted.duration;
                totalHoursPerWeek += adjusted.duration;

                let requiredHours = theoryHours;
                if (cType === 'TH') requiredHours = labHours;
                else if (cType === 'BT') requiredHours = exerciseHours;

                const totalWeeks = requiredHours > 0 && adjusted.duration > 0
                    ? Math.ceil(requiredHours / adjusted.duration)
                    : 0;

                const dateInfo = ScheduleLogic.resolveStartDate(
                    course.startWeek, courseStartWeeks, course.id, cType,
                    partIdx, scheduleParts.length, totalWeeks
                );

                if (dateInfo.startDateParsed && (!earliestDate || dateInfo.startDateParsed < earliestDate)) {
                    earliestDate = new Date(dateInfo.startDateParsed);
                }

                sessions.push({
                    id: `${course.id}_${index}_${partIdx}`,
                    courseCode: course.id,
                    courseName: course.name,
                    classCode: course.classGroup,
                    credits,
                    type: cType,
                    instructor: course.instructor || '',
                    room: room || '',
                    dayOfWeek,
                    startPeriod: adjusted.startPeriod,
                    endPeriod: adjusted.endPeriod,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    color,
                    session: sessionParams,
                    duration: adjusted.duration,
                    totalWeeks,
                    startDate: dateInfo.startDateStr,
                    endDate: dateInfo.endDateStr,
                    startDateParsed: dateInfo.startDateParsed,
                    endDateParsed: dateInfo.endDateParsed
                });
            });
        });

        // Sort sessions
        sessions.sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return a.startPeriod - b.startPeriod;
        });

        // Shift earliest date to Monday
        if (earliestDate !== null) {
            const ed = earliestDate as Date;
            const day = ed.getDay();
            const diff = ed.getDate() - day + (day === 0 ? -6 : 1);
            ed.setDate(diff);
            ed.setHours(0, 0, 0, 0);
            earliestDate = ed;
        }

        return {
            semester: `${semester}-${year}`,
            semesterName: `Học kỳ ${semester} Năm học ${year}`,
            weekNumber: 1,
            weekRange: 'Tuần 1',
            totalCourses,
            totalCredits,
            totalPeriodsPerWeek,
            totalHoursPerWeek,
            sessions,
            semesterStartDate: earliestDate || undefined
        };
    },
};

