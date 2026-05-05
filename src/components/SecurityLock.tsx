import React, { useState, useEffect, useCallback } from 'react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from './ui/input-otp';
import { Lock, ShieldAlert, Trash2, KeyRound, CheckCircle2, Timer, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import {
    verifyPin,
    setupPin,
    clearAllStorage,
    incrementFailCount,
    resetFailCount,
    getLockoutSeconds,
} from '../helpers/localStorage/save';

interface SecurityLockProps {
    onUnlock: (key: CryptoKey) => void;
    setupMode?: boolean;
}

type SetupStep = 'enter' | 'confirm';

const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    @keyframes sec-fadeUp {
        from { opacity: 0; transform: translateY(28px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes sec-slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes sec-spin {
        to { transform: rotate(360deg); }
    }
    @keyframes sec-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.25); }
        50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
    }
    @keyframes sec-shake {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-6px); }
        40%       { transform: translateX(6px); }
        60%       { transform: translateX(-4px); }
        80%       { transform: translateX(4px); }
    }

    .sec-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
        background: #f2f0ec;
        background-image:
            radial-gradient(ellipse 70% 60% at 15% 40%, rgba(218,214,255,0.55) 0%, transparent 60%),
            radial-gradient(ellipse 60% 55% at 85% 20%, rgba(196,229,255,0.45) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 55% 85%, rgba(255,219,195,0.4) 0%, transparent 55%);
    }

    .sec-blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(90px);
        pointer-events: none;
    }

    .sec-card {
        position: relative;
        width: 100%;
        max-width: 428px;
        margin: 20px;
        background: rgba(255,255,255,0.88);
        backdrop-filter: blur(24px) saturate(180%);
        border-radius: 32px;
        border: 1px solid rgba(255,255,255,0.75);
        box-shadow:
            0 0 0 1px rgba(200,190,255,0.15),
            0 40px 80px -20px rgba(20,20,60,0.14),
            0 12px 32px -8px rgba(20,20,60,0.08);
        padding: 52px 44px 40px;
        animation: sec-fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
    }

    .sec-icon-ring {
        width: 76px;
        height: 76px;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 32px;
        transition: background 0.4s ease, box-shadow 0.4s ease;
    }
    .sec-icon-ring.indigo {
        background: linear-gradient(145deg, #6366f1, #a5b4fc);
        box-shadow: 0 10px 30px -6px rgba(99,102,241,0.45);
        animation: sec-pulse 2.8s ease-in-out infinite;
        color: white;
    }
    .sec-icon-ring.green {
        background: linear-gradient(145deg, #059669, #34d399);
        box-shadow: 0 10px 30px -6px rgba(5,150,105,0.4);
        color: white;
    }

    .sec-steps {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 22px;
    }
    .sec-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        transition: all 0.35s ease;
    }
    .sec-dot.active { background: #6366f1; transform: scale(1.4); }
    .sec-dot.done   { background: #059669; }
    .sec-dot.idle   { background: #dde1ea; }
    .sec-line {
        width: 30px; height: 2px;
        border-radius: 2px;
        transition: background 0.35s ease;
    }
    .sec-line.done { background: #059669; }
    .sec-line.idle { background: #dde1ea; }

    .sec-title {
        font-family: 'Lora', serif;
        font-size: 27px;
        font-weight: 600;
        color: #16163a;
        text-align: center;
        margin: 0 0 10px;
        line-height: 1.25;
        letter-spacing: -0.2px;
    }
    .sec-sub {
        font-size: 13.5px;
        color: #8b93a7;
        text-align: center;
        margin: 0 0 34px;
        line-height: 1.65;
        font-weight: 400;
    }

    .sec-lockout {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 11px 16px;
        margin-bottom: 22px;
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 500;
        color: #92400e;
        animation: sec-slideDown 0.3s ease both;
    }
    .sec-lockout strong { color: #b45309; font-variant-numeric: tabular-nums; }

    .sec-otp-wrap {
        display: flex;
        justify-content: center;
        margin-bottom: 28px;
        transform: scale(1.08);
        transform-origin: center;
    }
    .sec-otp-wrap.has-error {
        animation: sec-shake 0.45s ease both;
    }

    .sec-error {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 11px 14px;
        margin-bottom: 22px;
        background: #fff1f3;
        border: 1px solid #fecdd3;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 500;
        color: #be123c;
        animation: sec-slideDown 0.3s ease both;
        line-height: 1.45;
    }

    .sec-actions { display: flex; flex-direction: column; gap: 10px; }

    .sec-btn {
        width: 100%;
        height: 54px;
        border: none;
        border-radius: 16px;
        font-family: 'DM Sans', sans-serif;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s;
        position: relative;
        overflow: hidden;
    }
    .sec-btn.indigo {
        background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
        box-shadow: 0 8px 22px -5px rgba(99,102,241,0.5);
    }
    .sec-btn.green {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        box-shadow: 0 8px 22px -5px rgba(5,150,105,0.45);
    }
    .sec-btn:not(:disabled):hover { transform: translateY(-2px); }
    .sec-btn:not(:disabled):active { transform: scale(0.98); }
    .sec-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .sec-ghost {
        background: none;
        border: none;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #9daabb;
        cursor: pointer;
        padding: 9px 14px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        transition: color 0.2s, background 0.2s;
    }
    .sec-ghost:hover { color: #ef4444; background: rgba(239,68,68,0.06); }
    .sec-ghost.back:hover { color: #6366f1; background: rgba(99,102,241,0.06); }

    .sec-spinner { animation: sec-spin 0.75s linear infinite; }

    .sec-footer {
        margin-top: 30px;
        padding-top: 22px;
        border-top: 1px solid #f0f2f6;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: #c5ccda;
    }
    .sec-enc-tag {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #c5ccda;
    }
`;

export const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock, setupMode = false }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [setupStep, setSetupStep] = useState<SetupStep>('enter');
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [lockoutSeconds, setLockoutSeconds] = useState(getLockoutSeconds);
    const [shakeOtp, setShakeOtp] = useState(false);

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

    const triggerShake = () => {
        setShakeOtp(true);
        setTimeout(() => setShakeOtp(false), 500);
    };

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
            triggerShake();
            return;
        }
        setIsVerifying(true);
        try {
            const key = await setupPin(pin);
            onUnlock(key);
        } catch {
            setError('Có lỗi khi thiết lập PIN. Vui lòng thử lại.');
            setIsVerifying(false);
        }
    }, [pin, confirmPin, onUnlock]);

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
            triggerShake();
            setError(remaining > 0
                ? `Sai PIN quá nhiều lần. Vui lòng thử lại sau ${remaining} giây.`
                : 'Mã PIN không chính xác. Vui lòng thử lại.');
            setIsVerifying(false);
        }
    }, [pin, isLocked, isVerifying, onUnlock]);

    useEffect(() => {
        if (!setupMode && pin.length === 6 && !isLocked) handleVerify();
    }, [pin, setupMode, isLocked, handleVerify]);

    useEffect(() => {
        if (setupMode && setupStep === 'confirm' && confirmPin.length === 6) handleSetupConfirm();
    }, [confirmPin, setupMode, setupStep, handleSetupConfirm]);

    useEffect(() => {
        if (setupMode && setupStep === 'enter' && pin.length === 6) handleSetupNext();
    }, [pin, setupMode, setupStep, handleSetupNext]);

    const handleForgotPin = () => {
        if (window.confirm('Hành động này sẽ xóa toàn bộ dữ liệu hiện tại. Bạn có chắc chắn?')) {
            clearAllStorage();
            window.location.reload();
        }
    };

    const currentPin = setupMode && setupStep === 'confirm' ? confirmPin : pin;
    const currentOnChange = setupMode && setupStep === 'confirm' ? setConfirmPin : setPin;
    const isConfirmStep = setupMode && setupStep === 'confirm';

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: styles }} />

            <div className="sec-overlay">
                {/* Background blobs */}
                <div className="sec-blob" style={{ width: 500, height: 500, top: '-15%', left: '-10%', background: 'radial-gradient(circle, rgba(210,206,255,0.65) 0%, transparent 65%)' }} />
                <div className="sec-blob" style={{ width: 380, height: 380, bottom: '0%', right: '-8%', background: 'radial-gradient(circle, rgba(167,233,210,0.55) 0%, transparent 65%)' }} />
                <div className="sec-blob" style={{ width: 280, height: 280, bottom: '15%', left: '3%', background: 'radial-gradient(circle, rgba(255,210,180,0.5) 0%, transparent 65%)' }} />

                <div className="sec-card">
                    {/* Icon */}
                    <div className={`sec-icon-ring ${isConfirmStep ? 'green' : 'indigo'}`}>
                        {isConfirmStep
                            ? <CheckCircle2 size={32} strokeWidth={1.8} />
                            : <Lock size={30} strokeWidth={1.8} />
                        }
                    </div>

                    {/* Steps */}
                    {setupMode && (
                        <div className="sec-steps">
                            <div className={`sec-dot ${setupStep === 'enter' ? 'active' : 'done'}`} />
                            <div className={`sec-line ${isConfirmStep ? 'done' : 'idle'}`} />
                            <div className={`sec-dot ${isConfirmStep ? 'active' : 'idle'}`} />
                        </div>
                    )}

                    {/* Heading */}
                    <h1 className="sec-title">
                        {setupMode
                            ? (setupStep === 'enter' ? 'Tạo mã PIN' : 'Xác nhận PIN')
                            : 'Xác thực truy cập'
                        }
                    </h1>
                    <p className="sec-sub">
                        {setupMode
                            ? (setupStep === 'enter'
                                ? 'Thiết lập mã PIN 6 chữ số để bảo vệ dữ liệu học tập của bạn.'
                                : 'Nhập lại mã PIN vừa tạo để xác nhận.')
                            : 'Dữ liệu của bạn đã được mã hóa. Nhập mã PIN để mở khóa.'
                        }
                    </p>

                    {/* Lockout */}
                    {isLocked && (
                        <div className="sec-lockout">
                            <Timer size={14} style={{ flexShrink: 0 }} />
                            <span>Bị khóa tạm thời — thử lại sau <strong>{lockoutSeconds}s</strong></span>
                        </div>
                    )}

                    {/* OTP */}
                    <div className={`sec-otp-wrap${shakeOtp ? ' has-error' : ''}`}>
                        <InputOTP
                            maxLength={6}
                            value={currentPin}
                            onChange={currentOnChange}
                            disabled={isVerifying || isLocked}
                            autoFocus
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="sec-error">
                            <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="sec-actions">
                        <button
                            className={`sec-btn ${isConfirmStep ? 'green' : 'indigo'}`}
                            onClick={setupMode
                                ? (setupStep === 'enter' ? handleSetupNext : handleSetupConfirm)
                                : handleVerify
                            }
                            disabled={currentPin.length !== 6 || isVerifying || isLocked}
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 size={16} className="sec-spinner" />
                                    Đang xử lý…
                                </>
                            ) : setupMode ? (
                                setupStep === 'enter'
                                    ? <> Tiếp tục <ArrowRight size={15} /> </>
                                    : <> Hoàn tất thiết lập <CheckCircle2 size={15} /> </>
                            ) : (
                                <> Mở khóa <ArrowRight size={15} /> </>
                            )}
                        </button>

                        {isConfirmStep && (
                            <button
                                className="sec-ghost back"
                                onClick={() => { setSetupStep('enter'); setPin(''); setConfirmPin(''); setError(null); }}
                            >
                                <ArrowLeft size={13} />
                                Quay lại đặt PIN mới
                            </button>
                        )}

                        {!setupMode && (
                            <button className="sec-ghost" onClick={handleForgotPin}>
                                <Trash2 size={13} />
                                Quên mã PIN? Xóa toàn bộ dữ liệu
                            </button>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sec-footer">
                        <KeyRound size={11} />
                        <span className="sec-enc-tag">PBKDF2 · AES-GCM Encrypted</span>
                    </div>
                </div>
            </div>
        </>
    );
};