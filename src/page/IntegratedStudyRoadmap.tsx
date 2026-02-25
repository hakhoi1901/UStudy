import React, { useState } from 'react';
import { ShoppingCart, Calendar, Info, AlertTriangle, CheckCircle2, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseRow } from '../components/CourseRow';
import { SelectionBasketVi } from '../components/SelectionBasketVi';
import { PrerequisiteFlowchart } from '../components/PrerequisiteFlowchart';
import type { Course } from '../data/courseData';
import { useCourseData } from '../hooks/useCourseData';
import { useScheduleSolver } from '../hooks/useScheduleSolver';
import { Filter, Search } from 'lucide-react';
import { weekDays, timePeriods, type ClassSection } from '../data/timetableData';
import { BookmarkletButton } from '../components/BookmarkletButton';
import { NoDataCard } from '../components/ui/nodataCard';



export function IntegratedStudyRoadmap() {
  const [activeTab, setActiveTab] = useState<'selection' | 'calendar'>('selection');
  const [viewMode, setViewMode] = useState<'recommend' | 'all'>('recommend');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFlowchart, setShowFlowchart] = useState(false);
  const [flowchartCourse, setFlowchartCourse] = useState<Course | null>(null);

  // Lấy data động từ localStorage qua Recommender
  const { recommended, all, isReady, hasData } = useCourseData();

  // Bộ xếp lịch di truyền
  const { solve, solving, options, activeOption, setActiveOption, currentSections, error: solverError } = useScheduleSolver();

  // Nguồn dữ liệu tuỳ thuộc vào chế độ xem (khuyên dùng hay tất cả lớp mở)
  const currentSource = viewMode === 'recommend' ? recommended : all;

  // Dùng để render rổ rổ rổ rổ
  const allCurrentCourses = [...currentSource.core, ...currentSource.major, ...currentSource.electives];

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
    core: currentSource.core.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    major: currentSource.major.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    electives: currentSource.electives.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  // Từ kết quả solver -> xác định conflict
  const confirmedSections: ClassSection[] = currentSections;

  // Calculate grid position
  const getGridPosition = (classSection: ClassSection) => {
    const dayIndex = classSection.day - 2;

    return {
      gridColumn: dayIndex + 2,
      gridRowStart: classSection.startPeriod + 1,
      gridRowEnd: classSection.endPeriod + 2,
    };
  };

  // Check conflicts for a section
  const getConflicts = (section: ClassSection): ClassSection[] => {
    return confirmedSections.filter(confirmed => {
      if (confirmed.id === section.id) return false;
      if (confirmed.day !== section.day) return false;
      return !(
        section.endPeriod < confirmed.startPeriod ||
        section.startPeriod > confirmed.endPeriod
      );
    });
  };

  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center"> {/* Changed h-full to h-[calc(100vh-100px)] */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  if (!hasData) {
    return <div>
      <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>
      <p className="text-gray-600 mb-8">Đây là lộ trình học tập của bạn.</p>
      <NoDataCard />
    </div>;
  }

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
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'selection'
              ? 'border-[#004A98] text-[#004A98]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Chọn môn & Học phí</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'calendar'
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

            {/* View Mode Toggle */}
            <div className="mb-6 flex items-center justify-between p-1 bg-gray-100 rounded-lg max-w-sm">
              <button
                onClick={() => setViewMode('recommend')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${viewMode === 'recommend'
                  ? 'bg-white text-[#004A98] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span>Gợi ý</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${viewMode === 'recommend' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {recommended.core.length + recommended.major.length + recommended.electives.length}
                </span>
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${viewMode === 'all'
                  ? 'bg-white text-[#004A98] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span>Tất cả lớp mở</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${viewMode === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {all.core.length + all.major.length + all.electives.length}
                </span>
              </button>
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
                {/* Solve Controls */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      {currentSections.length > 0
                        ? `Đang xem phương án ${activeOption + 1}/${options.length} — ${selectedCourses.size} môn đã chọn`
                        : `${selectedCourses.size} môn đã chọn — Nhấn "Xếp lịch" để tìm phương án tối ưu`}
                    </p>
                    <p className="text-xs text-blue-700">
                      Thuật toán di truyền sẽ tự động chọn lớp tốt nhất, tránh trùng lịch.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const coursesToSchedule = Array.from(selectedCourses)
                        .map(id => allCurrentCourses.find(c => c.id === id))
                        .filter((c): c is NonNullable<typeof c> => !!c);
                      solve(coursesToSchedule);
                    }}
                    disabled={solving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0 font-medium text-sm"
                  >
                    <Cpu className="w-4 h-4" />
                    {solving ? 'Đang xếp lịch...' : 'Xếp lịch tự động'}
                  </button>
                </div>

                {/* Error display */}
                {solverError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    ⚠️ {solverError}
                  </div>
                )}

                {/* Option Navigator */}
                {options.length > 1 && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Phương án:</span>
                    <div className="flex gap-1">
                      {options.map((opt, idx) => (
                        <button
                          key={opt.option}
                          onClick={() => setActiveOption(idx)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeOption === idx
                            ? 'bg-[#004A98] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          PA {opt.option}
                          <span className="ml-1 opacity-60">({Math.round(opt.fitness / 1000)}k)</span>
                        </button>
                      ))}
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700" onClick={() => setActiveOption(Math.max(0, activeOption - 1))} />
                    <ChevronRight className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700" onClick={() => setActiveOption(Math.min(options.length - 1, activeOption + 1))} />
                  </div>
                )}

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

                      {/* Time Rows & Grid Background */}
                      {timePeriods.map((period) => (
                        <React.Fragment key={`row-${period.period}`}>
                          {/* Time Label */}
                          <div className="bg-gray-50 border-b border-r border-gray-200 p-2 flex flex-col items-center justify-center">
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
                        </React.Fragment>
                      ))}

                      {/* Class Blocks */}
                      {currentSections.map((classSection: ClassSection) => {
                        const position = getGridPosition(classSection);
                        const conflicts = getConflicts(classSection);
                        const hasConflict = conflicts.length > 0;

                        return (
                          <div
                            key={classSection.id}
                            style={{
                              gridColumn: position.gridColumn,
                              gridRowStart: position.gridRowStart,
                              gridRowEnd: position.gridRowEnd,
                              backgroundColor: hasConflict
                                ? '#FEE2E2'
                                : classSection.isConfirmed
                                  ? classSection.color
                                  : `${classSection.color}40`,
                              borderLeft: `4px solid ${hasConflict ? '#DC2626' : classSection.color
                                }`,
                              border: classSection.isConfirmed
                                ? 'none'
                                : `2px dashed ${classSection.color}`,
                            }}
                            className={`p-2 m-0.5 rounded overflow-hidden transition-all ${hasConflict ? 'ring-2 ring-red-500' : ''
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
                                className={`font-semibold leading-tight mb-1 ${hasConflict
                                  ? 'text-red-900'
                                  : classSection.isConfirmed
                                    ? 'text-white'
                                    : 'text-gray-900'
                                  }`}
                              >
                                {classSection.courseCode}
                              </p>
                              <p
                                className={`text-[10px] leading-tight mb-1 ${hasConflict
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
                                className={`text-[10px] font-medium mb-0.5 ${hasConflict
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
                                  className={`text-[9px] truncate ${hasConflict
                                    ? 'text-red-700'
                                    : classSection.isConfirmed
                                      ? 'text-white/80'
                                      : 'text-gray-600'
                                    }`}
                                >
                                  📍 {classSection.room}
                                </p>
                                <p
                                  className={`text-[10px] ${hasConflict
                                    ? 'text-red-700'
                                    : classSection.isConfirmed
                                      ? 'text-white/80'
                                      : 'text-gray-600'
                                    }`}
                                >
                                  👤 {classSection.lecturer}
                                </p>
                              </div>
                            </div>

                            {/* Confirmed Badge */}
                            {classSection.isConfirmed && !hasConflict && (
                              <div className="mt-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                                <span className="text-[10px] text-white font-medium">Mặc định</span>
                              </div>
                            )}
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
          allCurrentCourses.find(c => c.id === id)!
        ).filter(Boolean)}
        onRemoveCourse={handleCourseToggle}
      />

      {/* Prerequisite Flowchart Modal */}
      {showFlowchart && flowchartCourse && (
        <PrerequisiteFlowchart
          course={flowchartCourse}
          allCourses={allCurrentCourses as Course[]}
          onClose={() => setShowFlowchart(false)}
        />
      )}
    </div>
  );
}