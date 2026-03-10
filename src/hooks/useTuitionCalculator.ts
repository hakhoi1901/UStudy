import { useMemo } from 'react';
import { useStudentDb } from './useStudentDb';
import { useDepartmentData } from '../context/DepartmentContext';

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
        // Parse selected semester to target format e.g. "24-25/1"
        let targetSemester = '24-25/1';
        const match = selectedSemesterName.match(/Học kỳ (\d+), (\d{4})-(\d{4})/);
        if (match) {
            const semesterNum = match[1];
            const yearStart = match[2].slice(2);
            const yearEnd = match[3].slice(2);
            targetSemester = `${yearStart}-${yearEnd}/${semesterNum}`;
        }

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

                let regTarget = '';
        let registrationSemesterName = '';
        const importMetaRaw = localStorage.getItem('import_meta');
        if (importMetaRaw) {
            try {
                const importMeta = JSON.parse(importMetaRaw);
                const regMeta = importMeta?.params?.registration;
                if (regMeta && regMeta.sem && regMeta.year) {
                    registrationSemesterName = `Học kỳ ${regMeta.sem}, ${regMeta.year}`;
                    
                    let y = String(regMeta.year);
                    if (y.length === 9) {
                        y = `${y.substring(2, 4)}-${y.substring(7, 9)}`;
                    }
                    regTarget = `${y}/${regMeta.sem}`;
                }
            } catch (e) {}
        }

        const isCurrentRegMatch = !regTarget || regTarget === targetSemester;
        
        // Cố gắng tìm danh sách môn học cho học kỳ mục tiêu
        let matchingCourses: any[] = [];
        let isFromHistory = false;

        if (isCurrentRegMatch && registrations && registrations.length > 0) {
            matchingCourses = registrations.filter((r: any) => r.courseType === 'LT' || r.courseType === undefined);
        } else {
            // Retrieve grades from localStorage
            try {
                const studentDb = JSON.parse(localStorage.getItem('student_db_full') || '{}');
                if (studentDb && studentDb.grades) {
                    matchingCourses = studentDb.grades.filter((g: any) => g.semester === targetSemester).map((g: any) => ({
                        id: g.id,
                        name: g.name,
                        credits: g.credits,
                        classId: g.class || 'N/A',
                        courseType: 'LT' // Giả sử là lý thuyết để tính tiền
                    }));
                    isFromHistory = matchingCourses.length > 0;
                }
            } catch(e) {}
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
        let totalCredits = 0;
        let totalPeriods = 0;
        let totalTuitionCredits = 0;
        let totalFee = 0;
        let stt = 1;

        uniqueCourses.forEach((reg, courseId) => {
            const cid = String(courseId).trim().toUpperCase();
            
            let pricePerCredit = tuitionRates?.default_price || 425000;
            // Dựa vào cấu trúc tuition_rates (như trong ttest/2025-2026.ts)
            // Có format rates or (shared & majors merged)
            
            if (tuitionRates?.rates) {
                const sortedKeys = Object.keys(tuitionRates.rates).sort((a: string, b: string) => b.length - a.length);
                for (const key of sortedKeys) {
                    if (cid.startsWith(key)) {
                        pricePerCredit = (tuitionRates.rates as any)[key];
                        break;
                    }
                }
            } else if (tuitionRates?.shared) {
                const ratesDict: Record<string, number> = {};
                // Flatten shared
                Object.keys(tuitionRates.shared).forEach(k => {
                   ratesDict[k] = tuitionRates.shared[k];
                });
                // Flatten majors[major_id] maybe? It was already merged by getTuitionRates in DepartmentContext
                // We'll just assume standard 'rates' dictionary is constructed or fallback to default_price
                if (tuitionRates?.rates === undefined) { 
                    // getTuitionRates from context usually merges into `tuitionRates` itself if it's dynamic
                    // We'll iterate the object directly filtering number values.
                    const sortedKeys = Object.keys(tuitionRates).filter(k => typeof tuitionRates[k] === 'number' && k !== 'default_price').sort((a: string, b: string) => b.length - a.length);
                    for (const key of sortedKeys) {
                        if (cid.startsWith(key)) {
                            pricePerCredit = tuitionRates[key] as number;
                            break;
                        }
                    }
                }
            } else {
                // If it is flat object
                const sortedKeys = Object.keys(tuitionRates || {}).filter(k => typeof tuitionRates[k] === 'number' && k !== 'default_price').sort((a: string, b: string) => b.length - a.length);
                for (const key of sortedKeys) {
                    if (cid.startsWith(key)) {
                        pricePerCredit = tuitionRates[key] as number;
                        break;
                    }
                }
            }

            const meta = allCoursesMeta ? allCoursesMeta.find((m: any) => m.course_id === cid) : null;
            const credits = parseInt(reg.credits || meta?.credits || 3);
            
            const theoryH = parseInt(meta?.theory_hours || 0);
            const labH = parseInt(meta?.lab_hours || 0);
            const exerciseH = parseInt(meta?.exercise_hours || 0);
            const totalHours = theoryH + labH + exerciseH;
            
            const periods = totalHours > 0 ? totalHours : (credits * 15);
            const billingCredits = totalHours > 0 ? totalHours / 15 : credits;

            const courseFee = billingCredits * pricePerCredit;

            calculatedCourses.push({
                stt: stt++,
                semester: targetSemester,
                courseCode: cid,
                classCode: reg.classId || 'N/A',
                courseName: reg.name || meta?.name || 'Môn học',
                credits: credits,
                periods: periods,
                tuitionCredits: billingCredits,
                tuitionFee: courseFee,
                discount: 0,
                support: 0,
                actualFee: courseFee,
                otherFees: 0,
                note: ''
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
        
        // Xử lý thanh toán
        if (isFromHistory) {
             // Học kỳ sử dụng dữ liệu lịch sử -> Đã coi như đóng rồi
             emptySummary.amountDue = 0;
             emptySummary.advancePayment = totalFee;
             emptySummary.status = 'paid';
             emptySummary.hasAdvancePayment = true;
        } else {
             // Học kỳ hiện tại -> Kiểm tra studentDb.tuition
             let isPaid = false;
             try {
                const studentDb = JSON.parse(localStorage.getItem('student_db_full') || '{}');
                if (studentDb?.tuition?.totals?.totalDue !== undefined) {
                    const totalDueStr = String(studentDb.tuition.totals.totalDue).replace(/,/g, '');
                    const dueNum = parseFloat(totalDueStr) || 0;
                    if (dueNum === 0 && totalFee > 0) {
                         isPaid = true;
                    }
                }
             } catch(e) {}

             if (isPaid) {
                 emptySummary.amountDue = 0;
                 emptySummary.advancePayment = totalFee;
                 emptySummary.status = 'paid';
                 emptySummary.hasAdvancePayment = true;
             } else {
                 emptySummary.amountDue = totalFee;
                 emptySummary.advancePayment = 0;
                 emptySummary.status = 'unpaid';
                 emptySummary.hasAdvancePayment = false;
             }
        }

        emptySummary.lastUpdated = new Date().toLocaleString('vi-VN');
        
        return {
            courses: calculatedCourses,
            summary: emptySummary,
            isDataAvailable: calculatedCourses.length > 0,
            registrationSemesterName
        };
    }, [selectedSemesterName, registrations, tuitionRates, allCoursesMeta]);
}
