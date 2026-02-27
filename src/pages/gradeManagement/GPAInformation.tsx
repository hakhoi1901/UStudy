import { TrendingUp, Target, Award } from "lucide-react";
import { ACADEMIC_RULES } from "../../config";

export function GPAInformation({ currentGPA, projectedGPA, getClassification }: { currentGPA: number, projectedGPA: number, getClassification: (gpa: number) => string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-3 gap-4">
                {/* Điểm hiện tại */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Điểm hiện tại</p>
                        <p className="text-2xl font-bold text-gray-900">{currentGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}<span className="text-sm text-gray-500">/{ACADEMIC_RULES.GPA_POINT_DECIMAL < 3 ? (10.0).toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL) : '10.00'}</span></p>
                    </div>
                </div>

                {/* Điểm dự kiến */}
                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                    <div className="w-10 h-10 rounded-lg bg-[#004A98] flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Điểm dự kiến</p>
                        <p className="text-2xl font-bold text-[#004A98]">{projectedGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}<span className="text-sm text-blue-400">/{ACADEMIC_RULES.GPA_POINT_DECIMAL < 3 ? (10.0).toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL) : '10.00'}</span></p>
                    </div>
                </div>

                {/* Xếp loại mục tiêu */}
                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${projectedGPA >= 8.0 ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                        <Award className={`w-5 h-5 ${projectedGPA >= 8.0 ? 'text-green-600' : 'text-orange-600'
                            }`} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Xếp loại mục tiêu</p>
                        <p className={`text-lg font-semibold ${projectedGPA >= 8.0 ? 'text-green-700' : 'text-orange-700'
                            }`}>
                            {getClassification(projectedGPA)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
};