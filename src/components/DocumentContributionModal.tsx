import { useState } from 'react';
import { X, Send, Info } from 'lucide-react';

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
        const email = 'hakhoi.contact@gmail.com';
        const subject = `[Đóng góp tài liệu] ${courseId} - ${courseName}`;

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
                style={{ width: '50%' }}
                className="bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 p-1">Đóng góp tài liệu</h2>
                        <p className="text-base font-medium text-[#004A98] p-1">{courseId} - {courseName}</p>
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

                    {/* Instructions & Checkboxes */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="flex items-center gap-2 text-base font-bold text-blue-900 mb-3">
                            <Info className="w-5 h-5 text-blue-600" />
                            Phân loại tài liệu trong Drive
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">Đầu tiên admin xin cảm ơn bạn đã đóng góp tài liệu cho cộng đồng!</p>
                        <p className="text-sm text-blue-800 mb-3">Để dễ dàng phân loại và tổng hợp tài liệu, bạn vui lòng tạo các thư mục tương ứng trong Drive theo các loại dưới đây và tích vào ô tương ứng:</p>

                        <div className="grid grid-cols-1 gap-2 text-sm font-medium text-blue-800">
                            <label className="flex items-center gap-2 bg-white/60 p-2.5 rounded border border-blue-200/50 cursor-pointer hover:bg-white/80 transition-colors">
                                <input type="checkbox" checked={selectedTypes.exams} onChange={() => handleCheckboxChange('exams')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <span>1. Đề thi</span>
                            </label>
                            <label className="flex items-center gap-2 bg-white/60 p-2.5 rounded border border-blue-200/50 cursor-pointer hover:bg-white/80 transition-colors">
                                <input type="checkbox" checked={selectedTypes.slides} onChange={() => handleCheckboxChange('slides')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <span>2. Slide bài giảng</span>
                            </label>
                            <label className="flex items-center gap-2 bg-white/60 p-2.5 rounded border border-blue-200/50 cursor-pointer hover:bg-white/80 transition-colors">
                                <input type="checkbox" checked={selectedTypes.books} onChange={() => handleCheckboxChange('books')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <span>3. Giáo trình / Tham khảo</span>
                            </label>
                            <label className="flex items-center gap-2 bg-white/60 p-2.5 rounded border border-blue-200/50 cursor-pointer hover:bg-white/80 transition-colors">
                                <input type="checkbox" checked={selectedTypes.theory} onChange={() => handleCheckboxChange('theory')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <span>4. Bài tập Lý thuyết</span>
                            </label>
                            <label className="flex items-center gap-2 bg-white/60 p-2.5 rounded border border-blue-200/50 cursor-pointer hover:bg-white/80 transition-colors">
                                <input type="checkbox" checked={selectedTypes.practice} onChange={() => handleCheckboxChange('practice')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <span>5. Bài tập Thực hành</span>
                            </label>
                            <label className="flex items-center gap-2 bg-white/60 p-2.5 rounded border border-blue-200/50 cursor-pointer hover:bg-white/80 transition-colors">
                                <input type="checkbox" checked={selectedTypes.other} onChange={() => handleCheckboxChange('other')} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <span>6. Khác</span>
                                <input type="text" onChange={(e) => setOtherType(e.target.value)} value={otherType} placeholder="Vui lòng ghi rõ loại tài liệu trong phần ghi chú" className="w-085 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-[#004A98] shadow-sm outline-none transition-all text-base" />
                            </label>
                        </div>
                    </div>

                    {/* Form */}
                    <div>
                        <label htmlFor="driveLink" className="block text-base font-medium text-gray-700 mb-2">
                            Liên kết thư mục Google Drive (Vui lòng mở quyền truy cập)
                        </label>
                        <input
                            type="url"
                            id="driveLink"
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004A98] focus:border-[#004A98] shadow-sm outline-none transition-all text-base"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50/80">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={!driveLink.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 text-base font-medium text-white bg-[#004A98] rounded-lg hover:bg-[#003d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                        Gửi email đóng góp
                    </button>
                </div>
            </div>
        </div>
    );
}
