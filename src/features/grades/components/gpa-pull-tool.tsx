import { useGPAPull } from '../hooks/use-gpa-pull';
import { GPAPullHeader } from './gpa-pull-tool/gpa-pull-header';
import { GPAPullInputSection } from './gpa-pull-tool/gpa-pull-input-section';
import { GPAPullResultSummary } from './gpa-pull-tool/gpa-pull-result-summary';
import { GPAPullSemesterTable } from './gpa-pull-tool/gpa-pull-semester-table';
import { GPAPullManualRetake } from './gpa-pull-tool/gpa-pull-manual-retake';
import { GPAPullRetakeSuggestions } from './gpa-pull-tool/gpa-pull-retake-suggestions';
import type { StudentCourseGrade, SimulatorCourseGrade } from '../types';

interface GPAPullToolProps {
    gradesHistory: StudentCourseGrade[];
    getClassification: (gpa: number) => string;
    simulatorCourses: SimulatorCourseGrade[];
    handleGradeChange: (courseCode: string, grade: number | null) => void;
    currentGPA: number;
    accumulatedCredits: number;
    totalCredits: number;
}

export function GPAPullTool({
    gradesHistory,
    simulatorCourses,
    currentGPA,
    accumulatedCredits,
    totalCredits,
}: GPAPullToolProps) {
    const {
        // State & Computed
        targetGPAInput, setTargetGPAInput,
        expanded, setExpanded,
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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <GPAPullHeader expanded={expanded} setExpanded={setExpanded} />

            {expanded && (
                <div className="px-6 py-5 border-t border-gray-100 space-y-5">
                    <GPAPullInputSection
                        targetGPAInput={targetGPAInput}
                        setTargetGPAInput={setTargetGPAInput}
                        targetGpaError={targetGpaError}
                        minTargetGpa={minTargetGpa}
                    />

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode('all')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'all'
                                    ? 'bg-[#004A98] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                Tính toàn khóa
                            </button>
                            <button
                                onClick={() => setMode('foundationMajor')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'foundationMajor'
                                    ? 'bg-[#004A98] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                Tính Cơ sở ngành
                            </button>
                        </div>
                        {isFoundationMajorModeUnavailable && (
                            <p className="text-[10px] text-orange-600 font-medium">
                                * Chưa có dữ liệu danh mục môn học để lọc riêng Cơ sở ngành.
                            </p>
                        )}
                    </div>

                    {baseResult && (
                        <div className="space-y-6 pt-2 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-500">
                            <GPAPullResultSummary
                                targetGPA={targetGPA}
                                displayCurrentGPA={displayCurrentGPA}
                                displayAccumulatedCredits={displayAccumulatedCredits}
                                scopeName={scopeName}
                                baseResult={baseResult}
                                decimals={decimals}
                            />

                            {baseResult.success && !baseResult.alreadyAchieved && !baseResult.impossible && (
                                <div className="space-y-8">
                                    {nextSemester && (
                                        <GPAPullSemesterTable
                                            nextSemester={nextSemester}
                                            semesterStats={semesterStats}
                                            baseResult={baseResult}
                                            decimals={decimals}
                                        />
                                    )}

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
                    )}
                </div>
            )}
        </div>
    );
}
