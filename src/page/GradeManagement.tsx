import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Award, Target, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useStudentGradeData } from '../hooks/useStudentGradeData';
import { useAppNotification } from '../context/NotificationContext';
import { NoDataCard } from '../components/ui/nodataCard';
import { GPA_CONFIG, GPA_WARNING_THRESHOLD } from '../config/GPA';
import type { Course } from '../data/courseData';
import { PrivacyFooter } from '../components/PrivacyFooter';

// interface Course {
//   id: string;
//   code: string;
//   nameVi: string;
//   credits: number;
//   projectedGrade: number;
// }

export function GradeManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [expandedSection, setExpandedSection] = useState<'history' | 'simulator'>('simulator');
  const hasAlertedRef = useRef(false);

  const { gradesHistory, currentGPA, isReady, hasData } = useStudentGradeData();
  const { addNotification } = useAppNotification();

  // Lấy danh sách học kỳ
  const uniqueSemesters = Array.from(new Set(gradesHistory.map(g => g.semester))).sort((a, b) => b.localeCompare(a));

  // tính GPA dự kiến
  const calculateProjectedGPA = () => {
    // Tính tổng điểm hiện tại (điểm * tín chỉ)
    const currentTotalPoints = gradesHistory
      .filter(c => c.status === 'passed')
      .reduce((sum, c) => sum + (c.grade * c.credits), 0);
    // Tính tổng tín chỉ hiện tại
    const currentCredits = gradesHistory
      .filter(c => c.status === 'passed')
      .reduce((sum, c) => sum + c.credits, 0);

    // Tính tổng điểm dự kiến (điểm * tín chỉ)
    const projectedPoints = courses.reduce((sum, c) => sum + ((c.projectedGrade ?? 0) * c.credits), 0);
    // Tính tổng tín chỉ dự kiến
    const projectedCredits = courses.reduce((sum, c) => sum + c.credits, 0);

    // Tính tổng điểm và tổng tín chỉ
    const totalPoints = currentTotalPoints + projectedPoints;
    const totalCredits = currentCredits + projectedCredits;

    // Tính GPA dự kiến
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const projectedGPA = calculateProjectedGPA();

  useEffect(() => {
    // Nếu có dữ liệu điểm, và mô phỏng GPA < GPA_WARNING_THRESHOLD
    // thì quăng 1 notification cảnh báo học vụ
    if (hasData && projectedGPA < GPA_WARNING_THRESHOLD && projectedGPA > 0 && !hasAlertedRef.current) {
      addNotification({
        title: 'Cảnh báo học vụ',
        message: `Chú ý: GPA dự kiến của bạn đang nằm ở mức ${getClassification(projectedGPA)}.`,
        type: 'warning'
      });
      hasAlertedRef.current = true; // Chỉ báo 1 lần tránh spam
    } else if (projectedGPA >= GPA_WARNING_THRESHOLD) {
      hasAlertedRef.current = false; // Reset nếu điểm tăng lại
    }
  }, [projectedGPA, hasData, addNotification]);

  // Lấy xếp loại dựa trên GPA
  const getClassification = (gpa: number) => {
    for (const config of GPA_CONFIG) {
      if (gpa >= config.value) return config.lable;
    }
    return GPA_CONFIG[GPA_CONFIG.length - 1].lable;
  };

  // Xử lý thay đổi điểm dự kiến
  const handleGradeChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (numValue >= 0 && numValue <= 10) {
      setCourses(courses.map(course =>
        course.id === id ? { ...course, projectedGrade: numValue } : course
      ));
    }
  };

  // Lọc danh sách điểm theo học kỳ
  const filteredHistory = selectedSemester === 'all'
    ? gradesHistory
    : gradesHistory.filter(c => c.semester === selectedSemester);

  // Lấy danh sách các môn học cần học lại
  const retakeCourses = gradesHistory.filter(c => c.needsRetake && c.status === 'retake');

  // Hiển thị loading khi chưa có dữ liệu
  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  // Hiển thị thông báo nếu không có dữ liệu
  if (!hasData) {
    return <div>
      <h1 className="text-gray-900 mb-2">Quản lý điểm</h1>
      <p className="text-gray-600 mb-8">Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại.</p>
      <NoDataCard />
    </div>
  }

  // Render giao diện quản lý điểm
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Quản lý điểm</h1>
        <p className="text-gray-600">Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại.</p>
      </div>

      {/* Thông tin GPA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Điểm hiện tại */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Điểm hiện tại</p>
              <p className="text-2xl font-bold text-gray-900">{currentGPA.toFixed(2)}<span className="text-sm text-gray-500">/10.0</span></p>
            </div>
          </div>

          {/* Điểm dự kiến */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className="w-10 h-10 rounded-lg bg-[#004A98] flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Điểm dự kiến</p>
              <p className="text-2xl font-bold text-[#004A98]">{projectedGPA.toFixed(2)}<span className="text-sm text-blue-400">/10.0</span></p>
            </div>
          </div>

          {/* Xếp loại mục tiêu */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${projectedGPA >= 8.0 ? 'bg-green-100' : 'bg-orange-100'
              }`}>
              <Award className={`w-5 h-5 ${projectedGPA >= 8.0 ? 'text-green-600' : 'text-orange-600'
                }`} />
            </div>
            <div>
              <p className="text-xs text-gray-600">Xếp loại mục tiêu</p>
              <p className={`text-lg font-semibold ${projectedGPA >= 8.0 ? 'text-green-700' : 'text-orange-700'
                }`}>
                {getClassification(projectedGPA)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mô phỏng GPA - Học kỳ tiếp theo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'simulator' ? 'history' : 'simulator')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-gray-900">Mô phỏng GPA - Học kỳ tiếp theo</h3>
            <span className="px-2 py-0.5 bg-[#004A98] text-white text-xs rounded-full">
              {courses.length} môn
            </span>
          </div>
          {expandedSection === 'simulator' ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Mô phỏng GPA - Học kỳ tiếp theo */}
        {expandedSection === 'simulator' && (
          <div className="overflow-x-auto">

            {/* Bảng danh sách môn học */}
            <table className="w-full">

              {/* Tiêu đề bảng */}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Mã môn
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Tên môn học
                  </th>
                  <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                    Tín chỉ
                  </th>
                  <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                    Điểm dự phóng
                  </th>
                  <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                    Xếp loại
                  </th>
                </tr>
              </thead>

              {/* Nội dung bảng danh sách môn học */}
              <tbody className="divide-y divide-gray-200">

                {/* Thông tin mỗi môn học */}
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">

                    {/* Mã môn học */}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {course.code}
                    </td>

                    {/* Tên môn học */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {course.nameVi}
                    </td>

                    {/* Số tín chỉ */}
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                        {course.credits} TC
                      </span>
                    </td>

                    {/* Điểm dự kiến */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={course.projectedGrade ?? 0}
                        onChange={(e) => handleGradeChange(course.id, e.target.value)}
                        className="w-20 px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                      />
                    </td>

                    {/* Xếp loại dự kiến */}
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(course.projectedGrade ?? 0) >= 9.0 ? 'bg-green-100 text-green-700' :
                        (course.projectedGrade ?? 0) >= 8.0 ? 'bg-blue-100 text-blue-700' :
                          (course.projectedGrade ?? 0) >= 7.0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                        }`}>
                        {getClassification(course.projectedGrade ?? 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Tổng kết */}
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900">
                    Tổng kết
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-semibold">
                    {courses.reduce((sum, c) => sum + c.credits, 0)} TC
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-semibold text-[#004A98]">
                    GPA: {projectedGPA.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-semibold">
                    {getClassification(projectedGPA)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Danh sách môn học cần học lại (Nếu có) */}
      {retakeCourses.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-red-900 font-semibold">Môn học cần học lại</h3>
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
              {retakeCourses.length}
            </span>
          </div>

          {/* Thông tin mỗi môn học (mã môn, tên môn, số tín chỉ, điểm số, xếp loại) */}
          <div className="space-y-2">
            {retakeCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between bg-white border border-red-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    Cần học lại
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{course.code} - {course.nameVi}</p>
                    <p className="text-xs text-gray-600">{course.semester}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-700">Điểm: {course.grade.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">{course.credits} tín chỉ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lịch sử điểm */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-gray-900">Lịch sử điểm</h3>
            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
              {filteredHistory.length} môn
            </span>
          </div>

          {/* Lọc theo học kỳ */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98]"
            >
              <option value="all">Tất cả học kỳ</option>
              {uniqueSemesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bảng lịch sử điểm */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Mã môn
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Tên môn học
                </th>
                <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                  Học kỳ
                </th>
                <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                  Tín chỉ
                </th>
                <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                  Điểm
                </th>
                <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>

            {/* Danh sách các môn học */}
            <tbody className="divide-y divide-gray-200">
              {filteredHistory.map((course) => (
                <tr key={course.id} className={`hover:bg-gray-50 ${course.needsRetake ? 'bg-red-50/30' : ''}`}>
                  {/* Mã môn */}
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {course.code}
                  </td>
                  {/* Tên môn học */}
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {course.nameVi}
                  </td>
                  {/* Học kỳ */}
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {course.semester}
                  </td>
                  {/* Số tín chỉ */}
                  <td className="px-4 py-3 text-sm text-gray-900 text-center">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {course.credits} TC
                    </span>
                  </td>
                  {/* Điểm số */}
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${course.grade >= 9.0 ? 'bg-green-100 text-green-700' :
                      course.grade >= 8.0 ? 'bg-blue-100 text-blue-700' :
                        course.grade >= 7.0 ? 'bg-yellow-100 text-yellow-700' :
                          course.grade >= 5.0 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                      }`}>
                      {course.grade.toFixed(1)}
                    </span>
                  </td>
                  {/* Trạng thái */}
                  <td className="px-4 py-3 text-center">
                    {course.needsRetake ? (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Cần học lại
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Đạt
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <PrivacyFooter />
    </div>
  );
}