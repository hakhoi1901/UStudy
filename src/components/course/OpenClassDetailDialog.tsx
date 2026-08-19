import { useMemo } from 'react';
import { CalendarClock, MapPin, Users } from 'lucide-react';

import { STORAGE_KEYS } from '../../config';
import { readFromStorage } from '../../helpers/localStorage/save';
import courseDbJson from '../../logic/scheduler/Course_db.json';
import { AppDialog } from '../ui/overlays/app-dialog';

export interface OpenClassDetailTarget {
  courseCode: string;
  courseName: string;
  classId: string;
  schedule?: string | string[];
}

interface EnrollmentSnapshot {
  capacity?: number | null;
  enrolled?: number | null;
  remaining?: number | null;
  rawCapacity?: string;
  rawEnrolled?: string;
}

interface ClassComponent {
  group?: string;
  schedule?: string[];
  rawSchedules?: string[];
  locations?: string[];
  enrollment?: EnrollmentSnapshot | null;
}

interface StoredOpenClass {
  id?: string;
  schedule?: string[];
  components?: {
    theory?: ClassComponent;
    practical?: ClassComponent | null;
    exercise?: ClassComponent | null;
  };
  enrollment?: {
    theory?: EnrollmentSnapshot;
    practical?: EnrollmentSnapshot | null;
    exercise?: EnrollmentSnapshot | null;
  };
}

interface StoredCourse {
  id?: string;
  code?: string;
  course_id?: string;
  name?: string;
  credits?: number;
  classes?: StoredOpenClass[];
}

function normalize(value: unknown): string {
  return String(value ?? '').trim().toLocaleUpperCase('vi-VN');
}

function toList(value?: string | string[]): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  const item = String(value ?? '').trim();
  return item ? [item] : [];
}

function getEnrollmentLabel(value?: EnrollmentSnapshot | null): string {
  if (!value) return 'Chưa có dữ liệu';
  if (value.capacity !== null && value.capacity !== undefined && value.enrolled !== null && value.enrolled !== undefined) {
    return `${value.enrolled}/${value.capacity}`;
  }
  return value.rawEnrolled || value.rawCapacity || 'Chưa có dữ liệu';
}

function getRemainingLabel(value?: EnrollmentSnapshot | null): string {
  return value?.remaining !== null && value?.remaining !== undefined ? `${value.remaining} chỗ` : '-';
}

function ClassComponentRow({ label, component }: { label: string; component?: ClassComponent | null }) {
  if (!component) return null;
  const schedule = component.rawSchedules?.length ? component.rawSchedules : component.schedule ?? [];
  const locations = component.locations?.filter(Boolean) ?? [];

  return (
    <div className="grid gap-2 px-1 py-3 sm:grid-cols-[minmax(0,1fr)_112px] sm:items-center">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}{component.group ? ` · ${component.group}` : ''}</p>
        <p className="mt-0.5 text-xs leading-5 text-gray-500">{schedule.length ? schedule.join(' · ') : 'Chưa có lịch học'}</p>
        {locations.length > 0 && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600"><MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />{locations.join(' · ')}</p>}
      </div>
      <div className="border-l border-gray-200 pl-3 text-left sm:text-right">
        <p className="text-sm font-bold tabular-nums text-[#004A98]">{getEnrollmentLabel(component.enrollment)}</p>
        <p className="text-[11px] text-gray-500">Còn {getRemainingLabel(component.enrollment)}</p>
      </div>
    </div>
  );
}

