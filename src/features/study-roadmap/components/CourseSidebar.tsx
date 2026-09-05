import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Lock, Search, X, Circle, CheckCircle2, AlertTriangle, Check, Sparkles, Shuffle } from 'lucide-react';
import { readFromStorage } from '../../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../../config';
import type { Course } from '../../../types';
import type { RegisteredCourse } from '../../../logic/scheduler/RegistrationResolver';
import type { DraftSelection, ScheduleConflict } from '../types/schedule-builder-types';

// ─── Helpers ────────────────────────────────────────────────────────────────

interface ClassInfo {
  id: string;
  schedule?: string[];
}

function formatScheduleStrings(schedule?: string[]): string {
  if (!schedule || schedule.length === 0) return 'Chưa có lịch';
  return schedule.join(' · ');
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface CourseSidebarProps {
  selectedCourseIds: Set<string>;
  allCourses: Course[];
  registeredCourses: RegisteredCourse[];
  allowedClassesMap: Record<string, string[]>;
  selections: DraftSelection[];
  conflicts: ScheduleConflict[];
  focusedCourseCode: string | null;
  onSelectClass: (courseCode: string, classId: string) => void;
  onRemoveSelection: (courseCode: string) => void;
  onToggleAllowedClass: (courseCode: string, classId: string, classIds: string[]) => void;
  // Summary props (merged into sidebar)
  unfilledCount: number;
  totalCredits: number;
  onHybridSolve: () => void;
  solvingHybrid: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CourseSidebar({
  selectedCourseIds,
  allCourses,
  registeredCourses,
  allowedClassesMap,
  selections,
  conflicts,
  focusedCourseCode,
  onSelectClass,
  onRemoveSelection,
  onToggleAllowedClass,
  unfilledCount,
  totalCredits,
  onHybridSolve,
  solvingHybrid,
}: CourseSidebarProps) {
  const [search, setSearch] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [courseClasses, setCourseClasses] = useState<Record<string, ClassInfo[]>>({});
  const courseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load class data from course_db_offline
  useEffect(() => {
    const courseDb = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);
    const classMap: Record<string, ClassInfo[]> = {};
    for (const selectedId of selectedCourseIds) {
      const course = allCourses.find(
        c => c.id === selectedId || c.code === selectedId
      );

      if (!course) continue;

      const courseCode = course.code;

      const courseData = courseDb.find(
        (c: any) =>
          c.id === courseCode ||
          c.code === courseCode
      );

      if (courseData?.classes) {
        classMap[courseCode] = courseData.classes.map(
          (cls: any) => ({
            id: cls.id,
            schedule: cls.schedule,
          })
        );
      }
    }
    setCourseClasses(classMap);
  }, [selectedCourseIds, allCourses]);

  // Auto-expand and scroll when focusedCourseCode changes
  useEffect(() => {
    if (!focusedCourseCode) return;
    setExpandedCourses(prev => {
      const next = new Set(prev);
      next.add(focusedCourseCode);
      return next;
    });
    requestAnimationFrame(() => {
      courseRefs.current[focusedCourseCode]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [focusedCourseCode]);

  const selectedCourses = useMemo(() => {
    return Array.from(selectedCourseIds)
      .map(id => allCourses.find(c => c.id === id || c.code === id))
      .filter((c): c is Course => !!c);
  }, [selectedCourseIds, allCourses]);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return selectedCourses;
    const q = search.toLowerCase();
    return selectedCourses.filter(
      c => c.nameVi.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    );
  }, [selectedCourses, search]);

  const registeredCourseGroups = useMemo(() => {
    return registeredCourses
      .map((course) => ({
        courseCode: course.courseCode,
        courseName: course.courseName || course.courseCode,
        classLabels: Array.from(new Set(
          course.components.map((component) => component.classGroup).filter(Boolean),
        )),
        scheduleLabels: Array.from(new Set(
          course.components.map((component) => component.schedule).filter(Boolean),
        )),
      }))
      .sort((a, b) => a.courseCode.localeCompare(b.courseCode));
  }, [registeredCourses]);

  const toggleExpand = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const getSelectionForCourse = (courseCode: string) =>
    selections.find(s => s.courseCode === courseCode);

  const getCourseConflicts = (courseCode: string) =>
    conflicts.filter(c => c.involvedCourses.includes(courseCode));

  const lockedCount = selections.filter(s => s.locked).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── Search ── */}
      <div className="flex-shrink-0 border-b border-gray-100 px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm môn..."
            className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-8 text-xs outline-none transition-colors focus:border-[#004A98] focus:bg-white focus:ring-1 focus:ring-[#004A98]/20"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Course list ── */}
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {registeredCourseGroups.length > 0 && (
          <section className="border-b border-gray-200 bg-blue-50/35 px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#004A98]">Trường đã đăng ký</span>
              <span className="text-[10px] font-medium text-gray-500">{registeredCourseGroups.length} môn</span>
            </div>
            <div className="divide-y divide-blue-100/80 rounded-lg border border-blue-100 bg-white">
              {registeredCourseGroups.map((course) => (
                <div key={course.courseCode} className="px-2.5 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#004A98]">{course.courseCode}</span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-800">{course.courseName}</span>
                    <Lock className="h-3.5 w-3.5 shrink-0 text-[#004A98]" aria-label="Lớp đã được trường đăng ký" />
                  </div>
                  <p className="mt-1 truncate text-[10px] text-gray-500">
                    {course.classLabels.join(' / ') || 'Chưa có lớp'} · {course.scheduleLabels.join(' · ') || 'Chưa có lịch học'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedCourses.length > 0 && (
          <div className="border-b border-gray-100 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            Môn đăng ký thêm từ lớp mở
          </div>
        )}
        {selectedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <Circle className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              {registeredCourseGroups.length > 0 ? 'Chưa chọn môn đăng ký thêm' : 'Chưa chọn môn nào'}
            </p>
            <p className="mt-1 text-xs text-gray-400">Chọn môn từ danh sách lớp mở trước</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCourses.map(course => {
              const courseCode = course.code;
              const isExpanded = expandedCourses.has(courseCode);
              const selection = getSelectionForCourse(courseCode);
              const courseConflicts = getCourseConflicts(courseCode);
              const classes = courseClasses[courseCode] ?? [];
              const allowedClassIds = allowedClassesMap[courseCode] ?? classes.map((item) => item.id);
              const isFocused = focusedCourseCode === courseCode;

              return (
                <div
                  key={courseCode}
                  ref={el => { courseRefs.current[courseCode] = el; }}
                  className={`transition-colors ${isFocused ? 'bg-blue-50/60' : ''}`}
                >
                  {/* Course header */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(courseCode)}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                  >
                    {isExpanded
                      ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#004A98]">{course.code}</span>
                        <span className="text-[10px] text-gray-400">{course.credits} TC</span>
                        {selection?.locked && <Lock className="h-3 w-3 text-[#004A98]" />}
                      </div>
                      <p className="mt-0.5 truncate text-xs font-medium text-gray-800">{course.nameVi}</p>
                      {selection && !selection.locked && selection.source === 'solver' && selection.preferredClassId && selection.classId !== selection.preferredClassId && (
                        <div className="mt-1.5 flex items-start gap-1 rounded bg-amber-50 px-1.5 py-1 text-[10px] text-amber-700 border border-amber-100">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-[1px]" />
                          <span className="leading-tight">
                            Ưu tiên <strong>{selection.preferredClassId}</strong> → Đã đổi <strong>{selection.classId}</strong> để tạo lịch hợp lệ.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="shrink-0 relative group">
                      {selection ? (
                        selection.locked ? (
                          <>
                            <Lock className="h-4 w-4 text-[#004A98]" />
                            <div className="absolute right-0 top-full mt-1 hidden w-48 rounded-md bg-gray-800 px-2 py-1.5 text-xs text-white group-hover:block z-50">
                              <p className="font-semibold text-blue-300">Bắt buộc</p>
                              <p className="mt-0.5 text-gray-300">Solver không được thay đổi lớp này.</p>
                            </div>
                          </>
                        ) : selection.source === 'manual' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-[#004A98]" />
                            <div className="absolute right-0 top-full mt-1 hidden w-48 rounded-md bg-gray-800 px-2 py-1.5 text-xs text-white group-hover:block z-50">
                              <p className="font-semibold text-blue-300">Ưu tiên</p>
                              <p className="mt-0.5 text-gray-300">Solver sẽ cố giữ lớp này và chỉ thay nếu cần để tạo lịch hợp lệ.</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Shuffle className="h-4 w-4 text-gray-400" />
                            <div className="absolute right-0 top-full mt-1 hidden w-48 rounded-md bg-gray-800 px-2 py-1.5 text-xs text-white group-hover:block z-50">
                              <p className="font-semibold text-gray-200">Tự động</p>
                              <p className="mt-0.5 text-gray-300">Lớp do hệ thống chọn và có thể được tối ưu lại.</p>
                            </div>
                          </>
                        )
                      ) : (
                        <>
                          <Circle className="h-4 w-4 text-gray-300" />
                          <div className="absolute right-0 top-full mt-1 hidden w-48 rounded-md bg-gray-800 px-2 py-1.5 text-xs text-white group-hover:block z-50">
                            <p className="font-semibold text-gray-300">Chưa xếp</p>
                            <p className="mt-0.5 text-gray-400">Chưa có lớp được chọn.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Expanded: class list */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-3 pb-2 pt-1">
                      {classes.length === 0 ? (
                        <p className="py-2 text-center text-[10px] text-gray-400">Không có dữ liệu lớp</p>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between px-1 py-1 text-[10px] text-gray-500">
                            <span>{allowedClassIds.length}/{classes.length} lớp được xét</span>
                            {allowedClassIds.length === 0 && <span className="font-medium text-red-600">Chưa có lớp khả dụng</span>}
                          </div>
                          {[...classes].sort((a, b) => a.id.localeCompare(b.id)).map(cls => {
                            const isSelected = selection?.classId === cls.id;
                            const isAllowed = allowedClassIds.includes(cls.id);
                            const isLockedClass = isSelected && selection?.locked;
                            const isDimmedByLockedClass = Boolean(selection?.locked) && !isLockedClass;

                            return (
                              <div
                                key={cls.id}
                                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all ${isLockedClass
                                  ? 'border-[#003A78] bg-white ring-1 ring-[#004A98]/45 shadow-sm shadow-blue-100'
                                  : !isAllowed ? 'border-gray-200 bg-gray-50 opacity-55'
                                    : isDimmedByLockedClass ? 'border-gray-200 bg-white opacity-55 hover:border-gray-300 hover:opacity-80'
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isAllowed) return;
                                    if (isLockedClass) onRemoveSelection(courseCode);
                                    else onSelectClass(courseCode, cls.id);
                                  }}
                                  disabled={!isAllowed}
                                  className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-not-allowed"
                                  aria-label={isLockedClass ? `Bỏ khóa lớp ${cls.id}` : `Khóa lớp ${cls.id} để bắt buộc xếp lịch`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-xs font-semibold ${isLockedClass ? 'text-[#004A98]' : 'text-gray-700'}`}>{cls.id.replace(/_/g, ' ')}</p>
                                    <p className="mt-0.5 truncate text-[10px] text-gray-500">{formatScheduleStrings(cls.schedule)}</p>
                                  </div>
                                </button>

                                {isLockedClass && <Lock className="h-4 w-4 shrink-0 text-[#004A98]" aria-label="Lớp bắt buộc" />}

                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  onChange={() => {
                                    onToggleAllowedClass(courseCode, cls.id, classes.map((item) => item.id));
                                    if (isAllowed && isLockedClass) onRemoveSelection(courseCode);
                                  }}
                                  className="order-first h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-gray-300 text-[#004A98] focus:ring-[#004A98] md:h-3.5 md:w-3.5"
                                  aria-label={isAllowed ? `Loại ${cls.id} khỏi xếp lịch` : `Cho phép ${cls.id} được xếp lịch`}
                                  title={isAllowed ? 'Loại khỏi xếp lịch' : 'Cho phép xếp lịch'}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Hybrid solve CTA (bottom) ── */}
      <div className="flex-shrink-0 border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={onHybridSolve}
          disabled={solvingHybrid}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#004A98] to-[#0066CC] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
        >
          {solvingHybrid ? 'Đang tạo lịch mới...' : 'Hoàn thiện lịch giúp tôi'}
        </button>
        <p className="mt-1.5 text-center text-[10px] text-gray-400">
          {lockedCount > 0
            ? unfilledCount > 0
              ? `Giữ ${lockedCount} lớp đã khóa, xếp ${unfilledCount} môn còn lại`
              : `Giữ ${lockedCount} lớp đã khóa, tạo phương án mới theo lựa chọn hiện tại`
            : unfilledCount > 0
              ? `Xếp tự động ${unfilledCount} môn chưa chọn lớp`
              : 'Tạo phương án mới theo các lớp đang được xét'}
        </p>
      </div>
    </div>
  );
}
