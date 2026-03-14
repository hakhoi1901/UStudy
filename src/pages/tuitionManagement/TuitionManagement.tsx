/* TuitionManagement.tsx
** Trang Quản lý học phí
*/

import { useState, useEffect } from 'react';
import { useTuitionCalculator } from '../../hooks/useTuitionCalculator';
import { useCourseData } from '../../hooks/useCourseData';

import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Info,
  FileText,
  BarChart3
} from 'lucide-react';
import { NoDataCard } from '../../components/nodataCard';

interface TuitionCourse {
  stt: number;
  semester: string;
  courseCode: string;
  classCode: string;
  courseName: string;
  credits: number;
  periods: number;
  tuitionCredits: number;
  tuitionFee: number;
  discount: number;
  support: number;
  actualFee: number;
  otherFees: number;
  note: string;
}

interface TuitionSummary {
  semester: string;
  semesterName: string;
  totalCredits: number;
  totalPeriods: number;
  totalTuitionCredits: number;
  totalFee: number;
  advancePayment: number;
  amountDue: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid';
  lastUpdated: string;
  hasAdvancePayment: boolean;
}

interface TuitionManagementProps {
  selectedSemester?: string;
}


// ==================== HELPER FUNCTIONS ====================

function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getTrendComparison(currentSummary: TuitionSummary, allSummaries: TuitionSummary[]): { direction: 'up' | 'down' | 'neutral'; value: string; percent: number } {
  const currentIndex = allSummaries.findIndex(s => s.semester === currentSummary.semester);
  if (currentIndex <= 0) return { direction: 'neutral', value: 'Học kỳ đầu', percent: 0 };

  const previousSummary = allSummaries[currentIndex - 1];
  const diff = currentSummary.totalFee - previousSummary.totalFee;
  const percent = (diff / previousSummary.totalFee) * 100;

  if (diff > 0) {
    return { direction: 'down', value: `+${new Intl.NumberFormat('vi-VN').format(Math.abs(diff))}₫`, percent: Math.abs(percent) };
  } else if (diff < 0) {
    return { direction: 'up', value: `-${new Intl.NumberFormat('vi-VN').format(Math.abs(diff))}₫`, percent: Math.abs(percent) };
  }
  return { direction: 'neutral', value: 'Không đổi', percent: 0 };
}

