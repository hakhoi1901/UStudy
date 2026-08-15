import { CalendarRange, MapPinned } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routes';
import { PageHeader, PageShell } from '../../components/layout';
import { SectionTabs } from '../../components/ui/navigation/section-tabs';
import { AcademicCalendarFeature } from '../../features/academic-calendar';
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
] as const;

export function CampusInformationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const activeTab = location.pathname === APP_ROUTES.academicCalendar ? 'academic-calendar' : 'academic-calendar';

    return (
        <PageShell
            header={<PageHeader title="Thông tin trường" description="Bản đồ khuôn viên và kế hoạch năm học." />}
        >
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
            ) : (
                <AcademicCalendarFeature />
            )}
        </PageShell>
    );
}
