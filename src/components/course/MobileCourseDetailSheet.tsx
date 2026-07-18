import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { MobileBottomSheet } from '../ui/overlays/mobile-bottom-sheet';

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
    return (
        <MobileBottomSheet
            title={courseName}
            eyebrow={courseCode}
            ariaLabel={`Chi tiết môn ${courseCode}`}
            onClose={onClose}
            footer={footer}
        >
            {children}
        </MobileBottomSheet>
    );
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
