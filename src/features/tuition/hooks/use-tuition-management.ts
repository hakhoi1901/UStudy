import { useTuitionCalculator } from './use-tuition-calculator';
import { useTuitionActions } from './use-tuition-actions';
import { useTuitionCountdown, calculateDaysUntilDue } from './use-tuition-countdown';
import { useCourseData } from '../../../hooks/useCourseData';
import { APP_CONFIG } from '../../../config';

interface UseTuitionManagementProps {
  selectedSemester?: string;
}

export function useTuitionManagement({ selectedSemester: initialSelectedSemester }: UseTuitionManagementProps = {}) {
  const selectedSemesterName = initialSelectedSemester
    || `Học kỳ ${APP_CONFIG.DEFAULT_SEMESTER}, ${APP_CONFIG.DEFAULT_ACADEMIC_YEAR}`;

  // Data hooks
  const { isReady, hasData } = useCourseData();
  const { courses: currentSemesterData, summary: currentSemesterSummary, missingMetaCourses } = useTuitionCalculator(selectedSemesterName);

  // Action hooks
  const { paymentLink, copiedLink, handleCopyLink, handleOpenLink, handleExport } = useTuitionActions(currentSemesterSummary, currentSemesterData);
  const daysUntilDue = useTuitionCountdown(currentSemesterSummary.dueDate);

  // Constants & Computed values
  const trend = { direction: 'neutral' as const, value: 'Không đổi', percent: 0 };
  const paymentProgress = currentSemesterSummary.hasAdvancePayment
    ? (currentSemesterSummary.advancePayment / currentSemesterSummary.totalFee) * 100
    : 0;

  return {
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
    daysUntilDue,
    trend,
    paymentProgress,
    calculateDaysUntilDue // Exported for components if needed, though usually better to handle here
  };
}
