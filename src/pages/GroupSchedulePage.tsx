import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Link2, Moon, Plus, Settings, Sun, Trash2, Users, X, Zap } from 'lucide-react';

import { GroupMemberCard } from '../components/GroupMemberCard';
import { GroupScheduleResult } from '../components/GroupScheduleResult';
import { GroupURLShare } from '../components/GroupURLShare';
import { SelectionBasket } from '../components/SelectionBasket';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { buildDensityMap, decodeGroupURL } from '../logic/scheduler/GroupScheduler';
import type { GroupMemberToken, GroupScheduleOption } from '../logic/scheduler/GroupTypes';
import { parseCourseInput, useGroupScheduler } from '../hooks/useGroupScheduler';
import { readFromStorage, saveToStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS } from '../config';
import type { Course } from '../types';
import type { SolverPreferences } from '../hooks/useScheduleSolver';
import courseDbJson from '../logic/scheduler/Course_db.json';

type GroupPageState = 'create' | 'join' | 'member' | 'ready' | 'result';

const defaultSolverPreferences: SolverPreferences = {
  daysOff: [],
  session: '0',
  strategy: 'compress',
  noGaps: false,
};

interface GroupSchedulePageProps {
  onPageChange?: (page: string) => void;
  selectedCourseIds?: Set<string>;
  allCourses?: Course[];
  allowedClassesMap?: Record<string, string[]>;
  setAllowedClassesMap?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  onRemoveSelectedCourse?: (courseId: string) => void;
  embedded?: boolean;
}

interface GroupClassOption {
  id: string;
  schedule: string[];
}

function makeDraft(): GroupMemberToken {
  return {
    nickname: '',
    sharedCourses: [],
    personalCourses: [],
    busyMask: [],
  };
}

function extractHash(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    return new URL(trimmed).hash;
  } catch {
    const hashIndex = trimmed.indexOf('#');
    return hashIndex >= 0 ? trimmed.slice(hashIndex) : trimmed;
  }
}

function getCourseCode(course: Course): string {
  return (course.code || course.id).toUpperCase();
}

function normalizeCourseId(value: unknown): string {
  return String(value || '').trim().toUpperCase();
}

function normalizeSchedule(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  const text = String(value || '').trim();
  return text ? [text] : [];
}

function loadClassOptionsByCourse(): Record<string, GroupClassOption[]> {
  const stored = readFromStorage<any[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);
  const rawCourses = stored.length > 0 ? stored : (courseDbJson as any[]);

  return rawCourses.reduce<Record<string, GroupClassOption[]>>((acc, course) => {
    const courseId = normalizeCourseId(course?.id || course?.code || course?.course_id);
    if (!courseId || !Array.isArray(course?.classes)) return acc;

    const seen = new Set<string>();
    acc[courseId] = course.classes
      .map((cls: any) => ({
        id: String(cls?.id || cls?.classId || cls?.className || '').trim(),
        schedule: normalizeSchedule(cls?.schedule),
      }))
      .filter((cls: GroupClassOption) => {
        if (!cls.id || seen.has(cls.id)) return false;
        seen.add(cls.id);
        return true;
      })
      .sort((a: GroupClassOption, b: GroupClassOption) => a.id.localeCompare(b.id));

    return acc;
  }, {});
}

