import type { GPAPullResultSummaryProps } from '../../types';

export function GPAPullResultSummary({
    targetGPA,
    displayCurrentGPA,
    displayAccumulatedCredits,
    scopeName,
    baseResult,
    decimals
}: GPAPullResultSummaryProps) {
    if (targetGPA === null) return null;

    return (
        <div className={`rounded-lg border px-4 py-3 ${
            baseResult?.success
                ? baseResult.alreadyAchieved
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-blue-100 bg-[#EAF3FF]'
                : 'border-rose-200 bg-rose-50'
        }`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500">
                        {scopeName} · GPA hiện tại {displayCurrentGPA.toFixed(decimals)} · {displayAccumulatedCredits} TC
                    </p>
                    {baseResult?.success && !baseResult.alreadyAchieved && baseResult.requiredAverage !== undefined ? (
                        <p className="mt-1 text-sm text-gray-700">
                            Mục tiêu GPA <span className="font-semibold text-gray-900">{targetGPA.toFixed(decimals)}</span> cho {baseResult.remainingCredits} tín chỉ còn lại.
                        </p>
                    ) : (
                        <p className="mt-1 text-sm font-medium text-gray-700">{baseResult?.message ?? 'Chưa có kết quả phù hợp.'}</p>
                    )}
                </div>
                <div className="shrink-0 border-l-2 border-[#004A98] pl-3 sm:text-right">
                    <p className="text-xs font-medium text-[#004A98]">Cần đạt TB</p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums text-[#004A98]">
                        {baseResult?.success && !baseResult.alreadyAchieved
                            ? (baseResult.requiredAverage?.toFixed(decimals) ?? '-')
                            : '-'}
                    </p>
                </div>
            </div>
        </div>
    );
}
