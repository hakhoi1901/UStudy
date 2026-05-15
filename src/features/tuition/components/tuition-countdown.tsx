import { Clock, AlertTriangle } from "lucide-react";
import type { TuitionSummary } from "../types";

export function TuitionCountDown({
    calculateDaysUntilDue,
    formatDate,
    currentSemesterSummary
}: {
    calculateDaysUntilDue: (dueDate: string) => number,
    formatDate: (dueDate: string) => string,
    currentSemesterSummary: TuitionSummary
}) {
    const daysUntilDue = calculateDaysUntilDue(currentSemesterSummary.dueDate);
    return (
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${daysUntilDue < 0 ? 'bg-red-500' : daysUntilDue <= 7 ? 'bg-orange-500' : 'bg-blue-500'
                    } flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Hạn thanh toán</p>
                    <p className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2">
                        {formatDate(currentSemesterSummary.dueDate)}
                    </p>
                    {daysUntilDue >= 0 ? (
                        <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${daysUntilDue <= 7 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>Còn {daysUntilDue} ngày</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-xs md:text-sm font-semibold text-red-600 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>Đã quá hạn {Math.abs(daysUntilDue)} ngày</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
