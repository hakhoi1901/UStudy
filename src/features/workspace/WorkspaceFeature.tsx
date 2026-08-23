import { Bookmark, Database, FlaskConical, HardDrive, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/page-header';
import { PageShell } from '../../components/layout/page-shell';
import { NavigationBar, type NavTab } from '../study-roadmap/components/NavigationBar';
import { BookmarkLabFeature } from '../bookmark-lab/BookmarkLabFeature';
import { SecurityLabFeature } from '../security-lab/SecurityLabFeature';
import { WorkspaceDataFeature } from './components/WorkspaceDataFeature';
import { WorkspaceStorageFeature } from './components/WorkspaceStorageFeature';

type WorkspaceTab = 'lab' | 'data' | 'storage';

const WORKSPACE_TABS: NavTab<WorkspaceTab>[] = [
    { id: 'lab', label: 'Lab', description: 'Công cụ kiểm thử nội bộ', icon: FlaskConical },
    { id: 'data', label: 'Dữ liệu', description: 'Danh mục và độ phủ dữ liệu', icon: Database },
    { id: 'storage', label: 'Local storage', description: 'Xem và chỉnh dữ liệu cục bộ', icon: HardDrive },
];

export function WorkspaceFeature() {
    const location = useLocation();
    const navigate = useNavigate();
    const isSecurityLab = location.pathname.endsWith('/lab/security');
    const isBookmarkLab = location.pathname.endsWith('/lab/bookmark');
    const isDataWorkspace = location.pathname.startsWith('/ad/data');
    const isStorageWorkspace = location.pathname.startsWith('/ad/storage');

    return (
        <PageShell
            header={(
                <PageHeader
                    title="Workspace"
                    description="Khu vực công cụ nội bộ."
                />
            )}
        >
            <div className="min-w-0">
                <NavigationBar
                    ariaLabel="Workspace"
                    tabs={WORKSPACE_TABS}
                    activeTab={isDataWorkspace ? 'data' : isStorageWorkspace ? 'storage' : 'lab'}
                    setActiveTab={(tab) => navigate(tab === 'data' ? '/ad/data' : tab === 'storage' ? '/ad/storage' : '/ad/lab')}
                />

                <div className="pt-5">
                    {isDataWorkspace ? (
                        <WorkspaceDataFeature />
                    ) : isStorageWorkspace ? (
                        <WorkspaceStorageFeature />
                    ) : isSecurityLab ? (
                        <SecurityLabFeature />
                    ) : isBookmarkLab ? (
                        <BookmarkLabFeature />
                    ) : (
                        <section className="grid gap-4 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => navigate('/ad/lab/security')}
                                className="group flex min-h-32 items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-[#004A98]/40 hover:bg-blue-50/40"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98] group-hover:bg-white">
                                    <ShieldCheck className="h-5 w-5" />
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold text-gray-900">Security Lab</span>
                                    <span className="mt-1 block text-sm leading-6 text-gray-600">Kiểm thử WebAuthn PRF và vault gắn với thiết bị.</span>
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/ad/lab/bookmark')}
                                className="group flex min-h-32 items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-[#004A98]/40 hover:bg-blue-50/40"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98] group-hover:bg-white">
                                    <Bookmark className="h-5 w-5" />
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold text-gray-900">Bookmarklet Lab</span>
                                    <span className="mt-1 block text-sm leading-6 text-gray-600">Gửi packet đồng bộ rỗng để kiểm tra các trạng thái dữ liệu.</span>
                                </span>
                            </button>
                        </section>
                    )}
                </div>
            </div>
        </PageShell>
    );
}
