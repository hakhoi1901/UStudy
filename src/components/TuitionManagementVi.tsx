import { useState } from 'react';
import { DollarSign, CheckCircle2, Info, Calendar } from 'lucide-react';

interface RegisteredCourse {
  id: string;
  code: string;
  nameVi: string;
  credits: number;
  tuitionPerCourse: number;
}

const TUITION_PER_CREDIT = 350000; // VND per credit

// Sample courses from the selected basket (8 courses to show scrolling behavior)
const registeredCourses: RegisteredCourse[] = [
  { id: '1', code: 'CSC10002', nameVi: 'Cấu trúc dữ liệu và giải thuật', credits: 4, tuitionPerCourse: 1400000 },
  { id: '2', code: 'CSC10003', nameVi: 'Phương pháp lập trình hướng đối tượng', credits: 4, tuitionPerCourse: 1400000 },
  { id: '3', code: 'CSC10005', nameVi: 'Hệ điều hành', credits: 4, tuitionPerCourse: 1400000 },
  { id: '4', code: 'CSC14005', nameVi: 'Học máy', credits: 4, tuitionPerCourse: 1400000 },
  { id: '5', code: 'CSC14006', nameVi: 'Phát triển ứng dụng di động', credits: 3, tuitionPerCourse: 1050000 },
  { id: '6', code: 'CSC15001', nameVi: 'Trí tuệ nhân tạo', credits: 3, tuitionPerCourse: 1050000 },
  { id: '7', code: 'CSC15003', nameVi: 'Mạng máy tính', credits: 4, tuitionPerCourse: 1400000 },
  { id: '8', code: 'CSC15005', nameVi: 'Nhập môn mã hóa - mật mã', credits: 4, tuitionPerCourse: 1400000 },
];

export function TuitionManagementVi() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-gray-900 mb-2">Học phí</h1>
      <p className="text-gray-600 mb-8">Quản lý học phí và thanh toán.</p>
      <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
        <p className="text-gray-500">Trang học phí đang được phát triển...</p>
      </div>
      
      {/* Privacy Footer */}
      <div className="mt-8 py-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-[10px] text-gray-500 text-center">
          Dữ liệu được lưu tại Local Storage và sẽ xóa khi Đăng xuất
        </p>
      </div>
    </div>
  );
}