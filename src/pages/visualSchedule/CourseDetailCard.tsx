// CourseDetailCard.tsx
import { type ScheduleSession } from '../../types/Schedule';

const colorClasses = {
    blue: 'border-l-blue-600',
    green: 'border-l-green-600',
    yellow: 'border-l-yellow-600',
    purple: 'border-l-purple-600',
};

const typeLabels = { LT: 'Lý thuyết', TH: 'Thực hành', BT: 'Bài tập' };

export function CourseDetailCard({ session }: { session: ScheduleSession }) {
    return (
        <div className={`bg-white rounded-lg border-l-4 ${colorClasses[session.color as keyof typeof colorClasses]} border border-gray-200 p-4 mb-3`}>
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
        </div>
    );
}