import { useMemo } from 'react';
import { useStudentDb } from '../../../hooks/useStudentDb';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { readFromStorage } from '../../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../../config';
import { FinancialLogic } from '../services/financial-logic';
import type { TuitionCourse, TuitionSummary } from '../types';

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

        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
        const importMeta = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, null);
        const { registrationSemesterName: regSemName, regTarget } = FinancialLogic.buildSemesterTarget(importMeta);

        const isCurrentRegMatch = regTarget === targetSemester;
        const tuitionInDb = studentDb?.tuition?.[targetSemester];

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
                missingMetaCourses: []
            };
        }

        if (!registrations || registrations.length === 0) {
            return {
                courses: [],
                summary: emptySummary,
                isDataAvailable: false
            };
        }

        let matchingCourses: any[] = [];
        let isFromHistory = false;

        if (isCurrentRegMatch && registrations && registrations.length > 0) {
            matchingCourses = registrations.filter((r: any) => r.courseType === 'LT' || r.courseType === undefined);
        } else {
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
                registrationSemesterName: regSemName
            };
        }

        const ltCourses = matchingCourses;
        const uniqueCourses = new Map<string, any>();
        ltCourses.forEach((r: any) => {
            if (!uniqueCourses.has(r.id)) {
                uniqueCourses.set(r.id, r);
            }
        });

        const allSemestersSet = new Set<string>();
        if (registrations) registrations.forEach((r: any) => r.semester && allSemestersSet.add(FinancialLogic.parseSemesterName(r.semester)));
        if (studentDb?.grades) studentDb.grades.forEach((g: any) => g.semester && allSemestersSet.add(g.semester));
        if (studentDb?.registrations) studentDb.registrations.forEach((r: any) => r.semester && allSemestersSet.add(r.semester));

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
            missingMetaCourses
        };
    }, [selectedSemesterName, registrations, tuitionRates, allCoursesMeta]);
}
