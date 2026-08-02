import { useEffect, useState } from 'react';
import {
    Download,
    ExternalLink,
    FileUp,
    LoaderCircle,
    Monitor,
    ShieldCheck,
    Smartphone,
} from 'lucide-react';
import { useDepartmentData } from '../../context/DepartmentContext';
import { ImportData, OpticalDataTransfer } from '../../features/settings';
import { isNativePortalSyncAvailable, openNativePortalSync } from '../../mobile/portal-sync';

const ANDROID_APP_DOWNLOAD_URL = '/downloads/UStudy-android.apk';

interface InstructionStepProps {
    number: number;
    title: string;
    description: string;
}

function InstructionStep({ number, title, description }: InstructionStepProps) {
    return (
        <div className="flex gap-3 px-4 py-3.5">
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
    const nativePortalSyncAvailable = isNativePortalSyncAvailable();

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
        <div className="flex min-h-[calc(100dvh-150px)] items-start justify-center md:h-[calc(100vh-100px)] md:min-h-0 md:items-center md:rounded-xl md:border md:p-4">
            <div className="max-h-full w-full overflow-y-auto bg-white px-1 py-3 md:rounded-xl md:border md:border-gray-100 md:p-8 md:shadow-xl md:shadow-gray-200/50">
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
                    <>
                        <div className="space-y-5 mb-8">
                            <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-blue-200">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#004A98] text-white flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                                <div>
                                    <p className="font-semibold text-gray-900">Chọn thông tin</p>
                                    <p className="text-sm text-gray-600 mt-1">Vào tab cài đặt và chọn khoa, ngành, khóa tuyển của bạn.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-blue-200">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#004A98] text-white flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                                <div>
                                    <p className="font-semibold text-gray-900">Cài đặt công cụ</p>
                                    <p className="text-sm text-gray-600 mt-1">Kéo nút <span className="font-medium text-[#004A98] px-1.5 py-0.5 bg-blue-50 rounded-md">HCMUS Portal tool</span> ở góc trên bên phải vào Bookmark bar của bạn.</p>
                                    <p className="text-sm text-gray-600 mt-1">Nếu chưa mở Bookmark bar, nhấn Ctrl + Shift + B để mở.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-blue-200">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#004A98] text-white flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                                <div>
                                    <p className="font-semibold text-gray-900">Đăng nhập</p>
                                    <p className="text-sm text-gray-600 mt-1">Nhấn nút "Đăng nhập" để chuyển sang Portal.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-blue-200">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#004A98] text-white flex items-center justify-center text-sm font-bold mt-0.5">4</div>
                                <div>
                                    <p className="font-semibold text-gray-900">Lấy dữ liệu</p>
                                    <p className="text-sm text-gray-600 mt-1">Đợi trang web tải xong, đăng nhập và nhấn vào <span className="font-medium text-[#004A98] px-1.5 py-0.5 bg-blue-50 rounded-md">HCMUS Portal tool</span> vừa kéo về thanh dấu trang để tự động cào dữ liệu.</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : nativePortalSyncAvailable ? (
                    <div className="mx-auto max-w-lg">
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
                                download
                                className="flex min-h-11 w-full items-center justify-center gap-2 border-t border-blue-200 bg-[#004A98] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003A78]"
                            >
                                <Download className="h-4 w-4" />
                                Tải bản Android (.apk)
                            </a>
                        </section>

                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                                <ShieldCheck className="h-4 w-4 text-[#004A98]" />
                                <h3 className="text-sm font-bold text-gray-900">Cài đặt và sử dụng</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <InstructionStep number={1} title="Cài file APK" description="Mở file vừa tải và cho phép trình duyệt cài ứng dụng nếu Android yêu cầu." />
                                <InstructionStep number={2} title="Mở Portal trong UStudy" description="Trong ứng dụng, nhấn Mở Portal và đồng bộ rồi đăng nhập tài khoản sinh viên." />
                                <InstructionStep number={3} title="Nhận dữ liệu" description="Nhấn Đồng bộ với UStudy trên Portal, xem trước thay đổi và xác nhận những mục muốn nhập." />
                            </div>
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
