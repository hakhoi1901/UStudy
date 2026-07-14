import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { DashboardWidgets } from '../pages/dashboardWidgets/DashboardWidgets';
import { IntegratedStudyRoadmap } from '../pages/integratedStudyRoadmap/IntegratedStudyRoadmap';
import { GradeManagement } from '../pages/gradeManagement/GradeManagement';
import { TuitionPage } from '../pages/TuitionPage/TuitionPage';
import { VisualSchedule } from '../pages/visualSchedule/VisualSchedule';
import { Setting } from '../pages/setting/Setting';
import { SettingUserProfile } from '../features/setting/components/SettingUserProfile';
import { PrivacySecurity } from '../features/setting/components/PrivacySecurity';
import { ExamScheduleVi } from '../pages/ExamSchedule/examSchedule';
import { MainLayout } from '../layouts/MainLayout';
import { STORAGE_KEYS } from '../config/storageKeys';
import { useDepartmentData } from '../context/DepartmentContext';
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
                    <Route path={APP_ROUTES.dashboard} element={<DashboardWidgets />} />
                    <Route path={`${APP_ROUTES.studyRoadmap}/*`} element={<IntegratedStudyRoadmap />} />
                    <Route path={APP_ROUTES.legacyGroupSchedule} element={<IntegratedStudyRoadmap />} />
                    <Route path={APP_ROUTES.grades} element={<GradeManagement />} />
                    <Route path={APP_ROUTES.tuition} element={<TuitionPage selectedSemester={selectedSemester} />} />
                    <Route path={APP_ROUTES.schedule} element={<VisualSchedule selectedSemester={selectedSemester} />} />
                    <Route path={APP_ROUTES.examSchedule} element={<ExamScheduleVi />} />
                    <Route path={APP_ROUTES.settings} element={<Setting onPageChange={handlePageChange} />} />
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
