import { BookOpen, HelpCircle, ChevronRight } from 'lucide-react';
import type { GPAPullSemesterTableProps } from '../../types';

export function GPAPullSemesterTable({
    nextSemester,
    semesterStats,
    baseResult,
    decimals
}: GPAPullSemesterTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
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

                {semesterStats && (
                    <div className="flex items-center gap-4 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">GPA kỳ tới</span>
                            <span className={`text-sm font-bold ${semesterStats.trend === 'ahead' ? 'text-green-600' :
                                semesterStats.trend === 'behind' ? 'text-orange-600' :
                                    'text-blue-600'
                                }`}>
                                {semesterStats.semesterGpa.toFixed(decimals)}
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Sau kỳ này cần</span>
                            <span className="text-sm font-bold text-gray-800">
                                {semesterStats.newRequiredAvgAfter ? semesterStats.newRequiredAvgAfter.toFixed(decimals) : '—'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Môn học</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Tín chỉ</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Nguồn</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Điểm đề xuất</th>
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

                            const isWarning = !isLocked && displayGrade != null && baseResult?.requiredAverage != null && displayGrade < baseResult.requiredAverage - 0.5;
                            const isHigh = !isLocked && displayGrade != null && displayGrade > 9.0;

                            return (
                                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="text-xs font-bold text-gray-800 leading-tight mb-0.5 line-clamp-1">{course.name}</p>
                                        <p className="text-[10px] text-gray-500 font-mono uppercase">{course.code}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs font-medium text-gray-600">{course.credits}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${course.source === 'ongoing' ? 'bg-blue-50 text-blue-600' :
                                            course.source === 'registration' ? 'bg-purple-50 text-purple-600' :
                                                'bg-gray-50 text-gray-500'
                                            }`}>
                                            {course.source === 'ongoing' ? 'Đang học' :
                                                course.source === 'registration' ? 'Đăng ký' :
                                                    'Tương lai'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {isLocked ? (
                                            <span className="text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1">
                                                Cố định
                                            </span>
                                        ) : (
                                            <span className={`text-[10px] font-bold flex items-center justify-center ${isWarning ? 'text-orange-500' : isHigh ? 'text-green-600' : 'text-blue-500'}`}>
                                                Đề xuất
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-sm font-black ${isLocked ? 'text-gray-400' :
                                                isWarning ? 'text-orange-600' :
                                                    isHigh ? 'text-green-700' :
                                                        'text-[#004A98]'
                                                }`}>
                                                {displayGrade != null ? displayGrade.toFixed(decimals) : '—'}
                                            </span>
                                            {!isLocked && displayGrade != null && (
                                                <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isWarning ? 'bg-orange-500' : isHigh ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${(displayGrade / 10) * 100}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-50/80 border-t border-gray-200">
                        <tr>
                            <td colSpan={4} className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng tín chỉ kỳ tới:</td>
                            <td className="px-4 py-2.5 text-center text-sm font-black text-gray-800">{nextSemester.totalCredits} TC</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
