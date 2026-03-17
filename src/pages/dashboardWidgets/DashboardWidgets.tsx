import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, BookOpen, DollarSign } from 'lucide-react';
import { useStudentGradeData } from '../../hooks/useStudentGradeData';
import { NoDataCard } from '../../components/nodataCard';
import { ACADEMIC_RULES } from '../../config';
import { CardFooter } from '../../components/ui/card';
import { FinancialLogic } from '../../logic/FinancialLogic';
import { GPACalculator } from '../../logic/GPACalculator';
import { PrivacyFooter } from '../../components/PrivacyFooter';

export function DashboardWidgets() {
  const [isMounted, setIsMounted] = useState(false);
  const { currentGPA, accumulatedCredits, totalCredits, estimatedTuition, isReady, hasData } = useStudentGradeData();
  const [tuitionDueDate, setTuitionDueDate] = useState('NaN');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  //// nhớ viết thêm hàm lấy hạn đóng học phí ////
  useEffect(() => {
    // Giả lập gọi API lấy hạn đóng học phí
    const fetchTuitionDueDate = async () => {
      // Simulate API call
      setTimeout(() => {
        setTuitionDueDate('NaN');
      }, 500);
    };

    if (hasData) {
      fetchTuitionDueDate();
    }
  }, [hasData]);

  const safeTotalCredits = ACADEMIC_RULES.TOTAL_CREDITS;
  const gpaPercentage = (currentGPA / ACADEMIC_RULES.MAX_GPA) * 100;
  const creditsPercentage = Math.min((accumulatedCredits / safeTotalCredits) * 100, 100);

  // Dùng centralized formatCurrency và GPACalculator
  const formatCurrency = (amount: number) => FinancialLogic.formatCurrency(amount, 'currency');
  const gpaStatus = useMemo(() => GPACalculator.getClassification(currentGPA), [currentGPA]);

  if (!isMounted) {
    return null;
  }

  // loading
  if (!isReady) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!hasData) {
    return (<div>
      <h1 className="text-gray-900 mb-2">Tổng quan</h1>
      <p className="text-gray-600 mb-8">Chào mừng bạn trở lại! Đây là tổng quan học tập của bạn.</p>
      <NoDataCard />
    </div>);
  }

  // Giao diện khi có dữ liệu
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Trang tổng quan</h1>
        <p className="text-gray-600">Chào mừng bạn trở lại! Đây là tổng quan học tập của bạn.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* GPA */}
        <div className="bg-white rounded-xl min-w-[200px] p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#004A98] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">GPA hiện tại</h3>
              <p className="text-gray-600 text-sm">Thang điểm 10</p>
            </div>
          </div>

          {/* Vòng tròn hiển thị GPA */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                {/* Nền vòng tròn */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Vòng tròn tiến độ */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#004A98"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - gpaPercentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#004A98]">{currentGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}</span>
                <span className="text-sm text-gray-500">/ {ACADEMIC_RULES.MAX_GPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}</span>
              </div>
            </div>
          </div>

          {/* Xếp loại GPA */}
          <div className="pt-4 border-t min-w-[200px] border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Xếp loại</span>
              <span className="text-[#004A98] font-semibold">
                {gpaStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Tín chỉ tích lũy */}
        <div className="bg-white rounded-xl min-w-[200px] p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Tín chỉ tích lũy</h3>
              <p className="text-gray-600 text-sm">Tiến độ hoàn thành</p>
            </div>
          </div>

          {/* Tiến độ tín chỉ */}
          <div className="mb-4">

            {/* Số tín chỉ đã tích lũy */}
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-gray-900">{accumulatedCredits}</span>
              <span className="text-sm text-gray-500">/ {totalCredits} tín chỉ</span>
            </div>

            {/* Thanh tiến độ */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                style={{ width: `${creditsPercentage}%` }}
              >
                <span className="text-[10px] text-white font-semibold">
                  {creditsPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Số tín chỉ đã hoàn thành và còn lại */}
          <div className="space-y-3 pt-4 border-t border-gray-100">

            {/* Số tín chỉ đã tích lũy */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Đã tích lũy</span>
              <span className="text-green-600 font-semibold">{accumulatedCredits} tín chỉ</span>
            </div>

            {/* Số tín chỉ còn lại */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Còn lại</span>
              <span className="text-orange-600 font-semibold">{totalCredits - accumulatedCredits} tín chỉ</span>
            </div>
          </div>
        </div>

        {/* Học phí học kỳ */}
        <div className="bg-gradient-to-br from-[#004A98] to-[#0066CC] rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white">Học phí học kỳ</h3>
              <p className="text-blue-100 text-sm">Dự kiến phải đóng</p>
            </div>
          </div>

          {/* Tổng học phí dự kiến */}
          <div className="mb-4">
            <p className="text-sm text-blue-100 mb-2">Tổng học phí dự kiến</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(estimatedTuition || 0)}</p>
          </div>

          {/* Hạn đóng học phí */}
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-100">Hạn đóng học phí</span>
              <span className="text-white font-semibold">{tuitionDueDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <PrivacyFooter />
    </div>
  );
}