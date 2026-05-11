import { Info, Clock } from "lucide-react";
import type { TuitionCourse, TuitionSummary } from "../types";
import { useState } from "react";


function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
    const [show, setShow] = useState(false);

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-[9999] animate-in fade-in slide-in-from-top-1 duration-200" style={{ minWidth: 'max-content' }}>
                    {text}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
            )}
        </div>
    );
}

export function TuitionDeskTopCardList({
    currentSemesterData,
    currentSemesterSummary,
    formatCurrency,
}: {
    currentSemesterData: TuitionCourse[];
    currentSemesterSummary: TuitionSummary;
    formatCurrency: (value: number) => string;
}) {
    return (
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs min-w-[1100px]">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 border-b-2 border-gray-300 z-10">
                    <tr>
                        <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                            STT
                        </th>
                        <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                            <Tooltip text="Năm học / Học kỳ">
                                <span className="cursor-help flex items-center gap-0.5 justify-center">
                                    NH/HK
                                    <Info className="w-3 h-3 text-gray-400" />
                                </span>
                            </Tooltip>
                        </th>
                        <th className="px-2.5 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-left font-semibold">
                            Mã MH/Lớp/Môn Học
                        </th>
                        <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                            <Tooltip text="Số tín chỉ">
                                <span className="cursor-help">Số TC</span>
                            </Tooltip>
                        </th>
                        <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                            Số Tiết
                        </th>
                        <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                            <Tooltip text="Số tín chỉ tính học phí (có thể khác số TC thực tế)">
                                <span className="cursor-help flex items-center gap-0.5 justify-center">
                                    TC<br />HP
                                    <Info className="w-3 h-3 text-gray-400" />
                                </span>
                            </Tooltip>
                        </th>
                        <th className="px-2.5 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                            Học Phí
                        </th>
                        <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                            Giảm
                        </th>
                        <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                            Hỗ Trợ<br />HP
                        </th>
                        <th className="px-2.5 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                            HP<br />Thực Đóng
                        </th>
                        <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-right font-semibold">
                            Chi Phí
                        </th>
                        <th className="px-2 py-2.5 text-[10px] text-gray-700 uppercase tracking-wide text-center font-semibold">
                            Ghi Chú
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {currentSemesterData.map((course, index) => (
                        <tr
                            key={course.stt}
                            className={`hover:bg-blue-50/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                }`}
                        >
                            <td className="px-2 py-2.5 text-center text-gray-900 font-medium text-xs">
                                {course.stt}
                            </td>
                            <td className="px-2 py-2.5 text-center text-gray-600 text-[12px] font-mono">
                                {course.semester}
                            </td>
                            <td className="px-2.5 py-2.5">
                                <div className="flex flex-col">
                                    <span className="font-mono text-[11px] text-gray-500 mb-0.5">
                                        [{course.courseCode}/{course.classCode}]
                                    </span>
                                    <span className="text-xs text-gray-900 font-medium leading-tight">{course.courseName}</span>
                                </div>
                            </td>
                            <td className="px-2 py-2.5 text-center text-gray-900 font-medium text-xs">
                                {course.credits.toFixed(1)}
                            </td>
                            <td className="px-2 py-2.5 text-center text-gray-900 text-xs">
                                {course.periods.toFixed(1)}
                            </td>
                            <td className="px-2 py-2.5 text-center text-gray-900 font-semibold text-xs">
                                {course.tuitionCredits.toFixed(2)}
                            </td>
                            <td className="px-2.5 py-2.5 text-right text-gray-900 font-medium text-xs">
                                {formatCurrency(course.tuitionFee)}
                            </td>
                            <td className="px-2 py-2.5 text-right text-gray-600 text-xs">
                                {course.discount === 0 ? '0' : formatCurrency(course.discount)}
                            </td>
                            <td className="px-2 py-2.5 text-right text-gray-600 text-xs">
                                {course.support === 0 ? '0' : formatCurrency(course.support)}
                            </td>
                            <td className="px-2.5 py-2.5 text-right font-bold text-[#004A98] text-xs">
                                {formatCurrency(course.actualFee)}
                            </td>
                            <td className="px-2 py-2.5 text-right text-gray-600 text-xs">
                                {course.otherFees === 0 ? '0' : formatCurrency(course.otherFees)}
                            </td>
                            <td className="px-2 py-2.5 text-center text-gray-500 text-[10px]">
                                {course.note || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-gray-100 to-gray-50 border-t-2 border-gray-300">
                    <tr>
                        <td colSpan={3} className="px-2.5 py-3 font-bold text-gray-900 text-sm">
                            Tổng Cộng:
                        </td>
                        <td className="px-2 py-3 text-center font-bold text-gray-900 text-xs">
                            {currentSemesterSummary.totalCredits.toFixed(1)}
                        </td>
                        <td className="px-2 py-3 text-center font-bold text-gray-900 text-xs">
                            {currentSemesterSummary.totalPeriods.toFixed(1)}
                        </td>
                        <td className="px-2 py-3 text-center font-bold text-gray-900 text-xs">
                            {currentSemesterSummary.totalTuitionCredits.toFixed(2)}
                        </td>
                        <td className="px-2.5 py-3 text-right font-bold text-gray-900 text-sm">
                            {formatCurrency(currentSemesterSummary.totalFee)}
                        </td>
                        <td colSpan={5}></td>
                    </tr>
                    {currentSemesterSummary.hasAdvancePayment && (
                        <tr className="border-t border-gray-200">
                            <td colSpan={9} className="px-2.5 py-2 text-right text-xs font-semibold text-gray-700">
                                Tổng đã đóng:
                            </td>
                            <td className="px-2.5 py-2 text-right font-bold text-green-700 text-sm">
                                {formatCurrency(currentSemesterSummary.advancePayment)}
                            </td>
                            <td colSpan={2}></td>
                        </tr>
                    )}
                    <tr className="border-t-2 border-gray-300 bg-orange-50">
                        <td colSpan={9} className="px-2.5 py-3 text-right text-sm font-bold text-gray-900">
                            Tổng số tiền phải đóng:
                        </td>
                        <td className="px-2.5 py-3 text-right font-bold text-lg text-orange-600">
                            {formatCurrency(currentSemesterSummary.amountDue)} ₫
                        </td>
                        <td colSpan={2}></td>
                    </tr>
                    <tr>
                        <td colSpan={12} className="px-2.5 py-2 text-right">
                            <p className="text-[10px] italic text-red-600 flex items-center justify-end gap-1">
                                <Clock className="w-3 h-3" />
                                Ngày cập nhật: {currentSemesterSummary.lastUpdated}
                            </p>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}
