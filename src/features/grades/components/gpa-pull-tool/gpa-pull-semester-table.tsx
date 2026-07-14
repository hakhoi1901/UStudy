import { Calculator, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../../../../config';
import { readPlain, savePlain } from '../../../../helpers/localStorage/save';
import type { GPAPullCourse, GPAPullSemesterTableProps } from '../../types';

interface GradeComponent {
    id: string;
    name: string;
    weight: string;
    score: string;
}

type ComponentGradeMode = 'prediction' | 'target';

interface PersistedComponentGradePlans {
    componentPlans: Record<string, GradeComponent[]>;
    componentModes: Record<string, ComponentGradeMode>;
    targetGrades: Record<string, number>;
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
}

const EMPTY_COMPONENT_GRADE_PLANS: PersistedComponentGradePlans = {
    componentPlans: {},
    componentModes: {},
    targetGrades: {},
};

function readComponentGradePlans(): PersistedComponentGradePlans {
    const saved = readPlain<Partial<PersistedComponentGradePlans>>(STORAGE_KEYS.GPA_COMPONENT_GRADES, EMPTY_COMPONENT_GRADE_PLANS);
    const componentPlans = typeof saved.componentPlans === 'object' && saved.componentPlans !== null ? saved.componentPlans : {};
    const savedModes = typeof saved.componentModes === 'object' && saved.componentModes !== null ? saved.componentModes : {};
    const componentModes = Object.fromEntries(
        Object.entries(savedModes).filter((entry): entry is [string, ComponentGradeMode] => entry[1] === 'prediction' || entry[1] === 'target'),
    );
    const savedTargets = typeof saved.targetGrades === 'object' && saved.targetGrades !== null ? saved.targetGrades : {};
    const targetGrades = Object.fromEntries(
        Object.entries(savedTargets).filter((entry): entry is [string, number] => Number.isFinite(entry[1]) && entry[1] >= 0 && entry[1] <= 10),
    );

    return {
        componentPlans,
        componentModes,
        targetGrades,
    };
}

function getComponentGradeSummary(components: GradeComponent[], targetGrade: string): ComponentGradeSummary {
    let totalWeight = 0;
    let knownWeight = 0;
    let missingWeight = 0;
    let weightedScoreTotal = 0;
    let hasInvalidWeight = false;
    let hasInvalidScore = false;

    components.forEach((component) => {
        const weight = Number(component.weight);
        const score = Number(component.score);
        if (!Number.isFinite(weight) || weight < 0) {
            hasInvalidWeight = true;
            return;
        }

        totalWeight += weight;
        if (component.score.trim() === '') {
            missingWeight += weight;
            return;
        }
        if (!Number.isFinite(score) || score < 0 || score > 10) {
            hasInvalidScore = true;
            return;
        }

        knownWeight += weight;
        weightedScoreTotal += score * weight;
    });

    const target = Number(targetGrade);
    const predictedGrade = !hasInvalidWeight && !hasInvalidScore && knownWeight > 0
        ? weightedScoreTotal / knownWeight
        : null;
    const suggestedScore = targetGrade.trim() !== '' && Number.isFinite(target) && missingWeight > 0
        ? (target * totalWeight - weightedScoreTotal) / missingWeight
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
    };
}

