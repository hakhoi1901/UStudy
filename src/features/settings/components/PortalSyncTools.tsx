import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bookmark, CheckCircle2, Download, ExternalLink, LoaderCircle, Puzzle, RefreshCw, Smartphone } from 'lucide-react';
import { BookmarkletButton } from '../../../components/portal';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { isNativePortalSyncAvailable, openNativePortalSync } from '../../../mobile/portal-sync';
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

function MobilePortalSyncTools() {
  const { academicYear, semesterNumber } = useDepartmentData();
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState('');

  async function openPortal() {
    setError('');
    setIsOpening(true);
    try {
      await openNativePortalSync(academicYear, semesterNumber);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      if (!/cancel|hủy|huy/i.test(message)) setError(message || 'Không thể mở Portal.');
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="ustudy-icon-badge ustudy-icon-primary"><Smartphone className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900">Đồng bộ Portal trên điện thoại</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Đăng nhập Portal trong ứng dụng, bấm đồng bộ và xem trước thay đổi trước khi lưu.
            </p>
            <p className="mt-1 text-xs font-medium text-[#004A98]">Năm học {academicYear} · Học kỳ {semesterNumber}</p>
          </div>
        </div>
        <button type="button" onClick={() => void openPortal()} disabled={isOpening} className="ustudy-button-primary shrink-0">
          {isOpening ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
          {isOpening ? 'Đang mở Portal' : 'Mở Portal và đồng bộ'}
        </button>
      </div>
      {error && (
        <div className="mt-4 flex items-start gap-2 border-y border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}

function BrowserPortalSyncTools() {
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

  function openPortal() {
    window.open(portalSyncConfig.portalLoginUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <div className="space-y-2">
        <section className="flex items-center justify-between gap-3 px-1 py-1">
          <h3 className="text-sm font-semibold text-gray-900">HCMUS Portal</h3>
          <button type="button" onClick={openPortal} className="ustudy-button-primary h-9 shrink-0 px-3">
            <ExternalLink className="h-4 w-4" />
            Mở Portal
          </button>
        </section>

        <div className="grid gap-2 md:grid-cols-2">
          <section className="flex min-w-0 flex-col gap-2 rounded-lg bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#004A98] text-white">
                <Puzzle className="h-4 w-4" />
              </span>
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                <h3 className="text-sm font-semibold text-gray-900">Extension</h3>
                {isUpdateAvailable ? (
                  <span className="text-xs font-semibold text-amber-700">Có bản mới</span>
                ) : extensionState ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Đã kết nối</span>
                ) : isExtensionInstalled ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Đã cài</span>
                ) : !isChecking ? (
                  <span className="text-xs font-medium text-gray-500">Chưa cài</span>
                ) : (
                  <span className="text-xs font-medium text-gray-500">Đang kiểm tra</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 pl-10 sm:pl-0">
              <button type="button" onClick={() => setDialogMode(isUpdateAvailable ? 'update' : 'install')} className="ustudy-button-outline h-9 px-3">
                <Download className="h-4 w-4" />
                {isUpdateAvailable ? `Cập nhật v${latestVersion}` : `Tải v${latestVersion}`}
              </button>
              {isExtensionInstalled && (
                <button type="button" onClick={() => void refreshState()} disabled={isChecking} className="ustudy-action-icon ustudy-action-icon-primary h-9 w-9" title="Kiểm tra lại extension">
                  <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </section>

          <section className="flex min-w-0 flex-col gap-2 rounded-lg bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98]">
                <Bookmark className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Bookmarklet</h3>
            </div>
            <div className="pl-10 sm:pl-0">
              <BookmarkletButton variant="ghost" hideInstructions className="flex w-auto flex-row items-center justify-start" />
            </div>
          </section>
        </div>
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

export function PortalSyncTools() {
  return isNativePortalSyncAvailable() ? <MobilePortalSyncTools /> : <BrowserPortalSyncTools />;
}
