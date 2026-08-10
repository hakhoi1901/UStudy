/**
 * Cau hinh han dong hoc phi.
 *
 * Format key: "yy-yy/s"
 * - "25-26/1" = hoc ky 1, nam hoc 2025-2026
 * - "25-26/2" = hoc ky 2, nam hoc 2025-2026
 * - "25-26/3" = hoc ky 3, nam hoc 2025-2026
 *
 * Format date: "YYYY-MM-DD"
 *
 * Khi nha truong thong bao han moi, chi can sua/thêm trong object nay.
 */
export const TUITION_DEADLINES_BY_SEMESTER: Record<string, string> = {
    '25-26/3': '2026-08-20',
};

function formatLocalDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Fallback khi hoc ky chua duoc set trong TUITION_DEADLINES_BY_SEMESTER.
 * Mac dinh: ngay 15 cua thang sau, giu hanh vi cu cua app.
 */
export function getDefaultTuitionDeadline(): string {
    const now = new Date();
    return formatLocalDateISO(new Date(now.getFullYear(), now.getMonth() + 1, 15));
}

export function normalizeTuitionSemesterKey(value: string | undefined | null): string {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const existingKey = raw.match(/^(\d{2}-\d{2})\/([1-3])$/);
    if (existingKey) return raw;

    const fullYearKey = raw.match(/^(\d{4})-(\d{4})\/([1-3])$/);
    if (fullYearKey) {
        return `${fullYearKey[1].slice(2)}-${fullYearKey[2].slice(2)}/${fullYearKey[3]}`;
    }

    const displayName = raw.match(/([1-3])\s*,\s*(\d{4})-(\d{4})/);
    if (displayName) {
        return `${displayName[2].slice(2)}-${displayName[3].slice(2)}/${displayName[1]}`;
    }

    return raw;
}

export function buildTuitionSemesterKey(academicYear: string, semesterNumber: number | string): string {
    const year = String(academicYear || '').trim();
    const semester = String(semesterNumber || '').trim();

    if (!year || !semester) return '';
    if (year.length === 9) return `${year.substring(2, 4)}-${year.substring(7, 9)}/${semester}`;
    return `${year}/${semester}`;
}

export function getTuitionDeadline(semester: string | undefined | null): string {
    const key = normalizeTuitionSemesterKey(semester);
    return TUITION_DEADLINES_BY_SEMESTER[key] || getDefaultTuitionDeadline();
}

export function formatTuitionDeadline(dateString: string): string {
    if (!dateString) return '-';

    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}
