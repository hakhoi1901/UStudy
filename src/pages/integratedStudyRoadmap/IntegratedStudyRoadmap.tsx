/* intergratedStudyRoadmap.tsx
** Trang Lộ trình học tập tích hợp
*/

import { useState, useEffect } from 'react';
import { Calendar, Book, ShoppingCart } from 'lucide-react';

import { SelectionBasketVi } from '../../components/SelectionBasketVi';
import { PrerequisiteFlowchart } from '../../components/PrerequisiteFlowchart';
import type { Course } from '../../types';
import { useCourseData } from '../../hooks/useCourseData';
import { useScheduleSolver } from '../../hooks/useScheduleSolver';
import { type ClassSection } from '../../types';
import { NoDataCard } from '../../components/ui/nodataCard';
import { STORAGE_KEYS } from '../../config';
import { NavigationBar } from './NavigationBar';
import { TrainingProgramView } from './TrainingProgramView';
import { SelectionView } from './SelectionView';
import { CalendarView } from './CalenderView';

export const tabs = {
  trainingProgram: 'trainingProgram',
  selection: 'selection',
  calendar: 'calendar',
} as const;

export type Tab = keyof typeof tabs;

export function IntegratedStudyRoadmap() {
  const [activeTab, setActiveTab] = useState<Tab>('trainingProgram');
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

  // Lưu selected courses vào localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_BASKET, JSON.stringify(Array.from(selectedCourses)));
  }, [selectedCourses]);

  // Reset search term khi chuyển tab
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

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
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    // Môn chuyên ngành
    major: currentSource.major.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    // Môn tự chọn
    electives: currentSource.electives.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
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
        <NavigationBar
          tabs={[
            { id: tabs.trainingProgram, label: 'Chương trình đào tạo', icon: Book },
            { id: 'selection', label: 'Chọn môn & Học phí', icon: ShoppingCart },
            { id: 'calendar', label: 'Lịch dự kiến', icon: Calendar, showBadge: true, badgeCount: selectedCourses.size },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Tab 1: */}
        {activeTab === 'trainingProgram' && (
          <TrainingProgramView />
        )}

        {/* Tab 2: Chọn môn học */}
        {activeTab === 'selection' && (
          <SelectionView
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            recommended={recommended}
            all={all}
            filteredCourses={filteredCourses}
            selectedCourses={selectedCourses}
            handleCourseToggle={handleCourseToggle}
            handleShowFlowchart={handleShowFlowchart}
          />
        )}

        {/* Tab 3: Lịch trực quan */}
        {activeTab === 'calendar' && (
          <CalendarView
            selectedCourses={selectedCourses}
            setActiveTab={setActiveTab}
            currentSections={currentSections}
            activeOption={activeOption}
            options={options}
            allCurrentCourses={allCurrentCourses as Course[]}
            solve={solve}
            solving={solving}
            solverError={solverError}
            setActiveOption={setActiveOption}
            getConflicts={getConflicts}
          />
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