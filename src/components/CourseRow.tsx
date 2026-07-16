import { useState } from 'react';
import { Info, GitBranch, ChevronUp, Clock, FileText, CalendarRange, Users } from 'lucide-react';
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
  enrollment?: ClassEnrollment;
}

interface EnrollmentSnapshot {
  capacity: number | null;
  enrolled: number | null;
  remaining?: number | null;
  rawCapacity?: string;
  rawEnrolled?: string;
}

interface ClassEnrollment {
  theory: EnrollmentSnapshot;
  practical: EnrollmentSnapshot | null;
  exercise: EnrollmentSnapshot | null;
}

interface RawSubClass {
  Nhom?: string;
  SiSo?: string;
  DaDK?: string;
}

interface RawOpenClass {
  id?: string;
  className?: string;
  capacity?: string;
  enrolled?: string;
  practicalClasses?: RawSubClass[];
  exerciseClasses?: RawSubClass[];
}

function parsePortalCount(value: unknown): number | null {
  const match = String(value ?? '').match(/-?\d+/);
  if (!match) return null;
  const count = Number.parseInt(match[0], 10);
  return Number.isFinite(count) ? count : null;
}

function makeEnrollment(capacityValue: unknown, enrolledValue: unknown): EnrollmentSnapshot {
  const capacity = parsePortalCount(capacityValue);
  const enrolled = parsePortalCount(enrolledValue);
  return {
    capacity,
    enrolled,
    remaining: capacity !== null && enrolled !== null ? Math.max(0, capacity - enrolled) : null,
    rawCapacity: String(capacityValue ?? '').trim(),
    rawEnrolled: String(enrolledValue ?? '').trim(),
  };
}

function normalizeGroup(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, '').toLocaleUpperCase('vi-VN');
}

function getClassPart(classId: string, part: 'TH' | 'BT'): string {
  const match = classId.match(new RegExp(`_${part}_(.*?)(?:_(?:TH|BT)_|$)`));
  return match?.[1] ?? '';
}

