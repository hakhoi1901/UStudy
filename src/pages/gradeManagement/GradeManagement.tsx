import { useAppNotification } from '../../context/NotificationContext';
import { NoDataCard } from '../../components/nodataCard';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { FileDown, TrendingUp, BarChart2, X } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TranscriptPDF } from '../../components/TranscriptPDF';
import { readFromStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';

// Import from feature module
import {
  GPAInformation,
  GPAPerSemesterTable,
  GradeHistoryTable,
  RetakeCourses,
  GPASimulationTable,
  GPAPullTool,
  useGradeManagement
} from '../../features/grades';

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
    expandedSection,
    setExpandedSection,
    mobileActivePanel,
    setMobileActivePanel,
    handleGradeChange
  } = useGradeManagement();

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

      {/* Thông tin GPA */}
      <GPAInformation
        currentGPA={currentGPA}
        projectedGPA={cumulativeGPA}
        majorGPA={foundationGPA ?? 0}
        majorSpecializedGPA={majorSpecializedGPA ?? 0}
      />

      {/* GPA theo học kỳ */}
      <GPAPerSemesterTable
        getClassification={getClassification}
        gpaPerSemester={gpaPerSemester}
      />

      {/* Mobile Feature Buttons */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        <button
          onClick={() => setMobileActivePanel(mobileActivePanel === 'gpaPull' ? null : 'gpaPull')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all shadow-sm ${mobileActivePanel === 'gpaPull'
            ? 'bg-[#004A98] text-white border-[#004A98]'
            : 'bg-white text-gray-700 border-gray-200 hover:border-[#004A98] hover:text-[#004A98]'
            }`}
        >
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Kéo GPA</span>
        </button>
        <button
          onClick={() => setMobileActivePanel(mobileActivePanel === 'gpaSimulation' ? null : 'gpaSimulation')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all shadow-sm ${mobileActivePanel === 'gpaSimulation'
            ? 'bg-[#004A98] text-white border-[#004A98]'
            : 'bg-white text-gray-700 border-gray-200 hover:border-[#004A98] hover:text-[#004A98]'
            }`}
        >
          <BarChart2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Mô phỏng GPA</span>
        </button>
      </div>

      {/* Mobile Panel: Kéo GPA */}
      {mobileActivePanel === 'gpaPull' && (
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">Công cụ Kéo GPA</span>
            <button onClick={() => setMobileActivePanel(null)} className="p-1.5 rounded-full hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <GPAPullTool
            gradesHistory={gradesHistory}
            getClassification={getClassification}
            simulatorCourses={simulatorCourses}
            handleGradeChange={handleGradeChange}
            currentGPA={currentGPA}
            accumulatedCredits={accumulatedCredits}
            totalCredits={totalCredits}
          />
        </div>
      )}

      {/* Mobile Panel: Mô phỏng GPA */}
      {mobileActivePanel === 'gpaSimulation' && (
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">Mô phỏng GPA</span>
            <button onClick={() => setMobileActivePanel(null)} className="p-1.5 rounded-full hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <GPASimulationTable
            courses={simulatorCourses}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            semesterGPA={semesterGPA}
            cumulativeGPA={cumulativeGPA}
            getClassification={getClassification}
            handleGradeChange={handleGradeChange}
          />
        </div>
      )}

      {/* Desktop Sections */}
      <div className="hidden md:block">
        <GPAPullTool
          gradesHistory={gradesHistory}
          getClassification={getClassification}
          simulatorCourses={simulatorCourses}
          handleGradeChange={handleGradeChange}
          currentGPA={currentGPA}
          accumulatedCredits={accumulatedCredits}
          totalCredits={totalCredits}
        />
      </div>

      <div className="hidden md:block">
        <GPASimulationTable
          courses={simulatorCourses}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
          semesterGPA={semesterGPA}
          cumulativeGPA={cumulativeGPA}
          getClassification={getClassification}
          handleGradeChange={handleGradeChange}
        />
      </div>

      {/* Retake Suggestions */}
      {retakeCoursesList.length > 0 && (
        <RetakeCourses retakeCourses={retakeCoursesList} />
      )}

      {/* Grade History */}
      <GradeHistoryTable
        filteredHistory={filteredHistory}
        selectedSemester={selectedSemester}
        uniqueSemesters={uniqueSemesters}
        setSelectedSemester={setSelectedSemester}
      />

      <PrivacyFooter />
    </div>
  );
}