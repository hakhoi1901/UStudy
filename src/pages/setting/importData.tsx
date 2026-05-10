import { Download, Upload, Database } from "lucide-react";
import { verifyBackupPin, importBackupWithCurrentKey, hasSecureData } from "../../helpers/localStorage/save";
import { SecurityLock } from "../../components/SecurityLock";
import { useRef, useState } from "react";
import { useCrypto } from "../../context/CryptoContext";

export function ImportData() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingImport, setPendingImport] = useState<any>(null);
    const { cryptoKey } = useCrypto();

    const handleExport = () => {
        try {
            const store: Record<string, string> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    store[key] = localStorage.getItem(key) || "";
                }
            }

            const exportData = {
                metadata: {
                    version: "2.0",
                    exportedAt: new Date().toISOString(),
                    source: "hcmus-portal-tool"
                },
                data: store
            };

            const data = JSON.stringify(exportData, null, 2);
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

                const importedContent = JSON.parse(result);
                
                // Hỗ trợ cả định dạng mới (có metadata) và định dạng cũ (flat object)
                let dataToImport = importedContent;
                if (importedContent.metadata && importedContent.data && importedContent.metadata.source === "hcmus-portal-tool") {
                    dataToImport = importedContent.data;
                }

                // Kiểm tra xem file có chứa các key đúng hay ko
                const hasValidPortalData = Object.keys(dataToImport).some(key =>
                    key.startsWith('db_') || key.startsWith('app_') || key.includes('semester') || key === 'raw_student_db'
                );

                if (!hasValidPortalData || typeof dataToImport !== 'object' || Array.isArray(dataToImport)) {
                    alert('Lỗi: File này không chứa dữ liệu hợp lệ của hệ thống!');
                    return;
                }

                // Xác nhận với người dùng
                if (window.confirm("Hành động này sẽ ghi đè dữ liệu hiện tại. Bạn có chắc chắn muốn tiếp tục?")) {
                    if (dataToImport['__pbkdf2_salt__'] && dataToImport['__pin_verify__']) {
                        setPendingImport(dataToImport);
                    } else {
                        // File cũ không mã hóa
                        Object.keys(dataToImport).forEach(key => {
                            localStorage.setItem(key, dataToImport[key]);
                        });
                        alert('Nhập dữ liệu thành công! Trang sẽ được tải lại.');
                        window.location.reload();
                    }
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
                {pendingImport && (
                    <SecurityLock 
                        setupMode={false} 
                        customTitle="Xác thực tệp sao lưu"
                        customSubtitle="Nhập mật khẩu đã tạo khi xuất tệp dữ liệu này để khôi phục."
                        customVerify={async (pin) => {
                             const isValid = await verifyBackupPin(pin, pendingImport['__pbkdf2_salt__'], pendingImport['__pin_verify__']);
                             if (isValid) {
                                 if (hasSecureData() && cryptoKey) {
                                     // Nếu máy đang có mật khẩu, decrypt file và mã hoá lại bằng mật khẩu hiện tại
                                     await importBackupWithCurrentKey(pendingImport, pin, cryptoKey);
                                 } else if (hasSecureData() && !cryptoKey) {
                                     // Trạng thái bất thường — SecurityGate đáng lẽ đã chặn
                                     console.error('[importData] cryptoKey null khi hasSecureData=true');
                                     alert('Lỗi bảo mật: Vui lòng tải lại trang và đăng nhập lại.');
                                     return false;
                                 } else {
                                     // Máy chưa có mật khẩu → ghi đè toàn bộ (mang mật khẩu của file)
                                     Object.keys(pendingImport).forEach(key => {
                                         localStorage.setItem(key, pendingImport[key]);
                                     });
                                 }
                             }
                             return isValid;
                        }}
                        onUnlock={() => {
                            alert('Khôi phục dữ liệu thành công! Ứng dụng sẽ khởi động lại.');
                            setPendingImport(null);
                            window.location.reload();
                        }}
                    />
                )}
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