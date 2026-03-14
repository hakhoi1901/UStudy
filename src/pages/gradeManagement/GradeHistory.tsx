import { Filter, History } from "lucide-react";
import type { StudentCourseGrade } from "../../types";

export function GradeHistory({ filteredHistory, selectedSemester, uniqueSemesters, setSelectedSemester }: { filteredHistory: StudentCourseGrade[], selectedSemester: string, uniqueSemesters: string[], setSelectedSemester: (semester: string) => void }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <History className="w-8 h-8 text-[#004A98]" />
                    <h3 className="text-sm font-semibold text-gray-800">Lịch sử điểm</h3>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                        {filteredHistory.length} môn
                    </span>
                </div>

                {/* Lọc theo học kỳ */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98]"
                    >
                        <option value="all">Tất cả học kỳ</option>
                        {uniqueSemesters.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bảng lịch sử điểm */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                Mã môn
                            </th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                Tên môn học
                            </th>
                            <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                Học kỳ
                            </th>
                            <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                Tín chỉ
                            </th>
                            <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                Điểm
                            </th>
                            <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                Trạng thái
                            </th>
                        </tr>
                    </thead>


                    {/* Danh sách các môn học */}
                    <tbody className="divide-y divide-gray-200">
                        {filteredHistory.filter(course => course.code !== 'BAA00100').map((course) => (
                            <tr key={course.id} className={`hover:bg-gray-50 ${course.needsRetake ? 'bg-red-50/30' : ''}`}>
                                {/* Mã môn */}
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {course.code}
                                </td>
                                {/* Tên môn học */}
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {course.nameVi}
                                </td>
                                {/* Học kỳ */}
                                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                    {course.semester}
                                </td>
                                {/* Số tín chỉ */}
                                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                        {course.credits} TC
                                    </span>
                                </td>
                                {/* Điểm số */}
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${course.grade >= 9.0 ? 'bg-green-100 text-green-700' :
                                        course.grade >= 8.0 ? 'bg-blue-100 text-blue-700' :
                                            course.grade >= 7.0 ? 'bg-yellow-100 text-yellow-700' :
                                                course.grade >= 5.0 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>
                                        {course.grade.toFixed(1)}
                                    </span>
                                </td>
                                {/* Trạng thái */}
                                <td className="px-4 py-3 text-center">
                                    {course.needsRetake ? (
                                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                            Cần học lại
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                            Đạt
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}