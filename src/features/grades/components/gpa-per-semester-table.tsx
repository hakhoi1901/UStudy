import { ChartBarBigIcon } from "lucide-react";
import type { GPAPerSemesterTableProps } from "../types";
import { GradeUIHelpers } from "../utils/grade-ui-helpers";
import { ACADEMIC_RULES } from "../../../constants";

export function GPAPerSemesterTable({ getClassification, gpaPerSemester = [] }: GPAPerSemesterTableProps) {
    const hasSemesterData = gpaPerSemester.length > 0;

    return (
        <div>
            {hasSemesterData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 md:px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                        <ChartBarBigIcon className="w-6 h-6 md:w-8 md:h-8 text-[#004A98]" />
                        <h3 className="text-sm font-semibold text-gray-800">GPA theo học kỳ</h3>
                    </div>

                    {/* Mobile: Card view */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {gpaPerSemester.map((s, i) => {
                            const prevGPA = i > 0 ? gpaPerSemester[i - 1].gpa : null;
                            const diff = prevGPA !== null ? s.gpa - prevGPA : null;
                            return (
                                <div key={s.semester} className="px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-800">{s.semester}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{s.credits} TC tính GPA</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {diff !== null && (
                                            <span className={`text-[10px] font-medium ${diff > 0.05 ? 'text-green-600' : diff < -0.05 ? 'text-red-600' : 'text-gray-500'}`}>
                                                {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${GradeUIHelpers.getGpaBadgeClass(s.gpa)}`}>
                                            {s.gpa.toFixed(ACADEMIC_RULES.UI.PULL_DECIMALS)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop: Table view */}
                    <div className="hidden md:block p-4">
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Học kỳ</th>
                                        <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">GPA kỳ</th>
                                        <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">TC tính GPA</th>
                                        <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">Xếp loại</th>
                                        <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">Xu hướng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {gpaPerSemester.map((s, i) => {
                                        const prevGPA = i > 0 ? gpaPerSemester[i - 1].gpa : null;
                                        const diff = prevGPA !== null ? s.gpa - prevGPA : null;
                                        return (
                                            <tr key={s.semester} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 py-4 text-sm font-medium text-gray-800">{s.semester}</td>
                                                <td className="px-3 py-3 text-sm text-center">
                                                    <span className={`font-bold ${GradeUIHelpers.getGpaColorClass(s.gpa)}`}>
                                                        {s.gpa.toFixed(ACADEMIC_RULES.UI.HISTORY_DECIMALS)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-sm text-center text-gray-600">{s.credits}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${s.gpa >= 9.0 ? 'bg-green-100 text-green-700' :
                                                        s.gpa >= 8.0 ? 'bg-blue-100 text-blue-700' :
                                                            s.gpa >= 7.0 ? 'bg-yellow-100 text-yellow-700' :
                                                                s.gpa >= 6.5 ? 'bg-orange-100 text-orange-600' :
                                                                    s.gpa >= 5.0 ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-red-100 text-red-700'
                                                        }`}>
                                                        {getClassification(s.gpa)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-sm text-center">
                                                    {diff === null ? (
                                                        <div className="text-gray-400 text-sm">-</div>
                                                    ) : (
                                                        <div className={`text-sm font-medium ${diff > 0.05 ? 'text-green-600' : diff < -0.05 ? 'text-red-600' : 'text-gray-500'}`}>
                                                            {diff > 0 ? '+' : ''}{diff.toFixed(ACADEMIC_RULES.UI.HISTORY_DECIMALS)}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
