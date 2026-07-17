import { CheckCircle2, Database, Download, FileUp, RefreshCw, Upload } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AppDialog } from '../../../components/ui/app-dialog';
import { SecurityLock } from '../../../components/SecurityLock';
import { useCrypto } from '../../../context/CryptoContext';
import { createImportRollbackSnapshot, hasSecureData, IMPORT_HISTORY_STORAGE_KEY, IMPORT_ROLLBACK_STORAGE_KEY, importBackupWithCurrentKey, SECURE_DATA_KEYS, verifyBackupPin } from '../../../helpers/localStorage/save';

type ImportStatus = 'add' | 'update' | 'unchanged';

interface ImportItem {
  key: string;
  label: string;
  group: string;
  status: ImportStatus;
}

interface ImportPreview {
  data: Record<string, string>;
  encrypted: boolean;
  sourceName: string;
  items: ImportItem[];
  selectedKeys: string[];
}

interface ExportGroup {
  name: string;
  items: ExportItem[];
}

interface ExportItem {
  key: string;
  label: string;
}

interface ExportPreview {
  data: Record<string, string>;
  groups: ExportGroup[];
  selectedKeys: string[];
}

const INTERNAL_BACKUP_KEYS = new Set(['__pbkdf2_salt__', '__pin_verify__', '__fail_count__', '__lockout_until__', IMPORT_ROLLBACK_STORAGE_KEY, IMPORT_HISTORY_STORAGE_KEY]);

const IMPORT_LABELS: Record<string, { label: string; group: string }> = {
  raw_student_db: { label: 'Dữ liệu Portal gốc', group: 'Dữ liệu học tập' },
  student_db_full: { label: 'Kết quả học tập và đăng ký', group: 'Dữ liệu học tập' },
  course_db_offline: { label: 'Danh sách lớp mở', group: 'Dữ liệu học tập' },
  import_meta: { label: 'Học kỳ và thời điểm đồng bộ', group: 'Dữ liệu học tập' },
  study_plan_draft: { label: 'Kế hoạch học tập', group: 'Kế hoạch cá nhân' },
  study_plan_draft_layout: { label: 'Bố cục kế hoạch học tập', group: 'Kế hoạch cá nhân' },
  selected_courses_basket: { label: 'Môn học đã chọn', group: 'Kế hoạch cá nhân' },
  allowed_classes_map: { label: 'Lớp học ưu tiên', group: 'Kế hoạch cá nhân' },
  saved_schedules: { label: 'Thời khóa biểu đã lưu', group: 'Lịch học' },
  schedule_overrides: { label: 'Tùy chỉnh thời khóa biểu', group: 'Lịch học' },
  active_group_schedule: { label: 'Phương án xếp lịch nhóm', group: 'Lịch học' },
  group_schedule_last_result: { label: 'Kết quả xếp lịch nhóm gần nhất', group: 'Lịch học' },
  gpa_projected_grades: { label: 'Điểm dự kiến GPA', group: 'Kế hoạch cá nhân' },
  gpa_pull_future_grades: { label: 'Điểm dự kiến GPA còn lại', group: 'Kế hoạch cá nhân' },
  dashboard_layout_preferences: { label: 'Bố cục trang tổng quan', group: 'Cài đặt giao diện' },
};

function getImportItem(key: string, value: string): ImportItem {
  const config = IMPORT_LABELS[key] ?? { label: key, group: 'Cài đặt và dữ liệu khác' };
  const currentValue = localStorage.getItem(key);
  return {
    key,
    label: config.label,
    group: config.group,
    status: currentValue === null ? 'add' : currentValue === value ? 'unchanged' : 'update',
  };
}

function isPortalBackup(data: Record<string, string>): boolean {
  return Object.keys(data).some((key) => (
    key.startsWith('db_') || key.startsWith('app_') || key.includes('semester') || key === 'raw_student_db' || key === 'student_db_full'
  ));
}

interface ImportDataProps {
  compact?: boolean;
  importButtonLabel?: string;
}

