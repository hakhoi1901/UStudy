import { Target, TrendingUp, BookOpen } from 'lucide-react';
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Hiện tại ({scopeName})</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-900">{displayCurrentGPA.toFixed(decimals)}</span>
                    <span className="text-xs text-blue-600">/ {displayAccumulatedCredits} TC</span>
                </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-700 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Mục tiêu</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-indigo-900">{targetGPA.toFixed(decimals)}</span>
                    <span className="text-xs text-indigo-600">GPA</span>
                </div>
            </div>

            <div className={`p-4 rounded-xl border ${baseResult?.success ? (baseResult.alreadyAchieved ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100') : 'bg-red-50 border-red-100'}`}>
                <div className={`flex items-center gap-2 mb-1 ${baseResult?.success ? (baseResult.alreadyAchieved ? 'text-green-700' : 'text-orange-700') : 'text-red-700'}`}>
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Cần đạt trung bình</span>
                </div>
                <div className="flex items-baseline gap-2">
                    {baseResult?.success ? (
                        <span className={`text-2xl font-bold ${baseResult.alreadyAchieved ? 'text-green-900' : 'text-orange-900'}`}>
                            {baseResult.alreadyAchieved ? '—' : (baseResult.requiredAverage?.toFixed(decimals) ?? '—')}
                        </span>
                    ) : (
                        <span className="text-2xl font-bold text-red-900">! ! !</span>
                    )}
                    <span className={`text-xs ${baseResult?.success ? (baseResult.alreadyAchieved ? 'text-green-600' : 'text-orange-600') : 'text-red-600'}`}>
                        {baseResult?.remainingCredits} TC còn lại
                    </span>
                </div>
            </div>
        </div>
    );
}
