import { useState } from 'react';
import { CourseRow } from './CourseRow';
import { SelectionBasketVi } from './SelectionBasketVi';
import { PrerequisiteFlowchart } from './PrerequisiteFlowchart';
import { type Course } from '../data/courseData';
import { useCourseData } from '../hooks/useCourseData';
import { Filter, Search, Database } from 'lucide-react';

export function CourseRecommendations() {
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFlowchart, setShowFlowchart] = useState(false);
  const [flowchartCourse, setFlowchartCourse] = useState<Course | null>(null);

  // Lấy data động từ localStorage qua Recommender
  const { core, major, electives, isReady, hasData } = useCourseData();

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
    core: core.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    major: major.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    electives: electives.filter(c =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có dữ liệu</h2>
          <p className="text-gray-600 mb-6">
            Kéo Bookmarklet Tool Cào Dữ Liệu vào Bookmark bar của bạn, và làm theo hướng dẫn tại tab Hướng dẫn cấu hình.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>
          <p className="text-gray-600">Chọn môn học cho học kỳ tiếp theo dựa trên môn tiên quyết và tiến độ học tập.</p>
        </div>

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
            <span className="text-gray-700">Lọc</span>
          </button>
        </div>

        {/* Core IT Subjects */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-gray-900">Môn học cơ sở ngành</h3>
            <span className="px-2.5 py-0.5 bg-[#004A98] text-white text-xs rounded-full">
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-gray-900">Môn học chuyên ngành</h3>
            <span className="px-2.5 py-0.5 bg-[#004A98] text-white text-xs rounded-full">
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-gray-900">Môn học tự chọn</h3>
            <span className="px-2.5 py-0.5 bg-[#004A98] text-white text-xs rounded-full">
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

      {/* Selection Basket Sidebar */}
      <SelectionBasketVi
        selectedCourses={Array.from(selectedCourses).map(id =>
          [...core, ...major, ...electives].find(c => c.id === id)!
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