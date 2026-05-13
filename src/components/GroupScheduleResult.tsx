import { CalendarCheck, ExternalLink } from 'lucide-react';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { GroupScheduleOption } from '../logic/scheduler/GroupTypes';

interface GroupScheduleResultProps {
  option: GroupScheduleOption;
  onUseSchedule: (option: GroupScheduleOption, memberIndex: number) => void;
}

function formatSchedule(schedule?: string | string[]): string {
  if (!schedule) return 'Chưa có chuỗi lịch';
  return Array.isArray(schedule) ? schedule.join(', ') : schedule;
}

export function GroupScheduleResult({ option, onUseSchedule }: GroupScheduleResultProps) {
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

      <div className="space-y-5">
        {option.schedules.map((member) => (
          <div key={member.memberIndex} className="overflow-hidden rounded-md border border-gray-200">
            <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-medium text-gray-900">{member.nickname}</div>
              <Button type="button" size="sm" variant="outline" onClick={() => onUseSchedule(option, member.memberIndex)}>
                <ExternalLink className="h-4 w-4" />
                Dùng lịch này
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-white text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Môn</th>
                    <th className="px-3 py-2 font-medium">Lớp</th>
                    <th className="px-3 py-2 font-medium">Loại</th>
                    <th className="px-3 py-2 font-medium">Lịch</th>
                  </tr>
                </thead>
                <tbody>
                  {member.items.map((item) => (
                    <tr key={`${member.memberIndex}-${item.courseId}`} className={item.isShared ? 'bg-emerald-50' : 'bg-white'}>
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900">{item.courseId}</div>
                        <div className="text-xs text-gray-500">{item.courseName}</div>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{item.classId}</td>
                      <td className="px-3 py-2">
                        {item.isShared ? (
                          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Môn chung</Badge>
                        ) : (
                          <Badge variant="secondary">Cá nhân</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">{formatSchedule(item.schedule)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
