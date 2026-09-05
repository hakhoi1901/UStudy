import { useState } from "react";
import { MailWarning } from "lucide-react";
import { APP_CONFIG } from '../../../config/appConfig';
import { openReportEmail, type ReportEmailOpenResult } from '../services/report-error';

export function ReportError() {
    const [errorTitle, setErrorTitle] = useState("");
    const [errorText, setErrorText] = useState("");
    const [openResult, setOpenResult] = useState<ReportEmailOpenResult | null>(null);

    const handleOpenReportEmail = () => {
        setOpenResult(openReportEmail(errorTitle, errorText));
    };

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

            <button
                type="button"
                onClick={handleOpenReportEmail}
                className="ustudy-button-primary h-9 shrink-0 px-3"
            >
                Gửi
            </button>

            {openResult === 'mailto' && (
                <p className="mt-3 text-sm text-amber-700" role="status">
                    Không mở được Gmail nên UStudy đã thử ứng dụng email mặc định. Nếu ứng dụng không mở, vui lòng gửi email tới{' '}
                    <strong>{APP_CONFIG.CONTACT.GROUP_EMAIL}</strong>.
                </p>
            )}

            {openResult === 'manual' && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                    Không thể mở Gmail hoặc ứng dụng email. Vui lòng gửi email thủ công tới{' '}
                    <strong>{APP_CONFIG.CONTACT.GROUP_EMAIL}</strong>.
                </p>
            )}
        </div>
    );
}
