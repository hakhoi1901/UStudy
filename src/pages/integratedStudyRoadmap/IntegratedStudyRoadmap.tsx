import { useState, useEffect } from 'react';
import { Calendar, Book, ShoppingCart, X, Users } from 'lucide-react';
import { SelectionBasket } from '../../components/SelectionBasket';
import { PrerequisiteFlowchart } from '../../components/PrerequisiteFlowchart';
import { useCourseData } from '../../hooks/useCourseData';
import { useScheduleSolver } from '../../hooks/useScheduleSolver';
import { type ClassSection } from '../../types';
import { NoDataCard } from '../../components/nodataCard';
import { STORAGE_KEYS } from '../../config';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { getConflicts } from '../../logic/ScheduleValidator';
import { NavigationBar } from './NavigationBar';
import { TrainingProgramView } from './TrainingProgramView';
import { SelectionView } from './SelectionView';
import { CalendarView } from './CalenderView';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { GroupSchedulePage } from '../GroupSchedulePage';
import type { Course } from '../../types';
import { createPortal } from 'react-dom';

// Danh sách các tab
export const tabs = {
    trainingProgram: 'trainingProgram',
    selection: 'selection',
    groupSchedule: 'groupSchedule',
    calendar: 'calendar',
} as const;

export type Tab = keyof typeof tabs;


