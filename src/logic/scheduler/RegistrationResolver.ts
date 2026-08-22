/**
 * RegistrationResolver.ts
 *
 * Logic thuần (không React) chuyển đổi raw registrations từ Portal
 * thành RegisteredCourse[] + combined schedule mask.
 *
 * Invariant: Output là immutable-friendly — mask serialize thành number[].
 */

import { encodeScheduleToMask } from '../Utils';
import { Bitset } from './Bitset';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RegisteredComponent {
    courseType: 'LT' | 'TH' | 'BT';
    classGroup: string;
    schedule: string;
    room?: string;
}

export interface RegisteredCourse {
    courseCode: string;
    courseName: string;
    components: RegisteredComponent[];
    /** Serialized Bitset mask — OR of all component schedules. */
    scheduleMask: number[];
    semester?: string;
}

export interface RawRegistration {
    id: string;
    name?: string;
    classGroup?: string;
    courseType?: string;   // "LT" / "TH" / "BT"
    schedule?: string;     // "T2(1-4) - F201"
    semester?: string;     // "HK1 (2026-2027)"
    [key: string]: any;
}

export interface NormalizedSemester {
    academicYear: string;  // "2026-2027"
    semester: number;      // 1, 2, or 3
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Normalize semester string từ Portal hoặc import_meta về format thống nhất.
 *
 * Chấp nhận:
 *   "HK1 (2026-2027)"
 *   "HK1 2026-2027"
 *   "Học kỳ 1 2026-2027"
 *   "2026-2027 / HK1"
 *   { sem: 1, year: "2026-2027" }
 */
export function normalizeSemester(input: unknown): NormalizedSemester | null {
    if (!input) return null;

    const standardizeYear = (yearStr: string) => {
        return yearStr.split('-').map(y => y.trim().length === 2 ? '20' + y.trim() : y.trim()).join('-');
    };

    // Object form from import_meta.params: { sem, year }
    if (typeof input === 'object' && input !== null) {
        const obj = input as Record<string, any>;
        if (obj.sem && obj.year) {
            return {
                academicYear: standardizeYear(String(obj.year)),
                semester: Number(obj.sem),
            };
        }
        // Try { semester: "HK1 (2026-2027)" }
        if (obj.semester) {
            return normalizeSemester(String(obj.semester));
        }
        return null;
    }

    const text = String(input).trim();
    if (!text) return null;

    // Pattern 1: "HK1 (2026-2027)" or "HK1 2026-2027"
    const semFirst = text.match(/(?:học\s*kỳ|hoc\s*ky|HK)\s*([1-3])\s*[(\s,/-]?\s*(\d{2,4}\s*-\s*\d{2,4})/i);
    if (semFirst) {
        return {
            academicYear: standardizeYear(semFirst[2].replace(/\s/g, '')),
            semester: parseInt(semFirst[1], 10),
        };
    }

    // Pattern 2: "2026-2027 / HK1"
    const yearFirst = text.match(/(\d{2,4}\s*-\s*\d{2,4})\s*[/,\s]\s*(?:HK\s*)?([1-3])\b/i);
    if (yearFirst) {
        return {
            academicYear: standardizeYear(yearFirst[1].replace(/\s/g, '')),
            semester: parseInt(yearFirst[2], 10),
        };
    }

    return null;
}

/**
 * So sánh 2 semester đã normalize có giống nhau không.
 */
function semesterMatch(a: NormalizedSemester | null, b: NormalizedSemester | null): boolean {
    if (!a || !b) return false;
    return a.academicYear === b.academicYear && a.semester === b.semester;
}

/**
 * Tách schedule string ra phần lịch và phần phòng.
 * "T2(1-4) - F201" → { schedule: "T2(1-4)", room: "F201" }
 * "T2(1-4)"        → { schedule: "T2(1-4)", room: undefined }
 */
function parseScheduleAndRoom(raw: string): { schedule: string; room?: string } {
    const schedulePattern = /T(?:\d|CN)\s*\([\d.]+\s*-\s*[\d.]+\)/gi;
    const scheduleParts = raw.match(schedulePattern) || [];
    const schedule = scheduleParts.join('; ');

    // Chỉ lấy phần sau dấu '-' nằm SAU dấu ')' của lịch. Không split toàn chuỗi,
    // vì dấu '-' trong T2(1-3) là khoảng tiết chứ không phải dấu ngăn phòng.
    const roomMatch = raw.match(/\)\s*-\s*([^;,]+)/);
    const candidateRoom = roomMatch?.[1]?.trim();
    const room = candidateRoom && !/^T(?:\d|CN)\s*\(/i.test(candidateRoom)
        ? candidateRoom
        : undefined;

    return { schedule, room };
}

// ── Main Resolver ──────────────────────────────────────────────────────────────

export interface ResolveOptions {
    /** Học kỳ hiện tại — chỉ lấy registrations khớp. */
    currentSemester?: NormalizedSemester | null;
    /**
     * Nếu true, khi registration thiếu semester thì coi như thuộc currentSemester.
     * Dùng khi biết chắc dataset là snapshot của kỳ hiện tại.
     */
    acceptMissingSemester?: boolean;
}

/**
 * Chuyển raw registrations → RegisteredCourse[].
 *
 * 1. Lọc semester.
 * 2. Nhóm theo courseCode.
 * 3. Tính combined schedule mask (OR).
 */
export function resolveRegistrations(
    rawRegistrations: RawRegistration[],
    options: ResolveOptions = {},
): RegisteredCourse[] {
    if (!Array.isArray(rawRegistrations) || rawRegistrations.length === 0) {
        return [];
    }

    const { currentSemester = null, acceptMissingSemester = true } = options;

    // 1. Lọc theo semester
    const filtered = rawRegistrations.filter(reg => {
        if (!currentSemester) {
            // Không biết semester hiện tại → lấy hết (fallback)
            return true;
        }
        const regSem = normalizeSemester(reg.semester);
        if (regSem) {
            return semesterMatch(regSem, currentSemester);
        }
        // Thiếu semester trên registration
        return acceptMissingSemester;
    });

    if (filtered.length === 0) return [];

    // 2. Nhóm theo courseCode (id)
    const grouped = new Map<string, {
        courseName: string;
        components: RegisteredComponent[];
        semester?: string;
    }>();

    for (const reg of filtered) {
        const code = String(reg.id || '').trim();
        if (!code) continue;

        const { schedule, room } = parseScheduleAndRoom(reg.schedule || '');

        const courseType = normalizeCourseType(reg.courseType);

        if (!grouped.has(code)) {
            grouped.set(code, {
                courseName: reg.name || code,
                components: [],
                semester: reg.semester,
            });
        }

        grouped.get(code)!.components.push({
            courseType,
            classGroup: reg.classGroup || '',
            schedule,
            room,
        });
    }

    // 3. Tính mask cho mỗi course
    const result: RegisteredCourse[] = [];

    for (const [courseCode, data] of grouped) {
        const combinedMask = new Bitset();

        for (const comp of data.components) {
            const scheduleParts = comp.schedule.split(/[;,]/).map(s => s.trim()).filter(Boolean);
            if (scheduleParts.length === 0) continue;

            const encoded = encodeScheduleToMask(scheduleParts, courseCode);
            const compMask = new Bitset();
            compMask.loadFromData(encoded.parts);
            const merged = combinedMask.or(compMask);
            // Copy merged back into combinedMask
            combinedMask.loadFromData(merged.parts);
        }

        result.push({
            courseCode,
            courseName: data.courseName,
            components: data.components,
            scheduleMask: [...combinedMask.parts], // Serialize — immutable copy
            semester: data.semester,
        });
    }

    return result;
}

/**
 * Tính combined mask từ tất cả registered courses.
 * Đây là "vùng cấm" tổng — solver dùng để filter candidates.
 */
export function computeCombinedMask(courses: RegisteredCourse[]): number[] {
    const combined = new Bitset();

    for (const course of courses) {
        const courseMask = new Bitset();
        courseMask.loadFromData(course.scheduleMask);
        const merged = combined.or(courseMask);
        combined.loadFromData(merged.parts);
    }

    return [...combined.parts]; // Serialize
}

// ── Internals ──────────────────────────────────────────────────────────────────

function normalizeCourseType(raw: string | undefined): 'LT' | 'TH' | 'BT' {
    const upper = String(raw || 'LT').trim().toUpperCase();
    if (upper === 'TH') return 'TH';
    if (upper === 'BT') return 'BT';
    return 'LT';
}
