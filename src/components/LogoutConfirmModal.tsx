import React from 'react';
import { LogOut, X, ShieldCheck, AlertTriangle } from 'lucide-react';

interface LogoutConfirmModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-100 animate-in zoom-in-95 duration-200 mx-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="font-bold text-slate-800">Đăng xuất</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Warning */}
                <div className="flex flex-col items-center text-center">
                    <div className="p-4 mb-5 bg-red-50 text-red-500 rounded-2xl ring-8 ring-red-50/50">
                        <AlertTriangle className="w-12 h-12" />
                    </div>

                    <h2 className="text-xl font-extrabold text-slate-900 mb-2">
                        Bạn có chắc chắn muốn đăng xuất?
                    </h2>

                    <p className="text-slate-500 text-sm mb-5">
                        Khi đăng xuất, toàn bộ dữ liệu học tập trên trình duyệt này sẽ bị xóa.
                    </p>

                    {/* Security reassurance */}
                    <div className="w-full flex items-start gap-3 px-4 py-3 mb-6 bg-blue-50 border border-blue-100 rounded-xl text-left">
                        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-800 mb-1">Dữ liệu của bạn vẫn an toàn</p>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Dữ liệu được mã hóa bằng PBKDF2 + AES-GCM trước khi lưu. Bạn có thể đồng bộ lại từ Portal bất cứ lúc nào.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid w-full gap-3">
                        <button
                            onClick={onConfirm}
                            className="w-full h-12 flex items-center justify-center gap-2 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Ở lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
