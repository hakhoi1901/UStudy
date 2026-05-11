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

export interface TuitionCourse {
    stt: number;
    semester: string;
    courseCode: string;
    classCode: string;
    courseName: string;
    credits: number;
    periods: number;
    tuitionCredits: number;
    tuitionFee: number;
    discount: number;
    support: number;
    actualFee: number;
    otherFees: number;
    note: string;
}

export interface TuitionSummary {
    semester: string;
    semesterName: string;
    totalCredits: number;
    totalPeriods: number;
    totalTuitionCredits: number;
    totalFee: number;
    advancePayment: number;
    amountDue: number;
    dueDate: string;
    status: 'paid' | 'partial' | 'unpaid';
    lastUpdated: string;
    hasAdvancePayment: boolean;
}
