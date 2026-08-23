import { useState } from 'react';
import { AlertCircle, CalendarCheck, CheckCircle2, LoaderCircle } from 'lucide-react';

import { Badge } from '../../../components/ui/display/badge';
import type { GroupScheduleItem, GroupScheduleOption, GroupScheduleTradeoff } from '../types';
import type { OpenClassDetailTarget } from '../../../components/course';
export type GroupScheduleResultViewMode = 'course' | 'member';

interface GroupScheduleResultProps {
  option: GroupScheduleOption;
  viewMode: GroupScheduleResultViewMode;
  onOpenClassDetails: (target: OpenClassDetailTarget) => void;
  onAnalyzeTradeoff?: (tradeoff: GroupScheduleTradeoff) => Promise<GroupScheduleTradeoff>;
}

interface CourseComparisonRow {
  courseId: string;
  courseName: string;
  isShared: boolean;
  entries: Array<{
    memberIndex: number;
    nickname: string;
    item: GroupScheduleItem;
  }>;
}

function formatSchedule(schedule?: string | string[]): string {
  if (!schedule) return 'Chưa có chuỗi lịch';
  return Array.isArray(schedule) ? schedule.join(', ') : schedule;
}

function buildCourseComparison(option: GroupScheduleOption): CourseComparisonRow[] {
  const courseMap = new Map<string, CourseComparisonRow>();

  option.schedules.forEach((member) => {
    member.items.forEach((item) => {
      const row = courseMap.get(item.courseId) ?? {
        courseId: item.courseId,
        courseName: item.courseName,
        isShared: false,
        entries: [],
      };

      row.isShared = row.isShared || item.isShared;
      row.entries.push({ memberIndex: member.memberIndex, nickname: member.nickname, item });
      courseMap.set(item.courseId, row);
    });
  });

  return Array.from(courseMap.values()).sort((a, b) => {
    if (a.isShared !== b.isShared) return a.isShared ? -1 : 1;
    return a.courseId.localeCompare(b.courseId);
  });
}

export function GroupScheduleResult({ option, viewMode, onOpenClassDetails, onAnalyzeTradeoff }: GroupScheduleResultProps) {
  const courseRows = buildCourseComparison(option);
  const [checkingTradeoffId, setCheckingTradeoffId] = useState<string | null>(null);

  const checkTradeoff = async (tradeoff: GroupScheduleTradeoff) => {
    if (!onAnalyzeTradeoff) return;
    setCheckingTradeoffId(tradeoff.id);
    try {
      await onAnalyzeTradeoff(tradeoff);
    } finally {
      setCheckingTradeoffId(null);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
            Phương án {option.option}
          </h3>
          <p className="text-sm text-gray-500">Điểm nhóm: {Math.round(option.fitness)}</p>
        </div>
      </div>

      {option.tradeoffs?.length ? (
        <section className="mb-4 border-y border-gray-100 py-3" aria-label="Đánh đổi của phương án">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Đánh đổi của phương án này
          </div>
          <div className="divide-y divide-gray-100">
            {option.tradeoffs.map((tradeoff) => {
              const canCheck = (tradeoff.kind === 'group-day-off' || tradeoff.kind === 'personal-day-off') && tradeoff.confidence !== 'proven';
              const isChecking = checkingTradeoffId === tradeoff.id;
              const statusLabel = tradeoff.confidence === 'proven'
                ? (tradeoff.canAvoid ? 'Có thể tránh' : 'Đã kiểm chứng')
                : tradeoff.confidence === 'inconclusive'
                  ? 'Chưa kết luận'
                  : 'Ưu tiên mềm';
              return (
                <div key={tradeoff.id} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-medium text-gray-900">{tradeoff.title}</p>
                      <span className={`text-xs font-medium ${tradeoff.confidence === 'proven' ? 'text-emerald-700' : tradeoff.confidence === 'inconclusive' ? 'text-amber-700' : 'text-gray-500'}`}>
                        {tradeoff.confidence === 'proven' && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-5 text-gray-500">{tradeoff.description}</p>
                  </div>
                  {canCheck ? (
                    <button
                      type="button"
                      onClick={() => void checkTradeoff(tradeoff)}
                      disabled={isChecking}
                      className="ustudy-button-normal h-8 shrink-0 px-2.5 text-xs disabled:cursor-wait disabled:opacity-60"
                    >
                      {isChecking ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
                      {isChecking ? 'Đang kiểm tra' : 'Kiểm tra lý do'}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {viewMode === 'course' ? (
        <div className="space-y-3">
          {courseRows.map((course) => (
            <div key={course.courseId} className="overflow-hidden rounded-md border border-gray-200">
              <div className={`flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between ${course.isShared ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                <div className="min-w-0">
                  <div className="font-mono text-sm font-semibold text-gray-900">{course.courseId}</div>
                  <div className="truncate text-xs text-gray-500">{course.courseName}</div>
                </div>
                {course.isShared ? (
                  <Badge className="w-fit bg-emerald-600 text-white hover:bg-emerald-600">Môn chung</Badge>
                ) : (
                  <Badge variant="secondary" className="w-fit">Cá nhân</Badge>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {course.entries.map(({ memberIndex, nickname, item }) => (
                  <button
                    key={`${course.courseId}-${memberIndex}-${item.classId}`}
                    type="button"
                    onClick={() => onOpenClassDetails({ courseCode: item.courseId, courseName: item.courseName, classId: item.classId, schedule: item.schedule })}
                    className="grid w-full gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 md:grid-cols-[160px_180px_minmax(0,1fr)]"
                    title="Xem chi tiết lớp mở"
                  >
                    <div className="font-medium text-gray-900">{nickname}</div>
                    <div className="font-mono text-xs text-gray-700">{item.classId}</div>
                    <div className="text-gray-600">{formatSchedule(item.schedule)}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {option.schedules.map((member) => (
            <div key={member.memberIndex} className="overflow-hidden rounded-md border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 font-medium text-gray-900">
                {member.nickname}
              </div>
              <div className="divide-y divide-gray-100">
                {member.items.map((item) => (
                  <button
                    key={`${member.memberIndex}-${item.courseId}-${item.classId}`}
                    type="button"
                    onClick={() => onOpenClassDetails({ courseCode: item.courseId, courseName: item.courseName, classId: item.classId, schedule: item.schedule })}
                    className={`grid w-full gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 md:grid-cols-[160px_180px_120px_minmax(0,1fr)] ${item.isShared ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-white'}`}
                    title="Xem chi tiết lớp mở"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-sm font-semibold text-gray-900">{item.courseId}</div>
                      <div className="truncate text-xs text-gray-500">{item.courseName}</div>
                    </div>
                    <div className="font-mono text-xs text-gray-700">{item.classId}</div>
                    <div>
                      {item.isShared ? (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Môn chung</Badge>
                      ) : (
                        <Badge variant="secondary">Cá nhân</Badge>
                      )}
                    </div>
                    <div className="text-gray-600">{formatSchedule(item.schedule)}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
