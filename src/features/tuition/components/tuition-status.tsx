import { CheckCircle2, BarChart3, AlertTriangle } from "lucide-react";
import type { TuitionSummary } from "../types";
import type { JSX } from "react";

export default function TuitionStatus({ currentSemesterSummary, getStatusBadge }: { currentSemesterSummary: TuitionSummary, getStatusBadge: (status: string) => JSX.Element | null }) {
    return (
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${currentSemesterSummary.status === 'paid' ? 'bg-green-500' :
                    currentSemesterSummary.status === 'partial' ? 'bg-yellow-500' :
                        'bg-red-500'
                    } flex items-center justify-center flex-shrink-0 shadow-md ${currentSemesterSummary.status === 'unpaid' ? 'animate-pulse' : ''
                    }`}>
                    {currentSemesterSummary.status === 'paid' ? (
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    ) : currentSemesterSummary.status === 'partial' ? (
                        <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    )}
                </div>
                <div>
                    <p className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Trạng thái thanh toán</p>
                    <div className="transform scale-90 origin-left md:scale-100">
                        {getStatusBadge(currentSemesterSummary.status)}
                    </div>
                </div>
            </div>
        </div>
    )
}
