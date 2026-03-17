import { Bitset } from './Bitset';
import { WEIGHTS } from './Constants';

export interface Preferences {
    sessionConstraints?: Record<string, number>; // e.g., "0-1": 2 (T2-Sáng: Tuyệt đối không)
    strategy?: string;
    noGaps?: boolean;
}

export interface ClassSession {
    id: string;
    scheduleMask?: Bitset;
    schedule?: string | string[];
}

export interface SubjectItem {
    id: string;
    classes: ClassSession[];
}

export interface Chromosome {
    genes: number[];
    combinedMask?: Bitset;
    fitness?: number;
}

export class FitnessEvaluator {
    prefs: any;

    constructor(preferences: any) {
        this.prefs = { ...preferences };
        if (!this.prefs.sessionConstraints) {
            this.prefs.sessionConstraints = {};
        }
    }

    // --- HÀM TÍNH ĐIỂM (CORE) ---
    getFitness(chromosome: Chromosome, subjects: SubjectItem[]) {
        chromosome.combinedMask = new Bitset();
        let score = WEIGHTS.BASE;
        let conflictCount = 0;
        const genes = chromosome.genes;

        // 1. HARD CONSTRAINT: Check Trùng
        for (let i = 0; i < genes.length; i++) {
            const classIdx = genes[i];
            if (classIdx === -1) continue;

            const currentMask = subjects[i].classes[classIdx].scheduleMask;

            if (currentMask) {
                if (chromosome.combinedMask.anyCommon(currentMask)) {
                    conflictCount++;
                }
                chromosome.combinedMask = chromosome.combinedMask.or(currentMask);
            }
        }

        if (conflictCount > 0) {
            chromosome.fitness = -1 * conflictCount * WEIGHTS.PENALTY_HARD;
            return chromosome.fitness;
        }

        // 2. SOFT CONSTRAINTS

        // A. Ràng buộc buổi học (Mới)
        if (Object.keys(this.prefs.sessionConstraints).length > 0) {
            genes.forEach((classIdx, idx) => {
                if (classIdx === -1) return;
                const currentMask = subjects[idx].classes[classIdx].scheduleMask;
                if (!currentMask) return;

                // Kiểm tra 7 ngày, mỗi ngày 2 buổi
                for (let d = 0; d < 7; d++) {
                    const morningKey = `${d}-1`;
                    const afternoonKey = `${d}-2`;

                    // Check Sáng
                    const morningLevel = this.prefs.sessionConstraints[morningKey];
                    if (morningLevel > 0) {
                        for (let p = 0; p < 10; p++) {
                            if (currentMask.test(d * 20 + p) || currentMask.test(140 + d * 20 + p)) {
                                score -= (morningLevel === 2 ? WEIGHTS.PENALTY_ABSOLUTE_NO : WEIGHTS.PENALTY_RESTRICTED);
                                break;
                            }
                        }
                    }

                    // Check Chiều
                    const afternoonLevel = this.prefs.sessionConstraints[afternoonKey];
                    if (afternoonLevel > 0) {
                        for (let p = 10; p < 20; p++) {
                            if (currentMask.test(d * 20 + p) || currentMask.test(140 + d * 20 + p)) {
                                score -= (afternoonLevel === 2 ? WEIGHTS.PENALTY_ABSOLUTE_NO : WEIGHTS.PENALTY_RESTRICTED);
                                break;
                            }
                        }
                    }
                }
            });
        }

        // C. Chiến thuật & Gap
        const dailyLoad = this.calculateDailyLoad(chromosome.combinedMask);
        const daysWithClasses = dailyLoad.filter(count => count > 0).length;

        if (this.prefs.strategy === 'compress') {
            score += (7 - daysWithClasses) * WEIGHTS.BONUS_COMPRESS;
        } else if (this.prefs.strategy === 'spread') {
            const heavyDays = dailyLoad.filter(count => count > 8).length;
            score -= heavyDays * WEIGHTS.PENALTY_SPREAD;
        }

        // Luôn tính Gap để trừ điểm nhẹ (hoặc nặng nếu user yêu cầu)
        const gaps = this.calculateGaps(chromosome.combinedMask);
        const gapPenalty = this.prefs.noGaps ? (WEIGHTS.PENALTY_GAP * 2) : WEIGHTS.PENALTY_GAP;
        score -= gaps * gapPenalty;

        chromosome.fitness = score;
        return score;
    }

