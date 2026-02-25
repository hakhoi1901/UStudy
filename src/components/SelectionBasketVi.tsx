import { X, CheckCircle2 } from 'lucide-react';
import type { Course } from '../data/courseData';
import { tuition_rates } from '../assets/data/tuition_rates';
import { courses as allCoursesMeta } from '../assets/data/courses';

interface SelectionBasketViProps {
  selectedCourses: Course[];
  onRemoveCourse: (courseId: string) => void;
}

export function SelectionBasketVi({ selectedCourses, onRemoveCourse }: SelectionBasketViProps) {
  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);

  const estimatedTuition = selectedCourses.reduce((sum, course) => {
    let pricePerCredit = tuition_rates.default_price;
    const id = course.code.trim().toUpperCase();

    // Find rate based on subject prefix (longest prefix match)
    const sortedKeys = Object.keys(tuition_rates.rates).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (id.startsWith(key)) {
        pricePerCredit = (tuition_rates.rates as any)[key];
        break;
      }
    }

    // Find billing credits (based on total hours / 15)
    let billingCredits = course.credits || 0;
    const meta = allCoursesMeta.find(c => c.course_id === id);
    if (meta) {
      const lt = parseInt(meta.theory_hours as any) || 0;
      const th = parseInt(meta.lab_hours as any) || 0;
      const bt = parseInt(meta.exercise_hours as any) || 0;
      const totalHours = lt + th + bt;
      if (totalHours > 0) {
        billingCredits = totalHours / 15;
      }
    }

    course.price = billingCredits * pricePerCredit;

    return sum + (billingCredits * pricePerCredit);
  }, 0);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col sticky top-0" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Header - Fixed */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-gray-900 font-semibold">Giỏ môn học</h3>
        <p className="text-sm text-gray-600 mt-1">
          {selectedCourses.length} môn học đã chọn
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Dữ liệu được lấy từ Portal</span>
        </div>
      </div>

      {/* Course List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {selectedCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-gray-400 text-sm">Chưa có môn học nào được chọn</p>
            <p className="text-gray-400 text-xs mt-1">Chọn môn từ danh sách bên trái</p>
          </div>
        ) : (
          selectedCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {course.code}
                </p>
                <p className="text-xs text-gray-600 truncate">{course.nameVi}</p>
                <p className="text-xs text-gray-600 truncate">{formatCurrency(course.price)} đ</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-500">{course.credits} tín chỉ</span>
                  {course.needsRetake && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full">
                      Học lại
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemoveCourse(course.id)}
                className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                title="Xóa khỏi giỏ"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer - Sticky (Never scrolls out of view) */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0 rounded-b-xl">
        {/* Credits Summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng tín chỉ:</span>
            <span className="text-lg font-bold text-gray-900">{totalCredits}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${totalCredits > 24 ? 'bg-red-500' : 'bg-[#004A98]'
                }`}
              style={{ width: `${Math.min((totalCredits / 24) * 100, 100)}%` }}
            ></div>
          </div>
          {totalCredits > 24 && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <span>⚠️</span>
              <span>Vượt quá 24 tín chỉ tối đa mỗi học kỳ</span>
            </p>
          )}
          {totalCredits > 0 && totalCredits <= 24 && (
            <p className="text-xs text-gray-500 mt-1.5">
              Còn lại {24 - totalCredits} tín chỉ có thể đăng ký
            </p>
          )}
        </div>

        {/* Tuition Summary */}
        <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600 mb-1">Tổng học phí dự kiến</p>
          <p className="text-2xl font-bold text-[#004A98]">
            {formatCurrency(estimatedTuition)}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">VNĐ (đã bao gồm các khoản phí)</p>
        </div>

        {/* Confirm Button */}
        <button
          className={`w-full py-3 rounded-lg font-medium transition-all ${selectedCourses.length === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#004A98] text-white hover:bg-[#003A78] shadow-sm hover:shadow-md active:scale-[0.98]'
            }`}
          disabled={selectedCourses.length === 0}
        >
          Xác nhận đăng ký
        </button>

        {/* Privacy Note */}
        <p className="text-[10px] text-gray-500 text-center mt-3 leading-relaxed">
          Dữ liệu được lưu tại Local Storage và sẽ xóa khi Đăng xuất
        </p>
      </div>
    </div>
  );
}