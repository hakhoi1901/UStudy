import { Home, Map, BarChart3, DollarSign, Calendar, Settings, ChevronLeft, ChevronRight, Subtitles } from 'lucide-react';
import { useState } from 'react';

const navGroups = [
  {
    title: 'Chính',
    items: [
      { icon: Home, label: 'Tổng quan', active: false, subtitle: "Điểm & tín chỉ tích lũy", page: 'dashboard' },
      { icon: Map, label: 'Lộ trình học tập', active: true, subtitle: 'Chọn môn & Lịch', page: 'courses' },
      { icon: BarChart3, label: 'Quản lý điểm', active: false, subtitle: 'GPA & Môn học lại', page: 'grades' },
    ],
  },
  {
    title: 'Tài chính',
    items: [
      { icon: DollarSign, label: 'Học phí', active: false, subtitle: "Học phí năm học", page: 'tuition' },
    ],
  },
  {
    title: 'Công cụ',
    items: [
      { icon: Calendar, label: 'Thời khóa biểu', active: false, subtitle: 'Lịch đã chốt', page: 'schedule' },
      { icon: Settings, label: 'Cài đặt', active: false, subtitle: "Thiết lập cá nhân", page: 'settings' },
    ],
  },
];

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[#004A98] text-white flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
        }`}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Logo */}
      <div className={`p-6 relative ${isCollapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className={`${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'} bg-white rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-[#004A98]" style={{ fontWeight: 600 }}>LMS</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h3 className="text-white truncate" style={{ fontWeight: 600 }}>HCMUS</h3>
              <p className="text-blue-200 text-sm truncate" style={{ fontWeight: 400 }}>Cổng SV</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
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
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs text-blue-300 uppercase tracking-wider truncate" style={{ fontWeight: 500 }}>
                {group.title}
              </p>
            )}
            {isCollapsed && (
              <div className="h-px bg-blue-400/30 mb-3 mx-2"></div>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <li key={item.label}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(item.page);
                      }}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded transition-all group relative ${isActive
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {isActive && (
                        <div className={`absolute ${isCollapsed ? 'left-0' : 'left-0'} top-1/2 -translate-y-1/2 w-1 ${isCollapsed ? 'h-10' : 'h-8'
                          } bg-white rounded-r`}></div>
                      )}
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mt-0.5'}`} strokeWidth={1.5} />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p
                            className={`truncate ${isActive ? 'text-white' : 'text-blue-100 group-hover:text-white'}`}
                            style={{ fontWeight: isActive ? 500 : 400 }}
                          >
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
}