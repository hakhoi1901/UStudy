import React, { useState, useEffect, useCallback } from 'react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from './ui/input-otp';
import { Button } from './ui/button';
import { KeyRound, ShieldAlert, CheckCircle2, Loader2, X } from 'lucide-react';
import { verifyPin, changePin } from '../helpers/localStorage/save';
import { useCrypto } from '../context/CryptoContext';

interface ChangePinModalProps {
    onClose: () => void;
}

type Step = 'old-pin' | 'new-pin' | 'confirm-pin' | 'success';

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ onClose }) => {
    const { cryptoKey, unlock } = useCrypto();

    const [step, setStep] = useState<Step>('old-pin');
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState('');

    // Step 1: Verify PIN cũ
    const handleVerifyOld = useCallback(async () => {
        if (oldPin.length !== 6 || isProcessing) return;
        setIsProcessing(true);
        setError(null);
        const key = await verifyPin(oldPin);
        if (key) {
            setStep('new-pin');
        } else {
            setError('Mã PIN hiện tại không đúng.');
            setOldPin('');
        }
        setIsProcessing(false);
    }, [oldPin, isProcessing]);

    // Step 2: Tiếp nhận PIN mới
    const handleNewPinNext = useCallback(() => {
        if (newPin.length !== 6) return;
        setError(null);
        setStep('confirm-pin');
    }, [newPin]);

    // Step 3: Confirm + thực hiện đổi PIN
    const handleConfirmChange = useCallback(async () => {
        if (confirmPin.length !== 6 || isProcessing) return;

        if (confirmPin !== newPin) {
            setError('PIN xác nhận không khớp. Vui lòng thử lại.');
            setConfirmPin('');
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
            const newKey = await changePin(cryptoKey, newPin);

            setProgress('Hoàn tất!');
            unlock(newKey);
            setStep('success');
        } catch (err) {
            console.error('[ChangePinModal]', err);
            setError('Có lỗi xảy ra khi đổi PIN. Vui lòng thử lại.');
            setIsProcessing(false);
            setProgress('');
        }
    }, [confirmPin, newPin, cryptoKey, isProcessing, unlock]);

    // Auto-submit
    useEffect(() => {
        if (step === 'old-pin' && oldPin.length === 6) handleVerifyOld();
    }, [oldPin, step, handleVerifyOld]);

    useEffect(() => {
        if (step === 'new-pin' && newPin.length === 6) handleNewPinNext();
    }, [newPin, step, handleNewPinNext]);

    useEffect(() => {
        if (step === 'confirm-pin' && confirmPin.length === 6) handleConfirmChange();
    }, [confirmPin, step, handleConfirmChange]);

    // ─── Render ───────────────────────────────────────────────────────────────

    const stepConfig: Record<Step, { title: string; subtitle: string; pin: string; setPin: (v: string) => void }> = {
        'old-pin': {
            title: 'Nhập mã PIN hiện tại',
            subtitle: 'Xác nhận danh tính trước khi đổi mã PIN.',
            pin: oldPin,
            setPin: setOldPin,
        },
        'new-pin': {
            title: 'Đặt mã PIN mới',
            subtitle: 'Chọn mã PIN mới gồm 6 chữ số.',
            pin: newPin,
            setPin: setNewPin,
        },
        'confirm-pin': {
            title: 'Xác nhận PIN mới',
            subtitle: 'Nhập lại mã PIN mới để xác nhận.',
            pin: confirmPin,
            setPin: setConfirmPin,
        },
        'success': {
            title: 'Đổi PIN thành công!',
            subtitle: 'Mã PIN mới đã được áp dụng. Dữ liệu đã được mã hóa lại.',
            pin: '',
            setPin: () => {},
        },
    };

    const current = stepConfig[step];

    const stepIndex = { 'old-pin': 0, 'new-pin': 1, 'confirm-pin': 2, 'success': 3 };

    return (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-100 animate-in zoom-in-95 duration-200 mx-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-slate-800">Đổi mã PIN</span>
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
                    ) : isProcessing && step === 'confirm-pin' ? (
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

                            <div className="mb-6 scale-105">
                                <InputOTP
                                    maxLength={6}
                                    value={current.pin}
                                    onChange={current.setPin}
                                    disabled={isProcessing}
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} className="border-slate-200" />
                                        <InputOTPSlot index={1} className="border-slate-200" />
                                        <InputOTPSlot index={2} className="border-slate-200" />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} className="border-slate-200" />
                                        <InputOTPSlot index={4} className="border-slate-200" />
                                        <InputOTPSlot index={5} className="border-slate-200" />
                                    </InputOTPGroup>
                                </InputOTP>
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
                                    onClick={step === 'old-pin' ? handleVerifyOld : step === 'new-pin' ? handleNewPinNext : handleConfirmChange}
                                    disabled={current.pin.length !== 6 || isProcessing}
                                >
                                    {isProcessing ? 'Đang xử lý...' : step === 'confirm-pin' ? 'Xác nhận đổi PIN' : 'Tiếp tục →'}
                                </Button>

                                {step === 'confirm-pin' && (
                                    <button
                                        onClick={() => { setStep('new-pin'); setNewPin(''); setConfirmPin(''); setError(null); }}
                                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
                                    >
                                        ← Đặt lại PIN mới
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
