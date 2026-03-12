import { ChartBarBigIcon, FlaskConicalIcon } from "lucide-react";


interface SemesterGPA {
    semester: string;
    gpa: number;
    credits: number;
    earnedCredits: number;
}

interface GPAInformationProps {
    currentGPA: number;
    projectedGPA: number;
    getClassification: (gpa: number) => string;
    gpaPerSemester?: SemesterGPA[];
    majorGPA?: number;
}

function getGpaColor(gpa: number): string {
    if (gpa >= 9.0) return 'text-green-600';
    if (gpa >= 8.0) return 'text-blue-600';
    if (gpa >= 7.0) return 'text-yellow-600';
    if (gpa >= 6.5) return 'text-orange-500';
    if (gpa >= 5.0) return 'text-orange-600';
    return 'text-red-600';
}

export function GPAsem({ getClassification, gpaPerSemester = [], majorGPA = 0 }: GPAInformationProps) {
    const hasSemesterData = gpaPerSemester.length > 0;
    const hasMajorGPA = majorGPA > 0;

    return (
        <div>
            {
                (hasSemesterData || hasMajorGPA) && (

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                            <ChartBarBigIcon className="w-8 h-8 text-[#004A98]" />
                            <h3 className="text-sm font-semibold text-gray-800">GPA theo học kỳ</h3>

                        </div>

                        {hasSemesterData ? (
                            <div className="p-4">
                                {/* Table summary */}
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
                                                            <span className={`font-bold ${getGpaColor(s.gpa)}`}>
                                                                {s.gpa.toFixed(3)}
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
                                                                <div className="text-gray-400 text-sm">—</div>
                                                            ) : (
                                                                <div className={`text-sm font-medium ${diff > 0.05 ? 'text-green-600' : diff < -0.05 ? 'text-red-600' : 'text-gray-500'}`}>
                                                                    {diff > 0 ? '+' : ''}{diff.toFixed(3)}
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
                        ) : (
                            <div className="p-8 text-center text-sm text-gray-400">
                                Chưa có đủ dữ liệu điểm theo kỳ
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    )
}