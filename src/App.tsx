import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BookOpen, CheckCircle2, ChevronUp, Eye, FileUp, RefreshCw, Trash2 } from 'lucide-react';
import { AppRouter } from './app/AppRouter';
import { AppDialog } from './components/ui/app-dialog';
import { SecurityGate } from './components/SecurityGate';
import { SecurityLock } from './components/SecurityLock';
import { CryptoProvider, CACHE_POPULATED_EVENT, useCrypto } from './context/CryptoContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { NotificationProvider, useAppNotification } from './context/NotificationContext';
import { createImportRollbackSnapshot, readFromStorage, saveSecure, populateSecureCache } from './helpers/localStorage/save';
import { processRawData } from './logic/dataProcessor';
import { buildRawImportPreview, getImportCollectionLabel, mergeSelectedRawImport, type RawImportChange } from './logic/import-preview';
import { mergeImportMetadata, type PortalDataSource } from './logic/import-metadata';
import { requestPortalExtension } from './portal-sync/bridge';
import {
  PORTAL_EXTENSION_PENDING_AVAILABLE,
  PORTAL_EXTENSION_READY_EVENT,
  PORTAL_MOBILE_IMPORT_EVENT,
  PORTAL_SCRAPER_VERSION,
  isSupportedPortalOrigin,
  isPortalSyncPacket,
  type PendingPortalImport,
  type PortalImportTransport,
  type PortalSyncPacket,
} from './portal-sync/protocol';

interface PendingRawImport {
  payload: PortalSyncPacket;
  changes: RawImportChange[];
  selectedIds: string[];
  source: PortalImportTransport;
}

interface ImportSummary {
  added: number;
  updated: number;
  removed: number;
  unchanged: number;
}

interface ImportCourseSummary {
  id: string;
  name: string;
  status: 'add' | 'update' | 'remove';
}

interface ImportCollectionSummary {
  collection: RawImportChange['collection'];
  courses: ImportCourseSummary[];
  add: number;
  update: number;
  remove: number;
  nonCourseChanges: number;
}

