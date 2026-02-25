import { useState } from 'react';
import { ShoppingCart, Calendar, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CourseRow } from './CourseRow';
import { SelectionBasketVi } from './SelectionBasketVi';
import { PrerequisiteFlowchart } from './PrerequisiteFlowchart';
import { courses, type Course } from '../data/courseData';
import { Filter, Search } from 'lucide-react';
import {
  timePeriods,
  weekDays,
  type ClassSection,
} from '../data/timetableData';

// Mock class sections based on selected courses
const generateClassSections = (selectedCourseIds: string[]): ClassSection[] => {
  const allCourses = [...courses.core, ...courses.major, ...courses.electives];
  const sections: ClassSection[] = [];
  
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
  let colorIndex = 0;

  selectedCourseIds.forEach((courseId) => {
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    const color = colors[colorIndex % colors.length];
    colorIndex++;

    // Generate 2-3 class sections per course with different time slots
    const numSections = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < numSections; i++) {
      const day = (Math.floor(Math.random() * 5) + 2); // Mon-Fri (2-6)
      const startPeriod = Math.floor(Math.random() * 8) + 1; // P1-P9
      const duration = 3; // 3 periods per class
      
      sections.push({
        id: `${courseId}-section-${i}`,
        courseCode: course.code,
        courseName: course.name,
        courseNameVi: course.nameVi,
        sectionNumber: `L0${i + 1}`,
        lecturer: course.instructor || 'TS. Nguyễn Văn A',
        room: `${String.fromCharCode(65 + Math.floor(Math.random() * 3))}${Math.floor(Math.random() * 4) + 1}0${Math.floor(Math.random() * 5) + 1}`,
        day: day,
        startPeriod: startPeriod,
        endPeriod: startPeriod + duration - 1,
        color: color,
        isConfirmed: i === 0, // First section is default
        credits: course.credits,
      });
    }
  });

  return sections;
};

// Check for conflicts
const hasTimeConflict = (section1: ClassSection, section2: ClassSection): boolean => {
  if (section1.day !== section2.day) return false;
  return !(
    section1.endPeriod < section2.startPeriod ||
    section1.startPeriod > section2.endPeriod
  );
};

