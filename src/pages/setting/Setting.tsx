/* setting.tsx
** Trang Cài đặt
*/

import { PrivacyFooter } from '../../components/PrivacyFooter';
import { SettingUserProfile } from './SettingUserProfile';

export function Setting() {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-gray-900 mb-2">Cài đặt</h1>
            <p className="text-gray-600 mb-8">Quản lý tài khoản và tùy chọn của bạn.</p>

            {/* Chọn Khoa / Ngành / Khóa / Năm học */}
            <SettingUserProfile />

            <PrivacyFooter />
        </div>
    );
}