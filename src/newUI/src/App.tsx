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
  const [selectedSemester, setSelectedSemester] = useState<string>('Học kỳ 2, 2025-2026');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header selectedSemester={selectedSemester} onSemesterChange={setSelectedSemester} />
        {/* Main scrollable container - ONLY scrolling point */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-gray-900 mb-2">Tổng quan</h1>
                <p className="text-gray-600 mb-8">Chào mừng bạn tr lại! Đây là tổng quan học tập của bạn.</p>
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
              <TuitionManagementVi selectedSemester={selectedSemester} />
            </div>
          )}

          {currentPage === 'schedule' && (
            <div className="p-6">
              <VisualScheduleVi />
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="p-6">
              <div className="max-w-5xl mx-auto">
                <h1 className="text-gray-900 mb-2">Cài đặt</h1>
                <p className="text-gray-600 mb-8">Quản lý thông tin cá nhân, học vụ và tùy chọn hệ thống.</p>
                
                {/* Thông tin cá nhân */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-shadow duration-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#004A98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Thông tin cá nhân
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                      <input 
                        type="text" 
                        defaultValue="Thanh Nghĩa"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-transparent transition-all"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mã số sinh viên</label>
                      <input 
                        type="text" 
                        defaultValue="24120102"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email sinh viên</label>
                      <input 
                        type="email" 
                        defaultValue="24120102@student.hcmus.edu.vn"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      <input 
                        type="tel" 
                        defaultValue="0912 345 678"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                      <input 
                        type="date" 
                        defaultValue="2006-05-15"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-transparent transition-all"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                      <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-transparent transition-all bg-white">
                        <option>Nam</option>
                        <option>Nữ</option>
                        <option>Khác</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Thông tin học vụ */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-shadow duration-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#004A98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Thông tin học vụ
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Khoa</label>
                      <input 
                        type="text" 
                        defaultValue="Công nghệ Thông tin"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên ngành</label>
                      <input 
                        type="text" 
                        defaultValue="Khoa học Máy tính"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Khóa tuyển</label>
                      <input 
                        type="text" 
                        defaultValue="K2024"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lớp</label>
                      <input 
                        type="text" 
                        defaultValue="24CTT1"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hệ đào tạo</label>
                      <input 
                        type="text" 
                        defaultValue="Đại học chính quy"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Năm nhập học</label>
                      <input 
                        type="text" 
                        defaultValue="2024"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </div>
                
                {/* Tùy chọn hệ thống */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-shadow duration-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#004A98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Tùy chọn hệ thống
                  </h2>
                  
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#004A98] flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Ngôn ngữ</p>
                          <p className="text-sm text-gray-500">Chọn ngôn ngữ hiển thị</p>
                        </div>
                      </div>
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-transparent bg-white font-medium">
                        <option value="vi">🇻🇳 Tiếng Việt</option>
                        <option value="en">🇬🇧 English</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Chế độ giao diện</p>
                          <p className="text-sm text-gray-500">Sáng hoặc tối</p>
                        </div>
                      </div>
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-transparent bg-white font-medium">
                        <option value="light">☀️ Sáng</option>
                        <option value="dark">🌙 Tối</option>
                        <option value="auto">🤖 Tự động</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Thông báo</p>
                          <p className="text-sm text-gray-500">Nhận thông báo học tập</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004A98]"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-600">Thay đổi chưa được lưu</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Hủy bỏ
                    </button>
                    <button className="px-5 py-2.5 bg-gradient-to-r from-[#004A98] to-[#0066CC] text-white rounded-lg hover:from-[#003A78] hover:to-[#0052A3] transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
                
                {/* Privacy Footer */}
                <div className="py-3 bg-gray-50 border border-gray-200 rounded-lg">
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