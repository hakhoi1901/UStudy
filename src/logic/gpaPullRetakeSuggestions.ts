import type { StudentCourseGrade } from '../types';
import { AcademicRulesEngine } from './AcademicRulesEngine';

export interface RetakeSuggestionItem {
    code: string;
    nameVi: string;
    credits: number;
    currentGrade: number;
    potentialImprove: number;
    impactPoints: number;
}

export interface RetakeSuggestionConfig {
    gradeThreshold: number; // only suggest when currentGrade <= threshold
    minDelta: number; // only suggest when (10 - currentGrade) >= minDelta
    maxItems: number;
}

const DEFAULT_CONFIG: RetakeSuggestionConfig = {
    gradeThreshold: 7.0,
    minDelta: 1.0,
    maxItems: 8,
};

function round2(n: number) {
    return Math.round(n * 100) / 100;
}

/**
 * Đề xuất các môn đã học có điểm thấp nên học cải thiện để kéo GPA.
 * Hybrid:
 * - Lọc: currentGrade <= threshold, credits > 0, không thuộc môn loại trừ GPA, còn tiềm năng tăng >= minDelta
 * - Xếp hạng: impactPoints = (10 - currentGrade) * credits
 */
export function getRetakeSuggestions(
    gradesHistory: StudentCourseGrade[],
    config: Partial<RetakeSuggestionConfig> = {}
): RetakeSuggestionItem[] {
    const cfg: RetakeSuggestionConfig = { ...DEFAULT_CONFIG, ...config };

    // Group by course code; pick the grade currently counted for GPA as "best effort":
    // - Prefer non-ongoing
    // - If multiple entries exist, keep the *lowest* grade to be conservative for improvement suggestions.
    const byCode = new Map<string, StudentCourseGrade>();

    for (const g of gradesHistory) {
        if (g.status === 'ongoing') continue;
        if (AcademicRulesEngine.isCourseExcludedFromGPA(g.code)) continue;
        if (g.credits <= 0) continue;

        const prev = byCode.get(g.code);
        if (!prev) {
            byCode.set(g.code, g);
            continue;
        }
        if (g.grade < prev.grade) byCode.set(g.code, g);
    }

    const items: RetakeSuggestionItem[] = [];
    for (const g of byCode.values()) {
        const potentialImprove = 10 - g.grade;
        if (g.grade > cfg.gradeThreshold) continue;
        if (potentialImprove < cfg.minDelta) continue;
        const impactPoints = potentialImprove * g.credits;
        items.push({
            code: g.code,
            nameVi: g.nameVi,
            credits: g.credits,
            currentGrade: round2(g.grade),
            potentialImprove: round2(potentialImprove),
            impactPoints: round2(impactPoints),
        });
    }

    return items
        .sort((a, b) => b.impactPoints - a.impactPoints)
        .slice(0, cfg.maxItems);
}

