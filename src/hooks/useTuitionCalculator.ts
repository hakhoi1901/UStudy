import { useMemo } from 'react';
import { useStudentDb } from './useStudentDb';
import { useDepartmentData } from '../context/DepartmentContext';
import { readFromStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS } from '../config';
import { FinancialLogic } from '../logic/FinancialLogic';

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

export function useTuitionCalculator(selectedSemesterName: string) {
    const { registrations } = useStudentDb();
    const { data: { tuitionRates, courses: allCoursesMeta } } = useDepartmentData();

    return useMemo(() => {
        const targetSemester = FinancialLogic.parseSemesterName(selectedSemesterName);

        const emptySummary: TuitionSummary = {
            semester: targetSemester,
            semesterName: selectedSemesterName,
            totalCredits: 0,
            totalPeriods: 0,
            totalTuitionCredits: 0,
            totalFee: 0,
            advancePayment: 0,
            amountDue: 0,
            dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toISOString().split('T')[0],
            status: 'unpaid',
            lastUpdated: new Date().toLocaleString('vi-VN'),
            hasAdvancePayment: false,
        };

        if (!registrations || registrations.length === 0) {
            return {
                courses: [],
                summary: emptySummary,
                isDataAvailable: false
            };
        }

        // Sử dụng readFromStorage thay vì localStorage.getItem trực tiếp
        const importMeta = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, null);
        const { registrationSemesterName, regTarget } = FinancialLogic.buildSemesterTarget(importMeta);

        const isCurrentRegMatch = !regTarget || regTarget === targetSemester;

        // Cố gắng tìm danh sách môn học cho học kỳ mục tiêu
        let matchingCourses: any[] = [];
        let isFromHistory = false;

        if (isCurrentRegMatch && registrations && registrations.length > 0) {
            matchingCourses = registrations.filter((r: any) => r.courseType === 'LT' || r.courseType === undefined);
        } else {
            // Retrieve grades from storage (thay vì localStorage trực tiếp)
            const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
            if (studentDb && studentDb.grades) {
                matchingCourses = studentDb.grades.filter((g: any) => g.semester === targetSemester).map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    credits: g.credits,
                    classId: g.class || 'N/A',
                    courseType: 'LT'
                }));
                isFromHistory = matchingCourses.length > 0;
            }
        }

        if (matchingCourses.length === 0) {
            return {
                courses: [],
                summary: emptySummary,
                isDataAvailable: false,
                registrationSemesterName
            };
        }

        const ltCourses = matchingCourses;
        const uniqueCourses = new Map<string, any>();
        ltCourses.forEach((r: any) => {
            if (!uniqueCourses.has(r.id)) {
                uniqueCourses.set(r.id, r);
            }
        });

        const calculatedCourses: TuitionCourse[] = [];
        const missingMetaCourses: string[] = [];
        let totalCredits = 0;
        let totalPeriods = 0;
        let totalTuitionCredits = 0;
        let totalFee = 0;
        let stt = 1;

        uniqueCourses.forEach((reg, courseId) => {
            const cid = String(courseId).trim().toUpperCase();

            const { billingCredits, courseFee, missingMeta } = FinancialLogic.calculateCourseFee(
                cid,
                parseInt(reg.credits || 3),
                tuitionRates,
                allCoursesMeta
            );

            if (missingMeta) {
                missingMetaCourses.push(cid);
            }

            const meta = allCoursesMeta ? allCoursesMeta.find((m: any) => m.course_id === cid) : null;
            const credits = parseInt(reg.credits || meta?.credits || 3);

            // Dùng FinancialLogic.calculateBillingCredits để tính periods
            const billingCr = meta ? FinancialLogic.calculateBillingCredits(meta, credits) : 0;
            const periods = billingCr * 15;

            // Debug logic tính học phí từng môn
            // console.log(`[TuitionLog] Course: ${cid} - ${reg.name || meta?.name}`);
            // console.log(` - Credits: ${credits}, Billing Credits: ${billingCredits}`);
            // console.log(` - Price/Credit: ${FinancialLogic.lookupPricePerCredit(cid, tuitionRates)}`);
            // console.log(` - Course Fee: ${courseFee}`);
            if (missingMeta) console.log(` - WARNING: Missing metadata from CTĐT`);

            calculatedCourses.push({
                stt: stt++,
                semester: targetSemester,
                courseCode: cid,
                classCode: reg.classGroup || 'N/A',
                courseName: reg.name || meta?.name || 'Môn học',
                credits: credits,
                periods: periods,
                tuitionCredits: billingCredits,
                tuitionFee: courseFee,
                discount: 0,
                support: 0,
                actualFee: courseFee,
                otherFees: 0,
                note: missingMeta ? 'Thiếu dữ liệu CTĐT' : ''
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

        // Xử lý thanh toán - delegate cho FinancialLogic
        const studentDbForPayment = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
        const paymentStatus = FinancialLogic.detectPaymentStatus(studentDbForPayment, totalFee, isFromHistory);
        emptySummary.amountDue = paymentStatus.amountDue;
        emptySummary.advancePayment = paymentStatus.advancePayment;
        emptySummary.status = paymentStatus.status;
        emptySummary.hasAdvancePayment = paymentStatus.hasAdvancePayment;

        emptySummary.lastUpdated = new Date().toLocaleString('vi-VN');

        return {
            courses: calculatedCourses,
            summary: emptySummary,
            isDataAvailable: calculatedCourses.length > 0,
            registrationSemesterName,
            missingMetaCourses
        };
    }, [selectedSemesterName, registrations, tuitionRates, allCoursesMeta]);
}
