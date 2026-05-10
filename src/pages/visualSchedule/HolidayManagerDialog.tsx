// HolidayManagerDialog.tsx
import { useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import {
    DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { type ScheduleOverrides, type Holiday } from '../../types/Schedule';

function HolidayManagerDialog({
    overrides,
    courses,
    onSave
}: {
    overrides: ScheduleOverrides;
    courses: string[];
    onSave: (newOverrides: ScheduleOverrides) => void;
}) {
    const [startWeek, setStartWeek] = useState('10');
    const [duration, setDuration] = useState('1');
    const [affected, setAffected] = useState<'all' | string>('all');
    const [reason, setReason] = useState('Nghỉ thi');

    const addHoliday = () => {
        const newHoliday: Holiday = {
            id: Math.random().toString(36).substr(2, 9),
            startWeek: parseInt(startWeek),
            duration: parseInt(duration),
            affectedCourseCodes: affected === 'all' ? 'all' : [affected],
            reason
        };

        onSave({
            ...overrides,
            holidays: [...overrides.holidays, newHoliday]
        });
    };

    const removeHoliday = (id: string) => {
        onSave({
            ...overrides,
            holidays: overrides.holidays.filter(h => h.id !== id)
        });
    };

    return (
        <DialogContent className="sm:max-w-md p-6 overflow-hidden border-none shadow-xl bg-white rounded-lg">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Calendar className="w-5 h-5 text-[#004A98]" />
                    Quản lý kỳ nghỉ & Dời lịch
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                    Thêm kỳ nghỉ để tự động dời lịch học của các môn bị ảnh hưởng.
                </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-5">
                {/* Form thêm mới */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-gray-700">Từ tuần nào</Label>
                            <Input type="number" value={startWeek} onChange={(e) => setStartWeek(e.target.value)} className="h-10 rounded-md" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-gray-700">Số tuần nghỉ</Label>
                            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="h-10 rounded-md" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Áp dụng cho môn</Label>
                        <select
                            value={affected}
                            onChange={(e) => setAffected(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                        >
                            <option value="all">Tất cả các môn</option>
                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Lý do</Label>
                        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Nghỉ Tết, Nghỉ thi..." className="h-10 rounded-md" />
                    </div>

                    <Button onClick={addHoliday} className="w-full bg-[#004A98] hover:bg-[#003d7a] text-white rounded-md h-10 gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> Thêm kỳ nghỉ
                    </Button>
                </div>

                {/* Danh sách hiện tại */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">Kỳ nghỉ đã thiết lập</Label>
                    {overrides.holidays.length === 0 ? (
                        <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                            <p className="text-sm text-gray-500">Chưa có kỳ nghỉ nào được thiết lập.</p>
                        </div>
                    ) : (
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                            {overrides.holidays.map(h => (
                                <div key={h.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#004A98] transition-colors">
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900">{h.reason}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Tuần {h.startWeek} • {h.duration} tuần • {h.affectedCourseCodes === 'all' ? 'Tất cả môn' : h.affectedCourseCodes.join(', ')}</p>
                                    </div>
                                    <button onClick={() => removeHoliday(h.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Xóa">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
    );
}

export { HolidayManagerDialog };