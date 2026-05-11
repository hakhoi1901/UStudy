import type { StudentCourseGrade } from "../types";

interface GradeHistoryRowProps {
    course: StudentCourseGrade;
}

export function GradeHistoryRow({ course }: GradeHistoryRowProps) {
    return (
        <tr className={`hover:bg-gray-50 ${course.needsRetake ? 'bg-red-50/30' : ''}`}>
            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {course.code}
            </td>
            <td className="px-4 py-3 text-sm text-gray-900">
                {course.nameVi}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 text-center">
                {course.semester}
            </td>
            <td className="px-4 py-3 text-sm text-gray-900 text-center">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {course.credits} TC
                </span>
            </td>
            <td className="px-4 py-3 text-center">
                <span className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${course.grade > 0 ? (
                    course.grade >= 9.0 ? 'bg-green-100 text-green-700' :
                        course.grade >= 8.0 ? 'bg-blue-100 text-blue-700' :
                            course.grade >= 7.0 ? 'bg-yellow-100 text-yellow-700' :
                                course.grade >= 5.0 ? 'bg-orange-100 text-orange-700' :
                                    'bg-red-100 text-red-700'
                ) : 'bg-gray-100 text-gray-400 italic'}`}>
                    {course.grade > 0 ? course.grade.toFixed(1) : "—"}
                </span>
            </td>
            <td className="px-4 py-3 text-center">
                {course.grade > 0 ? (
                    course.needsRetake ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                            Cần học lại
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Đạt
                        </span>
                    )
                ) : (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium italic">
                        {course.status === 'ongoing' ? 'Đang học' : 'Chưa có'}
                    </span>
                )}
            </td>
        </tr>
    );
}
