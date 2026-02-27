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

export function BookmarkletButton({ className = '', variant = 'primary', withLabel = true, hideInstructions = false }: Props) {
    const linkRef = useRef<HTMLAnchorElement>(null);

    const bookmarkletHref = useMemo(() => {
        if (!bookmarkletSource) return '#';

        // Inject the config object dynamically into the bookmarklet
        let processedSource = bookmarkletSource;
        const configToInject = {
            URL_DIEM: "/SinhVien.aspx?pid=211",
            URL_LICHTHI: "/SinhVien.aspx?pid=180",
            URL_HOCPHI: "/SinhVien.aspx?pid=331",
            URL_LOPMO: "/SinhVien.aspx?pid=327",
            TARGET_YEAR: APP_CONFIG.DEFAULT_TARGET_YEAR,
            TARGET_SEM: APP_CONFIG.DEFAULT_TARGET_SEM
        };
        processedSource = processedSource.replace(
            `window.__HCMUS_PORTAL_CONFIG__`,
            JSON.stringify(configToInject)
        );

        const encodedCode = encodeURIComponent(processedSource)
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');
        return `javascript:${encodedCode}`;
    }, []);

    useEffect(() => {
        if (linkRef.current && bookmarkletHref !== '#') {
            linkRef.current.setAttribute('href', bookmarkletHref);
        }
    }, [bookmarkletHref]);

    const handleDragWarning = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        alert("Đừng bấm! Hãy KÉO nút này thả lên thanh dấu trang (Bookmark Bar) của trình duyệt.");
    };

    return (
        // Chuyển thành flex w-full để cái cục này không bị ép ngang đến mức vỡ chữ
        <div className={`flex flex-col items-center justify-center gap-3 w-full ${className}`}>

            {!hideInstructions && (
                <span className="text-xs text-gray-500 flex items-center justify-center gap-1.5 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 text-center max-w-full flex-wrap">
                    <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
                    <span>Kéo thả nút này lên thanh dấu trang</span>
                </span>
            )}

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
                <Bookmark className="w-4 h-4 shrink-0" strokeWidth={2.5} />

                {withLabel && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis pt-[1px]">
                        HCMUS Portal Tool
                    </span>
                )}
            </a>
        </div>
    );
}