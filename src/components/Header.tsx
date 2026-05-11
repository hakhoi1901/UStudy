import { LogOut, ChevronDown, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStudentGradeData } from '../features/grades/hooks/use-student-grade-data';
import { BookmarkletButton } from './BookmarkletButton';
import { NotificationMenu } from './NotificationMenu';
import { useAppNotification } from '../context/NotificationContext';
import { useDepartmentData } from '../context/DepartmentContext';
import { ACADEMIC_YEARS } from '../assets/data/tuition';
import { APP_CONFIG, STORAGE_KEYS } from '../config';
import { readFromStorage, clearAllStorage } from '../helpers/localStorage/save';
import { useCrypto } from '../context/CryptoContext';

export interface HeaderProps {
  selectedSemester?: string;
  onSemesterChange?: (semester: string) => void;
}

export function Header({ selectedSemester: propSelectedSemester, onSemesterChange }: HeaderProps = {}) {
  const [studentName, setStudentName] = useState('');
  const [localSemester, setLocalSemester] = useState(`Học kỳ ${APP_CONFIG.DEFAULT_SEMESTER}, ${APP_CONFIG.DEFAULT_ACADEMIC_YEAR}`);
  const selectedSemester = propSelectedSemester || localSemester;
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const { academicYear, setAcademicYear, semesterNumber, setSemesterNumber } = useDepartmentData();

  // lấy dữ liệu sinh viên
  const { hasData } = useStudentGradeData();
  // lấy thông báo
  const { addNotification } = useAppNotification();
  // crypto context để lock khi đăng xuất
  const { lock } = useCrypto();

  // lấy tên sinh viên từ local storage
  useEffect(() => {
    const student = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
    if (student) {
      setStudentName(student.name);
    }
  }, [hasData]);

  // tạo danh sách các học kỳ sử dụng các năm học đã định nghĩa (3 học kỳ mỗi năm)
  const semesters = ACADEMIC_YEARS.flatMap(year => [
    `Học kỳ 3, ${year.id}`,
    `Học kỳ 2, ${year.id}`,
    `Học kỳ 1, ${year.id}`,
  ]);

  // xử lý chọn học kỳ
  const handleSemesterSelect = (semesterStr: string) => {
    const match = semesterStr.match(/Học kỳ (\d+),\s+(.+)/);
    if (match) {
      const semNum = parseInt(match[1]);
      const yearStr = match[2];
      setSemesterNumber(semNum);
      if (yearStr !== academicYear) {
        setAcademicYear(yearStr);
      }
    }
    setShowSemesterDropdown(false);
  };

  // xử lý đăng xuất
  const handleLogOut = () => {
    clearAllStorage();
    lock();
    addNotification({
      title: 'Đăng xuất thành công',
      message: 'Tất cả dữ liệu học tập đã được xóa khỏi trình duyệt.',
      type: 'info'
    });
    setTimeout(() => window.location.reload(), 100);
  };

  // xử lý đăng nhập
  const handleLogin = () => {
    const PORTAL_URL = APP_CONFIG.PORTAL_LOGIN_URL;
    window.open(PORTAL_URL, '_blank');
  };

  // lấy chữ cái đầu của tên sinh viên
  const nameInitial = studentName.split(' ').pop()?.charAt(0).toUpperCase() ?? 'K';

  // rút gọn tên học kỳ cho mobile: "Học kỳ 2, 2025-2026" → "HK2 25-26"
  const shortSemester = selectedSemester.replace(/Học kỳ (\d+), (\d{4})-(\d{4})/, 'HK$1 $2-$3').replace(/\d{4}-(\d{2})\d{2}/, (_, y2) => `${'20' + y2.slice(0, 2)}-${y2}`);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">

          {/* ---- Bên trái: tiêu đề + bộ chọn học kỳ ---- */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {/* Tiêu đề: ẩn trên mobile */}
            <h2 className="hidden md:block text-gray-900 whitespace-nowrap" style={{ fontWeight: 600 }}>
              Hệ thống quản lý học tập
            </h2>

            {/* Bộ chọn học kỳ */}
            <div className="relative">
              <button
                onClick={() => setShowSemesterDropdown(!showSemesterDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-[#004A98] text-white rounded-full hover:bg-[#003A78] transition-colors shadow-sm"
              >
                {/* Desktop: tên đầy đủ, Mobile: tên rút gọn */}
                <span className="hidden md:inline text-sm" style={{ fontWeight: 500 }}>{selectedSemester}</span>
                <span className="md:hidden text-xs" style={{ fontWeight: 500 }}>{shortSemester}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSemesterDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showSemesterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSemesterDropdown(false)}></div>
                  <div className="absolute top-full left-0 mt-2 w-56 md:w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 max-h-72 overflow-y-auto">
                    {semesters.map((semester) => (
                      <button
                        key={semester}
                        onClick={() => {
                          handleSemesterSelect(semester);
                          if (onSemesterChange) onSemesterChange(semester);
                          else setLocalSemester(semester);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${selectedSemester === semester
                          ? 'text-[#004A98] bg-blue-50'
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

          {/* ---- Bên phải: thông báo, user, action ---- */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Notification Menu */}
            <NotificationMenu />

            {/* Divider - ẩn trên mobile */}
            <div className="hidden md:block h-10 w-px bg-gray-200"></div>

            {hasData ? (
              <>
                {/* User Avatar + Info */}
                <div className="flex items-center gap-2 md:gap-3 md:px-3 md:py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#004A98] to-[#0066CC] flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white text-xs md:text-sm" style={{ fontWeight: 600 }}>{nameInitial}</span>
                  </div>
                  {/* Tên sinh viên: ẩn trên mobile */}
                  <div className="hidden md:block text-left">
                    <p className="text-gray-900 text-sm" style={{ fontWeight: 500 }}>{studentName}</p>
                    <p className="text-gray-500 text-xs" style={{ fontWeight: 400 }}>Đã đồng bộ</p>
                  </div>
                </div>

                {/* Divider - ẩn trên mobile */}
                <div className="hidden md:block h-10 w-px bg-gray-200"></div>

                {/* Log Out Button */}
                <button
                  onClick={handleLogOut}
                  className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  {/* Text: ẩn trên mobile */}
                  <span className="hidden md:inline" style={{ fontWeight: 500 }}>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                {/* Empty State Actions */}
                {/* BookmarkletButton: ẩn trên mobile để tiết kiệm không gian */}
                <div className="hidden md:block">
                  <BookmarkletButton variant="outline" hideInstructions={true} />
                </div>
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-all shadow-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  <LogIn className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-sm" style={{ fontWeight: 500 }}>Đăng nhập</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}