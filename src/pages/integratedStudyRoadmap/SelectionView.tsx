import { Filter, Search, Info } from 'lucide-react';
import { CourseRow } from '../../components/CourseRow';
import type { Course } from '../../types';

interface SelectionViewProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    viewMode: 'recommend' | 'all';
    setViewMode: (mode: 'recommend' | 'all') => void;
    recommended: { core: Course[]; major: Course[]; electives: Course[] };
    all: { core: Course[]; major: Course[]; electives: Course[] };
    filteredCourses: { core: Course[]; major: Course[]; electives: Course[] };
    selectedCourses: Set<string>;
    handleCourseToggle: (courseId: string) => void;
    handleShowFlowchart: (course: Course) => void;
}

export function SelectionView({
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    recommended,
    all,
    filteredCourses,
    selectedCourses,
    handleCourseToggle,
    handleShowFlowchart,
}: SelectionViewProps) {
    return (
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
                    <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${viewMode === 'recommend' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                            }`}
                    >
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
                    <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${viewMode === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                            }`}
                    >
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
    );
}