export function GPAPullSemesterTable({
    nextSemester,
    decimals,
    isGuidanceActive,
    onGradeChange,
}: GPAPullSemesterTableProps) {
    const persistedPlans = useMemo(() => readComponentGradePlans(), []);
    const initialGradeSettings = useMemo(() => {
        const modes = { ...persistedPlans.componentModes };
        const targets = { ...persistedPlans.targetGrades };

        nextSemester.courses.forEach((course) => {
            if (modes[course.code] == null && course.projectedGrade != null) {
                modes[course.code] = 'target';
            }
            if (modes[course.code] === 'target' && targets[course.code] == null && course.projectedGrade != null) {
                targets[course.code] = course.projectedGrade;
            }
        });

        return { modes, targets };
    }, [nextSemester.courses, persistedPlans]);
    const [openCourseCode, setOpenCourseCode] = useState<string | null>(null);
    const [componentPlans, setComponentPlans] = useState<Record<string, GradeComponent[]>>(persistedPlans.componentPlans);
    const [componentModes, setComponentModes] = useState<Record<string, ComponentGradeMode>>(initialGradeSettings.modes);
    const [targetGrades, setTargetGrades] = useState<Record<string, number>>(initialGradeSettings.targets);

    useEffect(() => {
        savePlain(STORAGE_KEYS.GPA_COMPONENT_GRADES, { componentPlans, componentModes, targetGrades });
    }, [componentModes, componentPlans, targetGrades]);

    const getComponentPlan = (courseCode: string): GradeComponent[] => {
        return componentPlans[courseCode] ?? [
            { id: `${courseCode}-midterm`, name: 'Giữa kỳ', weight: '30', score: '' },
            { id: `${courseCode}-final`, name: 'Cuối kỳ', weight: '70', score: '' },
        ];
    };

    const updateComponents = (courseCode: string, nextComponents: GradeComponent[]) => {
        setComponentPlans((prev) => ({ ...prev, [courseCode]: nextComponents }));
    };

    const getPredictedGrade = (courseCode: string) => {
        const predictedGrade = getComponentGradeSummary(getComponentPlan(courseCode), '').predictedGrade;
        return predictedGrade == null ? null : Math.max(0, Math.min(10, Math.round(predictedGrade * 100) / 100));
    };

    const getActiveGrade = (course: GPAPullCourse, mode: ComponentGradeMode) => {
        if (course.isLocked && course.lockedGrade != null) return course.lockedGrade;
        return mode === 'target' ? targetGrades[course.code] ?? null : getPredictedGrade(course.code);
    };

    const updateTargetGrade = (courseCode: string, grade: number | null) => {
        setTargetGrades((prev) => {
            if (grade != null) return { ...prev, [courseCode]: grade };
            const next = { ...prev };
            delete next[courseCode];
            return next;
        });
    };

    const changeComponentMode = (course: GPAPullCourse, mode: ComponentGradeMode) => {
        setComponentModes((prev) => ({ ...prev, [course.code]: mode }));
        const activeGrade = mode === 'target' ? targetGrades[course.code] ?? null : getPredictedGrade(course.code);
        onGradeChange(course.code, activeGrade);
    };

    return (
        <div className="overflow-hidden bg-white">
            <div className="overflow-x-auto">
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
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Tình trạng</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Điểm dự kiến</th>
                            <th className="w-12 px-3 py-3 text-center text-xs font-semibold text-gray-500">Tùy chọn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {nextSemester.courses.map((course) => {
                            const componentMode = componentModes[course.code] ?? 'prediction';
                            const activeGrade = getActiveGrade(course, componentMode);
                            const displayGrade = activeGrade ?? (isGuidanceActive ? course.suggestedGrade : null);
                            const targetGrade = targetGrades[course.code] ?? (isGuidanceActive ? course.suggestedGrade : null);
                            const isComponentPanelOpen = openCourseCode === course.code;

                            const gradeClass = course.isLocked
                                ? 'text-gray-400'
                                : displayGrade != null && displayGrade > 9.5
                                    ? 'text-rose-700'
                                    : displayGrade != null && displayGrade > 9
                                        ? 'text-amber-700'
                                        : displayGrade != null && displayGrade >= 8
                                            ? 'text-[#004A98]'
                                            : 'text-emerald-700';

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
                                            <span className="text-xs font-medium text-gray-600">
                                                {course.source === 'ongoing' ? 'Đang học' : course.source === 'registration' ? 'Đăng ký' : 'Tương lai'} · {activeGrade !== null ? 'Đã nhập' : isGuidanceActive ? 'Gợi ý' : 'Chưa nhập'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={activeGrade ?? ''}
                                                    placeholder={isGuidanceActive && course.suggestedGrade != null ? course.suggestedGrade.toFixed(decimals) : '-'}
                                                    onChange={(event) => {
                                                        setComponentModes((prev) => ({ ...prev, [course.code]: 'target' }));
                                                        const value = event.target.value;
                                                        if (value === '') {
                                                            updateTargetGrade(course.code, null);
                                                            onGradeChange(course.code, null);
                                                            return;
                                                        }
                                                        const grade = Number(value);
                                                        if (!Number.isFinite(grade)) return;
                                                        const nextGrade = Math.max(0, Math.min(10, grade));
                                                        updateTargetGrade(course.code, nextGrade);
                                                        onGradeChange(course.code, nextGrade);
                                                    }}
                                                    className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-sm font-semibold tabular-nums text-gray-900 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
                                                    aria-label={`Điểm dự kiến ${course.name}`}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setOpenCourseCode((current) => current === course.code ? null : course.code)}
                                                className={`inline-flex h-8 w-8 items-center justify-center`}
                                                title="Nhập điểm thành phần"
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
                                                    decimals={decimals}
                                                    targetGrade={targetGrade != null ? targetGrade.toFixed(decimals) : ''}
                                                    mode={componentMode}
                                                    components={getComponentPlan(course.code)}
                                                    onComponentsChange={(components) => updateComponents(course.code, components)}
                                                    onModeChange={(mode) => changeComponentMode(course, mode)}
                                                    onPredictedGradeChange={(grade) => onGradeChange(course.code, grade)}
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
        </div>
    );
}

function CourseComponentPlanner({
    course,
    decimals,
    targetGrade,
    mode,
    components,
    onComponentsChange,
    onModeChange,
    onPredictedGradeChange,
}: {
    course: GPAPullCourse;
    decimals: number;
    targetGrade: string;
    mode: ComponentGradeMode;
    components: GradeComponent[];
    onComponentsChange: (components: GradeComponent[]) => void;
    onModeChange: (mode: ComponentGradeMode) => void;
    onPredictedGradeChange: (grade: number | null) => void;
}) {
    const summary = useMemo(() => {
        return getComponentGradeSummary(components, targetGrade);
    }, [components, targetGrade]);

    const syncPredictedGrade = (next: GradeComponent[]) => {
        if (mode !== 'prediction') return;
        const nextSummary = getComponentGradeSummary(next, targetGrade);
        const nextPredictedGrade = nextSummary.predictedGrade == null
            ? null
            : Math.max(0, Math.min(10, Math.round(nextSummary.predictedGrade * 100) / 100));
        onPredictedGradeChange(nextPredictedGrade);
    };

    const updateComponent = (id: string, patch: Partial<GradeComponent>) => {
        const next = components.map((component) => component.id === id ? { ...component, ...patch } : component);
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
        const next = components.filter((component) => component.id !== id);
        onComponentsChange(next);
        syncPredictedGrade(next);
    };

    const changeMode = (nextMode: ComponentGradeMode) => {
        onModeChange(nextMode);
    };

    const suggestedPlaceholder = mode === 'target' && summary.suggestedScore != null && summary.suggestedScore >= 0 && summary.suggestedScore <= 10
        ? summary.suggestedScore.toFixed(decimals)
        : undefined;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-[#004A98]" />
                        <h4 className="text-sm font-semibold text-gray-900">Điểm thành phần · {course.code}</h4>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        {mode === 'prediction' ? 'Dự đoán từ các điểm thành phần đã nhập.' : 'Gợi ý theo điểm dự kiến trong bảng môn.'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5" role="group" aria-label="Chế độ tính điểm">
                        <button
                            type="button"
                            onClick={() => changeMode('prediction')}
                            className={`h-8 rounded-md px-3 text-xs font-semibold transition-colors ${mode === 'prediction' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            aria-pressed={mode === 'prediction'}
                        >
                            Dự đoán
                        </button>
                        <button
                            type="button"
                            onClick={() => changeMode('target')}
                            className={`h-8 rounded-md px-3 text-xs font-semibold transition-colors ${mode === 'target' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            aria-pressed={mode === 'target'}
                        >
                            Mục tiêu
                        </button>
                    </div>
                    <p className="text-xs font-medium text-gray-500">
                        Điểm tính được (làm tròn) <span className="ml-1 font-bold tabular-nums text-gray-900">{summary.predictedGrade == null ? '-' : summary.predictedGrade.toFixed(decimals)}</span>
                    </p>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] table-fixed border-collapse text-left">
                    <colgroup>
                        <col className="w-auto" />
                        <col className="w-28" />
                        <col className="w-28" />
                        <col className="w-32" />
                        <col className="w-12" />
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
                        {components.map((component) => {
                            const weight = Number(component.weight);
                            const score = Number(component.score);
                            const contribution = Number.isFinite(weight) && Number.isFinite(score) && component.score.trim() !== '' && summary.totalWeight > 0
                                ? score * weight / summary.totalWeight
                                : null;

                            return (
                                <tr key={component.id}>
                                    <td className="px-3 py-2">
                                        <input
                                            value={component.name}
                                            onChange={(event) => updateComponent(component.id, { name: event.target.value })}
                                            className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
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
                                    </td>
                                    <td className="px-3 py-2 text-center text-sm font-semibold tabular-nums text-gray-700">
                                        {contribution == null ? '-' : contribution.toFixed(decimals)}
                                    </td>
                                    <td className="px-2 py-2 text-center">
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
                    className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-[#004A98] transition-colors hover:border-[#004A98]/40 hover:bg-[#EAF3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/25"
                >
                    <Plus className="h-4 w-4" />
                    Thêm mục
                </button>
            </div>
        </div>
    );
}
