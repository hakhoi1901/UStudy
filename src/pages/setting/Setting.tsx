import { Bookmark, User } from 'lucide-react';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { SettingUserProfile } from './SettingUserProfile';
import { useStudentDb } from '../../hooks/useStudentDb';
import { ImportData } from './importData';
import { ReportError } from './reportError';
import { BookmarkletButton } from '../../components/BookmarkletButton';

export function Setting() {
    const { name } = useStudentDb();
    return (
        <div className="flex h-full gap-6">
            <div className="flex-1 overflow-y-auto">
                <div className="mb-6 items-center">
                    <h1 className="text-gray-900 mb-2">Cài đặt</h1>
                    <p className="text-gray-600 mb-8">Quản lý tài khoản và tùy chọn của bạn.</p>
                </div>

                <div className="flex flex-col">
                    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6 w-full max-w-4xl flex flex-col">
                        <div className="w-full">
                            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6 w-full">
                                <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                                    <User className="w-7 h-7" />Thông tin cá nhân
                                </h2>
                                <p className="text-sm text-gray-500 mb-6">Quản lý thông tin cá nhân của bạn.</p>
                                <div className="flex flex-col gap-2">
                                    <div className="text-gray-600"> Tên: {name}</div>
                                </div>
                            </div>

                            <SettingUserProfile />

                            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6 w-full">
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

                            <ReportError />
                        </div>
                    </div>

                    <PrivacyFooter />
                </div>
            </div>
        </div>
    );
}