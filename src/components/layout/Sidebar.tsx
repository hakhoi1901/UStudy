import {
  BarChart3,
  Bot,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Home,
  Info,
  Map,
  Menu,
  Settings,
  Shield,
  Subtitles,
} from 'lucide-react';
import { useRef, useState, type ElementType } from 'react';
import { createPortal } from 'react-dom';
import { getPathForPage, type PageId } from '../../app/routes';
import { prefetchPage } from '../../app/route-loaders';
import { APP_CONFIG } from '../../config/appConfig';
import { MobileBottomSheet } from '../ui/overlays/mobile-bottom-sheet';

interface NavItem {
  icon: ElementType;
  label: string;
  subtitle?: string;
  page: PageId;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Chính',
    items: [
      { icon: Home, label: 'Tổng quan', subtitle: 'Điểm và tín chỉ tích lũy', page: 'dashboard' },
      { icon: Map, label: 'Lộ trình học tập', subtitle: 'Kế hoạch, môn và lịch dự kiến', page: 'courses' },
      { icon: BarChart3, label: 'Quản lý điểm', subtitle: 'GPA và môn học lại', page: 'grades' },
      { icon: Subtitles, label: 'Lịch thi', subtitle: 'Lịch thi học kỳ', page: 'examSchedule' },
    ],
  },
  {
    title: 'Tài chính',
    items: [
      { icon: DollarSign, label: 'Học phí', subtitle: 'Học phí năm học', page: 'tuition' },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      ...(APP_CONFIG.CHATBOT_ENABLED
        ? [{ icon: Bot, label: 'Trợ lý', subtitle: 'Hỏi và đáp', page: 'chatbot' as const }]
        : []),
      { icon: Calendar, label: 'Thời khóa biểu', subtitle: 'Lịch học đã đăng ký', page: 'schedule' },
      { icon: Info, label: 'Thông tin trường', subtitle: 'Bản đồ và kế hoạch năm học', page: 'campusInfo' },
      { icon: Settings, label: 'Cài đặt', subtitle: 'Thiết lập cá nhân', page: 'settings' },
      { icon: Shield, label: 'Bảo mật và quyền', subtitle: 'Quyền riêng tư dữ liệu', page: 'privacy' },
    ],
  },
];

const desktopNavGroups = navGroups.map((group) => ({
  ...group,
  items: group.items.filter((item) => item.page !== 'chatbot'),
}));

