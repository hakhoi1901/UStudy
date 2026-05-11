import { Calculator, ChevronUp, ChevronDown } from 'lucide-react';
import type { GPAPullHeaderProps } from '../../types';

export function GPAPullHeader({ expanded, setExpanded }: GPAPullHeaderProps) {
    return (
        <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
            <div className="flex items-center gap-3">
                <Calculator className="w-8 h-8 text-[#004A98]" />
                <h3 className="text-sm font-semibold text-gray-800">Công cụ &quot;Kéo&quot; GPA</h3>
                <span className="text-xs text-gray-500 hidden sm:inline">
                    Nhập GPA mong muốn lúc ra trường → điểm TB tối thiểu + đề xuất từng môn
                </span>
            </div>
            {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
        </button>
    );
}
