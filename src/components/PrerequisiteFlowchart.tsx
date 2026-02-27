import { type Course } from '../types';
import { X, ArrowRight, CheckCircle } from 'lucide-react';

interface PrerequisiteFlowchartProps {
  course: Course;
  allCourses: Course[];
  onClose: () => void;
}

export function PrerequisiteFlowchart({ course, allCourses, onClose }: PrerequisiteFlowchartProps) {

  // Build prerequisite tree recursively
  const buildPrerequisiteTree = (courseId: string, level = 0): any => {
    const c = allCourses.find(course => course.id === courseId);
    if (!c) return null;

    return {
      course: c,
      level,
      prerequisites: c.prerequisites.map(preReqId => buildPrerequisiteTree(preReqId, level + 1)).filter(Boolean),
    };
  };

  const tree = buildPrerequisiteTree(course.id);

  // Render tree node
  const renderNode = (node: any, isRoot = false) => {
    if (!node) return null;

    return (
      <div className="flex flex-col items-center">
        <div
          className={`px-4 py-3 rounded-lg border-2 min-w-[200px] ${isRoot
            ? 'bg-[#004A98] text-white border-[#004A98]'
            : node.course.isAvailable
              ? 'bg-green-50 border-green-300 text-gray-900'
              : 'bg-gray-100 border-gray-300 text-gray-900'
            }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm ${isRoot ? 'text-white' : 'text-gray-600'}`}>
              {node.course.code}
            </span>
            {node.course.isAvailable && !isRoot && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
          </div>
          <p className={`text-sm ${isRoot ? 'text-white' : 'text-gray-900'}`}>
            {node.course.name}
          </p>
          <p className={`text-xs mt-1 ${isRoot ? 'text-blue-200' : 'text-gray-500'}`}>
            {node.course.credits} credits
          </p>
        </div>

        {node.prerequisites.length > 0 && (
          <>
            <div className="flex items-center justify-center my-3">
              <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
            </div>
            <div className="flex gap-4">
              {node.prerequisites.map((preReq: any, index: number) => (
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
            <h3 className="text-gray-900 mb-1">Prerequisite Flowchart</h3>
            <p className="text-gray-600 text-sm">
              Course dependency tree for {course.code} - {course.name}
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
          {course.prerequisites.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-gray-900 mb-2">No Prerequisites Required</h4>
              <p className="text-gray-600">This course has no prerequisite requirements.</p>
            </div>
          ) : (
            <div className="flex justify-center">
              {renderNode(tree, true)}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Legend:</p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#004A98]"></div>
              <span className="text-sm text-gray-700">Current Course</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-300"></div>
              <span className="text-sm text-gray-700">Completed / Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
              <span className="text-sm text-gray-700">Not Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
