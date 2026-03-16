/* setting.tsx
** Trang Cài đặt
*/

import { Bookmark, User } from 'lucide-react';
import { PrivacyFooter } from '../../components/PrivacyFooter';
import { SettingUserProfile } from './SettingUserProfile';
import { useStudentDb } from '../../hooks/useStudentDb';
import { BookmarkletButton } from '../../components/BookmarkletButton';
import { ReportError } from './reportError';
import { GeminiConfig } from './GeminiConfig';

export function Setting() {
    const { name } = useStudentDb();
    return (
        <div className="flex h-full gap-6">
            <div className="flex-1 overflow-y-auto">
                <div className="mb-6 items-center">
                    <h1 className="text-gray-900 mb-2">Cài đặt</h1>
                    <p className="text-gray-600 mb-8">Quản lý tài khoản và tùy chọn của bạn.</p>
                </div>

                <div className="flex flex-col items-center">
                    <div className="bg-white w-full rounded-xl p-5 border border-gray-200 shadow-sm mb-6">
                        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6">
                            <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                                <User className="w-7 h-7" />Thông tin cá nhân
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">Quản lý thông tin cá nhân của bạn.</p>
                            <div className="flex flex-col gap-2">
                                <div className="text-gray-600"> Tên: {name}</div>
                            </div>
                        </div>

                        <SettingUserProfile />

                        <GeminiConfig />

                        {/* Phần: Công cụ đồng bộ */}
                        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6">
                            <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                                <Bookmark />
                                Công cụ đồng bộ dữ liệu
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Kéo và thả nút bên dưới lên thanh Dấu trang (Bookmarks bar) của trình duyệt để dễ dàng lấy điểm và lịch học từ Portal.
                            </p>
                            <BookmarkletButton variant="outline" hideInstructions={true} />
                        </div>


                        <ReportError />
                    </div>

                    <PrivacyFooter />
                </div>
            </div>
        </div>
    );
}