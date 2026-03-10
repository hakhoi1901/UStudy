/**
 * Tuition Registry: Đăng ký bảng giá theo năm học.
 * getTuitionRates(year, majorId) trả về bảng giá đã merge (shared + major).
 */
import { tuition_2024_2025 } from './2024-2025';
import { tuition_2025_2026 } from './2025-2026';

interface TuitionYear {
    default_price: number;
    shared: Record<string, number>;
    majors: Record<string, Record<string, number>>;
}

import { APP_CONFIG } from '../../../config/appConfig';

export const ACADEMIC_YEARS = [
    { id: '2025-2026', name: 'Năm học 2025-2026' },
    { id: '2024-2025', name: 'Năm học 2024-2025' },
];

export const DEFAULT_ACADEMIC_YEAR = APP_CONFIG.DEFAULT_ACADEMIC_YEAR;

const tuitionMap: Record<string, TuitionYear> = {
    '2025-2026': tuition_2025_2026,
    '2024-2025': tuition_2024_2025,
};

/**
 * Lấy bảng giá cho 1 ngành trong 1 năm học cụ thể.
 * Merge: shared (chung toàn trường) + majors[majorId] (riêng ngành).
 * Major-specific rates ghi đè lên shared nếu trùng key.
 *
 * @returns { default_price, rates } — rates đã được merge
 */
export function getTuitionRates(academicYear: string, majorId: string) {
    const yearData = tuitionMap[academicYear] || tuitionMap[DEFAULT_ACADEMIC_YEAR];
    const majorRates = yearData.majors[majorId] || {};

    return {
        default_price: yearData.default_price,
        rates: {
            ...yearData.shared,    // Chung toàn trường
            ...majorRates,         // Riêng ngành
        },
    };
}
