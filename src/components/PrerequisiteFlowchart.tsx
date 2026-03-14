import { type Course } from '../types';
import { X, ArrowRight, CheckCircle } from 'lucide-react';
import { useDepartmentData } from '../context/DepartmentContext';

// định nghĩa props cho PrerequisiteFlowchart
interface PrerequisiteFlowchartProps {
  course: Course;
  allCourses: Course[];
  onClose: () => void;
}

// định nghĩa cấu trúc cây
interface TreeNode {
  id: string;
  name: string;
  credits: number;
  level: number;
  isAvailable: boolean;
  prerequisites: TreeNode[];
}

/**
 * 
 * @param course - môn học
 * @param allCourses - tất cả các môn học
 * @param onClose - đóng modal
 * @returns hiển thị sơ đồ môn tiên quyết
 */
export function PrerequisiteFlowchart({ course, allCourses, onClose }: PrerequisiteFlowchartProps) {
  const { data: { courses: allCoursesMeta, prerequisites: prereqData } } = useDepartmentData();

  // xây dựng cây môn tiên quyết sử dụng dữ liệu môn tiên quyết đầy đủ từ DepartmentContext
  const buildPrerequisiteTree = (courseId: string, level = 0, visited = new Set<string>()): TreeNode | null => {
    // ngăn chặn đệ quy vô hạn
    if (visited.has(courseId)) return null;
    visited.add(courseId);

    // tìm kiếm thông tin môn học: đầu tiên thử allCourses (mapped Course[]), sau đó quay lại dữ liệu thô
    const mappedCourse = allCourses.find(c => c.id === courseId);
    const metaCourse = allCoursesMeta.find(m => m.course_id === courseId);

    const name = mappedCourse?.nameVi || metaCourse?.course_name_vi || courseId;
    const credits = mappedCourse?.credits || metaCourse?.credits || 0;
    const isAvailable = mappedCourse?.isAvailable ?? false;

    // tìm kiếm ID môn tiên quyết từ dữ liệu môn tiên quyết
    const prereqIds = prereqData
      .filter(p => p.course_id === courseId)
      .map(p => p.prereq_id)
      .filter(id => typeof id === 'string' && id.trim().length > 0 && !id.includes(' '));

    const childNodes = prereqIds
      .map(pid => buildPrerequisiteTree(pid, level + 1, new Set(visited)))
      .filter(Boolean) as TreeNode[];

    return {
      id: courseId,
      name,
      credits,
      level,
      isAvailable,
      prerequisites: childNodes,
    };
  };

  const tree = buildPrerequisiteTree(course.id);

  // render cây môn tiên quyết
  const renderNode = (node: TreeNode, isRoot = false) => {
    if (!node) return null;

    return (
      <div className="flex flex-col items-center">
        <div
          className={`px-4 py-3 rounded-lg border-2 min-w-[200px] ${isRoot
            ? 'bg-[#004A98] text-white border-[#004A98]'
            : node.isAvailable
              ? 'bg-green-50 border-green-300 text-gray-900'
              : 'bg-gray-100 border-gray-300 text-gray-900'
            }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm ${isRoot ? 'text-white' : 'text-gray-600'}`}>
              {node.id}
            </span>
            {node.isAvailable && !isRoot && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
          </div>
          <p className={`text-sm ${isRoot ? 'text-white' : 'text-gray-900'}`}>
            {node.name}
          </p>
          <p className={`text-xs mt-1 ${isRoot ? 'text-blue-200' : 'text-gray-500'}`}>
            {node.credits} tín chỉ
          </p>
        </div>

        {node.prerequisites.length > 0 && (
          <>
            <div className="flex items-center justify-center my-3">
              <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
            </div>
            <div className="flex gap-4">
              {node.prerequisites.map((preReq, index) => (
                <div key={index} className="relative">
                  {renderNode(preReq)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900 mb-1">Sơ đồ môn tiên quyết</h3>
            <p className="text-gray-600 text-sm">
              Chuỗi môn tiên quyết của {course.code} - {course.nameVi}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Flowchart Content */}
        <div className="flex-1 overflow-auto p-8">
          {!tree || tree.prerequisites.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-gray-900 mb-2">Không có môn tiên quyết</h4>
              <p className="text-gray-600">Môn học này không yêu cầu môn tiên quyết.</p>
            </div>
          ) : (
            <div className="flex justify-center">
              {tree && renderNode(tree, true)}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Chú thích:</p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#004A98]"></div>
              <span className="text-sm text-gray-700">Môn đang xem</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-300"></div>
              <span className="text-sm text-gray-700">Đã hoàn thành / Sẵn sàng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
              <span className="text-sm text-gray-700">Chưa hoàn thành</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