const bottomNavItems: Array<{ icon: ElementType; label: string; page: PageId | '__more__' }> = [
  { icon: Home, label: 'Tổng quan', page: 'dashboard' },
  { icon: Map, label: 'Lộ trình', page: 'courses' },
  { icon: BarChart3, label: 'Điểm', page: 'grades' },
  { icon: Calendar, label: 'TKB', page: 'schedule' },
  { icon: Menu, label: 'Thêm', page: '__more__' },
];

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const handlePageChange = (page: PageId) => {
    onPageChange(page);
    setIsDrawerOpen(false);
  };

  const renderDesktopGroup = (group: NavGroup) => (
    <div key={group.title} className="mb-6">
      {!isCollapsed ? (
        <p className="mb-2 truncate px-3 text-xs font-medium uppercase tracking-wider text-blue-300">
          {group.title}
        </p>
      ) : (
        <div className="mx-2 mb-3 h-px bg-blue-400/30" />
      )}
      <ul className="space-y-1">
        {group.items.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;
          return (
            <li key={item.page}>
              <a
                href={getPathForPage(item.page)}
                onClick={(event) => {
                  event.preventDefault();
                  handlePageChange(item.page);
                }}
                onMouseEnter={() => prefetchPage(item.page)}
                onFocus={() => prefetchPage(item.page)}
                className={`group relative flex items-start gap-3 rounded px-3 py-2.5 transition-colors ${isActive ? 'bg-white/10' : 'hover:bg-white/5'} ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && <span className={`absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r bg-white ${isCollapsed ? 'h-10' : 'h-8'}`} />}
                <Icon className={`h-5 w-5 shrink-0 ${isCollapsed ? '' : 'mt-0.5'}`} strokeWidth={1.5} />
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className={`truncate ${isActive ? 'font-medium text-white' : 'text-blue-100 group-hover:text-white'}`}>{item.label}</p>
                    {item.subtitle && <p className="mt-0.5 truncate text-xs leading-tight text-blue-300">{item.subtitle}</p>}
                  </div>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const desktopSidebar = (
    <aside className={`hidden shrink-0 flex-col bg-[var(--ustudy-brand)] text-white transition-[width] duration-300 md:flex ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`relative p-6 ${isCollapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white font-semibold text-[var(--ustudy-brand)]">US</div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-white">UStudy</h3>
              <p className="truncate text-sm text-blue-200">Hỗ trợ quản lý học tập</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          className="ustudy-focus-ring absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-100"
          aria-label={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-[var(--ustudy-brand)]" /> : <ChevronLeft className="h-4 w-4 text-[var(--ustudy-brand)]" />}
        </button>
      </div>
      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng chính">
        {desktopNavGroups.map(renderDesktopGroup)}
      </nav>
    </aside>
  );

  const mobileNavigation = createPortal((
    <div className="md:hidden">
      {isDrawerOpen && (
        <MobileBottomSheet
          title="Điều hướng"
          eyebrow="UStudy"
          ariaLabel="Menu điều hướng"
          className="md:hidden"
          contentClassName="bg-white px-3 py-4"
          onClose={() => setIsDrawerOpen(false)}
          sheetId="main-navigation"
        >
          <nav aria-label="Điều hướng mở rộng" className="space-y-5">
            {navGroups.map((group) => (
              <section key={group.title}>
                <div className="mb-2 flex items-center justify-between px-2">
                  <h2 className="text-[11px] font-semibold uppercase text-slate-500">{group.title}</h2>
                  <span className="text-[11px] tabular-nums text-slate-400">{group.items.length}</span>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {group.items.map((item, index) => {
                    const isActive = currentPage === item.page;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.page}
                        type="button"
                        onClick={() => handlePageChange(item.page)}
                        onPointerDown={() => prefetchPage(item.page)}
                        className={`ustudy-focus-ring relative flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${index > 0 ? 'border-t border-gray-100' : ''} ${isActive ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {isActive && <span className="absolute inset-y-2 left-0 w-0.5 rounded-r bg-[var(--ustudy-brand)]" />}
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-white text-[var(--ustudy-brand)]' : 'bg-slate-100 text-slate-500'}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm font-semibold ${isActive ? 'text-[var(--ustudy-brand)]' : 'text-gray-800'}`}>{item.label}</span>
                          {item.subtitle && <span className="mt-0.5 block truncate text-xs text-slate-500">{item.subtitle}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>
        </MobileBottomSheet>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-[9030] flex border-t border-white/10 bg-[var(--ustudy-brand)]"
        style={{ height: 'calc(var(--ustudy-mobile-nav-height) + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Điều hướng nhanh"
      >
        {bottomNavItems.map((item) => {
          const isMore = item.page === '__more__';
          const isActive = isMore ? isDrawerOpen : currentPage === item.page;
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              ref={isMore ? moreButtonRef : undefined}
              type="button"
              onClick={() => isMore ? setIsDrawerOpen((current) => !current) : handlePageChange(item.page)}
              onPointerDown={() => {
                if (item.page !== '__more__') prefetchPage(item.page);
              }}
              className={`ustudy-focus-ring relative flex flex-1 flex-col items-center justify-center px-1 py-2 ${isActive ? 'bg-white/10 text-white' : 'text-blue-200'}`}
              aria-label={item.label}
              aria-expanded={isMore ? isDrawerOpen : undefined}
              aria-controls={isMore ? 'main-navigation' : undefined}
              aria-current={!isMore && isActive ? 'page' : undefined}
            >
              {isActive && !isMore && <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-b bg-white" />}
              <Icon className="mb-1 h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  ), document.body);

  return (
    <>
      {desktopSidebar}
      {mobileNavigation}
    </>
  );
}
