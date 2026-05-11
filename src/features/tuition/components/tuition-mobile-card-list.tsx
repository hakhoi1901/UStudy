import type { TuitionCourse, TuitionSummary } from "../types";

export function TuitionMobileCardList({
    currentSemesterData,
    currentSemesterSummary,
}: {
    currentSemesterData: TuitionCourse[],
    currentSemesterSummary: TuitionSummary,
}) {
    return (
        <div className="md:hidden divide-y divide-gray-100">
            {currentSemesterData.map((course) => (
                <div key={course.stt} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-mono font-bold text-[#004A98]">{course.courseCode}</p>
                            <p className="text-xs font-medium text-gray-900 mt-0.5 truncate">{course.courseName}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{course.credits} TC • {course.tuitionCredits} TC HP • {course.periods} tiết</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className="text-xs font-bold text-[#004A98]">{new Intl.NumberFormat('vi-VN').format(course.actualFee)}₫</p>
                            {course.discount > 0 && <p className="text-[10px] text-green-600">-{new Intl.NumberFormat('vi-VN').format(course.discount)}₫</p>}
                        </div>
                    </div>
                </div>
            ))}
            {/* Mobile total */}
            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Tổng cộng</span>
                <span className="text-sm font-bold text-[#004A98]">{new Intl.NumberFormat('vi-VN').format(currentSemesterSummary.totalFee)}₫</span>
            </div>
        </div>
    )
}
