import { useState } from 'react';
import { X, Send, Info } from 'lucide-react';
import { APP_CONFIG } from '../config';

// định nghĩa props cho DocumentContributionModal
interface DocumentContributionModalProps {
    courseId: string;
    courseName: string;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * 
 * @param courseId mã môn học
 * @param courseName tên môn học
 * @param isOpen trạng thái mở modal
 * @param onClose hàm đóng modal
 * @returns trả về component DocumentContributionModal hiển thị thông tin môn học
 */
export function DocumentContributionModal({
    courseId,
    courseName,
    isOpen,
    onClose
}: DocumentContributionModalProps) {
    const [driveLink, setDriveLink] = useState('');
    const [otherType, setOtherType] = useState('');
    const [selectedTypes, setSelectedTypes] = useState({
        exams: false,
        slides: false,
        books: false,
        theory: false,
        practice: false,
        other: false,
    });

    if (!isOpen) return null;

    const handleCheckboxChange = (type: keyof typeof selectedTypes) => {
        setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleSendEmail = () => {
        const email = APP_CONFIG.CONTACT.GROUP_EMAIL;
        const subject = APP_CONFIG.CONTACT.DOCUMENT_CONTRIBUTION_SUBJECT_PREFIX + courseId + ' - ' + courseName;

        const includedDocs = [];
        if (selectedTypes.exams) includedDocs.push('- Đề thi');
        if (selectedTypes.slides) includedDocs.push('- Slide bài giảng');
        if (selectedTypes.books) includedDocs.push('- Giáo trình / Tham khảo');
        if (selectedTypes.theory) includedDocs.push('- Bài tập Lý thuyết');
        if (selectedTypes.practice) includedDocs.push('- Bài tập Thực hành');
        if (selectedTypes.other || otherType) includedDocs.push(`- Khác: ${otherType}`);

        const docsString = includedDocs.length > 0
            ? `\n\nCác loại tài liệu mình chia sẻ bao gồm:\n${includedDocs.join('\n')}`
            : '';

        const body = `Chào admin,\n\nMình muốn đóng góp tài liệu cho môn:\n- Mã môn: ${courseId}\n- Tên môn: ${courseName}\n\nLink thư mục Drive của mình:\n${driveLink}${docsString}`;

        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-06 max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Đặt flex-none để không bị bóp méo khi thu hẹp không gian */}
                <div className="flex-none flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/80">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 px-1">Đóng góp tài liệu</h2>
                        <p className="text-sm font-medium text-[#004A98] px-1">{courseId} - {courseName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content: Đặt flex-1 và overflow-y-auto để phần này cuộn được nếu nội dung quá dài */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* Instructions & Checkboxes */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Phân loại tài liệu trong Drive
                        </h4>
                        <p className="text-sm text-blue-800 mb-1.5">Đầu tiên admin xin cảm ơn bạn đã đóng góp tài liệu cho cộng đồng!</p>
                        <p className="text-sm text-blue-800 mb-3">Để dễ dàng phân loại, bạn vui lòng tạo các thư mục tương ứng trong Drive và tích vào ô bên dưới:</p>

                        <div className="grid grid-cols-1 gap-1.5 text-sm font-medium text-blue-800">
                            {[
                                { id: 'exams', label: '1. Đề thi' },
                                { id: 'slides', label: '2. Slide bài giảng' },
                                { id: 'books', label: '3. Giáo trình / Tham khảo' },
                                { id: 'theory', label: '4. Bài tập Lý thuyết' },
                                { id: 'practice', label: '5. Bài tập Thực hành' },
                            ].map((item) => (
                                <label key={item.id} className="flex items-center gap-2 bg-white/60 p-2 rounded border border-blue-200/50 cursor-pointer hover:bg-white/80 transition-colors">
                                    <input type="checkbox" checked={selectedTypes[item.id as keyof typeof selectedTypes]} onChange={() => handleCheckboxChange(item.id as keyof typeof selectedTypes)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span>{item.label}</span>
                                </label>
                            ))}

                            <label className="flex items-center flex-wrap gap-2 bg-white/60 p-2 rounded border border-blue-200/50 cursor-pointer hover:bg-white/80 transition-colors">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={selectedTypes.other} onChange={() => handleCheckboxChange('other')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span>6. Khác</span>
                                </div>
                                <input
                                    type="text"
                                    onChange={(e) => setOtherType(e.target.value)}
                                    value={otherType}
                                    placeholder="Ghi rõ loại tài liệu..."
                                    // Chú ý: w-085 là class không tồn tại trong Tailwind chuẩn, đã đổi thành flex-1 để tự động điền đầy không gian
                                    className="flex-1 min-w-[200px] px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#004A98] focus:border-[#004A98] shadow-sm outline-none transition-all text-sm"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Form */}
                    <div className='p-2'>
                        <label htmlFor="driveLink" className="block p-1 text-sm font-medium text-gray-700 mb-1.5">
                            Liên kết thư mục Google Drive (Vui lòng mở quyền truy cập)
                        </label>
                        <input
                            type="url"
                            id="driveLink"
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#004A98] focus:border-[#004A98] shadow-sm outline-none transition-all text-sm"
                        />
                    </div>

                </div>

                {/* Footer: Đặt flex-none tương tự Header */}
                <div className="flex-none flex items-center justify-end gap-3 p-3 border-t border-gray-100 bg-gray-50/80">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={!driveLink.trim()}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#004A98] rounded hover:bg-[#003d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                        Gửi email đóng góp
                    </button>
                </div>
            </div>
        </div>
    );
}