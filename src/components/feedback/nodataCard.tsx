import { useEffect, useState } from 'react';
import {
    Bookmark,
    Download,
    ExternalLink,
    FileUp,
    Laptop,
    LoaderCircle,
    Monitor,
    Puzzle,
    Smartphone,
} from 'lucide-react';
import { useDepartmentData } from '../../context/DepartmentContext';
import { ImportData, OpticalDataTransfer } from '../../features/settings';
import { DeviceSyncDataTransfer } from '../../features/device-sync';
import { isNativePortalSyncAvailable, openNativePortalSync } from '../../mobile/portal-sync';
import { BookmarkletButton } from '../portal';
import { portalSyncConfig } from '../../portal-sync/protocol';

const ANDROID_APP_DOWNLOAD_URL = '/downloads/UStudy-android.apk';
type DesktopSyncMethod = 'extension' | 'bookmarklet' | 'device-sync' | 'json';

const DESKTOP_SYNC_GUIDES: Record<DesktopSyncMethod, { title: string; description: string; steps: InstructionStepProps[] }> = {
    extension: {
        title: 'Đồng bộ bằng Extension',
        description: 'Phù hợp khi bạn thường xuyên lấy dữ liệu từ HCMUS Portal.',
        steps: [
            { number: 1, title: 'Tải và cài UStudy Portal Sync', description: 'Tải file ZIP bên dưới, giải nén rồi thêm extension vào trình duyệt theo hướng dẫn.' },
            { number: 2, title: 'Mở và đăng nhập Portal', description: 'Extension sẽ nhận diện các trang Portal sau khi bạn đã đăng nhập.' },
            { number: 3, title: 'Đồng bộ và xem trước thay đổi', description: 'Chọn Đồng bộ ngay hoặc để extension chạy theo chế độ đã thiết lập, rồi xác nhận dữ liệu cần nhận.' },
        ],
    },
    bookmarklet: {
        title: 'Đồng bộ bằng Bookmarklet',
        description: 'Cách thủ công, nhẹ và không cần cài extension.',
        steps: [
            { number: 1, title: 'Thêm HCMUS Portal Tool', description: 'Kéo nút bookmarklet bên dưới vào thanh dấu trang của trình duyệt.' },
            { number: 2, title: 'Mở và đăng nhập Portal', description: 'Truy cập Portal trường từ UStudy, sau đó đăng nhập tài khoản sinh viên của bạn.' },
            { number: 3, title: 'Bấm bookmarklet và xác nhận', description: 'Nhấn HCMUS Portal Tool trên thanh dấu trang, xem trước thay đổi rồi chọn dữ liệu muốn nhập.' },
        ],
    },
    json: {
        title: 'Nhập từ file JSON',
        description: 'Dùng khi bạn đã có bản sao lưu UStudy từ máy tính hoặc thiết bị khác.',
        steps: [
            { number: 1, title: 'Xuất dữ liệu từ thiết bị nguồn', description: 'Vào Cài đặt của UStudy trên thiết bị đang có dữ liệu và chọn Xuất dữ liệu.' },
            { number: 2, title: 'Chuyển file sang thiết bị này', description: 'Bạn có thể dùng Drive, email, Zalo hoặc bất kỳ cách gửi file nào thuận tiện.' },
            { number: 3, title: 'Chọn file và xem trước', description: 'Chọn file JSON bên dưới, sau đó chỉ tích những nhóm dữ liệu bạn muốn nhận.' },
        ],
    },
    'device-sync': {
        title: 'Đồng bộ từ thiết bị khác',
        description: 'Chuyển trực tiếp toàn bộ dữ liệu UStudy từ laptop sang thiết bị này, không cần tạo file JSON.',
        steps: [
            { number: 1, title: 'Tạo mã trên máy gửi', description: 'Trên thiết bị đang có dữ liệu, chọn Gửi dữ liệu rồi tạo mã kết nối sáu ký tự.' },
            { number: 2, title: 'Nhập mã trên máy nhận', description: 'Trên thiết bị cần nhận dữ liệu, chọn Nhận dữ liệu và nhập mã vừa tạo.' },
            { number: 3, title: 'Đối chiếu mã xác minh', description: 'Chỉ xác nhận khi hai thiết bị hiển thị cùng một mã xác minh.' },
        ],
    },
};

interface InstructionStepProps {
    number: number;
    title: string;
    description: string;
    className?: string;
}

function InstructionStep({ number, title, description, className = '' }: InstructionStepProps) {
    return (
        <div className={`flex gap-3 px-4 py-3.5 ${className}`}>
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004A98] text-xs font-bold text-white">
                {number}
            </span>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">{description}</p>
            </div>
        </div>
    );
}

