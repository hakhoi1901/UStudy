import { useMemo, useState } from 'react';
import { Bookmark, CheckCircle2, FlaskConical, MousePointerClick, TriangleAlert } from 'lucide-react';
import { PORTAL_SCRAPER_VERSION, PORTAL_SYNC_PROTOCOL_VERSION, type PortalSyncPacket } from '../../portal-sync/protocol';

function createEmptyPacket(): PortalSyncPacket {
    const scrapedAt = new Date().toISOString();
    return {
        protocolVersion: PORTAL_SYNC_PROTOCOL_VERSION,
        scraperVersion: PORTAL_SCRAPER_VERSION,
        version: PORTAL_SCRAPER_VERSION,
        source: 'bookmarklet',
        raw: {
            name: 'Dữ liệu kiểm thử',
            grades: [],
            registrations: [],
            courses: [],
            exams: { midterm: [], final: [] },
            tuition: {
                '25-26/1': {
                    details: [],
                    totals: {
                        credits: '0',
                        periods: '0',
                        tuitionCredits: '0',
                        fee: '0',
                        actualFee: '0',
                        totalDue: '0',
                    },
                    updatedDate: '',
                    year: '25-26',
                    sem: '1',
                },
            },
        },
        meta: {
            source: 'bookmarklet-lab',
            scrapedAt,
            isTestData: true,
            params: { tuition: null, exam: null, class: null, registration: null },
        },
    };
}

function createBookmarkletHref(appOrigin: string): string {
    const source = `(()=>{const payload=${JSON.stringify(createEmptyPacket())};const target=window.opener||window;target.postMessage({type:'IMPORT_FULL_DATA',labSource:'empty-bookmarklet',payload},${JSON.stringify(appOrigin)});})()`;
    return `javascript:${encodeURIComponent(source).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')}`;
}

export function BookmarkLabFeature() {
    const [receivedAt, setReceivedAt] = useState<string | null>(null);
    const bookmarkletHref = useMemo(() => createBookmarkletHref(window.location.origin), []);

    return (
        <section className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-gray-100 p-5 md:p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98]">
                    <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Bookmarklet dữ liệu rỗng</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">Bookmarklet này gửi đúng packet import của Portal, nhưng mọi nguồn dữ liệu đều là mảng rỗng.</p>
                </div>
            </div>

            <div className="space-y-5 p-5 md:p-6">
                <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <div className="flex gap-2">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <p>Chỉ xác nhận nhập trên profile thử nghiệm. Packet rỗng có thể thay lịch thi và học phí hiện có.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Bookmarklet kiểm thử</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={bookmarkletHref}
                            onClick={() => setReceivedAt(new Date().toLocaleTimeString('vi-VN'))}
                            className="inline-flex cursor-grab items-center gap-2 rounded-lg bg-[#004A98] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003A78] active:cursor-grabbing"
                            title="Kéo lên thanh dấu trang hoặc bấm để chạy"
                        >
                            <Bookmark className="h-4 w-4" />
                            UStudy Empty Data Lab
                        </a>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <MousePointerClick className="h-3.5 w-3.5" />
                            Kéo lên thanh dấu trang hoặc bấm trực tiếp.
                        </span>
                    </div>
                </div>

                <ol className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                    <li className="flex gap-3 px-4 py-3 text-sm text-gray-700"><span className="font-semibold text-[#004A98]">1</span><span>Kéo bookmarklet lên thanh dấu trang hoặc bấm trực tiếp để chạy.</span></li>
                    <li className="flex gap-3 px-4 py-3 text-sm text-gray-700"><span className="font-semibold text-[#004A98]">2</span><span>Bookmarklet gửi packet về UStudy, rồi App tự mở màn hình xem trước/import.</span></li>
                    <li className="flex gap-3 px-4 py-3 text-sm text-gray-700"><span className="font-semibold text-[#004A98]">3</span><span>Xác nhận nhập, sau đó kiểm tra các tab ở trạng thái dữ liệu rỗng.</span></li>
                </ol>

                {receivedAt && (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Đã gửi packet rỗng lúc {receivedAt}. Màn hình xem trước đã được mở.
                    </div>
                )}
            </div>
        </section>
    );
}
