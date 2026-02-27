import type { ClassSection } from '../types';

/**
 * Domain Service: Kiểm tra xung đột thời khoá biểu (Pure Function)
 * Không phụ thuộc React, có thể test/import độc lập.
 */

/**
 * Tìm tất cả các section đang xung đột thời gian với section đầu vào.
 * Hai section xung đột khi cùng ngày và khoảng tiết học chồng lấn.
 */
export function getConflicts(
    section: ClassSection,
    confirmedSections: ClassSection[]
): ClassSection[] {
    return confirmedSections.filter(confirmed => {
        if (confirmed.id === section.id) return false;
        if (confirmed.day !== section.day) return false;
        return !(
            section.endPeriod < confirmed.startPeriod ||
            section.startPeriod > confirmed.endPeriod
        );
    });
}