export function GroupSchedulePage({
  onPageChange,
  selectedCourseIds,
  allCourses = [],
  allowedClassesMap = {},
  setAllowedClassesMap,
  onRemoveSelectedCourse,
  embedded = false,
}: GroupSchedulePageProps) {
  const {
    members,
    shareUrl,
    urlWarning,
    decodeError,
    solving,
    result,
    solveError,
    availableCourses,
    setMembersFromURL,
    addMember,
    replaceMembers,
    solve,
    clearResult,
    getOptionRegistrations,
  } = useGroupScheduler();

  const [draft, setDraft] = useState<GroupMemberToken>(makeDraft);
  const [manualCourseInput, setManualCourseInput] = useState('');
  const [mergeInput, setMergeInput] = useState('');
  const [localNotice, setLocalNotice] = useState<string | null>(null);
  const [groupPreferredClasses, setGroupPreferredClasses] = useState<Record<string, string[]>>({});
  const [groupPrefs, setGroupPrefs] = useState<SolverPreferences>(() => readFromStorage<SolverPreferences>(STORAGE_KEYS.SOLVER_PREFERENCES, defaultSolverPreferences));
  const [expandedClassCourseId, setExpandedClassCourseId] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => setMembersFromURL(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [setMembersFromURL]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SOLVER_PREFERENCES, groupPrefs);
  }, [groupPrefs]);

  const pageState = useMemo<GroupPageState>(() => {
    if (result?.solutions.length) return 'result';
    if (members.length >= 2) return 'ready';
    if (members.length === 1) return 'member';
    if (window.location.hash) return 'join';
    return 'create';
  }, [members.length, result]);

  const knownCourseIds = useMemo(() => new Set(availableCourses.map((course) => course.id)), [availableCourses]);
  const basketCourses = useMemo(() => {
    if (!selectedCourseIds || selectedCourseIds.size === 0) return [];
    return allCourses.filter((course) => selectedCourseIds.has(course.id) || selectedCourseIds.has(course.code));
  }, [allCourses, selectedCourseIds]);
  const draftCourseIds = useMemo(() => {
    if (basketCourses.length > 0) {
      return Array.from(new Set(basketCourses.map(getCourseCode)));
    }
    return parseCourseInput(manualCourseInput);
  }, [basketCourses, manualCourseInput]);
  const groupCourses = useMemo(() => buildDensityMap(members), [members]);
  const classOptionsByCourse = useMemo(() => loadClassOptionsByCourse(), []);

  const submitDraft = () => {
    const nextDraft: GroupMemberToken = {
      ...draft,
      sharedCourses: [],
      personalCourses: draftCourseIds,
      busyMask: [],
      preferredClasses: Object.fromEntries(
        draftCourseIds
          .map((courseId) => [courseId, allowedClassesMap[courseId] ?? []])
          .filter(([, classIds]) => Array.isArray(classIds) && classIds.length > 0),
      ),
      personalConfig: readFromStorage<SolverPreferences>(STORAGE_KEYS.SOLVER_PREFERENCES, defaultSolverPreferences),
    };

    const unknownCourses = draftCourseIds.filter((course) => knownCourseIds.size > 0 && !knownCourseIds.has(course));
    setLocalNotice(unknownCourses.length > 0 ? `Các môn chưa có trong dữ liệu lớp học: ${unknownCourses.join(', ')}.` : null);

    if (addMember(nextDraft)) {
      setDraft(makeDraft());
      setManualCourseInput('');
    }
  };

  const mergeMembersFromLink = () => {
    try {
      const decoded = decodeGroupURL(extractHash(mergeInput));
      const existingKeys = new Set(members.map((member) => JSON.stringify({
        courses: [...member.sharedCourses, ...member.personalCourses].sort(),
        busyMask: member.busyMask,
      })));
      const merged = [...members];
      decoded.forEach((member) => {
        const key = JSON.stringify({
          courses: [...member.sharedCourses, ...member.personalCourses].sort(),
          busyMask: member.busyMask,
        });
        if (!existingKeys.has(key)) {
          existingKeys.add(key);
          merged.push(member);
        }
      });
      replaceMembers(merged);
      setMergeInput('');
      setLocalNotice(`Đã gộp ${merged.length - members.length} thành viên từ link.`);
    } catch (error) {
      setLocalNotice(error instanceof Error ? error.message : 'Không đọc được link nhóm.');
    }
  };

  const removeMember = (index: number) => {
    replaceMembers(members.filter((_, memberIndex) => memberIndex !== index));
    clearResult();
  };

  const toggleGroupClassPreference = (courseId: string, classId: string) => {
    setGroupPreferredClasses((current) => {
      const selected = new Set(current[courseId] ?? []);
      if (selected.has(classId)) {
        selected.delete(classId);
      } else {
        selected.add(classId);
      }

      const nextSelected = Array.from(selected).sort((a, b) => a.localeCompare(b));
      if (nextSelected.length === 0) {
        const { [courseId]: _removed, ...rest } = current;
        return rest;
      }

      return { ...current, [courseId]: nextSelected };
    });
  };

  const clearGroupClassPreference = (courseId: string) => {
    setGroupPreferredClasses((current) => {
      const { [courseId]: _removed, ...rest } = current;
      return rest;
    });
  };

  const handleUseSchedule = (option: GroupScheduleOption, memberIndex: number) => {
    const registrations = getOptionRegistrations(option, memberIndex);
    saveToStorage(STORAGE_KEYS.SAVED_SCHEDULES, {
      activeGroupSchedule: {
        source: 'group-scheduler',
        updatedAt: new Date().toISOString(),
        registrations,
      },
    });
    onPageChange?.('schedule');
  };

  return (
    <div className={embedded ? 'space-y-6 pb-20 md:pb-4' : 'mx-auto max-w-6xl space-y-6 pb-20 md:pb-4'}>
      {!embedded && (
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Xếp lịch nhóm</h1>
            <p className="mt-1 text-sm text-gray-600">Tạo link, gộp link từng người, hoặc nhập nhiều thành viên trên cùng máy.</p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            Trạng thái: <span className="font-medium text-[#004A98]">{pageState}</span>
          </div>
        </div>
      )}

      {decodeError && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{decodeError} Nếu link không hoạt động, hãy copy toàn bộ URL vào trình duyệt.</span>
        </div>
      )}

      {(solveError || localNotice) && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{solveError || localNotice}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#004A98]" />
              <h2 className="text-lg font-semibold text-gray-900">Thêm thành viên</h2>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsConfigOpen(true)}>
              <Settings className="h-4 w-4" />
              Cấu hình
            </Button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nickname</label>
            <Input
              value={draft.nickname || ''}
              onChange={(event) => setDraft((current) => ({ ...current, nickname: event.target.value }))}
              placeholder="Bạn A"
            />
          </div>

          {basketCourses.length > 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div>
                <SelectionBasket
                  compact
                  title="Môn của thành viên này"
                  description={`${basketCourses.length} môn lấy từ giỏ hiện tại`}
                  selectedCourses={basketCourses}
                  onRemoveCourse={onRemoveSelectedCourse}
                  allowedClassesMap={allowedClassesMap}
                  setAllowedClassesMap={setAllowedClassesMap}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Môn trùng giữa các thành viên sẽ được ưu tiên xếp cùng lớp. Nếu không có nghiệm, hệ thống mới thử tách lớp. Các lớp đã lọc trong giỏ môn được lưu như ưu tiên cá nhân.
              </p>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Môn đăng ký</label>
              <Textarea
                value={manualCourseInput}
                onChange={(event) => setManualCourseInput(event.target.value)}
                placeholder="CSC10001, MTH00003, PHY00001"
                className="min-h-28"
              />
            </div>
          )}

          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">{draftCourseIds.length} môn trong form hiện tại</div>
            <Button type="button" onClick={submitDraft} className="bg-[#004A98] hover:bg-[#003d7a]">
              <Plus className="h-4 w-4" />
              {members.length === 0 ? 'Tạo link nhóm' : 'Tham gia nhóm'}
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Gộp từ link nhóm khác</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={mergeInput} onChange={(event) => setMergeInput(event.target.value)} placeholder="Dán URL hoặc #v1_..." />
              <Button type="button" variant="outline" onClick={mergeMembersFromLink}>
                <Link2 className="h-4 w-4" />
                Gộp link
              </Button>
            </div>
          </div>

          <GroupURLShare url={shareUrl} warning={urlWarning} />
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Thành viên</h2>
              <span className="text-sm text-gray-500">{members.length}</span>
            </div>
            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">Chưa có thành viên nào.</div>
              ) : (
                members.map((member, index) => (
                  <div key={`${member.nickname || 'member'}-${index}`} className="space-y-2">
                    <GroupMemberCard member={member} index={index} />
                    <Button type="button" size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => removeMember(index)}>
                      <Trash2 className="h-4 w-4" />
                      Xóa thành viên
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={members.length < 2 || solving} onClick={() => solve({ ...groupPrefs, groupPreferredClasses })}>
            {solving ? 'Đang xếp lịch...' : 'Xếp lịch cho nhóm'}
          </Button>
        </aside>
      </div>

      {members.length >= 2 && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Cấu hình nhóm trước khi xếp lịch</h2>
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Buổi ưu tiên của nhóm</label>
              <div className="flex rounded-xl bg-gray-100 p-1">
                {[
                  { id: '0', label: 'Tự do', icon: Zap },
                  { id: '1', label: 'Sáng', icon: Sun },
                  { id: '2', label: 'Chiều', icon: Moon },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGroupPrefs((current) => ({ ...current, session: item.id }))}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all ${groupPrefs.session === item.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Chiến thuật dồn lịch nhóm</label>
              <div className="flex rounded-xl bg-gray-100 p-1">
                {[
                  { id: 'compress', label: 'Dồn lịch' },
                  { id: 'spread', label: 'Trải đều' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGroupPrefs((current) => ({ ...current, strategy: item.id }))}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${groupPrefs.strategy === item.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Tiết trống nhóm</label>
              <button
                type="button"
                onClick={() => setGroupPrefs((current) => ({ ...current, noGaps: !current.noGaps }))}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${groupPrefs.noGaps ? 'border-blue-200 bg-blue-50 text-[#004A98]' : 'border-gray-200 bg-white text-gray-600'}`}
              >
                {groupPrefs.noGaps ? 'Hạn chế tối đa tiết trống' : 'Cho phép tiết trống'}
              </button>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Ngày nhóm muốn nghỉ</label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const isOff = groupPrefs.daysOff?.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setGroupPrefs((current) => {
                        const daysOff = current.daysOff || [];
                        return {
                          ...current,
                          daysOff: daysOff.includes(day) ? daysOff.filter((item) => item !== day) : [...daysOff, day],
                        };
                      })}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-bold transition-all ${isOff ? 'border-red-500 bg-red-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-400 hover:border-red-300'}`}
                    >
                      {day === 6 ? 'CN' : `T${day + 2}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {groupCourses.map((course) => (
              <div key={course.courseId} className="grid gap-3 rounded-md border border-gray-200 p-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <div className="font-mono text-sm font-semibold text-gray-900">{course.courseId}</div>
                  <div className="text-xs text-gray-500">
                    Cùng đăng ký: {course.subscribers.map((memberIndex) => members[memberIndex]?.nickname || `Thành viên ${memberIndex + 1}`).join(', ')}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-600">
                      {(groupPreferredClasses[course.courseId] ?? []).length > 0
                        ? `${(groupPreferredClasses[course.courseId] ?? []).length} lớp đang được ưu tiên`
                        : 'Chưa chọn lớp ưu tiên'}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedClassCourseId((current) => current === course.courseId ? null : course.courseId)}
                      disabled={(classOptionsByCourse[course.courseId] ?? []).length === 0}
                    >
                      {expandedClassCourseId === course.courseId ? 'Ẩn lớp' : 'Chọn lớp ưu tiên'}
                    </Button>
                  </div>

                  {expandedClassCourseId === course.courseId && (
                    <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 pr-1">
                  {(classOptionsByCourse[course.courseId] ?? []).length === 0 ? (
                    <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">
                      Chưa có dữ liệu lớp cho môn này.
                    </div>
                  ) : (
                    (classOptionsByCourse[course.courseId] ?? []).map((classOption) => {
                      const isSelected = (groupPreferredClasses[course.courseId] ?? []).includes(classOption.id);

                      return (
                        <button
                          key={classOption.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleGroupClassPreference(course.courseId, classOption.id)}
                          className={`flex w-full items-start gap-2 rounded-lg border p-2 text-left transition-colors ${isSelected ? 'border-[#004A98] bg-blue-50 text-blue-950' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/50'}`}
                        >
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isSelected ? 'border-[#004A98] bg-[#004A98] text-white' : 'border-gray-300 bg-white text-transparent'}`}>
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-mono text-sm font-semibold">{classOption.id.replace(/_/g, ' ')}</span>
                            <span className={`mt-1 block text-xs leading-relaxed ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                              {classOption.schedule.length > 0 ? classOption.schedule.join(', ') : 'Chưa có lịch học'}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  )}
                  {(groupPreferredClasses[course.courseId] ?? []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => clearGroupClassPreference(course.courseId)}
                      className="text-xs font-medium text-gray-500 hover:text-red-600"
                    >
                      Bỏ ưu tiên lớp
                    </button>
                  )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-xl">
            <div className="flex items-center justify-between bg-[#004A98] p-4 text-white">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h3 className="text-sm font-semibold md:text-base">Cấu hình thuật toán cá nhân</h3>
              </div>
              <button type="button" onClick={() => setIsConfigOpen(false)} className="rounded-lg p-1.5 transition-colors hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid max-h-[70vh] grid-cols-1 gap-5 overflow-y-auto p-4 md:gap-8 md:p-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 md:mb-3">Buổi ưu tiên của nhóm</label>
                <div className="flex rounded-xl bg-gray-100 p-1">
                  {[
                    { id: '0', label: 'Tự do', icon: Zap },
                    { id: '1', label: 'Sáng', icon: Sun },
                    { id: '2', label: 'Chiều', icon: Moon },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGroupPrefs((current) => ({ ...current, session: item.id }))}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all md:text-sm ${groupPrefs.session === item.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500'}`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 md:mb-3">Chiến thuật dồn lịch nhóm</label>
                <div className="flex rounded-xl bg-gray-100 p-1">
                  {[
                    { id: 'compress', label: 'Dồn lịch' },
                    { id: 'spread', label: 'Trải đều' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGroupPrefs((current) => ({ ...current, strategy: item.id }))}
                      className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all md:text-sm ${groupPrefs.strategy === item.id ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 md:mb-3">Tiết trống nhóm</label>
                <button
                  type="button"
                  onClick={() => setGroupPrefs((current) => ({ ...current, noGaps: !current.noGaps }))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-xs font-medium transition-all md:text-sm ${groupPrefs.noGaps ? 'border-blue-200 bg-blue-50 text-[#004A98]' : 'border-gray-200 bg-white text-gray-600'}`}
                >
                  {groupPrefs.noGaps ? 'Hạn chế tối đa tiết trống' : 'Cho phép tiết trống'}
                </button>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 md:mb-3">Ngày nhóm muốn nghỉ</label>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const isOff = groupPrefs.daysOff?.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setGroupPrefs((current) => {
                          const daysOff = current.daysOff || [];
                          return {
                            ...current,
                            daysOff: daysOff.includes(day) ? daysOff.filter((item) => item !== day) : [...daysOff, day],
                          };
                        })}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-bold transition-all ${isOff ? 'border-red-500 bg-red-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-400 hover:border-red-300'}`}
                      >
                        {day === 6 ? 'CN' : `T${day + 2}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-4">
              <button type="button" onClick={() => setIsConfigOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-800">
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfigOpen(false);
                  if (members.length >= 2) {
                    solve({ ...groupPrefs, groupPreferredClasses });
                  }
                }}
                className="rounded-xl bg-[#004A98] px-6 py-2.5 text-sm font-bold text-white shadow transition-all hover:bg-blue-800"
              >
                Lưu & Xếp lịch nhóm
              </button>
            </div>
          </div>
        </div>
      )}

      {result?.warnings.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {result.warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </div>
      ) : null}

      {result?.solutions.length ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Top {result.solutions.length} kịch bản</h2>
          {result.solutions.map((option) => (
            <GroupScheduleResult key={option.option} option={option} onUseSchedule={handleUseSchedule} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default GroupSchedulePage;
