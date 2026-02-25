import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardWidgets } from './components/DashboardWidgets';
import { IntegratedStudyRoadmap } from './components/IntegratedStudyRoadmap';
import { GradeManagementVi } from './components/GradeManagementVi';
import { TuitionManagementVi } from './components/TuitionManagementVi';
import { VisualScheduleVi } from './components/VisualScheduleVi';
import { useState } from 'react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {/* Main scrollable container - ONLY scrolling point */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-gray-900 mb-2">Tổng quan</h1>
                <p className="text-gray-600 mb-8">Chào mừng bạn trở lại! Đây là tổng quan học tập của bạn.</p>
                <DashboardWidgets />
              </div>
            </div>
          )}
          
          {currentPage === 'courses' && (
            <div className="p-6">
              <div className="max-w-[1600px] mx-auto">
                <IntegratedStudyRoadmap />
              </div>
            </div>
          )}

          {currentPage === 'grades' && (
            <div className="p-6">
              <GradeManagementVi />
            </div>
          )}

          {currentPage === 'tuition' && (
            <div className="p-6">
              <TuitionManagementVi />
            </div>
          )}

          {currentPage === 'schedule' && (
            <div className="p-6">
              <VisualScheduleVi />
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-gray-900 mb-2">Cài đặt</h1>
                <p className="text-gray-600 mb-8">Quản lý tài khoản và tùy chọn của bạn.</p>
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <p className="text-gray-500">Trang cài đặt đang được phát triển...</p>
                </div>
                
                {/* Privacy Footer */}
                <div className="mt-8 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-[10px] text-gray-500 text-center">
                    Dữ liệu được lưu tại Local Storage và sẽ xóa khi Đăng xuất
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}