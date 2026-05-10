import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, BookOpen, DollarSign } from 'lucide-react';

import { useStudentGradeData } from '../../hooks/useStudentGradeData';
import { NoDataCard } from '../../components/nodataCard';
import { ACADEMIC_RULES } from '../../config';
import { FinancialLogic } from '../../logic/FinancialLogic';
import { GPACalculator } from '../../logic/GPACalculator';
import { PrivacyFooter } from '../../components/PrivacyFooter';

export function DashboardWidgets() {
  const [isMounted, setIsMounted] = useState(false);

  const {
    currentGPA,
    accumulatedCredits,
    totalCredits,
    estimatedTuition,
    isReady,
    hasData,
  } = useStudentGradeData();

  const [tuitionDueDate, setTuitionDueDate] = useState('NaN');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // TODO:
  // Viết API lấy hạn đóng học phí thật ở đây
  useEffect(() => {
    const fetchTuitionDueDate = async () => {
      setTimeout(() => {
        setTuitionDueDate('NaN');
      }, 500);
    };

    if (hasData) {
      fetchTuitionDueDate();
    }
  }, [hasData]);

  const safeTotalCredits = ACADEMIC_RULES.TOTAL_CREDITS;

  const gpaPercentage =
    (currentGPA / ACADEMIC_RULES.MAX_GPA) * 100;

  const creditsPercentage = Math.min(
    (accumulatedCredits / safeTotalCredits) * 100,
    100
  );

  const formatCurrency = (amount: number) =>
    FinancialLogic.formatCurrency(amount, 'currency');

  const gpaStatus = useMemo(
    () => GPACalculator.getClassification(currentGPA),
    [currentGPA]
  );

  if (!isMounted) {
    return null;
  }

  // Loading
  if (!isReady) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#004A98]" />
      </div>
    );
  }

  // Không có dữ liệu
  if (!hasData) {
    return (
      <div className="px-1 md:px-0">
        <h1 className="mb-1 text-xl font-bold text-gray-900 md:mb-2 md:text-2xl">
          Tổng quan
        </h1>

        <p className="mb-6 text-sm text-gray-600 md:mb-8 md:text-base">
          Chào mừng bạn trở lại! Đây là tổng quan học tập của bạn.
        </p>

        <NoDataCard />
      </div>
    );
  }

  return (
    <div className="px-1 md:px-0">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="mb-1 text-xl font-bold text-gray-900 md:mb-2 md:text-2xl">
          Trang tổng quan
        </h1>

        <p className="text-sm text-gray-600 md:text-base">
          Chào mừng bạn trở lại! Đây là tổng quan học tập của bạn.
        </p>
      </div>

      {/* Grid */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:mb-6 md:grid-cols-3 md:gap-6">

        {/* GPA */}
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center gap-2 md:mb-6 md:gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004A98] md:h-10 md:w-10">
              <TrendingUp className="h-4 w-4 text-white md:h-5 md:w-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 md:text-base">
                GPA hiện tại
              </h3>

              <p className="text-xs text-gray-600 md:text-sm">
                Thang điểm 10
              </p>
            </div>
          </div>

          {/* GPA Circle */}
          <div className="mb-2 flex items-center justify-center md:mb-4">
            <div className="relative h-40 w-40 scale-75 md:scale-100">

              <svg className="h-full w-full -rotate-90 transform">
                {/* Background */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />

                {/* Progress */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#004A98"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - gpaPercentage / 100)
                    }`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#004A98] md:text-3xl">
                  {currentGPA.toFixed(
                    ACADEMIC_RULES.GPA_POINT_DECIMAL
                  )}
                </span>

                <span className="text-xs text-gray-500 md:text-sm">
                  /{' '}
                  {ACADEMIC_RULES.MAX_GPA.toFixed(
                    ACADEMIC_RULES.GPA_POINT_DECIMAL
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* GPA Classification */}
          <div className="min-w-0 border-t border-gray-100 pt-3 md:pt-4">
            <div className="flex items-center justify-between text-xs md:text-sm">

              <span className="text-gray-600">
                Xếp loại
              </span>

              <span className="font-semibold text-[#004A98]">
                {gpaStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center gap-2 md:mb-6 md:gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 md:h-10 md:w-10">
              <BookOpen className="h-4 w-4 text-white md:h-5 md:w-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 md:text-base">
                Tín chỉ tích lũy
              </h3>

              <p className="text-xs text-gray-600 md:text-sm">
                Tiến độ hoàn thành
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="mb-2 flex items-end justify-between gap-2">

              <span className="text-2xl font-bold text-gray-900 md:text-3xl">
                {accumulatedCredits}
              </span>

              <span className="text-xs text-gray-500 md:text-sm">
                / {totalCredits} tín chỉ
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 md:h-4">
              <div
                className="flex h-3 items-center justify-end rounded-full bg-green-500 pr-2 transition-all duration-1000 ease-out md:h-4"
                style={{
                  width: `${creditsPercentage}%`,
                }}
              >
                <span className="text-[9px] font-semibold text-white md:text-[10px]">
                  {creditsPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 border-t border-gray-100 pt-3 md:space-y-3 md:pt-4">

            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-gray-600">
                Đã tích lũy
              </span>

              <span className="font-semibold text-green-600">
                {accumulatedCredits} tín chỉ
              </span>
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-gray-600">
                Còn lại
              </span>

              <span className="font-semibold text-orange-600">
                {totalCredits - accumulatedCredits} tín chỉ
              </span>
            </div>
          </div>
        </div>

        {/* Tuition */}
        <div className="rounded-xl bg-gradient-to-br from-[#004A98] to-[#0066CC] p-4 text-white shadow-lg md:p-6">
          <div className="mb-4 flex items-center gap-2 md:mb-6 md:gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 md:h-10 md:w-10">
              <DollarSign className="h-4 w-4 text-white md:h-5 md:w-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white md:text-base">
                Học phí học kỳ
              </h3>

              <p className="text-xs text-blue-100 md:text-sm">
                Dự kiến phải đóng
              </p>
            </div>
          </div>

          {/* Tuition */}
          <div className="mb-4">
            <p className="mb-2 text-xs text-blue-100 md:text-sm">
              Tổng học phí dự kiến
            </p>

            <p className="break-words text-2xl font-bold text-white md:text-3xl">
              {formatCurrency(estimatedTuition || 0)}
            </p>
          </div>

          {/* Due date */}
          <div className="border-t border-white/20 pt-3 md:pt-4">
            <div className="flex items-center justify-between text-xs md:text-sm">

              <span className="text-blue-100">
                Hạn đóng học phí
              </span>

              <span className="font-semibold text-white">
                {tuitionDueDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <PrivacyFooter />
    </div>
  );
}