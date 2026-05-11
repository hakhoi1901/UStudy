import { AlertCircle } from "lucide-react";
import type { StudentCourseGrade } from "../types";

export function RetakeCourses({ retakeCourses }: { retakeCourses: StudentCourseGrade[] }) {
    return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-semibold text-red-900">Môn học cần học lại ({retakeCourses.length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {retakeCourses.map((course) => (
                    <div key={course.code} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">{course.nameVi}</p>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-500">{course.code}</span>
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                {course.grade.toFixed(1)} điểm
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
