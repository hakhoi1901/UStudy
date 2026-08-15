import { Building2, CalendarRange, MapPinned } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routes';
import { PageHeader, PageShell } from '../../components/layout';
import { SectionTabs } from '../../components/ui/navigation/section-tabs';
import { AcademicCalendarFeature } from '../../features/academic-calendar';
import { CampusDirectoryFeature } from '../../features/campus-directory';
import CampusMap from '../../features/campus-map/campusmap';

const tabs = [
    // {
    //     id: 'map',
    //     label: 'Bản đồ khuôn viên',
    //     description: 'Tìm tòa nhà, tầng và phòng học',
    //     icon: MapPinned,
    //     path: APP_ROUTES.campusMap,
    // },
    {
        id: 'academic-calendar',
        label: 'Kế hoạch năm học',
        description: 'Lịch học, thi và các mốc chung',
        icon: CalendarRange,
        path: APP_ROUTES.academicCalendar,
    },
    {
        id: 'directory',
        label: 'Đơn vị & liên hệ',
        description: 'Khoa, phòng ban và dịch vụ sinh viên',
        icon: Building2,
        path: APP_ROUTES.campusDirectory,
    },
] as const;

export function CampusInformationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const activeTab = location.pathname === APP_ROUTES.academicCalendar
        ? 'academic-calendar'
        : location.pathname === APP_ROUTES.campusDirectory
            ? 'directory'
            : 'academic-calendar';

    return (
        <PageShell header={<PageHeader title="Thông tin trường" description="Bản đồ khuôn viên, kế hoạch năm học và danh bạ đơn vị." />}>
            <SectionTabs
                ariaLabel="Thông tin trường"
                tabs={tabs}
                activeTab={activeTab}
                onChange={(tabId) => navigate(tabs.find((tab) => tab.id === tabId)?.path ?? APP_ROUTES.campusMap)}
            />

            {activeTab === 'map' ? (
                <div className="mt-5">
                    <CampusMap />
                </div>
            ) : activeTab === 'academic-calendar' ? (
                <AcademicCalendarFeature />
            ) : (
                <CampusDirectoryFeature />
            )}
        </PageShell>
    );
}
