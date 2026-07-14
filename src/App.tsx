import { useCallback, useEffect, useMemo, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { CheckCircle2, FileUp, RefreshCw } from 'lucide-react';
import { AppRouter } from './app/AppRouter';
import { AppDialog } from './components/ui/app-dialog';
import { ChatbotWidget } from './components/ChatbotWidget';
import { SecurityGate } from './components/SecurityGate';
import { SecurityLock } from './components/SecurityLock';
import { CryptoProvider, CACHE_POPULATED_EVENT, useCrypto } from './context/CryptoContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { NotificationProvider, useAppNotification } from './context/NotificationContext';
import { APP_CONFIG } from './config';
import { createImportRollbackSnapshot, readFromStorage, saveSecure, populateSecureCache } from './helpers/localStorage/save';
import { processRawData } from './logic/dataProcessor';
import { buildRawImportPreview, getImportCollectionLabel, mergeSelectedRawImport, type RawImportChange } from './logic/import-preview';

interface PendingRawImport {
  payload: any;
  changes: RawImportChange[];
  selectedIds: string[];
}

interface ImportSummary {
  added: number;
  updated: number;
  unchanged: number;
}

function AppContent() {
  const { addNotification } = useAppNotification();
  const { cryptoKey, unlock, refreshHasData, hasData } = useCrypto();
  const [pendingData, setPendingData] = useState<any>(null);
  const [importPreview, setImportPreview] = useState<PendingRawImport | null>(null);

  const previewSummary = useMemo(() => ({
    add: importPreview?.changes.filter((change) => change.status === 'add').length ?? 0,
    update: importPreview?.changes.filter((change) => change.status === 'update').length ?? 0,
    unchanged: importPreview?.changes.filter((change) => change.status === 'unchanged').length ?? 0,
  }), [importPreview]);

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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'IMPORT_FULL_DATA') return;
      const payload = event.data.payload;
      const incomingVersion = payload.version || payload.meta?.version;

      if (incomingVersion && incomingVersion !== APP_CONFIG.BOOKMARKLET_VERSION) {
        window.alert(`Bookmarklet cũ. Vui lòng kéo lại nút Bookmarklet mới để lấy dữ liệu chính xác.`);
        addNotification({ title: 'Cần cập nhật Bookmarklet', message: 'Vui lòng kéo lại nút Bookmarklet mới để tương thích với phiên bản hệ thống hiện tại.', type: 'warning' });
      }
      if (!payload?.raw) return;

      const currentRaw = readFromStorage<any>('raw_student_db', null);
      const changes = buildRawImportPreview(payload.raw, currentRaw);
      setImportPreview({
        payload,
        changes,
        selectedIds: changes.filter((change) => change.status !== 'unchanged').map((change) => change.id),
      });
    };

    window.addEventListener('message', handleMessage, true);
    return () => window.removeEventListener('message', handleMessage, true);
  }, [addNotification]);

  const confirmImportPreview = useCallback(async () => {
    if (!importPreview || importPreview.selectedIds.length === 0) return;
    const currentRaw = readFromStorage<any>('raw_student_db', null);
    const payload = {
      ...importPreview.payload,
      raw: mergeSelectedRawImport(importPreview.payload.raw, currentRaw, importPreview.selectedIds),
    };
    const selectedCount = importPreview.selectedIds.length;
    const selectedChanges = importPreview.changes.filter((change) => importPreview.selectedIds.includes(change.id));
    const summary: ImportSummary = {
      added: selectedChanges.filter((change) => change.status === 'add').length,
      updated: selectedChanges.filter((change) => change.status === 'update').length,
      unchanged: importPreview.changes.filter((change) => change.status === 'unchanged').length,
    };

    if (!createImportRollbackSnapshot('Bookmarklet Portal', summary)) {
      addNotification({ title: 'Không thể nhập dữ liệu', message: 'Không đủ dung lượng để lưu điểm hoàn tác. Dữ liệu hiện tại chưa bị thay đổi.', type: 'error' });
      return;
    }

    setImportPreview(null);

    if (!cryptoKey) {
      setPendingData({ ...payload, summary });
      return;
    }

    const student = await saveImportedData(payload.raw, payload.meta, cryptoKey);
    addNotification({ title: 'Nhập dữ liệu thành công', message: `Đã áp dụng ${selectedCount} thay đổi cho ${student.name}: thêm ${summary.added}, cập nhật ${summary.updated}, trùng ${summary.unchanged}. Có thể hoàn tác trong Cài đặt.`, type: 'success' });
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
            addNotification({ title: 'Nhập dữ liệu thành công', message: `Dữ liệu đã được mã hóa và sẵn sàng cho ${student.name}.${summary ? ` Thêm ${summary.added}, cập nhật ${summary.updated}, trùng ${summary.unchanged}.` : ''} Có thể hoàn tác trong Cài đặt.`, type: 'success' });
            setPendingData(null);
          }}
        />
      )}

      <AppDialog
        open={Boolean(importPreview)}
        onOpenChange={(open) => { if (!open) setImportPreview(null); }}
        title="Xem trước dữ liệu từ Portal"
        description="Chỉ các bản ghi được chọn mới được nhập. Bản ghi trùng hoàn toàn sẽ được bỏ qua."
        icon={FileUp}
        size="lg"
        footer={(
          <>
            <button type="button" onClick={() => setImportPreview(null)} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Hủy</button>
            <button type="button" onClick={confirmImportPreview} disabled={!importPreview?.selectedIds.length} className="h-9 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white transition hover:bg-[#003A78] disabled:cursor-not-allowed disabled:opacity-45">Nhập {importPreview?.selectedIds.length ?? 0} bản ghi</button>
          </>
        )}
      >
        <div className="grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 text-center">
          <ImportSummary label="Thêm" value={previewSummary.add} icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} />
          <ImportSummary label="Cập nhật" value={previewSummary.update} icon={<RefreshCw className="h-4 w-4 text-blue-600" />} />
          <ImportSummary label="Trùng" value={previewSummary.unchanged} icon={<FileUp className="h-4 w-4 text-slate-400" />} />
        </div>
        <div className="mt-4 divide-y divide-slate-200">
          {importPreview && Object.entries(Object.groupBy(importPreview.changes, (change) => change.collection)).map(([collection, changes]) => (
            <section key={collection} className="py-3 first:pt-0">
              <div className="mb-1 flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{getImportCollectionLabel(collection as RawImportChange['collection'])}</h3>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button type="button" onClick={() => togglePreviewGroup(changes ?? [], true)} className="text-[#004A98] hover:text-[#003A78]">Chọn tất cả</button>
                  <button type="button" onClick={() => togglePreviewGroup(changes ?? [], false)} className="text-slate-600 hover:text-slate-900">Bỏ chọn</button>
                </div>
              </div>
              {changes?.map((change) => (
                <label key={change.id} className={`flex items-center gap-3 px-1 py-2.5 ${change.status === 'unchanged' ? 'cursor-default opacity-55' : 'cursor-pointer'}`}>
                  <input type="checkbox" checked={importPreview.selectedIds.includes(change.id)} disabled={change.status === 'unchanged'} onChange={(event) => togglePreviewItem(change.id, event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#004A98] focus:ring-[#004A98]" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{change.label}</span>
                  <span className={`shrink-0 text-xs font-semibold ${change.status === 'add' ? 'text-emerald-700' : change.status === 'update' ? 'text-blue-700' : 'text-slate-500'}`}>{change.status === 'add' ? 'Thêm mới' : change.status === 'update' ? 'Cập nhật' : 'Đã trùng'}</span>
                </label>
              ))}
            </section>
          ))}
        </div>
      </AppDialog>

      <AppRouter />
      <ChatbotWidget />
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
