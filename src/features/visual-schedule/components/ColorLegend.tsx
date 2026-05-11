// ColorLegend.tsx
const COLOR_LEGEND = [
    { color: 'green', label: 'Toán học', bgClass: 'bg-green-100', borderClass: 'border-green-600' },
    { color: 'yellow', label: 'Chính trị - Thể chất - Anh văn - ...', bgClass: 'bg-yellow-100', borderClass: 'border-yellow-600' },
    { color: 'blue', label: 'Cơ sở ngành / Chuyên ngành', bgClass: 'bg-blue-100', borderClass: 'border-blue-600' },
    { color: 'purple', label: 'Khác', bgClass: 'bg-purple-100', borderClass: 'border-purple-600' },
];

export function ColorLegend() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-6 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Màu môn học:</span>
                {COLOR_LEGEND.map((item) => (
                    <div key={item.color} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 ${item.bgClass} ${item.borderClass}`} />
                        <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                ))}
                <div className="flex items-center gap-2 ml-auto">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[11px] text-blue-600 font-medium">Bấm vào môn để tùy chỉnh nhanh</span>
                </div>
            </div>
        </div>
    );
}