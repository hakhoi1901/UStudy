import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, KeyRound, LockKeyhole, RefreshCw, ShieldCheck, Trash2, Unlock } from 'lucide-react';
import { base64UrlToBytes } from '../../security/crypto/encoding';
import { checkSecurityLabCapabilities, type SecurityLabCapabilities } from '../../security/webauthn/capabilities';
import {
    DeviceBoundCredentialRejectedError,
    evaluateDeviceBoundPrf,
    registerDeviceBoundCredential,
    type DeviceCredentialDiagnostic,
} from '../../security/webauthn/device-credential';
import { clearSecurityLabVault, loadSecurityLabVault, saveSecurityLabVault } from '../../security/storage/security-lab-storage';
import { createSecurityLabVault, unlockSecurityLabVault } from '../../security/vault/test-vault';
import type { DeviceBoundVaultRecord, SecurityLabTestPayload } from '../../security/vault/vault-format';

type BusyAction = 'capabilities' | 'register' | 'unlock' | null;

interface CapabilityRowProps {
    label: string;
    value: boolean | null;
    pendingLabel?: string;
}

function CapabilityRow({ label, value, pendingLabel = 'Cần kiểm tra sau khi đăng ký' }: CapabilityRowProps) {
    const isReady = value === true;
    const isUnknown = value === null;

    return (
        <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <span className="text-gray-700">{label}</span>
            <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold ${isReady
                ? 'text-emerald-700'
                : isUnknown
                    ? 'text-gray-500'
                    : 'text-red-600'
            }`}>
                {isReady ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
                {isReady ? 'Sẵn sàng' : isUnknown ? pendingLabel : 'Không hỗ trợ'}
            </span>
        </div>
    );
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Đã xảy ra lỗi không xác định khi thực hiện kiểm tra bảo mật.';
}

function DiagnosticRow({ label, value, valid }: { label: string; value: string; valid?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2 text-sm">
            <span className="text-gray-600">{label}</span>
            <span className={`text-right text-xs font-semibold ${valid === undefined ? 'text-gray-800' : valid ? 'text-emerald-700' : 'text-red-600'}`}>
                {value}
            </span>
        </div>
    );
}

export function SecurityLabFeature() {
    const [capabilities, setCapabilities] = useState<SecurityLabCapabilities | null>(null);
    const [vault, setVault] = useState<DeviceBoundVaultRecord | null>(null);
    const [unlockedPayload, setUnlockedPayload] = useState<SecurityLabTestPayload | null>(null);
    const [busyAction, setBusyAction] = useState<BusyAction>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [diagnostic, setDiagnostic] = useState<DeviceCredentialDiagnostic | null>(null);

    useEffect(() => {
        setVault(loadSecurityLabVault());
    }, []);

    const clearMessages = () => {
        setNotice(null);
        setError(null);
        setUnlockedPayload(null);
    };

    const handleCheckCapabilities = async () => {
        clearMessages();
        setBusyAction('capabilities');
        try {
            const result = await checkSecurityLabCapabilities();
            setCapabilities(result);
            setNotice('Đã kiểm tra môi trường WebAuthn của trình duyệt này. PRF và BE=0 sẽ được xác thực khi đăng ký.');
        } catch (nextError) {
            setError(getErrorMessage(nextError));
        } finally {
            setBusyAction(null);
        }
    };

    const handleRegister = async () => {
        clearMessages();

        if (vault && !window.confirm('Đăng ký lại sẽ thay vault test đang lưu trên trình duyệt này. Tiếp tục?')) {
            return;
        }

        setBusyAction('register');
        try {
            const registration = await registerDeviceBoundCredential();
            const nextVault = await createSecurityLabVault(registration);
            saveSecurityLabVault(nextVault);
            setVault(nextVault);
            setDiagnostic(registration.diagnostic);
            setCapabilities((current) => current ?? {
                secureContext: window.isSecureContext,
                webAuthn: true,
                platformAuthenticator: true,
                clientPrfCapability: true,
            });
            setNotice('Đã tạo vault test. Master Key chỉ tồn tại trong bộ nhớ lúc tạo rồi được xóa khỏi runtime.');
        } catch (nextError) {
            if (nextError instanceof DeviceBoundCredentialRejectedError) {
                setDiagnostic(nextError.diagnostic);
            }
            setError(getErrorMessage(nextError));
        } finally {
            setBusyAction(null);
        }
    };

    const handleUnlock = async () => {
        clearMessages();
        const currentVault = vault ?? loadSecurityLabVault();
        if (!currentVault) {
            setError('Chưa có vault test. Hãy đăng ký thiết bị trước.');
            return;
        }

        setBusyAction('unlock');
        try {
            const assertion = await evaluateDeviceBoundPrf(
                currentVault.device.credentialId,
                base64UrlToBytes(currentVault.device.prfSalt),
            );
            const payload = await unlockSecurityLabVault(currentVault, assertion.prfOutput);
            const updatedVault: DeviceBoundVaultRecord = {
                ...currentVault,
                device: {
                    ...currentVault.device,
                    backupState: assertion.flags.backupState,
                },
            };
            saveSecurityLabVault(updatedVault);
            setVault(updatedVault);
            setUnlockedPayload(payload);
            setNotice('Mở vault test thành công bằng WebAuthn PRF từ credential của thiết bị này.');
        } catch (nextError) {
            setError(getErrorMessage(nextError));
        } finally {
            setBusyAction(null);
        }
    };

    const handleClearVault = () => {
        if (!vault || !window.confirm('Xóa vault test khỏi localStorage của trình duyệt này? Credential WebAuthn đã tạo sẽ không bị xóa tự động.')) {
            return;
        }

        clearSecurityLabVault();
        setVault(null);
        clearMessages();
        setNotice('Đã xóa vault test cục bộ.');
    };

    const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

    return (
        <div className="mx-auto w-full max-w-4xl space-y-5">
            <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 md:p-5">
                <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#004A98]" />
                    <div>
                        <h2 className="font-semibold text-gray-900">PoC vault gắn với thiết bị</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            Khu vực này chỉ mã hóa một JSON test. Không đọc, thay thế hay mã hóa dữ liệu UStudy đang dùng.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <p className="text-xs font-semibold uppercase text-[#004A98]">Bước 1</p>
                    <h2 className="mt-1 font-semibold text-gray-900">Khả năng của thiết bị</h2>
                </div>
                <div className="divide-y divide-gray-100 px-5 py-2">
                    <CapabilityRow label="HTTPS / secure context" value={capabilities?.secureContext ?? null} pendingLabel="Chưa kiểm tra" />
                    <CapabilityRow label="WebAuthn" value={capabilities?.webAuthn ?? null} pendingLabel="Chưa kiểm tra" />
                    <CapabilityRow label="Platform authenticator" value={capabilities?.platformAuthenticator ?? null} pendingLabel="Chưa kiểm tra" />
                    <CapabilityRow label="PRF extension" value={capabilities?.clientPrfCapability ?? null} pendingLabel="Xác thực lúc đăng ký" />
                </div>
                <div className="border-t border-gray-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={handleCheckCapabilities}
                        disabled={busyAction !== null}
                        className={`${buttonClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
                    >
                        <RefreshCw className={`h-4 w-4 ${busyAction === 'capabilities' ? 'animate-spin' : ''}`} />
                        Kiểm tra khả năng
                    </button>
                </div>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-[#004A98]">Bước 2</p>
                    <h2 className="mt-1 font-semibold text-gray-900">Đăng ký thiết bị này</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        Chỉ chấp nhận credential platform có PRF và cờ backup eligibility bằng 0.
                    </p>
                    <button
                        type="button"
                        onClick={handleRegister}
                        disabled={busyAction !== null}
                        className={`${buttonClass} mt-5 w-full bg-[#004A98] text-white hover:bg-[#003A78]`}
                    >
                        <KeyRound className="h-4 w-4" />
                        {busyAction === 'register' ? 'Đang đăng ký...' : vault ? 'Đăng ký lại thiết bị' : 'Đăng ký thiết bị này'}
                    </button>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-[#004A98]">Bước 3</p>
                    <h2 className="mt-1 font-semibold text-gray-900">Mở vault test</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        Yêu cầu WebAuthn để lấy PRF output, giải bọc Master Key và giải mã JSON test.
                    </p>
                    <button
                        type="button"
                        onClick={handleUnlock}
                        disabled={busyAction !== null || !vault}
                        className={`${buttonClass} mt-5 w-full bg-gray-900 text-white hover:bg-gray-800`}
                    >
                        <Unlock className="h-4 w-4" />
                        {busyAction === 'unlock' ? 'Đang mở vault...' : 'Mở vault test'}
                    </button>
                </section>
            </div>

            {diagnostic && (
                <section className={`rounded-xl border bg-white p-5 shadow-sm ${!diagnostic.flags.backupEligible && diagnostic.prfEnabled && diagnostic.prfOutputAvailable
                    ? 'border-emerald-200'
                    : 'border-amber-200'
                }`}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase text-[#004A98]">Diagnostic sau đăng ký</p>
                            <h2 className="mt-1 font-semibold text-gray-900">Credential vừa được tạo</h2>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${!diagnostic.flags.backupEligible && diagnostic.prfEnabled && diagnostic.prfOutputAvailable
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                            {!diagnostic.flags.backupEligible && diagnostic.prfEnabled && diagnostic.prfOutputAvailable
                                ? 'Có thể tạo vault'
                                : 'Device-bound chưa khả dụng'}
                        </span>
                    </div>
                    <div className="mt-3 divide-y divide-gray-100 border-y border-gray-100">
                        <DiagnosticRow label="Attachment yêu cầu" value={diagnostic.requestedAttachment} />
                        <DiagnosticRow label="Attachment trả về" value={diagnostic.authenticatorAttachment ?? 'Không được browser cung cấp'} />
                        <DiagnosticRow label="Transports" value={diagnostic.transports.length > 0 ? diagnostic.transports.join(', ') : 'Không được browser cung cấp'} />
                        <DiagnosticRow label="PRF" value={diagnostic.prfEnabled ? 'Có hỗ trợ' : 'Không hỗ trợ'} valid={diagnostic.prfEnabled} />
                        <DiagnosticRow label="PRF output" value={diagnostic.prfOutputAvailable ? 'Đã nhận' : 'Không có'} valid={diagnostic.prfOutputAvailable} />
                        <DiagnosticRow label="Backup eligible (BE)" value={diagnostic.flags.backupEligible ? '1 · Multi-device' : '0 · Single-device'} valid={!diagnostic.flags.backupEligible} />
                        <DiagnosticRow label="Backup state (BS)" value={diagnostic.flags.backupState ? '1 · Đã backup' : '0 · Chưa backup'} />
                    </div>
                </section>
            )}

            {vault && (
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4 text-emerald-600" />
                                <h2 className="font-semibold text-gray-900">Vault test đã được tạo</h2>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Tạo lúc {new Date(vault.createdAt).toLocaleString('vi-VN')} · BE=0 · BS={vault.device.backupState ? '1' : '0'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClearVault}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa vault test
                        </button>
                    </div>
                    <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600">
                        Bài test tiếp theo: sao chép localStorage sang browser profile hoặc máy không có credential này. Thao tác mở vault phải thất bại.
                    </p>
                </section>
            )}

            {(notice || error || unlockedPayload) && (
                <section className={`rounded-xl border p-4 text-sm ${error
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}>
                    {error ? <p>{error}</p> : <p>{notice}</p>}
                    {unlockedPayload && !error && (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-white/80 px-3 py-2 text-gray-700">
                            <p className="font-semibold">{unlockedPayload.message}</p>
                            <p className="mt-1 text-xs">grade = {unlockedPayload.grade}</p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
