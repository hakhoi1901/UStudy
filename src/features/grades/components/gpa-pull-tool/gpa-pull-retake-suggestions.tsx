import { TrendingUp, Plus } from 'lucide-react';
import type { GPAPullRetakeSuggestionsProps } from '../../types';


export function GPAPullRetakeSuggestions({
    retakeSuggestions,
    addManualRetake,
    decimals,
    scopeName
}: GPAPullRetakeSuggestionsProps) {
    if (retakeSuggestions.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-700">
                <TrendingUp className="w-5 h-5" />
                <h4 className="text-sm font-semibold">Gợi ý môn học cải thiện ({scopeName})</h4>
            </div>

            <div className="bg-orange-50/50 rounded-xl border border-orange-100 overflow-hidden">
                <div className="p-4 border-b border-orange-100">
                    <p className="text-xs text-orange-800 leading-relaxed">
                        Các môn học có số tín chỉ cao và điểm hiện tại thấp sẽ giúp &quot;vớt&quot; GPA nhanh nhất. Bấm <b>Thêm</b> để đưa vào kế hoạch tính toán.
                    </p>
                </div>

                <div className="divide-y divide-orange-100">
                    {retakeSuggestions.map((item) => (
                        <div key={item.code} className="p-4 flex items-center justify-between hover:bg-orange-100/50 transition-colors group">
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded uppercase">{item.code}</span>
                                    <span className="text-xs text-gray-500">{item.credits} TC</span>
                                </div>
                                <p className="text-sm text-gray-800 font-medium line-clamp-1">{item.nameVi}</p>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">Điểm hiện tại</span>
                                        <span className="text-xs font-bold text-gray-700">{item.currentGrade.toFixed(decimals)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">Tác động tối đa</span>
                                        <span className="text-xs font-bold text-green-600">+{item.impactPoints.toFixed(decimals)} pts</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => addManualRetake(item.code)}
                                className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 opacity-80 group-hover:opacity-100"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Thêm
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
