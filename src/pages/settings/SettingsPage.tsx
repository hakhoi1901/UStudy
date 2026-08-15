import { User, Shield, Lock, Puzzle } from 'lucide-react';
import { useState } from 'react';
import { DataSourceCenter, ImportData, OpticalDataTransfer, PortalSyncTools, ReportError, SettingUserProfile } from '../../features/settings';
import { useStudentDb } from '../../hooks/useStudentDb';
import { ChangePinModal } from '../../components/security';
import { useCrypto } from '../../context/CryptoContext';
import { PageHeader } from '../../components/layout/page-header';
import { PageShell } from '../../components/layout/page-shell';

export function SettingsPage({ onPageChange }: { onPageChange: (page: string) => void }) {
    const { name } = useStudentDb();
    const { lock, hasData } = useCrypto();
    const [showChangePinModal, setShowChangePinModal] = useState(false);

    const handleLockNow = () => {
        lock();
        window.location.reload();
    };

    return (
        <PageShell
            header={<PageHeader
                title="Cài đặt"
                description="Quản lý tài khoản và tùy chọn của bạn."
            />}
        >

            <div className="flex flex-col items-center">
                <div className="w-full max-w-4xl flex flex-col gap-4 md:gap-6">
                    {/* Thông tin cá nhân */}
                    <div className="ustudy-settings-card">
                        <h2 className="ustudy-settings-title">
                            <User className="ustudy-settings-title-icon" />Thông tin cá nhân
                        </h2>
                        <p className="ustudy-settings-description">Quản lý thông tin cá nhân của bạn.</p>
                        <div className="flex flex-col gap-2">
                            <div className="text-gray-600"> Tên: {name}</div>
                        </div>
                    </div>

                    <SettingUserProfile onPageChange={onPageChange} />

                    {/* Công cụ đồng bộ dữ liệu */}
                    <div className="ustudy-settings-card">
                        <h2 className="ustudy-settings-title">
                            <Puzzle className="ustudy-settings-title-icon" />Công cụ đồng bộ dữ liệu
                        </h2>

                        <div className="space-y-3">
                          <div className="ustudy-settings-group">
                            <PortalSyncTools />
                          </div>

                          <div className="ustudy-settings-group">
                            <ImportData />
                          </div>

                          <div className="ustudy-settings-group">
                            <OpticalDataTransfer />
                          </div>
                        </div>
                    </div>


                    <DataSourceCenter />

                    {/* Bảo mật */}
                    {hasData && (
                        <div className="ustudy-settings-card">
                            <h2 className="ustudy-settings-title">
                                <Shield className="ustudy-settings-title-icon" />
                                Bảo mật
                            </h2>
                            <p className="ustudy-settings-description">
                                Dữ liệu của bạn được mã hóa bằng PBKDF2 + AES-GCM. Chỉ bạn mới có thể giải mã bằng mật khẩu.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowChangePinModal(true)}
                                    className="ustudy-button-outline font-semibold "
                                >
                                    <Shield className="w-4 h-4" />
                                    Đổi mật khẩu
                                </button>
                                <button
                                    onClick={handleLockNow}
                                    className="ustudy-button-outline font-semibold"
                                >
                                    <Lock className="w-4 h-4" />
                                    Khóa ngay
                                </button>
                            </div>
                        </div>
                    )}

                    <ReportError />
                </div>
            </div>

            {showChangePinModal && (
                <ChangePinModal onClose={() => setShowChangePinModal(false)} />
            )}
        </PageShell>
    );
}
