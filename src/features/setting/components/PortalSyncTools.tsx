import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bookmark, CheckCircle2, Download, ExternalLink, Puzzle, RefreshCw } from 'lucide-react';
import { BookmarkletButton } from '../../../components/BookmarkletButton';
import { AppDialog } from '../../../components/ui/app-dialog';
import { getInjectedPortalExtensionVersion, isPortalExtensionInjected, requestPortalExtension } from '../../../portal-sync/bridge';
import { PORTAL_EXTENSION_READY_EVENT, portalSyncConfig, type PortalExtensionState } from '../../../portal-sync/protocol';

type ExtensionDialogMode = 'install' | 'update';

function compareVersions(first: string, second: string) {
  const firstParts = first.replace(/^v/i, '').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const secondParts = second.replace(/^v/i, '').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(firstParts.length, secondParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (firstParts[index] || 0) - (secondParts[index] || 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function formatSyncTime(value: string | null) {
  if (!value) return 'Chưa đồng bộ';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function PortalSyncTools() {
  const [extensionState, setExtensionState] = useState<PortalExtensionState | null>(null);
  const [isExtensionDetected, setIsExtensionDetected] = useState(isPortalExtensionInjected);
  const [detectedVersion, setDetectedVersion] = useState(getInjectedPortalExtensionVersion);
  const [isChecking, setIsChecking] = useState(true);
  const [dialogMode, setDialogMode] = useState<ExtensionDialogMode | null>(null);

  const refreshState = useCallback(async () => {
    setIsChecking(true);
    const nextState = await requestPortalExtension<PortalExtensionState>('GET_STATE');
    setIsExtensionDetected(Boolean(nextState) || isPortalExtensionInjected());
    setExtensionState(nextState);
    setDetectedVersion(nextState?.extensionVersion || getInjectedPortalExtensionVersion());
    setIsChecking(false);
  }, []);

  useEffect(() => {
    void refreshState();

    const handleExtensionReady = (event: Event) => {
      setIsExtensionDetected(true);
      setDetectedVersion((event as CustomEvent<string>).detail || getInjectedPortalExtensionVersion());
      void refreshState();
    };
    document.addEventListener(PORTAL_EXTENSION_READY_EVENT, handleExtensionReady);
    return () => document.removeEventListener(PORTAL_EXTENSION_READY_EVENT, handleExtensionReady);
  }, [refreshState]);

  const isExtensionInstalled = isExtensionDetected || Boolean(extensionState);
  const latestVersion = portalSyncConfig.extensionVersion;
  const installedVersion = extensionState?.extensionVersion || detectedVersion;
  const isUpdateAvailable = Boolean(installedVersion && compareVersions(installedVersion, latestVersion) < 0);
  const extensionDownloadUrl = `/downloads/ustudy-portal-sync.zip?v=${encodeURIComponent(latestVersion)}`;

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
                  {isUpdateAvailable ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />Cần cập nhật</span>
                  ) : extensionState ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#004A98] px-2 py-1 text-[11px] font-semibold text-white"><CheckCircle2 className="h-3.5 w-3.5" />Đã kết nối</span>
                  ) : isExtensionInstalled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#004A98] px-2 py-1 text-[11px] font-semibold text-white"><CheckCircle2 className="h-3.5 w-3.5" />Đã cài đặt</span>
                  ) : !isChecking ? (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">Chưa cài đặt</span>
                  ) : null}
                  {isExtensionInstalled && <span className="text-xs font-semibold tabular-nums text-gray-500">v{installedVersion || 'không rõ'}</span>}
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Extension tự nhận diện Portal và chuyển dữ liệu vào màn hình xem trước của UStudy.</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isExtensionInstalled && <button type="button" onClick={() => void refreshState()} disabled={isChecking} className="ustudy-action-icon ustudy-action-icon-primary hidden sm:inline-grid" title="Kiểm tra lại extension"><RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} /></button>}
              {isUpdateAvailable ? (
                <button type="button" onClick={() => setDialogMode('update')} className="ustudy-button-primary"><Download className="h-4 w-4" />Cập nhật v{latestVersion}</button>
              ) : isExtensionInstalled ? (
                <button type="button" onClick={() => void openPortal()} className="ustudy-button-primary"><ExternalLink className="h-4 w-4" />Mở Portal</button>
              ) : (
                <button type="button" onClick={() => setDialogMode('install')} className="ustudy-button-primary"><Download className="h-4 w-4" />Cài extension</button>
              )}
            </div>
          </div>

          {isUpdateAvailable && (
            <div className="mt-4 flex flex-col gap-3 border-y border-amber-200 bg-amber-50/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div><p className="text-sm font-semibold text-gray-900">Đã có UStudy Portal Sync v{latestVersion}</p><p className="mt-0.5 text-xs text-gray-600">Bạn đang dùng v{installedVersion}. Cập nhật để dùng đúng crawler và giao thức mới nhất.</p></div>
              </div>
              <button type="button" onClick={() => setDialogMode('update')} className="ustudy-button-outline shrink-0"><Download className="h-4 w-4" />Xem cách cập nhật</button>
            </div>
          )}

          {extensionState && (
            <div className="mt-4 flex flex-col text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
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
        open={dialogMode !== null}
        onOpenChange={(open) => { if (!open) setDialogMode(null); }}
        title={dialogMode === 'update' ? `Cập nhật UStudy Portal Sync v${latestVersion}` : 'Cài UStudy Portal Sync'}
        description={dialogMode === 'update'
          ? `Bạn đang dùng v${installedVersion || 'không rõ'}. Vì extension được cài dạng unpacked, hãy thay bộ file cũ rồi reload extension.`
          : 'Chrome chưa phát hành extension này trên Store, vì vậy bạn cần tải và cài dưới dạng unpacked.'}
        icon={Puzzle}
        size="md"
        footer={(
          <>
            <button type="button" onClick={() => setDialogMode(null)} className="ustudy-button-outline">Đóng</button>
            <a href={extensionDownloadUrl} download className="ustudy-button-primary"><Download className="h-4 w-4" />Tải bản v{latestVersion}</a>
          </>
        )}
      >
        {dialogMode === 'update' ? (
          <ol className="divide-y divide-gray-200 text-sm text-gray-600">
            <li className="flex gap-3 py-3 first:pt-0"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">1</span><span>Tải và giải nén bản v{latestVersion}.</span></li>
            <li className="flex gap-3 py-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">2</span><span>Thay toàn bộ file trong thư mục extension cũ bằng các file vừa giải nén.</span></li>
            <li className="flex gap-3 py-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">3</span><span>Mở <strong className="font-semibold text-gray-800">chrome://extensions</strong> và bấm <strong className="font-semibold text-gray-800">Reload</strong> tại UStudy Portal Sync.</span></li>
            <li className="flex gap-3 py-3 last:pb-0"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">4</span><span>Tải lại UStudy; phiên bản mới sẽ được nhận diện tự động.</span></li>
          </ol>
        ) : (
          <ol className="divide-y divide-gray-200 text-sm text-gray-600">
            <li className="flex gap-3 py-3 first:pt-0"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">1</span><span>Tải file ZIP và giải nén vào một thư mục cố định.</span></li>
            <li className="flex gap-3 py-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">2</span><span>Mở <strong className="font-semibold text-gray-800">chrome://extensions</strong> và bật Chế độ dành cho nhà phát triển.</span></li>
            <li className="flex gap-3 py-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">3</span><span>Chọn <strong className="font-semibold text-gray-800">Tải tiện ích đã giải nén</strong>, sau đó chọn thư mục vừa giải nén.</span></li>
            <li className="flex gap-3 py-3 last:pb-0"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#004A98]">4</span><span>Tải lại trang Cài đặt này để UStudy nhận diện extension.</span></li>
          </ol>
        )}
      </AppDialog>
    </>
  );
}
