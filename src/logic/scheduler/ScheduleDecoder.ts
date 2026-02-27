import { Bitset } from './Bitset';
import type { ClassSection } from '../../types';

/**
 * Domain Core: Giải mã Bitset mask thành danh sách ClassSection.
 * Pure function, không phụ thuộc React.
 *
 * Encoding: bit = day*10 + (period-1), day: 0=T2...5=T7
 */
export function maskToSections(
    maskArr: number[],
    courseCode: string,
    courseName: string,
    classId: string,
    color: string,
    credits: number
): ClassSection[] {
    const sections: ClassSection[] = [];
    const bs = new Bitset();
    bs.loadFromData(maskArr);

    for (let d = 0; d < 6; d++) { // T2..T7
        let runStart = -1;
        let runEnd = -1;

        for (let p = 0; p < 10; p++) {
            const bit = d * 10 + p;
            const active = bs.test(bit);

            if (active) {
                if (runStart === -1) runStart = p;
                runEnd = p;
            } else {
                // Kết thúc một đoạn liên tục
                if (runStart !== -1) {
                    sections.push({
                        id: `${courseCode}-${classId}-d${d}-p${runStart}`,
                        courseCode,
                        courseName,
                        courseNameVi: courseName,
                        sectionNumber: classId,
                        lecturer: 'Chưa cập nhật',
                        room: '---',
                        day: d + 2,         // d+2: 0→T2, 1→T3, ...5→T7
                        startPeriod: runStart + 1,  // 0-indexed → 1-indexed (P1..P10)
                        endPeriod: runEnd + 1,
                        color,
                        isConfirmed: true,
                        credits,
                    });
                    runStart = -1;
                    runEnd = -1;
                }
            }
        }

        // Flush nếu đoạn chạy tới hết ngày
        if (runStart !== -1) {
            sections.push({
                id: `${courseCode}-${classId}-d${d}-p${runStart}`,
                courseCode,
                courseName,
                courseNameVi: courseName,
                sectionNumber: classId,
                lecturer: 'Chưa cập nhật',
                room: '---',
                day: d + 2,
                startPeriod: runStart + 1,
                endPeriod: runEnd + 1,
                color,
                isConfirmed: true,
                credits,
            });
        }
    }

    return sections;
}
