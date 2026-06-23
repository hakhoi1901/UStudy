import type { TuitionRates, CourseMeta, CourseFeeResult, TuitionCourse, TuitionSummary } from '../types';
import { getTuitionDeadline } from '../../../config/tuitionDeadlines';
/**
 * FinancialLogic.ts
 *
 * Domain Logic: Tất cả logic liên quan đến học phí, đơn giá, billing credits.
 * Không phụ thuộc React - có thể test/import độc lập.
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
     * Tập trung logic tính toán học phí từ mọi nguồn dữ liệu.
     */
    calculateTuitionData: (
        targetSemester: string,
        selectedSemesterName: string | undefined,
        studentDb: any,
        importMeta: any,
        tuitionRates: TuitionRates | null,
        allCoursesMeta: CourseMeta[]
    ): {
        courses: TuitionCourse[],
        summary: TuitionSummary,
        isDataAvailable: boolean,
        registrationSemesterName: string,
        missingMetaCourses: string[],
        source: 'tuition_page' | 'registration' | 'grades' | 'none'
    } => {
        const emptySummary: TuitionSummary = {
            semester: targetSemester,
            semesterName: selectedSemesterName || `Học kỳ ${targetSemester}`,
            totalCredits: 0,
            totalPeriods: 0,
            totalTuitionCredits: 0,
            totalFee: 0,
            advancePayment: 0,
            amountDue: 0,
            dueDate: getTuitionDeadline(targetSemester),
            status: 'unpaid',
            lastUpdated: new Date().toLocaleString('vi-VN'),
            hasAdvancePayment: false,
        };

        const { registrationSemesterName: regSemName, regTarget } = FinancialLogic.buildSemesterTarget(importMeta);
        const isCurrentRegMatch = regTarget === targetSemester;
        const tuitionInDb = studentDb?.tuition?.[targetSemester];

        // 1. Thử lấy từ dữ liệu đã thanh toán (portal)
        const usePortalData = !isCurrentRegMatch && tuitionInDb && tuitionInDb.details && tuitionInDb.details.length > 0;

        if (usePortalData) {
            const portalCourses: TuitionCourse[] = tuitionInDb.details.map((d: any, idx: number) => ({
                stt: idx + 1,
                semester: targetSemester,
                courseCode: d.code,
                classCode: d.classId || 'N/A',
                courseName: d.name,
                credits: d.credits,
                periods: d.periods,
                tuitionCredits: d.tuitionCredits,
                tuitionFee: d.fee,
                discount: 0,
                support: 0,
                actualFee: d.actualFee || d.fee,
                otherFees: 0,
                note: ""
            }));

            const portalSummary: TuitionSummary = {
                ...emptySummary,
                totalCredits: portalCourses.reduce((sum, c) => sum + c.credits, 0),
                totalPeriods: portalCourses.reduce((sum, c) => sum + c.periods, 0),
                totalTuitionCredits: portalCourses.reduce((sum, c) => sum + c.tuitionCredits, 0),
                totalFee: parseFloat(String(tuitionInDb.fee || "0").replace(/,/g, '')) || portalCourses.reduce((sum, c) => sum + c.tuitionFee, 0),
                lastUpdated: tuitionInDb.updatedDate || new Date().toLocaleString('vi-VN'),
            };

            const paymentStatus = FinancialLogic.detectPaymentStatus(studentDb, portalSummary.totalFee, false, targetSemester, true);
            portalSummary.amountDue = paymentStatus.amountDue;
            portalSummary.advancePayment = paymentStatus.advancePayment;
            portalSummary.status = paymentStatus.status;
            portalSummary.hasAdvancePayment = paymentStatus.hasAdvancePayment;

            return {
                courses: portalCourses,
                summary: portalSummary,
                isDataAvailable: true,
                registrationSemesterName: regSemName,
                missingMetaCourses: [],
                source: 'tuition_page'
            };
        }

        const registrations = studentDb?.registrations;
        let matchingCourses: any[] = [];
        let isFromHistory = false;
        let source: 'registration' | 'grades' | 'none' = 'none';

        // 2. Dự phòng 1: Lấy từ môn đăng ký
        if (isCurrentRegMatch && registrations && registrations.length > 0) {
            matchingCourses = registrations.filter((r: any) => r.courseType === 'LT' || r.courseType === undefined);
            source = 'registration';
        } else {
            // 3. Dự phòng 2: Lấy từ lịch sử điểm
            if (studentDb && studentDb.grades) {
                matchingCourses = studentDb.grades.filter((g: any) => g.semester === targetSemester).map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    credits: g.credits,
                    classId: g.class || 'N/A',
                    courseType: 'LT'
                }));
                if (matchingCourses.length > 0) {
                    isFromHistory = true;
                    source = 'grades';
                }
            }
        }

        if (matchingCourses.length === 0) {
            return {
                courses: [],
                summary: emptySummary,
                isDataAvailable: false,
                registrationSemesterName: regSemName,
                missingMetaCourses: [],
                source: 'none'
            };
        }

        const uniqueCourses = new Map<string, any>();
        matchingCourses.forEach((r: any) => {
            if (!uniqueCourses.has(r.id)) {
                uniqueCourses.set(r.id, r);
            }
        });

        const allSemestersSet = new Set<string>();
        if (registrations) registrations.forEach((r: any) => r.semester && allSemestersSet.add(FinancialLogic.parseSemesterName(r.semester)));
        if (studentDb?.grades) studentDb.grades.forEach((g: any) => g.semester && allSemestersSet.add(g.semester));

        const shouldAddIntro = FinancialLogic.shouldAddIntroductoryCourse(targetSemester, Array.from(allSemestersSet));
        if (shouldAddIntro) {
            const intro = FinancialLogic.getIntroductoryCourse(tuitionRates);
            if (!uniqueCourses.has(intro.id)) {
                uniqueCourses.set(intro.id, { id: intro.id, name: intro.name, credits: intro.credits, classGroup: 'N/A' });
            }
        }

        const calculatedCourses: TuitionCourse[] = [];
        const missingMetaCourses: string[] = [];
        let totalCredits = 0;
        let totalPeriods = 0;
        let totalTuitionCredits = 0;
        let totalFee = 0;
        let stt = 1;

        uniqueCourses.forEach((reg, courseId) => {
            const cid = String(courseId).trim().toUpperCase();
            let billingCredits = 0, courseFee = 0, missingMeta = false;

            if (cid === 'ADD00002') {
                billingCredits = 2;
                courseFee = billingCredits * (tuitionRates?.default_price || 0);
            } else {
                const result = FinancialLogic.calculateCourseFee(cid, parseInt(reg.credits || 3), tuitionRates, allCoursesMeta);
                billingCredits = result.billingCredits;
                courseFee = result.courseFee;
                missingMeta = result.missingMeta;
            }

            if (missingMeta && cid !== 'ADD00002') missingMetaCourses.push(cid);

            const meta = allCoursesMeta ? allCoursesMeta.find((m: any) => m.course_id === cid) : null;
            const credits = cid === 'ADD00002' ? 2 : parseInt(reg.credits || meta?.credits || 3);
            const billingCr = cid === 'ADD00002' ? 2 : (meta ? FinancialLogic.calculateBillingCredits(meta, credits) : 0);
            const periods = billingCr * 15;

            calculatedCourses.push({
                stt: stt++,
                semester: targetSemester,
                courseCode: cid,
                classCode: reg.classGroup || reg.classId || 'N/A',
                courseName: reg.name || meta?.name || 'Môn học',
                credits, periods, tuitionCredits: billingCredits, tuitionFee: courseFee,
                discount: 0, support: 0, actualFee: courseFee, otherFees: 0,
                note: cid === 'ADD00002' ? 'Nhập môn đầu khóa' : (missingMeta ? 'Thiếu dữ liệu CTĐT' : '')
            });

            totalCredits += credits;
            totalPeriods += periods;
            totalTuitionCredits += billingCredits;
            totalFee += courseFee;
        });

        emptySummary.totalCredits = totalCredits;
        emptySummary.totalPeriods = totalPeriods;
        emptySummary.totalTuitionCredits = totalTuitionCredits;
        emptySummary.totalFee = totalFee;
        emptySummary.lastUpdated = new Date().toLocaleString('vi-VN');

        const paymentStatus = FinancialLogic.detectPaymentStatus(studentDb, totalFee, isFromHistory, targetSemester, !isCurrentRegMatch);
        emptySummary.amountDue = paymentStatus.amountDue;
        emptySummary.advancePayment = paymentStatus.advancePayment;
        emptySummary.status = paymentStatus.status;
        emptySummary.hasAdvancePayment = paymentStatus.hasAdvancePayment;

        return {
            courses: calculatedCourses,
            summary: emptySummary,
            isDataAvailable: calculatedCourses.length > 0,
            registrationSemesterName: regSemName,
            missingMetaCourses,
            source
        };
    },
};
