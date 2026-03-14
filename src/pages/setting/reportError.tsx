import { useState } from "react";
import { MailWarning } from "lucide-react";
import { APP_CONFIG } from "../../config/appConfig";

export function ReportError() {
    const [errorTitle, setErrorTitle] = useState("");
    const [errorText, setErrorText] = useState("");

    // Sử dụng thông tin từ cấu hình chung
    const myEmail = APP_CONFIG.CONTACT.GROUP_EMAIL;
    const fixedSubject = APP_CONFIG.CONTACT.REPORT_SUBJECT_PREFIX;

    return (
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6">
            <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                <MailWarning />Báo cáo lỗi
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Nếu bạn gặp bất kỳ lỗi nào khi sử dụng hệ thống, vui lòng báo cáo cho chúng tôi.
            </p>

            <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tiêu đề lỗi"
                value={errorTitle}
                onChange={(e) => setErrorTitle(e.target.value)}
            />

            <textarea
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Mô tả lỗi bạn gặp phải ở đây..."
                value={errorText}
                onChange={(e) => setErrorText(e.target.value)}
            />

            <a
                href={`mailto:${myEmail}?subject=${encodeURIComponent(fixedSubject + errorTitle)}&body=${encodeURIComponent(errorText)}`}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
                Gửi email báo lỗi
            </a>
        </div>
    );
}