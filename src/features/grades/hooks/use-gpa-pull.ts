import { useState, useMemo, useEffect, useRef } from 'react';
import { AcademicRulesEngine } from '../services/academic-rules-engine';
import { GPACalculator } from '../services/gpa-calculator';
import { redistributeSuggestedGrades, getSemesterWarning } from '../services/gpa-pull-redistribution';
import { getRetakeSuggestions } from '../services/gpa-pull-retake-suggestions';
import { ACADEMIC_RULES } from '../../../constants';
import { useDepartmentData } from '../../../context/DepartmentContext';
import type { UseGPAPullProps, ManualRetakeCandidate, GPAPullSemester } from '../types';

/**
 * Chuẩn hóa mã môn học để đảm bảo việc so khớp giữa các nguồn dữ liệu 
 * (Portal, CTĐT, Simulator) luôn chính xác, tránh lỗi do khoảng trắng hoặc viết hoa/thường.
 */
export const normalizeCourseCode = (code: unknown): string => (code ?? '').toString().trim().toUpperCase();

/**
 * Xác định môn học thuộc khối kiến thức cơ sở ngành.
 * Quy tắc: Dựa trên danh mục 'FOUNDATION' trong CTĐT để hỗ trợ sinh viên 
 * theo dõi các điều kiện xét học bổng hoặc chuyên ngành hẹp vốn thường chỉ tính điểm khối này.
 */
export const isFoundationCategory = (categoryRaw: unknown): boolean => {
    const category = (categoryRaw ?? '').toString().trim().toUpperCase();
    return category === ACADEMIC_RULES.CATEGORIES.FOUNDATION;
};

/**
 * Hook useGPAPull: Đầu não xử lý chiến lược "về đích" GPA.
 * 
 * Kết hợp: Điểm đã có + Điểm dự kiến (Simulator) + Kế hoạch học cải thiện.
 */
