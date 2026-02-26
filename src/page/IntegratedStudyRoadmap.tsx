/* intergratedStudyRoadmap.tsx
** Trang Lộ trình học tập tích hợp
*/

import { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, Info, AlertTriangle, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseRow } from '../components/CourseRow';
import { SelectionBasketVi } from '../components/SelectionBasketVi';
import { PrerequisiteFlowchart } from '../components/PrerequisiteFlowchart';
import type { Course } from '../data/courseData';
import { useCourseData } from '../hooks/useCourseData';
import { useScheduleSolver } from '../hooks/useScheduleSolver';
import { Filter, Search } from 'lucide-react';
import { weekDays, timePeriods, type ClassSection } from '../data/timetableData';
import { NoDataCard } from '../components/ui/nodataCard';
import { STORAGE_KEYS } from '../config/storageKeys';

export function IntegratedStudyRoadmap() {
  const [activeTab, setActiveTab] = useState<'selection' | 'calendar'>('selection');
  const [viewMode, setViewMode] = useState<'recommend' | 'all'>('recommend');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_BASKET);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch { }
    return new Set();
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFlowchart, setShowFlowchart] = useState(false);
  const [flowchartCourse, setFlowchartCourse] = useState<Course | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_BASKET, JSON.stringify(Array.from(selectedCourses)));
  }, [selectedCourses]);

  // Lấy data từ localStorage qua Recommender
  const { recommended, all, isReady, hasData } = useCourseData();

  // Bộ xếp lịch di truyền
  const { solve, solving, options, activeOption, setActiveOption, currentSections, error: solverError } = useScheduleSolver();

  // Nguồn dữ liệu tuỳ thuộc vào chế độ xem
  const currentSource = viewMode === 'recommend' ? recommended : all;

  const allCurrentCourses = [...currentSource.core, ...currentSource.major, ...currentSource.electives];

  // Xử lý chọn môn học
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

  // Xử lý hiển thị sơ đồ
  const handleShowFlowchart = (course: Course) => {
    setFlowchartCourse(course);
    setShowFlowchart(true);
  };

  // Lọc môn học
  const filteredCourses = {
    // Môn bắt buộc
    core: currentSource.core.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    // Môn chuyên ngành
    major: currentSource.major.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    // Môn tự chọn
    electives: currentSource.electives.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  // Từ kết quả solver -> xác định conflict
  const confirmedSections: ClassSection[] = currentSections;


  // Kiểm tra xung đột thời gian
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

  // Tải dữ liệu
  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  // Không có dữ liệu
  if (!hasData) {
    return <div>
      <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>
      <p className="text-gray-600 mb-8">Đây là lộ trình học tập của bạn.</p>
      <NoDataCard />
    </div>;
  }

  // Giao diện chính
  return (
    <div className="flex h-full gap-6">
      {/* Nội dung chính */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>
          <p className="text-gray-600">Chọn môn học và xem lịch trực quan với phát hiện xung đột thời gian.</p>
        </div>

        {/* Thanh điều hướng */}
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

        {/* Tab 1: Chọn môn học */}
        {activeTab === 'selection' && (
          <div>
            {/* Tìm kiếm và lọc */}
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

            {/* Thông tin */}
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

            {/* Chuyển đổi chế độ xem */}
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

            {/* Môn học cơ sở ngành */}
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

            {/* Môn học chuyên ngành */}
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

            {/* Môn học tự chọn */}
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

        {/* Tab 2: Lịch trực quan */}
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
                {/* Điều khiển */}
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

                {/* Hiển thị lỗi */}
                {solverError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    ⚠️ {solverError}
                  </div>
                )}

                {/* Điều hướng phương án */}
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

                {/* Lịch học */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-auto shadow-sm">
                  <div className="min-w-[860px]">

                    {/* Hàng tiêu đề */}
                    <div
                      className="grid sticky top-0 z-10"
                      style={{ gridTemplateColumns: '76px repeat(6, 1fr)' }}
                    >
                      <div className="bg-[#004A98] rounded-tl-2xl h-12 flex items-end pb-1 justify-center">
                        <span className="text-[10px] text-white/60 font-medium">Tiết</span>
                      </div>
                      {weekDays.map((day, idx) => (
                        <div
                          key={day.day}
                          className={`bg-[#004A98] text-white flex flex-col items-center justify-center border-l border-white/10 h-12 ${idx === weekDays.length - 1 ? 'rounded-tr-2xl' : ''}`}
                        >
                          <span className="text-[10px] text-white/60 font-normal">{day.nameVi}</span>
                          <span className="text-sm font-bold">{day.short}</span>
                        </div>
                      ))}
                    </div>

                    {/* Lưới nền + lớp học */}
                    <div className="relative">
                      {timePeriods.map((period) => {
                        const isFirstAfternoon = period.period === 6;
                        return (
                          <div key={period.period}>
                            {/* Ngăn cách giờ trưa */}
                            {isFirstAfternoon && (
                              <div
                                className="grid items-center"
                                style={{ gridTemplateColumns: '76px 1fr', height: '22px' }}
                              >
                                <div className="bg-amber-50 border-b border-t border-amber-200 flex items-center justify-center">
                                  <span className="text-[8px] text-amber-600 font-semibold">Trưa</span>
                                </div>
                                <div className="bg-amber-50/60 border-b border-t border-amber-200 flex items-center px-3">
                                  <div className="flex-1 border-t border-dashed border-amber-300" />
                                  <span className="text-[9px] text-amber-500 px-2">Nghỉ trưa 11:50 – 12:40</span>
                                  <div className="flex-1 border-t border-dashed border-amber-300" />
                                </div>
                              </div>
                            )}

                            {/* Hàng tiết học */}
                            <div
                              className="grid"
                              style={{ gridTemplateColumns: '76px repeat(6, 1fr)', height: '60px' }}
                            >
                              {/* Nhãn tiết học */}
                              <div className={`flex flex-col items-center justify-center border-b border-r px-1 shrink-0 ${period.label === 'Sáng' ? 'bg-sky-50 border-gray-200' : 'bg-orange-50 border-gray-200'}`}>
                                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-0.5 ${period.label === 'Sáng' ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700'}`}>
                                  P{period.period}
                                </div>
                                <span className="text-[8px] text-gray-400 leading-none text-center">{period.time.split(' - ')[0]}</span>
                                <span className="text-[8px] text-gray-300 leading-none">↓</span>
                                <span className="text-[8px] text-gray-400 leading-none">{period.time.split(' - ')[1]}</span>
                              </div>
                              {weekDays.map((day) => (
                                <div
                                  key={`${day.day}-${period.period}`}
                                  className="border-b border-l border-gray-100 hover:bg-gray-50/50 transition-colors"
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Lớp học */}
                      {currentSections.map((classSection: ClassSection) => {
                        const conflicts = getConflicts(classSection);
                        const hasConflict = conflicts.length > 0;

                        const lunchBreakOffset = classSection.startPeriod >= 6 ? 22 : 0;
                        const topPx = (classSection.startPeriod - 1) * 60 + lunchBreakOffset;
                        const heightPeriods = classSection.endPeriod - classSection.startPeriod + 1;

                        const spansLunch = classSection.startPeriod < 6 && classSection.endPeriod >= 6;
                        const heightPx = heightPeriods * 60 + (spansLunch ? 22 : 0);
                        const dayColIndex = classSection.day - 2; // T2→0 … T7→5

                        const bgColor = hasConflict ? '#FEF2F2' : classSection.color;
                        const borderColor = hasConflict ? '#EF4444' : classSection.color;
                        const textColor = hasConflict ? '#991B1B' : '#ffffff';
                        const subTextColor = hasConflict ? '#B91C1C' : 'rgba(255,255,255,0.85)';

                        const startTime = timePeriods.find(p => p.period === classSection.startPeriod)?.time.split(' - ')[0] ?? '';
                        const endTime = timePeriods.find(p => p.period === classSection.endPeriod)?.time.split(' - ')[1] ?? '';

                        return (
                          <div
                            key={classSection.id}
                            style={{
                              position: 'absolute',
                              top: topPx + 2,
                              left: `calc(76px + ${dayColIndex} * ((100% - 76px) / 6) + 3px)`,
                              width: `calc((100% - 76px) / 6 - 6px)`,
                              height: heightPx - 4,
                              backgroundColor: bgColor,
                              border: `1.5px solid ${hasConflict ? '#FCA5A5' : 'rgba(255,255,255,0.25)'}`,
                              borderLeft: `3px solid ${borderColor}`,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              boxShadow: hasConflict
                                ? '0 2px 8px rgba(239,68,68,0.25)'
                                : '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                            className="flex flex-col px-2 py-1.5 cursor-default group"
                          >
                            {/* Badge trùng lịch */}
                            {hasConflict && (
                              <div className="flex items-center gap-1 mb-1 px-1 py-0.5 bg-red-100 rounded-sm">
                                <AlertTriangle className="w-2.5 h-2.5 text-red-600 shrink-0" />
                                <span className="text-[8.5px] font-bold text-red-700 uppercase tracking-wide">Trùng lịch</span>
                              </div>
                            )}

                            {/* Mã học phần */}
                            <p className="text-[11px] font-black leading-none truncate" style={{ color: textColor }}>
                              {classSection.courseCode}
                            </p>

                            {/* Tên học phần */}
                            {heightPx >= 80 && (
                              <p className="text-[9px] leading-tight mt-0.5 line-clamp-2" style={{ color: subTextColor }}>
                                {classSection.courseNameVi}
                              </p>
                            )}

                            {/* Khoảng trống */}
                            <div className="flex-1" />

                            {/* Thông tin */}
                            <div className="flex flex-col gap-0.5 mt-1">
                              {/* Nhóm + Phòng */}
                              <div className="flex items-center gap-1">
                                <span
                                  className="text-[8px] font-bold px-1 py-0.5 rounded"
                                  style={{
                                    backgroundColor: hasConflict ? '#FEE2E2' : 'rgba(0,0,0,0.2)',
                                    color: hasConflict ? '#991B1B' : 'rgba(255,255,255,0.95)',
                                  }}
                                >
                                  {classSection.sectionNumber}
                                </span>
                                {classSection.room !== '---' && heightPx >= 70 && (
                                  <span className="text-[8px] truncate" style={{ color: subTextColor }}>
                                    📍 {classSection.room}
                                  </span>
                                )}
                              </div>

                              {/* Khung giờ */}
                              {heightPx >= 90 && startTime && (
                                <p className="text-[8px] font-medium" style={{ color: subTextColor }}>
                                  {startTime} – {endTime}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Chú thích */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
                    <span>Lớp đã xếp</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-red-200 border border-red-400" />
                    <span>Trùng lịch</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-sky-100 border border-sky-300" />
                    <span>Buổi sáng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-300" />
                    <span>Buổi chiều</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Giỏ hàng */}
      <SelectionBasketVi
        selectedCourses={Array.from(selectedCourses)
          .map(id => allCurrentCourses.find(c => c.id === id)!)
          .filter(Boolean)}
        onRemoveCourse={handleCourseToggle}
      />

      {/* Modal Sơ đồ Tiên quyết */}
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