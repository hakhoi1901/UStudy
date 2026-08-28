import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Book, ClipboardList, ShoppingCart } from 'lucide-react';
import { useCourseData } from '../../hooks/useCourseData';
import { useRegisteredCourses } from '../../hooks/useRegisteredCourses';
import { type ClassSection } from '../../types';
import { NoDataCard } from '../../components/feedback';
import { PageHeader } from '../../components/layout/page-header';
import { PageShell } from '../../components/layout/page-shell';
import { PageLoadingState } from '../../components/ui/display';
import { MobileBottomSheet } from '../../components/ui/overlays/mobile-bottom-sheet';
import { STORAGE_KEYS } from '../../config';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { getConflicts } from '../../logic/ScheduleValidator';
import { NavigationBar } from './components/NavigationBar';
import { TrainingProgramView } from './components/TrainingProgramView';
import { SelectionView } from './components/SelectionView';
import { CalendarView } from './components/CalenderView';
import { StudyPlanView } from './components/StudyPlanView';
import { SelectionBasket } from './components/SelectionBasket';
import { PrerequisiteFlowchart } from './components/PrerequisiteFlowchart';
import { useScheduleSolver } from './hooks/use-schedule-solver';
import { GroupSchedulePage } from '../group-schedule';
import type { Course } from '../../types';
import { STUDY_ROADMAP_TAB_TO_PATH, getStudyRoadmapTabFromPath } from '../../app/routes';
import { tabs, type Tab } from './types';

// Danh sách các tab
const isStudyRoadmapTab = (value: unknown): value is Tab =>
    value === tabs.trainingProgram || value === tabs.studyPlan || value === tabs.selection || value === tabs.calendar;

