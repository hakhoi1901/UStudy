import { useTuitionManagement } from './hooks/use-tuition-management';
import { calculateDaysUntilDue } from './hooks/use-tuition-countdown';

import {
  CheckCircle2,
  CreditCard,
  Download,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { NoDataCard } from '../../components/nodataCard';
import { PageHeader } from '../../components/ui/page-header';
import { PageShell } from '../../components/ui/page-shell';
import TuitionStatus from './components/tuition-status';
import { TuitionCountDown } from './components/tuition-countdown';
import { Payment } from './components/payment';
import { TuitionDeskTopCardList } from './components/tuition-desktop-card-list';
import { TuitionMobileCardList } from './components/tuition-mobile-card-list';
import { TuitionSummaryCard } from './components/tuition-summary-card';

interface TuitionPageProps {
  selectedSemester?: string;
}

// ==================== HELPER UI ====================

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

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// ==================== MAIN COMPONENT ====================

export function TuitionPage({ selectedSemester }: TuitionPageProps) {
  const {
    isReady,
    hasData,
    currentSemesterData,
    currentSemesterSummary,
    missingMetaCourses,
    paymentLink,
    copiedLink,
    handleCopyLink,
    handleOpenLink,
    handleExport,
    trend,
    paymentProgress
  } = useTuitionManagement({ selectedSemester });

  // Tải dữ liệu
  if (!isReady) {
    return (
      <div className="flex-1 flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  // Không có dữ liệu
  if (!hasData) {
    return (
      <PageShell
        header={<PageHeader
          title="Học phí"
          description="Vui lòng nhập dữ liệu để xem thông tin học phí."
        />}
      >
        <NoDataCard />
      </PageShell>
    );
  }

  return (
    <PageShell
      header={<PageHeader
        title="Học phí"
        description={<>Xem chi tiết học phí học kỳ <span className="font-semibold text-[#004A98]">{currentSemesterSummary.semesterName}</span>.</>}
        actions={<button
          onClick={handleExport}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-[#004A98] text-white rounded-xl hover:bg-[#003d7a] transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs md:text-sm font-bold">Xuất học phí (.txt)</span>
        </button>}
      />}
    >

      {/* Cảnh báo thiếu metadata */}
      {missingMetaCourses && missingMetaCourses.length > 0 && (
        <div className="rounded-xl mb-6 bg-red-50 border-l-4 border-red-500 p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>Không thể tính học phí chính xác cho một số môn học</span>
          </div>
          <p className="text-sm text-red-600 ml-7">
            Không tìm thấy thông tin số tiết (LT/TH/BT) trong Chương Trình Đào Tạo cho các môn sau, nên <strong>tạm tính học phí là 0₫</strong>:
            <br />
            <span className="font-mono font-semibold bg-red-100 px-1 rounded mt-1 inline-block">{missingMetaCourses.join(', ')}</span>
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <TuitionSummaryCard
        currentSemesterData={currentSemesterData}
        currentSemesterSummary={currentSemesterSummary}
        trend={trend}
        paymentProgress={paymentProgress}
        formatCurrency={formatCurrency}
      />

      {/* Tables Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        <TuitionMobileCardList
          currentSemesterData={currentSemesterData}
          currentSemesterSummary={currentSemesterSummary}
        />
        <TuitionDeskTopCardList
          currentSemesterData={currentSemesterData}
          currentSemesterSummary={currentSemesterSummary}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Payment Information Section */}
      <div className={`bg-gradient-to-br ${currentSemesterSummary.status === 'unpaid' ? 'from-red-50 to-orange-50' :
          currentSemesterSummary.status === 'partial' ? 'from-yellow-50 to-orange-50' :
            'from-green-50 to-blue-50'
        } rounded-2xl p-5 md:p-8 shadow-sm border-2 ${currentSemesterSummary.status === 'unpaid' ? 'border-red-100' :
          currentSemesterSummary.status === 'partial' ? 'border-yellow-100' :
            'border-green-100'
        } mb-8 transition-all duration-300`}>

        <h3 className="text-gray-900 font-bold mb-6 flex items-center gap-2 text-lg md:text-xl">
          <CreditCard className="w-6 h-6 text-[#004A98]" />
          Thông tin thanh toán
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6 mb-6">
          <TuitionCountDown
            calculateDaysUntilDue={calculateDaysUntilDue}
            formatDate={formatDate}
            currentSemesterSummary={currentSemesterSummary}
          />

          {/* <TuitionStatus
            currentSemesterSummary={currentSemesterSummary}
            getStatusBadge={getStatusBadge}
          /> */}
        </div>

        <Payment
          paymentLink={paymentLink}
          handleCopyLink={handleCopyLink}
          handleOpenLink={handleOpenLink}
          copiedLink={copiedLink}
        />
      </div>

    </PageShell>
  );
}
