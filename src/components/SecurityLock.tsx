import React, { useState } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from './ui/input-otp';
import { Button } from './ui/button';
import { Lock, ShieldAlert, Trash2, KeyRound } from 'lucide-react';
import { setSessionPin, decryptData, clearAllStorage } from '../helpers/localStorage/save';

interface SecurityLockProps {
  onUnlock: () => void;
  setupMode?: boolean;
}

export const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock, setupMode = false }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (pin.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    // Nếu là setupMode thì không cần kiểm tra data cũ, chỉ cần set PIN
    if (setupMode) {
      setSessionPin(pin);
      onUnlock();
      return;
    }

    // Thử giải mã một key quan trọng (VD: raw_student_db hoặc student_db_full)
    const encryptedData = localStorage.getItem('raw_student_db') || localStorage.getItem('student_db_full');

    // Nếu không có data thì mặc định là đúng (cho phép đặt PIN lần đầu nếu chưa có data)
    if (!encryptedData) {
      setSessionPin(pin);
      onUnlock();
      return;
    }

    // Thử giải mã với PIN vừa nhập
    // Lưu ý: decryptData sẽ dùng getSessionPin(), nên ta cần set tạm hoặc truyền PIN vào
    // Ở đây ta set luôn vào sessionStorage để decryptData chạy đúng logic
    setSessionPin(pin);
    const decrypted = decryptData(encryptedData);

    if (decrypted) {
      onUnlock();
    } else {
      // Giải mã thất bại -> Sai PIN hoặc data cũ chưa mã hóa
      // Xóa PIN vừa set
      sessionStorage.removeItem('USER_PIN');
      setError('Mã PIN không chính xác hoặc dữ liệu không tương thích.');
      setIsVerifying(false);
    }
  };

  const handleForgotPin = () => {
    if (window.confirm('Hành động này sẽ xóa toàn bộ dữ liệu hiện tại trên trình duyệt. Bạn có chắc chắn muốn tiếp tục?')) {
      clearAllStorage();
    }
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-gray-100 backdrop-blur-xl h-screen w-screen overflow-hidden">
      <div className="w-0.6 max-w-md p-8 sm:p-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.2)] border border-white/50 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">

          <div className="relative p-4 mb-6 bg-blue-50 rounded-2xl text-blue-600 ring-8 ring-blue-50/50">
            <Lock className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
            {setupMode ? 'Thiết lập mã PIN' : 'Xác thực quyền truy cập'}
          </h1>
          <p className="text-slate-500 text-sm mb-8 px-2">
            {setupMode
              ? 'Vui lòng thiết lập mã PIN 6 số để bảo vệ dữ liệu học tập của bạn trên thiết bị này.'
              : 'Dữ liệu của bạn đã được mã hóa an toàn. Vui lòng nhập mã PIN để mở khóa.'}
          </p>

          <div className="mb-8 scale-110">
            <InputOTP
              maxLength={6}
              value={pin}
              onChange={setPin}
              onComplete={handleVerify}
              disabled={isVerifying}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="border-slate-200" />
                <InputOTPSlot index={1} className="border-slate-200" />
                <InputOTPSlot index={2} className="border-slate-200" />
                <InputOTPSlot index={3} className="border-slate-200" />
                <InputOTPSlot index={4} className="border-slate-200" />
                <InputOTPSlot index={5} className="border-slate-200" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-6 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl animate-in slide-in-from-top-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid w-full gap-4">
            <Button
              size="lg"
              className="w-full h-14 text-base font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
              onClick={handleVerify}
              disabled={pin.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Đang kiểm tra...' : (setupMode ? 'Xác nhận thiết lập PIN' : 'Mở khóa hệ thống')}
            </Button>

            <button
              onClick={handleForgotPin}
              className="group flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Quên mã PIN? Xóa dữ liệu
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
          <KeyRound className="w-3.5 h-3.5" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold">End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
};
