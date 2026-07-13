import { GPA_CONFIG, ACADEMIC_RULES } from '../../../../constants';
import type { GPAPullInputSectionProps } from '../../types';

export function GPAPullInputSection({
    targetGPAInput,
    setTargetGPAInput,
    targetGpaError,
    minTargetGpa,
    mode,
    setMode,
    isFoundationMajorModeUnavailable,
    onCalculate,
    isCalculateDisabled,
    isGuidanceActive,
    baseResult,
    semesterStats,
    scopeName,
    projectedScopeGPA,
    projectedScopeCredits,
    decimals,
}: GPAPullInputSectionProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-start gap-2 sm:items-center">
                    <label htmlFor="gpa-pull-target" className="w-24 text-sm font-medium text-gray-700">
                        GPA mục tiêu
                    </label>
                    <div className="flex flex-1 flex-wrap items-start gap-2">
                        <input
                            id="gpa-pull-target"
                            type="number"
                            min={minTargetGpa}
                            max={ACADEMIC_RULES.MAX_GPA}
                            step={0.1}
                            value={targetGPAInput}
                            onChange={(e) => setTargetGPAInput(e.target.value)}
                            placeholder="8.0"
                            aria-label="GPA mong muốn lúc ra trường"
                            className={`w-24 px-3 py-2 bg-gray-50 border rounded-lg text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:border-transparent ${targetGpaError
                                ? 'border-red-300 focus:ring-red-300'
                                : 'border-gray-200 focus:ring-[#004A98]'
                                }`}
                        />
                        {GPA_CONFIG.slice(0, 4).map((config) => (
                            <button
                                key={config.value}
                                type="button"
                                onClick={() => setTargetGPAInput(String(config.value))}
                                className="min-w-10 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#004A98] hover:bg-[#EAF3FF] hover:text-[#004A98]"
                            >
                                {config.value}
                            </button>
                        ))}
                        <div className="w-full min-h-[1.25rem]">
                            {targetGpaError && (
                                <p className="text-sm text-red-600" role="alert" aria-live="polite">
                                    {targetGpaError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-start gap-2 sm:items-center">
                    <span className="w-24 pt-2 text-sm font-medium text-gray-700">Phạm vi</span>
                    <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                        {[
                            { id: 'all' as const, label: 'Toàn khóa' },
                            { id: 'foundationMajor' as const, label: 'Cơ sở ngành' },
                            { id: 'currentSemester' as const, label: 'Kỳ này' },
                        ].map((scope) => (
                        <button
                            key={scope.id}
                            type="button"
                            disabled={scope.id === 'foundationMajor' && isFoundationMajorModeUnavailable}
                            onClick={() => setMode(scope.id)}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${mode === scope.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-700'} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                            {scope.label}
                        </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={onCalculate}
                        disabled={isCalculateDisabled}
                        className="rounded-lg bg-[#004A98] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#003A78] disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        {mode === 'currentSemester' ? 'Tính GPA kỳ này' : 'Gợi ý điểm để đạt mục tiêu'}
                    </button>
                    {isFoundationMajorModeUnavailable && <p className="w-full pl-24 text-xs text-amber-700">Chưa có dữ liệu danh mục để tính riêng Cơ sở ngành.</p>}
                    <p className="w-full pl-24 text-xs text-gray-500">Bạn có thể nhập điểm dự đoán trực tiếp ở bảng bên dưới mà không cần bật gợi ý.</p>
                </div>
            </div>

            <div className="min-w-[220px] border-l-5 border-[#004A98] py-1 pl-4 lg:w-[260px] lg:pl-5">
                {isGuidanceActive ? (
                    <>
                        <p className="text-xs font-medium text-gray-500">GPA cần đạt kỳ này</p>
                        <p className="mt-0.5 text-3xl font-bold tabular-nums text-[#004A98]">{baseResult?.requiredAverage?.toFixed(decimals) ?? '-'}</p>
                        <p className="mt-1 text-sm text-gray-600">Sau kỳ còn cần: <span className="font-semibold tabular-nums text-gray-800">{semesterStats?.newRequiredAvgAfter?.toFixed(decimals) ?? '-'}</span></p>
                    </>
                ) : (
                    <>
                        <p className="text-xs font-medium text-gray-500">GPA {scopeName.toLowerCase()} dự kiến</p>
                        <p className="mt-0.5 text-3xl font-bold tabular-nums text-[#004A98]">{projectedScopeGPA.toFixed(decimals)}</p>
                        <p className="mt-1 text-sm text-gray-600">Đã nhập điểm: <span className="font-semibold tabular-nums text-gray-800">{projectedScopeCredits} TC</span></p>
                    </>
                )}
            </div>
        </div>
    );
}
