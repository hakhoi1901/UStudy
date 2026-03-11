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
    let pureClassId = classId;
    let groupLabels: string[] = [];

    if (classId.includes('_TH_')) {
        pureClassId = classId.split('_TH_')[0];
        const thMatch = classId.match(/_TH_([^_]+)/);
        if (thMatch) groupLabels.push(`TH: ${thMatch[1]}`);
    }
    if (classId.includes('_BT_')) {
        pureClassId = classId.split('_BT_')[0]; // since BT comes after TH, this still works or we can just split by _BT_ and take 0, wait, if classId is A_TH_1_BT_2, split(_BT_)[0] is A_TH_1 which is wrong for pureClassId
        const btMatch = classId.match(/_BT_([^_]+)/);
        if (btMatch) groupLabels.push(`BT: ${btMatch[1]}`);
    }
    
    // Correct pureClassId extraction if both exist
    if (classId.includes('_TH_') || classId.includes('_BT_')) {
        pureClassId = classId.split('_TH_')[0].split('_BT_')[0];
    } else if (classId.includes('_')) {
        // Legacy support
        const parts = classId.split('_');
        pureClassId = parts[0];
        groupLabels.push(`Nhóm ${parts[1]}`);
    }

    const thGroupText = groupLabels.length > 0 ? ` (${groupLabels.join(', ')})` : '';

    const sections: ClassSection[] = [];
    const bs = new Bitset();
    bs.loadFromData(maskArr);

    for (let d = 0; d < 6; d++) { // T2..T7
        let runStart = -1;
        let runEnd = -1;
        let runPhase = 0; // 0: None, 1: Phase 1, 2: Phase 2, 3: Full

        for (let p = 0; p < 10; p++) {
            const bitP1 = d * 10 + p;
            const bitP2 = 70 + d * 10 + p;
            const hasP1 = bs.test(bitP1);
            const hasP2 = bs.test(bitP2);
            
            const active = hasP1 || hasP2;
            const currentPhase = (hasP1 && hasP2) ? 3 : (hasP1 ? 1 : (hasP2 ? 2 : 0));

            if (active) {
                if (runStart === -1) {
                    runStart = p;
                    runPhase = currentPhase;
                } else if (currentPhase !== runPhase || p === 5) { 
                    const viName = courseName + 
                                   thGroupText + 
                                   (runPhase === 1 ? ' (Gđ 1)' : (runPhase === 2 ? ' (Gđ 2)' : ''));
                    
                    sections.push({
                        id: `${courseCode}-${classId}-d${d}-p${runStart}`,
                        courseCode,
                        courseName,
                        courseNameVi: viName,
                        sectionNumber: pureClassId,
                        lecturer: 'Chưa cập nhật',
                        room: '---',
                        day: d + 2,
                        startPeriod: runStart + 1,
                        endPeriod: runEnd + 1,
                        color,
                        isConfirmed: true,
                        credits,
                    });
                    runStart = p;
                    runPhase = currentPhase;
                }
                runEnd = p;
            } else {
                // Kết thúc một đoạn liên tục
                if (runStart !== -1) {
                    const viName = courseName + 
                                   thGroupText + 
                                   (runPhase === 1 ? ' (Gđ 1)' : (runPhase === 2 ? ' (Gđ 2)' : ''));
                                   
                    sections.push({
                        id: `${courseCode}-${classId}-d${d}-p${runStart}`,
                        courseCode,
                        courseName,
                        courseNameVi: viName,
                        sectionNumber: pureClassId,
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
                    runPhase = 0;
                }
            }
        }

        // Flush nếu đoạn chạy tới hết ngày
        if (runStart !== -1) {
            sections.push({
                id: `${courseCode}-${classId}-d${d}-p${runStart}`,
                courseCode,
                courseName,
                courseNameVi: courseName + thGroupText + (runPhase === 1 ? ' (Gđ 1)' : (runPhase === 2 ? ' (Gđ 2)' : '')),
                sectionNumber: pureClassId,
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
