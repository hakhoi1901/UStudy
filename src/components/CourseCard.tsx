import { type Course } from '../types';
import { CheckCircle2, XCircle, AlertCircle, GitBranch, User } from 'lucide-react';


// hiển thị thông tin môn học
interface CourseCardProps {
  course: Course;   // thông tin môn học
  isSelected: boolean;  // trạng thái đã chọn
  onToggle: (courseId: string) => void;  // hàm xử lý khi click vào checkbox
  onShowFlowchart: (course: Course) => void;  // hàm xử lý khi click vào nút xem sơ đồ
}

/**
 * 
 * @param course thông tin môn học
 * @param isSelected trạng thái đã chọn
 * @param onToggle hàm xử lý khi click vào checkbox
 * @param onShowFlowchart hàm xử lý khi click vào nút xem sơ đồ
 * @returns trả về thẻ môn học chứa thông tin tên, mã, số tín chỉ, mô tả, trạng thái, ...
 * 
 * render thẻ môn học
 */
export function CourseCard({ course, isSelected, onToggle, onShowFlowchart }: CourseCardProps) {
  return (
    <div
      className={`bg-white rounded-lg p-5 shadow-sm border-2 transition-all ${isSelected
        ? 'border-[#004A98] shadow-md'
        : course.needsRetake
          ? 'border-red-200 bg-red-50/30'
          : 'border-gray-100 hover:border-gray-200'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-gray-900">{course.name}</h4>

            {/* hiển thị trạng thái môn học có thể học */}
            {course.isAvailable && !course.needsRetake && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Available
              </span>
            )}

            {/* hiển thị trạng thái môn học cần học lại */}
            {course.needsRetake && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Retake Required
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{course.code} • {course.credits} credits</p>
        </div>

        {/* checkbox chọn môn học */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(course.id)}
          disabled={!course.isAvailable && !course.needsRetake}
          className="w-5 h-5 rounded border-gray-300 text-[#004A98] focus:ring-[#004A98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        />
      </div>

      {/* mô tả môn học */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm">

          {/* hiển thị giảng viên (nếu có) */}
          {course.instructor && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <User className="w-4 h-4" />
              <span className="text-xs">{course.instructor}</span>
            </div>
          )}

          {/* hiển thị môn học tiên quyết */}
          {course.prerequisites.length > 0 && (
            <button
              onClick={() => onShowFlowchart(course)}
              className="flex items-center gap-1.5 text-[#004A98] hover:text-[#003A78] transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              <span className="text-xs">Prerequisites ({course.prerequisites.length})</span>
            </button>
          )}
        </div>

        {/* hiển thị thông báo nếu môn học không có sẵn */}
        {!course.isAvailable && !course.needsRetake && (
          <div className="flex items-center gap-1 text-orange-600">
            <XCircle className="w-4 h-4" />
            <span className="text-xs">Prerequisites not met</span>
          </div>
        )}
      </div>
    </div>
  );
}
