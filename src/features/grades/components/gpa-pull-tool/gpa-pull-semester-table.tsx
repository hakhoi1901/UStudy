import { BookOpen, HelpCircle } from 'lucide-react';
import type { GPAPullSemesterTableProps } from '../../types';

export function GPAPullSemesterTable({
    nextSemester,
    semesterStats,
    baseResult,
    decimals
}: GPAPullSemesterTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 md:px-5">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#004A98]" />
                    <h4 className="text-sm font-semibold text-gray-800">Dự kiến Học kỳ tới</h4>
                    <div className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-[11px] rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                            Dựa trên các môn bạn đang học hoặc đã đăng ký trong Simulator. Hệ thống đề xuất điểm để đạt mục tiêu.
                        </div>
                    </div>
                </div>

                <div className="text-right text-sm">
                    <p className="font-semibold text-[#004A98]">GPA cần đạt: {baseResult?.requiredAverage?.toFixed(decimals) ?? '-'}</p>
                    {semesterStats && <p className="mt-0.5 text-xs text-gray-500">GPA sau kỳ: {semesterStats.semesterGpa.toFixed(decimals)}</p>}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500">Môn học</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">TC</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Tình trạng</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Điểm đề xuất</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {nextSemester.courses.map((course) => {
                            const isLocked = course.isLocked;
                            const displayGrade = isLocked && course.lockedGrade != null
                                ? course.lockedGrade
                                : course.projectedGrade != null
                                    ? course.projectedGrade
                                    : course.suggestedGrade;

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
                                            {course.source === 'ongoing' ? 'Đang học' : course.source === 'registration' ? 'Đăng ký' : 'Tương lai'} · {isLocked ? 'Cố định' : 'Đề xuất'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-base font-bold tabular-nums ${gradeClass}`}>
                                            {displayGrade != null ? displayGrade.toFixed(decimals) : '-'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-50/80 border-t border-gray-200">
                        <tr><td colSpan={3} className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Tổng tín chỉ kỳ tới</td><td className="px-4 py-3 text-center text-sm font-bold text-gray-800">{nextSemester.totalCredits} TC</td></tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
