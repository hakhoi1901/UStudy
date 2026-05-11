import { BookOpen, Search, Plus, X, Trash2, HelpCircle } from 'lucide-react';
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
    scopeName
}: GPAPullManualRetakeProps) {
    const pendingRetakeCount = pendingRetakeCodeSet.size;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#004A98]" />
                    <h4 className="text-sm font-semibold text-gray-800">Môn học cải thiện (Manual)</h4>
                    <div className="group relative">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-[11px] rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                            Thêm các môn bạn dự định học cải thiện để xem GPA mục tiêu thay đổi thế nào.
                        </div>
                    </div>
                </div>

                <div className="relative" ref={retakePickerRef}>
                    <button
                        onClick={() => setIsRetakePickerOpen(!isRetakePickerOpen)}
                        className="px-3 py-1.5 bg-[#004A98] text-white text-xs font-medium rounded-lg hover:bg-[#003d7e] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm môn cải thiện
                    </button>

                    {isRetakePickerOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] flex flex-col max-h-[32rem]">
                            <div className="p-3 border-b border-gray-100 space-y-3 bg-gray-50 rounded-t-xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-700">Chọn môn cải thiện ({scopeName})</span>
                                    <button onClick={() => setIsRetakePickerOpen(false)}>
                                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        autoFocus
                                        value={retakeSearchTerm}
                                        onChange={(e) => setRetakeSearchTerm(e.target.value)}
                                        placeholder="Tìm mã hoặc tên môn..."
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar min-h-[10rem]">
                                {selectableRetakeCourses.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 italic text-sm">
                                        Không còn môn nào khả dụng để cải thiện.
                                    </div>
                                ) : filteredSelectableRetakeCourses.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 italic text-sm">
                                        Không tìm thấy môn nào phù hợp.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {filteredSelectableRetakeCourses.map((course) => {
                                            const isPending = pendingRetakeCodeSet.has(course.code);
                                            return (
                                                <button
                                                    key={course.code}
                                                    onClick={() => togglePendingRetakeCode(course.code)}
                                                    className={`w-full flex items-center justify-between p-3 hover:bg-blue-50 transition-colors text-left group ${isPending ? 'bg-blue-50/70' : ''}`}
                                                >
                                                    <div className="flex-1 min-w-0 pr-3">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-[11px] font-bold text-[#004A98] bg-blue-50 px-1.5 py-0.5 rounded uppercase">{course.code}</span>
                                                            <span className="text-xs text-gray-500">{course.credits} TC</span>
                                                        </div>
                                                        <p className="text-sm text-gray-800 font-medium line-clamp-1">{course.nameVi}</p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">Điểm hiện tại: <span className="font-bold text-gray-700">{course.currentGrade.toFixed(decimals)}</span></p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isPending ? 'bg-[#004A98] border-[#004A98] shadow-sm' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                        {isPending && <Plus className="w-3.5 h-3.5 text-white" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                                    <span>Đã chọn {pendingRetakeCount} môn</span>
                                    <div className="flex gap-2">
                                        <button onClick={selectAllFilteredRetakes} className="text-[#004A98] hover:underline font-medium">Chọn hết ({filteredSelectableRetakeCourses.length})</button>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={clearPendingFilteredRetakes} className="text-red-500 hover:underline font-medium">Bỏ chọn</button>
                                    </div>
                                </div>
                                <button
                                    onClick={addPendingRetakes}
                                    disabled={pendingRetakeCount === 0}
                                    className="w-full py-2 bg-[#004A98] text-white text-sm font-bold rounded-lg hover:bg-[#003d7e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                                >
                                    Xác nhận thêm {pendingRetakeCount} môn
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {manualRetakeItems.length > 0 ? (
                <div className="space-y-3">
                    <div className="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Môn học</th>
                                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">TC</th>
                                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Điểm cũ</th>
                                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Mục tiêu</th>
                                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Tác động</th>
                                    <th className="px-4 py-2.5 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {manualRetakeItems.map((item) => {
                                    const draft = draftManualRetakeTargets[item.code];
                                    const error = draftManualRetakeTargetErrors[item.code];
                                    return (
                                        <tr key={item.code} className="hover:bg-gray-50/50 group transition-colors">
                                            <td className="px-4 py-2.5">
                                                <p className="text-xs font-bold text-gray-800 leading-tight mb-0.5 line-clamp-1">{item.nameVi}</p>
                                                <p className="text-[10px] text-gray-500 font-mono uppercase">{item.code}</p>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className="text-xs font-medium text-gray-600">{item.credits}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className="text-xs font-bold text-gray-400">{item.currentGrade.toFixed(decimals)}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center min-w-[80px]">
                                                <div className="relative inline-block">
                                                    <input
                                                        type="text"
                                                        value={draft ?? item.targetGrade.toFixed(decimals)}
                                                        onChange={(e) => handleManualRetakeTargetInputChange(item.code, e.target.value)}
                                                        onBlur={() => commitManualRetakeTargetInput(item.code, item.targetGrade)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        className={`w-14 px-1.5 py-1 text-center text-xs font-bold rounded border bg-gray-50 focus:outline-none focus:ring-1 ${error ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-[#004A98]'}`}
                                                    />
                                                    {error && (
                                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-32 p-1.5 bg-red-600 text-white text-[9px] rounded shadow-lg z-10 pointer-events-none">
                                                            {error}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[11px] font-bold text-green-600">+{item.impactPoints.toFixed(decimals)} pts</span>
                                                    <span className="text-[9px] text-gray-400">Δ {item.improveDelta.toFixed(decimals)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <button
                                                    onClick={() => removeManualRetake(item.code)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Xóa môn này"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-50/80 border-t border-gray-100">
                                <tr>
                                    <td colSpan={4} className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Tổng tác động GPA:</td>
                                    <td className="px-4 py-2.5 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-green-700">+{manualRetakeImpact.avgGpaLift.toFixed(4)}</span>
                                            <span className="text-[9px] text-gray-400">/ Toàn khóa</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button
                                            onClick={clearAllManualRetakes}
                                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Xóa toàn bộ môn cải thiện"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="p-8 border-2 border-dashed border-gray-100 rounded-xl text-center bg-gray-50/50">
                    <p className="text-sm text-gray-400">Chưa có môn học cải thiện nào được chọn.</p>
                    <button
                        onClick={() => setIsRetakePickerOpen(true)}
                        className="mt-2 text-xs font-semibold text-[#004A98] hover:underline"
                    >
                        Bấm để thêm ngay
                    </button>
                </div>
            )}
        </div>
    );
}
