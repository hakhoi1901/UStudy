import { Filter, Search, Info, DatabaseBackup } from 'lucide-react';
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
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm tên môn hoặc mã môn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                    />
                </div>
                {/* Nút lọc: ẩn label trên mobile */}
                <button className="flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="hidden md:inline text-gray-700 text-sm">Lọc</span>
                </button>
            </div>

            {/* Thông tin - gọn hơn trên mobile */}
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 md:gap-3">
                <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-xs md:text-sm text-blue-900 font-medium">
                        Chọn các môn học bạn muốn đăng ký
                    </p>
                    {/* Mô tả chi tiết: ẩn trên mobile */}
                    <p className="hidden md:block text-xs text-blue-700 mt-1">
                        Môn màu xanh lá: Đủ điều kiện đăng ký • Môn màu đỏ: Cần học lại • Môn màu xám: Chưa học môn tiên quyết
                    </p>
                    {/* Mô tả rút gọn trên mobile */}
                    <p className="md:hidden text-[10px] text-blue-700 mt-0.5">
                        Xanh lá: Đủ điều kiện • Đỏ: Học lại • Xám: Thiếu tiên quyết
                    </p>
                </div>
            </div>

            {/* Chuyển đổi chế độ xem */}
            <div className="mb-4 md:mb-6 flex items-center p-1 bg-gray-100 rounded-lg">
                <button
                    onClick={() => setViewMode('all')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 md:py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all ${viewMode === 'all'
                        ? 'bg-white text-[#004A98] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <span>Tất cả lớp mở</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${viewMode === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                        {all.core.length + all.major.length + all.electives.length}
                    </span>
                </button>
                <button
                    onClick={() => setViewMode('recommend')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 md:py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all ${viewMode === 'recommend'
                        ? 'bg-white text-[#004A98] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <span>Gợi ý</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${viewMode === 'recommend' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                        {recommended.core.length + recommended.major.length + recommended.electives.length}
                    </span>
                </button>
            </div>

            {/* Empty state */}
            {filteredCourses.core.length + filteredCourses.electives.length + filteredCourses.major.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-4">
                    <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4 bg-white border border-blue-100 rounded-2xl shadow-sm text-center">
                        <div className="w-14 h-14 md:w-20 md:h-20 p-3 md:p-5 bg-blue-50 rounded-full flex items-center justify-center mb-4 md:mb-5 border border-blue-100 shadow-sm">
                            <DatabaseBackup className="w-7 h-7 md:w-10 md:h-10 text-blue-500" />
                        </div>
                        <h2 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Đang cập nhật dữ liệu</h2>
                        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                            Chương trình đào tạo cho chuyên ngành và khóa học này hiện đang trong quá trình thu thập và cập nhật.
                        </p>
                    </div>
                </div>
            )}

            {/* Section helper */}
            {(['core', 'major', 'electives'] as const).map((key) => {
                const labels = { core: 'Môn học cơ sở ngành', major: 'Môn học chuyên ngành', electives: 'Môn học tự chọn' };
                const courses = filteredCourses[key];
                if (courses.length === 0) return null;
                return (
                    <div key={key} className="mb-4 md:mb-6">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <h3 className="text-sm md:text-base text-gray-900 font-semibold">{labels[key]}</h3>
                            <span className="px-2 py-0.5 bg-[#004A98] text-white text-[10px] md:text-xs rounded-full font-medium">
                                {courses.length} môn
                            </span>
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            {courses.map((course) => (
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
                );
            })}
        </div>
    );
}