export function IntegratedStudyRoadmap() {
  const [activeTab, setActiveTab] = useState<'selection' | 'calendar'>('selection');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFlowchart, setShowFlowchart] = useState(false);
  const [flowchartCourse, setFlowchartCourse] = useState<Course | null>(null);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleShowFlowchart = (course: Course) => {
    setFlowchartCourse(course);
    setShowFlowchart(true);
  };

  const filteredCourses = {
    core: courses.core.filter(c => 
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    major: courses.major.filter(c => 
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    electives: courses.electives.filter(c => 
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  // Generate class sections for selected courses
  const classSections = generateClassSections(Array.from(selectedCourses));
  const confirmedSections = classSections.filter(s => s.isConfirmed);

  // Calculate grid position
  const getGridPosition = (classSection: ClassSection) => {
    const dayIndex = classSection.day - 2;
    const duration = classSection.endPeriod - classSection.startPeriod + 1;
    
    return {
      gridColumn: dayIndex + 2,
      gridRowStart: classSection.startPeriod + 1,
      gridRowSpan: duration,
    };
  };

  // Check conflicts for a section
  const getConflicts = (section: ClassSection): ClassSection[] => {
    return confirmedSections.filter(confirmed => {
      if (confirmed.id === section.id) return false;
      return hasTimeConflict(section, confirmed);
    });
  };

  return (
    <div className="flex h-full gap-6">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>
          <p className="text-gray-600">Chọn môn học và xem lịch trực quan với phát hiện xung đột thời gian.</p>
        </div>

        {/* Dual Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('selection')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'selection'
                ? 'border-[#004A98] text-[#004A98]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Chọn môn & Học phí</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'calendar'
                ? 'border-[#004A98] text-[#004A98]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Lịch dự kiến</span>
            {selectedCourses.size > 0 && (
              <span className="px-2 py-0.5 bg-[#004A98] text-white text-xs rounded-full">
                {selectedCourses.size}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Course Selection */}
        {activeTab === 'selection' && (
          <div>
            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên môn học hoặc mã môn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 text-sm">Lọc</span>
              </button>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium">
                  Chọn các môn học bạn muốn đăng ký cho học kỳ tiếp theo
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Môn màu xanh lá: Đủ điều kiện đăng ký • Môn màu đỏ: Cần học lại • Môn màu xám: Chưa học môn tiên quyết
                </p>
              </div>
            </div>

            {/* Core IT Subjects */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-gray-900 font-semibold">Môn học cơ sở ngành</h3>
                <span className="px-2.5 py-0.5 bg-[#004A98] text-white text-xs rounded-full font-medium">
                  {filteredCourses.core.length} môn
                </span>
              </div>
              <div className="space-y-2">
                {filteredCourses.core.map((course) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    isSelected={selectedCourses.has(course.id)}
                    onToggle={handleCourseToggle}
                    onShowFlowchart={handleShowFlowchart}
                  />
                ))}
              </div>
            </div>

            {/* Major-Specific Courses */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-gray-900 font-semibold">Môn học chuyên ngành</h3>
                <span className="px-2.5 py-0.5 bg-[#004A98] text-white text-xs rounded-full font-medium">
                  {filteredCourses.major.length} môn
                </span>
              </div>
              <div className="space-y-2">
                {filteredCourses.major.map((course) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    isSelected={selectedCourses.has(course.id)}
                    onToggle={handleCourseToggle}
                    onShowFlowchart={handleShowFlowchart}
                  />
                ))}
              </div>
            </div>

            {/* Electives */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-gray-900 font-semibold">Môn học tự chọn</h3>
                <span className="px-2.5 py-0.5 bg-[#004A98] text-white text-xs rounded-full font-medium">
                  {filteredCourses.electives.length} môn
                </span>
              </div>
              <div className="space-y-2">
                {filteredCourses.electives.map((course) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    isSelected={selectedCourses.has(course.id)}
                    onToggle={handleCourseToggle}
                    onShowFlowchart={handleShowFlowchart}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Visual Calendar */}
        {activeTab === 'calendar' && (
          <div>
            {selectedCourses.size === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Chưa chọn môn học nào</h3>
                <p className="text-gray-600 mb-4">
                  Vui lòng chuyển sang tab "Chọn môn & Học phí" để chọn các môn học bạn muốn đăng ký.
                </p>
                <button
                  onClick={() => setActiveTab('selection')}
                  className="px-6 py-2 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-colors"
                >
                  Đi đến Chọn môn
                </button>
              </div>
            ) : (
              <div>
                {/* Info Banner */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      L��ch dự kiến - {selectedCourses.size} môn đã chọn
                    </p>
                    <p className="text-xs text-blue-700">
                      Mỗi môn học sẽ hiển thị các lớp có sẵn. Lớp đầu tiên được chọn làm mặc định. 
                      Các lớp trùng lịch sẽ được đánh dấu màu đỏ với cảnh báo "⚠️ Trùng lịch".
                    </p>
                  </div>
                </div>

                {/* Compact Timetable Grid */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
                  <div className="min-w-[1000px]">
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: '80px repeat(7, 1fr)',
                        gridTemplateRows: 'auto repeat(12, 48px)',
                      }}
                    >
                      {/* Header - Days of Week */}
                      <div className="bg-[#004A98] border-b border-gray-300"></div>
                      {weekDays.map((day) => (
                        <div
                          key={day.day}
                          className="bg-[#004A98] text-white p-2 border-b border-l border-gray-300 flex items-center justify-center"
                        >
                          <div className="text-center">
                            <p className="text-sm font-semibold">{day.nameVi}</p>
                          </div>
                        </div>
                      ))}

                      {/* Time Rows */}
                      {timePeriods.map((period) => (
                        <>
                          {/* Time Label */}
                          <div
                            key={`time-${period.period}`}
                            className="bg-gray-50 border-b border-r border-gray-200 p-2 flex flex-col items-center justify-center"
                          >
                            <span className="text-xs font-semibold text-gray-700">P{period.period}</span>
                            <span className="text-[10px] text-gray-500">{period.time.split(' - ')[0]}</span>
                          </div>

                          {/* Day Cells */}
                          {weekDays.map((day) => (
                            <div
                              key={`cell-${day.day}-${period.period}`}
                              className="border-b border-l border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                            ></div>
                          ))}
                        </>
                      ))}

                      {/* Class Blocks */}
                      {classSections.map((classSection) => {
                        const position = getGridPosition(classSection);
                        const conflicts = getConflicts(classSection);
                        const hasConflict = conflicts.length > 0;

                        return (
                          <div
                            key={classSection.id}
                            style={{
                              gridColumn: position.gridColumn,
                              gridRow: `${position.gridRowStart} / span ${position.gridRowSpan}`,
                              backgroundColor: hasConflict
                                ? '#FEE2E2'
                                : classSection.isConfirmed
                                ? classSection.color
                                : `${classSection.color}40`,
                              borderLeft: `4px solid ${
                                hasConflict ? '#DC2626' : classSection.color
                              }`,
                              border: classSection.isConfirmed
                                ? 'none'
                                : `2px dashed ${classSection.color}`,
                            }}
                            className={`p-2 m-0.5 rounded overflow-hidden transition-all ${
                              hasConflict ? 'ring-2 ring-red-500' : ''
                            }`}
                          >
                            <div className="text-xs h-full flex flex-col">
                              {/* Conflict Warning */}
                              {hasConflict && (
                                <div className="flex items-center gap-1 mb-1 text-red-700">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span className="font-bold text-[10px]">⚠️ Trùng lịch</span>
                                </div>
                              )}

                              {/* Course Info */}
                              <p
                                className={`font-semibold leading-tight mb-1 ${
                                  hasConflict
                                    ? 'text-red-900'
                                    : classSection.isConfirmed
                                    ? 'text-white'
                                    : 'text-gray-900'
                                }`}
                              >
                                {classSection.courseCode}
                              </p>
                              <p
                                className={`text-[10px] leading-tight mb-1 ${
                                  hasConflict
                                    ? 'text-red-800'
                                    : classSection.isConfirmed
                                    ? 'text-white/90'
                                    : 'text-gray-700'
                                }`}
                              >
                                {classSection.courseNameVi}
                              </p>

                              {/* Section Number */}
                              <p
                                className={`text-[10px] font-medium mb-1 ${
                                  hasConflict
                                    ? 'text-red-700'
                                    : classSection.isConfirmed
                                    ? 'text-white/80'
                                    : 'text-gray-600'
                                }`}
                              >
                                Lớp {classSection.sectionNumber}
                              </p>

                              {/* Room and Lecturer */}
                              <div className="mt-auto">
                                <p
                                  className={`text-[10px] ${
                                    hasConflict
                                      ? 'text-red-700'
                                      : classSection.isConfirmed
                                      ? 'text-white/80'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  📍 {classSection.room}
                                </p>
                                <p
                                  className={`text-[10px] ${
                                    hasConflict
                                      ? 'text-red-700'
                                      : classSection.isConfirmed
                                      ? 'text-white/80'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  👤 {classSection.lecturer}
                                </p>
                              </div>

                              {/* Confirmed Badge */}
                              {classSection.isConfirmed && !hasConflict && (
                                <div className="mt-1 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                  <span className="text-[10px] text-white font-medium">Mặc định</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#3B82F6] border-2 border-[#3B82F6]"></div>
                    <span className="text-gray-700">Lớp mặc định</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#3B82F640] border-2 border-[#3B82F6] border-dashed"></div>
                    <span className="text-gray-700">Lớp khác</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-100 border-2 border-red-500"></div>
                    <span className="text-gray-700">Trùng lịch</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selection Basket Sidebar - Fixed */}
      <SelectionBasketVi
        selectedCourses={Array.from(selectedCourses).map(id => 
          [...courses.core, ...courses.major, ...courses.electives].find(c => c.id === id)!
        ).filter(Boolean)}
        onRemoveCourse={handleCourseToggle}
      />

      {/* Prerequisite Flowchart Modal */}
      {showFlowchart && flowchartCourse && (
        <PrerequisiteFlowchart
          course={flowchartCourse}
          onClose={() => setShowFlowchart(false)}
        />
      )}
    </div>
  );
}