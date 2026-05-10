import { useState, useMemo, useEffect, useRef } from 'react';
import { Calculator, ChevronDown, ChevronUp, TrendingUp, Target, BookOpen } from 'lucide-react';
import { AcademicRulesEngine } from '../../logic/AcademicRulesEngine';
import { redistributeSuggestedGrades, getSemesterWarning } from '../../logic/gpaPullRedistribution';
import { getRetakeSuggestions } from '../../logic/gpaPullRetakeSuggestions';
import { ACADEMIC_RULES, GPA_CONFIG } from '../../config';
import { useDepartmentData } from '../../context/DepartmentContext';
import type { StudentCourseGrade, SimulatorCourseGrade, GPAPullCourse, GPAPullSemester } from '../../types';

const normalizeCourseCode = (code: unknown): string => (code ?? '').toString().trim().toUpperCase();

const isFoundationCategory = (categoryRaw: unknown): boolean => {
    const category = (categoryRaw ?? '').toString().trim().toUpperCase();
    return category === 'FOUNDATION';
};

function calculateRequiredAverageForTargetGPAInScope(
    gradesHistory: StudentCourseGrade[],
    targetGPA: number,
    totalCredits: number,
    scopeLabel: string
): {
    success: boolean;
    remainingCredits?: number;
    requiredAverage?: number;
    currentPoints?: number;
    currentCredits?: number;
    alreadyAchieved?: boolean;
    impossible?: boolean;
    message: string;
} {
    if (totalCredits <= 0) {
        return {
            success: false,
            message: `Không có dữ liệu tín chỉ hợp lệ cho phạm vi ${scopeLabel}.`,
        };
    }

    let currentTotalPoints = 0;
    let currentCredits = 0;

    for (const course of gradesHistory) {
        if (course.status === 'ongoing') continue;
        const result = AcademicRulesEngine.calculateAccumulationParams(
            course.code,
            course.credits,
            course.grade,
            course.status
        );
        currentTotalPoints += result.pointsForGPA;
        currentCredits += result.creditsForGPA;
    }

    const remainingCredits = totalCredits - currentCredits;
    if (remainingCredits <= 0) {
        return {
            success: false,
            message: `Bạn đã đủ hoặc vượt số tín chỉ của phạm vi ${scopeLabel}. Không cần tính thêm.`,
        };
    }

    const totalPointsAtTarget = targetGPA * totalCredits;
    const futurePointsNeeded = totalPointsAtTarget - currentTotalPoints;
    if (futurePointsNeeded <= 0) {
        return {
            success: true,
            alreadyAchieved: true,
            remainingCredits,
            currentPoints: currentTotalPoints,
            currentCredits,
            message: `Bạn đã đạt/vượt mục tiêu GPA ${targetGPA.toFixed(2)} trong phạm vi ${scopeLabel}. Chỉ cần duy trì.`,
        };
    }

    const requiredAverage = futurePointsNeeded / remainingCredits;
    if (requiredAverage > 10) {
        return {
            success: false,
            impossible: true,
            remainingCredits,
            requiredAverage,
            currentPoints: currentTotalPoints,
            currentCredits,
            message: `Để đạt GPA ${targetGPA.toFixed(2)} trong phạm vi ${scopeLabel}, trung bình phần tín chỉ còn lại cần > 10, không khả thi.`,
        };
    }

    return {
        success: true,
        remainingCredits,
        requiredAverage,
        currentPoints: currentTotalPoints,
        currentCredits,
        message: `Trong ${remainingCredits} tín chỉ còn lại của phạm vi ${scopeLabel}, cần đạt trung bình tối thiểu ${requiredAverage.toFixed(2)} điểm để đạt GPA ${targetGPA.toFixed(2)}.`,
    };
}

interface GPAPullToolProps {
    gradesHistory: StudentCourseGrade[];
    getClassification: (gpa: number) => string;
    simulatorCourses: SimulatorCourseGrade[];
    handleGradeChange: (courseCode: string, grade: number | null) => void;
    currentGPA: number;
    accumulatedCredits: number;
    totalCredits: number;
}

interface ManualRetakeCandidate {
    code: string;
    nameVi: string;
    credits: number;
    currentGrade: number;
}