export function IntegratedStudyRoadmap() {
    const [activeTab, setActiveTab] = useState<Tab>(() => {
        if (typeof window !== 'undefined' && (window.location.pathname === '/group' || window.location.hash.startsWith('#v1_'))) {
            return 'groupSchedule';
        }
        return 'selection';
    });
    const [viewMode, setViewMode] = useState<'recommend' | 'all'>('all');
    const [selectedCourses, setSelectedCourses] = useState<Set<string>>(() => {
        const saved = readFromStorage<string[]>(STORAGE_KEYS.SELECTED_BASKET, []);
        return Array.isArray(saved) ? new Set(saved) : new Set();
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFlowchart, setShowFlowchart] = useState(false);
    const [flowchartCourse, setFlowchartCourse] = useState<Course | null>(null);
    const [allowedClassesMap, setAllowedClassesMap] = useState<Record<string, string[]>>(() => {
        return readFromStorage<Record<string, string[]>>(STORAGE_KEYS.ALLOWED_CLASSES_MAP, {});
    });

    // State giỏ hàng mobile: true = mở drawer giỏ hàng
    const [showMobileBasket, setShowMobileBasket] = useState(false);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.ALLOWED_CLASSES_MAP, allowedClassesMap);
    }, [allowedClassesMap]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SELECTED_BASKET, Array.from(selectedCourses));
    }, [selectedCourses]);

    useEffect(() => {
        setSearchTerm('');
    }, [activeTab]);

    // Đóng basket drawer khi chuyển tab
    useEffect(() => {
        setShowMobileBasket(false);
    }, [activeTab]);

    const { recommended, all, isReady, hasData } = useCourseData();
    const { solve, solving, options, setOptions, activeOption, setActiveOption, currentSections, error: solverError } = useScheduleSolver();

    const currentSource = viewMode === 'recommend' ? recommended : all;
    const globalAllCourses = [...all.core, ...all.major, ...all.electives];

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
            c.id.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        major: currentSource.major.filter(c =>
            c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        electives: currentSource.electives.filter(c =>
            c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    };

    const confirmedSections: ClassSection[] = currentSections;
    const handleGetConflicts = (section: ClassSection) => getConflicts(section, confirmedSections);

    if (!isReady) {
        return (
            <div className="flex-1">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A98]"></div>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div>
                <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>
                <p className="text-gray-600 mb-8">Đây là lộ trình học tập của bạn.</p>
                <NoDataCard />
            </div>
        );
    }

    // ---- Mobile Basket Drawer (portal vào body) ----
    const MobileBasketDrawer = createPortal(
        <>
            {/* Backdrop */}
            {showMobileBasket && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50"
                    style={{ backdropFilter: 'blur(2px)' }}
                    onClick={() => setShowMobileBasket(false)}
                />
            )}

            {/* Drawer */}
            <div
                className="md:hidden fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl"
                style={{
                    // Để trên bottom nav (64px)
                    bottom: '64px',
                    maxHeight: '80vh',
                    transform: showMobileBasket ? 'translateY(0)' : 'translateY(110%)',
                    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Handle + Header */}
                <div className="flex-shrink-0">
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-[#004A98]" />
                            <span className="font-semibold text-gray-900">Giỏ môn học</span>
                            {selectedCourses.size > 0 && (
                                <span className="px-2 py-0.5 bg-[#004A98] text-white text-xs rounded-full font-medium">
                                    {selectedCourses.size}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowMobileBasket(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content: SelectionBasket scroll bên trong */}
                <div className="flex-1 overflow-y-auto p-4">
                    <SelectionBasket
                        selectedCourses={Array.from(selectedCourses)
                            .map(id => globalAllCourses.find(c => c.id === id)!)
                            .filter(Boolean)}
                        setActiveTab={(tab) => {
                            setActiveTab(tab);
                            setShowMobileBasket(false);
                        }}
                        onRemoveCourse={handleCourseToggle}
                        allowedClassesMap={allowedClassesMap}
                        setAllowedClassesMap={setAllowedClassesMap}
                        solve={solve}
                    />
                </div>
            </div>

            {/* FAB button - chỉ hiện khi đang ở tab selection và chưa mở drawer */}
            {activeTab === 'selection' && !showMobileBasket && (
                <button
                    className="md:hidden fixed z-35 bg-[#004A98] text-white rounded-full shadow-lg active:scale-95 transition-all flex items-center gap-2"
                    style={{
                        bottom: '80px', // trên bottom nav
                        right: '16px',
                        padding: '12px 20px',
                        boxShadow: '0 4px 20px rgba(0,74,152,0.4)',
                    }}
                    onClick={() => setShowMobileBasket(true)}
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-semibold text-sm">Giỏ hàng</span>
                    {selectedCourses.size > 0 && (
                        <span
                            className="bg-white text-[#004A98] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        >
                            {selectedCourses.size}
                        </span>
                    )}
                </button>
            )}
        </>,
        document.body
    );

    return (
        <>
            <div className="flex gap-6 min-h-screen" style={{ isolation: 'isolate' }}>
                {/* Nội dung chính */}
                <div className="flex-1 w-full min-w-0">
                    <div className="mb-6">
                        <h1 className="text-gray-900 mb-2">Lộ trình học tập</h1>
                        <p className="text-gray-600">Chọn môn học và xem lịch trực quan với phát hiện xung đột thời gian.</p>
                    </div>

                    {/* Navigation */}
                    <div className="hidden md:block">
                        <NavigationBar
                            tabs={[
                                { id: tabs.trainingProgram, label: 'Chương trình đào tạo', icon: Book },
                                { id: 'selection', label: 'Chọn môn & Học phí', icon: ShoppingCart },
                                { id: tabs.groupSchedule, label: 'Xếp lịch nhóm', icon: Users, showBadge: true, badgeCount: selectedCourses.size },
                                { id: 'calendar', label: 'Lịch dự kiến', icon: Calendar, showBadge: true, badgeCount: selectedCourses.size },
                            ]}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <NavigationBar
                            tabs={[
                                { id: tabs.trainingProgram, label: 'Lộ trình', icon: Book },
                                { id: 'selection', label: 'Chọn môn', icon: ShoppingCart },
                                { id: tabs.groupSchedule, label: 'Nhóm', icon: Users, showBadge: true, badgeCount: selectedCourses.size },
                                { id: 'calendar', label: 'Lịch', icon: Calendar, showBadge: true, badgeCount: selectedCourses.size },
                            ]}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>

                    {/* Tab 1: Chương trình đào tạo */}
                    {activeTab === 'trainingProgram' && (
                        <TrainingProgramView />
                    )}

                    {/* Tab 2: Chọn môn học */}
                    {activeTab === 'selection' && (
                        // Desktop: 2 cột. Mobile: 1 cột (giỏ hàng ẩn vào drawer)
                        <div className="flex flex-col md:flex-row md:flex-nowrap gap-6 items-start w-full">

                            {/* CỘT TRÁI: danh sách môn học */}
                            <div
                                className="flex-1 min-w-0 w-full overflow-y-auto"
                                // Desktop: scroll độc lập; Mobile: tự nhiên
                                style={{ height: undefined }}
                            >
                                {/* Desktop: fixed height để scroll độc lập */}
                                <div className="hidden md:block overflow-y-auto" style={{ height: 'calc(100vh - 11rem)' }}>
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
                                {/* Mobile: không fixed height */}
                                <div className="md:hidden pb-36">
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
                            </div>

                            {/* CỘT PHẢI: giỏ hàng - chỉ hiện trên desktop */}
                            <div
                                className="hidden md:block w-[26vw] xl:w-[24vw] 2xl:w-[22vw] flex-shrink-0"
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
                            setSelectedCourses={setSelectedCourses}
                            setAllowedClassesMap={setAllowedClassesMap}
                            setOptions={setOptions}
                        />
                    )}

                    {activeTab === 'groupSchedule' && (
                        <GroupSchedulePage
                            embedded
                            selectedCourseIds={selectedCourses}
                            allCourses={globalAllCourses as Course[]}
                            allowedClassesMap={allowedClassesMap}
                            setAllowedClassesMap={setAllowedClassesMap}
                            onRemoveSelectedCourse={handleCourseToggle}
                            onPageChange={() => undefined}
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
            </div>

            {/* Mobile Basket Drawer + FAB */}
            {MobileBasketDrawer}
        </>
    );
}
