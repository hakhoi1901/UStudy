import { ChevronUp, ChevronDown } from "lucide-react";
import type { Course } from "../../types";

export function GPASimulation({
    courses,
    expandedSection,
    setExpandedSection,
    handleGradeChange,
    projectedGPA,
    getClassification
}: {
    courses: Course[],
    expandedSection: string,
    setExpandedSection: (section: "history" | "simulator") => void,
    handleGradeChange: (id: string, grade: string) => void,
    projectedGPA: number,
    getClassification: (gpa: number) => string
}) {

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
                onClick={() => setExpandedSection(expandedSection === 'simulator' ? 'history' : 'simulator')}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-gray-900">Mô phỏng GPA - Học kỳ tiếp theo</h3>
                    <span className="px-2 py-0.5 bg-[#004A98] text-white text-xs rounded-full">
                        {courses.length} môn
                    </span>
                </div>
                {expandedSection === 'simulator' ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
            </button>

            {/* Mô phỏng GPA - Học kỳ tiếp theo */}
            {expandedSection === 'simulator' && (
                <div className="overflow-x-auto">

                    {/* Bảng danh sách môn học */}
                    <table className="w-full">

                        {/* Tiêu đề bảng */}
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                    Mã môn
                                </th>
                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                    Tên môn học
                                </th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                    Tín chỉ
                                </th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                    Điểm dự phóng
                                </th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                    Xếp loại
                                </th>
                            </tr>
                        </thead>

                        {/* Nội dung bảng danh sách môn học */}
                        <tbody className="divide-y divide-gray-200">

                            {/* Thông tin mỗi môn học */}
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50">

                                    {/* Mã môn học */}
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {course.id}
                                    </td>

                                    {/* Tên môn học */}
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {course.nameVi}
                                    </td>

                                    {/* Số tín chỉ */}
                                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                            {course.credits} TC
                                        </span>
                                    </td>

                                    {/* Điểm dự kiến */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={course.projectedGrade ?? 0}
                                            onChange={(e) => handleGradeChange(course.id, e.target.value)}
                                            className="w-20 px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                                        />
                                    </td>

                                    {/* Xếp loại dự kiến */}
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(course.projectedGrade ?? 0) >= 9.0 ? 'bg-green-100 text-green-700' :
                                            (course.projectedGrade ?? 0) >= 8.0 ? 'bg-blue-100 text-blue-700' :
                                                (course.projectedGrade ?? 0) >= 7.0 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-orange-100 text-orange-700'
                                            }`}>
                                            {getClassification(course.projectedGrade ?? 0)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        {/* Tổng kết */}
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                            <tr>
                                <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900">
                                    Tổng kết
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-semibold">
                                    {courses.reduce((sum, c) => sum + c.credits, 0)} TC
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-semibold text-[#004A98]">
                                    GPA: {projectedGPA.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-semibold">
                                    {getClassification(projectedGPA)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    )
}