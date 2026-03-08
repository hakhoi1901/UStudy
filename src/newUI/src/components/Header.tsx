import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ACADEMIC_YEARS } from '../../../assets/data/tuition';
import { useDepartmentData } from '../../../context/DepartmentContext';

interface HeaderProps {
  selectedSemester: string;
  onSemesterChange: (semester: string) => void;
}

export function Header({ selectedSemester, onSemesterChange }: HeaderProps) {
  const [notificationCount] = useState(3);
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);

  // Generate semesters using the predefined academic years (3 semesters per year)
  const semesters = ACADEMIC_YEARS.flatMap(year => [
    `Học kỳ 1, Năm học ${year.id}`,
    `Học kỳ 2, Năm học ${year.id}`,
    `Học kỳ 3, Năm học ${year.id}`,
  ]);

  const { academicYear, setAcademicYear, setSemesterNumber } = useDepartmentData();

  const handleSemesterSelect = (semesterStr: string) => {
    onSemesterChange(semesterStr);
    
    // Parses string like "Học kỳ 1, Năm học 2024-2025"
    const match = semesterStr.match(/Học kỳ (\d+),\s+Năm học\s+(.+)/);
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

  const handleLogOut = () => {
    // Clear local storage
    localStorage.clear();
    // Add any additional logout logic here
    alert('Tất cả dữ liệu học tập đã được xóa vĩnh viễn khỏi bộ nhớ cục bộ. Bạn đã đăng xuất thành công.');
    console.log('Logged out - Local storage cleared');
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
                className="flex items-center gap-2 px-4 py-2 bg-[#004A98] text-white rounded-full hover:bg-[#003A78] transition-colors"
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
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    {semesters.map((semester) => (
                      <button
                        key={semester}
                        onClick={() => handleSemesterSelect(semester)}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          selectedSemester === semester
                            ? 'bg-[#004A98] bg-opacity-10 text-[#004A98]'
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
          
          {/* Right Side - Notifications, User, and Log Out */}
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
            
            {/* User Avatar and Info */}
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#004A98] to-[#0066CC] flex items-center justify-center shadow-sm">
                <span className="text-white text-sm" style={{ fontWeight: 600 }}>TN</span>
              </div>
              <div className="text-left">
                <p className="text-gray-900 text-sm" style={{ fontWeight: 500 }}>Thanh Nghĩa</p>
                <p className="text-gray-500 text-xs" style={{ fontWeight: 400 }}>MSSV: 24120102</p>
              </div>
            </div>
            
            {/* Divider */}
            <div className="h-10 w-px bg-gray-200"></div>
            
            {/* Log Out Button - Red Style */}
            <button 
              onClick={handleLogOut}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
              <span style={{ fontWeight: 500 }}>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}