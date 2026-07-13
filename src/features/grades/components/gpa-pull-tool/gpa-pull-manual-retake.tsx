import { useState } from 'react';
import { BookOpen, Check, ChevronDown, HelpCircle, Plus, Search, Trash2, X } from 'lucide-react';
import type { GPAPullManualRetakeProps } from '../../types';

export function GPAPullManualRetake({
    manualRetakeItems,
    removeManualRetake,
    handleManualRetakeTargetInputChange,
    commitManualRetakeTargetInput,
    draftManualRetakeTargets,
    draftManualRetakeTargetErrors,
    manualRetakeImpact,
    selectableRetakeCourses,
    filteredSelectableRetakeCourses,
    retakeSearchTerm,
    setRetakeSearchTerm,
    isRetakePickerOpen,
    setIsRetakePickerOpen,
    retakePickerRef,
    pendingRetakeCodeSet,
    togglePendingRetakeCode,
    addPendingRetakes,
    selectAllFilteredRetakes,
    clearPendingFilteredRetakes,
    clearAllManualRetakes,
    decimals,
    scopeName,
}: GPAPullManualRetakeProps) {
    const pendingRetakeCount = pendingRetakeCodeSet.size;
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section>
            <div className="flex items-center justify-between gap-3">
                <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setIsExpanded((current) => !current)}
                    className="flex min-w-0 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30 focus-visible:ring-offset-2"
                >
                    <BookOpen className="h-5 w-5 shrink-0 text-[#004A98]" />
                    <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800">Môn học cải thiện</h4>
                        {!isExpanded && (
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                                {manualRetakeItems.length > 0 ? `${manualRetakeItems.length} môn đã chọn.` : 'Chưa chọn môn cải thiện.'}
                            </p>
                        )}
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                    <div className="flex shrink-0 items-center gap-2">
                        <div className="group relative">
                            <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
                            <div className="pointer-events-none invisible absolute right-0 bottom-full z-20 mb-2 w-64 rounded-lg bg-gray-900 p-2 text-[11px] text-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                                Thêm các môn bạn dự định học cải thiện để xem GPA thay đổi thế nào.
                            </div>
                        </div>

                        <div className="relative" ref={retakePickerRef}>
                            <button
                                type="button"
                                onClick={() => setIsRetakePickerOpen(!isRetakePickerOpen)}
                                className="flex items-center gap-1.5 rounded-lg bg-[#004A98] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#003A78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30 focus-visible:ring-offset-2"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Thêm môn
                            </button>

                            {isRetakePickerOpen && (
                                <div className="absolute right-0 top-full z-[100] mt-2 flex max-h-[32rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                                    <div className="space-y-3 border-b border-gray-100 bg-gray-50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs font-semibold text-gray-700">Chọn môn cải thiện · {scopeName}</p>
                                            <button type="button" onClick={() => setIsRetakePickerOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600" title="Đóng">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                autoFocus
                                                value={retakeSearchTerm}
                                                onChange={(event) => setRetakeSearchTerm(event.target.value)}
                                                placeholder="Tìm mã hoặc tên môn..."
                                                className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="min-h-[10rem] flex-1 overflow-y-auto">
                                        {selectableRetakeCourses.length === 0 ? (
                                            <p className="p-6 text-center text-sm text-gray-500">Không còn môn nào có thể cải thiện.</p>
                                        ) : filteredSelectableRetakeCourses.length === 0 ? (
                                            <p className="p-6 text-center text-sm text-gray-500">Không tìm thấy môn phù hợp.</p>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {filteredSelectableRetakeCourses.map((course) => {
                                                    const isPending = pendingRetakeCodeSet.has(course.code);
                                                    return (
                                                        <button
                                                            key={course.code}
                                                            type="button"
                                                            onClick={() => togglePendingRetakeCode(course.code)}
                                                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#EAF3FF] ${isPending ? 'bg-[#EAF3FF]' : ''}`}
                                                        >
                                                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isPending ? 'border-[#004A98] bg-[#004A98] text-white' : 'border-gray-300 text-transparent'}`}>
                                                                <Check className="h-3.5 w-3.5" />
                                                            </span>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-gray-800">{course.nameVi}</p>
                                                                <p className="mt-0.5 text-xs text-gray-500">{course.code} · {course.credits} TC · Điểm hiện tại {course.currentGrade.toFixed(decimals)}</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 border-t border-gray-100 bg-gray-50 p-3">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Đã chọn {pendingRetakeCount} môn</span>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={selectAllFilteredRetakes} className="font-medium text-[#004A98] hover:underline">Chọn hết</button>
                                                <button type="button" onClick={clearPendingFilteredRetakes} className="font-medium text-red-600 hover:underline">Bỏ chọn</button>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addPendingRetakes}
                                            disabled={pendingRetakeCount === 0}
                                            className="w-full rounded-lg bg-[#004A98] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#003A78] disabled:cursor-not-allowed disabled:bg-gray-300"
                                        >
                                            Thêm {pendingRetakeCount} môn đã chọn
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                    {manualRetakeItems.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-[620px] w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs text-gray-500">
                                        <th className="px-2 py-2 text-left font-medium">Môn học</th>
                                        <th className="px-2 py-2 text-center font-medium">TC</th>
                                        <th className="px-2 py-2 text-center font-medium">Điểm cũ</th>
                                        <th className="px-2 py-2 text-center font-medium">Mục tiêu</th>
                                        <th className="px-2 py-2 text-center font-medium">Tác động</th>
                                        <th className="w-10 px-2 py-2" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {manualRetakeItems.map((item) => {
                                        const draft = draftManualRetakeTargets[item.code];
                                        const error = draftManualRetakeTargetErrors[item.code];
                                        return (
                                            <tr key={item.code} className="hover:bg-gray-50/70">
                                                <td className="max-w-0 px-2 py-3">
                                                    <p className="truncate text-sm font-medium text-gray-800">{item.nameVi}</p>
                                                    <p className="mt-0.5 text-xs font-mono text-gray-500">{item.code}</p>
                                                </td>
                                                <td className="px-2 py-3 text-center text-sm text-gray-600">{item.credits}</td>
                                                <td className="px-2 py-3 text-center text-sm font-medium tabular-nums text-gray-500">{item.currentGrade.toFixed(decimals)}</td>
                                                <td className="px-2 py-3 text-center">
                                                    <div className="relative inline-block">
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={draft ?? item.targetGrade.toFixed(decimals)}
                                                            onChange={(event) => handleManualRetakeTargetInputChange(item.code, event.target.value)}
                                                            onBlur={() => commitManualRetakeTargetInput(item.code, item.targetGrade)}
                                                            onKeyDown={(event) => event.key === 'Enter' && (event.target as HTMLInputElement).blur()}
                                                            className={`w-16 rounded-lg border bg-white px-2 py-1.5 text-center text-sm font-semibold tabular-nums outline-none focus:ring-2 ${error ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:border-[#004A98] focus:ring-[#004A98]/20'}`}
                                                            aria-label={`Điểm mục tiêu ${item.nameVi}`}
                                                        />
                                                        {error && <p className="absolute left-1/2 top-full z-10 mt-1 w-36 -translate-x-1/2 rounded bg-red-600 p-1.5 text-[10px] text-white shadow-lg">{error}</p>}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3 text-center">
                                                    <p className="text-sm font-semibold tabular-nums text-emerald-700">+{item.impactPoints.toFixed(decimals)}</p>
                                                    <p className="mt-0.5 text-xs tabular-nums text-gray-500">Tăng {item.improveDelta.toFixed(decimals)}</p>
                                                </td>
                                                <td className="px-2 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeManualRetake(item.code)}
                                                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                                                        title={`Bỏ ${item.nameVi}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="border-t border-gray-200 bg-gray-50/70">
                                    <tr>
                                        <td colSpan={4} className="px-2 py-2.5 text-right text-xs font-medium text-gray-500">Tổng tác động GPA</td>
                                        <td className="px-2 py-2.5 text-center text-sm font-semibold tabular-nums text-emerald-700">+{manualRetakeImpact.avgGpaLift.toFixed(4)}</td>
                                        <td className="px-2 py-2.5 text-right">
                                            <button
                                                type="button"
                                                onClick={clearAllManualRetakes}
                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                title="Xóa toàn bộ môn cải thiện"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <p className="py-3 text-sm text-gray-500">Chưa chọn môn nào để cải thiện.</p>
                    )}
                </div>
            )}
        </section>
    );
}