function buildLegacyEnrollment(classId: string, rows: RawOpenClass[]): ClassEnrollment | undefined {
  const baseClassId = classId.split(/_(?:TH|BT)_/)[0];
  const classRows = rows.filter(row => (
    String(row.className ?? '').trim().toLocaleUpperCase('vi-VN') === baseClassId.toLocaleUpperCase('vi-VN')
  ));
  if (classRows.length === 0) return undefined;

  const theoryRow = classRows.find(row => row.capacity || row.enrolled) ?? classRows[0];
  const practicalGroup = normalizeGroup(getClassPart(classId, 'TH'));
  const exerciseGroup = normalizeGroup(getClassPart(classId, 'BT'));
  const practical = classRows
    .flatMap(row => Array.isArray(row.practicalClasses) ? row.practicalClasses : [])
    .find(item => normalizeGroup(item.Nhom) === practicalGroup);
  const exercise = classRows
    .flatMap(row => Array.isArray(row.exerciseClasses) ? row.exerciseClasses : [])
    .find(item => normalizeGroup(item.Nhom) === exerciseGroup);

  const enrollment: ClassEnrollment = {
    theory: makeEnrollment(theoryRow.capacity, theoryRow.enrolled),
    practical: practical ? makeEnrollment(practical.SiSo, practical.DaDK) : null,
    exercise: exercise ? makeEnrollment(exercise.SiSo, exercise.DaDK) : null,
  };
  const hasCounts = Object.values(enrollment).some(item => item && (item.capacity !== null || item.enrolled !== null));
  return hasCounts ? enrollment : undefined;
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

  const statusConfig = course.needsRetake
    ? {
          label: "Cần học lại",
          barClass: "bg-red-500",
          textClass: "text-red-700",
      }
    : course.isAvailable
        ? {
              label: "Sẵn sàng",
              barClass: "bg-emerald-500",
              textClass: "text-emerald-700",
          }
        : {
              label: "Chưa đủ điều kiện",
              barClass: "bg-gray-300",
              textClass: "text-gray-500",
          };

  useEffect(() => {
    if (!showDescription) return;
    const courseDb = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, [] as any[]);
    const normalizedCourseCode = course.code.toLocaleUpperCase('vi-VN');
    const courseData = courseDb.find((c: any) => String(c.id ?? '').trim().toLocaleUpperCase('vi-VN') === normalizedCourseCode);
    const rawStudentDb = readFromStorage<{ courses?: RawOpenClass[] }>(STORAGE_KEYS.RAW_STUDENT_DB, {});
    const sourceRows: RawOpenClass[] = Array.isArray(courseData?.source?.portalRows)
      ? courseData.source.portalRows
      : (rawStudentDb.courses ?? []).filter(row => String(row.id ?? '').trim().toLocaleUpperCase('vi-VN') === normalizedCourseCode);

    if (courseData && courseData.classes) {
      setAvailableClasses(courseData.classes.map((courseClass: CourseSchedule) => ({
        ...courseClass,
        enrollment: courseClass.enrollment ?? buildLegacyEnrollment(courseClass.id, sourceRows),
      })));
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
          <span className="px-1 md:px-2 py-0.5 md:py-1 text-gray-700 text-[10px] md:text-xs rounded font-medium whitespace-nowrap">
            {course.credits} TC
          </span>
        </div>

        {/* Status Badge */}
        <div className="hidden w-32 flex-shrink-0 md:block">
            <div className="flex items-center gap-2">
                <span
                    className={`h-4 w-1 rounded-full ${statusConfig.barClass}`}
                />
                <span
                    className={`text-xs font-medium ${statusConfig.textClass}`}
                >
                    {statusConfig.label}
                </span>
            </div>
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
      {showDescription && (
        <div className="ml-6 mr-6 overflow-hidden rounded-b-lg border-x border-b border-gray-200 bg-white md:ml-1 md:mr-1">
          <div className="space-y-4 px-4 py-4 text-sm md:px-5">
            {/* Mobile status */}
            <div className="border-b border-gray-200 pb-3 md:hidden">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Trạng thái đăng ký
              </p>

              <div className="flex items-center gap-2">
                <span className={`h-4 w-1 rounded-full ${statusConfig.barClass}`} />
                <span className={`text-xs font-medium ${statusConfig.textClass}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Description */}
            {course.descriptionVi && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Mô tả môn học
                  </p>
                </div>

                <p className="text-sm leading-6 text-gray-700">
                  {course.descriptionVi}
                </p>
              </div>
            )}

            {/* Main info */}
            <div
              className="grid gap-x-6 gap-y-4 border-t border-gray-200 pt-4 md:grid-cols-3"
            >
              {/* Fee */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  Học phí dự kiến
                </p>

                <p className="mt-1 text-base font-bold text-[#004A98]">
                  {course.price
                    ? `${new Intl.NumberFormat("vi-VN").format(course.price)} đ`
                    : "Chưa có thông tin"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {course.credits} tín chỉ
                </p>
              </div>

              {/* Hours */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    Thời lượng học
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Lý thuyết</span>
                    <span className="font-semibold text-gray-900">
                      {course.theory_hours ?? 0} tiết
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Thực hành</span>
                    <span className="font-semibold text-gray-900">
                      {course.lab_hours ?? 0} tiết
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Bài tập</span>
                    <span className="font-semibold text-gray-900">
                      {course.exercise_hours ?? 0} tiết
                    </span>
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              {course.prerequisites.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-amber-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Môn tiên quyết
                    </p>
                  </div>

                  <div className="space-y-2">
                    {course.prerequisites.map((prereqId) => {
                      const meta = allCoursesMeta.find(
                        (item) => item.course_id === prereqId
                      );

                      return (
                        <div
                          key={prereqId}
                          className="border-l-2 border-amber-400 pl-3"
                        >
                          <p className="text-xs font-semibold text-gray-900">
                            {prereqId}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-gray-500">
                            {meta?.course_name_vi || "Không tìm thấy thông tin"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Available classes */}
            {availableClasses.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-[#004A98]" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Lớp học đang mở
                    </p>
                  </div>

                  <span className="text-[10px] font-medium text-gray-500">
                    Học kỳ hiện tại
                  </span>
                </div>

                <div className="grid grid-cols-1 overflow-hidden rounded-md border border-gray-200 md:grid-cols-2">
                  {[...availableClasses]
                    .sort((a, b) => a.id.localeCompare(b.id))
                    .map((cls) => {
                      const enrollmentRows = [
                        { label: 'Lý thuyết', value: cls.enrollment?.theory },
                        { label: 'Thực hành', value: cls.enrollment?.practical },
                        { label: 'Bài tập', value: cls.enrollment?.exercise },
                      ].filter((item): item is { label: string; value: EnrollmentSnapshot } => (
                        Boolean(item.value && (item.value.capacity !== null || item.value.enrolled !== null))
                      ));

                      return (
                        <div
                          key={cls.id}
                          className="border-b border-gray-200 px-3 py-3 hover:bg-gray-50 md:odd:border-r"
                        >
                          <p className="text-xs font-semibold text-gray-900">
                            {cls.id.replace(/_/g, " ")}
                          </p>

                          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                            {cls.schedule.map((time, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium text-gray-600"
                              >
                                {time}
                              </span>
                            ))}
                          </div>

                          {enrollmentRows.length > 0 && (
                            <div className="mt-2.5 border-t border-gray-100 pt-2">
                              <div className="mb-1 grid grid-cols-[minmax(0,1fr)_52px_72px] items-center gap-2 text-[10px] font-medium text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Thành phần
                                </span>
                                <span className="text-right">Sĩ số</span>
                                <span className="text-right">Đã đăng ký</span>
                              </div>
                              <div className="divide-y divide-gray-100">
                                {enrollmentRows.map(({ label, value }) => (
                                  <div
                                    key={label}
                                    className="grid grid-cols-[minmax(0,1fr)_52px_72px] items-center gap-2 py-1 text-[11px]"
                                  >
                                    <span className="truncate text-gray-500">{label}</span>
                                    <span className="text-right font-semibold tabular-nums text-gray-800">
                                      {value.capacity ?? '-'}
                                    </span>
                                    <span className="text-right font-semibold tabular-nums text-[#004A98]">
                                      {value.enrolled ?? '-'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div >
  );
}
