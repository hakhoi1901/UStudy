import { LogOut, LogIn, ExternalLink, GraduationCap, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { BookmarkletButton } from '../portal/BookmarkletButton';
import { NotificationMenu } from './NotificationMenu';
import { useAppNotification } from '../../context/NotificationContext';
import { useDepartmentData } from '../../context/DepartmentContext';
import { ACADEMIC_YEARS } from '../../assets/data/tuition';
import { APP_CONFIG, STORAGE_KEYS } from '../../config';
import { readFromStorage, clearAllStorage } from '../../helpers/localStorage/save';
import { useCrypto } from '../../context/CryptoContext';
import { isNativePortalSyncAvailable, openNativePortalSync } from '../../mobile/portal-sync';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/overlays/dropdown-menu';
import { AppSelect } from '../ui/form/app-select';

export interface HeaderProps {
  selectedSemester?: string;
  onSemesterChange?: (semester: string) => void;
  showSemesterSelector?: boolean;
}

export function Header({
  selectedSemester: propSelectedSemester,
  onSemesterChange,
  showSemesterSelector = false
}: HeaderProps = {}) {
  const [studentName, setStudentName] = useState('');
  const [hasStudentProfile, setHasStudentProfile] = useState(false);
  const [localSemester, setLocalSemester] = useState(`Học kỳ ${APP_CONFIG.DEFAULT_SEMESTER}, ${APP_CONFIG.DEFAULT_ACADEMIC_YEAR}`);
  const selectedSemester = propSelectedSemester || localSemester;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const { academicYear, semesterNumber, setAcademicYear, setSemesterNumber } = useDepartmentData();

  // lấy dữ liệu sinh viên
  // lấy thông báo
  const { addNotification } = useAppNotification();
  // crypto context để lock khi đăng xuất
  const { lock } = useCrypto();

  // lấy tên sinh viên từ local storage
  useEffect(() => {
    const syncStudentProfile = () => {
      const student = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
      const rawStudent = readFromStorage<any>(STORAGE_KEYS.RAW_STUDENT_DB, null);
      const name = student?.name || rawStudent?.name || '';

      setStudentName(typeof name === 'string' ? name.trim() : '');
      setHasStudentProfile(Boolean(student || rawStudent));
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'IMPORT_FULL_DATA' || event.data?.type === 'CACHE_POPULATED') {
        syncStudentProfile();
      }
    };

    syncStudentProfile();
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
  };

  // xử lý đăng xuất
  const handleLogOutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogOutConfirm = () => {
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
  const handleLogin = async () => {
    if (isNativePortalSyncAvailable()) {
      setIsOpeningPortal(true);
      try {
        await openNativePortalSync(academicYear, semesterNumber);
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : String(reason);
        if (!/cancel|hủy|huy/i.test(message)) {
          addNotification({
            title: 'Không thể mở Portal',
            message: message || 'Vui lòng thử lại.',
            type: 'error'
          });
        }
      } finally {
        setIsOpeningPortal(false);
      }
      return;
    }

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
            {/* Tiêu đề: ẩn trên mobile nếu có bộ chọn, ngược lại hiện trên cả mobile và desktop */}
            <h2 className={`desktop-only text-gray-900 whitespace-nowrap text-sm sm:text-base md:text-lg`} style={{ fontWeight: 600 }}>
              Hệ thống hỗ trợ quản lý học tập
            </h2>
            <h2
              className="mobile-only flex items-center gap-2 whitespace-nowrap text-sm text-gray-900 sm:text-base md:text-lg"
              style={{ fontWeight: 600 }}
            >
              <GraduationCap className="h-8 w-8 shrink-0 rounded-md bg-[#0058B2] p-1 text-white lg:h-9 lg:w-9 lg:rounded-lg" />
              <span>UStudy</span>
            </h2>

            {/* Bộ chọn học kỳ */}
            {showSemesterSelector && (
              <AppSelect
                value={selectedSemester}
                onChange={(semester) => {
                  handleSemesterSelect(semester);
                  if (onSemesterChange) onSemesterChange(semester);
                  else setLocalSemester(semester);
                }}
                options={semesters.map((semester) => ({ id: semester, name: semester }))}
                ariaLabel="Chọn học kỳ"
                className="w-32 md:w-64"
                triggerClassName="h-9 rounded-full border-transparent bg-[var(--ustudy-brand)] px-3 py-0 font-medium text-white hover:border-transparent hover:bg-[var(--ustudy-brand-strong)] [&_svg]:text-white"
                menuClassName="w-64"
                valueContent={(
                  <>
                    <span className="hidden truncate text-sm md:block">{selectedSemester}</span>
                    <span className="truncate text-xs md:hidden">{shortSemester}</span>
                  </>
                )}
              />
            )}
          </div>

          {/* ---- Bên phải: thông báo, user, action ---- */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Notification Menu */}
            <NotificationMenu />

            {/* Divider - ẩn trên mobile */}
            <div className="hidden md:block h-10 w-px bg-gray-200"></div>

            {hasStudentProfile ? (
              <>
                <div className="hidden items-center gap-3 md:flex">
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ustudy-brand)] to-[#0066CC] shadow-sm">
                      <span className="text-sm font-semibold text-white">{nameInitial}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{studentName || 'Sinh viên'}</p>
                      <p className="text-xs text-gray-500">Đã đồng bộ</p>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-gray-200" />

                  <button
                    type="button"
                    onClick={() => void handleLogin()}
                    disabled={isOpeningPortal}
                    className="ustudy-button-white"
                    title={isNativePortalSyncAvailable() ? 'Mở Portal và đồng bộ dữ liệu' : 'Mở HCMUS Portal để đồng bộ dữ liệu'}
                  >
                    {isOpeningPortal
                      ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                      : <ExternalLink className="h-4 w-4" strokeWidth={2.5} />}
                    <span>Mở Portal</span>
                  </button>

                  <button type="button" onClick={handleLogOutClick} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-red-700">
                    <LogOut className="h-4 w-4" strokeWidth={2.5} />
                    <span>Đăng xuất</span>
                  </button>
                </div>

                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="ustudy-focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ustudy-brand)] to-[#0066CC] text-xs font-semibold text-white shadow-sm"
                        aria-label="Mở menu tài khoản"
                      >
                        {nameInitial}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8} className="z-[9200] w-60 rounded-xl border-gray-200 bg-white p-1.5 text-gray-800 shadow-xl">
                      <DropdownMenuLabel className="px-3 py-2">
                        <span className="block truncate text-sm font-semibold text-gray-900">{studentName || 'Sinh viên'}</span>
                        <span className="mt-0.5 block text-xs font-normal text-gray-500">Dữ liệu đã đồng bộ</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-100" />
                      <DropdownMenuItem
                        disabled={isOpeningPortal}
                        onSelect={() => void handleLogin()}
                        className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-blue-50 focus:text-[var(--ustudy-brand)]"
                      >
                        {isOpeningPortal ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                        Mở Portal và đồng bộ
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={handleLogOutClick}
                        className="cursor-pointer rounded-lg px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                {/* Empty State Actions */}
                {/* BookmarkletButton: ẩn trên mobile để tiết kiệm không gian */}
                <div className="hidden md:block">
                  <BookmarkletButton variant="outline" hideInstructions={true} />
                </div>
                <button
                  onClick={() => void handleLogin()}
                  disabled={isOpeningPortal}
                  className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-all shadow-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  {isOpeningPortal
                    ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                    : <LogIn className="h-4 w-4" strokeWidth={2.5} />}
                  <span className="text-sm" style={{ fontWeight: 500 }}>{isOpeningPortal ? 'Đang mở' : 'Đăng nhập'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutConfirmModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogOutConfirm}
        />
      )}
    </header>
  );
}
