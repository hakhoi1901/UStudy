import { useState } from 'react';
import { Info, GitBranch, ChevronUp, Clock, FileText, CalendarRange } from 'lucide-react';
import type { Course } from '../types';
import { useDepartmentData } from '../context/DepartmentContext';
import { useEffect } from 'react';
import { STORAGE_KEYS } from '../config';
import { readFromStorage } from '../helpers/localStorage/save';

// định nghĩa props cho CourseRow
interface CourseRowProps {
  course: Course;
  isSelected: boolean;
  onToggle: (courseId: string) => void;
  onShowFlowchart: (course: Course) => void;
}

// định nghĩa interface CourseSchedule
export interface CourseSchedule {
  id: string;
  schedule: string[];
}

/**
 * 
 * @param course môn học
 * @param isSelected trạng thái được chọn
 * @param onToggle hàm toggle chọn môn học
 * @param onShowFlowchart hàm hiển thị flowchart
 * @returns trả về component CourseRow hiển thị thông tin môn học ở trang
 * 
 * render component CourseRow
 */
export function CourseRow({ course, isSelected, onToggle, onShowFlowchart }: CourseRowProps) {
  const [showDescription, setShowDescription] = useState(false);
  const { data: { courses: allCoursesMeta } } = useDepartmentData();

  const [availableClasses, setAvailableClasses] = useState<CourseSchedule[]>([]);

  useEffect(() => {
    if (!showDescription) return;
    const courseDb = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, [] as any[]);
    const courseData = courseDb.find((c: any) => c.id === course.code);

    if (courseData && courseData.classes) {
      setAvailableClasses(courseData.classes);
    } else {
      setAvailableClasses([]);
    }
  }, [showDescription, course.code]);


  return (
    <div className="group">
      <div
        onClick={() => setShowDescription(!showDescription)}
        className={`flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-2 md:py-2.5 border rounded-lg transition-all ${course.needsRetake
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
          onClick={(e) => e.stopPropagation()}
          disabled={!course.isAvailable && !course.needsRetake}
          className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#004A98] border-gray-300 rounded focus:ring-[#004A98] cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
        />

        {/* Course Code & Name (Stack on mobile, row on desktop) */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
          {/* Course Code */}
          <div className="md:w-24 flex-shrink-0">
            <p className="text-[11px] md:text-sm font-semibold text-gray-900 leading-tight md:leading-normal">{course.code}</p>
          </div>
          {/* Course Name */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-sm text-gray-500 md:text-gray-900 truncate font-medium md:font-medium leading-tight md:leading-normal">{course.nameVi}</p>
          </div>
        </div>

        {/* Credits */}
        <div className="w-10 md:w-16 flex-shrink-0 text-center">
          <span className="px-1 md:px-2 py-0.5 md:py-1 bg-gray-100 text-gray-700 text-[10px] md:text-xs rounded font-medium whitespace-nowrap">
            {course.credits} TC
          </span>
        </div>

        {/* Status Badge */}
        <div className="hidden md:block w-32 flex-shrink-0">
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
        <div className="flex items-center md:gap-1 flex-shrink-0">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="p-1 md:p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Xem chi tiết"
          >
            {showDescription ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <Info className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={(e) => {
              onShowFlowchart(course);
              e.stopPropagation();
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Sơ đồ môn tiên quyết"
          >
            <GitBranch className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Description Dropdown */}
      {
        showDescription && (
          <div className="mt-2 px-3 md:px-5 py-3 md:py-4 bg-white border border-blue-100 shadow-sm rounded-xl ml-6 md:ml-11 relative overflow-hidden transition-all duration-300 origin-top animate-in fade-in slide-in-from-top-2">
            {/* A slight accent line on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>

            <div className="space-y-4 md:space-y-5 text-sm">
              
              {/* Mobile-only info: Trạng thái (vì đã bị ẩn ở ngoài) */}
              <div className="md:hidden border-b border-gray-100 pb-2 mb-2">
                <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wide font-medium">
                  Trạng thái đăng ký
                </p>
                <div>
                  {course.needsRetake ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] rounded-full font-semibold">
                      Cần học lại
                    </span>
                  ) : course.isAvailable ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-full font-semibold">
                      Sẵn sàng đăng ký
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] rounded-full font-semibold">
                      Chưa đủ điều kiện (Thiếu tiên quyết)
                    </span>
                  )}
                </div>
              </div>

              {/* Description Section */}
              {course.descriptionVi && (
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 mb-1.5 uppercase tracking-wide">
                    <FileText className="w-4 h-4" /> Mô tả môn học
                  </p>
                  <p className="text-gray-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-50 opacity-90">
                    {course.descriptionVi}
                  </p>
                </div>
              )}

              <div className={`grid grid-cols-1 gap-3 md:gap-4 ${course.prerequisites.length > 0 ? `md:grid-cols-3` : `md:grid-cols-2`}`}>
                {/* Fee Section */}
                <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-100 hover:bg-blue-100/80 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-center shadow-sm cursor-default">
                  <p className="text-[10px] md:text-[11px] font-semibold text-gray-500 p-0.5 mb-1 md:mb-1.5 uppercase tracking-wider">Học phí (Dự kiến)</p>
                  <p className="text-gray-900 font-bold text-base md:text-lg text-[#004A98] p-0.5">
                    {course.price ? new Intl.NumberFormat('vi-VN').format(course.price) + ' đ' : 'Chưa có thông tin'}
                  </p>
                  <p className="text-[10px] md:text-[11px] font-semibold text-gray-500 p-0.5 mb-1 md:mb-1.5 uppercase tracking-wider">{course.credits} Tín chỉ / {course ? ((course.exercise_hours ? course.exercise_hours : 0) + (course.lab_hours ? course.lab_hours : 0) + (course.theory_hours ? course.theory_hours : 0)) / 15 : 0} Tín chỉ HP</p>
                  <p className="text-[9px] md:text-[10px] font-semibold text-gray-500 p-0.5 mb-0.5 md:mb-1.5 uppercase tracking-wider">{Intl.NumberFormat('vi-VN').format((course.price ? course.price : 0) / (course ? ((course.exercise_hours ? course.exercise_hours : 0) + (course.lab_hours ? course.lab_hours : 0) + (course.theory_hours ? course.theory_hours : 0)) / 15 : 0))}</p>
                </div>

                {/* Hours Section */}
                <div className="bg-emerald-50 p-3 md:p-4 rounded-lg border border-emerald-100 hover:bg-emerald-100/80 hover:border-emerald-300 hover:shadow-md transition-all duration-200 shadow-sm cursor-default">
                  <p className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-semibold text-gray-500 mb-2 md:mb-3 uppercase tracking-wider">
                    <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-600" /> Thời lượng học
                  </p>
                  <div className="text-gray-700 space-y-1.5 md:space-y-2 text-[11px] md:text-xs">
                    <div className="flex justify-between items-center border-b border-gray-200/60 pb-1.5"><span>Lý thuyết:</span> <span className="font-semibold bg-white border border-gray-200 px-1.5 md:px-2 py-0.5 rounded shadow-sm text-gray-800">{course.theory_hours ?? 0} tiết</span></div>
                    <div className="flex justify-between items-center border-b border-gray-200/60 pb-1.5"><span>Thực hành:</span> <span className="font-semibold bg-white border border-gray-200 px-1.5 md:px-2 py-0.5 rounded shadow-sm text-gray-800">{course.lab_hours ?? 0} tiết</span></div>
                    <div className="flex justify-between items-center pt-0.5"><span>Bài tập:</span> <span className="font-semibold bg-white border border-gray-200 px-1.5 md:px-2 py-0.5 rounded shadow-sm text-gray-800">{course.exercise_hours ?? 0} tiết</span></div>
                  </div>
                </div>

                {/* Prereq Section */}
                {course.prerequisites.length > 0 && (
                  <div className="bg-orange-50 p-3 md:p-4 rounded-lg border border-orange-100 shadow-sm hover:bg-orange-150 hover:border-orange-250 hover:shadow-md transition-all duration-200 md:col-span-1 flex flex-col cursor-default">
                    <p className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-orange-800 mb-2 md:mb-3 uppercase tracking-wider">
                      <GitBranch className="w-3 h-3 md:w-3.5 md:h-3.5" /> Môn tiên quyết
                    </p>
                    <div className="text-orange-900 space-y-1.5 md:space-y-2 text-xs flex-1 overflow-y-auto max-h-[120px] pr-1">
                      {course.prerequisites.map(prereqId => {
                        const meta = allCoursesMeta.find(m => m.course_id === prereqId);
                        return (
                          <div key={prereqId} className="flex flex-col bg-white/70 p-2 rounded border border-orange-200/60 shadow-sm">
                            <span className="font-bold text-orange-700 mb-0.5">{prereqId}</span>
                            <span className="text-[11px] line-clamp-1 opacity-90">{meta?.course_name_vi || 'Không tìm thấy thông tin'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Available Classes Section */}
              {availableClasses.length > 0 && (
                <div className="pt-4 md:pt-5 border-t border-gray-100 p-1 md:p-2">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <p className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs font-semibold text-gray-800 uppercase tracking-wide">
                      <CalendarRange className="w-3.5 h-3.5 md:w-4 h-4 text-[#004A98]" />
                      Lớp học đang mở
                    </p>
                    <span className="text-[9px] md:text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full font-semibold shrink-0">Lấy từ Học kỳ hiện tại</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                    {availableClasses.sort((a, b) => a.id.localeCompare(b.id)).map((cls) => (
                      <div key={cls.id} className="flex flex-col p-2.5 md:p-3.5 bg-gray-50 border border-gray-200 shadow-sm rounded-xl hover:bg-white hover:border-blue-400 hover:shadow transition-all duration-200 group/class cursor-default">
                        <span className="font-bold text-gray-800 group-hover/class:text-[#004A98] transition-colors mb-1.5 md:mb-2 text-[11px] md:text-[13px] truncate">{cls.id.replace(/_/g, ' ')}</span>
                        <div className="flex flex-wrap gap-1 md:gap-1.5 mt-auto">
                          {cls.schedule.map((time, idx) => (
                            <span key={idx} className="px-1.5 md:px-2 py-0.5 md:py-1 bg-white shadow-sm border border-gray-200 text-gray-700 group-hover/class:border-blue-200 group-hover/class:bg-blue-50 group-hover/class:text-blue-700 transition-colors text-[9px] md:text-[10px] rounded block font-medium tracking-wide">
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
}