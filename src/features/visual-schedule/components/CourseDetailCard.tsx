// CourseDetailCard.tsx
import { type ScheduleSession } from '../types';
import type { OpenClassDetailTarget } from '../../../components/course';

const colorClasses = {
    blue: 'border-l-blue-600',
    green: 'border-l-green-600',
    yellow: 'border-l-yellow-600',
    purple: 'border-l-purple-600',
};

const typeLabels = { LT: 'Lý thuyết', TH: 'Thực hành', BT: 'Bài tập' };

export function CourseDetailCard({ session, onOpenClassDetails }: { session: ScheduleSession; onOpenClassDetails?: (target: OpenClassDetailTarget) => void }) {
    return (
        <button
            type="button"
            onClick={() => onOpenClassDetails?.({ courseCode: session.courseCode, courseName: session.courseName, classId: session.classCode })}
            className={`mb-3 w-full rounded-lg border border-gray-200 border-l-4 ${colorClasses[session.color as keyof typeof colorClasses]} bg-white p-4 text-left transition-colors hover:bg-blue-50 ${onOpenClassDetails ? 'cursor-pointer' : 'cursor-default'}`}
            title={onOpenClassDetails ? 'Xem chi tiết lớp mở' : undefined}
        >
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        {session.courseCode} - {session.courseName}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>• {session.credits} TC | {typeLabels[session.type]} | Phòng: {session.room}</div>
                        {session.totalWeeks > 0 && (
                            <div>• Học từ: {session.startDate} - {session.endDate} ({session.totalWeeks} tuần)</div>
                        )}
                        <div className="md:col-span-2">• GV: {session.instructor} | Lớp: {session.classCode}</div>
                    </div>
                </div>
            </div>
        </button>
    );
}
