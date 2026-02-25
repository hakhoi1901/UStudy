import { PrivacyFooter } from '../components/PrivacyFooter';

export function Setting() {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-gray-900 mb-2">Cài đặt</h1>
            <p className="text-gray-600 mb-8">Quản lý tài khoản và tùy chọn của bạn.</p>
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <p className="text-gray-500">Trang cài đặt đang được phát triển...</p>
            </div>

            <PrivacyFooter />
        </div>
    );
}