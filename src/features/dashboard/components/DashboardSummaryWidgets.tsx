import { BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { ACADEMIC_RULES } from '../../../constants';

interface GpaWidgetProps {
  currentGPA: number;
  classification: string;
}

export function GpaWidget({ currentGPA, classification }: GpaWidgetProps) {
  const percentage = (currentGPA / ACADEMIC_RULES.MAX_GPA) * 100;
  const circumference = 2 * Math.PI * 70;

  return (
    <section className="ustudy-card ustudy-card-padding h-full">
      <div className="ustudy-card-header">
        <div className="ustudy-icon-badge ustudy-icon-primary">
          <TrendingUp className="h-4 w-4 text-white md:h-5 md:w-5" />
        </div>
        <div>
          <h3 className="ustudy-card-title">GPA hiện tại</h3>
          <p className="ustudy-card-subtitle">Thang điểm 10</p>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-center md:mb-4">
        <div className="relative h-40 w-40 scale-75 md:scale-100">
          <svg className="h-full w-full -rotate-90 transform" aria-hidden="true">
            <circle cx="80" cy="80" r="70" stroke="#E5E7EB" strokeWidth="12" fill="none" />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#004A98"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percentage / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#004A98] md:text-3xl">
              {currentGPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}
            </span>
            <span className="text-xs text-gray-500 md:text-sm">
              / {ACADEMIC_RULES.MAX_GPA.toFixed(ACADEMIC_RULES.GPA_POINT_DECIMAL)}
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-0 border-t border-gray-100 pt-3 md:pt-4">
        <div className="ustudy-stat-row">
          <span className="ustudy-stat-label">Xếp loại</span>
          <span className="font-semibold text-[#004A98]">{classification}</span>
        </div>
      </div>
    </section>
  );
}

interface CreditsWidgetProps {
  accumulatedCredits: number;
  totalCredits: number;
}

export function CreditsWidget({ accumulatedCredits, totalCredits }: CreditsWidgetProps) {
  const percentage = Math.min((accumulatedCredits / Math.max(totalCredits, 1)) * 100, 100);

  return (
    <section className="ustudy-card ustudy-card-padding h-full">
      <div className="ustudy-card-header">
        <div className="ustudy-icon-badge ustudy-icon-success">
          <BookOpen className="h-4 w-4 text-white md:h-5 md:w-5" />
        </div>
        <div>
          <h3 className="ustudy-card-title">Tín chỉ tích lũy</h3>
          <p className="ustudy-card-subtitle">Tiến độ hoàn thành</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-end justify-between gap-2">
          <span className="text-2xl font-bold text-gray-900 md:text-3xl">{accumulatedCredits}</span>
          <span className="text-xs text-gray-500 md:text-sm">/ {totalCredits} tín chỉ</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 md:h-4">
          <div
            className="flex h-3 items-center justify-end rounded-full bg-green-500 pr-2 transition-all duration-1000 ease-out md:h-4"
            style={{ width: `${percentage}%` }}
          >
            <span className="text-[9px] font-semibold text-white md:text-[10px]">{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-100 pt-3 md:space-y-3 md:pt-4">
        <div className="ustudy-stat-row">
          <span className="ustudy-stat-label">Đã tích lũy</span>
          <span className="font-semibold text-green-600">{accumulatedCredits} tín chỉ</span>
        </div>
        <div className="ustudy-stat-row">
          <span className="ustudy-stat-label">Còn lại</span>
          <span className="font-semibold text-orange-600">{Math.max(0, totalCredits - accumulatedCredits)} tín chỉ</span>
        </div>
      </div>
    </section>
  );
}

interface TuitionWidgetProps {
  amountLabel: string;
  dueDate: string;
}

export function TuitionWidget({ amountLabel, dueDate }: TuitionWidgetProps) {
  return (
    <section className="h-full rounded-xl bg-gradient-to-br from-[#004A98] to-[#0066CC] p-4 text-white shadow-lg md:p-6">
      <div className="ustudy-card-header">
        <div className="ustudy-icon-badge bg-white/20 text-white">
          <DollarSign className="h-4 w-4 text-white md:h-5 md:w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white md:text-base">Học phí học kỳ</h3>
          <p className="text-xs text-blue-100 md:text-sm">Dự kiến phải đóng</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs text-blue-100 md:text-sm">Tổng học phí dự kiến</p>
        <p className="break-words text-2xl font-bold text-white md:text-3xl">{amountLabel}</p>
      </div>

      <div className="border-t border-white/20 pt-3 md:pt-4">
        <div className="ustudy-stat-row">
          <span className="text-blue-100">Hạn đóng học phí</span>
          <span className="font-semibold text-white">{dueDate}</span>
        </div>
      </div>
    </section>
  );
}
