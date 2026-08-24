import { useMemo, useState } from 'react';
import { ArrowRight, GitCompareArrows } from 'lucide-react';

import { AppSelect } from '../../../components/ui/form';
import type { GroupScheduleOption } from '../types';

interface Props {
  options: GroupScheduleOption[];
  activeIndex: number;
}

function scheduleText(value?: string | string[]): string {
  return Array.isArray(value) ? value.join(', ') : value || 'Chưa có lịch';
}

export function GroupScheduleComparison({ options, activeIndex }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [compareIndex, setCompareIndex] = useState(() => activeIndex === 0 ? 1 : 0);
  const current = options[activeIndex] ?? options[0];
  const compared = options[compareIndex] ?? options.find((_, index) => index !== activeIndex);
  const differences = useMemo(() => {
    if (!current || !compared) return [];
    const rows: Array<{ key: string; member: string; courseId: string; from: string; to: string; fromSchedule: string; toSchedule: string }> = [];
    current.schedules.forEach((member) => {
      const otherMember = compared.schedules.find((candidate) => candidate.memberIndex === member.memberIndex);
      member.items.forEach((item) => {
        const other = otherMember?.items.find((candidate) => candidate.courseId === item.courseId);
        if (!other || other.classId === item.classId) return;
        rows.push({ key: `${member.memberIndex}:${item.courseId}`, member: member.nickname, courseId: item.courseId, from: item.classId, to: other.classId, fromSchedule: scheduleText(item.schedule), toSchedule: scheduleText(other.schedule) });
      });
    });
    return rows;
  }, [compared, current]);

  if (options.length < 2 || !current || !compared) return null;
  return (
    <section data-guide="group-result-comparison" className="border-t border-gray-100 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => setIsOpen((value) => !value)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#004A98]"><GitCompareArrows className="h-4 w-4" />So sánh phương án</button>
        {isOpen ? <AppSelect value={String(compareIndex)} onChange={(value) => setCompareIndex(Number(value))} options={options.map((option, index) => ({ id: String(index), name: `PA ${option.option}${index === activeIndex ? ' (đang xem)' : ''}`, disabled: index === activeIndex }))} ariaLabel="Chọn phương án để so sánh" className="w-44" triggerClassName="h-8 px-2.5 text-xs" /> : null}
      </div>
      {isOpen ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-3 py-2 text-xs text-gray-600"><span>PA {current.option}: {Math.round(current.fitness)} điểm</span><span>{differences.length} lớp khác PA {compared.option}</span><span>PA {compared.option}: {Math.round(compared.fitness)} điểm</span></div>
          {differences.length ? <div className="divide-y divide-gray-100">{differences.map((row) => <div key={row.key} className="grid gap-2 px-3 py-2 text-xs sm:grid-cols-[130px_90px_minmax(0,1fr)]"><div><p className="font-medium text-gray-900">{row.member}</p><p className="font-mono text-gray-500">{row.courseId}</p></div><div className="flex items-center gap-1 font-mono text-gray-700"><span>{row.from}</span><ArrowRight className="h-3.5 w-3.5 text-gray-400" /><span>{row.to}</span></div><div className="text-gray-500"><p>{row.fromSchedule}</p><p className="mt-0.5 text-[#004A98]">{row.toSchedule}</p></div></div>)}</div> : <p className="px-3 py-4 text-sm text-gray-500">Hai phương án dùng cùng lớp cho mọi thành viên.</p>}
        </div>
      ) : null}
    </section>
  );
}
