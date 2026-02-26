import { useState } from 'react';
import { TrendingUp, Award, Target } from 'lucide-react';
import { ACADEMIC_RULES } from '../config/academic';

interface CourseGrade {
  id: string;
  code: string;
  name: string;
  credits: number;
  currentGrade: number;
  projectedGrade: number;
}

export function GPASimulator() {
  const [courses, setCourses] = useState<CourseGrade[]>([] as CourseGrade[]);
  const [currentGPA] = useState(ACADEMIC_RULES.DEFAULT_SIMULATOR_GPA);

  const handleGradeChange = (id: string, value: string) => {
    setCourses(courses.map(course =>
      course.id === id ? { ...course, projectedGrade: parseFloat(value) || 0 } : course
    ));
  };

  const calculateProjectedGPA = () => {
    const validCourses = courses.filter(c =>
      !ACADEMIC_RULES.EXCLUDED_COURSE_PREFIXES.some(prefix => c.code.startsWith(prefix))
    );
    const totalPoints = validCourses.reduce((sum, course) => sum + (course.projectedGrade * course.credits), 0);
    const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const projectedGPA = calculateProjectedGPA();
  const distinctionTarget = ACADEMIC_RULES.GPA_TARGETS.DISTINCTION;
  const veryGoodTarget = ACADEMIC_RULES.GPA_TARGETS.VERY_GOOD;

  const getGradePointsNeeded = (targetGPA: number) => {
    const validCourses = courses.filter(c =>
      !ACADEMIC_RULES.EXCLUDED_COURSE_PREFIXES.some(prefix => c.code.startsWith(prefix))
    );
    const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0);
    const neededPoints = targetGPA * totalCredits;
    const currentPoints = validCourses.reduce((sum, course) => sum + (course.projectedGrade * course.credits), 0);
    return neededPoints - currentPoints;
  };

  const gradeToLetter = (gradePoint: number) => {
    if (gradePoint >= 4.0) return 'A';
    if (gradePoint >= 3.5) return 'B+';
    if (gradePoint >= 3.0) return 'B';
    if (gradePoint >= 2.5) return 'C+';
    if (gradePoint >= 2.0) return 'C';
    if (gradePoint >= 1.5) return 'D+';
    if (gradePoint >= 1.0) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* GPA Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current GPA */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Current GPA</p>
              <p className="text-2xl text-gray-900">{currentGPA.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Projected GPA */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#004A98] flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Projected GPA</p>
              <p className="text-2xl text-[#004A98]">{projectedGPA.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Based on projected grades</p>
          </div>
        </div>

        {/* Achievement Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${projectedGPA >= distinctionTarget ? 'bg-green-100' : 'bg-orange-100'
              }`}>
              <Award className={`w-5 h-5 ${projectedGPA >= distinctionTarget ? 'text-green-600' : 'text-orange-600'
                }`} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Achievement</p>
              <p className="text-gray-900">
                {projectedGPA >= distinctionTarget ? 'Distinction' :
                  projectedGPA >= veryGoodTarget ? 'Very Good' : 'Good'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distinction Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900">Distinction Target (3.60)</h3>
            {projectedGPA >= distinctionTarget && (
              <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Achieved
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${projectedGPA >= distinctionTarget ? 'bg-green-500' : 'bg-[#004A98]'
                }`}
              style={{ width: `${Math.min((projectedGPA / distinctionTarget) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {projectedGPA >= distinctionTarget
              ? `You're on track! ${(projectedGPA - distinctionTarget).toFixed(2)} points above target`
              : `Need ${Math.abs(getGradePointsNeeded(distinctionTarget)).toFixed(2)} more grade points`
            }
          </p>
        </div>

        {/* Very Good Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900">Very Good Target (3.20)</h3>
            {projectedGPA >= veryGoodTarget && (
              <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Achieved
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${projectedGPA >= veryGoodTarget ? 'bg-green-500' : 'bg-[#004A98]'
                }`}
              style={{ width: `${Math.min((projectedGPA / veryGoodTarget) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {projectedGPA >= veryGoodTarget
              ? `You're on track! ${(projectedGPA - veryGoodTarget).toFixed(2)} points above target`
              : `Need ${Math.abs(getGradePointsNeeded(veryGoodTarget)).toFixed(2)} more grade points`
            }
          </p>
        </div>
      </div>

      {/* Grade Input Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-gray-900">Projected Grades for Next Semester</h3>
          <p className="text-gray-600 text-sm mt-1">Input your expected grades to simulate your GPA</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Course Code
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                  Projected Grade
                </th>
                <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                  Letter Grade
                </th>
                <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                  Grade Points
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {course.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {course.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    {course.credits}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={course.projectedGrade}
                      onChange={(e) => handleGradeChange(course.id, e.target.value)}
                      className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                    >
                      <option value="4.0">4.0</option>
                      <option value="3.5">3.5</option>
                      <option value="3.0">3.0</option>
                      <option value="2.5">2.5</option>
                      <option value="2.0">2.0</option>
                      <option value="1.5">1.5</option>
                      <option value="1.0">1.0</option>
                      <option value="0.0">0.0</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className={`px-2.5 py-1 rounded-lg ${course.projectedGrade >= 4.0 ? 'bg-green-100 text-green-700' :
                      course.projectedGrade >= 3.0 ? 'bg-blue-100 text-blue-700' :
                        course.projectedGrade >= 2.0 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {gradeToLetter(course.projectedGrade)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    {(course.projectedGrade * course.credits).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-sm text-gray-900">
                  <strong>Total</strong>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <strong>{courses.filter(c =>
                    !ACADEMIC_RULES.EXCLUDED_COURSE_PREFIXES.some(prefix => c.code.startsWith(prefix))
                  ).reduce((sum, c) => sum + c.credits, 0)}</strong>
                </td>
                <td colSpan={2} className="px-6 py-4 text-sm text-center text-gray-900">
                  <strong>Projected GPA</strong>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <strong className="text-[#004A98]">{projectedGPA.toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
