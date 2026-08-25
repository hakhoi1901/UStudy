import type { StudentCourseGrade } from "../types";
import { GPACalculator } from "../services/gpa-calculator";

interface GradeHistoryRowProps {
    course: StudentCourseGrade;
}

export function GradeHistoryRow({ course }: GradeHistoryRowProps) {
    const hasGrade = course.hasGrade ?? course.grade > 0;
    const isExempted = course.isExempted === true || course.semester === 'Miễn';
    const fourPointGrade = hasGrade && !isExempted
        ? GPACalculator.score10ToFourPoint(course.grade)
        : null;
    const letterGrade = fourPointGrade === null ? '---' : GPACalculator.gradeToLetter(fourPointGrade);
    const gradeClass =
        !hasGrade
            ? "text-gray-400 italic"
            : course.grade >= 9
                ? "text-emerald-700"
                : course.grade >= 8
                    ? "text-blue-700"
                    : course.grade >= 7
                        ? "text-amber-700"
                        : course.grade >= 5
                            ? "text-orange-700"
                            : "text-red-700";

    const statusConfig =
        isExempted
            ? {
                  label: "Được miễn",
                  barClass: "bg-sky-500",
                  textClass: "text-sky-700",
              }
            : hasGrade
            ? course.needsRetake
                ? {
                      label: "Cần học lại",
                      barClass: "bg-red-500",
                      textClass: "text-red-700",
                  }
                : {
                      label: "Đạt",
                      barClass: "bg-emerald-500",
                      textClass: "text-emerald-700",
                  }
            : course.status === "ongoing"
                ? {
                      label: course.isCurrentSemester ? "Đang học" : "Chưa có điểm",
                      barClass: "bg-blue-500",
                      textClass: "text-blue-700",
                  }
                : {
                      label: "Chưa có",
                      barClass: "bg-gray-300",
                      textClass: "text-gray-500",
                  };

    return (
        <tr
            className={`transition-colors hover:bg-gray-50 ${
                course.needsRetake ? "bg-red-50/30" : ""
            }`}
        >
            <td className="px-4 py-3 text-sm text-gray-900">
                {course.code}
            </td>

            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {course.nameVi}
            </td>

            <td className="px-4 py-3 text-center text-sm text-gray-600">
                {course.semester}
            </td>

            <td className="px-4 py-3 text-center text-sm">
                <span className="font-semibold tabular-nums text-gray-800">
                    {course.credits} TC
                </span>
            </td>

            <td className="px-4 py-3 text-center">
                <span
                    className={`font-semibold tabular-nums ${gradeClass}`}
                >
                    {hasGrade
                        ? course.grade.toFixed(1)
                        : "---"}
                </span>
            </td>

            <td className="px-4 py-3 text-center">
                <span className="font-semibold tabular-nums text-gray-700">
                    {fourPointGrade === null ? '---' : fourPointGrade.toFixed(1)}
                </span>
            </td>

            <td className="px-4 py-3 text-center">
                <span className="font-semibold text-gray-700">{letterGrade}</span>
            </td>

            <td className="px-4 py-3 text-center">
                <div className="inline-flex items-center gap-2">
                    <span
                        className={`h-4 w-1 rounded-full ${statusConfig.barClass}`}
                    />

                    <span
                        className={`text-sm font-medium ${statusConfig.textClass}`}
                    >
                        {statusConfig.label}
                    </span>
                </div>
            </td>
        </tr>
    );
}
