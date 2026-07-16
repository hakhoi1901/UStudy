import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export interface MobileCourseDetailData {
    code: string;
    name: string;
    credits: number;
    type?: string;
    category?: string;
    theoryHours?: number;
    labHours?: number;
    exerciseHours?: number;
    description?: string;
}

interface MobileCourseSheetFrameProps {
    courseCode: string;
    courseName: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
}

interface MobileCourseDetailContentProps {
    course: MobileCourseDetailData;
    status: ReactNode;
    prerequisiteContent: ReactNode;
    additionalContent?: ReactNode;
}

export function MobileCourseSheetFrame({
    courseCode,
    courseName,
    onClose,
    children,
    footer,
}: MobileCourseSheetFrameProps) {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return createPortal((
        <div className="fixed inset-x-0 top-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-[9000] lg:hidden">
            <button
                type="button"
                aria-label="Đóng chi tiết môn học"
                onClick={onClose}
                className="absolute inset-0 h-full w-full bg-gray-900/35"
            />
            <section
                role="dialog"
                aria-modal="true"
                aria-label={`Chi tiết môn ${courseCode}`}
                className="absolute inset-x-0 bottom-0 flex max-h-[82vh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl"
            >
                <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-gray-300" />
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-4">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase text-gray-500">{courseCode}</p>
                        <h2 className="mt-1 text-base font-bold leading-snug text-gray-900">{courseName}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {children}

                {footer && (
                    <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-4 pt-3 shadow-[0_-8px_18px_rgba(15,23,42,0.06)]">
                        {footer}
                    </div>
                )}
            </section>
        </div>
    ), document.body);
}

export function MobileCourseDetailContent({
    course,
    status,
    prerequisiteContent,
    additionalContent,
}: MobileCourseDetailContentProps) {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm">
                <div className="grid grid-cols-2 gap-3 border-b border-gray-200 pb-3">
                    <div className="p-3">
                        <p className="text-[10px] font-medium uppercase text-gray-500">Tín chỉ</p>
                        <p className="mt-1 text-sm font-bold text-gray-900">{course.credits} TC</p>
                    </div>
                    <div className="p-3">
                        <p className="text-[10px] font-medium uppercase text-gray-500">Loại</p>
                        <p className="mt-1 truncate text-sm font-bold text-gray-900">{course.type || '-'}</p>
                    </div>
                    <div className="p-3">
                        <p className="text-[10px] font-medium uppercase text-gray-500">Trạng thái</p>
                        <div className="mt-1">{status}</div>
                    </div>
                    <div className="p-3">
                        <p className="text-[10px] font-medium uppercase text-gray-500">Danh mục</p>
                        <p className="mt-1 truncate text-xs font-semibold text-gray-900">{course.category || '-'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 border-b border-gray-200 py-3">
                    <div>
                        <p className="text-[10px] font-medium uppercase text-gray-500">Lý thuyết</p>
                        <p className="mt-1 text-xs font-semibold text-gray-900">{course.theoryHours || 0} tiết</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium uppercase text-gray-500">Thực hành</p>
                        <p className="mt-1 text-xs font-semibold text-gray-900">{course.labHours || 0} tiết</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium uppercase text-gray-500">Bài tập</p>
                        <p className="mt-1 text-xs font-semibold text-gray-900">{course.exerciseHours || 0} tiết</p>
                    </div>
                </div>

                <div className="pt-3">
                    <p className="text-[10px] font-medium uppercase text-gray-500">Ghi chú từ CTĐT</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-700">
                        {course.description || 'Chưa có ghi chú cho môn học này.'}
                    </p>
                </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-gray-900">Tiên quyết</h3>
                </div>
                {prerequisiteContent}
            </div>

            {additionalContent}
        </div>
    );
}
