import { Calculator, MoreVertical, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { MobileCourseSheetFrame } from '../../../../components/course';
import { STORAGE_KEYS } from '../../../../config';
import { readPlain, savePlain } from '../../../../helpers/localStorage/save';
import type { GPAPullCourse, GPAPullSemesterTableProps } from '../../types';

interface GradeComponent {
    id: string;
    name: string;
    weight: string;
    score: string;
    children?: GradeComponent[];
}

type ComponentGradeMode = 'prediction' | 'target';

const COURSE_GRADE_DECIMALS = 1;

function getCourseStorageKey(course: GPAPullCourse): string {
    return course.attemptKey ?? course.id;
}

function roundCourseGrade(grade: number): number {
    return Math.round(grade * 10) / 10;
}

interface PersistedComponentGradePlans {
    predictionPlans: Record<string, GradeComponent[]>;
    targetPlans: Record<string, GradeComponent[]>;
}

interface ComponentGradeSummary {
    totalWeight: number;
    knownWeight: number;
    missingWeight: number;
    weightedScoreTotal: number;
    predictedGrade: number | null;
    suggestedScore: number | null;
    hasInvalidWeight: boolean;
    hasInvalidScore: boolean;
    leafWeights: Record<string, number>;
}

const EMPTY_COMPONENT_GRADE_PLANS: PersistedComponentGradePlans = {
    predictionPlans: {},
    targetPlans: {},
};

function readComponentGradePlans(): PersistedComponentGradePlans {
    const saved = readPlain<Partial<PersistedComponentGradePlans> & {
        componentPlans?: Record<string, GradeComponent[]>;
    }>(STORAGE_KEYS.GPA_COMPONENT_GRADES, EMPTY_COMPONENT_GRADE_PLANS);
    const legacyPlans = typeof saved.componentPlans === 'object' && saved.componentPlans !== null
        ? saved.componentPlans
        : {};
    const predictionPlans = typeof saved.predictionPlans === 'object' && saved.predictionPlans !== null
        ? saved.predictionPlans
        : legacyPlans;
    const targetPlans = typeof saved.targetPlans === 'object' && saved.targetPlans !== null
        ? saved.targetPlans
        : {};

    return {
        predictionPlans,
        targetPlans,
    };
}

function getComponentGradeSummary(components: GradeComponent[], targetGrade: string): ComponentGradeSummary {
    let totalWeight = 0;
    let knownWeight = 0;
    let missingWeight = 0;
    let weightedScoreTotal = 0;
    let hasInvalidWeight = false;
    let hasInvalidScore = false;
    const leafWeights: Record<string, number> = {};

    const collectLeaves = (nodes: GradeComponent[], parentWeight: number) => {
        nodes.forEach((node) => {
            const percentage = Number(node.weight);
            if (!Number.isFinite(percentage) || percentage < 0) {
                hasInvalidWeight = true;
                return;
            }

            const weight = parentWeight * percentage / 100;
            if (node.children?.length) {
                collectLeaves(node.children, weight);
                return;
            }

            leafWeights[node.id] = weight;
            totalWeight += weight;
            if (node.score.trim() === '') {
                missingWeight += weight;
                return;
            }

            const score = Number(node.score);
            if (!Number.isFinite(score) || score < 0 || score > 10) {
                hasInvalidScore = true;
                return;
            }

            knownWeight += weight;
            weightedScoreTotal += score * weight;
        });
    };

    collectLeaves(components, 100);

    const target = Number(targetGrade);
    const predictedGrade = !hasInvalidWeight && !hasInvalidScore && knownWeight > 0
        ? Math.min(10, weightedScoreTotal / 100)
        : null;
    const suggestedScore = targetGrade.trim() !== '' && Number.isFinite(target) && missingWeight > 0
        ? (target * 100 - weightedScoreTotal) / missingWeight
        : null;

    return {
        totalWeight,
        knownWeight,
        missingWeight,
        weightedScoreTotal,
        predictedGrade,
        suggestedScore,
        hasInvalidWeight,
        hasInvalidScore,
        leafWeights,
    };
}

function mapComponentTree(
    components: GradeComponent[],
    id: string,
    update: (component: GradeComponent) => GradeComponent,
): GradeComponent[] {
    return components.map((component) => {
        if (component.id === id) return update(component);
        if (!component.children?.length) return component;
        return { ...component, children: mapComponentTree(component.children, id, update) };
    });
}

function removeComponentFromTree(components: GradeComponent[], id: string): GradeComponent[] {
    return components
        .filter((component) => component.id !== id)
        .map((component) => component.children?.length
            ? { ...component, children: removeComponentFromTree(component.children, id) }
            : component);
}

function getComponentRows(components: GradeComponent[], depth = 0): Array<{ component: GradeComponent; depth: number }> {
    return components.flatMap((component) => [
        { component, depth },
        ...(component.children?.length ? getComponentRows(component.children, depth + 1) : []),
    ]);
}

export function GPAPullSemesterTable({
    nextSemester,
    planningIntent,
    isGuidanceActive,
    onGradeChange,
    onResetGradeOverrides,
}: GPAPullSemesterTableProps) {
    const plannerMode: ComponentGradeMode = planningIntent === 'goal' ? 'target' : 'prediction';
    const persistedPlans = useMemo(() => readComponentGradePlans(), []);
    const [openCourseCode, setOpenCourseCode] = useState<string | null>(null);
    const [mobileOpenCourseCode, setMobileOpenCourseCode] = useState<string | null>(null);
    const [predictionPlans, setPredictionPlans] = useState<Record<string, GradeComponent[]>>(persistedPlans.predictionPlans);
    const [targetPlans, setTargetPlans] = useState<Record<string, GradeComponent[]>>(persistedPlans.targetPlans);

    useEffect(() => {
        savePlain(STORAGE_KEYS.GPA_COMPONENT_GRADES, { predictionPlans, targetPlans });
    }, [predictionPlans, targetPlans]);

    const getComponentPlan = (course: GPAPullCourse): GradeComponent[] => {
        const plans = plannerMode === 'prediction' ? predictionPlans : targetPlans;
        const courseKey = getCourseStorageKey(course);
        return plans[courseKey] ?? plans[course.code] ?? [
            { id: `${courseKey}-midterm`, name: 'Giữa kỳ', weight: '30', score: '' },
            { id: `${courseKey}-final`, name: 'Cuối kỳ', weight: '70', score: '' },
        ];
    };

    const updateComponents = (course: GPAPullCourse, nextComponents: GradeComponent[]) => {
        const courseKey = getCourseStorageKey(course);
        const update = (current: Record<string, GradeComponent[]>) => ({
            ...current,
            [courseKey]: nextComponents,
        });
        if (plannerMode === 'prediction') {
            setPredictionPlans(update);
        } else {
            setTargetPlans(update);
        }
    };

    const getActiveGrade = (course: GPAPullCourse) => {
        if (course.isLocked && course.lockedGrade != null) return roundCourseGrade(course.lockedGrade);
        const grade = course.projectedGrade;
        return grade == null ? null : roundCourseGrade(grade);
    };

    const updateCourseGradeFromInput = (course: GPAPullCourse, value: string) => {
        if (course.isLocked) return;
        const courseKey = getCourseStorageKey(course);
        if (value === '') {
            onGradeChange(courseKey, null);
            return;
        }

        const grade = Number(value);
        if (!Number.isFinite(grade)) return;
        const nextGrade = Math.max(0, Math.min(10, roundCourseGrade(grade)));
        onGradeChange(courseKey, nextGrade);
    };

    const updateCourseGradeFromComponents = (course: GPAPullCourse, grade: number | null) => {
        if (plannerMode !== 'prediction' || course.isLocked) return;
        onGradeChange(getCourseStorageKey(course), grade);
    };

    const hasManualGrades = nextSemester.courses.some((course) => {
        return !course.isLocked && getActiveGrade(course) !== null;
    });

    const resetManualGrades = () => {
        onResetGradeOverrides();
    };

    const mobileOpenCourse = nextSemester.courses.find(
        (course) => getCourseStorageKey(course) === mobileOpenCourseCode,
    ) ?? null;

    return (
        <div className="overflow-hidden bg-white">
            <div className="md:hidden">
                <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700">{nextSemester.label}</p>
                        <p className="mt-0.5 text-[10px] text-gray-500">{planningIntent === 'goal' && isGuidanceActive ? 'Sửa một môn để tính lại các môn còn lại.' : 'Nhập điểm dự kiến cho từng môn.'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {isGuidanceActive && hasManualGrades && (
                            <button type="button" onClick={resetManualGrades} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-[#004A98]" aria-label="Đặt lại gợi ý" title="Đặt lại gợi ý">
                                <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <p className="text-xs font-semibold tabular-nums text-[#004A98]">{nextSemester.totalCredits} TC</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-100">
                    {nextSemester.courses.map((course) => {
                        const activeGrade = getActiveGrade(course);

                        return (
                            <div key={course.id} className="px-4 py-3">
                                <div className="grid grid-cols-[minmax(0,1fr)_64px_36px] items-center gap-2">
                                    <div className="min-w-0">
                                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-gray-800">{course.name}</p>
                                        <p className="mt-0.5 font-mono text-[10px] uppercase text-gray-500">{course.code}</p>
                                    </div>
                                    <div className="min-w-0 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={activeGrade ?? (isGuidanceActive && course.suggestedGrade != null ? course.suggestedGrade.toFixed(COURSE_GRADE_DECIMALS) : '')}
                                            placeholder="-"
                                            onChange={(event) => updateCourseGradeFromInput(course, event.target.value)}
                                            disabled={course.isLocked}
                                            className={`w-16 rounded-lg border px-2 py-2 text-center text-sm font-semibold tabular-nums outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20 disabled:cursor-not-allowed ${course.isLocked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : isGuidanceActive && activeGrade === null ? 'border-blue-200 bg-[#F4F8FF] text-[#004A98]' : 'border-gray-200 bg-white text-gray-900'}`}
                                            aria-label={`Điểm dự kiến ${course.name}`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpenCourseCode(getCourseStorageKey(course))}
                                        disabled={course.isLocked}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#004A98] disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                                        title={course.isLocked ? 'Môn đã có điểm chính thức' : 'Nhập điểm thành phần'}
                                        aria-label={`Nhập điểm thành phần cho ${course.name}`}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
                    <colgroup>
                        <col className="w-auto" />
                        <col className="w-16" />
                        <col className="w-40" />
                        <col className="w-36" />
                        <col className="w-14" />
                    </colgroup>
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500">Môn học</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">TC</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Trạng thái</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">{isGuidanceActive ? 'Điểm gợi ý' : 'Điểm dự kiến'}</th>
                            <th className="w-12 px-3 py-3 text-center text-xs font-semibold text-gray-500">Tùy chọn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {nextSemester.courses.map((course) => {
                            const activeGrade = getActiveGrade(course);
                            const targetGrade = activeGrade ?? (isGuidanceActive ? course.suggestedGrade : null);
                            const courseKey = getCourseStorageKey(course);
                            const isComponentPanelOpen = openCourseCode === courseKey;

                            return (
                                <Fragment key={course.id}>
                                    <tr className="transition-colors hover:bg-gray-50/50">
                                        <td className="px-4 py-3">
                                            <p className="mb-0.5 line-clamp-1 text-sm font-semibold leading-tight text-gray-800">{course.name}</p>
                                            <p className="font-mono text-[11px] uppercase text-gray-500">{course.code}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-medium text-gray-600">{course.credits}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs font-semibold ${isGuidanceActive && activeGrade === null ? 'text-[#004A98]' : 'text-gray-600'}`}>
                                                {course.isLocked
                                                    ? 'Điểm chính thức'
                                                    : isGuidanceActive
                                                        ? (activeGrade === null ? 'Gợi ý' : 'Đã sửa')
                                                        : (activeGrade === null ? 'Chưa nhập' : 'Dự kiến')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={activeGrade ?? (isGuidanceActive && course.suggestedGrade != null ? course.suggestedGrade.toFixed(COURSE_GRADE_DECIMALS) : '')}
                                                    placeholder="-"
                                                    onChange={(event) => updateCourseGradeFromInput(course, event.target.value)}
                                                    disabled={course.isLocked}
                                                    className={`w-16 rounded-lg border px-2 py-1.5 text-center text-sm font-semibold tabular-nums outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20 disabled:cursor-not-allowed ${course.isLocked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : isGuidanceActive && activeGrade === null ? 'border-blue-200 bg-[#F4F8FF] text-[#004A98]' : 'border-gray-200 bg-white text-gray-900'}`}
                                                    aria-label={`Điểm dự kiến ${course.name}`}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setOpenCourseCode((current) => current === courseKey ? null : courseKey)}
                                                disabled={course.isLocked}
                                                className="inline-flex h-8 w-8 items-center justify-center text-gray-500 disabled:cursor-not-allowed disabled:text-gray-300"
                                                title={course.isLocked ? 'Môn đã có điểm chính thức' : 'Nhập điểm thành phần'}
                                                aria-label={`Nhập điểm thành phần cho ${course.name}`}
                                                aria-expanded={isComponentPanelOpen}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    {isComponentPanelOpen && (
                                        <tr className="bg-[#F8FAFC]">
                                            <td colSpan={5} className="px-4 py-4">
                                                <CourseComponentPlanner
                                                    course={course}
                                                    targetGrade={targetGrade != null ? roundCourseGrade(targetGrade).toFixed(COURSE_GRADE_DECIMALS) : ''}
                                                    mode={plannerMode}
                                                    components={getComponentPlan(course)}
                                                    onComponentsChange={(components) => updateComponents(course, components)}
                                                    onPredictedGradeChange={(grade) => updateCourseGradeFromComponents(course, grade)}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                    <tfoot className="border-t border-gray-200 bg-gray-50/80">
                        <tr>
                            <td colSpan={1} className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Tổng tín chỉ kỳ này</td>
                            <td className="px-4 py-3 text-center text-sm font-bold text-gray-800">{nextSemester.totalCredits} TC</td>
                            <td colSpan={3} className="px-4 py-3 text-right text-xs font-semibold text-gray-500"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {mobileOpenCourse && (() => {
                const activeGrade = getActiveGrade(mobileOpenCourse);
                const targetGrade = activeGrade ?? (isGuidanceActive ? mobileOpenCourse.suggestedGrade : null);
                const sourceLabel = mobileOpenCourse.source === 'official'
                    ? 'Điểm chính thức'
                    : mobileOpenCourse.source === 'ongoing'
                        ? 'Đang học'
                        : mobileOpenCourse.source === 'registration'
                            ? 'Đăng ký'
                            : 'Tương lai';
                const gradeStatus = mobileOpenCourse.isLocked
                    ? 'Đã có điểm'
                    : activeGrade !== null
                        ? 'Dự kiến'
                        : isGuidanceActive
                            ? 'Gợi ý'
                            : 'Chưa nhập';

                return (
                    <MobileCourseSheetFrame
                        courseCode={mobileOpenCourse.code}
                        courseName={mobileOpenCourse.name}
                        onClose={() => setMobileOpenCourseCode(null)}
                    >
                        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                            <div className="mb-4 flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
                                <span className="font-semibold tabular-nums text-gray-700">{mobileOpenCourse.credits} TC</span>
                                <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                                <span>{sourceLabel}</span>
                                <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                                <span className={activeGrade !== null ? 'font-semibold text-[#004A98]' : ''}>{gradeStatus}</span>
                            </div>
                            <CourseComponentPlanner
                                course={mobileOpenCourse}
                                targetGrade={targetGrade != null ? roundCourseGrade(targetGrade).toFixed(COURSE_GRADE_DECIMALS) : ''}
                                mode={plannerMode}
                                components={getComponentPlan(mobileOpenCourse)}
                                onComponentsChange={(components) => updateComponents(mobileOpenCourse, components)}
                                onTargetGradeChange={(value) => updateCourseGradeFromInput(mobileOpenCourse, value)}
                                onPredictedGradeChange={(grade) => updateCourseGradeFromComponents(mobileOpenCourse, grade)}
                                mobileSheet
                            />
                        </div>
                    </MobileCourseSheetFrame>
                );
            })()}
        </div>
    );
}

function CourseComponentPlanner({
    course,
    targetGrade,
    mode,
    components,
    onComponentsChange,
    onTargetGradeChange,
    onPredictedGradeChange,
    mobileSheet = false,
}: {
    course: GPAPullCourse;
    targetGrade: string;
    mode: ComponentGradeMode;
    components: GradeComponent[];
    onComponentsChange: (components: GradeComponent[]) => void;
    onTargetGradeChange?: (value: string) => void;
    onPredictedGradeChange: (grade: number | null) => void;
    mobileSheet?: boolean;
}) {
    const summary = useMemo(() => {
        return getComponentGradeSummary(components, targetGrade);
    }, [components, targetGrade]);
    const componentRows = useMemo(() => getComponentRows(components), [components]);

    const syncPredictedGrade = (next: GradeComponent[]) => {
        if (mode !== 'prediction') return;
        const nextSummary = getComponentGradeSummary(next, targetGrade);
        const nextPredictedGrade = nextSummary.predictedGrade == null
            ? null
            : Math.max(0, Math.min(10, roundCourseGrade(nextSummary.predictedGrade)));
        onPredictedGradeChange(nextPredictedGrade);
    };

    const updateComponent = (id: string, patch: Partial<GradeComponent>) => {
        const next = mapComponentTree(components, id, (component) => ({ ...component, ...patch }));
        onComponentsChange(next);
        syncPredictedGrade(next);
    };

    const addComponent = () => {
        onComponentsChange([
            ...components,
            { id: `${course.code}-${Date.now()}`, name: `Mục ${components.length + 1}`, weight: '', score: '' },
        ]);
    };

    const removeComponent = (id: string) => {
        const next = removeComponentFromTree(components, id);
        onComponentsChange(next);
        syncPredictedGrade(next);
    };

    const addChildComponent = (id: string) => {
        const next = mapComponentTree(components, id, (component) => {
            const existingChildren = component.children ?? (component.score.trim() === ''
                ? []
                : [{ id: `${component.id}-existing`, name: 'Điểm đã nhập', weight: '100', score: component.score }]);

            return {
                ...component,
                score: '',
                children: [
                    ...existingChildren,
                    { id: `${course.code}-${Date.now()}-${id}`, name: `Mục con ${existingChildren.length + 1}`, weight: existingChildren.length === 0 ? '100' : '0', score: '' },
                ],
            };
        });
        onComponentsChange(next);
        syncPredictedGrade(next);
    };

    const suggestedPlaceholder = mode === 'target' && summary.suggestedScore != null && summary.suggestedScore >= 0 && summary.suggestedScore <= 10
        ? roundCourseGrade(summary.suggestedScore).toFixed(COURSE_GRADE_DECIMALS)
        : undefined;

    return (
        <div className={mobileSheet ? 'bg-white' : 'rounded-xl border border-gray-200 bg-white p-4 shadow-sm'}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className={mobileSheet ? 'hidden' : 'min-w-0'}>
                    <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-[#004A98]" />
                        <h4 className="text-sm font-semibold text-gray-900">Điểm thành phần · {course.code}</h4>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        {mode === 'prediction' ? 'Dự đoán từ các điểm thành phần đã nhập.' : 'Gợi ý theo điểm dự kiến trong bảng môn.'}
                    </p>
                </div>
                <div className={`flex flex-wrap items-center gap-3 ${mobileSheet ? 'justify-between rounded-lg bg-gray-50 px-3 py-2.5' : ''}`}>
                    {mobileSheet && mode === 'prediction' && (
                        <p className="text-xs font-medium text-gray-500">
                            Điểm môn từ thành phần
                        </p>
                    )}
                    <p className="text-xs font-medium text-gray-500">
                        {mode === 'target' ? 'Điểm từ thành phần' : 'Điểm tính được'} <span className="ml-1 font-bold tabular-nums text-gray-900">{summary.predictedGrade == null ? '-' : roundCourseGrade(summary.predictedGrade).toFixed(COURSE_GRADE_DECIMALS)}</span>
                    </p>
                </div>
            </div>

            {mobileSheet && mode === 'target' && onTargetGradeChange && (
                <div className="mt-3 flex items-center justify-between gap-4 rounded-lg border border-[#004A98]/20 bg-[#F4F8FF] px-3 py-3">
                    <div className="min-w-0">
                        <label htmlFor={`course-target-${course.code}`} className="text-xs font-semibold text-gray-800">Mục tiêu môn</label>
                        <p className="mt-0.5 text-[11px] leading-4 text-gray-500">Các điểm thành phần còn trống sẽ gợi ý theo mức này.</p>
                    </div>
                    <input
                        id={`course-target-${course.code}`}
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={targetGrade}
                        onChange={(event) => onTargetGradeChange(event.target.value)}
                        placeholder="8.0"
                        className="h-10 w-20 shrink-0 rounded-lg border border-[#004A98]/25 bg-white px-2 text-center text-base font-bold tabular-nums text-[#004A98] outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
                    />
                </div>
            )}

            <div className="mt-4 space-y-2 md:hidden">
                {componentRows.map(({ component, depth }) => {
                    const isGroup = Boolean(component.children?.length);
                    const weight = Number(component.weight);
                    const score = Number(component.score);
                    const leafWeight = summary.leafWeights[component.id];
                    const contribution = !isGroup && Number.isFinite(leafWeight) && Number.isFinite(score) && component.score.trim() !== ''
                        ? score * leafWeight / 100
                        : null;

                    return (
                        <div
                            key={component.id}
                            className={`rounded-lg border p-3 ${isGroup ? 'border-[#004A98]/25 bg-[#F4F8FF]' : 'border-gray-200 bg-white'}`}
                            style={{ marginLeft: `${Math.min(depth * 12, 24)}px` }}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    value={component.name}
                                    onChange={(event) => updateComponent(component.id, { name: event.target.value })}
                                    className={`h-9 min-w-0 flex-1 rounded-lg border px-3 text-sm text-gray-800 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20 ${isGroup ? 'border-[#004A98]/30 bg-white font-semibold' : 'border-gray-200'}`}
                                    aria-label="Tên mục điểm thành phần"
                                />
                                <button
                                    type="button"
                                    onClick={() => addChildComponent(component.id)}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#004A98] transition-colors hover:bg-[#EAF3FF]"
                                    title="Thêm nhóm con"
                                    aria-label={`Thêm nhóm con cho ${component.name}`}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeComponent(component.id)}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                    title="Xóa mục"
                                    aria-label={`Xóa ${component.name}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                                <label className="min-w-0">
                                    <span className="block text-[10px] font-medium uppercase text-gray-500">Tỷ lệ %</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={component.weight}
                                        onChange={(event) => updateComponent(component.id, { weight: event.target.value })}
                                        className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-2 text-center text-sm tabular-nums text-gray-900 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
                                        aria-label={`Tỷ lệ ${component.name}`}
                                    />
                                </label>
                                <label className="min-w-0">
                                    <span className="block text-[10px] font-medium uppercase text-gray-500">Điểm</span>
                                    {isGroup ? (
                                        <span className="mt-1 flex h-9 items-center justify-center rounded-lg bg-[#EAF3FF] text-xs font-semibold text-[#004A98]">Tự tính</span>
                                    ) : (
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={component.score}
                                            placeholder={component.score.trim() === '' && weight > 0 ? suggestedPlaceholder : undefined}
                                            onChange={(event) => {
                                                const rawScore = event.target.value;
                                                if (rawScore.trim() === '') {
                                                    updateComponent(component.id, { score: '' });
                                                    return;
                                                }
                                                const parsedScore = Number(rawScore);
                                                if (!Number.isFinite(parsedScore)) return;
                                                const nextScore = parsedScore > 10 ? '10' : parsedScore < 0 ? '0' : rawScore;
                                                updateComponent(component.id, { score: nextScore });
                                            }}
                                            className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-2 text-center text-sm tabular-nums text-gray-900 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
                                            aria-label={`Điểm ${component.name}`}
                                        />
                                    )}
                                </label>
                                <div className="min-w-0">
                                    <span className="block text-[10px] font-medium uppercase text-gray-500">Đóng góp</span>
                                    <span className="mt-1 flex h-9 items-center justify-center text-sm font-semibold tabular-nums text-gray-700">
                                        {contribution == null ? '-' : contribution.toFixed(COURSE_GRADE_DECIMALS)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[680px] table-fixed border-collapse text-left">
                    <colgroup>
                        <col className="w-auto" />
                        <col className="w-28" />
                        <col className="w-28" />
                        <col className="w-32" />
                        <col className="w-20" />
                    </colgroup>
                    <thead>
                        <tr className="border-y border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                            <th className="px-3 py-2">Mục</th>
                            <th className="px-3 py-2 text-center">Tỉ lệ %</th>
                            <th className="px-3 py-2 text-center">Điểm</th>
                            <th className="px-3 py-2 text-center">Đóng góp</th>
                            <th className="px-2 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {componentRows.map(({ component, depth }) => {
                            const isGroup = Boolean(component.children?.length);
                            const weight = Number(component.weight);
                            const score = Number(component.score);
                            const leafWeight = summary.leafWeights[component.id];
                            const contribution = !isGroup && Number.isFinite(leafWeight) && Number.isFinite(score) && component.score.trim() !== ''
                                ? score * leafWeight / 100
                                : null;

                            return (
                                <tr key={component.id}>
                                    <td className="px-3 py-2" style={{ paddingLeft: `${12 + depth * 20}px` }}>
                                        <input
                                            value={component.name}
                                            onChange={(event) => updateComponent(component.id, { name: event.target.value })}
                                            className={`h-9 w-full rounded-lg border px-3 text-sm text-gray-800 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20 ${isGroup ? 'border-[#004A98]/30 bg-[#F4F8FF] font-semibold' : 'border-gray-200'}`}
                                            aria-label="Tên mục điểm thành phần"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={component.weight}
                                            onChange={(event) => updateComponent(component.id, { weight: event.target.value })}
                                            className="h-9 w-full rounded-lg border border-gray-200 px-2 text-center text-sm tabular-nums text-gray-900 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
                                            aria-label={`Tỉ lệ ${component.name}`}
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        {isGroup ? (
                                            <div className="flex h-9 items-center justify-center text-xs font-medium text-[#004A98]">Tự tính</div>
                                        ) : (
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={component.score}
                                                placeholder={component.score.trim() === '' && weight > 0 ? suggestedPlaceholder : undefined}
                                                onChange={(event) => {
                                                    const rawScore = event.target.value;
                                                    if (rawScore.trim() === '') {
                                                        updateComponent(component.id, { score: '' });
                                                        return;
                                                    }
                                                    const parsedScore = Number(rawScore);
                                                    if (!Number.isFinite(parsedScore)) return;
                                                    const nextScore = parsedScore > 10 ? '10' : parsedScore < 0 ? '0' : rawScore;
                                                    updateComponent(component.id, { score: nextScore });
                                                }}
                                                className="h-9 w-full rounded-lg border border-gray-200 px-2 text-center text-sm tabular-nums text-gray-900 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
                                                aria-label={`Điểm ${component.name}`}
                                            />
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-center text-sm font-semibold tabular-nums text-gray-700">
                                        {contribution == null ? '-' : contribution.toFixed(COURSE_GRADE_DECIMALS)}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => addChildComponent(component.id)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#004A98] transition-colors hover:bg-[#EAF3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/25"
                                            title="Thêm nhóm con"
                                            aria-label={`Thêm nhóm con cho ${component.name}`}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeComponent(component.id)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
                                            title="Xóa mục"
                                            aria-label={`Xóa ${component.name}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <button
                    type="button"
                    onClick={addComponent}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-[#004A98] transition-colors hover:border-[#004A98]/40 hover:bg-[#EAF3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/25 md:h-9 md:w-fit"
                >
                    <Plus className="h-4 w-4" />
                    Thêm mục
                </button>
            </div>
        </div>
    );
}
