import { useState } from 'react';
import { Info, GitBranch, ChevronDown, ChevronUp } from 'lucide-react';
import type { Course } from '../data/courseData';

interface CourseRowProps {
  course: Course;
  isSelected: boolean;
  onToggle: (courseId: string) => void;
  onShowFlowchart: (course: Course) => void;
}

export function CourseRow({ course, isSelected, onToggle, onShowFlowchart }: CourseRowProps) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="group">
      <div
        className={`flex items-center gap-3 px-4 py-2.5 border rounded-lg transition-all ${course.needsRetake
            ? 'border-red-200 bg-red-50 hover:bg-red-100'
            : isSelected
              ? 'border-[#004A98] bg-blue-50 shadow-sm'
              : course.isAvailable
                ? 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                : 'border-gray-200 bg-gray-50 opacity-60'
          }`}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(course.id)}
          disabled={!course.isAvailable && !course.needsRetake}
          className="w-4 h-4 text-[#004A98] border-gray-300 rounded focus:ring-[#004A98] cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Course Code */}
        <div className="w-24 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-900">{course.code}</p>
        </div>

        {/* Course Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate font-medium">{course.nameVi}</p>
        </div>

        {/* Credits */}
        <div className="w-16 flex-shrink-0 text-center">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
            {course.credits} TC
          </span>
        </div>

        {/* Status Badge */}
        <div className="w-32 flex-shrink-0">
          {course.needsRetake ? (
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium inline-block">
              Cần học lại
            </span>
          ) : course.isAvailable ? (
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium inline-block">
              Sẵn sàng
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium inline-block">
              Chưa đủ điều kiện
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Xem chi tiết"
          >
            {showDescription ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <Info className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => onShowFlowchart(course)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Sơ đồ môn tiên quyết"
          >
            <GitBranch className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Description Dropdown */}
      {showDescription && (
        <div className="mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg ml-11">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Mô tả môn học</p>
              <p className="text-gray-900">{course.descriptionVi}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Giảng viên</p>
                <p className="text-gray-900">{course.instructor}</p>
              </div>
              {course.prerequisites.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Môn tiên quyết</p>
                  <p className="text-gray-900">{course.prerequisites.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}