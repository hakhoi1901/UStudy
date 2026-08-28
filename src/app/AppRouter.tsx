import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PrivacySecurity } from '../features/settings/components/PrivacySecurity';
import { SettingUserProfile } from '../features/settings/components/SettingUserProfile';
import { MainLayout } from '../layouts/MainLayout';
import { STORAGE_KEYS } from '../config/storageKeys';
import { useDepartmentData } from '../context/DepartmentContext';
import { APP_ROUTES, getPageIdFromPath, getPathForPage } from './routes';
import { APP_CONFIG } from '../config/appConfig';
import { PageLoadingState } from '../components/ui/display';
import {
    loadCampusInformationPage,
    loadChatbotPage,
    loadExamSchedulePage,
    loadGradesPage,
    loadSchedulePage,
    loadSettingsPage,
    loadStudyRoadmapPage,
    loadTuitionPage,
    prefetchPage,
} from './route-loaders';

const StudyRoadmapPage = lazy(() => loadStudyRoadmapPage().then(({ StudyRoadmapPage: Page }) => ({ default: Page })));
const GradesPage = lazy(() => loadGradesPage().then(({ GradesPage: Page }) => ({ default: Page })));
const TuitionPage = lazy(() => loadTuitionPage().then(({ TuitionPage: Page }) => ({ default: Page })));
const SchedulePage = lazy(() => loadSchedulePage().then(({ SchedulePage: Page }) => ({ default: Page })));
const SettingsPage = lazy(() => loadSettingsPage().then(({ SettingsPage: Page }) => ({ default: Page })));
const ExamSchedulePage = lazy(() => loadExamSchedulePage().then(({ ExamSchedulePage: Page }) => ({ default: Page })));
const ChatbotPage = lazy(() => loadChatbotPage().then(({ ChatbotPage: Page }) => ({ default: Page })));
const CampusInformationPage = lazy(() => loadCampusInformationPage().then(({ CampusInformationPage: Page }) => ({ default: Page })));

const isWorkspaceEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_WORKSPACE === 'true';
const WorkspacePage = isWorkspaceEnabled
    ? lazy(() => import('../pages/workspace/WorkspacePage').then(({ WorkspacePage: Page }) => ({ default: Page })))
    : null;

function RouteLoading() {
    return <PageLoadingState label="Đang mở trang" />;
}

function withRouteLoading(element: ReactNode) {
    return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

function RequireConfigured({ isConfigured }: { isConfigured: boolean }) {
    const location = useLocation();

    if (!isConfigured) {
        return <Navigate to={APP_ROUTES.setup} replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

function SetupRoute({ isConfigured, onPageChange }: { isConfigured: boolean; onPageChange: (page: string) => void }) {
    if (isConfigured) {
        return <Navigate to={APP_ROUTES.dashboard} replace />;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <SettingUserProfile onPageChange={onPageChange} />
        </div>
    );
}

function RoutedApp() {
    const { semesterNumber, academicYear, isConfigured } = useDepartmentData();
    const selectedSemester = `Học kỳ ${semesterNumber}, ${academicYear}`;
    const location = useLocation();
    const navigate = useNavigate();
    const currentPage = getPageIdFromPath(location.pathname);
    const visiblePage = isConfigured ? currentPage : (currentPage === 'privacy' ? 'privacy' : 'setup');

    const handlePageChange = (page: string) => {
        navigate(getPathForPage(page));
    };

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEYS.PAGE, currentPage);
    }, [currentPage]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            prefetchPage('courses');
            prefetchPage('grades');
        }, 1200);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleBackButton = () => {
            if (location.pathname !== APP_ROUTES.dashboard) {
                navigate(APP_ROUTES.dashboard);
                return;
            }

            CapacitorApp.exitApp();
        };

        CapacitorApp.addListener('backButton', handleBackButton);

        return () => {
            CapacitorApp.removeAllListeners();
        };
    }, [location.pathname, navigate]);

    return (
        <MainLayout
            currentPage={visiblePage}
            onPageChange={handlePageChange}
            selectedSemester={selectedSemester}
        >
            <Routes>
                <Route path={APP_ROUTES.root} element={<Navigate to={APP_ROUTES.dashboard} replace />} />
                <Route path={APP_ROUTES.privacy} element={<PrivacySecurity />} />
                {WorkspacePage && (
                    <Route
                        path="/ad/*"
                        element={(
                            <Suspense fallback={<div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#004A98]" /></div>}>
                                <WorkspacePage />
                            </Suspense>
                        )}
                    />
                )}
                <Route path={APP_ROUTES.setup} element={<SetupRoute isConfigured={isConfigured} onPageChange={handlePageChange} />} />

                <Route element={<RequireConfigured isConfigured={isConfigured} />}>
                    <Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
                    <Route path={`${APP_ROUTES.studyRoadmap}/*`} element={withRouteLoading(<StudyRoadmapPage />)} />
                    <Route path={APP_ROUTES.legacyGroupSchedule} element={withRouteLoading(<StudyRoadmapPage />)} />
                    <Route path={APP_ROUTES.grades} element={withRouteLoading(<GradesPage />)} />
                    <Route path={APP_ROUTES.tuition} element={withRouteLoading(<TuitionPage selectedSemester={selectedSemester} />)} />
                    <Route path={`${APP_ROUTES.campus}/*`} element={withRouteLoading(<CampusInformationPage />)} />
                    <Route path={APP_ROUTES.legacyCampusMap} element={<Navigate to={APP_ROUTES.campusMap} replace />} />
                    <Route path={APP_ROUTES.schedule} element={withRouteLoading(<SchedulePage selectedSemester={selectedSemester} />)} />
                    <Route path={APP_ROUTES.examSchedule} element={withRouteLoading(<ExamSchedulePage />)} />
                    <Route
                        path={APP_ROUTES.chatbot}
                        element={APP_CONFIG.CHATBOT_ENABLED ? withRouteLoading(<ChatbotPage />) : <Navigate to={APP_ROUTES.dashboard} replace />}
                    />
                    <Route path={APP_ROUTES.settings} element={withRouteLoading(<SettingsPage onPageChange={handlePageChange} />)} />
                </Route>

                <Route path="*" element={<Navigate to={isConfigured ? APP_ROUTES.dashboard : APP_ROUTES.setup} replace />} />
            </Routes>
        </MainLayout>
    );
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <RoutedApp />
        </BrowserRouter>
    );
}
