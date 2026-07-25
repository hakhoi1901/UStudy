import { GPA_CONFIG, ACADEMIC_RULES } from '../../../../constants';
import type { GPAPullInputSectionProps } from '../../types';

const scopes = [
    { id: 'all' as const, label: 'Toàn khóa' },
    { id: 'foundationMajor' as const, label: 'Cơ sở ngành' },
    { id: 'currentSemester' as const, label: 'Kỳ này' },
];

export function GPAPullInputSection({
    planningIntent,
    targetGPAInput,
    setTargetGPAInput,
    targetGpaError,
    minTargetGpa,
    maxTargetGpa,
    mode,
    setMode,
    isFoundationMajorModeUnavailable,
    onCalculate,
    isCalculateDisabled,
    isGuidanceActive,
    targetGPA,
    baseResult,
    semesterStats,
    scopeName,
    displayCurrentGPA,
    displayAccumulatedCredits,
    projectedScopeGPA,
    projectedScopeCredits,
    decimals,
}: GPAPullInputSectionProps) {
    const isGoalMode = planningIntent === 'goal';
    const hasProjectedGrades = projectedScopeCredits > 0;

    const projectionSummary = (() => {
        if (!isGoalMode) {
            return (
                <>
                    <p className="text-[11px] font-medium leading-4 text-gray-500 sm:text-xs">GPA {scopeName.toLowerCase()} dự kiến</p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums text-[#004A98] sm:text-3xl">
                        {hasProjectedGrades ? projectedScopeGPA.toFixed(decimals) : '-'}
                    </p>
                    <p className="mt-1 text-xs leading-4 text-gray-600 sm:text-sm">
                        {hasProjectedGrades
                            ? <>Đã có dữ liệu: <span className="font-semibold tabular-nums text-gray-800">{projectedScopeCredits} TC</span></>
                            : <>Hiện tại: <span className="font-semibold tabular-nums text-gray-800">{displayCurrentGPA.toFixed(decimals)} · {displayAccumulatedCredits} TC</span></>}
                    </p>
                </>
            );
        }

        if (!isGuidanceActive || targetGPA === null) {
            return (
                <>
                    <p className="text-[11px] font-medium leading-4 text-gray-500 sm:text-xs">GPA {scopeName.toLowerCase()} muốn đạt</p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums text-[#004A98] sm:text-3xl">{targetGPA?.toFixed(decimals) ?? '-'}</p>
                    <p className="mt-1 text-xs leading-4 text-gray-600 sm:text-sm">Nhập mục tiêu để tạo gợi ý điểm.</p>
                </>
            );
        }

        if (!baseResult?.success || baseResult.impossible) {
            return (
                <>
                    <p className="text-[11px] font-medium leading-4 text-red-600 sm:text-xs">Chưa thể tạo kế hoạch</p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums text-red-600 sm:text-3xl">-</p>
                    <p className="mt-1 text-xs leading-4 text-gray-600 sm:text-sm">{baseResult?.message ?? 'Chưa có đủ dữ liệu để tính toán.'}</p>
                </>
            );
        }

        if (baseResult.alreadyAchieved) {
            return (
                <>
                    <p className="text-[11px] font-medium leading-4 text-emerald-700 sm:text-xs">Đã đạt mục tiêu</p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums text-emerald-700 sm:text-3xl">{targetGPA.toFixed(decimals)}</p>
                    <p className="mt-1 text-xs leading-4 text-gray-600 sm:text-sm">{baseResult.message}</p>
                </>
            );
        }

        return (
            <>
                <p className="text-[11px] font-medium leading-4 text-gray-500 sm:text-xs">GPA cần đạt kỳ này</p>
                <p className="mt-0.5 text-2xl font-bold tabular-nums text-[#004A98] sm:text-3xl">{baseResult.requiredAverage?.toFixed(decimals) ?? '-'}</p>
                <p className="mt-1 text-xs leading-4 text-gray-600 sm:text-sm">
                    Sau kỳ còn cần: <span className="font-semibold tabular-nums text-gray-800">{semesterStats?.newRequiredAvgAfter?.toFixed(decimals) ?? '-'}</span>
                </p>
            </>
        );
    })();

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
                {isGoalMode && (
                    <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(112px,0.72fr)] gap-3 lg:block">
                        <div className="flex min-w-0 flex-col items-start gap-2 lg:flex-row lg:flex-wrap lg:items-center">
                            <label htmlFor="gpa-pull-target" className="text-sm font-medium text-gray-700 lg:w-24">
                                GPA mục tiêu
                            </label>
                            <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
                                <input
                                    id="gpa-pull-target"
                                    type="number"
                                    min={minTargetGpa}
                                    max={maxTargetGpa ?? ACADEMIC_RULES.MAX_GPA}
                                    step={0.1}
                                    value={targetGPAInput}
                                    onChange={(event) => setTargetGPAInput(event.target.value)}
                                    placeholder="8.0"
                                    aria-label="GPA mong muốn"
                                    className={`w-full max-w-28 rounded-lg border bg-gray-50 px-3 py-2 text-sm font-semibold tabular-nums outline-none focus:ring-2 lg:w-24 ${targetGpaError
                                        ? 'border-red-300 focus:ring-red-300'
                                        : 'border-gray-200 focus:border-transparent focus:ring-[#004A98]'
                                        }`}
                                />
                                <div className="desktop-only">
                                    {GPA_CONFIG.slice(0, 4).map((config) => (
                                        <button
                                            key={config.value}
                                            type="button"
                                            onClick={() => setTargetGPAInput(String(config.value))}
                                            className="mx-1 min-w-10 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#004A98] hover:bg-[#EAF3FF] hover:text-[#004A98]"
                                        >
                                            {config.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0 border-l-4 border-[#004A98] py-0.5 pl-3 lg:hidden">
                            {projectionSummary}
                        </div>
                    </div>
                )}

                {!isGoalMode && (
                    <div className="border-l-4 border-[#004A98] py-0.5 pl-3 lg:hidden">
                        {projectionSummary}
                    </div>
                )}

                <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:flex-wrap lg:items-center">
                    <span className="text-sm font-medium text-gray-700 lg:w-24">Phạm vi</span>
                    <div className="grid w-full grid-cols-3 rounded-lg border border-gray-200 bg-gray-50 p-1 lg:flex lg:w-auto">
                        {scopes.map((scope) => (
                            <button
                                key={scope.id}
                                type="button"
                                disabled={scope.id === 'foundationMajor' && isFoundationMajorModeUnavailable}
                                onClick={() => setMode(scope.id)}
                                className={`min-w-0 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors lg:px-3 ${mode === scope.id
                                    ? 'bg-white text-[#004A98] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {scope.label}
                            </button>
                        ))}
                    </div>

                    {isGoalMode && (
                        <button
                            type="button"
                            onClick={onCalculate}
                            disabled={isCalculateDisabled}
                            className="w-full rounded-lg bg-[#004A98] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#003A78] disabled:cursor-not-allowed disabled:bg-gray-300 lg:w-auto lg:py-2"
                        >
                            {isGuidanceActive ? 'Tính lại gợi ý' : mode === 'currentSemester' ? 'Tính GPA kỳ này' : 'Gợi ý điểm để đạt mục tiêu'}
                        </button>
                    )}
                </div>

                {isFoundationMajorModeUnavailable && (
                    <p className="text-xs text-amber-700 lg:pl-24">Chưa có dữ liệu danh mục để tính riêng Cơ sở ngành.</p>
                )}

                {isGoalMode && targetGpaError ? (
                    <p className="text-xs font-medium leading-5 text-red-600 lg:pl-24" role="alert" aria-live="polite">{targetGpaError}</p>
                ) : isGoalMode && maxTargetGpa !== null && mode !== 'currentSemester' ? (
                    <p className="text-[11px] leading-4 text-gray-500 lg:pl-24">
                        GPA tối đa có thể đạt trong phạm vi này: <span className="font-semibold tabular-nums text-gray-700">{maxTargetGpa.toFixed(decimals)}</span>
                    </p>
                ) : (
                    <p className="text-xs leading-5 text-gray-500 lg:pl-24">Nhập điểm dự kiến ở danh sách môn bên dưới để cập nhật GPA.</p>
                )}
            </div>

            <div className="hidden min-w-[220px] border-l-4 border-[#004A98] py-1 pl-4 lg:block lg:w-[260px] lg:pl-5">
                {projectionSummary}
            </div>
        </div>
    );
}
