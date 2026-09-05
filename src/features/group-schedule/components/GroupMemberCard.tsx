import { ChevronDown, Pencil, Trash2 } from 'lucide-react';

import type { GroupMemberToken } from '../types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/navigation/accordion';
import { Button } from '../../../components/ui/form/button';
import { formatDaysOff } from '../../../utils/dayOffPreferences';

interface GroupMemberCardProps {
  member: GroupMemberToken;
  index: number;
  courseNames?: Record<string, string>;
  onEdit?: () => void;
  onRemove?: () => void;
}

export function GroupMemberCard({ member, index, courseNames = {}, onEdit, onRemove }: GroupMemberCardProps) {
  const nickname = member.nickname || `Thành viên ${index + 1}`;
  const registeredCourses = Array.from(new Set([...member.sharedCourses, ...member.personalCourses]));
  const daysOff = formatDaysOff(member.personalConfig?.daysOff);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="details" className="border-none">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <AccordionTrigger className="group min-w-0 flex-1 p-0 text-left hover:no-underline [&>svg]:hidden">
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{nickname}</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-500">
                    {registeredCourses.length} môn học{daysOff !== 'Không chọn' ? ` · Tránh ${daysOff}` : ''}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </AccordionTrigger>

            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8 shrink-0 text-slate-400 hover:bg-blue-50 hover:text-[#004A98]"
                title="Chỉnh sửa thành viên"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-8 w-8 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                title="Xóa thành viên"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <AccordionContent className="pb-0 pt-3">
            {registeredCourses.length > 0 ? (
              <div className="space-y-2">
                {registeredCourses.map((course) => (
                  <div key={course} className="flex min-w-0 items-start gap-2 pl-2 text-xs text-slate-600">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                    <span className="min-w-0 truncate">
                      <span className="font-semibold text-slate-700">{course}</span>
                      {courseNames[course] ? ` · ${courseNames[course]}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">Chưa chọn môn.</span>
            )}
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
