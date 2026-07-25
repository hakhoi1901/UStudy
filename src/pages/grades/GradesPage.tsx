import { useEffect, useState } from 'react';
import { NoDataCard } from '../../components/feedback';
import { SectionTabs } from '../../components/ui/navigation/section-tabs';
import { PageHeader } from '../../components/layout/page-header';
import { PageShell } from '../../components/layout/page-shell';
import { TranscriptExportMenu } from '../../features/grades';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';

// Import from feature module
import {
  GPAPerSemesterTable,
  GradeHistoryTable,
  RetakeCourses,
  GPAPullTool,
  useGradeManagement
} from '../../features/grades';

type GradeMainTab = 'overview' | 'target' | 'history';

const isGradeMainTab = (value: unknown): value is GradeMainTab =>
  value === 'overview' || value === 'target' || value === 'history';

export function GradesPage() {
  const {
    // Data
    gradesHistory,
    currentGPA,
    accumulatedCredits,
    totalCredits,
    isReady,
    hasData,
    gpaPerSemester,
    foundationGPA,
    majorSpecializedGPA,
    simulatorCourses,
    projectionSemesters,
    selectedProjectionSemester,
    selectedProjectionSemesterId,
    setSelectedProjectionSemesterId,
    semesterGPA,
    cumulativeGPA,
    uniqueSemesters,
    filteredHistory,
    retakeCoursesList,
    getClassification,
    
    // Context Info
    currentFaculty,
    currentMajor,
    currentCohort,

    // UI State & Actions
    selectedSemester,
    setSelectedSemester,
    handleGradeChange
  } = useGradeManagement();
  const [activeMainTab, setActiveMainTab] = useState<GradeMainTab>(() => {
    const saved = readFromStorage<unknown>(STORAGE_KEYS.GRADE_MAIN_TAB, 'overview');
    return isGradeMainTab(saved) ? saved : 'overview';
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GRADE_MAIN_TAB, activeMainTab);
  }, [activeMainTab]);

  const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
  const gradeMetrics = [
    { label: 'GPA hiện tại', value: currentGPA, description: 'Điểm tích lũy hiện tại', textClass: 'text-[#004A98]', barClass: 'bg-[#004A98]' },
    { label: 'GPA dự kiến', value: cumulativeGPA, description: 'Sau các môn đang học', textClass: 'text-indigo-600', barClass: 'bg-indigo-500' },
    { label: 'GPA cơ sở ngành', value: foundationGPA ?? 0, description: 'Các môn cơ sở ngành', textClass: 'text-emerald-700', barClass: 'bg-emerald-500' },
    { label: 'GPA chuyên ngành', value: majorSpecializedGPA ?? 0, description: 'Các môn chuyên ngành', textClass: 'text-orange-600', barClass: 'bg-orange-500' },
  ];

  const renderGradeMetrics = (className: string) => (
    <section className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}>
      <div className="grid grid-cols-2 divide-x divide-y divide-gray-200 md:grid-cols-4 md:divide-y-0">
        {gradeMetrics.map((metric) => (
          <div key={metric.label} className="relative min-w-0 px-4 py-4 md:px-5">
            <span className={`absolute inset-x-0 top-0 h-0.5 ${metric.barClass}`} />
            <p className="text-xs font-medium text-gray-500">{metric.label}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-bold tabular-nums ${metric.textClass}`}>{metric.value.toFixed(2)}</span>
              <span className="text-xs font-medium text-gray-400">/ 10</span>
            </div>
            <p className="mt-1 truncate text-[11px] text-gray-400">{metric.description}</p>
          </div>
        ))}
      </div>
    </section>
  );

  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <PageShell
        header={<PageHeader
          title="Quản lý điểm"
          description="Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại."
        />}
      >
        <NoDataCard />
      </PageShell>
    );
  }

  return (
    <PageShell
      contentClassName="space-y-6"
      header={<PageHeader
        title="Quản lý điểm"
        description="Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại."
        actions={hasData && (
          <TranscriptExportMenu
            name={studentDb?.name || 'Sinh viên'}
            dob={studentDb?.dob || '---'}
            studentId={studentDb?.id || '---'}
            program={currentFaculty?.name || '---'}
            major={currentMajor?.name || '---'}
            cohort={currentCohort?.name || '---'}
            totalCredits={accumulatedCredits}
            gpa10={currentGPA}
            courses={gradesHistory.map((grade) => ({ code: grade.code, name: grade.nameVi, credits: grade.credits, score10: grade.grade }))}
          />
        )}
      />}
    >

      <div className="space-y-4">
        {renderGradeMetrics('hidden md:block')}

        <SectionTabs
          ariaLabel="Quản lý điểm"
          activeTab={activeMainTab}
          onChange={setActiveMainTab}
          tabs={[
            { id: 'overview', label: 'Tổng quan', description: 'GPA và xu hướng' },
            { id: 'target', label: 'Kế hoạch GPA', description: 'Mục tiêu và mô phỏng' },
            { id: 'history', label: 'Lịch sử điểm', description: 'Kết quả đã có' },
          ]}
        />
      </div>

      <div>
        {activeMainTab === 'overview' && (
          <div className="space-y-4">
            {renderGradeMetrics('md:hidden')}
            <GPAPerSemesterTable getClassification={getClassification} gpaPerSemester={gpaPerSemester} />
          </div>
        )}

        {activeMainTab === 'target' && (
          <div className="space-y-4">
            <GPAPullTool
              gradesHistory={gradesHistory}
              getClassification={getClassification}
              simulatorCourses={simulatorCourses}
              projectionSemesters={projectionSemesters}
              selectedProjectionSemester={selectedProjectionSemester}
              selectedProjectionSemesterId={selectedProjectionSemesterId}
              setSelectedProjectionSemesterId={setSelectedProjectionSemesterId}
              handleGradeChange={handleGradeChange}
              currentGPA={currentGPA}
              accumulatedCredits={accumulatedCredits}
              totalCredits={totalCredits}
              semesterGPA={semesterGPA}
              cumulativeGPA={cumulativeGPA}
            />
          </div>
        )}

        {activeMainTab === 'history' && (
          <div className="space-y-4">
            {retakeCoursesList.length > 0 && <RetakeCourses retakeCourses={retakeCoursesList} />}
            <GradeHistoryTable
              filteredHistory={filteredHistory}
              selectedSemester={selectedSemester}
              uniqueSemesters={uniqueSemesters}
              setSelectedSemester={setSelectedSemester}
            />
          </div>
        )}
      </div>

    </PageShell>
  );
}
