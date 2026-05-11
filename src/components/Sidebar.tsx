import { Home, Map, BarChart3, DollarSign, Calendar, Settings, ChevronLeft, ChevronRight, Subtitles, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

// định nghĩa các nhóm điều hướng
const navGroups = [
  {
    title: 'Chính',
    items: [
      { icon: Home, label: 'Tổng quan', subtitle: "Điểm & tín chỉ tích lũy", page: 'dashboard' },
      { icon: Map, label: 'Lộ trình học tập', subtitle: 'Chọn môn & Lịch', page: 'courses' },
      { icon: BarChart3, label: 'Quản lý điểm', subtitle: 'GPA & Môn học lại', page: 'grades' },
      { icon: Subtitles, label: 'Lịch thi', subtitle: 'Lịch thi học kỳ', page: 'examSchedule' },
    ],
  },
  {
    title: 'Tài chính',
    items: [
      { icon: DollarSign, label: 'Học phí', subtitle: "Học phí năm học", page: 'tuition' },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { icon: Calendar, label: 'Thời khóa biểu', subtitle: 'Lịch đã chốt', page: 'schedule' },
      { icon: Settings, label: 'Cài đặt', subtitle: "Thiết lập cá nhân", page: 'settings' },
      { icon: Shield, label: 'Bảo mật & Quyền', subtitle: 'Quyền riêng tư dữ liệu', page: 'privacy' },
    ],
  },
];

// các item hiển thị trên bottom nav (mobile)
const bottomNavItems = [
  { icon: Home, label: 'Tổng quan', page: 'dashboard' },
  { icon: Map, label: 'Lộ trình', page: 'courses' },
  { icon: BarChart3, label: 'Điểm', page: 'grades' },
  { icon: Calendar, label: 'Thời khóa biểu', page: 'schedule' },
  { icon: Menu, label: 'Thêm', page: '__more__' },
];

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsDrawerOpen(false);
  };

  // ---- Desktop Sidebar (ẩn trên mobile) ----
  const DesktopSidebar = (
    <aside
      className={`hidden md:flex bg-[#004A98] text-white flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Logo */}
      <div className={`p-6 relative ${isCollapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-[#004A98]" style={{ fontWeight: 600 }}>UNP</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h3 className="text-white truncate" style={{ fontWeight: 600 }}>HCMUS</h3>
              <p className="text-blue-200 text-sm truncate" style={{ fontWeight: 400 }}>Cổng SV</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
          aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#004A98]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#004A98]" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs text-blue-300 uppercase tracking-wider truncate" style={{ fontWeight: 500 }}>
                {group.title}
              </p>
            )}
            {isCollapsed && <div className="h-px bg-blue-400/30 mb-3 mx-2"></div>}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <li key={item.label}>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); onPageChange(item.page); }}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded transition-all group relative ${isActive ? 'bg-white/10' : 'hover:bg-white/5'} ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {isActive && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 ${isCollapsed ? 'h-10' : 'h-8'} bg-white rounded-r`}></div>
                      )}
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mt-0.5'}`} strokeWidth={1.5} />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className={`truncate ${isActive ? 'text-white' : 'text-blue-100 group-hover:text-white'}`} style={{ fontWeight: isActive ? 500 : 400 }}>
                            {item.label}
                          </p>
                          {item.subtitle && (
                            <p className="text-blue-300 text-xs mt-0.5 leading-tight truncate" style={{ fontWeight: 400 }}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );

  // ---- Mobile Portal: render thẳng vào document.body, thoát khỏi mọi container cha ----
  const MobilePortal = createPortal(
    <div className="md:hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 9040,
          }}
        />
      )}

      {/* Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '70vh',
          overflowY: 'auto',
          background: '#004A98',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
          zIndex: 9050,
          transform: isDrawerOpen ? 'translateY(0)' : 'translateY(calc(100%))',
          opacity: isDrawerOpen ? 1 : 0,
          pointerEvents: isDrawerOpen ? 'auto' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
          <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Menu</span>
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}
          >
            <X style={{ width: '16px', height: '16px', color: 'white' }} />
          </button>
        </div>

        {/* Nav groups */}
        <nav style={{ padding: '12px 16px 24px' }}>
          {navGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: '16px' }}>
              <p style={{ padding: '0 8px', marginBottom: '8px', fontSize: '11px', color: 'rgba(147,197,253,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                {group.title}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {group.items.map((item) => {
                  const isActive = currentPage === item.page;
                  return (
                    <li key={item.label}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(item.page); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                          position: 'relative',
                          marginBottom: '2px',
                        }}
                      >
                        {isActive && (
                          <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '28px', background: 'white', borderRadius: '0 2px 2px 0' }}></div>
                        )}
                        <item.icon style={{ width: '20px', height: '20px', color: 'white', flexShrink: 0 }} strokeWidth={1.5} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: 'white', fontWeight: isActive ? 600 : 400, fontSize: '14px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </p>
                          {item.subtitle && (
                            <p style={{ color: 'rgba(147,197,253,0.8)', fontSize: '12px', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', flexShrink: 0 }}></div>}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: '64px',
          background: '#004A98',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          zIndex: 9030,
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {bottomNavItems.map((item) => {
          const isMore = item.page === '__more__';
          const isActive = isMore ? isDrawerOpen : currentPage === item.page;

          return (
            <button
              key={item.page}
              onClick={() => {
                if (isMore) {
                  setIsDrawerOpen(!isDrawerOpen);
                } else {
                  handlePageChange(item.page);
                }
              }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 4px',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Active indicator */}
              {isActive && !isMore && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '32px', height: '2px', background: 'white', borderRadius: '0 0 4px 4px' }}></div>
              )}
              <item.icon
                style={{ width: '20px', height: '20px', marginBottom: '4px', color: isActive ? 'white' : 'rgba(147,197,253,0.8)' }}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span style={{ fontSize: '10px', lineHeight: 1, color: isActive ? 'white' : 'rgba(147,197,253,0.8)', fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>,
    document.body
  );

  return (
    <>
      {DesktopSidebar}
      {MobilePortal}
    </>
  );
}