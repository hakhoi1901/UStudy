import { ArrowUpNarrowWideIcon } from "lucide-react";
import type { SimulatorCourseGrade } from "../types";

interface GPASimulationTableProps {
    courses: SimulatorCourseGrade[];
    handleGradeChange: (id: string, grade: number | null) => void;
    semesterGPA: number;
    cumulativeGPA: number;
    getClassification: (gpa: number) => string;
}

export function GPASimulationTable({
    courses,
    handleGradeChange,
    semesterGPA,
    cumulativeGPA,
    getClassification
}: GPASimulationTableProps) {

    return (
        <div className="ustudy-card">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-gray-100 px-4 py-3 md:px-5">
                <ArrowUpNarrowWideIcon className="h-5 w-5 text-[#004A98]" />
                <h3 className="text-sm font-semibold text-gray-800">Mô phỏng GPA kỳ tiếp theo</h3>
                <span className="text-xs text-gray-500">
                    {courses.length} môn · {courses.reduce((sum, course) => sum + (course.credits ?? 0), 0)} tín chỉ
                </span>
            </div>

            <div className="overflow-x-auto">
                    {courses.length === 0 && (
                        <div className="px-6 py-10 text-center text-gray-500">
                            <p className="text-sm font-medium">Chưa có môn học nào.</p>
                            <p className="text-xs mt-1 text-gray-400">
                                Import dữ liệu từ portal HCMUS để bắt đầu mô phỏng GPA.
                            </p>
                        </div>
                    )}

                    {courses.length > 0 && (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                        Mã môn
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                        Tên môn học
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                        Tín chỉ
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                        Điểm dự đoán
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                                        Xếp loại
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {courses.map((course) => {
                                    const classification =
                                        course.projectedGrade !== null
                                            ? getClassification(course.projectedGrade)
                                            : null;

                                    const classificationClass =
                                        course.projectedGrade === null
                                            ? "text-gray-400"
                                            : course.projectedGrade >= 9
                                                ? "text-emerald-700"
                                                : course.projectedGrade >= 8
                                                    ? "text-blue-700"
                                                    : course.projectedGrade >= 7
                                                        ? "text-amber-700"
                                                        : "text-orange-700";
                             return (
                                    <tr key={course.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {course.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span>{course.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`h-4 w-1 rounded-full ${
                                                        course.source === "ongoing"
                                                            ? "bg-emerald-500"
                                                            : "bg-blue-500"
                                                    }`}
                                                />

                                                <span className="font-medium text-gray-700">
                                                    {course.source === "ongoing"
                                                        ? "Đang học"
                                                        : "Đã đăng ký"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm">
                                            {course.credits !== null ? (
                                                <>
                                                    <span className="font-semibold tabular-nums text-gray-800">
                                                        {course.credits} TC
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={course.projectedGrade ?? ""}
                                                placeholder="-"
                                                onChange={(e) => {
                                                    const val = e.target.value;

                                                    if (val === "") {
                                                        handleGradeChange(course.code, null);
                                                        return;
                                                    }

                                                    const numberValue = Number(val);

                                                    if (Number.isNaN(numberValue)) return;

                                                    handleGradeChange(
                                                        course.code,
                                                        Math.min(10, Math.max(0, numberValue))
                                                    );
                                                }}
                                                className="w-20 rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-center text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#004A98]"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm">
                                            <span className={`font-semibold ${classificationClass}`}>
                                                {classification ?? "Chưa có"}
                                            </span>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>

                        </table>
                    )}
            </div>

            {courses.length > 0 && (
                <div className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm md:grid-cols-4 md:px-5">
                    <div><p className="text-xs text-gray-500">Tín chỉ dự kiến</p><p className="mt-0.5 font-semibold text-gray-900">{courses.reduce((sum, course) => sum + (course.credits ?? 0), 0)} TC</p></div>
                    <div><p className="text-xs text-gray-500">GPA kỳ</p><p className="mt-0.5 font-semibold text-[#004A98]">{semesterGPA.toFixed(2)}</p></div>
                    <div><p className="text-xs text-gray-500">GPA tích lũy</p><p className="mt-0.5 font-semibold text-gray-900">{cumulativeGPA.toFixed(2)}</p></div>
                    <div><p className="text-xs text-gray-500">Xếp loại</p><p className="mt-0.5 font-semibold text-gray-900">{getClassification(cumulativeGPA)}</p></div>
                </div>
            )}
        </div>
    )
}
