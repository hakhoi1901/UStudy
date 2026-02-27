import type { StudentCourseGrade } from '../../types';

export function RetakeCourses({ retakeCourses }: { retakeCourses: StudentCourseGrade[], }) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <h3 className="text-red-900 font-semibold">Môn học cần học lại</h3>
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                    {retakeCourses.length}
                </span>
            </div>

            {/* Thông tin mỗi môn học (mã môn, tên môn, số tín chỉ, điểm số, xếp loại) */}
            <div className="space-y-2">
                {retakeCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between bg-white border border-red-200 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-4">
                            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                Cần học lại
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{course.code} - {course.nameVi}</p>
                                <p className="text-xs text-gray-600">{course.semester}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-red-700">Điểm: {course.grade.toFixed(1)}</p>
                            <p className="text-xs text-gray-600">{course.credits} tín chỉ</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}