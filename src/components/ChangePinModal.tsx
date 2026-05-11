import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { KeyRound, ShieldAlert, CheckCircle2, Loader2, X, Eye, EyeOff } from 'lucide-react';
import { verifyPin, changePin } from '../helpers/localStorage/save';
import { useCrypto } from '../context/CryptoContext';

interface ChangePinModalProps {
    onClose: () => void;
}

type Step = 'old-password' | 'new-password' | 'confirm-password' | 'success';

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ onClose }) => {
    const { cryptoKey, unlock } = useCrypto();

    const [step, setStep] = useState<Step>('old-password');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Step 1: Verify mật khẩu cũ
    const handleVerifyOld = useCallback(async () => {
        if (!oldPassword || isProcessing) return;
        setIsProcessing(true);
        setError(null);
        const key = await verifyPin(oldPassword);
        if (key) {
            setStep('new-password');
        } else {
            setError('Mật khẩu hiện tại không đúng.');
            setOldPassword('');
        }
        setIsProcessing(false);
    }, [oldPassword, isProcessing]);

    // Step 2: Tiếp nhận mật khẩu mới
    const handleNewPasswordNext = useCallback(() => {
        if (newPassword.length < 4) {
            setError('Mật khẩu phải có ít nhất 4 ký tự.');
            return;
        }
        setError(null);
        setStep('confirm-password');
    }, [newPassword]);

    // Step 3: Confirm + thực hiện đổi mật khẩu
    const handleConfirmChange = useCallback(async () => {
        if (!confirmPassword || isProcessing) return;

        if (confirmPassword !== newPassword) {
            setError('Mật khẩu xác nhận không khớp. Vui lòng thử lại.');
            setConfirmPassword('');
            return;
        }

        if (!cryptoKey) {
            setError('Phiên làm việc đã hết hạn. Vui lòng reload trang.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            setProgress('Đang giải mã dữ liệu hiện tại...');
            // Thêm delay nhỏ để UI cập nhật trước khi PBKDF2 chạy
            await new Promise(r => setTimeout(r, 50));

            setProgress('Đang tạo khóa mã hóa mới (PBKDF2)...');
            const newKey = await changePin(cryptoKey, newPassword);

            setProgress('Hoàn tất!');
            unlock(newKey);
            setStep('success');
        } catch (err) {
            console.error('[ChangePinModal]', err);
            setError('Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.');
            setIsProcessing(false);
            setProgress('');
        }
    }, [confirmPassword, newPassword, cryptoKey, isProcessing, unlock]);


    // ─── Render ───────────────────────────────────────────────────────────────

    const stepConfig: Record<Step, { title: string; subtitle: string; password: string; setPassword: (v: string) => void; showPassword: boolean; setShowPassword: (v: boolean) => void; placeholder: string }> = {
        'old-password': {
            title: 'Nhập mật khẩu hiện tại',
            subtitle: 'Xác nhận danh tính trước khi đổi mật khẩu.',
            password: oldPassword,
            setPassword: setOldPassword,
            showPassword: showOldPassword,
            setShowPassword: setShowOldPassword,
            placeholder: 'Nhập mật khẩu hiện tại...',
        },
        'new-password': {
            title: 'Đặt mật khẩu mới',
            subtitle: 'Chọn mật khẩu mới (ít nhất 4 ký tự).',
            password: newPassword,
            setPassword: setNewPassword,
            showPassword: showNewPassword,
            setShowPassword: setShowNewPassword,
            placeholder: 'Nhập mật khẩu mới...',
        },
        'confirm-password': {
            title: 'Xác nhận mật khẩu mới',
            subtitle: 'Nhập lại mật khẩu mới để xác nhận.',
            password: confirmPassword,
            setPassword: setConfirmPassword,
            showPassword: showConfirmPassword,
            setShowPassword: setShowConfirmPassword,
            placeholder: 'Xác nhận mật khẩu mới...',
        },
        'success': {
            title: 'Đổi mật khẩu thành công!',
            subtitle: 'Mật khẩu mới đã được áp dụng. Dữ liệu đã được mã hóa lại.',
            password: '',
            setPassword: () => {},
            showPassword: false,
            setShowPassword: () => {},
            placeholder: '',
        },
    };

    const current = stepConfig[step];

    const stepIndex = { 'old-password': 0, 'new-password': 1, 'confirm-password': 2, 'success': 3 };

    return (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-100 animate-in zoom-in-95 duration-200 mx-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-slate-800">Đổi mật khẩu</span>
                    </div>
                    {step !== 'success' && !isProcessing && (
                        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-1.5 mb-8">
                    {[0, 1, 2].map(i => (
                        <React.Fragment key={i}>
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                stepIndex[step] > i ? 'bg-green-500' :
                                stepIndex[step] === i ? 'bg-blue-500' : 'bg-gray-200'
                            }`} />
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex flex-col items-center text-center">
                    {/* Success State */}
                    {step === 'success' ? (
                        <>
                            <div className="p-4 mb-5 bg-green-50 text-green-600 rounded-2xl ring-8 ring-green-50/50">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-2">{current.title}</h2>
                            <p className="text-slate-500 text-sm mb-8">{current.subtitle}</p>
                            <Button
                                size="lg"
                                className="w-full h-12 font-bold rounded-xl bg-green-600 hover:bg-green-700"
                                onClick={onClose}
                            >
                                Đóng
                            </Button>
                        </>
                    ) : isProcessing && step === 'confirm-password' ? (
                        /* Processing State */
                        <>
                            <div className="p-4 mb-5 bg-blue-50 text-blue-600 rounded-2xl ring-8 ring-blue-50/50">
                                <Loader2 className="w-12 h-12 animate-spin" />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Đang xử lý...</h2>
                            <p className="text-slate-500 text-sm mb-2">{progress}</p>
                            <p className="text-xs text-slate-400">Quá trình này có thể mất vài giây.</p>
                        </>
                    ) : (
                        /* Input State */
                        <>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-2">{current.title}</h2>
                            <p className="text-slate-500 text-sm mb-8">{current.subtitle}</p>

                            <div className="relative w-full mb-6">
                                <input
                                    type={current.showPassword ? "text" : "password"}
                                    className="w-full h-12 px-4 pr-12 text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder={current.placeholder}
                                    value={current.password}
                                    onChange={(e) => current.setPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (step === 'old-password') handleVerifyOld();
                                            else if (step === 'new-password') handleNewPasswordNext();
                                            else if (step === 'confirm-password') handleConfirmChange();
                                        }
                                    }}
                                    disabled={isProcessing}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => current.setShowPassword(!current.showPassword)}
                                >
                                    {current.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 w-full px-4 py-3 mb-5 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl animate-in slide-in-from-top-2">
                                    <ShieldAlert className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid w-full gap-3">
                                <Button
                                    size="lg"
                                    className="w-full h-12 font-bold rounded-xl bg-blue-600 hover:bg-blue-700"
                                    onClick={step === 'old-password' ? handleVerifyOld : step === 'new-password' ? handleNewPasswordNext : handleConfirmChange}
                                    disabled={!current.password || isProcessing}
                                >
                                    {isProcessing ? 'Đang xử lý...' : step === 'confirm-password' ? 'Xác nhận đổi mật khẩu' : 'Tiếp tục →'}
                                </Button>

                                {step === 'confirm-password' && (
                                    <button
                                        onClick={() => { setStep('new-password'); setNewPassword(''); setConfirmPassword(''); setError(null); }}
                                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
                                    >
                                        ← Đặt lại mật khẩu mới
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
