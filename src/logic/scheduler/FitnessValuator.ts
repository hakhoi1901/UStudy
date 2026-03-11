import { Bitset } from './Bitset';
import { WEIGHTS } from './Constants';

export interface Preferences {
    daysOff?: (number | string)[];
    session?: string;
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
        // Chuẩn hóa daysOff thành số nguyên (0=T2, 6=CN)
        if (this.prefs.daysOff && Array.isArray(this.prefs.daysOff)) {
            this.prefs.daysOff = this.prefs.daysOff.map((d: any) => parseInt(d));
        } else {
            this.prefs.daysOff = [];
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

        // A. Ngày nghỉ (Dùng Mask quét Bit)
        if (this.prefs.daysOff.length > 0) {
            genes.forEach((classIdx, idx) => {
                if (classIdx === -1) return;
                const currentMask = subjects[idx].classes[classIdx].scheduleMask;

                if (currentMask) {
                    this.prefs.daysOff.forEach((dayForbidden: number) => {
                        const startBit = dayForbidden * 10;
                        const endBit = startBit + 9;
                        for (let k = startBit; k <= endBit; k++) {
                            if (currentMask.test(k) || currentMask.test(k + 70)) {
                                score -= WEIGHTS.PENALTY_DAY_OFF;
                                break; // Dính 1 tiết là phạt, không cần check tiếp
                            }
                        }
                    });
                }
            });
        }

        // B. Buổi ưu tiên
        if (this.prefs.session && this.prefs.session !== '0') {
            const targetSession = parseInt(this.prefs.session);
            genes.forEach((classIdx, idx) => {
                if (classIdx === -1) return;
                const currentMask = subjects[idx].classes[classIdx].scheduleMask;
                if (currentMask) {
                    const session = this.getSessionFromMask(currentMask);
                    if (session === targetSession) score += WEIGHTS.BONUS_SESSION;
                    else if (session !== 3 && session !== 0) score -= WEIGHTS.PENALTY_WRONG_SESSION;
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

        // 2. Re-check Ngày nghỉ
        if (this.prefs.daysOff.length > 0) {
            genes.forEach((classIdx, idx) => {
                if (classIdx === -1) return;
                const cls = subjects[idx].classes[classIdx];
                const currentMask = cls.scheduleMask;

                if (currentMask) {
                    this.prefs.daysOff.forEach((dayForbidden: number) => {
                        const startBit = dayForbidden * 10;
                        const endBit = startBit + 9;
                        for (let k = startBit; k <= endBit; k++) {
                            if (currentMask.test(k) || currentMask.test(k + 70)) {
                                report.penalties.push(`Học ngày nghỉ (Thứ ${dayForbidden + 2}): ${subjects[idx].id} (${cls.id})`);
                                break;
                            }
                        }
                    });
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
            // Sáng: bit 0-4
            for (let p = 0; p < 5; p++) {
                if (mask.test(d * 10 + p) || mask.test(70 + d * 10 + p)) hasMorning = true;
            }
            // Chiều: bit 5-9
            for (let p = 5; p < 10; p++) {
                if (mask.test(d * 10 + p) || mask.test(70 + d * 10 + p)) hasAfternoon = true;
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
            for (let p = 0; p < 10; p++) {
                if (combinedMask.test(d * 10 + p)) loadP1++;
                if (combinedMask.test(70 + d * 10 + p)) loadP2++;
            }
            // Một ngày chỉ có tối đa load lớn nhất giữa Phase 1 và Phase 2 vì chúng không diễn ra cùng tuần
            load[d] = Math.max(loadP1, loadP2);
        }
        return load;
    }

    calculateGaps(combinedMask: Bitset) {
        let totalGaps = 0;
        
        // Tính gap cho Phase 1 (0-69)
        for (let d = 0; d < 7; d++) {
            let first = -1;
            let last = -1;
            let learningBits = 0;

            for (let p = 0; p < 10; p++) {
                if (combinedMask.test(d * 10 + p)) {
                    if (first === -1) first = p;
                    last = p;
                    learningBits++;
                }
            }

            if (first !== -1 && last !== -1) {
                totalGaps += (last - first + 1 - learningBits);
            }
        }
        
        // Tính gap cho Phase 2 (70-139)
        for (let d = 0; d < 7; d++) {
            let first = -1;
            let last = -1;
            let learningBits = 0;

            for (let p = 0; p < 10; p++) {
                if (combinedMask.test(70 + d * 10 + p)) {
                    if (first === -1) first = p;
                    last = p;
                    learningBits++;
                }
            }

            if (first !== -1 && last !== -1) {
                totalGaps += (last - first + 1 - learningBits);
            }
        }
        return totalGaps;
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