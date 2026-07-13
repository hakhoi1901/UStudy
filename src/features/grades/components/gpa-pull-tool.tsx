import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { useGPAPull } from '../hooks/use-gpa-pull';
import { GPAPullInputSection } from './gpa-pull-tool/gpa-pull-input-section';
import { GPAPullResultSummary } from './gpa-pull-tool/gpa-pull-result-summary';
import { GPAPullSemesterTable } from './gpa-pull-tool/gpa-pull-semester-table';
import { GPAPullManualRetake } from './gpa-pull-tool/gpa-pull-manual-retake';
import { GPAPullRetakeSuggestions } from './gpa-pull-tool/gpa-pull-retake-suggestions';
import type { GPAPullSemester, StudentCourseGrade, SimulatorCourseGrade } from '../types';

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

export function GPAPullTool({
    gradesHistory,
    simulatorCourses,
    handleGradeChange,
    currentGPA,
    accumulatedCredits,
    totalCredits,
    semesterGPA,
    cumulativeGPA,
}: GPAPullToolProps) {
    const [hasCalculated, setHasCalculated] = useState(false);
    const {
        // State & Computed
        targetGPAInput, setTargetGPAInput,
        mode, setMode,
        draftManualRetakeTargets,
        draftManualRetakeTargetErrors,
        retakeSearchTerm, setRetakeSearchTerm,
        isRetakePickerOpen, setIsRetakePickerOpen,
        retakePickerRef,
        targetGPA, targetGpaError,
        isFoundationMajorModeUnavailable,
        isFoundationMajorScopeActive,
        displayCurrentGPA,
        displayAccumulatedCredits,
        scopeName,
        projectedScopeGPA,
        projectedScopeCredits,
        baseResult,
        nextSemester,
        semesterStats,
        shouldShowRetakeSuggestions,
        retakeSuggestions,
        manualRetakeItems,
        manualRetakeImpact,
        selectableRetakeCourses,
        filteredSelectableRetakeCourses,
        pendingRetakeCodeSet,

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
        decimals,
        minTargetGpa
    } = useGPAPull({
        gradesHistory,
        simulatorCourses,
        currentGPA,
        accumulatedCredits,
        totalCredits,
    });

    const workingSemester = useMemo<GPAPullSemester>(() => {
        if (hasCalculated && nextSemester) return nextSemester;

        const courses = simulatorCourses
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
    }, [hasCalculated, nextSemester, simulatorCourses]);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="items-center gap-2 border-b border-gray-100 px-4 py-3 md:px-5">
                <div className="flex">
                    <h3 className="text-sm font-semibold text-gray-800">{mode === 'currentSemester' ? 'Mục tiêu GPA kỳ này' : 'Mục tiêu GPA tốt nghiệp'}</h3>
                    <span title={mode === 'currentSemester' ? 'Tính GPA cần đạt riêng cho các học phần trong kỳ hiện tại.' : 'Ước tính GPA trung bình cần đạt cho các tín chỉ còn lại để chạm mục tiêu đã nhập.'}>
                        <Info className="h-4 w-4 text-gray-400" />
                    </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                </p>
            </div>

            <div className="space-y-5 px-3 py-3 md:px-5">
                <GPAPullInputSection
                    targetGPAInput={targetGPAInput}
                    setTargetGPAInput={(value) => {
                        setTargetGPAInput(value);
                        setHasCalculated(false);
                    }}
                    targetGpaError={targetGpaError}
                    minTargetGpa={minTargetGpa}
                    mode={mode}
                    setMode={(nextMode) => {
                        setMode(nextMode);
                        setHasCalculated(false);
                    }}
                    isFoundationMajorModeUnavailable={isFoundationMajorModeUnavailable}
                    onCalculate={() => setHasCalculated(true)}
                    isCalculateDisabled={Boolean(targetGpaError) || targetGPA === null}
                    isGuidanceActive={hasCalculated && Boolean(nextSemester)}
                    baseResult={hasCalculated ? baseResult : null}
                    semesterStats={hasCalculated ? semesterStats : null}
                    scopeName={scopeName}
                    projectedScopeGPA={projectedScopeGPA}
                    projectedScopeCredits={projectedScopeCredits}
                    decimals={decimals}
                />

                {/* {hasCalculated && baseResult && (
                    <div className="space-y-6 pt-2 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-500">
                        <GPAPullResultSummary
                            targetGPA={targetGPA}
                            displayCurrentGPA={mode === 'currentSemester' ? semesterGPA : displayCurrentGPA}
                            displayAccumulatedCredits={mode === 'currentSemester' ? workingSemester.totalCredits : displayAccumulatedCredits}
                            scopeName={scopeName}
                            baseResult={baseResult}
                            decimals={decimals}
                        />

                        {baseResult.success && !baseResult.alreadyAchieved && !baseResult.impossible && (
                            <div className="space-y-8">
                                {shouldShowRetakeSuggestions && (
                                    <GPAPullRetakeSuggestions
                                        retakeSuggestions={retakeSuggestions}
                                        addManualRetake={addManualRetake}
                                        decimals={decimals}
                                        scopeName={scopeName}
                                    />
                                )}
                            </div>
                        )}

                        {baseResult.impossible && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col gap-3">
                                <p className="text-sm text-red-800 leading-relaxed font-medium">
                                    Mục tiêu GPA {targetGPA?.toFixed(decimals)} trong phạm vi {scopeName} là <b>không khả thi</b> nếu chỉ dựa vào các tín chỉ còn lại (cần trung bình &gt; 10.0).
                                </p>
                                <GPAPullRetakeSuggestions
                                    retakeSuggestions={retakeSuggestions}
                                    addManualRetake={addManualRetake}
                                    decimals={decimals}
                                    scopeName={scopeName}
                                />
                            </div>
                        )}
                    </div>
                )} */}
            </div>

            <div className="border-t border-gray-200">
                <GPAPullSemesterTable
                    nextSemester={workingSemester}
                    decimals={decimals}
                    isGuidanceActive={hasCalculated && Boolean(nextSemester)}
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
