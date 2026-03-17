import { useState, useEffect } from 'react';
import { Calendar, Book, ShoppingCart } from 'lucide-react';
import { SelectionBasket } from '../../components/SelectionBasket';
import { PrerequisiteFlowchart } from '../../components/PrerequisiteFlowchart';
import { useCourseData } from '../../hooks/useCourseData';
import { useScheduleSolver } from '../../hooks/useScheduleSolver';
import { type ClassSection } from '../../types';
import { NoDataCard } from '../../components/nodataCard';
import { STORAGE_KEYS } from '../../config';
import { readFromStorage } from '../../helpers/localStorage/save';
import { getConflicts } from '../../logic/ScheduleValidator';
import { NavigationBar } from './NavigationBar';
import { TrainingProgramView } from './TrainingProgramView';
import { SelectionView } from './SelectionView';
import { CalendarView } from './CalenderView';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import type { Course } from '../../types';


// Danh sách các tab
export const tabs = {
    trainingProgram: 'trainingProgram',
    //   prerequisiteTree: 'prerequisiteTree',
    selection: 'selection',
    calendar: 'calendar',
} as const;

export type Tab = keyof typeof tabs;


export function IntegratedStudyRoadmap() {
    const [activeTab, setActiveTab] = useState<Tab>('selection');
    const [viewMode, setViewMode] = useState<'recommend' | 'all'>('all');
    const [selectedCourses, setSelectedCourses] = useState<Set<string>>(() => {
        const saved = readFromStorage<string[]>(STORAGE_KEYS.SELECTED_BASKET, []);
        return Array.isArray(saved) ? new Set(saved) : new Set();
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFlowchart, setShowFlowchart] = useState(false);
    const [flowchartCourse, setFlowchartCourse] = useState<Course | null>(null);
    const [allowedClassesMap, setAllowedClassesMap] = useState<Record<string, string[]>>({});

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

    const globalAllCourses = [...all.core, ...all.major, ...all.electives];

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

    // Từ kết quả solver -> xác định conflict (sử dụng Domain Service)
    const confirmedSections: ClassSection[] = currentSections;
    const handleGetConflicts = (section: ClassSection) => getConflicts(section, confirmedSections);

    // Tải dữ liệu
    if (!isReady) {
        return (
            <div className="flex-1">
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
        <div className="flex gap-6 min-h-screen pb-10" style={{ isolation: 'isolate' }}>
            {/* Nội dung chính */}
            <div className="flex-1 w-full">
                <div className="mb-6">
                    <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>

                    <p className="text-gray-600">Chọn môn học và xem lịch trực quan với phát hiện xung đột thời gian.</p>
                </div>

                {/* Thanh điều hướng */}
                <NavigationBar
                    tabs={[
                        { id: tabs.trainingProgram, label: 'Chương trình đào tạo', icon: Book },
                        //   { id: tabs.prerequisiteTree, label: 'Sơ đồ tiên quyết', icon: GitBranch },
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

                {/* Tab 2: Sơ đồ tiên quyết
                {activeTab === 'prerequisiteTree' && (
                <PrerequisiteTreeView />
                )} */}

                {/* Tab 2: Chọn môn học */}
                {activeTab === 'selection' && (
                    <div className="flex flex-row flex-nowrap gap-6 items-start w-full">

                        {/* CỘT TRÁI: tự scroll độc lập */}
                        <div className="flex-1 min-w-0 overflow-y-auto" style={{ height: 'calc(100vh - 11rem)' }}>
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
                        </div>

                        {/* CỘT PHẢI: cùng chiều cao cột trái, nằm im */}
                        <div
                            className="w-[26vw] xl:w-[24vw] 2xl:w-[22vw] flex-shrink-0"
                            style={{ height: 'calc(100vh - 11rem)' }}
                        >
                            <SelectionBasket
                                selectedCourses={Array.from(selectedCourses)
                                    .map(id => globalAllCourses.find(c => c.id === id)!)
                                    .filter(Boolean)}
                                setActiveTab={setActiveTab}
                                onRemoveCourse={handleCourseToggle}
                                allowedClassesMap={allowedClassesMap}
                                setAllowedClassesMap={setAllowedClassesMap}
                                solve={solve}
                            />
                        </div>
                    </div>
                )}

                {/* Tab 3: Lịch trực quan */}
                {activeTab === 'calendar' && (
                    <CalendarView
                        selectedCourses={selectedCourses}
                        setActiveTab={setActiveTab}
                        currentSections={currentSections}
                        activeOption={activeOption}
                        options={options}
                        allCurrentCourses={globalAllCourses as Course[]}
                        solve={solve}
                        solving={solving}
                        solverError={solverError}
                        setActiveOption={setActiveOption}
                        getConflicts={handleGetConflicts}
                        allowedClassesMap={allowedClassesMap}
                    />
                )}
            </div>

            {showFlowchart && flowchartCourse && (
                <PrerequisiteFlowchart
                    course={flowchartCourse}
                    allCourses={globalAllCourses as Course[]}
                    onClose={() => setShowFlowchart(false)}
                />
            )}
            {/* Footer */}
            <PrivacyFooter />
        </div>
    );
}