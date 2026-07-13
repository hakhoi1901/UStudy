import { useEffect, useState } from 'react';
import { NoDataCard } from '../../components/nodataCard';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { SectionTabs } from '../../components/ui/section-tabs';
import { FileDown, BarChart2, History } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TranscriptPDF } from '../../components/TranscriptPDF';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';

// Import from feature module
import {
  GPAPerSemesterTable,
  GradeHistoryTable,
  RetakeCourses,
  GPASimulationTable,
  GPAPullTool,
  useGradeManagement
} from '../../features/grades';

type GradeMainTab = 'overview' | 'target' | 'history';
type GradeWorkspaceTab = 'target' | 'simulation';

const isGradeMainTab = (value: unknown): value is GradeMainTab =>
  value === 'overview' || value === 'target' || value === 'history';

const isGradeWorkspaceTab = (value: unknown): value is GradeWorkspaceTab =>
  value === 'target' || value === 'simulation';

export function GradeManagement() {
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
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<GradeWorkspaceTab>(() => {
    const saved = readFromStorage<unknown>(STORAGE_KEYS.GRADE_GPA_WORKSPACE_TAB, 'target');
    return isGradeWorkspaceTab(saved) ? saved : 'target';
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GRADE_MAIN_TAB, activeMainTab);
  }, [activeMainTab]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GRADE_GPA_WORKSPACE_TAB, activeWorkspaceTab);
  }, [activeWorkspaceTab]);

  const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);

  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div>
        <h1 className="text-gray-900 mb-2">Quản lý điểm</h1>
        <p className="text-gray-600 mb-8">Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại.</p>
        <NoDataCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Quản lý điểm</h1>
          <p className="text-gray-600">Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại.</p>
        </div>

        {hasData && (
          <PDFDownloadLink
            document={
              <TranscriptPDF
                data={{
                  studentInfo: {
                    fullName: studentDb?.name || "N/A",
                    dob: studentDb?.dob || "---",
                    studentId: studentDb?.id || "---",
                    course: currentCohort?.name || "---",
                    program: currentFaculty?.name || "---",
                    major: currentMajor?.name || "---",
                  },
                  courses: gradesHistory.map((g, idx) => ({
                    no: idx + 1,
                    id: g.code,
                    title: g.nameVi,
                    credits: g.credits,
                    score10: g.grade,
                    score4: (g.grade >= 9 ? 4.0 : g.grade >= 8 ? 3.5 : g.grade >= 7 ? 3.0 : g.grade >= 6.5 ? 2.5 : g.grade >= 5 ? 2.0 : 0.0).toFixed(1)
                  })),
                  summary: {
                    totalCredits: accumulatedCredits,
                    gpa10: currentGPA.toFixed(2),
                    gpa4: (currentGPA >= 9 ? 4.0 : currentGPA >= 8 ? 3.5 : currentGPA >= 7 ? 3.0 : currentGPA >= 6.5 ? 2.5 : currentGPA >= 5 ? 2.0 : 0.0).toFixed(2)
                  }
                }}
              />
            }
            fileName={`BangDiem_${studentDb?.name || 'SinhVien'}.pdf`}
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003B7A] transition-colors shadow-sm disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                {loading ? 'Đang chuẩn bị...' : 'Xuất bảng điểm'}
              </button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      <div className="space-y-4">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-200 md:grid-cols-4 md:divide-y-0">
            {[
              { label: 'GPA hiện tại', value: currentGPA, description: 'Điểm tích lũy hiện tại', textClass: 'text-[#004A98]', barClass: 'bg-[#004A98]' },
              { label: 'GPA dự kiến', value: cumulativeGPA, description: 'Sau các môn đang học', textClass: 'text-indigo-600', barClass: 'bg-indigo-500' },
              { label: 'GPA cơ sở ngành', value: foundationGPA ?? 0, description: 'Các môn cơ sở ngành', textClass: 'text-emerald-700', barClass: 'bg-emerald-500' },
              { label: 'GPA chuyên ngành', value: majorSpecializedGPA ?? 0, description: 'Các môn chuyên ngành', textClass: 'text-orange-600', barClass: 'bg-orange-500' },
            ].map((metric) => (
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
          <GPAPerSemesterTable getClassification={getClassification} gpaPerSemester={gpaPerSemester} />
        )}

        {activeMainTab === 'target' && (
          <div className="space-y-4">
            <div className="flex overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1" role="tablist" aria-label="Kế hoạch GPA">
              {[
                { id: 'target' as const, label: 'Mục tiêu GPA tốt nghiệp' },
                { id: 'simulation' as const, label: 'Mô phỏng kỳ tiếp theo' },
              ].map((tab) => {
                const isActive = activeWorkspaceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveWorkspaceTab(tab.id)}
                    className={`min-w-max flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeWorkspaceTab === 'target' ? (
              <GPAPullTool
                gradesHistory={gradesHistory}
                getClassification={getClassification}
                simulatorCourses={simulatorCourses}
                handleGradeChange={handleGradeChange}
                currentGPA={currentGPA}
                accumulatedCredits={accumulatedCredits}
                totalCredits={totalCredits}
              />
            ) : (
              <GPASimulationTable
                courses={simulatorCourses}
                semesterGPA={semesterGPA}
                cumulativeGPA={cumulativeGPA}
                getClassification={getClassification}
                handleGradeChange={handleGradeChange}
              />
            )}
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

      <PrivacyFooter />
    </div>
  );
}
