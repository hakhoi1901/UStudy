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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Điểm hiện tại */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#004A98]/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-[#004A98]" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Điểm tích lũy</p>
                        <p className="text-2xl font-bold text-gray-900">{currentGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}<span className="text-sm font-normal text-gray-400 ml-1">/10.00</span></p>
                    </div>
                </div>

                {/* Điểm dự kiến */}
                <div className="flex items-center gap-3 md:border-l md:border-gray-100 md:pl-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Điểm dự kiến</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {projectedGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}
                            <span className="text-sm font-normal text-blue-300 ml-1">/10.00</span>
                        </p>
                    </div>
                </div>

                {/* Điểm cơ sở ngành */}
                <div className="flex items-center gap-3 md:border-l md:border-gray-100 md:pl-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Locate className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Điểm cơ sở ngành</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-indigo-700">{majorGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}</p>
                            {majorSpecializedGPA > 0 && (
                                <p className="text-xs font-medium text-gray-400" title="Điểm CSN + Chuyên ngành (Pattern xxx1xxxx)">
                                    ({majorSpecializedGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)})
                                </p>
                            )}
                            <span className="text-sm font-normal text-gray-400">/10.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}