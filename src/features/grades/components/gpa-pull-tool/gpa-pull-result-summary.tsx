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
        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs font-medium text-gray-500">Hiện tại ({scopeName})</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">{displayCurrentGPA.toFixed(decimals)} <span className="text-xs font-medium text-gray-400">/ {displayAccumulatedCredits} TC</span></p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-xs font-medium text-blue-700">Mục tiêu</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-[#004A98]">{targetGPA.toFixed(decimals)} <span className="text-xs font-medium text-blue-500">GPA</span></p>
                </div>
                <div className={`rounded-lg border px-4 py-3 ${baseResult?.success ? (baseResult.alreadyAchieved ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50') : 'border-rose-200 bg-rose-50'}`}>
                    <p className={`text-xs font-semibold ${baseResult?.success ? (baseResult.alreadyAchieved ? 'text-emerald-700' : 'text-amber-800') : 'text-rose-700'}`}>Cần đạt trung bình</p>
                    <p className={`mt-1 text-2xl font-bold tabular-nums ${baseResult?.success ? (baseResult.alreadyAchieved ? 'text-emerald-800' : 'text-amber-900') : 'text-rose-800'}`}>
                        {baseResult?.success ? (baseResult.alreadyAchieved ? '-' : (baseResult.requiredAverage?.toFixed(decimals) ?? '-')) : '---'}
                    </p>
                    <p className={`mt-0.5 text-xs ${baseResult?.success ? (baseResult.alreadyAchieved ? 'text-emerald-700' : 'text-amber-800') : 'text-rose-700'}`}>{baseResult?.remainingCredits} TC còn lại</p>
                </div>
            </div>

            {baseResult?.success && !baseResult.alreadyAchieved && baseResult.requiredAverage !== undefined && (
                <p className="text-sm text-gray-600">Để đạt GPA {targetGPA.toFixed(decimals)}, bạn cần trung bình <span className="font-semibold text-gray-900">{baseResult.requiredAverage.toFixed(decimals)}</span> cho {baseResult.remainingCredits} tín chỉ còn lại.</p>
            )}
        </div>
    );
}
