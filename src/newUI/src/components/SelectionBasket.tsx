import { type Course } from '../data/courseData';
import { ShoppingCart, X, TrendingUp } from 'lucide-react';

interface SelectionBasketProps {
  selectedCourses: Course[];
  onRemoveCourse: (courseId: string) => void;
}

export function SelectionBasket({ selectedCourses, onRemoveCourse }: SelectionBasketProps) {
  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);
  const creditCost = 750000; // VND per credit
  const estimatedTuition = totalCredits * creditCost;
  const labFees = selectedCourses.length * 200000; // 200k per course
  const totalCost = estimatedTuition + labFees;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-0 bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#004A98] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Selection Basket</h3>
              <p className="text-gray-500 text-sm">{selectedCourses.length} courses selected</p>
            </div>
          </div>
        </div>

        {/* Selected Courses List */}
        <div className="max-h-96 overflow-y-auto p-4">
          {selectedCourses.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No courses selected yet</p>
              <p className="text-gray-400 text-xs mt-1">Check courses to add them here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm truncate">{course.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-600 text-xs">{course.code}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-[#004A98] text-xs">{course.credits} credits</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveCourse(course.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {selectedCourses.length > 0 && (
          <div className="p-5 border-t border-gray-200 space-y-4">
            {/* Credits Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Total Credits</span>
                <span className="text-gray-900">{totalCredits}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#004A98] to-[#0066CC] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalCredits / 24) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">/ 24 max</span>
              </div>
              {totalCredits > 24 && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Exceeds recommended limit</span>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tuition ({totalCredits} credits)</span>
                <span className="text-gray-900">{formatCurrency(estimatedTuition)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lab Fees</span>
                <span className="text-gray-900">{formatCurrency(labFees)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900">Estimated Total</span>
                <span className="text-[#004A98]">{formatCurrency(totalCost)}</span>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full py-2.5 bg-[#004A98] text-white rounded-lg hover:bg-[#003A78] transition-colors">
              Confirm Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