export function StudyRoadmapFeature() {
    const location = useLocation();
    const navigate = useNavigate();
    const tabFromPath = getStudyRoadmapTabFromPath(location.pathname);
    const savedTab = readFromStorage<unknown>(STORAGE_KEYS.STUDY_ROADMAP_ACTIVE_TAB, tabs.selection);
    const activeTab = tabFromPath ||
        (location.hash.startsWith('#v1_') ? tabs.calendar : isStudyRoadmapTab(savedTab) ? savedTab : tabs.selection);
    const setActiveTab = (tab: Tab) => {
        navigate(STUDY_ROADMAP_TAB_TO_PATH[tab]);
    };
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
        saveToStorage(STORAGE_KEYS.STUDY_ROADMAP_ACTIVE_TAB, activeTab);
    }, [activeTab]);

    useEffect(() => {
        setSearchTerm('');
    }, [activeTab]);

    // Đóng basket drawer khi chuyển tab
    useEffect(() => {
        setShowMobileBasket(false);
    }, [activeTab]);

    useEffect(() => {
        if (!tabFromPath) {
            navigate(STUDY_ROADMAP_TAB_TO_PATH[activeTab], { replace: true });
        }
    }, [tabFromPath, activeTab, navigate]);

    const { recommended, all, isReady, hasData } = useCourseData();
    const { registeredCourses, registeredSections, registeredMask, registeredCourseCodes } = useRegisteredCourses();
    const { solve: solveRaw, solving, options, setOptions, activeOption, setActiveOption, currentSections, error: solverError } = useScheduleSolver();

    // Wrap solve() to automatically include registeredMask
    const solve = (courses: import('../../types').Course[], allowedClassesMap: Record<string, string[]>, prefs?: import('./hooks/use-schedule-solver').SolverPreferences) => {
        solveRaw(courses, allowedClassesMap, prefs, registeredMask);
    };

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
    const handleGetConflicts = (section: ClassSection) => getConflicts(section, [...registeredSections, ...confirmedSections]);
    
    // Mobile basket reuses the shared sheet so scrolling, focus and safe-area behavior stay consistent.
    const MobileBasketDrawer = (
        <>
            {showMobileBasket && (
                <MobileBottomSheet
                    title="Giỏ môn học"
                    eyebrow={`${selectedCourses.size} môn đã chọn`}
                    ariaLabel="Giỏ môn học đã chọn"
                    className="lg:hidden"
                    contentClassName="bg-white"
                    onClose={() => setShowMobileBasket(false)}
                    sheetId="study-roadmap-basket"
                >
                    <SelectionBasket
                        bare
                        selectedCourses={Array.from(selectedCourses)
                            .map(id => globalAllCourses.find(c => c.id === id)!)
                            .filter(Boolean)}
                        registeredCourseCodes={registeredCourseCodes}
                        courseCatalog={globalAllCourses}
                        onRemoveCourse={handleCourseToggle}
                        allowedClassesMap={allowedClassesMap}
                        setAllowedClassesMap={setAllowedClassesMap}
                    />
                </MobileBottomSheet>
            )}

            {activeTab === 'selection' && !showMobileBasket && (
                <button
                    type="button"
                    className="ustudy-focus-ring fixed right-4 z-35 flex items-center gap-2 rounded-full bg-[var(--ustudy-brand)] px-5 py-3 text-white shadow-[0_4px_20px_rgba(0,74,152,0.35)] transition-transform active:scale-95 lg:hidden"
                    style={{ bottom: 'calc(var(--ustudy-mobile-nav-height) + env(safe-area-inset-bottom) + 1rem)' }}
                    onClick={() => setShowMobileBasket(true)}
                    aria-haspopup="dialog"
                    aria-controls="study-roadmap-basket"
                >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-sm font-semibold">Giỏ môn học</span>
                    {selectedCourses.size > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-[var(--ustudy-brand)]">
                            {selectedCourses.size}
                        </span>
                    )}
                </button>
            )}
        </>
    );

    if (!isReady) {
        return (
            <PageShell
                header={<PageHeader title="Lộ trình học tập" description="Chọn môn học và xây dựng kế hoạch theo từng học kỳ." />}
            >
                <PageLoadingState label="Đang tải lộ trình học tập" />
            </PageShell>
        );
    }

    if (!hasData) {
        return (
            <PageShell
                header={<PageHeader
                    title="Lộ trình học tập"
                    description="Đây là lộ trình học tập của bạn."
                />}
            >
                <NoDataCard />
            </PageShell>
        );
    }

    return (
        <>
            <PageShell
                header={<PageHeader
                    title="Lộ trình học tập"
                    description="Chọn môn học và xem lịch trực quan với phát hiện xung đột thời gian."
                />}
            >
                {/* Nội dung chính */}
                <div className="flex-1 w-full min-w-0">
                    {/* Navigation */}
                    <div className="hidden md:block">
                        <NavigationBar
                            tabs={[
                                // { id: tabs.trainingProgram, label: 'Chương trình đào tạo', icon: Book },
                                { id: tabs.studyPlan, label: 'Kế hoạch học tập', description: 'Tiến độ và lộ trình theo học kỳ', icon: Book },
                                { id: 'selection', label: 'Chọn môn & Học phí', description: 'Chọn học phần và xem chi phí dự kiến', icon: ShoppingCart },
                                { id: 'calendar', label: 'Xếp lịch dự kiến', description: 'Tạo và so sánh phương án trước khi đăng ký', icon: Calendar, showBadge: true, badgeCount: selectedCourses.size },
                            ]}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <NavigationBar
                            tabs={[
                                // { id: tabs.trainingProgram, label: 'Lộ trình', icon: Book },
                                { id: tabs.studyPlan, label: 'Kế hoạch', description: 'Tiến độ theo học kỳ', icon: ClipboardList },
                                { id: 'selection', label: 'Chọn môn', description: 'Học phần và học phí', icon: ShoppingCart },
                                { id: 'calendar', label: 'Xếp lịch', description: 'Lịch dự kiến', icon: Calendar, showBadge: true, badgeCount: selectedCourses.size },
                            ]}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>

                    <div className="pt-5">
                        {/* Tab 1: Chương trình đào tạo */}
                        {activeTab === 'trainingProgram' && (
                            <TrainingProgramView />
                        )}

                        {/* Tab Kế hoạch học tập: kéo môn vào học kỳ */}
                        {activeTab === 'studyPlan' && (
                            <StudyPlanView />
                        )}

                        {/* Tab 2: Chọn môn học */}
                        {activeTab === 'selection' && (
                            // Desktop: 2 cột. Mobile: 1 cột (giỏ hàng ẩn vào drawer)
                            <div className="grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">

                                {/* CỘT TRÁI: danh sách môn học */}
                                <div
                                    className="min-w-0 w-full"
                                >
                                    {/* Desktop: fixed height để scroll độc lập */}
                                    <div className="hidden lg:block">
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
                                            registeredCourseCodes={registeredCourseCodes}
                                        />
                                    </div>
                                    {/* Mobile: không fixed height */}
                                    <div className="pb-36 lg:hidden">
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
                                            registeredCourseCodes={registeredCourseCodes}
                                        />
                                    </div>
                                </div>

                                {/* CỘT PHẢI: giỏ hàng - chỉ hiện trên desktop */}
                                <div
                                    className="sticky top-4 hidden min-w-0 lg:block"
                                >
                                    <SelectionBasket
                                        selectedCourses={Array.from(selectedCourses)
                                            .map(id => globalAllCourses.find(c => c.id === id)!)
                                            .filter(Boolean)}
                                        registeredCourseCodes={registeredCourseCodes}
                                        courseCatalog={globalAllCourses}
                                        onRemoveCourse={handleCourseToggle}
                                        allowedClassesMap={allowedClassesMap}
                                        setAllowedClassesMap={setAllowedClassesMap}
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
                                registeredCourses={registeredCourses}
                                registeredSections={registeredSections}
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
                                groupScheduleContent={(
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
                            />
                        )}
                    </div>
                </div>

                {showFlowchart && flowchartCourse && (
                    <PrerequisiteFlowchart
                        course={flowchartCourse}
                        allCourses={globalAllCourses as Course[]}
                        onClose={() => setShowFlowchart(false)}
                    />
                )}
            </PageShell>

            {/* Mobile Basket Drawer + FAB */}
            {MobileBasketDrawer}
        </>
    );
}
