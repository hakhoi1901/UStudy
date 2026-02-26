import { Bell, LogOut, ChevronDown, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStudentGradeData } from '../hooks/useStudentGradeData';
import { BookmarkletButton } from './BookmarkletButton';
import { APP_CONFIG } from '../config/appConfig';
import { STORAGE_KEYS } from '../config/storageKeys';

export function Header() {
  const [studentName, setStudentName] = useState('');
  const [notificationCount] = useState(110);
  const [selectedSemester, setSelectedSemester] = useState(APP_CONFIG.AVAILABLE_SEMESTERS[1]);
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);

  const { hasData } = useStudentGradeData();

  useEffect(() => {
    const studentData = localStorage.getItem(STORAGE_KEYS.STUDENT_DB);
    if (studentData) {
      const student = JSON.parse(studentData);
      setStudentName(student.name);
    }
  }, [hasData]);

  const semesters = APP_CONFIG.AVAILABLE_SEMESTERS;

  const handleLogOut = () => {
    // Clear local storage
    localStorage.clear();
    alert('Tất cả dữ liệu học tập đã được xóa vĩnh viễn khỏi bộ nhớ cục bộ. Bạn đã đăng xuất thành công.');
    window.location.reload();
  };

  const handleLogin = () => {
    // Open portal in popup window to allow the bookmarklet access
    const PORTAL_URL = APP_CONFIG.PORTAL_LOGIN_URL;
    window.open(PORTAL_URL, '_blank');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Title and Semester Selector */}
          <div className="flex items-center gap-4">
            <h2 className="text-gray-900" style={{ fontWeight: 600 }}>Cổng thông tin sinh viên CNTT</h2>
            <div className="relative">
              <button
                onClick={() => setShowSemesterDropdown(!showSemesterDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-[#004A98] text-white rounded-full hover:bg-[#003A78] transition-colors shadow-sm"
              >
                <span className="text-sm" style={{ fontWeight: 500 }}>{selectedSemester}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSemesterDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showSemesterDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSemesterDropdown(false)}
                  ></div>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                    {semesters.map((semester) => (
                      <button
                        key={semester}
                        onClick={() => {
                          setSelectedSemester(semester);
                          setShowSemesterDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${selectedSemester === semester
                          ? 'text-[#004A98] bg-opacity-10'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        style={{ fontWeight: selectedSemester === semester ? 500 : 400 }}
                      >
                        {semester}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Notifications, User, and Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900" strokeWidth={2} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1" style={{ fontWeight: 600 }}>
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="h-10 w-px bg-gray-200"></div>

            {hasData ? (
              <>
                {/* User Avatar and Info */}
                <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#004A98] to-[#0066CC] flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm" style={{ fontWeight: 600 }}>{studentName.split(' ').pop()?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900 text-sm" style={{ fontWeight: 500 }}>{studentName}</p>
                    <p className="text-gray-500 text-xs" style={{ fontWeight: 400 }}>Đã đồng bộ</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-10 w-px bg-gray-200"></div>

                {/* Log Out Button */}
                <button
                  onClick={handleLogOut}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  <span style={{ fontWeight: 500 }}>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                {/* Empty State Call to Action Actions */}
                <BookmarkletButton variant="outline" hideInstructions={true} />
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                >
                  <LogIn className="w-4 h-4" strokeWidth={2.5} />
                  <span style={{ fontWeight: 500 }}>Đăng nhập</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}