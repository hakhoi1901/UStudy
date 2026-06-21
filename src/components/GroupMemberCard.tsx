import { Badge } from './ui/badge';
import type { ClassPreferenceSelection, GroupMemberToken } from '../logic/scheduler/GroupTypes';
import { formatDaysOff } from '../utils/dayOffPreferences';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
interface GroupMemberCardProps {
  member: GroupMemberToken;
  index: number;
  courseNames?: Record<string, string>;
  onRemove?: () => void;
}

function normalizeSelection(value: string[] | ClassPreferenceSelection): ClassPreferenceSelection {
  if (Array.isArray(value)) return { preferred: value };
  return value;
}

export function GroupMemberCard({ member, index, courseNames = {}, onRemove }: GroupMemberCardProps) {
  const nickname = member.nickname || `Thành viên ${index + 1}`;
  const registeredCourses = Array.from(new Set([...member.sharedCourses, ...member.personalCourses]));
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{nickname}</div>
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
            title="Xóa thành viên"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <Accordion type="single" collapsible className="w-full mt-1">
        <AccordionItem value="details" className="border-none">
          <AccordionTrigger className="py-1.5 text-xs font-medium text-gray-500 hover:no-underline">
            {registeredCourses.length} môn học
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-1">
            <div className="space-y-3">
              <div className="flex flex-col">
                {registeredCourses.length > 0 ? (
                  registeredCourses.map((course) => (
                    <div key={course} className="flex justify-between items-center border-b border-gray-100 last:border-0 py-2">
                      <span className="text-xs bolt text-gray-800 truncate ml-2">{course} - {courseNames[course]}</span>
                      {/* {courseNames[course] && (
                        <span className="text-xs bolt text-gray-800 truncate ml-2 max-w-[200px]">{courseNames[course]}</span>
                      )} */}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 py-2">Chưa chọn</span>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
