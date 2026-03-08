export function Note() {
    return (
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
                    <span>Lớp đã xếp</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-red-200 border border-red-400" />
                    <span>Trùng lịch</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-sky-100 border border-sky-300" />
                    <span>Buổi sáng</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-300" />
                    <span>Buổi chiều</span>
                </div>
            </div>
    )
}