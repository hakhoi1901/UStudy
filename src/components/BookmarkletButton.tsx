import { useMemo, useEffect, useRef } from 'react';
import { Bookmark, MousePointerClick } from 'lucide-react';
import bookmarkletSource from '../logic/Bookmarklet.js?raw';
import { APP_CONFIG } from '../config';

interface Props {
    className?: string;
    variant?: 'primary' | 'outline' | 'ghost';
    withLabel?: boolean;
    hideInstructions?: boolean;
}

/**
 * 
 * @param className 
 * @param variant 
 * @param withLabel 
 * @param hideInstructions 
 * @returns 
 * 
 * render thẻ a có href là bookmarklet
 */
export function BookmarkletButton({ className = '', variant = 'primary', withLabel = true, hideInstructions = false }: Props) {
    const linkRef = useRef<HTMLAnchorElement>(null);

    const bookmarkletHref = useMemo(() => {
        if (!bookmarkletSource) return '#';

        let processedSource = bookmarkletSource;

        // Tính toán hạn sử dụng: Hiện tại + 30 ngày
        const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;  // tính theo mili giây
        const expirationTime = Date.now() + THIRTY_DAYS_IN_MS;

        // Inject config vào bookmarklet
        const configToInject = {
            URL_DIEM: "/SinhVien.aspx?pid=211",
            URL_LICHTHI: "/SinhVien.aspx?pid=180",
            URL_HOCPHI: "/SinhVien.aspx?pid=331",
            URL_LOPMO: "/SinhVien.aspx?pid=327",
            URL_DKHP: "/SinhVien.aspx?pid=212",
            TARGET_YEAR: APP_CONFIG.DEFAULT_TARGET_YEAR,
            TARGET_SEM: APP_CONFIG.DEFAULT_TARGET_SEM,
            EXPIRES_AT: expirationTime,
            VERSION: APP_CONFIG.BOOKMARKLET_VERSION
        };

        // thay thế chuỗi window.__HCMUS_PORTAL_CONFIG__ bằng chuỗi configToInject
        processedSource = processedSource.replace(
            `window.__HCMUS_PORTAL_CONFIG__`,
            JSON.stringify(configToInject)
        );

        // encodeURIComponent để xử lý các ký tự đặc biệt
        const encodedCode = encodeURIComponent(processedSource)
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');
        return `javascript:${encodedCode}`;
    }, []);

    // set href cho thẻ a
    useEffect(() => {
        if (linkRef.current && bookmarkletHref !== '#') {
            linkRef.current.setAttribute('href', bookmarkletHref);
        }
    }, [bookmarkletHref]);

    // xử lý khi click vào nút, nhắc nhở cách sử dụng đúng
    const handleDragWarning = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        alert("Đừng bấm! Hãy KÉO nút này thả lên thanh dấu trang (Bookmark Bar) của trình duyệt.\n\n Ctrl + Shift + B: để hiện Bookmark bar");
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 w-full ${className}`}>

            {/* Hiển thị hướng dẫn sử dụng */}
            {!hideInstructions && (
                <span className="text-xs text-gray-500 flex items-center justify-center gap-1.5 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 text-center max-w-full flex-wrap">
                    <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
                    <span>Kéo thả nút này lên thanh dấu trang</span>
                </span>
            )}

            {/* Nút bookmarklet */}
            <a
                ref={linkRef}
                href="#"
                onClick={handleDragWarning}
                className={`
                        relative flex items-center justify-center gap-2 px-2.5 py-2.5 rounded-lg font-semibold transition-all focus:outline-none select-none max-w-full
                        cursor-grab active:cursor-grabbing shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-1 hover:-translate-y-0.5
                        ${variant === 'primary' ? 'bg-[#004A98] text-white hover:bg-[#003A78] border border-transparent' : ''}
                        ${variant === 'outline' ? 'bg-white border-2 border-[#004A98] text-[#004A98] hover:bg-blue-50' : ''}
                        ${variant === 'ghost' ? 'bg-blue-50 text-[#004A98] hover:bg-blue-100 shadow-none active:translate-y-0 border border-transparent' : ''}
                    `}
                title="Kéo tôi lên Bookmark Bar"
            >
                {/* Icon bookmark */}
                <Bookmark className="w-4 h-4 shrink-0" strokeWidth={2.5} />

                {/* Nhãn nút */}
                {withLabel && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis pt-[1px]">
                        HCMUS Portal Tool
                    </span>
                )}
            </a>
        </div>
    );
}