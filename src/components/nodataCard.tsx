
/**
 * 
 * @returns hiển thị thông báo khi không có dữ liệu
 */
export function NoDataCard() {
    return (
        <div className="flex border rounded-xl h-[calc(100vh-100px)] items-center justify-center p-4">
            <div className="w-full max-w-md border rounded-xl p-8 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50">
                <div className="flex flex-col items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Chưa có dữ liệu</h2>
                    <p className="text-gray-500 mt-2 text-center text-sm">Hoàn thành các bước sau để lấy dữ liệu môn học từ cổng thông tin</p>
                </div>

                <div className="space-y-5 mb-8">
                    <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-blue-200">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#004A98] text-white flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                        <div>
                            <p className="font-semibold text-gray-900">Chọn thông tin</p>
                            <p className="text-sm text-gray-600 mt-1">Vào tab cài đặt và chọn khoa, ngành, khóa tuyển của bạn.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-blue-200">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#004A98] text-white flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                        <div>
                            <p className="font-semibold text-gray-900">Cài đặt công cụ</p>
                            <p className="text-sm text-gray-600 mt-1">Kéo nút <span className="font-medium text-[#004A98] px-1.5 py-0.5 bg-blue-50 rounded-md">HCMUS Portal tool</span> ở góc trên bên phải vào Bookmark bar của bạn.</p>
                            <p className="text-sm text-gray-600 mt-1">Nếu chưa mở Bookmark bar, nhấn Ctrl + Shift + B để mở.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-blue-200">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#004A98] text-white flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                        <div>
                            <p className="font-semibold text-gray-900">Đăng nhập</p>
                            <p className="text-sm text-gray-600 mt-1">Nhấn nút "Đăng nhập" để chuyển sang Portal.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-blue-200">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#004A98] text-white flex items-center justify-center text-sm font-bold mt-0.5">4</div>
                        <div>
                            <p className="font-semibold text-gray-900">Lấy dữ liệu</p>
                            <p className="text-sm text-gray-600 mt-1">Đợi trang web tải xong, đăng nhập và nhấn vào <span className="font-medium text-[#004A98] px-1.5 py-0.5 bg-blue-50 rounded-md">HCMUS Portal tool</span> vừa kéo về thanh dấu trang để tự động cào dữ liệu.</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800 flex gap-3">
                    <span className="font-bold flex-shrink-0 text-amber-600">Lưu ý:</span>
                    <p>Không mở thủ công Portal, mở từ nút "Đăng nhập" để công cụ hoạt động.</p>
                </div>
            </div>
        </div>
    );
}