import { BookOpen, HelpCircle } from 'lucide-react';
import type { GPAPullSemesterTableProps } from '../../types';

export function GPAPullSemesterTable({
    nextSemester,
    decimals,
    isGuidanceActive,
    onGradeChange,
}: GPAPullSemesterTableProps) {
    return (
        <div className="overflow-hidden bg-white">
            

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500">Môn học</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">TC</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Tình trạng</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Điểm dự kiến</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {nextSemester.courses.map((course) => {
                            const isLocked = course.isLocked;
                            const manualGrade = isLocked && course.lockedGrade != null
                                ? course.lockedGrade
                                : course.projectedGrade != null
                                    ? course.projectedGrade
                                    : null;
                            const displayGrade = manualGrade ?? (isGuidanceActive ? course.suggestedGrade : null);

                            const gradeClass = isLocked
                                ? 'text-gray-400'
                                : displayGrade != null && displayGrade > 9.5
                                    ? 'text-rose-700'
                                    : displayGrade != null && displayGrade > 9
                                        ? 'text-amber-700'
                                        : displayGrade != null && displayGrade >= 8
                                            ? 'text-[#004A98]'
                                            : 'text-emerald-700';

                            return (
                                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="mb-0.5 text-sm font-semibold leading-tight text-gray-800 line-clamp-1">{course.name}</p>
                                        <p className="text-[11px] font-mono text-gray-500 uppercase">{course.code}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-sm font-medium text-gray-600">{course.credits}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs font-medium text-gray-600">
                                            {course.source === 'ongoing' ? 'Đang học' : course.source === 'registration' ? 'Đăng ký' : 'Tương lai'} · {manualGrade !== null ? 'Đã nhập' : isGuidanceActive ? 'Gợi ý' : 'Chưa nhập'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={manualGrade ?? ''}
                                                placeholder={isGuidanceActive && course.suggestedGrade != null ? course.suggestedGrade.toFixed(decimals) : '-'}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    if (value === '') {
                                                        onGradeChange(course.code, null);
                                                        return;
                                                    }
                                                    const grade = Number(value);
                                                    if (!Number.isFinite(grade)) return;
                                                    onGradeChange(course.code, Math.max(0, Math.min(10, grade)));
                                                }}
                                                className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-sm font-semibold tabular-nums text-gray-900 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
                                                aria-label={`Điểm dự kiến ${course.name}`}
                                            />
                                            {manualGrade === null && displayGrade != null && <span className={`text-sm font-bold tabular-nums ${gradeClass}`}>≈ {displayGrade.toFixed(decimals)}</span>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-50/80 border-t border-gray-200">
                        <tr><td colSpan={3} className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Tổng tín chỉ kỳ này</td><td className="px-4 py-3 text-center text-sm font-bold text-gray-800">{nextSemester.totalCredits} TC</td></tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
