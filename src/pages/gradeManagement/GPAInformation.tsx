import { TrendingUp, Target, Locate } from "lucide-react";
import { ACADEMIC_RULES } from "../../config";


interface GPAInformationProps {
    currentGPA: number;
    projectedGPA: number;
    majorGPA?: number;
    majorSpecializedGPA?: number;
}

export function GPAInformation({ currentGPA, projectedGPA, majorGPA = 0, majorSpecializedGPA = 0 }: GPAInformationProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                {/* Điểm hiện tại */}
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#004A98] flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Điểm hiện tại</p>
                        <p className="text-lg md:text-2xl font-bold text-[#004A98]">{currentGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}<span className="text-xs md:text-sm text-gray-500">/{ACADEMIC_RULES.GPA_POINT_DECIMAL < 3 ? (10.0).toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL) : '10.00'}</span></p>
                    </div>
                </div>

                {/* Điểm dự kiến */}
                <div className="flex items-center gap-2 md:gap-3 md:border-l md:border-gray-200 md:pl-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#004A98] flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Điểm dự kiến</p>
                        <p className="text-lg md:text-2xl font-bold text-[#004A98]">
                            {projectedGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}
                            <span className="text-xs md:text-sm text-gray-500">/{ACADEMIC_RULES.GPA_POINT_DECIMAL < 3 ? (10.0).toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL) : '10.00'}</span>
                        </p>
                    </div>
                </div>

                {/* Điểm cơ sở ngành */}
                <div className="flex items-center gap-2 md:gap-3 md:border-l md:border-gray-200 md:pl-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#004A98] flex items-center justify-center flex-shrink-0">
                        <Locate className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-600 leading-tight">Điểm chuyên ngành</p>
                        <p className="text-lg md:text-2xl font-bold text-[#004A98]">{majorSpecializedGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}<span className="text-xs md:text-sm text-gray-500">/{ACADEMIC_RULES.GPA_POINT_DECIMAL < 3 ? (10.0).toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL) : '10.00'}</span></p>
                    </div>
                </div>
            </div>
        </div>
    )
}