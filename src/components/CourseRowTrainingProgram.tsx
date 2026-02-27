import { useState } from 'react';
import { ChevronUp, ChevronDown, CheckCircle2, Clock, XCircle } from 'lucide-react';

export function CourseRowTrainingProgram({
  course,
  status = 'none',
  rootStatus = 'none'
}: {
  course: {
    course_id: string;
    course_name_vi: string;
    credits: number;
    theory_hours: number;
    lab_hours: number;
    exercise_hours: number;
    course_type: string;
    category: string;
    description: string;
  },
  status?: 'passed' | 'studying' | 'failed' | 'none',
  rootStatus?: 'passed' | 'none'
}) {
  const [showDescription, setShowDescription] = useState(false);

  // Background and border colors based on status
  const getContainerStyle = () => {
    switch (status) {
      case 'passed':
        return 'border-green-200 bg-green-50/50 hover:bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'studying':
        return 'border-blue-200 bg-blue-50/50 hover:bg-blue-50';
      default:
        return 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300';
    }
  };

  // Status Badge Component
  const renderStatusBadge = () => {
    switch (status) {
      case 'passed':
        return (
          <span className="flex items-center justify-center gap-1 w-full px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã tích lũy</span>
          </span>
        );
      case 'studying':
        return (
          <span className="flex items-center justify-center gap-1 w-full px-2 py-1 bg-blue-100 text-[#004A98] text-xs rounded-full font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang học</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center justify-center gap-1 w-full px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
            <XCircle className="w-3.5 h-3.5" />
            <span>Học lại</span>
          </span>
        );
      default:
        return (
          rootStatus === 'passed' ? (
            <span className="flex items-center justify-center gap-1 w-full px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              Hoàn thành
            </span>
          ) : (
            <span className="block w-full text-center px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
              Chưa học
            </span>
          )
        );
    }
  };


  return (
    <div className="group">
      <div
        className={rootStatus === 'passed' ? `bg-blue-50 shadow-sm flex items-center gap-3 px-4 py-2.5 border rounded-lg transition-all cursor-pointer` : `flex items-center gap-3 px-4 py-2.5 border rounded-lg transition-all cursor-pointer ${getContainerStyle()}`}
        onClick={() => setShowDescription(!showDescription)}
      >
        {/* Course Code */}
        <div className="w-24 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-900">{course.course_id}</p>
        </div>

        {/* Course Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate font-medium">{course.course_name_vi}</p>
        </div>

        {/* Credits */}
        <div className="w-16 flex-shrink-0 text-center">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
            {course.credits} TC
          </span>
        </div>

        {/* Type Badge */}
        <div className="w-10 flex-shrink-0">
          {course.course_type === 'BB' ? (
            <span className="px-1 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium inline-block truncate w-full text-center">
              {course.course_type}
            </span>
          ) : course.course_type === 'TC' ? (
            <span className="px-1 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium inline-block truncate w-full text-center">
              {course.course_type}
            </span>
          ) : (
            <span className="px-1 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs rounded-md font-medium inline-block truncate w-full text-center" title={course.course_type}>
              {course.course_type}
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="w-28 flex-shrink-0">
          {renderStatusBadge()}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            className="p-1.5 hover:bg-gray-200/60 rounded transition-colors"
            title="Xem chi tiết"
          >
            {showDescription ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Description Dropdown */}
      {showDescription && (
        <div className="mt-2 px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg ml-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300"></div>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium flex items-center gap-1">
                  Lý thuyết
                </p>
                <p className="text-gray-900 font-semibold">{course.theory_hours} tiết</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium flex items-center gap-1">
                  Thực hành
                </p>
                <p className="text-gray-900 font-semibold">{course.lab_hours} tiết</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium flex items-center gap-1">
                  Bài tập
                </p>
                <p className="text-gray-900 font-semibold">{course.exercise_hours} tiết</p>
              </div>
            </div>
            {course.description && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Ghi chú từ CTĐT</p>
                <p className="text-gray-800 leading-relaxed">{course.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}