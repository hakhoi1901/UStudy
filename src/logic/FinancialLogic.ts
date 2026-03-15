/**
 * FinancialLogic.ts
 *
 * Domain Logic: Tất cả logic liên quan đến học phí, đơn giá, billing credits.
 * Không phụ thuộc React — có thể test/import độc lập.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface TuitionRates {
    default_price: number;
    rates?: Record<string, number>;
    shared?: Record<string, number>;
    [key: string]: any;
}

export interface CourseMeta {
    course_id: string;
    credits?: number | string;
    theory_hours?: number | string;
    lab_hours?: number | string;
    exercise_hours?: number | string;
    [key: string]: any;
}

export interface CourseFeeResult {
    pricePerCredit: number;
    billingCredits: number;
    courseFee: number;
    /** true nếu không tìm thấy metadata môn học trong chương trình đào tạo */
    missingMeta: boolean;
}

// ─── Core Functions ──────────────────────────────────────────────────

export const FinancialLogic = {

    /**
     * Tra cứu đơn giá 1 tín chỉ theo mã môn (longest prefix match).
     *
     * Hỗ trợ 3 cấu trúc tuitionRates:
     *   1. { rates: { "CSC": 500000, ... }, default_price: 425000 }
     *   2. { shared: { ... }, default_price: 425000 }
     *   3. Flat object { "CSC": 500000, ..., default_price: 425000 }
     */
    lookupPricePerCredit: (courseId: string, tuitionRates: TuitionRates | null): number => {
        if (!tuitionRates) return 0;

        const cid = courseId.trim().toUpperCase();
        const defaultPrice = tuitionRates.default_price ?? 0;

        // Xây dựng bảng rate từ cấu trúc flexible
        let ratesDict: Record<string, number> = {};

        if (tuitionRates.rates && typeof tuitionRates.rates === 'object') {
            ratesDict = tuitionRates.rates;
        } else if (tuitionRates.shared && typeof tuitionRates.shared === 'object') {
            ratesDict = { ...tuitionRates.shared };
        } else {
            // Flat object: lọc các key có value là number (trừ default_price)
            for (const key of Object.keys(tuitionRates)) {
                if (key !== 'default_price' && typeof tuitionRates[key] === 'number') {
                    ratesDict[key] = tuitionRates[key] as number;
                }
            }
        }

        // Longest prefix match
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
     * billing credits = tổng giờ / 15 (nếu có metadata), fallback = số tín chỉ.
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
     * Tính phí cho 1 môn học: tra cứu đơn giá + tính billing credits + nhân.
     * One-stop function kết hợp lookupPricePerCredit + calculateBillingCredits.
     * Nếu không tìm thấy metadata trong chương trình đào tạo → missingMeta = true, fee = 0.
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
            // Không có metadata từ chương trình đào tạo → không tính được
            return { pricePerCredit: 0, billingCredits: 0, courseFee: 0, missingMeta: true };
        }

        const pricePerCredit = FinancialLogic.lookupPricePerCredit(courseId, tuitionRates);
        const billingCredits = FinancialLogic.calculateBillingCredits(meta, credits);
        const courseFee = billingCredits * pricePerCredit;

        return { pricePerCredit, billingCredits, courseFee, missingMeta: false };
    },

    /**
     * Tính tổng học phí từ mảng các môn (đã deduplicate).
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

    // ─── Formatting & Parsing ────────────────────────────────────────────

    /**
     * Format số tiền sang chuỗi tiền tệ VNĐ.
     * Dùng chung cho toàn app, thay thế các bản inline duplicate.
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
     * Parse tên học kỳ dạng "Học kỳ 1, 2024-2025" thành mã "24-25/1".
     * Trả về mã mặc định nếu parse thất bại.
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
     * Xây dựng mã học kỳ từ import_meta registration params.
     * Trả về { registrationSemesterName, regTarget } hoặc rỗng nếu không có.
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
     * Kiểm tra xem môn ADD00002 (Nhập môn đầu khóa) có nên được thêm vào học phí hay không.
     * ADD00002 được thêm vào nếu:
     * - Học kỳ cần tính là học kỳ 1 (sem = 1) của năm nhất (first year)
     * 
     * @param targetSemester - Mã học kỳ dạng "24-25/1"
     * @param allSemesters - Danh sách tất cả các học kỳ từ registration/grades của sinh viên
     * @returns true nếu nên thêm ADD00002, false nếu không
     */
    shouldAddIntroductoryCourse: (targetSemester: string, allSemesters: string[]): boolean => {
        if (!targetSemester || !allSemesters || allSemesters.length === 0) {
            return false;
        }

        // Kiểm tra xem mã học kỳ có kết thúc bằng "/1" (học kỳ 1)
        if (!targetSemester.endsWith('/1')) {
            return false;
        }

        // Sắp xếp tất cả các học kỳ để tìm học kỳ sớm nhất (first year)
        const uniqueSemesters = [...new Set(allSemesters)].sort();
        const earliestSemester = uniqueSemesters[0];

        // Nếu target semester == earliest semester → đây là năm nhất
        return targetSemester === earliestSemester;
    },

    /**
     * Lấy thông tin môn ADD00002 (Nhập môn đầu khóa).
     * Môn này có tín chỉ cố định = 2, không có metadata trong CTĐT.
     */
    getIntroductoryCourse: (tuitionRates: TuitionRates | null): { id: string; name: string; credits: number; billingCredits: number; fee: number } => {
        const courseId = 'ADD00002';
        const courseName = 'Nhập môn đầu khóa';
        const credits = 2;
        const defaultPrice = tuitionRates?.default_price || 0;
        const billingCredits = credits;
        const fee = billingCredits * defaultPrice;

        return {
            id: courseId,
            name: courseName,
            credits,
            billingCredits,
            fee
        };
    },

    /**
     * Xác định trạng thái thanh toán học phí.
     * Trích xuất từ useTuitionCalculator.ts L192-223.
     */
    detectPaymentStatus: (
        studentDb: any,
        totalFee: number,
        isFromHistory: boolean
    ): { status: 'paid' | 'partial' | 'unpaid'; amountDue: number; advancePayment: number; hasAdvancePayment: boolean } => {
        if (isFromHistory) {
            return {
                status: 'paid',
                amountDue: 0,
                advancePayment: totalFee,
                hasAdvancePayment: true
            };
        }

        let isPaid = false;
        try {
            if (studentDb?.tuition?.totals?.totalDue !== undefined) {
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
                advancePayment: totalFee,
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
     * Ước tính học phí từ nhiều nguồn dữ liệu.
     * Ưu tiên: trang học phí > danh sách ĐKHP > fallback.
     * Trích xuất từ useStudentGradeData.ts L165-218.
     */
    estimateTuitionFromSources: (
        studentDb: any,
        importMeta: any,
        allCoursesMeta: CourseMeta[],
        tuitionRates: TuitionRates | null
    ): { estimatedTuition: number; tuitionSource: 'tuition_page' | 'registration' | 'none' } => {
        const tuitionMeta = importMeta?.params?.tuition;
        const regMeta = importMeta?.params?.registration;

        // Parse tuition from tuition page
        const tuitionPageTotal = studentDb?.tuition?.total
            ? parseFloat(String(studentDb.tuition.total).replace(/,/g, '')) || 0
            : 0;

        // So sánh năm/HK của trang học phí vs kết quả ĐKHP
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
            const ltCourses = studentDb.registrations.filter(
                (r: any) => r.courseType === 'LT'
            );
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
