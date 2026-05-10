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
        <DialogContent className="sm:max-w-md p-6 overflow-hidden border-none shadow-2xl bg-white">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Quản lý kỳ nghỉ & Dời lịch
                </DialogTitle>
                <DialogDescription>
                    Thêm kỳ nghỉ để tự động dời lịch học của các môn bị ảnh hưởng.
                </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
                {/* Form thêm mới */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase font-bold text-gray-500">Từ tuần nào</Label>
                            <Input type="number" value={startWeek} onChange={(e) => setStartWeek(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase font-bold text-gray-500">Số tuần nghỉ</Label>
                            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase font-bold text-gray-500">Áp dụng cho môn</Label>
                        <select
                            value={affected}
                            onChange={(e) => setAffected(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                        >
                            <option value="all">Tất cả các môn</option>
                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase font-bold text-gray-500">Lý do</Label>
                        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Nghỉ Tết, Nghỉ thi..." />
                    </div>

                    <Button onClick={addHoliday} className="w-full bg-[#004A98] hover:bg-[#004A98] gap-2">
                        <Plus className="w-4 h-4" /> Thêm kỳ nghỉ
                    </Button>
                </div>

                {/* Danh sách hiện tại */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Kỳ nghỉ đã thiết lập:</Label>
                    {overrides.holidays.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-4">Chưa có kỳ nghỉ nào được thiết lập.</p>
                    ) : (
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                            {overrides.holidays.map(h => (
                                <div key={h.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="text-xs">
                                        <p className="font-bold text-gray-900">{h.reason}</p>
                                        <p className="text-gray-500">Tuần {h.startWeek} • {h.duration} tuần • {h.affectedCourseCodes === 'all' ? 'Tất cả môn' : h.affectedCourseCodes.join(', ')}</p>
                                    </div>
                                    <button onClick={() => removeHoliday(h.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
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