/** Map simulator courses (có tín chỉ) sang GPAPullCourse; suggestedGrade sẽ được tính ở bước redistribute. */
function buildNextSemesterFromSimulator(
    simulatorCourses: SimulatorCourseGrade[],
    requiredAverage: number
): GPAPullSemester | null {
    const coursesWithCredits = simulatorCourses.filter((c): c is SimulatorCourseGrade & { credits: number } => c.credits != null && c.credits > 0);
    if (coursesWithCredits.length === 0) return null;

    const totalCredits = coursesWithCredits.reduce((sum, c) => sum + c.credits!, 0);
    const courses: GPAPullCourse[] = coursesWithCredits.map((c) => ({
        code: c.code,
        name: c.name,
        credits: c.credits!,
        lockedGrade: c.currentGrade ?? null,
        projectedGrade: c.projectedGrade ?? null,
        suggestedGrade: null,
        isLocked: c.currentGrade != null,
        source: c.source,
    }));

    return {
        id: 'next',
        label: 'Học kỳ tiếp theo',
        courses,
        requiredGPA: requiredAverage,
        totalCredits,
        pointsNeeded: requiredAverage * totalCredits,
    };
}

export function GPAPullTool({
    gradesHistory,
    getClassification,
    simulatorCourses,
    handleGradeChange,
    currentGPA,
    accumulatedCredits,
    totalCredits,
}: GPAPullToolProps) {
    const [targetGPAInput, setTargetGPAInput] = useState<string>('');
    const [expanded, setExpanded] = useState(true);
    const [mode, setMode] = useState<'all' | 'foundationMajor'>('all');
    const [draftProjectedGrades, setDraftProjectedGrades] = useState<Record<string, string>>({});
    const [draftProjectedGradeErrors, setDraftProjectedGradeErrors] = useState<Record<string, string>>({});
    const [manualRetakeTargets, setManualRetakeTargets] = useState<Record<string, number>>({});
    const [draftManualRetakeTargets, setDraftManualRetakeTargets] = useState<Record<string, string>>({});
    const [draftManualRetakeTargetErrors, setDraftManualRetakeTargetErrors] = useState<Record<string, string>>({});
    const [pendingRetakeCodes, setPendingRetakeCodes] = useState<string[]>([]);
    const [retakeSearchTerm, setRetakeSearchTerm] = useState<string>('');
    const [isRetakePickerOpen, setIsRetakePickerOpen] = useState<boolean>(false);
    const retakePickerRef = useRef<HTMLDivElement | null>(null);
    const { data: { courses: departmentCourses } } = useDepartmentData();

    const pullDecimals = 2;
    const minTargetGpa = ACADEMIC_RULES.PASS_GRADE_DECIMAL;

    const parsedTargetGpa = useMemo(() => parseFloat(targetGPAInput.replace(',', '.')), [targetGPAInput]);
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

    const isFoundationMajorModeUnavailable = mode === 'foundationMajor' && !hasCategoryDataForSimulator;
    const isFoundationMajorScopeActive = mode === 'foundationMajor' && hasCategoryDataForSimulator;

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

    const baseResult = useMemo(() => {
        if (targetGPA === null) return null;
        return calculateRequiredAverageForTargetGPAInScope(
            scopedGradesHistory,
            targetGPA,
            scopedTotalCredits,
            scopeName
        );
    }, [scopedGradesHistory, targetGPA, scopedTotalCredits, scopeName]);

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
        const raw = buildNextSemesterFromSimulator(filteredSimulator, baseResult.requiredAverage);
        if (!raw) return null;
        const courses = redistributeSuggestedGrades(raw.courses, baseResult.requiredAverage);
        return { ...raw, courses };
    }, [baseResult, simulatorCourses, courseCategoryByCode, isFoundationMajorScopeActive]);

    const semesters = useMemo((): GPAPullSemester[] => {
        const list: GPAPullSemester[] = [];
        if (nextSemester) list.push(nextSemester);
        return list;
    }, [nextSemester]);

    const decimals = pullDecimals;
    const requiredAverageTooLow =
        baseResult?.success &&
        !baseResult.impossible &&
        !baseResult.alreadyAchieved &&
        baseResult.requiredAverage != null &&
        baseResult.requiredAverage < minTargetGpa;

    const maxAchievableGpaAtGraduation = useMemo(() => {
        if (baseResult?.currentPoints == null || baseResult.currentCredits == null) return null;
        const remainingCredits = scopedTotalCredits - baseResult.currentCredits;
        if (remainingCredits <= 0) return null;
        return (baseResult.currentPoints + 10 * remainingCredits) / scopedTotalCredits;
    }, [baseResult, scopedTotalCredits]);

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

        const epsilon = 0.05;

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

    const hiddenManualRetakeCount = useMemo(() => {
        const selectedCodes = Object.keys(manualRetakeTargets).length;
        return Math.max(0, selectedCodes - manualRetakeItems.length);
    }, [manualRetakeTargets, manualRetakeItems]);

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
            setDraftManualRetakeTargets((prev) => ({ ...prev, [code]: currentTarget.toFixed(decimals) }));
            return;
        }

        updateManualRetakeTarget(code, String(parsed));
        const rounded = Math.round(Math.min(10, Math.max(ACADEMIC_RULES.PASS_GRADE_DECIMAL, parsed)) * 100) / 100;
        setDraftManualRetakeTargets((prev) => ({ ...prev, [code]: rounded.toFixed(decimals) }));
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

    const validateProjectedGradeText = (raw: string): string | null => {
        const trimmed = (raw ?? '').trim();
        if (trimmed === '') return null;
        const parsed = parseFloat(trimmed.replace(',', '.'));
        if (Number.isNaN(parsed)) return 'Vui lòng nhập số hợp lệ.';
        if (parsed < ACADEMIC_RULES.PASS_GRADE_DECIMAL) return `Điểm không được nhỏ hơn ${ACADEMIC_RULES.PASS_GRADE_DECIMAL.toFixed(decimals)}.`;
        if (parsed > 10) return 'Điểm không được lớn hơn 10.00.';
        return null;
    };

    const isFiniteGrade = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Calculator className="w-8 h-8 text-[#004A98]" />
                    <h3 className="text-sm font-semibold text-gray-800">Công cụ &quot;Kéo&quot; GPA</h3>
                    <span className="text-xs text-gray-500 hidden sm:inline">
                        Nhập GPA mong muốn lúc ra trường → điểm TB tối thiểu + đề xuất từng môn
                    </span>
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
            </button>

            {expanded && (
                <div className="px-6 py-5 border-t border-gray-100 space-y-5">
                    <div className="flex flex-col gap-3">
                        <p className="text-base leading-relaxed text-gray-700 max-w-3xl">
                            Nhập GPA mong muốn lúc tốt nghiệp, hệ thống sẽ ước tính điểm trung bình cần đạt và gợi ý điểm từng môn cho các học kỳ còn lại.
                        </p>

                        <div className="flex items-start gap-3 flex-wrap">
                            <label htmlFor="gpa-pull-target" className="mt-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                                GPA mục tiêu
                            </label>
                            <div>
                                <input
                                    id="gpa-pull-target"
                                    type="number"
                                    min={minTargetGpa}
                                    max={ACADEMIC_RULES.MAX_GPA}
                                    step={0.1}
                                    value={targetGPAInput}
                                    onChange={(e) => setTargetGPAInput(e.target.value)}
                                    placeholder="VD: 8.0"
                                    aria-label="GPA mong muốn lúc ra trường"
                                    className={`w-28 sm:w-32 px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${targetGpaError
                                        ? 'border-red-300 focus:ring-red-300'
                                        : 'border-gray-200 focus:ring-[#004A98]'
                                        }`}
                                />
                                <div className="min-h-[1.25rem] mt-1">
                                    {targetGpaError && (
                                        <p className="text-sm text-red-600" role="alert" aria-live="polite">
                                            {targetGpaError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3 flex-wrap items-center">
                        {GPA_CONFIG.slice(0, 4).map((config) => (
                            <button
                                key={config.value}
                                type="button"
                                onClick={() => setTargetGPAInput(String(config.value))}
                                className="px-5 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-[#004A98] hover:text-white hover:border-[#004A98] transition-colors"
                            >
                                {config.lable} ({config.value})
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-medium text-gray-700">Phạm vi gợi ý</span>
                            <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setMode('all')}
                                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors ${mode === 'all'
                                        ? 'bg-[#004A98] text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Tất cả môn
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('foundationMajor')}
                                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors ${mode === 'foundationMajor'
                                        ? 'bg-[#004A98] text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Cơ sở ngành
                                </button>
                            </div>
                        </div>
                        {isFoundationMajorScopeActive && (
                            <p className="text-xs text-blue-700">
                                Đang tính toán GPA và mục tiêu theo nhóm môn Cơ sở ngành.
                            </p>
                        )}
                        {isFoundationMajorModeUnavailable && (
                            <p className="text-xs text-amber-700">
                                CTĐT hiện tại chưa có môn thuộc nhóm Cơ sở ngành trong danh sách gợi ý, hệ thống tạm hiển thị theo tất cả môn.
                            </p>
                        )}
                    </div>

                    {/* Kết quả tổng + GPA tổng / GPA theo kỳ */}
                    {baseResult && (
                        <>
                            <div
                                className={`rounded-lg border p-4 ${baseResult.success && !baseResult.impossible && !baseResult.alreadyAchieved
                                    ? 'bg-blue-50 border-blue-200'
                                    : baseResult.alreadyAchieved
                                        ? 'bg-green-50 border-green-200'
                                        : baseResult.impossible
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <p className={`text-sm font-medium mb-1 ${baseResult.impossible ? 'text-red-800' : 'text-gray-800'}`}>{baseResult.message}</p>
                                {baseResult.remainingCredits != null && (
                                    <p className="text-xs text-gray-600">
                                        Tín chỉ còn lại: <span className="font-semibold">{baseResult.remainingCredits}</span> / {scopedTotalCredits}
                                    </p>
                                )}
                                {baseResult.requiredAverage != null && !baseResult.impossible && (
                                    <p className="text-sm mt-2 text-[#004A98] font-semibold">
                                        → Trung bình tối thiểu cần đạt: {baseResult.requiredAverage.toFixed(decimals)} điểm
                                        {targetGPA != null && (
                                            <span className="text-gray-600 font-normal ml-1">
                                                (xếp loại: {getClassification(baseResult.requiredAverage)})
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* GPA tổng + GPA theo kỳ (chỉ khi có kết quả hợp lệ) */}
                            {baseResult.success && !baseResult.impossible && baseResult.requiredAverage != null && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-2">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <TrendingUp className="w-8 h-8 text-[#004A98] flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-600">GPA hiện tại{scopeLabelSuffix}</p>
                                            <p className="text-lg font-bold text-[#004A98]">{displayCurrentGPA.toFixed(decimals)}<span className="text-xs text-gray-500">/10</span></p>
                                            <p className="text-xs text-gray-500">{displayAccumulatedCredits} / {scopedTotalCredits} TC</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <Target className="w-8 h-8 text-[#004A98] flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-600">GPA mục tiêu{scopeLabelSuffix}</p>
                                            <p className="text-lg font-bold text-[#004A98]">{targetGPA!.toFixed(decimals)}<span className="text-xs text-gray-500">/10</span></p>
                                            {baseResult.remainingCredits != null && (
                                                <p className="text-xs text-gray-500">Còn {baseResult.remainingCredits} TC</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                        <BookOpen className="w-8 h-8 text-[#004A98] flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-600">GPA theo kỳ (mốc tham chiếu){scopeLabelSuffix}</p>
                                            <p className="text-lg font-bold text-[#004A98]">{baseResult.requiredAverage.toFixed(decimals)}<span className="text-xs text-gray-500">/10</span></p>
                                            <p className="text-xs text-gray-500">
                                                Mốc TB cho phần tín chỉ còn lại: ≥ {baseResult.requiredAverage.toFixed(decimals)}
                                                {requiredAverageTooLow && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                                        &lt; {minTargetGpa.toFixed(decimals)}
                                                    </span>
                                                )}
                                            </p>
                                            {requiredAverageTooLow && (
                                                <p className="text-xs text-amber-700 mt-1">
                                                    Đây là mốc tham chiếu do bạn đặt mục tiêu thấp; thực tế mỗi môn vẫn cần đạt tối thiểu {minTargetGpa.toFixed(decimals)} để qua môn.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {semesterStats && semesterStats.trend === 'ahead' && semesterStats.newRequiredAvgAfter != null && (
                                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                                    <p className="text-base font-semibold text-green-800">
                                        Nếu GPA kỳ này khoảng {semesterStats.semesterGpa.toFixed(decimals)} điểm thì các kỳ còn lại chỉ cần trung bình khoảng {semesterStats.newRequiredAvgAfter.toFixed(decimals)} điểm là đủ để đạt GPA mục tiêu.
                                    </p>
                                </div>
                            )}

                            {semesterStats && semesterStats.trend === 'behind' && semesterStats.newRequiredAvgAfter != null && (
                                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                                    <p className="text-base font-semibold text-amber-800">
                                        Nếu GPA kỳ này khoảng {semesterStats.semesterGpa.toFixed(decimals)} điểm thì các kỳ sau cần trung bình khoảng {semesterStats.newRequiredAvgAfter.toFixed(decimals)} điểm để kịp GPA mục tiêu lúc ra trường.
                                    </p>
                                </div>
                            )}

                            {/* Danh sách kỳ: học kỳ tiếp theo */}
                            {semesters.length > 0 ? (
                                semesters.map((semester) => {
                                    const onGradeChange = handleGradeChange;
                                    const warning = getSemesterWarning(semester.courses, semester.requiredGPA);
                                    return (
                                        <div key={semester.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-800">
                                                    {semester.label}
                                                </h4>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    GPA cần đạt: <span className="font-medium text-[#004A98]">{semester.requiredGPA.toFixed(decimals)}</span>
                                                    {' · '}Tổng {semester.totalCredits} TC · Tổng điểm cần: {semester.pointsNeeded.toFixed(2)}
                                                    {' · '}<span className="text-gray-500">Điểm đề xuất (hệ thống) và điểm dự kiến (bạn nhập): 5–10</span>
                                                </p>
                                            </div>
                                            {warning && (
                                                <div className="px-4 py-3 bg-red-50 border-b border-red-200" role="alert" aria-live="polite">
                                                    <p className="text-sm text-red-800">{warning}</p>
                                                </div>
                                            )}
                                            {semester.courses.length === 0 ? (
                                                <p className="px-4 py-4 text-sm text-gray-500">Chưa có môn trong kỳ này.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50 border-b border-gray-200">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Mã môn</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tên môn</th>
                                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">TC</th>
                                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Điểm đề xuất</th>
                                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Điểm dự kiến</th>
                                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Xếp loại</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {semester.courses.map((course) => {
                                                                const suggestedGrade = isFiniteGrade(course.suggestedGrade) ? course.suggestedGrade : null;
                                                                const projectedGrade = isFiniteGrade(course.projectedGrade) ? course.projectedGrade : null;
                                                                const lockedGrade = isFiniteGrade(course.lockedGrade) ? course.lockedGrade : null;
                                                                const classificationGrade = course.isLocked ? lockedGrade : projectedGrade;
                                                                return (
                                                                    <tr key={course.code} className="hover:bg-gray-50/50">
                                                                        <td className="px-4 py-2 font-medium text-gray-900">{course.code}</td>
                                                                        <td className="px-4 py-2 text-gray-700">{course.name}</td>
                                                                        <td className="px-4 py-2 text-center">{course.credits}</td>
                                                                        <td className="px-4 py-2 text-center text-[#004A98] font-medium">
                                                                            {suggestedGrade != null ? suggestedGrade.toFixed(decimals) : '—'}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            {course.isLocked ? (
                                                                                <span className="font-medium text-gray-700">{lockedGrade != null ? lockedGrade.toFixed(decimals) : '—'}</span>
                                                                            ) : (
                                                                                <div className="inline-flex flex-col items-center">
                                                                                    <input
                                                                                        type="text"
                                                                                        min={ACADEMIC_RULES.PASS_GRADE_DECIMAL}
                                                                                        max={10}
                                                                                        step={0.1}
                                                                                        inputMode="decimal"
                                                                                        value={draftProjectedGrades[course.code] ?? (projectedGrade != null ? projectedGrade.toFixed(decimals) : '')}
                                                                                        placeholder={suggestedGrade != null ? String(suggestedGrade.toFixed(decimals)) : ''}
                                                                                        title="Điểm từ 5–10 (dưới 5 phải học lại)"
                                                                                        aria-label={`Điểm dự kiến môn ${course.code}`}
                                                                                        aria-invalid={Boolean(draftProjectedGradeErrors[course.code])}
                                                                                        onChange={(e) => {
                                                                                            const val = e.target.value;
                                                                                            setDraftProjectedGrades((prev) => ({ ...prev, [course.code]: val }));
                                                                                            const err = validateProjectedGradeText(val);
                                                                                            setDraftProjectedGradeErrors((prev) => {
                                                                                                if (!err) {
                                                                                                    if (!prev[course.code]) return prev;
                                                                                                    const next = { ...prev };
                                                                                                    delete next[course.code];
                                                                                                    return next;
                                                                                                }
                                                                                                return { ...prev, [course.code]: err };
                                                                                            });
                                                                                        }}
                                                                                        onBlur={(e) => {
                                                                                            const raw = (e.target.value ?? '').trim();
                                                                                            if (raw === '') {
                                                                                                onGradeChange(course.code, null);
                                                                                                setDraftProjectedGrades((prev) => {
                                                                                                    const next = { ...prev };
                                                                                                    delete next[course.code];
                                                                                                    return next;
                                                                                                });
                                                                                                setDraftProjectedGradeErrors((prev) => {
                                                                                                    if (!prev[course.code]) return prev;
                                                                                                    const next = { ...prev };
                                                                                                    delete next[course.code];
                                                                                                    return next;
                                                                                                });
                                                                                                return;
                                                                                            }

                                                                                            const err = validateProjectedGradeText(raw);
                                                                                            if (err) {
                                                                                                setDraftProjectedGradeErrors((prev) => ({ ...prev, [course.code]: err }));
                                                                                                return;
                                                                                            }

                                                                                            const parsed = parseFloat(raw.replace(',', '.'));
                                                                                            const rounded = Math.round(parsed * 100) / 100;
                                                                                            onGradeChange(course.code, rounded);
                                                                                            setDraftProjectedGrades((prev) => ({ ...prev, [course.code]: rounded.toFixed(decimals) }));
                                                                                            setDraftProjectedGradeErrors((prev) => {
                                                                                                if (!prev[course.code]) return prev;
                                                                                                const next = { ...prev };
                                                                                                delete next[course.code];
                                                                                                return next;
                                                                                            });
                                                                                        }}
                                                                                        className={`w-16 px-2 py-1 bg-gray-100 border rounded text-center text-sm focus:outline-none focus:ring-2 ${draftProjectedGradeErrors[course.code]
                                                                                            ? 'border-red-300 focus:ring-red-300'
                                                                                            : 'border-gray-200 focus:ring-[#004A98]'
                                                                                            }`}
                                                                                    />
                                                                                    <div className="min-h-[1rem] mt-1">
                                                                                        {draftProjectedGradeErrors[course.code] && (
                                                                                            <p className="text-[10px] leading-4 text-red-600" role="alert" aria-live="polite">
                                                                                                {draftProjectedGradeErrors[course.code]}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            {classificationGrade != null ? (
                                                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${classificationGrade >= 9 ? 'bg-green-100 text-green-700' :
                                                                                    classificationGrade >= 8 ? 'bg-blue-100 text-blue-700' :
                                                                                        classificationGrade >= 7 ? 'bg-yellow-100 text-yellow-700' :
                                                                                            'bg-gray-100 text-gray-700'
                                                                                    }`}>
                                                                                    {getClassification(classificationGrade)}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-gray-400">—</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : baseResult.success && !baseResult.impossible && baseResult.requiredAverage != null && (
                                <p className="text-sm text-gray-500">Chưa có môn nào trong học kỳ tiếp theo. Import dữ liệu từ portal (điểm + ĐKHP) hoặc chọn đúng CTĐT để xem đề xuất.</p>
                            )}

                            <div className="border border-gray-200 rounded-lg overflow-visible">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-800">Môn muốn học cải thiện</h4>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Chọn từ các môn đã có điểm để mô phỏng kế hoạch cải thiện GPA. Điểm mục tiêu mặc định là 8.0 và có thể chỉnh theo từng môn.
                                    </p>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-700">Chọn môn học</label>
                                        <div className="relative" ref={retakePickerRef}>
                                            <button
                                                type="button"
                                                onClick={() => setIsRetakePickerOpen((prev) => !prev)}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-left text-gray-700 flex items-center justify-between hover:border-[#004A98] focus:outline-none focus:ring-2 focus:ring-[#004A98]"
                                            >
                                                <span>
                                                    {pendingRetakeCount > 0
                                                        ? `Đã chọn ${pendingRetakeCount} môn (bấm để chỉnh)`
                                                        : 'Bấm để chọn môn học cải thiện'}
                                                </span>
                                                {isRetakePickerOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                            </button>

                                            {isRetakePickerOpen && (
                                                <div className="absolute z-20 bottom-full mb-2 left-0 right-0 rounded-lg border border-gray-200 bg-white shadow-lg p-3 space-y-2">
                                                    <input
                                                        id="manual-retake-search"
                                                        type="text"
                                                        value={retakeSearchTerm}
                                                        onChange={(e) => setRetakeSearchTerm(e.target.value)}
                                                        placeholder="Nhập mã hoặc tên môn để tìm..."
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98]"
                                                    />

                                                    <div className="h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
                                                        {filteredSelectableRetakeCourses.length > 0 ? (
                                                            filteredSelectableRetakeCourses.map((course) => {
                                                                const isChecked = pendingRetakeCodeSet.has(course.code);
                                                                return (
                                                                    <label
                                                                        key={course.code}
                                                                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => togglePendingRetakeCode(course.code)}
                                                                            className="w-4 h-4 text-[#004A98] rounded border-gray-300 focus:ring-[#004A98]"
                                                                        />
                                                                        <span className="text-sm text-gray-700">
                                                                            <span className="font-medium text-gray-900">{course.code}</span>
                                                                            {' - '}
                                                                            {course.nameVi}
                                                                            {' '}
                                                                            <span className="text-gray-500">({course.currentGrade.toFixed(decimals)} → mục tiêu)</span>
                                                                        </span>
                                                                    </label>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                                {retakeSearchTerm.trim() !== ''
                                                                    ? 'Không tìm thấy môn phù hợp với từ khóa hiện tại.'
                                                                    : 'Không còn môn hợp lệ để chọn thêm trong phạm vi hiện tại.'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={selectAllFilteredRetakes}
                                                            disabled={filteredSelectableRetakeCourses.length === 0 || selectedInFilteredCount === filteredSelectableRetakeCourses.length}
                                                            className="px-2.5 py-1 text-xs font-medium rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Chọn tất cả kết quả lọc
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={clearPendingFilteredRetakes}
                                                            disabled={selectedInFilteredCount === 0}
                                                            className="px-2.5 py-1 text-xs font-medium rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Bỏ chọn tất cả kết quả lọc
                                                        </button>
                                                        <span className="text-xs text-gray-500">
                                                            Đã chọn trong danh sách lọc: {selectedInFilteredCount}/{filteredSelectableRetakeCourses.length}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500">
                                            Đã chọn {pendingRetakeCount} môn chờ thêm.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={addPendingRetakes}
                                            disabled={pendingRetakeCount === 0}
                                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-[#004A98] hover:text-white hover:border-[#004A98] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Thêm môn cải thiện
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearAllManualRetakes}
                                            disabled={Object.keys(manualRetakeTargets).length === 0}
                                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Xóa tất cả
                                        </button>
                                    </div>

                                    {manualRetakeItems.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-white border-y border-gray-200">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Mã môn</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tên môn</th>
                                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase">TC</th>
                                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase">Điểm hiện tại</th>
                                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase">Điểm mục tiêu</th>
                                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase">Tác động điểm</th>
                                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase">Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {manualRetakeItems.map((item) => (
                                                        <tr key={item.code} className="hover:bg-gray-50/50">
                                                            <td className="px-3 py-2 font-medium text-gray-900">{item.code}</td>
                                                            <td className="px-3 py-2 text-gray-700">{item.nameVi}</td>
                                                            <td className="px-3 py-2 text-center">{item.credits}</td>
                                                            <td className="px-3 py-2 text-center">{item.currentGrade.toFixed(decimals)}</td>
                                                            <td className="px-3 py-2 text-center">
                                                                <div className="inline-flex flex-col items-center">
                                                                    <input
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        value={draftManualRetakeTargets[item.code] ?? item.targetGrade.toFixed(decimals)}
                                                                        onChange={(e) => handleManualRetakeTargetInputChange(item.code, e.target.value)}
                                                                        onBlur={() => commitManualRetakeTargetInput(item.code, item.targetGrade)}
                                                                        aria-invalid={Boolean(draftManualRetakeTargetErrors[item.code])}
                                                                        title={`Điểm từ ${ACADEMIC_RULES.PASS_GRADE_DECIMAL.toFixed(decimals)}–10.00`}
                                                                        className={`w-20 px-2 py-1 bg-gray-100 border rounded text-center text-sm focus:outline-none focus:ring-2 ${draftManualRetakeTargetErrors[item.code]
                                                                            ? 'border-red-300 focus:ring-red-300'
                                                                            : 'border-gray-200 focus:ring-[#004A98]'
                                                                            }`}
                                                                    />
                                                                    <div className="min-h-[1rem] mt-1">
                                                                        {draftManualRetakeTargetErrors[item.code] && (
                                                                            <p className="text-[10px] leading-4 text-red-600" role="alert" aria-live="polite">
                                                                                {draftManualRetakeTargetErrors[item.code]}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2 text-center text-[#004A98] font-medium">
                                                                {item.impactPoints > 0 ? `+${item.impactPoints.toFixed(decimals)}` : '0.00'}
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeManualRetake(item.code)}
                                                                    className="px-2.5 py-1 text-xs font-medium rounded border border-gray-200 text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            {eligibleRetakeCourses.length > 0
                                                ? 'Chưa chọn môn cải thiện nào trong phiên làm việc này.'
                                                : 'Không có môn hợp lệ để thêm cải thiện trong phạm vi hiện tại.'}
                                        </p>
                                    )}

                                    {hiddenManualRetakeCount > 0 && (
                                        <p className="text-xs text-amber-700">
                                            Có {hiddenManualRetakeCount} môn đang chọn nhưng không thuộc phạm vi hiển thị hiện tại. Chuyển về &quot;Tất cả môn&quot; để xem đầy đủ.
                                        </p>
                                    )}

                                    {manualRetakeItems.length > 0 && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
                                            Tổng tiềm năng cải thiện (quy đổi điểm*tín chỉ): <span className="font-semibold">+{manualRetakeImpact.totalImpactPoints.toFixed(decimals)}</span>
                                            {' · '}Ước tính kéo GPA phạm vi hiện tại: <span className="font-semibold">+{manualRetakeImpact.avgGpaLift.toFixed(decimals)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {shouldShowRetakeSuggestions && retakeSuggestions.length > 0 && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-800">Gợi ý học cải thiện để kéo GPA</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            Ưu tiên môn điểm thấp, nhiều tín chỉ và còn tiềm năng tăng đáng kể.
                                        </p>
                                        {maxAchievableGpaAtGraduation != null && targetGPA != null && targetGPA > maxAchievableGpaAtGraduation && (
                                            <p className="text-xs text-amber-700 mt-1">
                                                Dù các môn còn lại đều đạt 10, GPA tốt nghiệp tối đa ước tính chỉ khoảng <span className="font-medium">{maxAchievableGpaAtGraduation.toFixed(decimals)}</span>.
                                            </p>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-white border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Mã môn</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tên môn</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">TC</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Điểm hiện tại</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Tiềm năng tăng</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {retakeSuggestions.map((s) => (
                                                    <tr key={s.code} className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-2 font-medium text-gray-900">{s.code}</td>
                                                        <td className="px-4 py-2 text-gray-700">{s.nameVi}</td>
                                                        <td className="px-4 py-2 text-center">{s.credits}</td>
                                                        <td className="px-4 py-2 text-center text-gray-700">{s.currentGrade.toFixed(decimals)}</td>
                                                        <td className="px-4 py-2 text-center text-[#004A98] font-medium">+{s.potentialImprove.toFixed(decimals)}</td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => addManualRetake(s.code)}
                                                                disabled={selectedManualRetakeCodes.has(normalizeCourseCode(s.code)) || !eligibleRetakeMap.has(normalizeCourseCode(s.code))}
                                                                className="px-2.5 py-1 text-xs font-medium rounded border border-gray-200 text-gray-700 hover:bg-[#004A98] hover:text-white hover:border-[#004A98] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                {selectedManualRetakeCodes.has(normalizeCourseCode(s.code)) ? 'Đã thêm' : 'Thêm'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