/** Hiển thị hướng dẫn đồng bộ khi người dùng chưa có dữ liệu. */
export function NoDataCard() {
    const { academicYear, semesterNumber } = useDepartmentData();
    const [isMobile, setIsMobile] = useState(false);
    const [isOpeningPortal, setIsOpeningPortal] = useState(false);
    const [portalError, setPortalError] = useState('');
    const [desktopSyncMethod, setDesktopSyncMethod] = useState<DesktopSyncMethod>('bookmarklet');
    const nativePortalSyncAvailable = isNativePortalSyncAvailable();
    const desktopGuide = DESKTOP_SYNC_GUIDES[desktopSyncMethod];

    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(isMobileDevice || window.innerWidth <= 700);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleOpenPortal = async () => {
        setPortalError('');
        setIsOpeningPortal(true);

        try {
            await openNativePortalSync(academicYear, semesterNumber);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (!/cancel|closed|đóng/i.test(message)) {
                setPortalError('Không thể mở Portal. Vui lòng thử lại hoặc kiểm tra kết nối mạng.');
            }
        } finally {
            setIsOpeningPortal(false);
        }
    };

    return (
        <div className="flex w-full items-start justify-center md:rounded-xl md:border border-gray-300">
            <div className="w-full bg-white px-1 py-3 md:rounded-xl md:border md:border-gray-100 md:p-8 md:shadow-xl md:shadow-gray-200/50">
                <div className="mb-5 flex flex-col items-center md:mb-8">
                    {isMobile && (
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#004A98]">
                            <Smartphone className="h-6 w-6" />
                        </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Chưa có dữ liệu</h2>
                    <p className="mt-2 max-w-lg text-center text-sm leading-5 text-gray-500">
                        {isMobile
                            ? nativePortalSyncAvailable
                                ? 'Mở Portal trong ứng dụng để lấy dữ liệu học tập của bạn.'
                                : 'Bản web trên điện thoại không thể đồng bộ trực tiếp với Portal.'
                            : 'Hoàn thành các bước sau để lấy dữ liệu môn học từ cổng thông tin.'}
                    </p>
                </div>

                {!isMobile ? (
                    <div className="mx-auto max-w-2xl">
                        <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5 sm:grid-cols-4" role="tablist" aria-label="Chọn cách đồng bộ dữ liệu">
                            <button type="button" role="tab" aria-selected={desktopSyncMethod === 'bookmarklet'} onClick={() => setDesktopSyncMethod('bookmarklet')} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${desktopSyncMethod === 'bookmarklet' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                                <Bookmark className="h-4 w-4" />Bookmarklet
                            </button>
                            <button type="button" role="tab" aria-selected={desktopSyncMethod === 'extension'} onClick={() => setDesktopSyncMethod('extension')} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${desktopSyncMethod === 'extension' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                                <Puzzle className="h-4 w-4" />Extension
                            </button>
                            <button type="button" role="tab" aria-selected={desktopSyncMethod === 'device-sync'} onClick={() => setDesktopSyncMethod('device-sync')} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${desktopSyncMethod === 'device-sync' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                                <Laptop className="h-4 w-4" />Đồng bộ
                            </button>
                            <button type="button" role="tab" aria-selected={desktopSyncMethod === 'json'} onClick={() => setDesktopSyncMethod('json')} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${desktopSyncMethod === 'json' ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                                <FileUp className="h-4 w-4" />File JSON
                            </button>
                        </div>

                        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 md:p-5">
                            <h3 className="text-sm font-bold text-gray-900">{desktopGuide.title}</h3>
                            <p className="mt-1 text-xs leading-5 text-gray-600">{desktopGuide.description}</p>
                            <div className="mt-4 space-y-3">
                                {desktopGuide.steps.map((step) => (
                                    <InstructionStep key={step.number} {...step} className="rounded-xl border border-gray-100 bg-gray-50" />
                                ))}
                            </div>

                            {desktopSyncMethod === 'json' ? (
                                <div className="mt-4 max-w-xs"><ImportData compact importButtonLabel="Chọn file JSON" /></div>
                            ) : desktopSyncMethod === 'extension' ? (
                                <a href={`/downloads/ustudy-portal-sync.zip?v=${encodeURIComponent(portalSyncConfig.extensionVersion)}`} download className="ustudy-button-primary mt-4 inline-flex h-10 px-4 text-sm">
                                    <Download className="h-4 w-4" />Tải Extension v{portalSyncConfig.extensionVersion}
                                </a>
                            ) : desktopSyncMethod === 'device-sync' ? (
                                <div className="mt-4"><DeviceSyncDataTransfer hideHeader /></div>
                            ) : (
                                <div className="mt-4">
                                    <BookmarkletButton variant="primary" hideInstructions={false} className="flex w-fit flex-col items-start" />
                                </div>
                            )}
                        </section>
                    </div>
                ) : nativePortalSyncAvailable ? (
                    <div className="mx-auto max-w-lg space-y-4">
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
                            <InstructionStep number={1} title="Mở Portal" description="Nhấn nút bên dưới để mở Portal ngay trong UStudy." />
                            <InstructionStep number={2} title="Đăng nhập và đồng bộ" description="Đăng nhập, sau đó nhấn Đồng bộ với UStudy ở góc dưới bên phải." />
                            <InstructionStep number={3} title="Kiểm tra thay đổi" description="Chọn những dữ liệu muốn nhận trong màn hình xem trước rồi xác nhận nhập." />
                        </section>

                        <button
                            type="button"
                            onClick={handleOpenPortal}
                            disabled={isOpeningPortal}
                            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#004A98] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003A78] disabled:cursor-wait disabled:opacity-70"
                        >
                            {isOpeningPortal ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                            {isOpeningPortal ? 'Đang mở Portal...' : 'Mở Portal và đồng bộ'}
                        </button>
                        <p className="mt-2 text-center text-xs text-gray-500">Năm học {academicYear} · Học kỳ {semesterNumber}</p>

                        {portalError && (
                            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
                                {portalError}
                            </p>
                        )}

                        <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                            <div className="mb-3 flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004A98] text-white">
                                    <Smartphone className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900">Đồng bộ từ laptop</h3>
                                    <p className="mt-1 text-xs leading-5 text-gray-600">Nhận trực tiếp dữ liệu từ UStudy trên laptop bằng mã kết nối ngắn.</p>
                                </div>
                            </div>
                            <DeviceSyncDataTransfer availableModes={['receive']} hideHeader />
                        </section>

                        <section className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="mb-3 flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                    <FileUp className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900">Nhập file JSON</h3>
                                    <p className="mt-1 text-xs leading-5 text-gray-600">Dùng bản sao lưu đã xuất từ UStudy trên thiết bị khác.</p>
                                </div>
                            </div>
                            <ImportData compact importButtonLabel="Chọn file JSON" />
                        </section>
                    </div>
                ) : (
                    <div className="mx-auto max-w-lg space-y-4">
                        <section className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50">
                            <div className="flex gap-3 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#004A98] shadow-sm">
                                    <Download className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900">Tải ứng dụng UStudy cho Android</h3>
                                    <p className="mt-1 text-xs leading-5 text-gray-600">
                                        Ứng dụng có thể mở Portal và đồng bộ trực tiếp. Hiện tại chưa có bản dành cho iPhone.
                                    </p>
                                </div>
                            </div>
                            <a
                                href={ANDROID_APP_DOWNLOAD_URL}
                                download="UStudy-android.apk"
                                className="flex min-h-11 w-full items-center justify-center gap-2 border-t border-blue-200 bg-[#004A98] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003A78]"
                            >
                                <Download className="h-4 w-4" />
                                Tải bản Android (.apk)
                            </a>
                        </section>

                        <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                            <div className="mb-3 flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004A98] text-white">
                                    <Smartphone className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900">Đồng bộ từ laptop</h3>
                                    <p className="mt-1 text-xs leading-5 text-gray-600">Nhận trực tiếp dữ liệu từ UStudy trên laptop bằng mã kết nối ngắn.</p>
                                </div>
                            </div>
                            <DeviceSyncDataTransfer availableModes={['receive']} hideHeader />
                        </section>

                        <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 md:hidden">
                            <div className="mb-3 flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004A98] text-white">
                                    <Smartphone className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900">Nhận từ laptop</h3>
                                    <p className="mt-1 text-xs leading-5 text-gray-600">
                                        Mở UStudy trên laptop, chọn Gửi sang điện thoại rồi quét QR động tại đây.
                                    </p>
                                </div>
                            </div>
                            <OpticalDataTransfer compact />
                        </section>

                        <section className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="mb-3 flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                    <FileUp className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900">Dùng tiếp trên bản web</h3>
                                    <p className="mt-1 text-xs leading-5 text-gray-600">
                                        Nếu đã xuất dữ liệu JSON từ UStudy trên máy tính, bạn có thể nhập file và dùng ngay trên trình duyệt này.
                                    </p>
                                </div>
                            </div>
                            <ImportData compact importButtonLabel="Chọn file JSON" />
                            <details className="group mt-3 border-t border-gray-100 pt-3">
                                <summary className="cursor-pointer list-none text-xs font-semibold text-[#004A98]">
                                    Chưa có file JSON?
                                </summary>
                                <p className="mt-2 text-xs leading-5 text-gray-600">
                                    Trên máy tính, đồng bộ dữ liệu rồi vào Cài đặt, chọn Xuất dữ liệu. Chuyển file JSON vừa tải sang điện thoại và chọn lại tại đây.
                                </p>
                            </details>
                        </section>

                        <a
                            href="https://ustudy.hakhoi.io.vn"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-1 text-xs font-medium text-[#004A98] hover:underline"
                        >
                            <Monitor className="h-3.5 w-3.5" />
                            Mở UStudy bản web
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
