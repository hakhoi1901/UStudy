import { CalendarCheck } from 'lucide-react';

import { Badge } from './ui/badge';
import type { GroupScheduleItem, GroupScheduleOption } from '../logic/scheduler/GroupTypes';
import { Save } from 'lucide-react';
import { Button } from './ui/button';
export type GroupScheduleResultViewMode = 'course' | 'member';

interface GroupScheduleResultProps {
  option: GroupScheduleOption;
  viewMode: GroupScheduleResultViewMode
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

export function GroupScheduleResult({ option, viewMode}: GroupScheduleResultProps) {
  const courseRows = buildCourseComparison(option);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
            Kịch bản {option.option}
          </h3>
          <p className="text-sm text-gray-500">Điểm nhóm: {Math.round(option.fitness)}</p>
        </div>
        
      </div>

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
                  <div key={`${course.courseId}-${memberIndex}-${item.classId}`} className="grid gap-2 px-3 py-2 text-sm md:grid-cols-[160px_180px_minmax(0,1fr)]">
                    <div className="font-medium text-gray-900">{nickname}</div>
                    <div className="font-mono text-xs text-gray-700">{item.classId}</div>
                    <div className="text-gray-600">{formatSchedule(item.schedule)}</div>
                  </div>
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
                  <div key={`${member.memberIndex}-${item.courseId}-${item.classId}`} className={`grid gap-2 px-3 py-2 text-sm md:grid-cols-[160px_180px_120px_minmax(0,1fr)] ${item.isShared ? 'bg-emerald-50' : 'bg-white'}`}>
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
