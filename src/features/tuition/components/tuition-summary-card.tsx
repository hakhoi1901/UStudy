import type { TuitionCourse, TuitionSummary } from "../types";
import { CheckCircle2, AlertCircle, DollarSign } from "lucide-react";
import { EnhancedSummaryCard } from './enhanced-summary-card';

export function TuitionSummaryCard({
    currentSemesterSummary,
    trend,
    paymentProgress,
    formatCurrency,
}: {
    currentSemesterData: TuitionCourse[];
    currentSemesterSummary: TuitionSummary;
    trend: { direction: 'up' | 'down' | 'neutral'; value: string };
    paymentProgress: number;
    formatCurrency: (value: number) => string;
}) {
    return (
        <>
            {currentSemesterSummary.hasAdvancePayment ? (
                <div className={`grid gap-6 mb-6 ${currentSemesterSummary.status === 'partial' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <EnhancedSummaryCard
                        icon={DollarSign}
                        title="Tổng học phí"
                        subtitle={`Học kỳ ${currentSemesterSummary.semester}`}
                        value={`${formatCurrency(currentSemesterSummary.totalFee)} ₫`}
                        detail={`${currentSemesterSummary.totalCredits} TC (${currentSemesterSummary.totalTuitionCredits} TC HP)`}
                        bgColor="bg-[#004A98]"
                        textColor="text-[#004A98]"
                        trend={trend}
                    />

                    <EnhancedSummaryCard
                        icon={CheckCircle2}
                        title="Tổng đã đóng"
                        subtitle="Đã đóng trước"
                        value={`${formatCurrency(currentSemesterSummary.advancePayment)} ₫`}
                        detail={`${((currentSemesterSummary.advancePayment / currentSemesterSummary.totalFee) * 100).toFixed(1)}% tổng học phí`}
                        bgColor="bg-green-600"
                        textColor="text-green-600"
                        progress={paymentProgress}
                    />

                    {currentSemesterSummary.status === 'partial' && (
                        <EnhancedSummaryCard
                            icon={AlertCircle}
                            title="Tổng phải đóng"
                            subtitle="Còn thiếu"
                            value={`${formatCurrency(currentSemesterSummary.amountDue)} ₫`}
                            detail={`${((currentSemesterSummary.amountDue / currentSemesterSummary.totalFee) * 100).toFixed(1)}% còn lại`}
                            bgColor="bg-orange-600"
                            textColor="text-orange-600"
                            progress={100 - paymentProgress}
                        />
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <EnhancedSummaryCard
                        icon={DollarSign}
                        title="Tổng học phí"
                        subtitle={`Học kỳ ${currentSemesterSummary.semester}`}
                        value={`${formatCurrency(currentSemesterSummary.totalFee)} ₫`}
                        detail={`${currentSemesterSummary.totalCredits} TC (${currentSemesterSummary.totalTuitionCredits} TC HP)`}
                        bgColor="bg-[#004A98]"
                        textColor="text-[#004A98]"
                        trend={trend}
                    />

                    <EnhancedSummaryCard
                        icon={AlertCircle}
                        title="Tổng phải đóng"
                        subtitle="Toàn bộ học phí"
                        value={`${formatCurrency(currentSemesterSummary.amountDue)} ₫`}
                        detail="100% học phí học kỳ"
                        bgColor="bg-orange-600"
                        textColor="text-orange-600"
                    />
                </div>
            )}
        </>
    )
};