    // --- HÀM PHÂN TÍCH CHI TIẾT (ĐỂ GHI LOG RA MÀN HÌNH) ---
    getInsights(chromosome: Chromosome, subjects: SubjectItem[]) {
        const report = {
            conflicts: 0,
            penalties: [] as string[],
            bonuses: [] as string[]
        };

        let combinedMask = new Bitset();
        const genes = chromosome.genes;

        // 1. Re-check Trùng
        for (let i = 0; i < genes.length; i++) {
            const classIdx = genes[i];
            if (classIdx === -1) continue;
            const cls = subjects[i].classes[classIdx];
            const currentMask = cls.scheduleMask;

            if (currentMask) {
                if (combinedMask.anyCommon(currentMask)) {
                    report.conflicts++;
                    report.penalties.push(`Trùng lịch: ${subjects[i].id} - Lớp ${cls.id}`);
                }
                combinedMask = combinedMask.or(currentMask);
            }
        }

        // 2. Re-check Ràng buộc buổi
        if (Object.keys(this.prefs.sessionConstraints).length > 0) {
            genes.forEach((classIdx, idx) => {
                if (classIdx === -1) return;
                const cls = subjects[idx].classes[classIdx];
                const currentMask = cls.scheduleMask;
                if (!currentMask) return;

                for (let d = 0; d < 7; d++) {
                    const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
                    const morningLevel = this.prefs.sessionConstraints[`${d}-1`];
                    const afternoonLevel = this.prefs.sessionConstraints[`${d}-2`];

                    if (morningLevel > 0) {
                        for (let p = 0; p < 10; p++) {
                            if (currentMask.test(d * 20 + p) || currentMask.test(140 + d * 20 + p)) {
                                report.penalties.push(`${morningLevel === 2 ? "Tuyệt đối không" : "Hạn chế"} học Sáng ${days[d]}: ${subjects[idx].id}`);
                                break;
                            }
                        }
                    }
                    if (afternoonLevel > 0) {
                        for (let p = 10; p < 20; p++) {
                            if (currentMask.test(d * 20 + p) || currentMask.test(140 + d * 20 + p)) {
                                report.penalties.push(`${afternoonLevel === 2 ? "Tuyệt đối không" : "Hạn chế"} học Chiều ${days[d]}: ${subjects[idx].id}`);
                                break;
                            }
                        }
                    }
                }
            });
        }

        // 3. Re-check Gap
        const gaps = this.calculateGaps(combinedMask);
        if (gaps > 0) {
            report.penalties.push(`Có ${gaps} tiết trống trong tuần.`);
        }

        return report;
    }

    // --- HELPERS (DÙNG MASK - CHÍNH XÁC CAO) ---

    // 1: Sáng, 2: Chiều, 3: Cả hai, 0: Không rõ
    getSessionFromMask(mask: Bitset | undefined) {
        if (!mask) return 0;
        let hasMorning = false;
        let hasAfternoon = false;

        for (let d = 0; d < 7; d++) {
            // Sáng: bit 0-9 (Tiết 1-5)
            for (let p = 0; p < 10; p++) {
                if (mask.test(d * 20 + p) || mask.test(140 + d * 20 + p)) hasMorning = true;
            }
            // Chiều: bit 10-19 (Tiết 6-10)
            for (let p = 10; p < 20; p++) {
                if (mask.test(d * 20 + p) || mask.test(140 + d * 20 + p)) hasAfternoon = true;
            }
        }

        if (hasMorning && hasAfternoon) return 3;
        if (hasMorning) return 1;
        if (hasAfternoon) return 2;
        return 0;
    }

    calculateDailyLoad(combinedMask: Bitset) {
        const load = new Array(7).fill(0);
        for (let d = 0; d < 7; d++) {
            let loadP1 = 0;
            let loadP2 = 0;
            for (let p = 0; p < 20; p++) {
                if (combinedMask.test(d * 20 + p)) loadP1 += 0.5;
                if (combinedMask.test(140 + d * 20 + p)) loadP2 += 0.5;
            }
            // Một ngày chỉ có tối đa load lớn nhất giữa Phase 1 và Phase 2 vì chúng không diễn ra cùng tuần
            load[d] = Math.max(loadP1, loadP2);
        }
        return load;
    }

    calculateGaps(combinedMask: Bitset) {
        let totalGaps = 0;
        
        // Tính gap cho Phase 1 (0-139)
        for (let d = 0; d < 7; d++) {
            let first = -1;
            let last = -1;
            let learningBits = 0;

            for (let p = 0; p < 20; p++) {
                if (combinedMask.test(d * 20 + p)) {
                    if (first === -1) first = p;
                    last = p;
                    learningBits++;
                }
            }

            if (first !== -1 && last !== -1) {
                totalGaps += (last - first + 1 - learningBits);
            }
        }
        
        // Tính gap cho Phase 2 (140-279)
        for (let d = 0; d < 7; d++) {
            let first = -1;
            let last = -1;
            let learningBits = 0;

            for (let p = 0; p < 20; p++) {
                if (combinedMask.test(140 + d * 20 + p)) {
                    if (first === -1) first = p;
                    last = p;
                    learningBits++;
                }
            }

            if (first !== -1 && last !== -1) {
                totalGaps += (last - first + 1 - learningBits);
            }
        }
        // totalGaps hiện tại là số lượng "nửa tiết" trống, ta có thể chia 2 để về đơn vị tiết nếu muốn
        return totalGaps / 2;
    }

    // --- HELPER QUAN TRỌNG: XỬ LÝ MẢNG LỊCH ---

    getDaysFromClass(cls: ClassSession) {
        const days = new Set<number>();
        if (!cls.schedule) return [];

        // 1. CHUẨN HÓA: Ép kiểu thành mảng nếu nó là string
        // VD: "T2(1-3)" -> ["T2(1-3)"]
        // VD: ["T3(7-9)", "T4(4-6)"] -> Giữ nguyên
        const schedules = Array.isArray(cls.schedule) ? cls.schedule : [cls.schedule];

        // 2. DUYỆT TẤT CẢ CÁC BUỔI
        schedules.forEach(s => {
            const str = String(s).toUpperCase().trim();

            // Regex bắt Thứ 2 -> Thứ 7 (VD: T2, THỨ 2, T 2)
            let matchT = str.match(/T\s*([2-7])/);
            if (!matchT) matchT = str.match(/THU\s*([2-7])/);

            if (matchT) {
                const thu = parseInt(matchT[1]);
                days.add(thu - 2); // T2 -> 0
            }

            // Regex bắt Chủ Nhật
            if (str.includes('CN') || str.includes('T8') || str.includes('CHU NHAT')) {
                days.add(6);
            }
        });

        // VD: Trả về [1, 2] nghĩa là lớp này học cả Thứ 3 và Thứ 4
        return Array.from(days);
    }
}