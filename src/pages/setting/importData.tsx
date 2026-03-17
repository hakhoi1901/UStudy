import { useRef } from "react";
import { Download, Upload, Database } from "lucide-react";

export function ImportData() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        try {
            const store: Record<string, string> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    store[key] = localStorage.getItem(key) || "";
                }
            }
            const data = JSON.stringify(store);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hcmus-portal-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert("Đã xảy ra lỗi khi xuất dữ liệu.");
        }
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                if (!result) return;

                const data = JSON.parse(result);

                // Kiểm tra xem file có chứa các key đúng hay ko
                const hasValidPortalData = Object.keys(data).some(key =>
                    key.startsWith('db_') || key.startsWith('app_') || key.includes('semester')
                );

                if (!hasValidPortalData || typeof data !== 'object' || Array.isArray(data)) {
                    alert('Lỗi: File này không chứa dữ liệu hợp lệ của hệ thống!');
                    return; // Chặn ng dùng nhập file ko liên quan
                }

                // Xác nhận với người dùng
                if (window.confirm("Hành động này sẽ ghi đè dữ liệu hiện tại. Bạn có chắc chắn muốn tiếp tục?")) {
                    Object.keys(data).forEach(key => {
                        localStorage.setItem(key, data[key]);
                    });

                    alert('Nhập dữ liệu thành công! Trang sẽ được tải lại.');
                    window.location.reload();
                }
            } catch (error) {
                alert('File không hợp lệ hoặc bị lỗi!');
            }
        };
        reader.readAsText(file);

        event.target.value = '';
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                <Database className="w-5 h-5" />
                Nhập / Xuất dữ liệu
            </h2>
            <p className="text-sm text-gray-500 mb-6 flex-grow">
                Trích xuất toàn bộ dữ liệu trong localStorage thành tệp tin cục bộ. Bạn có thể sử dụng tệp tin này để khôi phục và đồng bộ hóa trải nghiệm giữa các thiết bị khác nhau.
            </p>
            <div className="flex flex-wrap gap-3 mt-auto justify-start items-center">
                <button
                    onClick={handleExport}
                    className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all focus:outline-none select-none shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-1 hover:-translate-y-0.5 bg-white border-2 border-[#004A98] text-[#004A98] hover:bg-blue-50 text-sm whitespace-nowrap"
                >
                    <Download className="w-4 h-4" strokeWidth={2.5} />
                    Xuất dữ liệu
                </button>
                <button
                    onClick={handleImportClick}
                    className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all focus:outline-none select-none shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-1 hover:-translate-y-0.5 bg-[#004A98] text-white hover:bg-[#003A78] border-2 border-transparent text-sm whitespace-nowrap"
                >
                    <Upload className="w-4 h-4" strokeWidth={2.5} />
                    Nhập dữ liệu
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImport}
                    accept=".json"
                    className="hidden"
                />
            </div>
        </div>
    );
}