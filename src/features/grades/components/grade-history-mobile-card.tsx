import type { StudentCourseGrade } from "../types";

interface GradeHistoryMobileCardProps {
    course: StudentCourseGrade;
}

export function GradeHistoryMobileCard({ course }: GradeHistoryMobileCardProps) {
    return (
        <div className={`px-4 py-3 ${course.needsRetake ? 'bg-red-50/40' : ''}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-900">{course.nameVi}</p>
                    <p className="text-[10px] text-gray-600">{course.code}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-md font-semibold text-xs ${course.grade > 0 ? (
                        course.grade >= 9.0 ? 'bg-green-100 text-green-700' :
                            course.grade >= 8.0 ? 'bg-blue-100 text-blue-700' :
                                course.grade >= 7.0 ? 'bg-yellow-100 text-yellow-700' :
                                    course.grade >= 5.0 ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                    ) : 'bg-gray-100 text-gray-400'
                        }`}>
                        {course.grade > 0 ? course.grade.toFixed(1) : '—'}
                    </span>
                    {course.grade > 0 ? (
                        course.needsRetake ? (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full font-medium">Học lại</span>
                        ) : (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium">Đạt</span>
                        )
                    ) : (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium">
                            {course.status === 'ongoing' ? 'Đang học' : 'Chưa có'}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-gray-500">{course.semester}</span>
                <span className="text-gray-300">•</span>
                <span className="text-[10px] text-gray-500">{course.credits} TC</span>
            </div>
        </div>
    );
}
