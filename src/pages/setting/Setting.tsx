import { Bookmark, User, Shield, Lock } from 'lucide-react';
import { useState } from 'react';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { SettingUserProfile } from './SettingUserProfile';
import { useStudentDb } from '../../hooks/useStudentDb';
import { ImportData } from './importData';
import { ReportError } from './reportError';
import { BookmarkletButton } from '../../components/BookmarkletButton';
import { ChangePinModal } from '../../components/ChangePinModal';
import { useCrypto } from '../../context/CryptoContext';

export function Setting() {
    const { name } = useStudentDb();
    const { lock, hasData } = useCrypto();
    const [showChangePinModal, setShowChangePinModal] = useState(false);

    const handleLockNow = () => {
        lock();
        window.location.reload();
    };

    return (
        <div className="max-w-[1600px] mx-auto w-full">
            <div className="mb-4 md:mb-8">
                <h1 className="text-gray-900 mb-1 md:mb-2">Cài đặt</h1>
                <p className="text-gray-600 text-sm md:text-base">Quản lý tài khoản và tùy chọn của bạn.</p>
            </div>

            <div className="flex flex-col items-center">
                <div className="w-full max-w-4xl flex flex-col gap-4 md:gap-6">
                    {/* Thông tin cá nhân */}
                    <div className="bg-white rounded-xl p-4 md:p-8 border border-gray-200 shadow-sm w-full">
                                <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                                    <User className="w-7 h-7" />Thông tin cá nhân
                                </h2>
                                <p className="text-sm text-gray-500 mb-6">Quản lý thông tin cá nhân của bạn.</p>
                                <div className="flex flex-col gap-2">
                                    <div className="text-gray-600"> Tên: {name}</div>
                                </div>
                            </div>

                    <SettingUserProfile />

                    {/* Công cụ đồng bộ dữ liệu */}
                    <div className="bg-white rounded-xl p-4 md:p-8 border border-gray-200 shadow-sm w-full">
                                <div className="pb-6 border-b border-gray-200">
                                    <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                                        <Bookmark className="w-5 h-5" />
                                        Công cụ đồng bộ dữ liệu
                                    </h2>
                                    <p className="text-sm text-gray-500 flex-grow">
                                        Kéo và thả nút bên dưới lên thanh Dấu trang (Bookmarks bar) của trình duyệt để dễ dàng lấy điểm và lịch học từ Portal.
                                    </p>
                                    <div className="flex justify-start mt-4">
                                        <BookmarkletButton variant="outline" hideInstructions={true} className="flex flex-row items-center justify-start w-auto" />
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <ImportData />
                                </div>
                            </div>

                    {/* Bảo mật */}
                    {hasData && (
                        <div className="bg-white rounded-xl p-4 md:p-8 border border-gray-200 shadow-sm w-full">
                                    <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                        Bảo mật
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Dữ liệu của bạn được mã hóa bằng PBKDF2 + AES-GCM. Chỉ bạn mới có thể giải mã bằng mã PIN.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => setShowChangePinModal(true)}
                                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Đổi mã PIN
                                        </button>
                                        <button
                                            onClick={handleLockNow}
                                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                                        >
                                            <Lock className="w-4 h-4" />
                                            Khóa ngay
                                        </button>
                                    </div>
                                </div>
                            )}

                    <ReportError />
                </div>
            </div>

            <div className="mt-8">
                <PrivacyFooter />
            </div>

            {showChangePinModal && (
                <ChangePinModal onClose={() => setShowChangePinModal(false)} />
            )}
        </div>
    );
}