export function ImportData({ compact = false, importButtonLabel = 'Nhập dữ liệu' }: ImportDataProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [pendingImport, setPendingImport] = useState<ImportPreview | null>(null);
  const [exportPreview, setExportPreview] = useState<ExportPreview | null>(null);
  const { cryptoKey } = useCrypto();

  const previewGroups = useMemo(() => {
    if (!preview) return [];
    return Array.from(new Set(preview.items.map((item) => item.group))).map((group) => ({
      group,
      items: preview.items.filter((item) => item.group === group),
    }));
  }, [preview]);

  const previewSummary = useMemo(() => ({
    add: preview?.items.filter((item) => item.status === 'add').length ?? 0,
    update: preview?.items.filter((item) => item.status === 'update').length ?? 0,
    unchanged: preview?.items.filter((item) => item.status === 'unchanged').length ?? 0,
  }), [preview]);

  function openExportPreview() {
    try {
      const store: Record<string, string> = {};
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key) store[key] = localStorage.getItem(key) || '';
      }

      const items = Object.entries(store)
        .filter(([key]) => !INTERNAL_BACKUP_KEYS.has(key))
        .map(([key]) => ({ key, label: IMPORT_LABELS[key]?.label ?? key, group: IMPORT_LABELS[key]?.group ?? 'Cài đặt và dữ liệu khác' }));
      const groups = items.reduce<Record<string, ExportItem[]>>((result, item) => {
          result[item.group] = [...(result[item.group] ?? []), { key: item.key, label: item.label }];
          return result;
        }, {});

      const exportGroups = Object.entries(groups).map(([name, groupItems]) => ({ name, items: groupItems }));
      setExportPreview({ data: store, groups: exportGroups, selectedKeys: items.map((item) => item.key) });
    } catch {
      window.alert('Đã xảy ra lỗi khi chuẩn bị xuất dữ liệu.');
    }
  }

  function confirmExport() {
    if (!exportPreview || exportPreview.selectedKeys.length === 0) return;
    try {
      const selectedKeys = exportPreview.selectedKeys;
      const exportData = Object.fromEntries(selectedKeys.map((key) => [key, exportPreview.data[key]]));
      const includesSecureData = selectedKeys.some((key) => (SECURE_DATA_KEYS as readonly string[]).includes(key));

      if (includesSecureData) {
        ['__pbkdf2_salt__', '__pin_verify__'].forEach((key) => {
          const value = exportPreview.data[key];
          if (value) exportData[key] = value;
        });
      }

      const blob = new Blob([JSON.stringify({
        metadata: { version: '2.0', exportedAt: new Date().toISOString(), source: 'hcmus-portal-tool' },
        data: exportData,
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hcmus-portal-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExportPreview(null);
    } catch {
      window.alert('Đã xảy ra lỗi khi xuất dữ liệu.');
    }
  }

  function toggleExportGroup(items: ExportItem[], checked: boolean) {
    const keys = items.map((item) => item.key);
    setExportPreview((current) => current ? {
      ...current,
      selectedKeys: checked
        ? Array.from(new Set([...current.selectedKeys, ...keys]))
        : current.selectedKeys.filter((key) => !keys.includes(key)),
    } : current);
  }

  function toggleExportItem(key: string, checked: boolean) {
    setExportPreview((current) => current ? {
      ...current,
      selectedKeys: checked ? [...current.selectedKeys, key] : current.selectedKeys.filter((selectedKey) => selectedKey !== key),
    } : current);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const importedContent = JSON.parse(String(reader.result));
        const data = importedContent?.metadata?.source === 'hcmus-portal-tool' && importedContent.data
          ? importedContent.data
          : importedContent;

        if (!data || typeof data !== 'object' || Array.isArray(data) || !isPortalBackup(data)) {
          window.alert('Tệp này không chứa dữ liệu hợp lệ của hệ thống.');
          return;
        }

        const importData = data as Record<string, string>;
        const items = Object.entries(importData)
          .filter(([key]) => !INTERNAL_BACKUP_KEYS.has(key))
          .map(([key, value]) => getImportItem(key, value));
        const encrypted = Boolean(importData.__pbkdf2_salt__ && importData.__pin_verify__);
        setPreview({
          data: importData,
          encrypted,
          sourceName: file.name.replace(/\.json$/i, ''),
          items,
          selectedKeys: items.filter((item) => item.status !== 'unchanged').map((item) => item.key),
        });
      } catch {
        window.alert('Tệp không hợp lệ hoặc bị lỗi.');
      }
    };
    reader.readAsText(file);
  }

  function toggleItem(key: string, checked: boolean) {
    setPreview((current) => current ? {
      ...current,
      selectedKeys: checked ? [...current.selectedKeys, key] : current.selectedKeys.filter((item) => item !== key),
    } : current);
  }

  function toggleImportGroup(items: ImportItem[], checked: boolean) {
    const selectableKeys = items.filter((item) => item.status !== 'unchanged').map((item) => item.key);
    setPreview((current) => current ? {
      ...current,
      selectedKeys: checked
        ? Array.from(new Set([...current.selectedKeys, ...selectableKeys]))
        : current.selectedKeys.filter((key) => !selectableKeys.includes(key)),
    } : current);
  }

  function applyPlainImport(importPreview: ImportPreview) {
    importPreview.selectedKeys.forEach((key) => localStorage.setItem(key, importPreview.data[key]));
    window.location.reload();
  }

  function createRollbackForPreview(importPreview: ImportPreview): boolean {
    const selectedItems = importPreview.items.filter((item) => importPreview.selectedKeys.includes(item.key));
    return createImportRollbackSnapshot('Tệp sao lưu', {
      added: selectedItems.filter((item) => item.status === 'add').length,
      updated: selectedItems.filter((item) => item.status === 'update').length,
      unchanged: importPreview.items.filter((item) => item.status === 'unchanged').length,
    }, [], importPreview.sourceName);
  }

  function confirmPreview() {
    if (!preview || preview.selectedKeys.length === 0) return;
    if (!createRollbackForPreview(preview)) {
      window.alert('Không đủ dung lượng để lưu điểm hoàn tác. Dữ liệu chưa được nhập.');
      return;
    }
    setPreview(null);
    if (preview.encrypted) {
      setPendingImport(preview);
      return;
    }
    applyPlainImport(preview);
  }

  return (
    <div className={compact ? '' : 'flex h-full flex-col'}>
      {!compact && (
        <>
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-gray-900"><Database className="h-5 w-5" />Nhập / Xuất dữ liệu</h2>
          <p className="mb-6 flex-grow text-sm text-gray-500">Xuất dữ liệu cục bộ thành tệp sao lưu, hoặc chọn từng khối dữ liệu cần nhận trước khi nhập.</p>
        </>
      )}
      <div className={compact ? 'flex w-full' : 'mt-auto flex flex-wrap items-center justify-start gap-3'}>
        {!compact && <button type="button" onClick={openExportPreview} className="flex items-center gap-1.5 rounded-lg border-2 border-[#004A98] bg-white px-3 py-1.5 text-sm font-semibold text-[#004A98] shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 hover:bg-blue-50 active:translate-y-1 active:shadow-none"><Upload className="h-4 w-4" strokeWidth={2.5} />Xuất dữ liệu</button>}
        <button type="button" onClick={() => fileInputRef.current?.click()} className={compact ? 'flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#004A98] bg-white px-4 py-2.5 text-sm font-semibold text-[#004A98] transition-colors hover:bg-blue-50' : 'flex items-center gap-1.5 rounded-lg border-2 border-transparent bg-[#004A98] px-3 py-1.5 text-sm font-semibold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 hover:bg-[#003A78] active:translate-y-1 active:shadow-none'}><Download className="h-4 w-4" strokeWidth={2.5} />{importButtonLabel}</button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      </div>

      <AppDialog
        open={Boolean(preview)}
        onOpenChange={(open) => { if (!open) setPreview(null); }}
        title="Xem trước dữ liệu nhập"
        description={preview?.encrypted ? 'Tệp được mã hóa. Bạn vẫn có thể chọn các khối dữ liệu trước khi xác thực PIN.' : 'Chỉ các mục được chọn mới ghi vào dữ liệu hiện tại.'}
        icon={FileUp}
        size="lg"
        footer={(
          <>
            <button type="button" onClick={() => setPreview(null)} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Hủy</button>
            <button type="button" disabled={!preview?.selectedKeys.length} onClick={confirmPreview} className="h-9 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white transition hover:bg-[#003A78] disabled:cursor-not-allowed disabled:opacity-45">Nhập {preview?.selectedKeys.length ?? 0} mục</button>
          </>
        )}
      >
        <div className="grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 text-center">
          <PreviewStat label="Mới" value={previewSummary.add} icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} />
          <PreviewStat label="Cập nhật" value={previewSummary.update} icon={<RefreshCw className="h-4 w-4 text-blue-600" />} />
          <PreviewStat label="Trùng" value={previewSummary.unchanged} icon={<Database className="h-4 w-4 text-slate-400" />} />
        </div>
        <div className="mt-5 divide-y divide-slate-200">
          {previewGroups.map(({ group, items }) => (
            <section key={group} className="py-4 first:pt-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{group}</h3>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button type="button" onClick={() => toggleImportGroup(items, true)} className="text-[#004A98] hover:text-[#003A78]">Chọn tất cả</button>
                  <button type="button" onClick={() => toggleImportGroup(items, false)} className="text-slate-600 hover:text-slate-900">Bỏ chọn</button>
                </div>
              </div>
              {items.map((item) => (
                <label key={item.key} className={`flex cursor-pointer items-center gap-3 px-1 py-2.5 ${item.status === 'unchanged' ? 'cursor-default opacity-55' : ''}`}>
                  <input type="checkbox" checked={preview?.selectedKeys.includes(item.key) ?? false} disabled={item.status === 'unchanged'} onChange={(event) => toggleItem(item.key, event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#004A98] focus:ring-[#004A98]" />
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{item.label}</span>
                  <span className={`shrink-0 text-xs font-semibold ${item.status === 'add' ? 'text-emerald-700' : item.status === 'update' ? 'text-blue-700' : 'text-slate-500'}`}>{item.status === 'add' ? 'Thêm mới' : item.status === 'update' ? 'Cập nhật' : 'Đã trùng'}</span>
                </label>
              ))}
            </section>
          ))}
        </div>
      </AppDialog>

      <AppDialog
        open={Boolean(exportPreview)}
        onOpenChange={(open) => { if (!open) setExportPreview(null); }}
        title="Chọn dữ liệu để xuất"
        description="Chọn cả nhóm dữ liệu cần đưa vào tệp sao lưu. Dữ liệu đã mã hóa sẽ kèm thông tin xác thực cần thiết."
        icon={Download}
        size="lg"
        footer={(
          <>
            <button type="button" onClick={() => setExportPreview(null)} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Hủy</button>
            <button type="button" disabled={!exportPreview?.selectedKeys.length} onClick={confirmExport} className="h-9 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white transition hover:bg-[#003A78] disabled:cursor-not-allowed disabled:opacity-45">Xuất {exportPreview?.selectedKeys.length ?? 0} mục</button>
          </>
        )}
      >
        <div className="mb-4 max-h-[90vh] flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <p className="text-sm text-slate-600">Đã chọn {exportPreview?.selectedKeys.length ?? 0} mục</p>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <button type="button" onClick={() => setExportPreview((current) => current ? { ...current, selectedKeys: current.groups.flatMap((group) => group.items.map((item) => item.key)) } : current)} className="text-[#004A98] hover:text-[#003A78]">Chọn tất cả</button>
            <button type="button" onClick={() => setExportPreview((current) => current ? { ...current, selectedKeys: [] } : current)} className="text-slate-600 hover:text-slate-900">Bỏ chọn tất cả</button>
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {exportPreview?.groups.map((group) => (
            <section key={group.name} className="py-3">
              <div className="flex items-center justify-between gap-3 pb-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{group.name}</h3>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button type="button" onClick={() => toggleExportGroup(group.items, true)} className="text-[#004A98] hover:text-[#003A78]">Chọn tất cả</button>
                  <button type="button" onClick={() => toggleExportGroup(group.items, false)} className="text-slate-600 hover:text-slate-900">Bỏ chọn</button>
                </div>
              </div>
              {group.items.map((item) => (
                <label key={item.key} className="flex cursor-pointer items-center gap-3 px-1 py-2.5">
                  <input type="checkbox" checked={exportPreview.selectedKeys.includes(item.key)} onChange={(event) => toggleExportItem(item.key, event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#004A98] focus:ring-[#004A98]" />
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{item.label}</span>
                </label>
              ))}
            </section>
          ))}
        </div>
      </AppDialog>

      {pendingImport && (
        <SecurityLock
          setupMode={false}
          customTitle="Xác thực tệp sao lưu"
          customSubtitle="Nhập mật khẩu đã tạo khi xuất tệp để áp dụng các mục đã chọn."
          customVerify={async (pin) => {
            const isValid = await verifyBackupPin(pin, pendingImport.data.__pbkdf2_salt__, pendingImport.data.__pin_verify__);
            if (!isValid) return false;

            if (hasSecureData() && cryptoKey) {
              await importBackupWithCurrentKey(pendingImport.data, pin, cryptoKey, pendingImport.selectedKeys);
            } else if (hasSecureData() && !cryptoKey) {
              return false;
            } else {
              localStorage.setItem('__pbkdf2_salt__', pendingImport.data.__pbkdf2_salt__);
              localStorage.setItem('__pin_verify__', pendingImport.data.__pin_verify__);
              pendingImport.selectedKeys.forEach((key) => localStorage.setItem(key, pendingImport.data[key]));
            }
            return true;
          }}
          onUnlock={() => {
            setPendingImport(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function PreviewStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="flex flex-col items-center gap-1 px-3 py-3"><span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">{icon}{label}</span><strong className="text-lg tabular-nums text-slate-900">{value}</strong></div>;
}
