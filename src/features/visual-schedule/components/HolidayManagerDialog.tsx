import { useMemo, useState } from 'react';
import { CalendarDays, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { AppDialog } from '../../../components/ui/app-dialog';
import { getHolidayDateRange, sortHolidays, toDateInputValue } from '../services/holiday-logic';
import type { Holiday, ScheduleOverrides } from '../types';

interface CourseOption {
    code: string;
    name: string;
}

interface HolidayManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    overrides: ScheduleOverrides;
    systemHolidays: Holiday[];
    courses: CourseOption[];
    semesterStartDate?: Date;
    onSave: (newOverrides: ScheduleOverrides) => void;
}

type HolidayListView = 'custom' | 'system';
type AffectedMode = 'all' | 'selected';

function formatDateRange(holiday: Holiday, semesterStartDate?: Date): string {
    const range = getHolidayDateRange(holiday, semesterStartDate);
    if (!range) return 'Chưa xác định thời gian';
    const formatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const start = formatter.format(range.start);
    const end = formatter.format(range.end);
    return start === end ? start : `${start} - ${end}`;
}

function createHolidayId(): string {
    return globalThis.crypto?.randomUUID?.() || `holiday-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function HolidayManagerDialog({
    open,
    onOpenChange,
    overrides,
    systemHolidays,
    courses,
    semesterStartDate,
    onSave,
}: HolidayManagerDialogProps) {
    const defaultDate = toDateInputValue(new Date());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState(defaultDate);
    const [endDate, setEndDate] = useState(defaultDate);
    const [affectedMode, setAffectedMode] = useState<AffectedMode>('all');
    const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>([]);
    const [makeUp, setMakeUp] = useState(true);
    const [error, setError] = useState('');
    const [listView, setListView] = useState<HolidayListView>('custom');

    const courseNameByCode = useMemo(() => new Map(courses.map((course) => [course.code, course.name])), [courses]);
    const customHolidays = useMemo(
        () => sortHolidays(overrides.holidays || [], semesterStartDate),
        [overrides.holidays, semesterStartDate],
    );
    const sortedSystemHolidays = useMemo(
        () => sortHolidays(systemHolidays || [], semesterStartDate),
        [systemHolidays, semesterStartDate],
    );
    const visibleHolidays = listView === 'custom' ? customHolidays : sortedSystemHolidays;

    const resetForm = () => {
        setEditingId(null);
        setReason('');
        setStartDate(defaultDate);
        setEndDate(defaultDate);
        setAffectedMode('all');
        setSelectedCourseCodes([]);
        setMakeUp(true);
        setError('');
    };

    const toggleCourse = (courseCode: string) => {
        setSelectedCourseCodes((current) => current.includes(courseCode)
            ? current.filter((code) => code !== courseCode)
            : [...current, courseCode]);
        setError('');
    };

    const saveHoliday = () => {
        const trimmedReason = reason.trim();
        if (!trimmedReason) {
            setError('Vui lòng nhập tên hoặc lý do nghỉ.');
            return;
        }
        if (!startDate || !endDate || endDate < startDate) {
            setError('Khoảng ngày nghỉ chưa hợp lệ.');
            return;
        }
        if (affectedMode === 'selected' && selectedCourseCodes.length === 0) {
            setError('Hãy chọn ít nhất một môn bị ảnh hưởng.');
            return;
        }

        const holiday: Holiday = {
            id: editingId || createHolidayId(),
            reason: trimmedReason,
            startDate,
            endDate,
            affectedCourseCodes: affectedMode === 'all' ? 'all' : selectedCourseCodes,
            makeUp,
        };
        const nextHolidays = editingId
            ? overrides.holidays.map((item) => item.id === editingId ? holiday : item)
            : [...overrides.holidays, holiday];
        onSave({ ...overrides, holidays: sortHolidays(nextHolidays, semesterStartDate) });
        resetForm();
        setListView('custom');
    };

    const editHoliday = (holiday: Holiday) => {
        const range = getHolidayDateRange(holiday, semesterStartDate);
        setEditingId(holiday.id);
        setReason(holiday.reason);
        setStartDate(range ? toDateInputValue(range.start) : defaultDate);
        setEndDate(range ? toDateInputValue(range.end) : defaultDate);
        setAffectedMode(holiday.affectedCourseCodes === 'all' ? 'all' : 'selected');
        setSelectedCourseCodes(holiday.affectedCourseCodes === 'all' ? [] : holiday.affectedCourseCodes);
        setMakeUp(holiday.makeUp !== false);
        setError('');
    };

    const removeHoliday = (holidayId: string) => {
        onSave({ ...overrides, holidays: overrides.holidays.filter((holiday) => holiday.id !== holidayId) });
        if (editingId === holidayId) resetForm();
    };

    return (
        <AppDialog
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);
                if (!nextOpen) resetForm();
            }}
            title="Quản lý nghỉ lễ"
            description="Ẩn đúng buổi học trùng ngày nghỉ và tùy chọn bù buổi ở cuối lịch."
            icon={CalendarDays}
            size="lg"
            contentClassName="!m-0 !max-h-[calc(100vh-11rem)] !p-0"
            footer={(
                <button type="button" onClick={() => onOpenChange(false)} className="ustudy-button-primary">
                    Đóng
                </button>
            )}
        >
            <div className="grid min-h-[34rem] md:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
                <section className="p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">{editingId ? 'Chỉnh sửa ngày nghỉ' : 'Thêm ngày nghỉ'}</h3>
                            <p className="mt-1 text-xs text-gray-500">Thiết lập theo ngày thực tế trong học kỳ.</p>
                        </div>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="text-xs font-semibold text-gray-600 hover:text-gray-900">
                                Hủy sửa
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Tên kỳ nghỉ</span>
                            <input
                                value={reason}
                                onChange={(event) => { setReason(event.target.value); setError(''); }}
                                placeholder="Ví dụ: Nghỉ Tết Nguyên đán"
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/10"
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-gray-700">Từ ngày</span>
                                <input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); if (event.target.value > endDate) setEndDate(event.target.value); setError(''); }} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/10" />
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-gray-700">Đến ngày</span>
                                <input type="date" min={startDate} value={endDate} onChange={(event) => { setEndDate(event.target.value); setError(''); }} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/10" />
                            </label>
                        </div>

                        <div>
                            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Phạm vi áp dụng</span>
                            <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1">
                                <button type="button" onClick={() => { setAffectedMode('all'); setError(''); }} className={`h-9 rounded-md text-sm font-semibold transition ${affectedMode === 'all' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-600'}`}>Tất cả môn</button>
                                <button type="button" onClick={() => setAffectedMode('selected')} className={`h-9 rounded-md text-sm font-semibold transition ${affectedMode === 'selected' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-600'}`}>Chọn môn</button>
                            </div>
                        </div>

                        {affectedMode === 'selected' && (
                            <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                                {courses.map((course) => {
                                    const checked = selectedCourseCodes.includes(course.code);
                                    return (
                                        <label key={course.code} className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0 hover:bg-gray-50">
                                            <input type="checkbox" checked={checked} onChange={() => toggleCourse(course.code)} className="h-4 w-4 rounded border-gray-300 text-[#004A98] focus:ring-[#004A98]" />
                                            <span className="min-w-0 flex-1">
                                                <strong className="block text-xs text-gray-900">{course.code}</strong>
                                                <span className="block truncate text-xs text-gray-500">{course.name}</span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        <label className="flex cursor-pointer items-start gap-3 border-y border-gray-200 py-3">
                            <input type="checkbox" checked={makeUp} onChange={(event) => setMakeUp(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#004A98] focus:ring-[#004A98]" />
                            <span>
                                <strong className="block text-sm text-gray-900">Bù buổi đã nghỉ ở cuối lịch</strong>
                                <span className="mt-0.5 block text-xs leading-5 text-gray-500">Chỉ kéo dài lịch của đúng buổi học trùng ngày nghỉ.</span>
                            </span>
                        </label>

                        {error && <p className="text-xs font-medium text-red-600">{error}</p>}

                        <button type="button" onClick={saveHoliday} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#004A98] px-4 text-sm font-bold text-white transition hover:bg-[#003A78]">
                            {editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {editingId ? 'Lưu thay đổi' : 'Thêm ngày nghỉ'}
                        </button>
                    </div>
                </section>

                <section className="border-t border-gray-200 bg-gray-50/70 p-5 md:border-l md:border-t-0">
                    <div className="mb-4 grid grid-cols-2 rounded-lg bg-gray-200/70 p-1">
                        <button type="button" onClick={() => setListView('custom')} className={`h-9 rounded-md text-sm font-semibold transition ${listView === 'custom' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-600'}`}>Tự thiết lập · {customHolidays.length}</button>
                        <button type="button" onClick={() => setListView('system')} className={`h-9 rounded-md text-sm font-semibold transition ${listView === 'system' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-600'}`}>Hệ thống · {sortedSystemHolidays.length}</button>
                    </div>

                    {visibleHolidays.length === 0 ? (
                        <div className="border-y border-dashed border-gray-300 py-10 text-center">
                            <CalendarDays className="mx-auto h-6 w-6 text-gray-300" />
                            <p className="mt-2 text-sm font-medium text-gray-600">Chưa có ngày nghỉ</p>
                            <p className="mt-1 text-xs text-gray-500">{listView === 'custom' ? 'Ngày nghỉ bạn thêm sẽ xuất hiện tại đây.' : 'Chưa có lịch nghỉ chung cho học kỳ này.'}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white">
                            {visibleHolidays.map((holiday) => {
                                const scope = holiday.affectedCourseCodes === 'all'
                                    ? 'Tất cả môn'
                                    : holiday.affectedCourseCodes.map((code) => {
                                        const name = courseNameByCode.get(code);
                                        return name ? `${code} · ${name}` : code;
                                    }).join(', ');
                                return (
                                    <div key={holiday.id} className="px-3 py-3.5">
                                        <div className="flex items-start gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98]"><CalendarDays className="h-4 w-4" /></span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-900">{holiday.reason}</p>
                                                <p className="mt-1 text-xs font-medium text-gray-600">{formatDateRange(holiday, semesterStartDate)}</p>
                                                <p className="mt-1 truncate text-xs text-gray-500">{scope} · {holiday.makeUp === false ? 'Không bù lịch' : 'Có bù lịch'}</p>
                                            </div>
                                            {listView === 'custom' && (
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <button type="button" onClick={() => editHoliday(holiday)} title="Chỉnh sửa" className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-blue-50 hover:text-[#004A98]"><Pencil className="h-4 w-4" /></button>
                                                    <button type="button" onClick={() => removeHoliday(holiday.id)} title="Xóa" className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </AppDialog>
    );
}
