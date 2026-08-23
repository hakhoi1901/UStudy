import { useState } from "react";
import { MailWarning } from "lucide-react";
import { APP_CONFIG } from "../../../config/appConfig";

export function ReportError() {
    const [errorTitle, setErrorTitle] = useState("");
    const [errorText, setErrorText] = useState("");

    // Sử dụng thông tin từ cấu hình chung
    const myEmail = APP_CONFIG.CONTACT.GROUP_EMAIL;
    const fixedSubject = APP_CONFIG.CONTACT.REPORT_SUBJECT_PREFIX;

    return (
        <div className="ustudy-settings-card">
            <h2 className="ustudy-settings-title">
                <MailWarning className="ustudy-settings-title-icon" />Báo cáo lỗi
            </h2>
            <p className="ustudy-settings-description">
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
                className="ustudy-button-primary h-9 shrink-0 px-3"
            >
                Gửi email báo lỗi
            </a>
        </div>
    );
}