function exportTuitionData(summary: TuitionSummary, courses: TuitionCourse[]) {
  let content = `HÓA ĐƠN HỌC PHÍ - ${summary.semesterName}\n`;
  content += `${'='.repeat(80)}\n\n`;
  content += `THÔNG TIN CHUNG:\n`;
  content += `Học kỳ: ${summary.semester}\n`;
  content += `Tổng tín chỉ: ${summary.totalCredits} TC (${summary.totalTuitionCredits} TC học phí)\n`;
  content += `Tổng số tiết: ${summary.totalPeriods} tiết\n`;
  content += `Hạn thanh toán: ${new Date(summary.dueDate).toLocaleDateString('vi-VN')}\n`;
  content += `Trạng thái: ${summary.status === 'paid' ? 'Đã thanh toán' : summary.status === 'partial' ? 'Thanh toán một phần' : 'Chưa thanh toán'}\n\n`;

  content += `CHI TIẾT CÁC MÔN HỌC:\n`;
  content += `${'-'.repeat(80)}\n`;

  courses.forEach((course) => {
    content += `${course.stt}. ${course.courseCode} - ${course.courseName}\n`;
    content += `   Lớp: ${course.classCode} | TC: ${course.credits} | Tiết: ${course.periods}\n`;
    content += `   TC học phí: ${course.tuitionCredits} | Học phí: ${new Intl.NumberFormat('vi-VN').format(course.tuitionFee)}₫\n`;
    if (course.discount > 0) content += `   Giảm: ${new Intl.NumberFormat('vi-VN').format(course.discount)}₫\n`;
    if (course.support > 0) content += `   Hỗ trợ: ${new Intl.NumberFormat('vi-VN').format(course.support)}₫\n`;
    content += `   Thực đóng: ${new Intl.NumberFormat('vi-VN').format(course.actualFee)}₫\n\n`;
  });

  content += `${'-'.repeat(80)}\n`;
  content += `TỔNG KẾT:\n`;
  content += `Tổng học phí: ${new Intl.NumberFormat('vi-VN').format(summary.totalFee)}₫\n`;
  if (summary.hasAdvancePayment) {
    content += `Tổng đã đóng: ${new Intl.NumberFormat('vi-VN').format(summary.advancePayment)}₫\n`;
  }
  content += `Tổng phải đóng: ${new Intl.NumberFormat('vi-VN').format(summary.amountDue)}₫\n\n`;
  content += `Ngày xuất: ${new Date().toLocaleString('vi-VN')}\n`;
  content += `Cập nhật lần cuối: ${summary.lastUpdated}\n`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `HocPhi_${summary.semester.replace(/\//g, '-')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==================== SUB-COMPONENTS ====================

function EnhancedSummaryCard({
  icon: Icon,
  title,
  subtitle,
  value,
  detail,
  bgColor,
  textColor,
  trend,
  progress
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  value: string;
  detail: string;
  bgColor: string;
  textColor: string;
  trend?: { direction: 'up' | 'down' | 'neutral'; value: string };
  progress?: number;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group relative">
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        <p className={`text-2xl font-bold ${textColor} mb-2`}>
          {value}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">{detail}</p>
          {trend && trend.direction !== 'neutral' && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-orange-600'
              }`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${bgColor} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-[9999] animate-in fade-in slide-in-from-top-1 duration-200" style={{ minWidth: 'max-content' }}>
          {text}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function TuitionManagement({ selectedSemester: initialSelectedSemester }: TuitionManagementProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [daysUntilDue, setDaysUntilDue] = useState(0);
  const paymentLink = 'https://hocphi.hcmus.edu.vn/';

  const selectedSemesterName = initialSelectedSemester || 'Học kỳ 1, 2025-2026';
  const { courses: currentSemesterData, summary: currentSemesterSummary, isDataAvailable, missingMetaCourses } = useTuitionCalculator(selectedSemesterName);


  // Lấy data từ localStorage qua Recommender
  const { recommended, all, isReady, hasData } = useCourseData();

  // Calculate days until due
  useEffect(() => {
    const days = calculateDaysUntilDue(currentSemesterSummary.dueDate);
    setDaysUntilDue(days);

    // Update every hour
    const interval = setInterval(() => {
      setDaysUntilDue(calculateDaysUntilDue(currentSemesterSummary.dueDate));
    }, 3600000);

    return () => clearInterval(interval);
  }, [currentSemesterSummary.dueDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenLink = () => {
    window.open(paymentLink, '_blank');
  };

  const handleExport = () => {
    exportTuitionData(currentSemesterSummary, currentSemesterData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-4 h-4" />
            Đã thanh toán
          </span>
        );
      case 'partial':
        return (
          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full flex items-center gap-1 w-fit">
            <Clock className="w-4 h-4" />
            Thanh toán một phần
          </span>
        );
      case 'unpaid':
        return (
          <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-full flex items-center gap-1 w-fit animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            Chưa thanh toán
          </span>
        );
      default:
        return null;
    }
  };

  const trend = { direction: 'neutral' as const, value: 'Không đổi', percent: 0 }; // Cannot compare without history
  const paymentProgress = currentSemesterSummary.hasAdvancePayment
    ? (currentSemesterSummary.advancePayment / currentSemesterSummary.totalFee) * 100
    : 0;


  // Tải dữ liệu
  if (!isReady) {
    return (
      <div className="flex-1">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  // Không có dữ liệu
  if (!hasData) {
    return <div>
      <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>
      <p className="text-gray-600 mb-8">Đây là lộ trình học tập của bạn.</p>
      <NoDataCard />
    </div>;
  }

  return (
    <div>
      {/* Header with Export Button */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Học phí</h1>
          <p className="text-gray-600">
            Xem chi tiết học phí của học kỳ <span className="font-semibold text-[#004A98]">{currentSemesterSummary.semesterName}</span> và thông tin thanh toán.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003d7a] transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Xuất hóa đơn</span>
        </button>
      </div>

      {/* Cảnh báo thiếu metadata */}
      {missingMetaCourses && missingMetaCourses.length > 0 && (
        <div className="rounded-xl mb-6 bg-red-50 border-l-4 border-red-500 p-4 shadow-sm flex items-start flex-col gap-2">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>Không thể tính học phí cho một số môn học</span>
          </div>
          <p className="text-sm text-red-600 ml-7">
            Không tìm thấy thông tin số tiết (LT/TH/BT) trong Chương Trình Đào Tạo cho các môn sau, nên <strong>tạm tính học phí là 0₫</strong>:
            <br />
            <span className="font-mono font-semibold">{missingMetaCourses.join(', ')}</span>
          </p>
        </div>
      )}

      {/* Enhanced Summary Cards - CONDITIONAL RENDERING */}
      {currentSemesterSummary.hasAdvancePayment ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

      {/* Enhanced Table - Chi tiết học phí */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[1100px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 border-b-2 border-gray-300 z-10">
              <tr>
                <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                  STT
                </th>
                <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                  <Tooltip text="Năm học / Học kỳ">
                    <span className="cursor-help flex items-center gap-0.5 justify-center">
                      NH/HK
                      <Info className="w-3 h-3 text-gray-400" />
                    </span>
                  </Tooltip>
                </th>
                <th className="px-2.5 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-left font-semibold">
                  Mã MH/Lớp/Môn Học
                </th>
                <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                  <Tooltip text="Số tín chỉ">
                    <span className="cursor-help">Số TC</span>
                  </Tooltip>
                </th>
                <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                  Số Tiết
                </th>
                <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                  <Tooltip text="Số tín chỉ tính học phí (có thể khác số TC thực tế)">
                    <span className="cursor-help flex items-center gap-0.5 justify-center">
                      TC<br />HP
                      <Info className="w-3 h-3 text-gray-400" />
                    </span>
                  </Tooltip>
                </th>
                <th className="px-2.5 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                  Học Phí
                </th>
                <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                  Giảm
                </th>
                <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                  Hỗ Trợ<br />HP
                </th>
                <th className="px-2.5 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                  HP<br />Thực Đóng
                </th>
                <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                  Chi Phí
                </th>
                <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                  Ghi Chú
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentSemesterData.map((course, index) => (
                <tr
                  key={course.stt}
                  className={`hover:bg-blue-50/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                >
                  <td className="px-2 py-2.5 text-center text-gray-900 font-medium text-xs">
                    {course.stt}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-600 text-[12px] font-mono">
                    {course.semester}
                  </td>
                  <td className="px-2.5 py-2.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] text-gray-500 mb-0.5">
                        [{course.courseCode}/{course.classCode}]
                      </span>
                      <span className="text-xs text-gray-900 font-medium leading-tight">{course.courseName}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-900 font-medium text-xs">
                    {course.credits.toFixed(1)}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-900 text-xs">
                    {course.periods.toFixed(1)}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-900 font-semibold text-xs">
                    {course.tuitionCredits.toFixed(2)}
                  </td>
                  <td className="px-2.5 py-2.5 text-right text-gray-900 font-medium text-xs">
                    {formatCurrency(course.tuitionFee)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-gray-600 text-xs">
                    {course.discount === 0 ? '0' : formatCurrency(course.discount)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-gray-600 text-xs">
                    {course.support === 0 ? '0' : formatCurrency(course.support)}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-bold text-[#004A98] text-xs">
                    {formatCurrency(course.actualFee)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-gray-600 text-xs">
                    {course.otherFees === 0 ? '0' : formatCurrency(course.otherFees)}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-500 text-[10px]">
                    {course.note || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gradient-to-r from-gray-100 to-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="px-2.5 py-3 font-bold text-gray-900 text-sm">
                  Tổng Cộng:
                </td>
                <td className="px-2 py-3 text-center font-bold text-gray-900 text-xs">
                  {currentSemesterSummary.totalCredits.toFixed(1)}
                </td>
                <td className="px-2 py-3 text-center font-bold text-gray-900 text-xs">
                  {currentSemesterSummary.totalPeriods.toFixed(1)}
                </td>
                <td className="px-2 py-3 text-center font-bold text-gray-900 text-xs">
                  {currentSemesterSummary.totalTuitionCredits.toFixed(2)}
                </td>
                <td className="px-2.5 py-3 text-right font-bold text-gray-900 text-sm">
                  {formatCurrency(currentSemesterSummary.totalFee)}
                </td>
                <td colSpan={5}></td>
              </tr>
              {currentSemesterSummary.hasAdvancePayment && (
                <tr className="border-t border-gray-200">
                  <td colSpan={9} className="px-2.5 py-2 text-right text-xs font-semibold text-gray-700">
                    Tổng đã đóng:
                  </td>
                  <td className="px-2.5 py-2 text-right font-bold text-green-700 text-sm">
                    {formatCurrency(currentSemesterSummary.advancePayment)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              )}
              <tr className="border-t-2 border-gray-300 bg-orange-50">
                <td colSpan={9} className="px-2.5 py-3 text-right text-sm font-bold text-gray-900">
                  Tổng số tiền phải đóng:
                </td>
                <td className="px-2.5 py-3 text-right font-bold text-lg text-orange-600">
                  {formatCurrency(currentSemesterSummary.amountDue)} ₫
                </td>
                <td colSpan={2}></td>
              </tr>
              <tr>
                <td colSpan={12} className="px-2.5 py-2 text-right">
                  <p className="text-[10px] italic text-red-600 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    Ngày cập nhật: {currentSemesterSummary.lastUpdated}
                  </p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Enhanced Payment Information */}
      <div className={`bg-gradient-to-br ${currentSemesterSummary.status === 'unpaid' ? 'from-red-50 to-orange-50' :
        currentSemesterSummary.status === 'partial' ? 'from-yellow-50 to-orange-50' :
          'from-green-50 to-blue-50'
        } rounded-xl p-6 shadow-md border-2 ${currentSemesterSummary.status === 'unpaid' ? 'border-red-200' :
          currentSemesterSummary.status === 'partial' ? 'border-yellow-200' :
            'border-green-200'
        } mb-6 transition-all duration-300 hover:shadow-lg`}>
        <h3 className="text-gray-900 font-bold mb-6 flex items-center gap-2 text-lg">
          <CreditCard className="w-6 h-6 text-[#004A98]" />
          Thông tin thanh toán
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Hạn thanh toán với Countdown */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg ${daysUntilDue < 0 ? 'bg-red-500' : daysUntilDue <= 7 ? 'bg-orange-500' : 'bg-blue-500'
                } flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Hạn thanh toán</p>
                <p className="text-lg font-bold text-gray-900 mb-2">
                  {formatDate(currentSemesterSummary.dueDate)}
                </p>
                {daysUntilDue >= 0 ? (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${daysUntilDue <= 7 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                    <Clock className="w-4 h-4" />
                    <span>Còn {daysUntilDue} ngày</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-sm font-semibold text-red-600 animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Đã quá hạn {Math.abs(daysUntilDue)} ngày</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trạng thái */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg ${currentSemesterSummary.status === 'paid' ? 'bg-green-500' :
                currentSemesterSummary.status === 'partial' ? 'bg-yellow-500' :
                  'bg-red-500'
                } flex items-center justify-center flex-shrink-0 shadow-md ${currentSemesterSummary.status === 'unpaid' ? 'animate-pulse' : ''
                }`}>
                {currentSemesterSummary.status === 'paid' ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : currentSemesterSummary.status === 'partial' ? (
                  <BarChart3 className="w-6 h-6 text-white" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Trạng thái thanh toán</p>
                {getStatusBadge(currentSemesterSummary.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Thanh toán online */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <ExternalLink className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-gray-900 mb-1">Thanh toán online</p>
              <p className="text-sm text-gray-600">Thanh toán nhanh chóng và an toàn qua cổng trường</p>
            </div>
          </div>

          {/* Link Box */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 mb-4 hover:border-blue-400 transition-colors">
            <FileText className="w-5 h-5 text-[#004A98] flex-shrink-0" />
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#004A98] hover:underline font-semibold flex-1 break-all"
            >
              {paymentLink}
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép link</span>
                </>
              )}
            </button>
            <button
              onClick={handleOpenLink}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#004A98] to-[#0066CC] hover:from-[#003A78] hover:to-[#0052A3] text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở trong tab mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Footer */}
      <div className="py-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-[10px] text-gray-500 text-center">
          Dữ liệu được lưu tại Local Storage và sẽ xóa khi Đăng xuất
        </p>
      </div>
    </div>
  );
}