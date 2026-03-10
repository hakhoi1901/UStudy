import React, { useState } from 'react';
import { X, ExternalLink, Send, Info } from 'lucide-react';

interface DocumentContributionModalProps {
    courseId: string;
    courseName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function DocumentContributionModal({
    courseId,
    courseName,
    isOpen,
    onClose
}: DocumentContributionModalProps) {
    const [driveLink, setDriveLink] = useState('');

    if (!isOpen) return null;

    const handleSendEmail = () => {
        const email = 'your.email@example.com'; // Replace with a real email
        const subject = `[Đóng góp tài liệu] ${courseId} - ${courseName}`;
        const body = `Chào admin,\n\nMình muốn đóng góp tài liệu cho môn:\n- Mã môn: ${courseId}\n- Tên môn: ${courseName}\n\nLink thư mục Drive của mình:\n${driveLink}\n\nCảm ơn admin đã cập nhật giúp cộng đồng!`;

        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Đóng góp tài liệu</h3>
                        <p className="text-sm font-medium text-[#004A98]">{courseId} - {courseName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-3">
                            <Info className="w-4 h-4 text-blue-600" />
                            Hướng dẫn tổ chức thư mục Drive
                        </h4>
                        <p className="text-sm text-blue-800 mb-2">Để giúp các bạn sinh viên khác dễ tra cứu, vui lòng sắp xếp tài liệu theo **6 thư mục** sau trong Drive gốc của bạn (nếu có):</p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-blue-700">
                            <div className="flex items-center gap-1.5 bg-white/60 p-2 rounded border border-blue-200/50">📁 1. Đề thi</div>
                            <div className="flex items-center gap-1.5 bg-white/60 p-2 rounded border border-blue-200/50">📁 2. Slide bài giảng</div>
                            <div className="flex items-center gap-1.5 bg-white/60 p-2 rounded border border-blue-200/50">📁 3. Giáo trình / Tham khảo</div>
                            <div className="flex items-center gap-1.5 bg-white/60 p-2 rounded border border-blue-200/50">📁 4. Bài tập Lý thuyết</div>
                            <div className="flex items-center gap-1.5 bg-white/60 p-2 rounded border border-blue-200/50">📁 5. Bài tập Thực hành</div>
                            <div className="flex items-center gap-1.5 bg-white/60 p-2 rounded border border-blue-200/50">📁 6. Khác</div>
                        </div>
                    </div>

                    {/* Form */}
                    <div>
                        <label htmlFor="driveLink" className="block text-sm font-medium text-gray-700 mb-2">
                            Liên kết thư mục Google Drive (Vui lòng mở quyền truy cập)
                        </label>
                        <input
                            type="url"
                            id="driveLink"
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-[#004A98] shadow-sm outline-none transition-all text-sm"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50/80">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={!driveLink.trim()}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#004A98] rounded-lg hover:bg-[#003d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                        Gửi email đóng góp
                    </button>
                </div>
            </div>
        </div>
    );
}