export function useGPAPull({
    gradesHistory,
    simulatorCourses,
    currentGPA,
    accumulatedCredits,
    totalCredits,
}: UseGPAPullProps) {
    const [targetGPAInput, setTargetGPAInput] = useState<string>('');
    const [expanded, setExpanded] = useState(true);
    const [mode, setMode] = useState<'all' | 'foundationMajor'>('all');
    const [draftProjectedGrades, setDraftProjectedGrades] = useState<Record<string, string>>({});
    const [draftProjectedGradeErrors] = useState<Record<string, string>>({});
    const [manualRetakeTargets, setManualRetakeTargets] = useState<Record<string, number>>({});
    const [draftManualRetakeTargets, setDraftManualRetakeTargets] = useState<Record<string, string>>({});
    const [draftManualRetakeTargetErrors, setDraftManualRetakeTargetErrors] = useState<Record<string, string>>({});
    const [pendingRetakeCodes, setPendingRetakeCodes] = useState<string[]>([]);
    const [retakeSearchTerm, setRetakeSearchTerm] = useState<string>('');
    const [isRetakePickerOpen, setIsRetakePickerOpen] = useState<boolean>(false);
    const retakePickerRef = useRef<HTMLDivElement | null>(null);
    const { data: { courses: departmentCourses } } = useDepartmentData();

    const pullDecimals = ACADEMIC_RULES.UI.PULL_DECIMALS;
    const minTargetGpa = ACADEMIC_RULES.PASS_GRADE_DECIMAL;

    const parsedTargetGpa = useMemo(() => parseFloat(targetGPAInput.replace(',', '.')), [targetGPAInput]);
    /**
     * Logic kiểm tra lỗi input: 
     * Tại sao: Chặn các giá trị vô lý (điểm âm hoặc > 10) ngay từ đầu để tránh gây lỗi 
     * tràn số hoặc kết quả âm trong các hàm toán học phức tạp phía sau.
     */
    const targetGpaError = useMemo(() => {
        if (targetGPAInput.trim() === '') return null;
        if (Number.isNaN(parsedTargetGpa)) return `Vui lòng nhập GPA hợp lệ từ ${minTargetGpa} đến ${ACADEMIC_RULES.MAX_GPA}.`;
        if (parsedTargetGpa < minTargetGpa) return `GPA mục tiêu không được nhỏ hơn ${minTargetGpa.toFixed(pullDecimals)}.`;
        if (parsedTargetGpa > ACADEMIC_RULES.MAX_GPA) return `GPA mục tiêu không được lớn hơn ${ACADEMIC_RULES.MAX_GPA.toFixed(pullDecimals)}.`;
        return null;
    }, [targetGPAInput, parsedTargetGpa, minTargetGpa]);

    const targetGPA = useMemo(() => {
        if (targetGPAInput.trim() === '') return null;
        if (targetGpaError) return null;
        if (Number.isNaN(parsedTargetGpa)) return null;
        return parsedTargetGpa;
    }, [targetGPAInput, parsedTargetGpa, targetGpaError]);

    /**
     * Tạo bản đồ phân loại môn học từ dữ liệu khoa/ngành.
     * Tại sao: Dữ liệu điểm từ portal thường không có thông tin 'Cơ sở ngành', 
     * nên ta phải map ngược từ CTĐT để hỗ trợ tính năng lọc theo Scope.
     */
    const courseCategoryByCode = useMemo(() => {
        const map = new Map<string, string>();
        const list = Array.isArray(departmentCourses) ? departmentCourses : [];
        for (const course of list) {
            const code = normalizeCourseCode(course?.course_id ?? course?.id);
            const category = (course?.category ?? '').toString().trim().toUpperCase();
            if (!code || !category) continue;
            map.set(code, category);
        }
        return map;
    }, [departmentCourses]);

    const foundationMajorTotalCredits = useMemo(() => {
        const list = Array.isArray(departmentCourses) ? departmentCourses : [];
        return list.reduce((sum, course) => {
            const code = normalizeCourseCode(course?.course_id ?? course?.id);
            const category = (course?.category ?? '').toString().trim().toUpperCase();
            const credits = Number(course?.credits) || 0;
            if (!code || credits <= 0) return sum;
            if (!isFoundationCategory(category)) return sum;
            if (AcademicRulesEngine.isCourseExcludedFromGPA(code)) return sum;
            return sum + credits;
        }, 0);
    }, [departmentCourses]);

    const hasCategoryDataForSimulator = useMemo(() => {
        return simulatorCourses.some((course) => {
            const category = courseCategoryByCode.get(normalizeCourseCode(course.code));
            return isFoundationCategory(category);
        });
    }, [simulatorCourses, courseCategoryByCode]);

    /**
     * Kiểm tra tính khả dụng của dữ liệu theo phạm vi (Scope).
     * Tại sao: Tránh tình trạng chia cho 0 (Division by zero) khi người dùng chọn 'Cơ sở ngành' 
     * nhưng hệ thống chưa load kịp danh mục môn học tương ứng.
     */
    const isFoundationMajorModeUnavailable = mode === 'foundationMajor' && !hasCategoryDataForSimulator;
    const isFoundationMajorScopeActive = mode === 'foundationMajor' && hasCategoryDataForSimulator;

    /**
     * Lọc lịch sử điểm theo phạm vi đang chọn.
     * Tại sao: Khi tính GPA Cơ sở ngành, ta phải loại bỏ hoàn toàn các môn đại cương 
     * để con số 'Điểm trung bình hiện tại' và 'Tín chỉ tích lũy' phản ánh đúng yêu cầu chuyên ngành.
     */
    const scopedGradesHistory = useMemo(() => {
        if (!isFoundationMajorScopeActive) return gradesHistory;
        return gradesHistory.filter((course) => {
            const category = courseCategoryByCode.get(normalizeCourseCode(course.code));
            return isFoundationCategory(category);
        });
    }, [gradesHistory, isFoundationMajorScopeActive, courseCategoryByCode]);

    const scopedCurrentSnapshot = useMemo(() => {
        let points = 0;
        let creditsForGPA = 0;
        let earnedCredits = 0;

        for (const course of scopedGradesHistory) {
            if (course.status === 'ongoing') continue;
            const result = AcademicRulesEngine.calculateAccumulationParams(
                course.code,
                course.credits,
                course.grade,
                course.status
            );
            points += result.pointsForGPA;
            creditsForGPA += result.creditsForGPA;
            earnedCredits += result.earnedCredits;
        }

        return {
            points,
            creditsForGPA,
            earnedCredits,
            gpa: creditsForGPA > 0 ? points / creditsForGPA : 0,
        };
    }, [scopedGradesHistory]);

    const scopedTotalCredits = isFoundationMajorScopeActive ? foundationMajorTotalCredits : (ACADEMIC_RULES.TOTAL_CREDITS ?? totalCredits);
    const displayCurrentGPA = isFoundationMajorScopeActive ? scopedCurrentSnapshot.gpa : currentGPA;
    const displayAccumulatedCredits = isFoundationMajorScopeActive ? scopedCurrentSnapshot.earnedCredits : accumulatedCredits;
    const scopeLabelSuffix = isFoundationMajorScopeActive ? ' (Cơ sở ngành)' : '';
    const scopeName = isFoundationMajorScopeActive ? 'Cơ sở ngành' : 'Toàn khóa';

    /**
     * Tính toán số điểm trung bình cần thiết (Required Average).
     * Quy tắc nghiệp vụ: 
     * 1. Chỉ tính trên các tín chỉ "thực sự" đóng góp vào GPA (loại trừ GDQP, GDTC...).
     * 2. Mục tiêu là tìm ra điểm số tối thiểu để 'Tổng điểm tích lũy' đạt ngưỡng mong muốn khi ra trường.
     */
    const baseResult = useMemo(() => {
        if (targetGPA === null) return null;
        return GPACalculator.calculateRequiredAverageForTargetGPAInScope(
            scopedGradesHistory,
            targetGPA,
            scopedTotalCredits,
            scopeName
        );
    }, [scopedGradesHistory, targetGPA, scopedTotalCredits, scopeName]);

    /**
     * Dự báo học kỳ tiếp theo dựa trên dữ liệu Simulator.
     * Triết lý: Không chỉ tính trung bình phẳng, mà sử dụng thuật toán 'redistribute' 
     * để phân bổ điểm gợi ý cho từng môn một cách thực tế (môn khó điểm vừa, môn dễ điểm cao) 
     * thay vì bắt tất cả các môn phải đạt đúng một con số trung bình khô khan.
     */
    const nextSemester = useMemo((): GPAPullSemester | null => {
        if (!baseResult?.success || baseResult.requiredAverage == null || baseResult.impossible || baseResult.alreadyAchieved)
            return null;
        const filteredSimulator =
            isFoundationMajorScopeActive
                ? simulatorCourses.filter((c) => {
                    const category = courseCategoryByCode.get(normalizeCourseCode(c.code));
                    return isFoundationCategory(category);
                })
                : simulatorCourses;
        const raw = GPACalculator.buildNextSemesterFromSimulator(filteredSimulator, baseResult.requiredAverage);
        if (!raw) return null;
        const courses = redistributeSuggestedGrades(raw.courses, baseResult.requiredAverage);
        return { ...raw, courses };
    }, [baseResult, simulatorCourses, courseCategoryByCode, isFoundationMajorScopeActive]);

    /**
     * Giới hạn trần GPA (The Ceiling).
     * Tại sao: Tính toán GPA tối đa nếu tất cả các môn còn lại đều được 10.0. 
     * Nếu mục tiêu của người dùng cao hơn con số này, hệ thống sẽ tự động chuyển sang 
     * trạng thái 'Impossible' để người dùng không nuôi hy vọng hão huyền.
     */
    const maxAchievableGpaAtGraduation = useMemo(() => {
        if (baseResult?.currentPoints == null || baseResult.currentCredits == null) return null;
        const remainingCredits = scopedTotalCredits - baseResult.currentCredits;
        if (remainingCredits <= 0) return null;
        return (baseResult.currentPoints + 10 * remainingCredits) / scopedTotalCredits;
    }, [baseResult, scopedTotalCredits]);

    /**
     * Đánh giá hiệu quả học tập của học kỳ dự kiến so với mục tiêu dài hạn.
     * Tại sao dùng Epsilon: Tránh việc hệ thống báo động 'Behind' (Tụt hậu) chỉ vì thiếu hụt 0.01 điểm. 
     * Chỉ cảnh báo khi xu hướng thực sự lệch khỏi quỹ đạo cần thiết để đạt bằng Khá/Giỏi.
     */
    const semesterStats = useMemo(() => {
        if (
            !baseResult ||
            !baseResult.success ||
            baseResult.impossible ||
            baseResult.alreadyAchieved ||
            baseResult.requiredAverage == null ||
            baseResult.remainingCredits == null ||
            !nextSemester
        ) {
            return null;
        }

        const epsilon = ACADEMIC_RULES.UI.EPSILON;

        let usedCredits = 0;
        let usedPoints = 0;

        nextSemester.courses.forEach((c) => {
            const grade =
                c.isLocked && c.lockedGrade != null
                    ? c.lockedGrade
                    : c.projectedGrade != null
                        ? c.projectedGrade
                        : c.suggestedGrade ?? null;

            if (grade == null || Number.isNaN(grade)) return;

            usedCredits += c.credits;
            usedPoints += grade * c.credits;
        });

        if (usedCredits <= 0) return null;

        const semesterGpa = usedPoints / usedCredits;

        const totalRemainingCredits = baseResult.remainingCredits;
        const futurePointsNeeded = baseResult.requiredAverage * totalRemainingCredits;
        const remainingCreditsAfter = totalRemainingCredits - usedCredits;

        let newRequiredAvgAfter: number | null = null;
        if (remainingCreditsAfter > 0) {
            newRequiredAvgAfter = (futurePointsNeeded - usedPoints) / remainingCreditsAfter;
        }

        let trend: 'ahead' | 'behind' | 'onTrack' | null = null;
        if (semesterGpa >= baseResult.requiredAverage + epsilon) {
            trend = 'ahead';
        } else if (
            semesterGpa <= baseResult.requiredAverage - epsilon &&
            newRequiredAvgAfter != null &&
            newRequiredAvgAfter >= ACADEMIC_RULES.PASS_GRADE_DECIMAL &&
            newRequiredAvgAfter <= 10
        ) {
            trend = 'behind';
        } else {
            trend = 'onTrack';
        }

        return {
            semesterGpa,
            usedCredits,
            newRequiredAvgAfter,
            trend,
        };
    }, [baseResult, nextSemester]);

    const shouldShowRetakeSuggestions = useMemo(() => {
        if (!targetGPA || !baseResult) return false;
        if (baseResult.impossible) return true;
        const semesterWarning = nextSemester ? getSemesterWarning(nextSemester.courses, nextSemester.requiredGPA) : null;
        if (semesterWarning) return true;
        if (maxAchievableGpaAtGraduation != null && targetGPA > maxAchievableGpaAtGraduation + 1e-6) return true;
        return false;
    }, [targetGPA, baseResult, nextSemester, maxAchievableGpaAtGraduation]);

    const retakeSuggestions = useMemo(() => {
        return getRetakeSuggestions(scopedGradesHistory);
    }, [scopedGradesHistory]);

    const simulatorCourseCodes = useMemo(() => {
        const set = new Set<string>();
        simulatorCourses.forEach((course) => {
            set.add(normalizeCourseCode(course.code));
        });
        return set;
    }, [simulatorCourses]);

    /**
     * Lọc danh sách các môn có thể học cải thiện (Manual Retake).
     * Quy tắc loại trừ: 
     * 1. Không gợi ý môn đang học (Ongoing).
     * 2. Không gợi ý các môn đã có trong Simulator (tránh xung đột dữ liệu).
     * 3. Không gợi ý môn không tính GPA (GDTC, GDQP).
     * Mục tiêu: Giúp người dùng tập trung vào các môn "đã có điểm" nhưng thấp để kéo GPA nhanh nhất.
     */
    const eligibleRetakeCourses = useMemo(() => {
        const byCode = new Map<string, ManualRetakeCandidate>();

        scopedGradesHistory.forEach((course) => {
            if (course.status === 'ongoing') return;
            if (course.credits <= 0) return;

            const code = normalizeCourseCode(course.code);
            if (!code) return;
            if (simulatorCourseCodes.has(code)) return;
            if (AcademicRulesEngine.isCourseExcludedFromGPA(code)) return;

            const existing = byCode.get(code);
            const nextCandidate: ManualRetakeCandidate = {
                code,
                nameVi: course.nameVi,
                credits: course.credits,
                currentGrade: course.grade,
            };

            if (!existing || nextCandidate.currentGrade < existing.currentGrade) {
                byCode.set(code, nextCandidate);
            }
        });

        return Array.from(byCode.values()).sort((a, b) => {
            if (a.currentGrade !== b.currentGrade) return a.currentGrade - b.currentGrade;
            return a.code.localeCompare(b.code);
        });
    }, [scopedGradesHistory, simulatorCourseCodes]);

    const eligibleRetakeMap = useMemo(() => {
        const map = new Map<string, ManualRetakeCandidate>();
        eligibleRetakeCourses.forEach((course) => map.set(course.code, course));
        return map;
    }, [eligibleRetakeCourses]);

    const manualRetakeItems = useMemo(() => {
        const items: Array<ManualRetakeCandidate & { targetGrade: number; impactPoints: number; improveDelta: number }> = [];

        Object.entries(manualRetakeTargets).forEach(([rawCode, target]) => {
            const code = normalizeCourseCode(rawCode);
            const meta = eligibleRetakeMap.get(code);
            if (!meta) return;

            const improveDelta = Math.max(0, target - meta.currentGrade);
            const impactPoints = improveDelta * meta.credits;

            items.push({
                ...meta,
                targetGrade: target,
                improveDelta,
                impactPoints,
            });
        });

        return items.sort((a, b) => {
            if (a.currentGrade !== b.currentGrade) return a.currentGrade - b.currentGrade;
            if (b.impactPoints !== a.impactPoints) return b.impactPoints - a.impactPoints;
            return a.code.localeCompare(b.code);
        });
    }, [manualRetakeTargets, eligibleRetakeMap]);

    /**
     * Tính toán tác động của việc học cải thiện lên GPA toàn khóa.
     * Phép tính Impact Points: (Điểm mới - Điểm cũ) * Số tín chỉ.
     * Tại sao: Đây là chỉ số quan trọng nhất để người dùng quyết định có nên học lại hay không. 
     * Một môn 4 tín chỉ từ 5.0 lên 8.0 có tác động lớn hơn nhiều so với môn 2 tín chỉ từ 8.0 lên 10.
     */
    const manualRetakeImpact = useMemo(() => {
        const totalImpactPoints = manualRetakeItems.reduce((sum, item) => sum + item.impactPoints, 0);
        const avgGpaLift = scopedTotalCredits > 0 ? totalImpactPoints / scopedTotalCredits : 0;
        return {
            totalImpactPoints,
            avgGpaLift,
        };
    }, [manualRetakeItems, scopedTotalCredits]);

    const selectedManualRetakeCodes = useMemo(() => {
        const set = new Set<string>();
        Object.keys(manualRetakeTargets).forEach((code) => {
            const normalized = normalizeCourseCode(code);
            if (normalized) set.add(normalized);
        });
        return set;
    }, [manualRetakeTargets]);

    const selectableRetakeCourses = useMemo(() => {
        return eligibleRetakeCourses.filter((course) => !selectedManualRetakeCodes.has(course.code));
    }, [eligibleRetakeCourses, selectedManualRetakeCodes]);

    const filteredSelectableRetakeCourses = useMemo(() => {
        const keyword = retakeSearchTerm.trim().toLowerCase();
        if (!keyword) return selectableRetakeCourses;
        return selectableRetakeCourses.filter((course) => {
            const code = course.code.toLowerCase();
            const name = (course.nameVi ?? '').toLowerCase();
            return code.includes(keyword) || name.includes(keyword);
        });
    }, [selectableRetakeCourses, retakeSearchTerm]);

    const selectableRetakeCodeSet = useMemo(() => {
        const set = new Set<string>();
        selectableRetakeCourses.forEach((course) => set.add(course.code));
        return set;
    }, [selectableRetakeCourses]);

    useEffect(() => {
        setPendingRetakeCodes((prev) => {
            const next = prev.filter((code) => selectableRetakeCodeSet.has(code));
            return next.length === prev.length ? prev : next;
        });
    }, [selectableRetakeCodeSet]);

    useEffect(() => {
        if (!isRetakePickerOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (retakePickerRef.current && !retakePickerRef.current.contains(target)) {
                setIsRetakePickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isRetakePickerOpen]);

    const pendingRetakeCodeSet = useMemo(() => {
        const set = new Set<string>();
        pendingRetakeCodes.forEach((code) => {
            const normalized = normalizeCourseCode(code);
            if (normalized) set.add(normalized);
        });
        return set;
    }, [pendingRetakeCodes]);

    const pendingRetakeCount = pendingRetakeCodeSet.size;

    const selectedInFilteredCount = useMemo(() => {
        let count = 0;
        filteredSelectableRetakeCourses.forEach((course) => {
            if (pendingRetakeCodeSet.has(course.code)) count += 1;
        });
        return count;
    }, [filteredSelectableRetakeCourses, pendingRetakeCodeSet]);

    const addManualRetake = (rawCode: string) => {
        const code = normalizeCourseCode(rawCode);
        if (!code) return;
        if (!eligibleRetakeMap.has(code)) return;

        setManualRetakeTargets((prev) => {
            if (prev[code] != null) return prev;
            return { ...prev, [code]: 8.0 };
        });

        setPendingRetakeCodes((prev) => prev.filter((pendingCode) => normalizeCourseCode(pendingCode) !== code));
    };

    /**
     * Logic quản lý 'Pending Retakes'.
     * Tại sao: Đây là tính năng UX Batching. Người dùng có thể chọn nhanh nhiều môn 
     * để học lại (Tick chọn) nhưng chưa áp dụng ngay. Điều này giúp họ thử nghiệm 
     * các tổ hợp môn khác nhau trước khi thực sự "chốt" kế hoạch cải thiện.
     */
    const togglePendingRetakeCode = (rawCode: string) => {
        const code = normalizeCourseCode(rawCode);
        if (!code) return;
        if (!selectableRetakeCodeSet.has(code)) return;

        setPendingRetakeCodes((prev) => {
            const exists = prev.some((item) => normalizeCourseCode(item) === code);
            if (exists) {
                return prev.filter((item) => normalizeCourseCode(item) !== code);
            }
            return [...prev, code];
        });
    };

    const addPendingRetakes = () => {
        if (pendingRetakeCodeSet.size === 0) return;
        const orderedPendingCodes = eligibleRetakeCourses
            .filter((course) => pendingRetakeCodeSet.has(course.code))
            .map((course) => course.code);

        orderedPendingCodes.forEach((code) => addManualRetake(code));
        setPendingRetakeCodes([]);
        setRetakeSearchTerm('');
        setIsRetakePickerOpen(false);
    };

    const selectAllFilteredRetakes = () => {
        if (filteredSelectableRetakeCourses.length === 0) return;
        setPendingRetakeCodes((prev) => {
            const normalizedPrev = new Set<string>();
            prev.forEach((code) => {
                const normalized = normalizeCourseCode(code);
                if (normalized && selectableRetakeCodeSet.has(normalized)) {
                    normalizedPrev.add(normalized);
                }
            });

            filteredSelectableRetakeCourses.forEach((course) => normalizedPrev.add(course.code));

            return eligibleRetakeCourses
                .map((course) => course.code)
                .filter((code) => normalizedPrev.has(code));
        });
    };

    const clearPendingFilteredRetakes = () => {
        if (filteredSelectableRetakeCourses.length === 0) return;
        const filteredCodeSet = new Set(filteredSelectableRetakeCourses.map((course) => course.code));
        setPendingRetakeCodes((prev) => prev.filter((code) => !filteredCodeSet.has(normalizeCourseCode(code))));
    };

    const removeManualRetake = (rawCode: string) => {
        const code = normalizeCourseCode(rawCode);
        setManualRetakeTargets((prev) => {
            if (prev[code] == null) return prev;
            const next = { ...prev };
            delete next[code];
            return next;
        });
        setDraftManualRetakeTargets((prev) => {
            if (!prev[code]) return prev;
            const next = { ...prev };
            delete next[code];
            return next;
        });
        setDraftManualRetakeTargetErrors((prev) => {
            if (!prev[code]) return prev;
            const next = { ...prev };
            delete next[code];
            return next;
        });
    };

    const updateManualRetakeTarget = (rawCode: string, rawValue: string) => {
        const code = normalizeCourseCode(rawCode);
        const parsed = parseFloat((rawValue ?? '').replace(',', '.'));
        if (Number.isNaN(parsed)) return;
        const clamped = Math.min(10, Math.max(ACADEMIC_RULES.PASS_GRADE_DECIMAL, parsed));
        const rounded = Math.round(clamped * 100) / 100;

        setManualRetakeTargets((prev) => {
            if (prev[code] == null) return prev;
            return { ...prev, [code]: rounded };
        });
    };

    const validateProjectedGradeText = (raw: string): string | null => {
        const trimmed = (raw ?? '').trim();
        if (trimmed === '') return null;
        const parsed = parseFloat(trimmed.replace(',', '.'));
        if (Number.isNaN(parsed)) return 'Vui lòng nhập số hợp lệ.';
        if (parsed < ACADEMIC_RULES.PASS_GRADE_DECIMAL) return `Điểm không được nhỏ hơn ${ACADEMIC_RULES.PASS_GRADE_DECIMAL.toFixed(pullDecimals)}.`;
        if (parsed > 10) return 'Điểm không được lớn hơn 10.00.';
        return null;
    };

    const handleManualRetakeTargetInputChange = (rawCode: string, rawValue: string) => {
        const code = normalizeCourseCode(rawCode);
        setDraftManualRetakeTargets((prev) => ({ ...prev, [code]: rawValue }));

        const err = validateProjectedGradeText(rawValue);
        setDraftManualRetakeTargetErrors((prev) => {
            if (!err) {
                if (!prev[code]) return prev;
                const next = { ...prev };
                delete next[code];
                return next;
            }
            return { ...prev, [code]: err };
        });
    };

    const commitManualRetakeTargetInput = (rawCode: string, currentTarget: number) => {
        const code = normalizeCourseCode(rawCode);
        const raw = (draftManualRetakeTargets[code] ?? '').trim();

        if (raw === '') {
            setDraftManualRetakeTargets((prev) => {
                const next = { ...prev };
                delete next[code];
                return next;
            });
            setDraftManualRetakeTargetErrors((prev) => {
                if (!prev[code]) return prev;
                const next = { ...prev };
                delete next[code];
                return next;
            });
            return;
        }

        const err = validateProjectedGradeText(raw);
        if (err) {
            setDraftManualRetakeTargetErrors((prev) => ({ ...prev, [code]: err }));
            return;
        }

        const parsed = parseFloat(raw.replace(',', '.'));
        if (!Number.isFinite(parsed)) {
            setDraftManualRetakeTargets((prev) => ({ ...prev, [code]: currentTarget.toFixed(pullDecimals) }));
            return;
        }

        updateManualRetakeTarget(code, String(parsed));
        const rounded = Math.round(Math.min(10, Math.max(ACADEMIC_RULES.PASS_GRADE_DECIMAL, parsed)) * 100) / 100;
        setDraftManualRetakeTargets((prev) => ({ ...prev, [code]: rounded.toFixed(pullDecimals) }));
        setDraftManualRetakeTargetErrors((prev) => {
            if (!prev[code]) return prev;
            const next = { ...prev };
            delete next[code];
            return next;
        });
    };

    const clearAllManualRetakes = () => {
        if (Object.keys(manualRetakeTargets).length === 0) return;
        const confirmed = window.confirm('Bạn có chắc muốn xóa toàn bộ danh sách môn cải thiện trong phiên này?');
        if (!confirmed) return;
        setManualRetakeTargets({});
        setDraftManualRetakeTargets({});
        setDraftManualRetakeTargetErrors({});
        setPendingRetakeCodes([]);
        setRetakeSearchTerm('');
        setIsRetakePickerOpen(false);
    };

    return {
        // State
        targetGPAInput,
        setTargetGPAInput,
        expanded,
        setExpanded,
        mode,
        setMode,
        draftProjectedGrades,
        setDraftProjectedGrades,
        draftProjectedGradeErrors,
        manualRetakeTargets,
        draftManualRetakeTargets,
        draftManualRetakeTargetErrors,
        pendingRetakeCodes,
        retakeSearchTerm,
        setRetakeSearchTerm,
        isRetakePickerOpen,
        setIsRetakePickerOpen,
        retakePickerRef,

        // Computed
        targetGPA,
        targetGpaError,
        isFoundationMajorModeUnavailable,
        isFoundationMajorScopeActive,
        displayCurrentGPA,
        displayAccumulatedCredits,
        scopeLabelSuffix,
        scopeName,
        baseResult,
        nextSemester,
        maxAchievableGpaAtGraduation,
        semesterStats,
        shouldShowRetakeSuggestions,
        retakeSuggestions,
        manualRetakeItems,
        manualRetakeImpact,
        selectableRetakeCourses,
        filteredSelectableRetakeCourses,
        pendingRetakeCodeSet,
        pendingRetakeCount,
        selectedInFilteredCount,

        // Actions
        addManualRetake,
        togglePendingRetakeCode,
        addPendingRetakes,
        selectAllFilteredRetakes,
        clearPendingFilteredRetakes,
        removeManualRetake,
        handleManualRetakeTargetInputChange,
        commitManualRetakeTargetInput,
        clearAllManualRetakes,
        decimals: pullDecimals,
        minTargetGpa
    };
}
