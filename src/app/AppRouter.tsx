import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { StudyRoadmapPage } from '../pages/study-roadmap/StudyRoadmapPage';
import { GradesPage } from '../pages/grades/GradesPage';
import { TuitionPage } from '../pages/tuition/TuitionPage';
import { SchedulePage } from '../pages/schedule/SchedulePage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { PrivacySecurity, SettingUserProfile } from '../features/settings';
import { ExamSchedulePage } from '../pages/exams/ExamSchedulePage';
import { ChatbotPage } from '../pages/chatbot/ChatbotPage';
import { MainLayout } from '../layouts/MainLayout';
import { STORAGE_KEYS } from '../config/storageKeys';
import { useDepartmentData } from '../context/DepartmentContext';
import CampusMap from '../features/campus-map/campusmap.tsx';
import { APP_ROUTES, getPageIdFromPath, getPathForPage } from './routes';

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
                <Route path={APP_ROUTES.setup} element={<SetupRoute isConfigured={isConfigured} onPageChange={handlePageChange} />} />

                <Route element={<RequireConfigured isConfigured={isConfigured} />}>
                    <Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
                    <Route path={`${APP_ROUTES.studyRoadmap}/*`} element={<StudyRoadmapPage />} />
                    <Route path={APP_ROUTES.legacyGroupSchedule} element={<StudyRoadmapPage />} />
                    <Route path={APP_ROUTES.grades} element={<GradesPage />} />
                    <Route path={APP_ROUTES.tuition} element={<TuitionPage selectedSemester={selectedSemester} />} />
                    <Route path={APP_ROUTES.campusMap} element={<CampusMap />} />
                    <Route path={APP_ROUTES.schedule} element={<SchedulePage selectedSemester={selectedSemester} />} />
                    <Route path={APP_ROUTES.examSchedule} element={<ExamSchedulePage />} />
                    <Route path={APP_ROUTES.chatbot} element={<ChatbotPage />} />
                    <Route path={APP_ROUTES.settings} element={<SettingsPage onPageChange={handlePageChange} />} />
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
