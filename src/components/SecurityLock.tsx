import React, { useState, useEffect, useCallback } from 'react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from './ui/input-otp';
import { Button } from './ui/button';
import { Lock, ShieldAlert, Trash2, KeyRound, CheckCircle2, Timer } from 'lucide-react';
import {
    verifyPin,
    setupPin,
    clearAllStorage,
    incrementFailCount,
    resetFailCount,
    getLockoutSeconds,
} from '../helpers/localStorage/save';

interface SecurityLockProps {
    /** Gọi với CryptoKey sau khi unlock thành công */
    onUnlock: (key: CryptoKey) => void;
    /** true = chế độ thiết lập PIN lần đầu (không verify data cũ) */
    setupMode?: boolean;
}

type SetupStep = 'enter' | 'confirm';

export const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock, setupMode = false }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [setupStep, setSetupStep] = useState<SetupStep>('enter');
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Brute-force lockout
    const [lockoutSeconds, setLockoutSeconds] = useState(getLockoutSeconds);

    useEffect(() => {
        if (lockoutSeconds <= 0) return;
        const timer = setInterval(() => {
            const remaining = getLockoutSeconds();
            setLockoutSeconds(remaining);
            if (remaining <= 0) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutSeconds]);

    const isLocked = lockoutSeconds > 0;

    // ─── Setup Mode: nhập PIN lần đầu ────────────────────────────────────────

    const handleSetupNext = useCallback(() => {
        if (pin.length !== 6) return;
        setError(null);
        setSetupStep('confirm');
    }, [pin]);

    const handleSetupConfirm = useCallback(async () => {
        if (confirmPin.length !== 6) return;
        if (confirmPin !== pin) {
            setError('Mã PIN xác nhận không khớp. Vui lòng thử lại.');
            setConfirmPin('');
            return;
        }
        setIsVerifying(true);
        try {
            const key = await setupPin(pin);
            onUnlock(key);
        } catch (err) {
            setError('Có lỗi khi thiết lập PIN. Vui lòng thử lại.');
            setIsVerifying(false);
        }
    }, [pin, confirmPin, onUnlock]);

    // ─── Verify Mode: nhập PIN để mở khóa ────────────────────────────────────

    const handleVerify = useCallback(async () => {
        if (pin.length !== 6 || isLocked || isVerifying) return;
        setIsVerifying(true);
        setError(null);

        const key = await verifyPin(pin);

        if (key) {
            resetFailCount();
            onUnlock(key);
        } else {
            incrementFailCount();
            const remaining = getLockoutSeconds();
            setLockoutSeconds(remaining);
            setPin('');
            if (remaining > 0) {
                setError(`Sai PIN quá nhiều lần. Vui lòng thử lại sau ${remaining} giây.`);
            } else {
                setError('Mã PIN không chính xác. Vui lòng thử lại.');
            }
            setIsVerifying(false);
        }
    }, [pin, isLocked, isVerifying, onUnlock]);

    // Auto-submit khi nhập đủ 6 số
    useEffect(() => {
        if (!setupMode && pin.length === 6 && !isLocked) {
            handleVerify();
        }
    }, [pin, setupMode, isLocked, handleVerify]);

    useEffect(() => {
        if (setupMode && setupStep === 'confirm' && confirmPin.length === 6) {
            handleSetupConfirm();
        }
    }, [confirmPin, setupMode, setupStep, handleSetupConfirm]);

    useEffect(() => {
        if (setupMode && setupStep === 'enter' && pin.length === 6) {
            handleSetupNext();
        }
    }, [pin, setupMode, setupStep, handleSetupNext]);

    const handleForgotPin = () => {
        if (window.confirm('Hành động này sẽ xóa toàn bộ dữ liệu hiện tại. Bạn có chắc chắn?')) {
            clearAllStorage();
            window.location.reload();
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    const currentPin = setupMode && setupStep === 'confirm' ? confirmPin : pin;
    const currentOnChange = setupMode && setupStep === 'confirm' ? setConfirmPin : setPin;

    const title = setupMode
        ? (setupStep === 'enter' ? 'Thiết lập mã PIN' : 'Xác nhận mã PIN')
        : 'Xác thực quyền truy cập';

    const subtitle = setupMode
        ? (setupStep === 'enter'
            ? 'Vui lòng thiết lập mã PIN 6 số để bảo vệ dữ liệu học tập của bạn.'
            : 'Nhập lại mã PIN vừa tạo để xác nhận.')
        : 'Dữ liệu của bạn đã được mã hóa. Vui lòng nhập mã PIN để mở khóa.';

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-100 backdrop-blur-xl h-screen w-screen overflow-hidden">
            <div className="w-full max-w-md p-8 sm:p-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.2)] border border-white/50 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center">

                    {/* Icon */}
                    <div className={`relative p-4 mb-6 rounded-2xl ring-8 transition-colors duration-300 ${
                        setupMode && setupStep === 'confirm'
                            ? 'bg-green-50 text-green-600 ring-green-50/50'
                            : 'bg-blue-50 text-blue-600 ring-blue-50/50'
                    }`}>
                        {setupMode && setupStep === 'confirm'
                            ? <CheckCircle2 className="w-10 h-10" />
                            : <Lock className="w-10 h-10" />
                        }
                    </div>

                    {/* Setup steps indicator */}
                    {setupMode && (
                        <div className="flex items-center gap-2 mb-5">
                            <div className={`w-2 h-2 rounded-full transition-colors ${setupStep === 'enter' ? 'bg-blue-600' : 'bg-green-500'}`} />
                            <div className={`w-8 h-0.5 transition-colors ${setupStep === 'confirm' ? 'bg-green-500' : 'bg-gray-200'}`} />
                            <div className={`w-2 h-2 rounded-full transition-colors ${setupStep === 'confirm' ? 'bg-green-500' : 'bg-gray-200'}`} />
                        </div>
                    )}

                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-slate-500 text-sm mb-8 px-2">{subtitle}</p>

                    {/* Lockout banner */}
                    {isLocked && (
                        <div className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-6 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
                            <Timer className="w-4 h-4 shrink-0" />
                            <span>Bị khóa tạm thời. Thử lại sau <span className="font-bold tabular-nums">{lockoutSeconds}s</span></span>
                        </div>
                    )}

                    {/* OTP Input */}
                    <div className="mb-8 scale-110">
                        <InputOTP
                            maxLength={6}
                            value={currentPin}
                            onChange={currentOnChange}
                            disabled={isVerifying || isLocked}
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

                    {/* Error */}
                    {error && (
                        <div className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-6 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl animate-in slide-in-from-top-2">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="grid w-full gap-4">
                        <Button
                            size="lg"
                            className="w-full h-14 text-base font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                            onClick={setupMode
                                ? (setupStep === 'enter' ? handleSetupNext : handleSetupConfirm)
                                : handleVerify
                            }
                            disabled={currentPin.length !== 6 || isVerifying || isLocked}
                        >
                            {isVerifying
                                ? 'Đang xử lý...'
                                : setupMode
                                    ? (setupStep === 'enter' ? 'Tiếp tục →' : 'Hoàn tất thiết lập')
                                    : 'Mở khóa hệ thống'
                            }
                        </Button>

                        {/* Back button in confirm step */}
                        {setupMode && setupStep === 'confirm' && (
                            <button
                                onClick={() => { setSetupStep('enter'); setPin(''); setConfirmPin(''); setError(null); }}
                                className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors py-1"
                            >
                                ← Quay lại đặt PIN mới
                            </button>
                        )}

                        {!setupMode && (
                            <button
                                onClick={handleForgotPin}
                                className="group flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Quên mã PIN? Xóa dữ liệu
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold">PBKDF2 + AES-GCM Encrypted</span>
                </div>
            </div>
        </div>
    );
};
