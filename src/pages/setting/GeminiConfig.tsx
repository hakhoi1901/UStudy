import { useState, useEffect } from 'react';
import { Bot, Key, Save, Trash2, ExternalLink } from 'lucide-react';
import { useAppNotification } from '../../context/NotificationContext';
import { GeminiService } from '../../logic/GeminiService';

export function GeminiConfig() {
    const [apiKey, setApiKey] = useState('AIzaSyBTZAgfFgiCqlVfXEBX6ZG19l2BLDejXLU');
    const [isSaved, setIsSaved] = useState(false);
    const { addNotification } = useAppNotification();

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setApiKey(savedKey);
            setIsSaved(true);
        }
    }, []);

    const handleSave = () => {
        if (!apiKey.trim()) {
            addNotification({
                title: 'Lỗi',
                message: 'Vui lòng nhập API Key.',
                type: 'error'
            });
            return;
        }

        const gemini = GeminiService.getInstance();
        gemini.init(apiKey.trim());
        setIsSaved(true);

        addNotification({
            title: 'Thành công',
            message: 'Đã lưu Gemini API Key.',
            type: 'success'
        });
    };

    const handleClear = () => {
        const gemini = GeminiService.getInstance();
        gemini.clearApiKey();
        setApiKey('');
        setIsSaved(false);

        addNotification({
            title: 'Thông báo',
            message: 'Đã xóa Gemini API Key.',
            type: 'info'
        });
    };

    return (
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6">
            <h2 className="text-gray-900 flex items-center gap-2 font-semibold mb-2">
                <Bot className="w-7 h-7" />
                Cấu hình Gemini AI
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Nhập API Key của bạn để sử dụng tính năng Trợ lý ảo (Chatbot).
                Dữ liệu được lưu an toàn trong trình duyệt của bạn.
            </p>

            <div className="space-y-4">
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Key size={14} /> Gemini API Key
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Nhập API Key tại đây..."
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all"
                        />
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isSaved
                                ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                }`}
                        >
                            <Save size={18} />
                            {isSaved ? 'Đã lưu' : 'Lưu Key'}
                        </button>
                        {isSaved && (
                            <button
                                onClick={handleClear}
                                className="flex items-center justify-center p-2.5 rounded-lg text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all shadow-sm"
                                title="Xóa Key"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                        Cách lấy API Key miễn phí?
                    </h3>
                    <p className="text-xs text-blue-700 leading-relaxed mb-3">
                        Bạn có thể tạo Key miễn phí tại Google AI Studio để sử dụng cho mục đích cá nhân.
                    </p>
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 underline transition-colors"
                    >
                        Lấy API Key tại đây <ExternalLink size={12} />
                    </a>
                </div>
            </div>
        </div>
    );
}
