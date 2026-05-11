import type { TuitionRates, CourseMeta, CourseFeeResult } from '../types';

/**
 * FinancialLogic.ts
 *
 * Domain Logic: Tất cả logic liên quan đến học phí, đơn giá, billing credits.
 * Không phụ thuộc React — có thể test/import độc lập.
 */

export const FinancialLogic = {

    /**
     * Tra cứu đơn giá 1 tín chỉ theo mã môn (longest prefix match).
     */
    lookupPricePerCredit: (courseId: string, tuitionRates: TuitionRates | null): number => {
        if (!tuitionRates) return 0;

        const cid = courseId.trim().toUpperCase();
        const defaultPrice = tuitionRates.default_price ?? 0;

        let ratesDict: Record<string, number> = {};

        if (tuitionRates.rates && typeof tuitionRates.rates === 'object') {
            ratesDict = tuitionRates.rates;
        } else if (tuitionRates.shared && typeof tuitionRates.shared === 'object') {
            ratesDict = { ...tuitionRates.shared };
        } else {
            for (const key of Object.keys(tuitionRates)) {
                if (key !== 'default_price' && typeof tuitionRates[key] === 'number') {
                    ratesDict[key] = tuitionRates[key] as number;
                }
            }
        }

        const sortedKeys = Object.keys(ratesDict).sort((a, b) => b.length - a.length);
        for (const key of sortedKeys) {
            if (cid.startsWith(key)) {
                return ratesDict[key];
            }
        }

        return defaultPrice;
    },

    /**
     * Tính billing credits từ metadata giờ học.
     */
    calculateBillingCredits: (meta: CourseMeta | null | undefined, fallbackCredits: number): number => {
        if (!meta) return fallbackCredits;

        const theoryH = parseInt(meta.theory_hours as any) || 0;
        const labH = parseInt(meta.lab_hours as any) || 0;
        const exerciseH = parseInt(meta.exercise_hours as any) || 0;
        const totalHours = theoryH + labH + exerciseH;

        return totalHours > 0 ? totalHours / 15 : fallbackCredits;
    },

    /**
     * Tính phí cho 1 môn học.
     */
    calculateCourseFee: (
        courseId: string,
        credits: number,
        tuitionRates: TuitionRates | null,
        allCoursesMeta: CourseMeta[]
    ): CourseFeeResult => {
        const meta = allCoursesMeta.find(m => m.course_id === courseId.trim().toUpperCase())
            || allCoursesMeta.find(m => m.course_id === courseId);

        if (!meta) {
            return { pricePerCredit: 0, billingCredits: 0, courseFee: 0, missingMeta: true };
        }

        const pricePerCredit = FinancialLogic.lookupPricePerCredit(courseId, tuitionRates);
        const billingCredits = FinancialLogic.calculateBillingCredits(meta, credits);
        const courseFee = billingCredits * pricePerCredit;

        return { pricePerCredit, billingCredits, courseFee, missingMeta: false };
    },

    /**
     * Tính tổng học phí từ mảng các môn.
     */
    calculateTotalTuition: (
        courses: { id: string; credits: number }[],
        tuitionRates: TuitionRates | null,
        allCoursesMeta: CourseMeta[]
    ): number => {
        return courses.reduce((total, course) => {
            const { courseFee } = FinancialLogic.calculateCourseFee(
                course.id, course.credits, tuitionRates, allCoursesMeta
            );
            return total + courseFee;
        }, 0);
    },

    /**
     * Format số tiền sang chuỗi tiền tệ VNĐ.
     */
    formatCurrency: (amount: number, style: 'plain' | 'currency' = 'plain'): string => {
        if (style === 'currency') {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(amount || 0);
        }
        return new Intl.NumberFormat('vi-VN').format(amount || 0);
    },

    /**
     * Parse tên học kỳ.
     */
    parseSemesterName: (semesterName: string, fallback: string = '24-25/1'): string => {
        const match = semesterName.match(/Học kỳ (\d+), (\d{4})-(\d{4})/);
        if (match) {
            const semesterNum = match[1];
            const yearStart = match[2].slice(2);
            const yearEnd = match[3].slice(2);
            return `${yearStart}-${yearEnd}/${semesterNum}`;
        }
        return fallback;
    },

    /**
     * Xây dựng mã học kỳ từ import_meta.
     */
    buildSemesterTarget: (importMeta: any): { registrationSemesterName: string; regTarget: string } => {
        const regMeta = importMeta?.params?.registration;
        if (!regMeta || !regMeta.sem || !regMeta.year) {
            return { registrationSemesterName: '', regTarget: '' };
        }

        const registrationSemesterName = `Học kỳ ${regMeta.sem}, ${regMeta.year}`;
        let y = String(regMeta.year);
        if (y.length === 9) {
            y = `${y.substring(2, 4)}-${y.substring(7, 9)}`;
        }
        const regTarget = `${y}/${regMeta.sem}`;

        return { registrationSemesterName, regTarget };
    },

    /**
     * Xác định trạng thái thanh toán học phí.
     */
    detectPaymentStatus: (
        studentDb: any,
        totalFee: number,
        isFromHistory: boolean,
        targetSemester?: string,
        forcePaid?: boolean
    ): { status: 'paid' | 'partial' | 'unpaid'; amountDue: number; advancePayment: number; hasAdvancePayment: boolean } => {
        if (isFromHistory || forcePaid) {
            return {
                status: 'paid',
                amountDue: 0,
                advancePayment: totalFee,
                hasAdvancePayment: true
            };
        }

        let isPaid = false;
        let amountPaidFromPortal = 0;

        try {
            const tuitionMap = studentDb?.tuition;
            const tuitionForSem = targetSemester ? tuitionMap?.[targetSemester] : null;

            if (tuitionForSem) {
                const totalDueStr = String(tuitionForSem.total || "0").replace(/,/g, '');
                const dueNum = parseFloat(totalDueStr) || 0;
                const totalFeeStr = String(tuitionForSem.fee || "0").replace(/,/g, '');
                const totalFeeNum = parseFloat(totalFeeStr) || 0;

                if (dueNum === 0 && totalFeeNum > 0) {
                    isPaid = true;
                    amountPaidFromPortal = totalFeeNum;
                } else if (dueNum > 0) {
                    amountPaidFromPortal = Math.max(0, totalFeeNum - dueNum);
                }
            } else if (studentDb?.tuition?.totals?.totalDue !== undefined) {
                const totalDueStr = String(studentDb.tuition.totals.totalDue).replace(/,/g, '');
                const dueNum = parseFloat(totalDueStr) || 0;
                if (dueNum === 0 && totalFee > 0) {
                    isPaid = true;
                }
            }
        } catch (e) { }

        if (isPaid) {
            return {
                status: 'paid',
                amountDue: 0,
                advancePayment: amountPaidFromPortal || totalFee,
                hasAdvancePayment: true
            };
        }

        if (amountPaidFromPortal > 0) {
            return {
                status: 'partial',
                amountDue: Math.max(0, totalFee - amountPaidFromPortal),
                advancePayment: amountPaidFromPortal,
                hasAdvancePayment: true
            };
        }

        return {
            status: 'unpaid',
            amountDue: totalFee,
            advancePayment: 0,
            hasAdvancePayment: false
        };
    },

    /**
     * Kiểm tra thêm môn ADD00002.
     */
    shouldAddIntroductoryCourse: (targetSemester: string, allSemesters: string[]): boolean => {
        if (!targetSemester || !allSemesters || allSemesters.length === 0) {
            return false;
        }
        if (!targetSemester.endsWith('/1')) {
            return false;
        }
        const uniqueSemesters = [...new Set(allSemesters)].sort();
        const earliestSemester = uniqueSemesters[0];
        return targetSemester === earliestSemester;
    },

    /**
     * Lấy thông tin môn ADD00002.
     */
    getIntroductoryCourse: (tuitionRates: TuitionRates | null): { id: string; name: string; credits: number; billingCredits: number; fee: number } => {
        const courseId = 'ADD00002';
        const courseName = 'Nhập môn đầu khóa';
        const credits = 2;
        const defaultPrice = tuitionRates?.default_price || 0;
        const billingCredits = credits;
        const fee = billingCredits * defaultPrice;

        return { id: courseId, name: courseName, credits, billingCredits, fee };
    },

    /**
     * Ước tính học phí từ nhiều nguồn dữ liệu.
     */
    estimateTuitionFromSources: (
        studentDb: any,
        importMeta: any,
        allCoursesMeta: CourseMeta[],
        tuitionRates: TuitionRates | null
    ): { estimatedTuition: number; tuitionSource: 'tuition_page' | 'registration' | 'none' } => {
        const tuitionMeta = importMeta?.params?.tuition;
        const regMeta = importMeta?.params?.registration;

        let tuitionPageTotal = 0;
        const tuitionMap = studentDb?.tuition;

        if (tuitionMap && typeof tuitionMap === 'object' && !tuitionMap.total) {
            const periods = Object.keys(tuitionMap);
            if (periods.length > 0) {
                const regTarget = regMeta ? `${String(regMeta.year).substring(2, 4)}-${String(regMeta.year).substring(7, 9)}/${regMeta.sem}` : null;
                const match = regTarget ? tuitionMap[regTarget] : null;
                const latest = tuitionMap[periods.sort().reverse()[0]];
                const target = match || latest;
                tuitionPageTotal = parseFloat(String(target.total || "0").replace(/,/g, '')) || 0;
            }
        } else {
            tuitionPageTotal = studentDb?.tuition?.total
                ? parseFloat(String(studentDb.tuition.total).replace(/,/g, '')) || 0
                : 0;
        }

        const isTuitionFresh = (() => {
            if (!tuitionMeta || !regMeta) return tuitionPageTotal > 0;
            const sameYear = tuitionMeta.year === regMeta.year;
            const sameSem = parseInt(tuitionMeta.sem) >= parseInt(regMeta.sem);
            return sameYear && sameSem && tuitionPageTotal > 0;
        })();

        if (isTuitionFresh) {
            return { estimatedTuition: tuitionPageTotal, tuitionSource: 'tuition_page' };
        }

        if (studentDb?.registrations && studentDb.registrations.length > 0) {
            const ltCourses = studentDb.registrations.filter((r: any) => r.courseType === 'LT');
            const uniqueCourses = new Map<string, any>();
            ltCourses.forEach((r: any) => {
                if (!uniqueCourses.has(r.id)) uniqueCourses.set(r.id, r);
            });

            const courseList = Array.from(uniqueCourses.entries()).map(([courseId]) => {
                const meta = allCoursesMeta.find((m: any) => m.course_id === courseId);
                const credits = parseInt(meta?.credits as any) || 3;
                return { id: courseId, credits };
            });

            return {
                estimatedTuition: FinancialLogic.calculateTotalTuition(courseList, tuitionRates, allCoursesMeta),
                tuitionSource: 'registration'
            };
        }

        return {
            estimatedTuition: tuitionPageTotal,
            tuitionSource: tuitionPageTotal > 0 ? 'tuition_page' : 'none'
        };
    },
};
