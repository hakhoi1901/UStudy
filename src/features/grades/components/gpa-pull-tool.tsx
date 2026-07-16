import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { useGPAPull } from '../hooks/use-gpa-pull';
import { GPAPullInputSection } from './gpa-pull-tool/gpa-pull-input-section';
import { GPAPullSemesterTable } from './gpa-pull-tool/gpa-pull-semester-table';
import { GPAPullManualRetake } from './gpa-pull-tool/gpa-pull-manual-retake';
import type { GPAPlanningIntent, GPAPullSemester, StudentCourseGrade, SimulatorCourseGrade } from '../types';

interface GPAPullToolProps {
    gradesHistory: StudentCourseGrade[];
    getClassification: (gpa: number) => string;
    simulatorCourses: SimulatorCourseGrade[];
    handleGradeChange: (courseCode: string, grade: number | null) => void;
    currentGPA: number;
    accumulatedCredits: number;
    totalCredits: number;
    semesterGPA: number;
    cumulativeGPA: number;
}

const planningModes: Array<{
    id: GPAPlanningIntent;
    label: string;
}> = [
    {
        id: 'prediction',
        label: 'Dự đoán',
    },
    {
        id: 'goal',
        label: 'Mục tiêu',
    },
];

export function GPAPullTool({
    gradesHistory,
    simulatorCourses,
    handleGradeChange,
    currentGPA,
    accumulatedCredits,
    totalCredits,
}: GPAPullToolProps) {
    const [planningIntent, setPlanningIntent] = useState<GPAPlanningIntent>('prediction');
    const [hasCalculated, setHasCalculated] = useState(false);
    const {
        targetGPAInput, setTargetGPAInput,
        mode, setMode,
        draftManualRetakeTargets,
        draftManualRetakeTargetErrors,
        retakeSearchTerm, setRetakeSearchTerm,
        isRetakePickerOpen, setIsRetakePickerOpen,
        retakePickerRef,
        targetGPA, targetGpaError, maxAchievableGpaAtGraduation,
        isFoundationMajorModeUnavailable,
        displayCurrentGPA,
        displayAccumulatedCredits,
        scopeName,
        scopedSimulatorCourses,
        projectedScopeGPA,
        projectedScopeCredits,
        baseResult,
        nextSemester,
        semesterStats,
        manualRetakeItems,
        manualRetakeImpact,
        selectableRetakeCourses,
        filteredSelectableRetakeCourses,
        pendingRetakeCodeSet,
        togglePendingRetakeCode,
        addPendingRetakes,
        selectAllFilteredRetakes,
        clearPendingFilteredRetakes,
        removeManualRetake,
        handleManualRetakeTargetInputChange,
        commitManualRetakeTargetInput,
        clearAllManualRetakes,
        decimals,
        minTargetGpa,
    } = useGPAPull({
        gradesHistory,
        simulatorCourses,
        currentGPA,
        accumulatedCredits,
        totalCredits,
    });

    const guidanceActive = planningIntent === 'goal' && hasCalculated && Boolean(nextSemester);

    const workingSemester = useMemo<GPAPullSemester>(() => {
        if (guidanceActive && nextSemester) return nextSemester;

        const courses = scopedSimulatorCourses
            .filter((course) => (course.credits ?? 0) > 0)
            .map((course) => ({
                id: course.id,
                code: course.code,
                name: course.name,
                credits: course.credits ?? 0,
                projectedGrade: course.projectedGrade,
                isLocked: false,
                source: course.source,
            }));

        return {
            id: 'current-semester',
            label: 'Học kỳ hiện tại',
            courses,
            requiredGPA: 0,
            totalCredits: courses.reduce((sum, course) => sum + course.credits, 0),
            pointsNeeded: 0,
        };
    }, [guidanceActive, nextSemester, scopedSimulatorCourses]);

    const changePlanningIntent = (nextIntent: GPAPlanningIntent) => {
        setPlanningIntent(nextIntent);
        setHasCalculated(false);
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 md:px-5">
                <div className="flex min-w-0 items-center gap-1.5">
                    <h3 className="truncate text-[15px] font-semibold text-gray-800">Kế hoạch GPA</h3>
                    <span title={planningIntent === 'prediction' ? 'Nhập điểm từng môn để dự đoán GPA.' : 'Nhập GPA mong muốn để nhận gợi ý điểm cần đạt.'}>
                        <Info className="h-4 w-4 text-gray-400" />
                    </span>
                </div>

                <div className="inline-flex shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-0.5" role="tablist" aria-label="Chế độ kế hoạch GPA">
                    {planningModes.map((planningMode) => {
                        const isActive = planningIntent === planningMode.id;
                        return (
                            <button
                                key={planningMode.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => changePlanningIntent(planningMode.id)}
                                className={`h-8 rounded-md px-2.5 text-xs font-semibold transition-colors sm:px-3 ${isActive
                                    ? 'bg-white text-[#004A98] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {planningMode.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="px-3 py-4 md:px-5">
                <GPAPullInputSection
                    planningIntent={planningIntent}
                    targetGPAInput={targetGPAInput}
                    setTargetGPAInput={(value) => {
                        setTargetGPAInput(value);
                        setHasCalculated(false);
                    }}
                    targetGpaError={targetGpaError}
                    minTargetGpa={minTargetGpa}
                    maxTargetGpa={maxAchievableGpaAtGraduation}
                    mode={mode}
                    setMode={(nextMode) => {
                        setMode(nextMode);
                        setHasCalculated(false);
                    }}
                    isFoundationMajorModeUnavailable={isFoundationMajorModeUnavailable}
                    onCalculate={() => setHasCalculated(true)}
                    isCalculateDisabled={Boolean(targetGpaError) || targetGPA === null}
                    isGuidanceActive={planningIntent === 'goal' && hasCalculated}
                    targetGPA={targetGPA}
                    baseResult={planningIntent === 'goal' && hasCalculated ? baseResult : null}
                    semesterStats={planningIntent === 'goal' && hasCalculated ? semesterStats : null}
                    scopeName={scopeName}
                    displayCurrentGPA={displayCurrentGPA}
                    displayAccumulatedCredits={displayAccumulatedCredits}
                    projectedScopeGPA={projectedScopeGPA}
                    projectedScopeCredits={projectedScopeCredits}
                    decimals={decimals}
                />
            </div>

            <div className="border-t border-gray-200">
                <GPAPullSemesterTable
                    nextSemester={workingSemester}
                    decimals={decimals}
                    planningIntent={planningIntent}
                    isGuidanceActive={guidanceActive}
                    onGradeChange={handleGradeChange}
                />
            </div>

            <div className="border-t border-gray-200 px-4 py-4 md:px-5">
                <GPAPullManualRetake
                    manualRetakeItems={manualRetakeItems}
                    removeManualRetake={removeManualRetake}
                    handleManualRetakeTargetInputChange={handleManualRetakeTargetInputChange}
                    commitManualRetakeTargetInput={commitManualRetakeTargetInput}
                    draftManualRetakeTargets={draftManualRetakeTargets}
                    draftManualRetakeTargetErrors={draftManualRetakeTargetErrors}
                    manualRetakeImpact={manualRetakeImpact}
                    selectableRetakeCourses={selectableRetakeCourses}
                    filteredSelectableRetakeCourses={filteredSelectableRetakeCourses}
                    retakeSearchTerm={retakeSearchTerm}
                    setRetakeSearchTerm={setRetakeSearchTerm}
                    isRetakePickerOpen={isRetakePickerOpen}
                    setIsRetakePickerOpen={setIsRetakePickerOpen}
                    retakePickerRef={retakePickerRef}
                    pendingRetakeCodeSet={pendingRetakeCodeSet}
                    togglePendingRetakeCode={togglePendingRetakeCode}
                    addPendingRetakes={addPendingRetakes}
                    selectAllFilteredRetakes={selectAllFilteredRetakes}
                    clearPendingFilteredRetakes={clearPendingFilteredRetakes}
                    clearAllManualRetakes={clearAllManualRetakes}
                    decimals={decimals}
                    scopeName={scopeName}
                />
            </div>
        </div>
    );
}
