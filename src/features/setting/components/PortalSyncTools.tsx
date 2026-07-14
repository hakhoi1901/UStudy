import { useCallback, useEffect, useState } from 'react';
import { Bookmark, CheckCircle2, Download, ExternalLink, Puzzle, RefreshCw } from 'lucide-react';
import { BookmarkletButton } from '../../../components/BookmarkletButton';
import { AppDialog } from '../../../components/ui/app-dialog';
import { isPortalExtensionInjected, requestPortalExtension } from '../../../portal-sync/bridge';
import { PORTAL_EXTENSION_READY_EVENT, type PortalExtensionState } from '../../../portal-sync/protocol';

function formatSyncTime(value: string | null) {
  if (!value) return 'Chưa đồng bộ';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function PortalSyncTools() {
  const [extensionState, setExtensionState] = useState<PortalExtensionState | null>(null);
  const [isExtensionDetected, setIsExtensionDetected] = useState(isPortalExtensionInjected);
  const [isChecking, setIsChecking] = useState(true);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  const refreshState = useCallback(async () => {
    setIsChecking(true);
    const nextState = await requestPortalExtension<PortalExtensionState>('GET_STATE');
    setIsExtensionDetected(Boolean(nextState) || isPortalExtensionInjected());
    setExtensionState(nextState);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    void refreshState();

    const handleExtensionReady = () => {
      setIsExtensionDetected(true);
      void refreshState();
    };
    document.addEventListener(PORTAL_EXTENSION_READY_EVENT, handleExtensionReady);
    return () => document.removeEventListener(PORTAL_EXTENSION_READY_EVENT, handleExtensionReady);
  }, [refreshState]);

  const isExtensionInstalled = isExtensionDetected || Boolean(extensionState);

  async function openPortal() {
    await requestPortalExtension('OPEN_PORTAL');
  }

  return (
    <>
      <div className="divide-y divide-gray-200">
        <section className="pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <span className="ustudy-icon-badge ustudy-icon-primary"><Puzzle className="h-5 w-5" /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">UStudy Portal Sync</h3>
                  {extensionState ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#004A98] px-2 py-1 text-[11px] font-semibold text-white"><CheckCircle2 className="h-3.5 w-3.5" />Đã kết nối</span>
                  ) : isExtensionInstalled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#004A98] px-2 py-1 text-[11px] font-semibold text-white"><CheckCircle2 className="h-3.5 w-3.5" />Đã cài đặt</span>
                  ) : !isChecking ? (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">Chưa cài đặt</span>
                  ) : null}
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Extension tự nhận diện Portal và chuyển dữ liệu vào màn hình xem trước của UStudy.</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isExtensionInstalled && <button type="button" onClick={() => void refreshState()} disabled={isChecking} className="ustudy-action-icon ustudy-action-icon-primary hidden sm:inline-grid" title="Kiểm tra lại extension"><RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} /></button>}
              {isExtensionInstalled ? (
                <button type="button" onClick={() => void openPortal()} className="ustudy-button-primary"><ExternalLink className="h-4 w-4" />Mở Portal</button>
              ) : (
                <button type="button" onClick={() => setIsInstallOpen(true)} className="ustudy-button-primary"><Download className="h-4 w-4" />Cài extension</button>
              )}
            </div>
          </div>

          {extensionState && (
            <div className="mt-4 flex flex-col gap-3 border-y border-gray-200 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <span>Lần gần nhất: <strong className="font-semibold text-gray-700">{formatSyncTime(extensionState.stats.lastSyncedAt)}</strong></span>
                <span>Đã đồng bộ: <strong className="font-semibold text-gray-700">{extensionState.stats.successfulSyncs} lần</strong></span>
                {extensionState.pendingImport && <span className="font-semibold text-[#004A98]">Có dữ liệu đang chờ xem trước</span>}
              </div>
              <span className="shrink-0">Thiết lập chế độ và nguồn dữ liệu trong popup Extension.</span>
            </div>
          )}
        </section>

        <section className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <span className="ustudy-icon-badge ustudy-icon-primary-soft"><Bookmark className="h-5 w-5" /></span>
              <div><h3 className="text-sm font-bold text-gray-900">Bookmarklet dự phòng</h3><p className="mt-1 text-sm text-gray-500">Không cần cài đặt, chạy thủ công ngay trên Portal.</p></div>
            </div>
            <BookmarkletButton variant="outline" hideInstructions className="flex w-auto flex-row items-center justify-start" />
          </div>
        </section>
      </div>

      <AppDialog
        open={isInstallOpen}
        onOpenChange={setIsInstallOpen}
        title="Cài UStudy Portal Sync"
        description="Chrome chưa phát hành extension này trên Store, vì vậy bạn cần tải và cài dưới dạng unpacked."
        icon={Puzzle}
        size="md"
        footer={(
          <>
            <button type="button" onClick={() => setIsInstallOpen(false)} className="ustudy-button-outline">Đóng</button>
            <a href="/downloads/ustudy-portal-sync.zip" download className="ustudy-button-primary"><Download className="h-4 w-4" />Tải extension</a>
          </>
        )}
      >
        <ol className="divide-y divide-gray-200 text-sm text-gray-600">
          <li className="flex gap-3 py-3 first:pt-0"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">1</span><span>Tải file ZIP và giải nén vào một thư mục cố định.</span></li>
          <li className="flex gap-3 py-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">2</span><span>Mở <strong className="font-semibold text-gray-800">chrome://extensions</strong> và bật Chế độ dành cho nhà phát triển.</span></li>
          <li className="flex gap-3 py-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">3</span><span>Chọn <strong className="font-semibold text-gray-800">Tải tiện ích đã giải nén</strong>, sau đó chọn thư mục vừa giải nén.</span></li>
          <li className="flex gap-3 py-3 last:pb-0"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">4</span><span>Tải lại trang Cài đặt này để UStudy nhận diện extension.</span></li>
        </ol>
      </AppDialog>
    </>
  );
}
