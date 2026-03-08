/* setting.tsx
** Trang Cài đặt
*/

import { PrivacyFooter } from '../../components/PrivacyFooter';
import { SettingUserProfile } from './SettingUserProfile';

export function Setting() {
    return (
        <div className="flex h-full gap-6">
            <div className="flex-1 overflow-y-auto">
                <div className="mb-6 items-center">
                    <h1 className="text-gray-900 mb-2">Cài đặt</h1>
                    <p className="text-gray-600 mb-8">Quản lý tài khoản và tùy chọn của bạn.</p>
                </div>

                <div className="w-08 mx-auto">
                    <SettingUserProfile />

                    <PrivacyFooter />
                </div>
            </div>
        </div>
    );
}