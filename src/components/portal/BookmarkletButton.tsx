import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Bookmark, MousePointerClick } from 'lucide-react';
import bookmarkletSource from '../../logic/Bookmarklet.js?raw';
import { APP_CONFIG } from '../../config';
import { PORTAL_SYNC_PROTOCOL_VERSION } from '../../portal-sync/protocol';
import { AppDialog } from '../ui/overlays/app-dialog';

interface Props {
    className?: string;
    variant?: 'primary' | 'outline' | 'ghost';
    withLabel?: boolean;
    hideInstructions?: boolean;
}

export function BookmarkletButton({ className = '', variant = 'primary', withLabel = true, hideInstructions = false }: Props) {
    const linkRef = useRef<HTMLAnchorElement>(null);
    const [isDragHelpOpen, setIsDragHelpOpen] = useState(false);

    const hasCustomLayout = className.includes('flex-row') || className.includes('flex-col') || className.includes('justify-');
    const wrapperClass = hasCustomLayout
        ? `gap-3 ${className}`
        : `flex w-full flex-col items-center justify-center gap-3 ${className}`;

    const bookmarkletHref = useMemo(() => {
        if (!bookmarkletSource) return '#';

        const expirationTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const configToInject = {
            URL_DIEM: '/SinhVien.aspx?pid=211',
            URL_LICHTHI: '/SinhVien.aspx?pid=180',
            URL_HOCPHI: '/SinhVien.aspx?pid=331',
            URL_LOPMO: '/SinhVien.aspx?pid=327',
            URL_DKHP: '/SinhVien.aspx?pid=212',
            TARGET_YEAR: APP_CONFIG.DEFAULT_TARGET_YEAR,
            TARGET_SEM: APP_CONFIG.DEFAULT_TARGET_SEM,
            CLASS_TARGET_YEAR: APP_CONFIG.DEFAULT_CLASS_TARGET_YEAR,
            CLASS_TARGET_SEM: APP_CONFIG.DEFAULT_CLASS_TARGET_SEM,
            REG_TARGET_YEAR: APP_CONFIG.DEFAULT_REG_TARGET_YEAR,
            REG_TARGET_SEM: APP_CONFIG.DEFAULT_REG_TARGET_SEM,
            EXPIRES_AT: expirationTime,
            VERSION: APP_CONFIG.BOOKMARKLET_VERSION,
            PROTOCOL_VERSION: PORTAL_SYNC_PROTOCOL_VERSION,
            APP_ORIGIN: window.location.origin,
        };

        const processedSource = bookmarkletSource.replace(
            'window.__HCMUS_PORTAL_CONFIG__',
            JSON.stringify(configToInject),
        );

        const encodedCode = encodeURIComponent(processedSource)
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');
        return `javascript:${encodedCode}`;
    }, []);

    useEffect(() => {
        if (linkRef.current && bookmarkletHref !== '#') linkRef.current.href = bookmarkletHref;
    }, [bookmarkletHref]);

    function handleDragWarning(event: MouseEvent<HTMLAnchorElement>) {
        event.preventDefault();
        setIsDragHelpOpen(true);
    }

    return (
        <>
            <div className={wrapperClass}>
                {!hideInstructions && (
                    <span className="flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-center text-xs font-medium text-gray-500">
                        <MousePointerClick className="h-3.5 w-3.5 shrink-0" />
                        <span>Kéo thả nút này lên thanh dấu trang</span>
                    </span>
                )}
                <a
                    ref={linkRef}
                    href="#"
                    onClick={handleDragWarning}
                    className={`ustudy-button-outline`}
                    title="Kéo lên thanh dấu trang"
                >
                    <Bookmark className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    {withLabel && <span className="overflow-hidden text-ellipsis whitespace-nowrap pt-px">HCMUS Portal Tool</span>}
                </a>
            </div>

            <AppDialog
                open={isDragHelpOpen}
                onOpenChange={setIsDragHelpOpen}
                title="Thêm Bookmarklet"
                description="Kéo nút vào thanh dấu trang thay vì bấm trực tiếp."
                icon={Bookmark}
                size="sm"
                footer={(
                    <button type="button" onClick={() => setIsDragHelpOpen(false)} className="h-9 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white transition hover:bg-[#003A78]">
                        Đã hiểu
                    </button>
                )}
            >
                <ol className="space-y-3 text-sm leading-6 text-slate-600">
                    <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">1</span><span>Hiện thanh dấu trang bằng <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-700">Ctrl + Shift + B</kbd>.</span></li>
                    <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">2</span><span>Kéo nút <strong className="font-semibold text-slate-800">HCMUS Portal Tool</strong> lên thanh dấu trang.</span></li>
                    <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">3</span><span>Mở Portal trường bằng ustudy, sau đó bấm bookmarklet để nhập dữ liệu.</span></li>
                </ol>
            </AppDialog>
        </>
    );
}
