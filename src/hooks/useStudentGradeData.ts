import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS, ACADEMIC_RULES } from '../config';
import { AcademicRulesEngine } from '../logic/AcademicRulesEngine';
import { useDepartmentData } from '../context/DepartmentContext';

import { type StudentCourseGrade } from '../types';

export function useStudentGradeData() {
    const { data: { tuitionRates, courses: allCoursesMeta } } = useDepartmentData();
    const [stamp, setStamp] = useState(Date.now());
    const [isReady, setIsReady] = useState(false);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'IMPORT_FULL_DATA') {
                setStamp(Date.now());
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const gradeData = useMemo(() => {
        setIsReady(false);

        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);

        if (!studentDb || !studentDb.grades) {
            setHasData(false);
            setIsReady(true);
            return { gradesHistory: [], currentGPA: 0, accumulatedCredits: 0, totalCredits: ACADEMIC_RULES.TOTAL_CREDITS, estimatedTuition: 0, tuitionSource: 'none' as const };
        }

        setHasData(true);

        const ENGLISH_COURSE_IDS = ['ADD00031', 'ADD00032', 'ADD00033', 'ADD00034'];

        // Debug: Log all English-related grades
        const englishRelatedGrades = studentDb.grades.filter(
            (g: any) => ENGLISH_COURSE_IDS.includes(String(g.id).trim()) || String(g.id).trim() === 'BAA00100'
        );
        console.group('🔍 DEBUG: Dữ liệu Anh văn trong grades');
        console.log('Tất cả bản ghi liên quan Anh văn:', englishRelatedGrades);
        englishRelatedGrades.forEach((g: any) => {
            console.log(`  ${g.id} | type="${g.type}" | score="${g.score}" | class="${g.class}"`);
        });
        console.groupEnd();

        // Check English exemption - multiple detection methods:
        // 1. BAA00100 with type 'M'
        // 2. Any English course (ADD00031-34) with score 'M' (miễn)
        const hasExemptionByBAA00100 = studentDb.grades.some(
            (g: any) => String(g.id).trim() === 'BAA00100' && String(g.type).trim() === 'M'
        );
        const hasExemptionByScore = studentDb.grades.some(
            (g: any) => ENGLISH_COURSE_IDS.includes(String(g.id).trim()) && String(g.score).trim().toUpperCase() === 'M'
        );
        const hasBLMExemption = hasExemptionByBAA00100 || hasExemptionByScore;
        console.log(`🔑 Miễn Anh văn: ${hasBLMExemption} (BAA00100+M: ${hasExemptionByBAA00100}, Score=M: ${hasExemptionByScore})`);

        // Preprocess grades: handle CT (improvement) type
        // CT grades override the original grade for the same course
        const gradesByCourse = new Map<string, any[]>();
        studentDb.grades.forEach((g: any) => {
            const code = String(g.id).trim();
            if (!gradesByCourse.has(code)) gradesByCourse.set(code, []);
            gradesByCourse.get(code)!.push(g);
        });

        // Build effective grades: for each course, if there's a CT entry, use its score
        const effectiveGrades: any[] = [];
        gradesByCourse.forEach((records, _code) => {
            const ctRecord = records.find((r: any) => String(r.type).trim() === 'CT');
            if (ctRecord) {
                // Use the CT (improved) record, skip earlier records for the same course
                effectiveGrades.push(ctRecord);
            } else {
                // Use the latest record (last in array)
                effectiveGrades.push(records[records.length - 1]);
            }
        });

        const gradesHistory: StudentCourseGrade[] = [];
        let accumulatedCredits = 0;
        let totalPoints = 0;
        let totalCreditsForGPA = 0;

        console.group('📊 TÍNH ĐIỂM GPA - Chi tiết');
        console.log(`🔑 Miễn Anh văn (BLM): ${hasBLMExemption ? 'CÓ' : 'KHÔNG'}`);
        console.log(`📋 Tổng số môn gốc: ${studentDb.grades.length} | Sau xử lý CT: ${effectiveGrades.length}`);
        console.log('---');

        const logTable: any[] = [];

        effectiveGrades.forEach((g: any, index: number) => {
            const code = String(g.id).trim();
            const nameVi = AcademicRulesEngine.extractVietnameseCourseName(g.name);
            const credits = parseInt(g.credits) || 0;

            // If BLM exemption exists and this is an English course, mark as passed
            const isExemptedEnglish = hasBLMExemption && ENGLISH_COURSE_IDS.includes(code);

            const score = isExemptedEnglish ? 10 : AcademicRulesEngine.parseRawScore(g.score);
            const status = isExemptedEnglish ? 'passed' as const : AcademicRulesEngine.evaluateCourseStatus(score);
            const needsRetake = status === 'retake';

            // Only count towards GPA if the course has a valid numeric score
            const hasValidScore = typeof score === 'number' && !isNaN(score);
            let pointsForGPA = 0, creditsForGPA = 0, earnedCredits = 0;
            if (hasValidScore) {
                const result = AcademicRulesEngine.calculateAccumulationParams(code, credits, score, status);
                pointsForGPA = result.pointsForGPA;
                creditsForGPA = result.creditsForGPA;
                earnedCredits = result.earnedCredits;
                accumulatedCredits += earnedCredits;
                totalPoints += pointsForGPA;
                totalCreditsForGPA += creditsForGPA;
            }

            logTable.push({
                'Mã MH': code,
                'Tên': nameVi.substring(0, 30),
                'TC': credits,
                'Điểm gốc': g.score,
                'Type': g.type || '-',
                'Điểm dùng': score,
                'Trạng thái': status,
                'Tính GPA?': !hasValidScore ? '❌ (chưa có điểm)' : creditsForGPA === 0 ? '⬜ (không tính)' : '✅',
                'Điểm×TC': pointsForGPA.toFixed(1),
                'TC tích lũy': earnedCredits,
                'Ghi chú': isExemptedEnglish ? 'Miễn (M)' : (g.type === 'CT' ? 'Cải thiện' : ''),
            });

            gradesHistory.push({
                id: index.toString(),
                code,
                nameVi,
                credits,
                grade: score ?? 0,
                semester: g.semester || 'Không rõ',
                needsRetake,
                status,
            });
        });

        console.table(logTable);
        console.log(`\n📈 KẾT QUẢ:`);
        console.log(`   Tổng điểm tích lũy: ${totalPoints.toFixed(2)}`);
        console.log(`   Tổng TC tính GPA: ${totalCreditsForGPA}`);
        console.log(`   GPA: ${totalCreditsForGPA > 0 ? (totalPoints / totalCreditsForGPA).toFixed(4) : 'N/A'}`);
        console.log(`   TC tích lũy (đạt): ${accumulatedCredits}`);
        console.groupEnd();

        // If BLM exemption exists, add English courses that student hasn't taken yet
        if (hasBLMExemption) {
            ENGLISH_COURSE_IDS.forEach(engId => {
                if (!effectiveGrades.some((g: any) => String(g.id).trim() === engId)) {
                    gradesHistory.push({
                        id: `exempted-${engId}`,
                        code: engId,
                        nameVi: `Anh văn (miễn)`,
                        credits: 0,
                        grade: 10,
                        semester: 'Miễn',
                        needsRetake: false,
                        status: 'passed',
                    });
                }
            });
        }

        const currentGPA = totalCreditsForGPA > 0 ? (totalPoints / totalCreditsForGPA) : 0;
        const totalCredits = ACADEMIC_RULES.TOTAL_CREDITS;

        // === TÍNH HỌC PHÍ DỰ KIẾN ===
        // Ưu tiên 1: Lấy từ trang học phí (tuition page)
        // Fallback: Nếu trang học phí chậm hơn kết quả ĐKHP → tính từ danh sách môn đã đăng ký
        let estimatedTuition = 0;
        let tuitionSource: 'tuition_page' | 'registration' | 'none' = 'none';

        const importMeta = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, null);
        const tuitionMeta = importMeta?.params?.tuition;
        const regMeta = importMeta?.params?.registration;

        // Parse tuition from tuition page
        const tuitionPageTotal = studentDb.tuition?.total
            ? parseFloat(String(studentDb.tuition.total).replace(/,/g, '')) || 0
            : 0;

        // So sánh năm/HK của trang học phí vs kết quả ĐKHP
        const isTuitionFresh = (() => {
            // Nếu không có meta → dùng tuition page nếu có
            if (!tuitionMeta || !regMeta) return tuitionPageTotal > 0;
            // So sánh: cùng năm & cùng hoặc mới hơn học kỳ
            const sameYear = tuitionMeta.year === regMeta.year;
            const sameSem = parseInt(tuitionMeta.sem) >= parseInt(regMeta.sem);
            return sameYear && sameSem && tuitionPageTotal > 0;
        })();

        if (isTuitionFresh) {
            // Trang học phí cập nhật → dùng trực tiếp
            estimatedTuition = tuitionPageTotal;
            tuitionSource = 'tuition_page';
        } else if (studentDb.registrations && studentDb.registrations.length > 0) {
            // Trang học phí chậm → tính từ danh sách ĐKHP
            // Chỉ tính các lớp LT (TH là 1 phần của LT, không tính lại)
            const ltCourses = studentDb.registrations.filter(
                (r: any) => r.courseType === 'LT'
            );

            // Deduplicate: mỗi mã môn chỉ tính 1 lần (vì 1 môn có thể có nhiều row nếu có TH riêng)
            const uniqueCourses = new Map<string, any>();
            ltCourses.forEach((r: any) => {
                if (!uniqueCourses.has(r.id)) {
                    uniqueCourses.set(r.id, r);
                }
            });

            let calculatedTuition = 0;
            console.group('💰 TÍNH HỌC PHÍ TỪ ĐKHP (fallback)');

            uniqueCourses.forEach((reg, courseId) => {
                const cid = courseId.trim().toUpperCase();

                // Tìm đơn giá theo prefix
                let pricePerCredit = tuitionRates?.default_price || 0;
                if (tuitionRates?.rates) {
                    const sortedKeys = Object.keys(tuitionRates.rates).sort((a: string, b: string) => b.length - a.length);
                    for (const key of sortedKeys) {
                        if (cid.startsWith(key)) {
                            pricePerCredit = (tuitionRates.rates as any)[key];
                            break;
                        }
                    }
                }

                // Tìm số tín chỉ từ metadata
                const meta = allCoursesMeta.find((m: any) => m.course_id === courseId);
                const credits = parseInt(meta?.credits as any) || 3; // fallback 3 tín chỉ

                // Tính billing credits từ tổng giờ (nếu có metadata)
                const theoryH = parseInt(meta?.theory_hours as any) || 0;
                const labH = parseInt(meta?.lab_hours as any) || 0;
                const exerciseH = parseInt(meta?.exercise_hours as any) || 0;
                const totalHours = theoryH + labH + exerciseH;
                const billingCredits = totalHours > 0 ? totalHours / 15 : credits;

                const courseFee = billingCredits * pricePerCredit;
                calculatedTuition += courseFee;

                console.log(`  ${courseId} | ${reg.name} | ${billingCredits.toFixed(1)} billing TC × ${pricePerCredit.toLocaleString()}đ = ${courseFee.toLocaleString()}đ`);
            });

            console.log(`  📊 TỔNG: ${calculatedTuition.toLocaleString()}đ`);
            console.groupEnd();

            estimatedTuition = calculatedTuition;
            tuitionSource = 'registration';
        } else {
            // Không có cả 2 nguồn → dùng tuition page total nếu có
            estimatedTuition = tuitionPageTotal;
            if (tuitionPageTotal > 0) tuitionSource = 'tuition_page';
        }

        setIsReady(true);
        return {
            gradesHistory,
            currentGPA,
            accumulatedCredits,
            totalCredits,
            estimatedTuition,
            tuitionSource,
        };

    }, [stamp, tuitionRates, allCoursesMeta]);

    return { ...gradeData, isReady, hasData };
}