export function OpenClassDetailContent({ target }: { target: OpenClassDetailTarget }) {
  const { course, selectedClass } = useMemo(() => {
    const courses = readFromStorage<StoredCourse[]>(STORAGE_KEYS.COURSE_DB_OFFLINE, []);
    const mergedMap = new Map<string, any>();
    (courseDbJson as any[]).forEach(item => mergedMap.set(item.id, item));
    if (courses && Array.isArray(courses)) {
        courses.forEach(item => mergedMap.set(item.id, item));
    }
    const mergedCourses = Array.from(mergedMap.values());
    const courseCode = normalize(target.courseCode);
    const foundCourse = mergedCourses.find((item) => normalize(item.id || item.code || item.course_id) === courseCode);
    const classId = normalize(target.classId);
    const foundClass = foundCourse?.classes?.find((item) => normalize(item.id) === classId)
      ?? foundCourse?.classes?.find((item) => normalize(item.id).startsWith(`${classId}_`));
    return { course: foundCourse, selectedClass: foundClass };
  }, [target.classId, target.courseCode]);

  const components = selectedClass?.components;
  const hasComponentData = Boolean(components?.theory || components?.practical || components?.exercise);
  const fallbackSchedule = toList(target.schedule);
  const classSchedule = selectedClass?.schedule?.length ? selectedClass.schedule : fallbackSchedule;
  const enrollment = selectedClass?.enrollment;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5 border-b border-gray-200 pb-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Lớp được chọn</p>
          <p className="mt-1 font-mono text-base font-bold text-gray-900">{target.classId}</p>
        </div>
        <div className="border-l border-gray-200 pl-5 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Tín chỉ</p>
          <p className="mt-1 text-base font-bold tabular-nums text-[#004A98]">{course?.credits ?? '-'} TC</p>
        </div>
      </div>

      {hasComponentData ? (
        <section>
          <div className="mb-2 flex items-center gap-2"><CalendarClock className="h-4 w-4 text-[#004A98]" /><h4 className="text-sm font-bold text-gray-900">Lịch học và sĩ số</h4></div>
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            <ClassComponentRow label="Lý thuyết" component={components?.theory} />
            <ClassComponentRow label="Thực hành" component={components?.practical} />
            <ClassComponentRow label="Bài tập" component={components?.exercise} />
          </div>
        </section>
      ) : (
        <section className="border-y border-gray-200 py-3">
          <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-[#004A98]" /><h4 className="text-sm font-bold text-gray-900">Lịch học</h4></div>
          <p className="mt-2 text-sm leading-6 text-gray-700">{classSchedule.join(' · ') || 'Chưa có chi tiết lịch học.'}</p>
        </section>
      )}

      {!hasComponentData && enrollment && (
        <section>
          <div className="mb-2 flex items-center gap-2"><Users className="h-4 w-4 text-[#004A98]" /><h4 className="text-sm font-bold text-gray-900">Sĩ số</h4></div>
          <div className="grid grid-cols-3 divide-x divide-gray-200 border-y border-gray-200 text-center text-xs">
            <div className="py-3"><p className="text-gray-500">Lý thuyết</p><p className="mt-1 font-bold tabular-nums text-gray-900">{getEnrollmentLabel(enrollment.theory)}</p></div>
            <div className="py-3"><p className="text-gray-500">Thực hành</p><p className="mt-1 font-bold tabular-nums text-gray-900">{getEnrollmentLabel(enrollment.practical)}</p></div>
            <div className="py-3"><p className="text-gray-500">Bài tập</p><p className="mt-1 font-bold tabular-nums text-gray-900">{getEnrollmentLabel(enrollment.exercise)}</p></div>
          </div>
        </section>
      )}

      {!selectedClass && <p className="border-l-2 border-amber-400 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">Chưa tìm thấy chi tiết lớp mở đã đồng bộ cho lớp này. Lịch đang hiển thị vẫn được giữ để bạn đối chiếu.</p>}
    </div>
  );
}

export function OpenClassDetailDialog({ target, onOpenChange }: { target: OpenClassDetailTarget | null; onOpenChange: (open: boolean) => void }) {
  if (!target) return null;

  return (
    <AppDialog
      open={Boolean(target)}
      onOpenChange={onOpenChange}
      title={`Lớp mở ${target.classId}`}
      description={`${target.courseCode} · ${target.courseName}`}
      icon={Users}
      size="md"
      mobileFullScreen
    >
      <OpenClassDetailContent target={target} />
    </AppDialog>
  );
}
