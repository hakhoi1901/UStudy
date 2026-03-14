import { useState } from 'react';
import { X, Send, Info, Book, FileText, Presentation, FileCode, ClipboardList, Plus } from 'lucide-react';
import { APP_CONFIG } from '../config';

interface DocumentContributionModalProps {
    courseId: string;
    courseName: string;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal đóng góp tài liệu với giao diện cao cấp
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
        window.open(mailtoLink, '_blank', 'noopener,noreferrer');
    };

    const docTypes = [
        { id: 'exams', label: 'Đề thi', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'slides', label: 'Slide bài giảng', icon: Presentation, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'books', label: 'Giáo trình', icon: Book, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'theory', label: 'BT Lý thuyết', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'practice', label: 'BT Thực hành', icon: FileCode, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
                {/* Header với HCMUS Gradient */}
                <div className="flex-none bg-gradient-to-r from-[#004A98] to-[#0066CC] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Đóng góp tài liệu</h2>
                            <div className="flex items-center gap-2 text-blue-100/90 text-sm font-medium">
                                <span className="px-2 py-0.5 bg-white/20 rounded-md backdrop-blur-sm">{courseId}</span>
                                <span>{courseName}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Welcome Section */}
                    <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-5 flex gap-4">
                        <div className="flex-none w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <div className="flex items-center justify-center w-full h-full">
                                <Info className="w-5 h-5 text-[#004A98]" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-blue-900 font-medium leading-relaxed">
                                Cảm ơn bạn đã đóng góp cho cộng đồng! Bạn vui lòng chia sẻ link Drive và chọn các loại tài liệu có sẵn trong thư mục nhé.
                            </p>
                        </div>
                    </div>

                    {/* Document Type Grid */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 ml-1">Phân loại tài liệu</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {docTypes.map((item) => {
                                const Icon = item.icon;
                                const isSelected = selectedTypes[item.id as keyof typeof selectedTypes];
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleCheckboxChange(item.id as keyof typeof selectedTypes)}
                                        className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                                            ? 'border-[#004A98] bg-blue-50/50 shadow-sm'
                                            : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50/50'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-110 ${isSelected ? 'bg-[#004A98] text-white' : `${item.bg} ${item.color}`}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-xs font-bold text-center ${isSelected ? 'text-[#004A98]' : 'text-gray-600'}`}>
                                            {item.label}
                                        </span>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-4 h-4 bg-[#004A98] rounded-full flex items-center justify-center">
                                                <div className="w-2 h-1 border-l-2 border-b-2 border-white -rotate-45 mb-0.5"></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}

                            {/* Nút Khác */}
                            <div className={`col-span-full group flex flex-col gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${selectedTypes.other
                                ? 'border-[#004A98] bg-blue-50/50'
                                : 'border-gray-100 bg-white hover:border-blue-200'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleCheckboxChange('other')}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedTypes.other ? 'bg-[#004A98] text-white' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                    <span className={`text-sm font-bold ${selectedTypes.other ? 'text-[#004A98]' : 'text-gray-600'}`}>Tài liệu khác</span>
                                    {selectedTypes.other && (
                                        <input
                                            type="text"
                                            autoFocus
                                            value={otherType}
                                            onChange={(e) => setOtherType(e.target.value)}
                                            placeholder="VD: Lab, Đề thi mẫu..."
                                            className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#004A98] outline-none shadow-sm"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Drive Link Section */}
                    <div className="space-y-3">
                        <label htmlFor="driveLink" className="block text-sm font-semibold text-gray-700 ml-1">
                            Link Google Drive <span className="text-gray-400 font-normal">(Hãy mở quyền truy cập nhé)</span>
                        </label>
                        <div className="relative group">
                            <input
                                type="url"
                                id="driveLink"
                                value={driveLink}
                                onChange={(e) => setDriveLink(e.target.value)}
                                placeholder="https://drive.google.com/drive/folders/..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#004A98] focus:border-[#004A98] outline-none transition-all shadow-sm group-hover:border-blue-200"
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                <Info className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-none flex items-center justify-end gap-3 p-6 bg-gray-50/80 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 border border-transparent rounded-xl hover:bg-gray-200/50 transition-all"
                    >
                        Bỏ qua
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={!driveLink.trim()}
                        className="flex items-center gap-2 px-8 py-2.5 bg-[#004A98] text-white text-sm font-bold rounded-xl hover:bg-[#003d7a] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-[0_4px_12px_rgba(0,74,152,0.3)]"
                    >
                        <Send className="w-4 h-4" />
                        Gửi đóng góp
                    </button>
                </div>
            </div>
        </div>
    );
}