function AppContent() {
  const { addNotification } = useAppNotification();
  const { cryptoKey, unlock, refreshHasData, hasData } = useCrypto();
  const [pendingData, setPendingData] = useState<any>(null);
  const [importPreview, setImportPreview] = useState<PendingRawImport | null>(null);
  const [isImportDetailsOpen, setIsImportDetailsOpen] = useState(false);
  const handledExtensionImports = useRef(new Set<string>());

  const previewSummary = useMemo(() => ({
    add: importPreview?.changes.filter((change) => change.status === 'add').length ?? 0,
    update: importPreview?.changes.filter((change) => change.status === 'update').length ?? 0,
    remove: importPreview?.changes.filter((change) => change.status === 'remove').length ?? 0,
    unchanged: importPreview?.changes.filter((change) => change.status === 'unchanged').length ?? 0,
  }), [importPreview]);
  const groupedPreviewChanges = useMemo(() => {
    const groups: Partial<Record<RawImportChange['collection'], RawImportChange[]>> = {};
    for (const change of importPreview?.changes ?? []) {
      (groups[change.collection] ??= []).push(change);
    }
    return Object.entries(groups) as Array<[RawImportChange['collection'], RawImportChange[]]>;
  }, [importPreview]);
  const changedCollectionSummaries = useMemo(() => {
    const summaries = new Map<RawImportChange['collection'], ImportCollectionSummary>();
    const coursesByCollection = new Map<RawImportChange['collection'], Map<string, ImportCourseSummary>>();

    for (const change of importPreview?.changes ?? []) {
      if (change.status === 'unchanged') continue;

      let summary = summaries.get(change.collection);
      if (!summary) {
        summary = {
          collection: change.collection,
          courses: [],
          add: 0,
          update: 0,
          remove: 0,
          nonCourseChanges: 0,
        };
        summaries.set(change.collection, summary);
      }

      summary[change.status] += 1;
      if (!change.courseId) {
        summary.nonCourseChanges += 1;
        continue;
      }

      let courses = coursesByCollection.get(change.collection);
      if (!courses) {
        courses = new Map<string, ImportCourseSummary>();
        coursesByCollection.set(change.collection, courses);
      }

      const key = change.courseId.toLocaleUpperCase('vi-VN');
      const existing = courses.get(key);
      if (existing) {
        if (change.courseName && existing.name === 'Chưa rõ tên môn') existing.name = change.courseName;
        if (existing.status !== change.status) existing.status = 'update';
        continue;
      }
      courses.set(key, {
        id: change.courseId,
        name: change.courseName || 'Chưa rõ tên môn',
        status: change.status,
      });
    }

    for (const [collection, summary] of summaries) {
      summary.courses = Array.from(coursesByCollection.get(collection)?.values() ?? [])
        .sort((first, second) => first.id.localeCompare(second.id, 'vi-VN'));
    }
    return Array.from(summaries.values());
  }, [importPreview]);

  const saveImportedData = useCallback(async (raw: any, meta: any, key: CryptoKey) => {
    await saveSecure('raw_student_db', raw, key);
    const { student, courses } = processRawData(raw);
    await saveSecure('student_db_full', student, key);
    await saveSecure('course_db_offline', courses, key);
    if (meta) await saveSecure('import_meta', meta, key);

    populateSecureCache('raw_student_db', raw);
    populateSecureCache('student_db_full', student);
    populateSecureCache('course_db_offline', courses);
    if (meta) populateSecureCache('import_meta', meta);
    window.dispatchEvent(new MessageEvent('message', { data: { type: CACHE_POPULATED_EVENT } }));
    refreshHasData();
    return student;
  }, [refreshHasData]);

  const preparePortalImport = useCallback((payload: PortalSyncPacket, source: PortalImportTransport, suppressIfUnchanged = false) => {
      const incomingVersion = payload.scraperVersion || payload.version || String(payload.meta?.scraperVersion || payload.meta?.version || '');
      if (incomingVersion && incomingVersion !== PORTAL_SCRAPER_VERSION) {
        addNotification({
          title: 'Công cụ đồng bộ cần cập nhật',
          message: source === 'extension'
            ? 'Vui lòng cập nhật UStudy Portal Sync trước khi tiếp tục đồng bộ.'
            : source === 'mobile-app'
              ? 'Vui lòng cập nhật ứng dụng UStudy trước khi tiếp tục đồng bộ.'
              : 'Vui lòng kéo lại Bookmarklet mới để lấy dữ liệu chính xác.',
          type: 'warning',
        });
      }
      const currentRaw = readFromStorage<any>('raw_student_db', null);
      const changes = buildRawImportPreview(payload.raw, currentRaw);
      if (suppressIfUnchanged && changes.every((change) => change.status === 'unchanged')) return false;
      setIsImportDetailsOpen(false);
      setImportPreview({
        payload,
        changes,
        selectedIds: changes.filter((change) => change.status !== 'unchanged').map((change) => change.id),
        source,
      });
      return true;
  }, [addNotification]);

  useEffect(() => {
    const handleBookmarkletMessage = (event: MessageEvent) => {
      if (!isSupportedPortalOrigin(event.origin) || event.data?.type !== 'IMPORT_FULL_DATA') return;
      if (!isPortalSyncPacket(event.data.payload)) return;
      preparePortalImport(event.data.payload, 'bookmarklet');
    };

    window.addEventListener('message', handleBookmarkletMessage);
    return () => window.removeEventListener('message', handleBookmarkletMessage);
  }, [preparePortalImport]);

  useEffect(() => {
    const handleMobilePortalImport = (event: Event) => {
      const packet = (event as CustomEvent<PortalSyncPacket>).detail;
      if (!isPortalSyncPacket(packet)) return;
      preparePortalImport(packet, 'mobile-app');
    };

    window.addEventListener(PORTAL_MOBILE_IMPORT_EVENT, handleMobilePortalImport);
    return () => window.removeEventListener(PORTAL_MOBILE_IMPORT_EVENT, handleMobilePortalImport);
  }, [preparePortalImport]);

  useEffect(() => {
    let active = true;

    async function consumePendingExtensionImport() {
      const pendingImport = await requestPortalExtension<PendingPortalImport>('GET_PENDING_IMPORT');
      if (!active || !pendingImport || handledExtensionImports.current.has(pendingImport.id)) return;
      if (!isPortalSyncPacket(pendingImport.packet)) return;

      handledExtensionImports.current.add(pendingImport.id);
      preparePortalImport(pendingImport.packet, 'extension', pendingImport.trigger === 'auto');
      await requestPortalExtension('ACK_PENDING_IMPORT', { id: pendingImport.id });
    }

    function handlePendingAvailable(event: MessageEvent) {
      if (event.source !== window || event.origin !== window.location.origin) return;
      if (event.data?.type === PORTAL_EXTENSION_PENDING_AVAILABLE) void consumePendingExtensionImport();
    }

    function handleExtensionReady() {
      void consumePendingExtensionImport();
    }

    window.addEventListener('message', handlePendingAvailable);
    document.addEventListener(PORTAL_EXTENSION_READY_EVENT, handleExtensionReady);
    void consumePendingExtensionImport();
    return () => {
      active = false;
      window.removeEventListener('message', handlePendingAvailable);
      document.removeEventListener(PORTAL_EXTENSION_READY_EVENT, handleExtensionReady);
    };
  }, [preparePortalImport]);

  const confirmImportPreview = useCallback(async () => {
    if (!importPreview || importPreview.selectedIds.length === 0) return;
    const currentRaw = readFromStorage<any>('raw_student_db', null);
    const selectedChanges = importPreview.changes.filter((change) => importPreview.selectedIds.includes(change.id));
    const updatedSources = new Set(selectedChanges.map((change) => change.collection as PortalDataSource));
    const currentMeta = readFromStorage<any>('import_meta', null);
    const payload = {
      ...importPreview.payload,
      raw: mergeSelectedRawImport(importPreview.payload.raw, currentRaw, importPreview.selectedIds),
      meta: mergeImportMetadata(currentMeta, importPreview.payload.meta, updatedSources),
    };
    const selectedCount = importPreview.selectedIds.length;
    const summary: ImportSummary = {
      added: selectedChanges.filter((change) => change.status === 'add').length,
      updated: selectedChanges.filter((change) => change.status === 'update').length,
      removed: selectedChanges.filter((change) => change.status === 'remove').length,
      unchanged: importPreview.changes.filter((change) => change.status === 'unchanged').length,
    };
    const details = Array.from(updatedSources).map((source) => {
      const sourceChanges = selectedChanges.filter((change) => change.collection === source);
      return {
        source,
        added: sourceChanges.filter((change) => change.status === 'add').length,
        updated: sourceChanges.filter((change) => change.status === 'update').length,
        removed: sourceChanges.filter((change) => change.status === 'remove').length,
        unchanged: importPreview.changes.filter((change) => change.collection === source && change.status === 'unchanged').length,
      };
    });

    const importSourceLabel = importPreview.source === 'extension'
      ? 'UStudy Extension'
      : importPreview.source === 'mobile-app'
        ? 'UStudy Android'
        : 'Bookmarklet Portal';
    if (!createImportRollbackSnapshot(importSourceLabel, summary, details)) {
      addNotification({ title: 'Không thể nhập dữ liệu', message: 'Không đủ dung lượng để lưu điểm hoàn tác. Dữ liệu hiện tại chưa bị thay đổi.', type: 'error' });
      return;
    }

    setImportPreview(null);
    setIsImportDetailsOpen(false);

    if (!cryptoKey) {
      setPendingData({ ...payload, summary, source: importPreview.source });
      return;
    }

    const student = await saveImportedData(payload.raw, payload.meta, cryptoKey);
    addNotification({ title: 'Nhập dữ liệu thành công', message: `Đã áp dụng ${selectedCount} thay đổi cho ${student.name}: thêm ${summary.added}, cập nhật ${summary.updated}, xóa ${summary.removed}, trùng ${summary.unchanged}. Có thể hoàn tác trong Cài đặt.`, type: 'success' });
  }, [addNotification, cryptoKey, importPreview, saveImportedData]);

  const togglePreviewItem = useCallback((id: string, checked: boolean) => {
    setImportPreview((current) => current ? {
      ...current,
      selectedIds: checked ? [...current.selectedIds, id] : current.selectedIds.filter((selectedId) => selectedId !== id),
    } : current);
  }, []);

  const togglePreviewGroup = useCallback((changes: RawImportChange[], checked: boolean) => {
    const selectableIds = changes.filter((change) => change.status !== 'unchanged').map((change) => change.id);
    setImportPreview((current) => current ? {
      ...current,
      selectedIds: checked
        ? Array.from(new Set([...current.selectedIds, ...selectableIds]))
        : current.selectedIds.filter((id) => !selectableIds.includes(id)),
    } : current);
  }, []);

  return (
    <>
      {pendingData && !cryptoKey && (
        <SecurityLock
          setupMode={!hasData}
          onUnlock={async (key) => {
            unlock(key);
            const student = await saveImportedData(pendingData.raw, pendingData.meta, key);
            const summary: ImportSummary | undefined = pendingData.summary;
            addNotification({ title: 'Nhập dữ liệu thành công', message: `Dữ liệu đã được mã hóa và sẵn sàng cho ${student.name}.${summary ? ` Thêm ${summary.added}, cập nhật ${summary.updated}, xóa ${summary.removed}, trùng ${summary.unchanged}.` : ''} Có thể hoàn tác trong Cài đặt.`, type: 'success' });
            setPendingData(null);
          }}
        />
      )}

      <AppDialog
        open={Boolean(importPreview)}
        onOpenChange={(open) => {
          if (!open) {
            setImportPreview(null);
            setIsImportDetailsOpen(false);
          }
        }}
        title={`Xem trước dữ liệu từ ${importPreview?.source === 'extension' ? 'UStudy Extension' : importPreview?.source === 'mobile-app' ? 'UStudy Android' : 'Bookmarklet'}`}
        description={`Phát hiện ${previewSummary.add + previewSummary.update + previewSummary.remove} thay đổi trong ${changedCollectionSummaries.length} nhóm dữ liệu. Kiểm tra tóm tắt trước khi áp dụng.`}
        icon={FileUp}
        size={isImportDetailsOpen ? 'lg' : 'md'}
        footer={(
          <>
            <button type="button" onClick={() => { setImportPreview(null); setIsImportDetailsOpen(false); }} className="ustudy-button-outline">Hủy</button>
            <button type="button" onClick={() => setIsImportDetailsOpen((current) => !current)} className="ustudy-button-outline">
              {isImportDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isImportDetailsOpen ? 'Thu gọn' : 'Xem chi tiết'}
            </button>
            <button type="button" onClick={confirmImportPreview} disabled={!importPreview?.selectedIds.length} className="ustudy-button-primary">Nhập {importPreview?.selectedIds.length ?? 0} thay đổi</button>
          </>
        )}
      >
        <div className="grid grid-cols-4 divide-x divide-slate-200 border-y border-slate-200 text-center">
          <ImportSummary label="Thêm" value={previewSummary.add} icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} />
          <ImportSummary label="Cập nhật" value={previewSummary.update} icon={<RefreshCw className="h-4 w-4 text-blue-600" />} />
          <ImportSummary label="Xóa" value={previewSummary.remove} icon={<Trash2 className="h-4 w-4 text-red-500" />} />
          <ImportSummary label="Trùng" value={previewSummary.unchanged} icon={<FileUp className="h-4 w-4 text-slate-400" />} />
        </div>
        {!isImportDetailsOpen && (
          <section className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#004A98]" />
              <h3 className="text-sm font-semibold text-slate-900">Thay đổi theo nhóm thông tin</h3>
            </div>
            {changedCollectionSummaries.length > 0 ? (
              <div className="max-h-70 space-y-3 overflow-y-auto pr-1">
                {changedCollectionSummaries.map((summary) => (
                  <section key={summary.collection} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
                      <h4 className="text-sm font-semibold text-slate-900">{getImportCollectionLabel(summary.collection)}</h4>
                      <span className="shrink-0 text-xs text-slate-500">
                        {summary.add > 0 && <strong className="font-semibold text-emerald-700">{summary.add} thêm</strong>}
                        {summary.add > 0 && (summary.update > 0 || summary.remove > 0) && <span className="mx-1.5">·</span>}
                        {summary.update > 0 && <strong className="font-semibold text-blue-700">{summary.update} cập nhật</strong>}
                        {summary.update > 0 && summary.remove > 0 && <span className="mx-1.5">·</span>}
                        {summary.remove > 0 && <strong className="font-semibold text-red-600">{summary.remove} xóa</strong>}
                      </span>
                    </div>
                    {summary.courses.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {summary.courses.map((course) => (
                          <div key={course.id} className="flex items-center gap-3 px-3 py-2.5">
                            <span className="w-24 shrink-0 text-xs font-bold text-[#004A98]">{course.id}</span>
                            <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{course.name}</span>
                            <span className={`shrink-0 text-xs font-semibold ${course.status === 'add' ? 'text-emerald-700' : course.status === 'remove' ? 'text-red-600' : 'text-blue-700'}`}>{course.status === 'add' ? 'Thêm mới' : course.status === 'remove' ? 'Xóa' : 'Cập nhật'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-3 py-2.5 text-sm text-slate-600">{summary.nonCourseChanges} bản ghi có thay đổi.</p>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">Không có dữ liệu mới cần áp dụng.</p>
            )}
            {previewSummary.unchanged > 0 && <p className="mt-2 text-xs text-slate-500">{previewSummary.unchanged} bản ghi trùng sẽ được bỏ qua.</p>}
          </section>
        )}
        {isImportDetailsOpen && (
          <div className="mt-4 divide-y divide-slate-200">
            {importPreview && groupedPreviewChanges.map(([collection, changes]) => (
              <section key={collection} className="py-3 first:pt-0">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{getImportCollectionLabel(collection as RawImportChange['collection'])}</h3>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <button type="button" onClick={() => togglePreviewGroup(changes, true)} className="text-[#004A98] hover:text-[#003A78]">Chọn tất cả</button>
                    <button type="button" onClick={() => togglePreviewGroup(changes, false)} className="text-slate-600 hover:text-slate-900">Bỏ chọn</button>
                  </div>
                </div>
                {changes.map((change) => (
                  <label key={change.id} className={`flex items-center gap-3 px-1 py-2.5 ${change.status === 'unchanged' ? 'cursor-default opacity-55' : 'cursor-pointer'}`}>
                    <input type="checkbox" checked={importPreview.selectedIds.includes(change.id)} disabled={change.status === 'unchanged'} onChange={(event) => togglePreviewItem(change.id, event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#004A98] focus:ring-[#004A98]" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{change.label}</span>
                    <span className={`shrink-0 text-xs font-semibold ${change.status === 'add' ? 'text-emerald-700' : change.status === 'update' ? 'text-blue-700' : change.status === 'remove' ? 'text-red-600' : 'text-slate-500'}`}>{change.status === 'add' ? 'Thêm mới' : change.status === 'update' ? 'Cập nhật' : change.status === 'remove' ? 'Xóa' : 'Đã trùng'}</span>
                  </label>
                ))}
              </section>
            ))}
          </div>
        )}
      </AppDialog>

      <AppRouter />
    </>
  );
}

function ImportSummary({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="flex flex-col items-center gap-1 px-3 py-3"><span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">{icon}{label}</span><strong className="text-lg tabular-nums text-slate-900">{value}</strong></div>;
}

export default function App() {
  return (
    <CryptoProvider>
      <Analytics />
      <SecurityGate>
        <NotificationProvider>
          <DepartmentProvider>
            <AppContent />
          </DepartmentProvider>
        </NotificationProvider>
      </SecurityGate>
    </CryptoProvider>
  );
}
