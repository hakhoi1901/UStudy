import { useState } from 'react';
import { ChevronUp, ChevronDown, CheckCircle2, Clock, XCircle, GitBranch, ExternalLink } from 'lucide-react';
import { courseLinks } from '../assets/data/courseLinks';
import { DocumentContributionModal } from './DocumentContributionModal';

// định nghĩa props cho CourseRowTrainingProgram
interface CourseRowTrainingProgramProps {
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
  };
  status?: 'passed' | 'studying' | 'failed' | 'none';
  rootStatus?: 'passed' | 'none';
  onShowFlowchart?: (courseId: string) => void;
}

/**
 * 
 * @param course môn học
 * @param status trạng thái môn học
 * @param rootStatus trạng thái môn học gốc
 * @param onShowFlowchart hàm hiển thị flowchart
 * @returns trả về component CourseRowTrainingProgram hiển thị thông tin môn học
 */
export function CourseRowTrainingProgram({
  course,
  status = 'none',
  rootStatus = 'none',
  onShowFlowchart
}: {
  course: {
    course_id: string;    // mã môn học
    course_name_vi: string; // tên môn học
    credits: number;        // số tín chỉ
    theory_hours: number;   // số tiết lý thuyết
    lab_hours: number;      // số tiết thực hành
    exercise_hours: number; // số tiết bài tập
    course_type: string;    // loại môn học
    category: string;       // danh mục môn học
    description: string;    // mô tả môn học
  };
  status?: 'passed' | 'studying' | 'failed' | 'none';
  rootStatus?: 'passed' | 'none';
  onShowFlowchart?: (courseId: string) => void;
}) {
  const [showDescription, setShowDescription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // hàm trả về màu nền và màu viền dựa trên trạng thái môn học
  const getContainerStyle = () => {
    if (status === 'passed' || rootStatus === 'passed') {
      return 'border-green-300 bg-green-50/80 hover:bg-green-100 shadow-sm';
    }
    switch (status) {
      case 'failed':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'studying':
        return 'border-blue-200 bg-blue-50/50 hover:bg-blue-50';
      default:
        return 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300';
    }
  };

  // component hiển thị trạng thái môn học
  const renderStatusBadge = () => {
    switch (status) {
      case 'passed':
        return (
          <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
            <span className="hidden md:inline">Đã tích lũy</span>
            <span className="md:hidden">Đạt</span>
          </span>
        );
      case 'studying':
        return (
          <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-blue-100 text-[#004A98] text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
            <span className="hidden md:inline">Đang học</span>
            <span className="md:hidden">Đang học</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-red-100 text-red-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
            <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
            <span className="hidden md:inline">Học lại</span>
            <span className="md:hidden">Học lại</span>
          </span>
        );
      default:
        return (
          rootStatus === 'passed' ? (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
              <span className="hidden md:inline">Hoàn thành</span>
              <span className="md:hidden">Xong</span>
            </span>
          ) : (
            <span className="block w-full text-center px-1 md:px-2 py-0.5 md:py-1 bg-gray-100 text-gray-500 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
              <span className="hidden md:inline">Chưa học</span>
              <span className="md:hidden">Chưa</span>
            </span>
          )
        );
    }
  };


  return (
    <div className="group">
      <div
        className={`flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-2 md:py-2.5 border rounded-lg transition-all cursor-pointer ${getContainerStyle()}`}
        onClick={() => setShowDescription(!showDescription)}
      >
        {/* Course Code & Name (Stack on mobile, row on desktop) */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
          {/* Course Code */}
          <div className="md:w-24 flex-shrink-0">
            <p className="text-[11px] md:text-sm font-semibold text-gray-900 leading-tight md:leading-normal">{course.course_id}</p>
          </div>
          {/* Course Name */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-sm text-gray-500 md:text-gray-900 truncate font-medium md:font-medium leading-tight md:leading-normal">{course.course_name_vi}</p>
          </div>
        </div>

        {/* Credits */}
        <div className="hidden md:block w-16 flex-shrink-0 text-center">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium whitespace-nowrap">
            {course.credits} TC
          </span>
        </div>

        {/* Type Badge */}
        <div className="hidden md:block w-10 flex-shrink-0">
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
        <div className="hidden md:block w-28 flex-shrink-0">
          {renderStatusBadge()}
        </div>

        {/* Actions */}
        <div className="flex items-center md:gap-1 flex-shrink-0">
          <button
            className="p-1 md:p-1.5 hover:bg-gray-200/60 rounded transition-colors"
            title="Xem chi tiết"
          >
            {showDescription ? (
              <ChevronUp className="w-4 h-4 md:w-4 md:h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 md:w-4 md:h-4 text-gray-600" />
            )}
          </button>
          {onShowFlowchart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowFlowchart(course.course_id);
              }}
              className="p-1 md:p-1.5 hover:bg-gray-200/60 rounded transition-colors"
              title="Sơ đồ môn tiên quyết"
            >
              <GitBranch className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Description Dropdown */}
      {showDescription && (
        <div className="mt-2 px-2 md:px-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-lg ml-0 md:ml-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300"></div>
          <div className="space-y-4 text-sm">
            
            {/* Mobile-only info: Tín chỉ, Loại, Trạng thái (vì đã bị ẩn ở ngoài) */}
            <div className="grid md:hidden grid-cols-3 gap-2 p-2 border-b border-gray-200 pb-3">
              <div>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide font-medium">
                  Tín chỉ
                </p>
                <p className="text-gray-900 font-semibold text-xs">{course.credits} TC</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide font-medium">
                  Loại môn
                </p>
                <p className="text-gray-900 font-semibold text-xs">{course.course_type}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide font-medium">
                  Trạng thái
                </p>
                <div className="w-max -ml-1">
                  {renderStatusBadge()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-6 p-2">
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
              <div className="pt-3 border-t p-2 border-gray-200">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Ghi chú từ CTĐT</p>
                <p className="text-gray-800 leading-relaxed">{course.description}</p>
              </div>
            )}
            {/* Document Link */}
            {(courseLinks[course.course_id] || true) && (
              <div className="pt-3 border-t border-gray-200 p-2">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Tài liệu tham khảo</p>
                <div className="flex flex-wrap items-center gap-3 p-2">
                  {courseLinks[course.course_id] ? (
                    <a
                      href={courseLinks[course.course_id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[#004A98] hover:text-[#003d7a] rounded-lg transition-colors text-sm font-medium shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Mở thư mục Drive tài liệu
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Chưa có tài liệu cho môn học này.</span>
                  )}

                  {/* Nút đóng góp tài liệu */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-green-600 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium shadow-sm"
                    title="Đóng góp tài liệu, đề thi, bài tập cho môn này"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Đóng góp tài liệu
                  </button>
                </div>
              </div>
            )}

            {/* Modal */}
            <DocumentContributionModal
              courseId={course.course_id}
              courseName={course.course_name_vi}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}