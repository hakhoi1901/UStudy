import { useState } from 'react';
import { TrendingUp, Award, Target, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface CourseGrade {
  id: string;
  code: string;
  nameVi: string;
  credits: number;
  grade: number; // Scale 10
  semester: string;
  needsRetake: boolean;
  status: 'passed' | 'retake' | 'ongoing';
}

interface SimulatorCourse {
  id: string;
  code: string;
  nameVi: string;
  credits: number;
  projectedGrade: number; // Scale 10
}

const gradeHistory: CourseGrade[] = [
  { id: '1', code: 'CSC10001', nameVi: 'Nhập môn lập trình', credits: 4, grade: 9.0, semester: 'HK1 2024-2025', needsRetake: false, status: 'passed' },
  { id: '2', code: 'CSC10002', nameVi: 'Cấu trúc dữ liệu', credits: 4, grade: 8.5, semester: 'HK1 2024-2025', needsRetake: false, status: 'passed' },
  { id: '3', code: 'CSC10003', nameVi: 'Phương pháp lập trình', credits: 4, grade: 9.2, semester: 'HK2 2024-2025', needsRetake: false, status: 'passed' },
  { id: '4', code: 'CSC10004', nameVi: 'Cơ sở dữ liệu', credits: 4, grade: 6.0, semester: 'HK2 2024-2025', needsRetake: true, status: 'retake' },
  { id: '5', code: 'CSC10005', nameVi: 'Hệ điều hành', credits: 4, grade: 8.8, semester: 'HK2 2024-2025', needsRetake: false, status: 'passed' },
  { id: '6', code: 'CSC10006', nameVi: 'Mạng máy tính', credits: 4, grade: 8.2, semester: 'HK3 2024-2025', needsRetake: false, status: 'passed' },
  { id: '7', code: 'CSC14005', nameVi: 'Học máy', credits: 4, grade: 9.5, semester: 'HK3 2024-2025', needsRetake: false, status: 'passed' },
  { id: '8', code: 'CSC14006', nameVi: 'Phát triển ứng dụng di động', credits: 3, grade: 8.0, semester: 'HK3 2024-2025', needsRetake: false, status: 'passed' },
];

const simulatorCourses: SimulatorCourse[] = [
  { id: 's1', code: 'CSC14003', nameVi: 'Công nghệ phần mềm', credits: 4, projectedGrade: 8.5 },
  { id: 's2', code: 'CSC14004', nameVi: 'Phát triển ứng dụng Web', credits: 3, projectedGrade: 9.0 },
  { id: 's3', code: 'CSC14007', nameVi: 'Điện toán đám mây', credits: 3, projectedGrade: 8.0 },
  { id: 's4', code: 'CSC14008', nameVi: 'An toàn và bảo mật thông tin', credits: 4, projectedGrade: 8.5 },
  { id: 's5', code: 'CSC15001', nameVi: 'Trí tuệ nhân tạo', credits: 3, projectedGrade: 9.0 },
];

export function GradeManagementVi() {
  const [courses, setCourses] = useState<SimulatorCourse[]>(simulatorCourses);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [expandedSection, setExpandedSection] = useState<'history' | 'simulator'>('simulator');

  // Current GPA (Scale 10)
  const currentGPA = 8.5;
  const totalCompletedCredits = gradeHistory.reduce((sum, c) => sum + c.credits, 0);

  // Calculate Projected GPA
  const calculateProjectedGPA = () => {
    const currentTotalPoints = gradeHistory
      .filter(c => !c.needsRetake)
      .reduce((sum, c) => sum + (c.grade * c.credits), 0);
    const currentCredits = gradeHistory
      .filter(c => !c.needsRetake)
      .reduce((sum, c) => sum + c.credits, 0);
    
    const projectedPoints = courses.reduce((sum, c) => sum + (c.projectedGrade * c.credits), 0);
    const projectedCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    
    const totalPoints = currentTotalPoints + projectedPoints;
    const totalCredits = currentCredits + projectedCredits;
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const projectedGPA = calculateProjectedGPA();

  // Grade classification (Scale 10)
  const getClassification = (gpa: number) => {
    if (gpa >= 9.0) return 'Xuất sắc';
    if (gpa >= 8.0) return 'Giỏi';
    if (gpa >= 7.0) return 'Khá';
    if (gpa >= 6.5) return 'Trung bình khá';
    if (gpa >= 5.0) return 'Trung bình';
    return 'Yếu';
  };

  const handleGradeChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (numValue >= 0 && numValue <= 10) {
      setCourses(courses.map(course => 
        course.id === id ? { ...course, projectedGrade: numValue } : course
      ));
    }
  };

  const filteredHistory = selectedSemester === 'all' 
    ? gradeHistory 
    : gradeHistory.filter(c => c.semester === selectedSemester);

  const retakeCourses = gradeHistory.filter(c => c.needsRetake);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Quản lý điểm</h1>
        <p className="text-gray-600">Xem điểm số, mô phỏng GPA và theo dõi các môn học cần học lại.</p>
      </div>

      {/* Compact Summary Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Current GPA */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Điểm hiện tại</p>
              <p className="text-2xl font-bold text-gray-900">{currentGPA.toFixed(1)}<span className="text-sm text-gray-500">/10.0</span></p>
            </div>
          </div>

          {/* Projected GPA */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className="w-10 h-10 rounded-lg bg-[#004A98] flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Điểm dự kiến</p>
              <p className="text-2xl font-bold text-[#004A98]">{projectedGPA.toFixed(1)}<span className="text-sm text-blue-400">/10.0</span></p>
            </div>
          </div>

          {/* Classification */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              projectedGPA >= 8.0 ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              <Award className={`w-5 h-5 ${
                projectedGPA >= 8.0 ? 'text-green-600' : 'text-orange-600'
              }`} />
            </div>
            <div>
              <p className="text-xs text-gray-600">Xếp loại mục tiêu</p>
              <p className={`text-lg font-semibold ${
                projectedGPA >= 8.0 ? 'text-green-700' : 'text-orange-700'
              }`}>
                {getClassification(projectedGPA)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GPA Simulator - Collapsible */}
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

        {expandedSection === 'simulator' && (
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
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {course.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {course.nameVi}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                        {course.credits} TC
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={course.projectedGrade}
                        onChange={(e) => handleGradeChange(course.id, e.target.value)}
                        className="w-20 px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        course.projectedGrade >= 9.0 ? 'bg-green-100 text-green-700' :
                        course.projectedGrade >= 8.0 ? 'bg-blue-100 text-blue-700' :
                        course.projectedGrade >= 7.0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {getClassification(course.projectedGrade)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
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

      {/* Retake List - Red Alert */}
      {retakeCourses.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-red-900 font-semibold">Môn học cần học lại</h3>
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
              {retakeCourses.length}
            </span>
          </div>
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

      {/* Grade History - Compact Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-gray-900">Lịch sử điểm</h3>
            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
              {filteredHistory.length} môn
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98]"
            >
              <option value="all">Tất cả học kỳ</option>
              <option value="HK1 2024-2025">HK1 2024-2025</option>
              <option value="HK2 2024-2025">HK2 2024-2025</option>
              <option value="HK3 2024-2025">HK3 2024-2025</option>
            </select>
          </div>
        </div>

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
            <tbody className="divide-y divide-gray-200">
              {filteredHistory.map((course) => (
                <tr key={course.id} className={`hover:bg-gray-50 ${course.needsRetake ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {course.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {course.nameVi}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {course.semester}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {course.credits} TC
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                      course.grade >= 9.0 ? 'bg-green-100 text-green-700' :
                      course.grade >= 8.0 ? 'bg-blue-100 text-blue-700' :
                      course.grade >= 7.0 ? 'bg-yellow-100 text-yellow-700' :
                      course.grade >= 5.0 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {course.grade.toFixed(1)}
                    </span>
                  </td>
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

      {/* Privacy Footer */}
      <div className="py-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-[10px] text-gray-500 text-center">
          Dữ liệu được lưu tại Local Storage và sẽ xóa khi Đăng xuất
        </p>
      </div>
    </div>
  );
}