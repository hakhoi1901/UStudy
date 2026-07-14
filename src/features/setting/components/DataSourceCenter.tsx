import {
  BookOpenCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
  FileClock,
  GraduationCap,
  History,
  Pencil,
  ReceiptText,
  RefreshCw,
  Undo2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AppDialog } from '../../../components/ui/app-dialog';
import { APP_CONFIG } from '../../../config';
import { CACHE_POPULATED_EVENT } from '../../../context/CryptoContext';
import { useCrypto } from '../../../context/CryptoContext';
import { useAppNotification } from '../../../context/NotificationContext';
import {
  getImportHistory,
  getImportRollbackSnapshot,
  IMPORT_ROLLBACK_EVENT,
  readFromStorage,
  renameImportHistoryEntry,
  restoreLastImportRollback,
  type ImportHistoryEntry,
} from '../../../helpers/localStorage/save';
import type { PortalDataSource } from '../../../logic/import-metadata';
import { restoreImportSources } from '../../../logic/import-rollback';

interface SourceView {
  id: PortalDataSource;
  label: string;
  description: string;
  period: string;
  count: number;
  unit: string;
  updatedAt: string | null;
  icon: typeof Database;
}

const SOURCE_LABELS: Record<string, string> = {
  grades: 'Bảng điểm',
  registrations: 'Đăng ký học phần',
  exams: 'Lịch thi',
  courses: 'Danh sách lớp mở',
  tuition: 'Học phí',
  all: 'Toàn bộ dữ liệu',
};

function formatPeriodValue(value: unknown): string {
  const text = String(value || '').trim();
  if (!text) return '';

  const yearThenSemester = text.match(/(\d{2,4}\s*-\s*\d{2,4})\s*\/\s*(?:HK\s*)?([1-3])\b/i);
  if (yearThenSemester) return `HK${yearThenSemester[2]} ${yearThenSemester[1].replace(/\s/g, '')}`;

  const semesterThenYear = text.match(/(?:học\s*kỳ|hoc\s*ky|HK)\s*([1-3])\s*[,/-]?\s*(\d{2,4}\s*-\s*\d{2,4})/i);
  if (semesterThenYear) return `HK${semesterThenYear[1]} ${semesterThenYear[2].replace(/\s/g, '')}`;

  return text;
}

function formatPeriod(param: any): string {
  if (param?.sem && param?.year) return `HK${param.sem} ${param.year}`;
  if (param?.semester) return formatPeriodValue(param.semester);
  return 'Chưa xác định học kỳ';
}

function formatRelativeTime(value: string | null): string {
  if (!value) return 'Chưa cập nhật';
  const elapsed = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return new Date(value).toLocaleString('vi-VN');
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function getFreshness(source: SourceView) {
  if (source.count === 0 || !source.updatedAt) {
    return { label: 'Chưa có', className: 'bg-slate-100 text-slate-600', needsAttention: false };
  }
  const ageDays = (Date.now() - new Date(source.updatedAt).getTime()) / 86_400_000;
  const isFastChanging = source.id === 'registrations' || source.id === 'exams' || source.id === 'courses';
  const currentThreshold = isFastChanging ? 3 : 7;
  const staleThreshold = isFastChanging ? 14 : 30;
  if (ageDays <= currentThreshold) {
    return { label: 'Đã cập nhật', className: 'bg-[#004A98] text-white', needsAttention: false };
  }
  if (ageDays <= staleThreshold) {
    return { label: 'Có thể đã cũ', className: 'bg-[#004A98] text-white', needsAttention: true };
  }
  return { label: 'Nên cập nhật lại', className: 'bg-[#004A98] text-white', needsAttention: true };
}

function countExams(exams: any): number {
  if (!exams || typeof exams !== 'object') return 0;
  if (Array.isArray(exams)) return exams.length;
  return Object.values(exams).reduce<number>((total, value: any) => {
    if (Array.isArray(value)) return total + value.length;
    if (value && typeof value === 'object') return total + countExams(value);
    return total;
  }, 0);
}

function countTuitionRows(tuition: any): number {
  if (!tuition || typeof tuition !== 'object') return 0;
  if (Array.isArray(tuition?.details)) return tuition.details.length;
  return Object.values(tuition).reduce<number>((total, value: any) => total + (Array.isArray(value?.details) ? value.details.length : 0), 0);
}

function getHistorySources(entry: ImportHistoryEntry): string {
  if (entry.details.length === 0) return 'Toàn bộ dữ liệu';
  const labels = Array.from(new Set(entry.details.map((detail) => SOURCE_LABELS[detail.source] || detail.source)));
  return labels.join(', ');
}

function getHistoryTitle(entry: ImportHistoryEntry): string {
  return entry.displayName?.trim() || entry.source;
}

function getHistoryContext(entry: ImportHistoryEntry): string {
  const sources = getHistorySources(entry);
  return entry.displayName ? `${entry.source} · ${sources}` : sources;
}

function HistoryList({
  entries,
  canUndo,
  canPartiallyUndo,
  onUndo,
  onPartialUndo,
  onRename,
}: {
  entries: ImportHistoryEntry[];
  canUndo: boolean;
  canPartiallyUndo: boolean;
  onUndo: () => void;
  onPartialUndo: () => void;
  onRename: (entry: ImportHistoryEntry) => void;
}) {
  if (entries.length === 0) {
    return <p className="py-5 text-sm text-slate-500">Chưa có lần cập nhật dữ liệu nào.</p>;
  }

  return (
    <div className="divide-y divide-slate-200">
      {entries.map((entry, index) => (
        <div key={entry.id} className="py-3 first:pt-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-semibold text-slate-900">{getHistoryTitle(entry)}</p>
                {index === 0 && <span className="text-[11px] font-semibold uppercase text-emerald-700">Mới nhất</span>}
                <button type="button" title="Đổi tên" onClick={() => onRename(entry)} className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-[#004A98]"><Pencil className="h-3.5 w-3.5" /></button>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">{getHistoryContext(entry)}</p>
            </div>
            <time title={new Date(entry.createdAt).toLocaleString('vi-VN')} className="shrink-0 text-xs text-slate-500">{formatRelativeTime(entry.createdAt)}</time>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-600">
              {entry.summary.added} thêm mới · {entry.summary.updated} cập nhật · {entry.summary.unchanged} bỏ qua
            </p>
            {index === 0 && canUndo && (
              <div className="flex flex-wrap items-center gap-1">
                {canPartiallyUndo && (
                  <button type="button" onClick={onPartialUndo} className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-[#004A98] transition hover:bg-blue-50">
                    <RefreshCw className="h-3.5 w-3.5" />Hoàn tác một phần
                  </button>
                )}
                <button type="button" onClick={onUndo} className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                  <Undo2 className="h-3.5 w-3.5" />Hoàn tác toàn bộ
                </button>
              </div>
            )}
          </div>
          {index === 0 && entry.restoredSources && entry.restoredSources.length > 0 && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" />Đã hoàn tác: {entry.restoredSources.map((source) => SOURCE_LABELS[source] || source).join(', ')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function InlineHistoryList({ entries, onRename }: { entries: ImportHistoryEntry[]; onRename: (entry: ImportHistoryEntry) => void }) {
  if (entries.length === 0) {
    return <p className="border-y border-slate-200 py-5 text-sm text-slate-500">Chưa có lần cập nhật dữ liệu nào.</p>;
  }

  return (
    <div className="divide-y divide-gray-100 border-y border-gray-100">
      {entries.map((entry, index) => (
        <div key={entry.id} className={`grid gap-2 px-3 py-3.5 sm:grid-cols-[minmax(180px,0.7fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-5 ${index === 0 ? 'bg-[#004A98]/[0.03]' : 'hover:bg-gray-50/60'}`}>
          <div className="flex min-w-0 items-center gap-3">
            <span className={`h-2 w-2 shrink-0 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">{getHistoryTitle(entry)}</p>
                {index === 0 && <span className="shrink-0 text-[11px] font-semibold text-emerald-700">Mới nhất</span>}
                <button type="button" title="Đổi tên bản sao lưu" onClick={() => onRename(entry)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-blue-50 hover:text-[#004A98]"><Pencil className="h-3.5 w-3.5" /></button>
              </div>
              <time title={new Date(entry.createdAt).toLocaleString('vi-VN')} className="mt-0.5 block text-xs text-slate-500">{formatRelativeTime(entry.createdAt)}</time>
            </div>
          </div>
          <p className="truncate pl-5 text-xs text-slate-500 sm:pl-0">{getHistoryContext(entry)}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-5 text-xs sm:justify-end sm:pl-0">
            <span className="font-medium text-emerald-700">{entry.summary.added} thêm</span>
            <span className="font-medium text-blue-700">{entry.summary.updated} cập nhật</span>
            <span className="text-slate-500">{entry.summary.unchanged} bỏ qua</span>
          </div>
          {entry.restoredSources && entry.restoredSources.length > 0 && (
            <p className="col-span-full flex items-center gap-1.5 pl-5 text-xs font-medium text-emerald-700 sm:pl-5">
              <Check className="h-3.5 w-3.5" />Đã hoàn tác: {entry.restoredSources.map((source) => SOURCE_LABELS[source] || source).join(', ')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function DataSourceCenter() {
  const [stamp, setStamp] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourceView | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPartialUndoOpen, setIsPartialUndoOpen] = useState(false);
  const [selectedUndoSources, setSelectedUndoSources] = useState<PortalDataSource[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isUndoConfirmOpen, setIsUndoConfirmOpen] = useState(false);
  const [renamingEntry, setRenamingEntry] = useState<ImportHistoryEntry | null>(null);
  const [historyNameInput, setHistoryNameInput] = useState('');
  const { cryptoKey } = useCrypto();
  const { addNotification } = useAppNotification();

  useEffect(() => {
    const refresh = () => setStamp((value) => value + 1);
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === CACHE_POPULATED_EVENT) refresh();
    };
    window.addEventListener('message', handleMessage);
    window.addEventListener(IMPORT_ROLLBACK_EVENT, refresh);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener(IMPORT_ROLLBACK_EVENT, refresh);
    };
  }, []);

  const { sources, history, rollbackSnapshot } = useMemo(() => {
    const raw = readFromStorage<any>('raw_student_db', {}) || {};
    const meta = readFromStorage<any>('import_meta', {}) || {};
    const params = meta.params || {};
    const sourceUpdatedAt = meta.sourceUpdatedAt || {};
    const hasSourceTimestamps = Boolean(meta.sourceUpdatedAt && typeof meta.sourceUpdatedAt === 'object');
    const fallbackUpdatedAt = meta.scrapedAt || null;
    const gradePeriods = Array.from(new Set((raw.grades || []).map((grade: any) => String(grade.semester || '').trim()).filter(Boolean)));

    const updatedAt = (source: PortalDataSource, wasRequested = true) => sourceUpdatedAt[source] || (!hasSourceTimestamps && wasRequested ? fallbackUpdatedAt : null);
    const result: SourceView[] = [
      { id: 'grades', label: 'Bảng điểm', description: 'Điểm và tín chỉ đã có kết quả', period: formatPeriodValue(gradePeriods.at(-1)) || 'Chưa xác định học kỳ', count: raw.grades?.length || 0, unit: 'dòng điểm', updatedAt: updatedAt('grades'), icon: GraduationCap },
      { id: 'registrations', label: 'Đăng ký học phần', description: 'Các môn đã đăng ký ở kỳ hiện tại', period: formatPeriod(params.registration), count: raw.registrations?.length || 0, unit: 'môn đăng ký', updatedAt: updatedAt('registrations', Boolean(params.registration)), icon: BookOpenCheck },
      { id: 'exams', label: 'Lịch thi', description: 'Lịch giữa kỳ và cuối kỳ', period: formatPeriod(params.exam), count: countExams(raw.exams), unit: 'lịch thi', updatedAt: updatedAt('exams', Boolean(params.exam)), icon: FileClock },
      { id: 'courses', label: 'Danh sách lớp mở', description: 'Lớp học phần dùng để xếp lịch', period: formatPeriod(params.class), count: raw.courses?.length || 0, unit: 'lớp mở', updatedAt: updatedAt('courses', Boolean(params.class)), icon: Database },
      { id: 'tuition', label: 'Học phí', description: 'Chi tiết học phí theo học kỳ', period: formatPeriod(params.tuition), count: countTuitionRows(raw.tuition), unit: 'khoản học phí', updatedAt: updatedAt('tuition', Boolean(params.tuition)), icon: ReceiptText },
    ];

    return { sources: result, history: getImportHistory(), rollbackSnapshot: getImportRollbackSnapshot() };
  }, [stamp]);

  const canUndo = Boolean(rollbackSnapshot);
  const latestHistory = history[0];
  const restoredSources = new Set(rollbackSnapshot?.restoredSources || latestHistory?.restoredSources || []);
  const recordedSourceDetails = rollbackSnapshot?.details?.length
    ? rollbackSnapshot.details
    : latestHistory?.details || [];
  const recordedSources = recordedSourceDetails
    .map((detail) => detail.source)
    .filter((source): source is PortalDataSource => source in SOURCE_LABELS && source !== 'all')
    .filter((source, index, list) => list.indexOf(source) === index);
  const candidateSources = recordedSources.length > 0 ? recordedSources : sources.map((source) => source.id);
  const restorableSources = candidateSources.filter((source) => !restoredSources.has(source));
  const canPartiallyUndo = canUndo && restorableSources.length > 0;

  const sourceHistory = useMemo(() => {
    if (!selectedSource) return [];
    return history.filter((entry) => entry.details.length === 0 || entry.details.some((detail) => detail.source === selectedSource.id || detail.source === 'all')).slice(0, 5);
  }, [history, selectedSource]);

  const availableCount = sources.filter((source) => source.count > 0).length;
  const attentionCount = sources.filter((source) => getFreshness(source).needsAttention).length;
  const latestUpdatedAt = sources.reduce<string | null>((latest, source) => {
    if (!source.updatedAt) return latest;
    if (!latest || new Date(source.updatedAt).getTime() > new Date(latest).getTime()) return source.updatedAt;
    return latest;
  }, null);

  const openUndoConfirmation = () => {
    setIsHistoryOpen(false);
    setSelectedSource(null);
    setIsUndoConfirmOpen(true);
  };

  const openPartialUndo = (initialSources: PortalDataSource[] = []) => {
    setIsHistoryOpen(false);
    setSelectedSource(null);
    setSelectedUndoSources(initialSources.filter((source) => restorableSources.includes(source)));
    setIsPartialUndoOpen(true);
  };

  const confirmPartialUndo = async () => {
    if (!cryptoKey || selectedUndoSources.length === 0) return;
    setIsRestoring(true);
    try {
      await restoreImportSources(selectedUndoSources, cryptoKey);
      addNotification({
        title: 'Đã hoàn tác một phần',
        message: `Đã khôi phục ${selectedUndoSources.map((source) => SOURCE_LABELS[source]).join(', ')} về trước lần import gần nhất.`,
        type: 'success',
      });
      setIsPartialUndoOpen(false);
      setSelectedUndoSources([]);
      setStamp((value) => value + 1);
    } catch (error) {
      console.error('[restoreImportSources]', error);
      addNotification({ title: 'Không thể hoàn tác', message: 'Snapshot không thể được giải mã hoặc khôi phục.', type: 'error' });
    } finally {
      setIsRestoring(false);
    }
  };

  const openHistoryRename = (entry: ImportHistoryEntry) => {
    setHistoryNameInput(entry.displayName || entry.source);
    setRenamingEntry(entry);
  };

  const confirmHistoryRename = () => {
    if (!renamingEntry || !historyNameInput.trim()) return;
    if (renameImportHistoryEntry(renamingEntry.id, historyNameInput)) {
      setRenamingEntry(null);
      setHistoryNameInput('');
      setStamp((value) => value + 1);
      addNotification({ title: 'Đã đổi tên bản sao lưu', message: `Tên mới: ${historyNameInput.trim()}`, type: 'success' });
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls="data-source-center-content"
        onClick={() => setIsExpanded((value) => !value)}
        className="group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-gray-50/60 md:px-6"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004A98]/10 text-[#004A98] transition group-hover:bg-[#004A98]/15">
          <Database className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">Trung tâm dữ liệu</h3>
          <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">Kiểm tra nguồn, độ mới và lịch sử nhập dữ liệu.</p>
        </div>
        <div className="hidden items-center gap-5 md:flex">
          <div className="text-right"><p className="text-sm font-semibold text-slate-800">{availableCount}/{sources.length} nguồn</p><p className="text-xs text-slate-500">đã có dữ liệu</p></div>
          <div className="text-right"><p className="text-sm font-semibold text-slate-800">{latestUpdatedAt ? formatRelativeTime(latestUpdatedAt) : 'Chưa có'}</p><p className="text-xs text-slate-500">cập nhật gần nhất</p></div>
          {attentionCount > 0 && <div className="border-l border-slate-200 pl-5 text-right"><p className="text-sm font-semibold text-amber-700">{attentionCount} nguồn</p><p className="text-xs text-slate-500">cần chú ý</p></div>}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition group-hover:bg-slate-100">
          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div id="data-source-center-content" className="border-t border-gray-100 px-4 pb-5 md:px-6 md:pb-6">
          <section className="min-w-0">
            <div className="mb-3 flex items-end justify-between gap-3 pt-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Nguồn dữ liệu</h4>
                <p className="mt-0.5 text-xs text-slate-500">Nhấn vào từng dòng để xem dữ liệu và lịch sử riêng.</p>
              </div>
              <span className="shrink-0 text-xs text-slate-500">{availableCount} sẵn sàng · {sources.length - availableCount} chưa có</span>
            </div>

            <div className="hidden grid-cols-[minmax(220px,1fr)_150px_150px_140px_20px] gap-4 rounded-t-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 sm:grid">
              <span>Nguồn</span><span>Học kỳ</span><span>Cập nhật</span><span className="text-right">Trạng thái</span><span />
            </div>
            <div className="divide-y divide-gray-100 border-y border-gray-200 sm:rounded-b-lg sm:border-x">
              {sources.map((source) => {
                const freshness = getFreshness(source);
                const Icon = source.icon;
                return (
                  <button key={source.id} type="button" onClick={() => setSelectedSource(source)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-1 py-3.5 text-left transition hover:bg-gray-50/70 sm:grid-cols-[minmax(220px,1fr)_150px_150px_140px_20px] sm:gap-4 sm:px-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#004A98]"><Icon className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{source.label}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500 sm:hidden">{source.period} · {formatRelativeTime(source.updatedAt)}</p>
                      </div>
                    </div>
                    <div className="hidden truncate text-xs font-medium text-slate-700 sm:block">{source.period}</div>
                    <div className="hidden text-xs text-slate-600 sm:block"><Clock3 className="mr-1.5 inline h-3.5 w-3.5" />{formatRelativeTime(source.updatedAt)}</div>
                    <span className={`justify-self-end rounded-full px-2 py-1 text-xs ${freshness.className}`}>{freshness.label}</span>
                    <ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-6 min-w-0 border-t border-gray-100 pt-5">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004A98]/10 text-[#004A98]"><History className="h-4 w-4" /></div>
                  <div><h4 className="text-sm font-semibold text-gray-900">Lịch sử cập nhật chung</h4><p className="mt-0.5 text-xs text-gray-500">Mỗi dòng là một lần import hoàn chỉnh.</p></div>
                </div>
              </div>
              {canUndo && (
                <div className="flex flex-wrap items-center gap-2">
                {canPartiallyUndo && (
                  <button type="button" onClick={() => openPartialUndo()} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#004A98] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#003A78]">
                    <RefreshCw className="h-3.5 w-3.5" />Hoàn tác một phần
                  </button>
                )}
                <button type="button" onClick={openUndoConfirmation} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-red-600">
                  <Undo2 className="h-3.5 w-3.5" />Hoàn tác toàn bộ
                </button>
                </div>
              )}
            </div>
            <InlineHistoryList entries={history.slice(0, 3)} onRename={openHistoryRename} />
            {history.length > 3 && (
              <button type="button" onClick={() => setIsHistoryOpen(true)} className="mt-2 flex h-8 items-center gap-1.5 text-xs font-semibold text-[#004A98] transition hover:text-[#003A78]">
                Xem toàn bộ {history.length} lần cập nhật<ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </section>
        </div>
      )}

      <AppDialog
        open={Boolean(selectedSource)}
        onOpenChange={(open) => { if (!open) setSelectedSource(null); }}
        title={selectedSource?.label || 'Chi tiết dữ liệu'}
        description={selectedSource?.description}
        icon={selectedSource?.icon}
        size="md"
        footer={(
          <>
            {selectedSource && restorableSources.includes(selectedSource.id) && (
              <button type="button" onClick={() => openPartialUndo([selectedSource.id])} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Undo2 className="h-4 w-4" />Hoàn tác nguồn này</button>
            )}
            <a href={APP_CONFIG.PORTAL_LOGIN_URL} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#004A98] bg-white px-4 text-sm font-semibold text-[#004A98] transition hover:bg-blue-50"><RefreshCw className="h-4 w-4" />Mở Portal để cập nhật</a>
            <button type="button" onClick={() => setSelectedSource(null)} className="h-9 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white transition hover:bg-[#003A78]">Đóng</button>
          </>
        )}
      >
        {selectedSource && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-xs text-slate-500">Học kỳ</dt><dd className="mt-1 font-semibold text-slate-900">{selectedSource.period}</dd></div>
              <div><dt className="text-xs text-slate-500">Số bản ghi</dt><dd className="mt-1 font-semibold text-slate-900">{selectedSource.count} {selectedSource.unit}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-slate-500">Cập nhật gần nhất</dt><dd className="mt-1 font-semibold text-slate-900">{selectedSource.updatedAt ? new Date(selectedSource.updatedAt).toLocaleString('vi-VN') : 'Chưa cập nhật'}</dd></div>
            </dl>

            <section className="border-t border-slate-200 pt-4">
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Lịch sử của nguồn này</h4>
              {sourceHistory.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {sourceHistory.map((entry) => {
                    const detail = entry.details.find((item) => item.source === selectedSource.id);
                    const summary = detail || entry.summary;
                    const wasRestored = entry.restoredSources?.includes(selectedSource.id);
                    return (
                      <div key={entry.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                        <div><p className="font-medium text-slate-800">{entry.source}</p><p className="mt-0.5 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString('vi-VN')}</p>{wasRestored && <p className="mt-1 text-xs font-semibold text-emerald-700">Đã hoàn tác nguồn này</p>}</div>
                        <p className="shrink-0 text-xs text-slate-600">+{summary.added} mới · {summary.updated} cập nhật · {summary.unchanged} bỏ qua</p>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-sm text-slate-500">Chưa có lịch sử thay đổi cho nguồn này.</p>}
            </section>
          </div>
        )}
      </AppDialog>

      <AppDialog
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        title="Lịch sử cập nhật chung"
        description="Toàn bộ các lần nhập dữ liệu đã được ghi nhận trên thiết bị này."
        icon={History}
        size="md"
        footer={<button type="button" onClick={() => setIsHistoryOpen(false)} className="h-9 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white transition hover:bg-[#003A78]">Đóng</button>}
      >
        <HistoryList
          entries={history}
          canUndo={canUndo}
          canPartiallyUndo={canPartiallyUndo}
          onUndo={openUndoConfirmation}
          onPartialUndo={() => openPartialUndo()}
          onRename={openHistoryRename}
        />
      </AppDialog>

      <AppDialog
        open={Boolean(renamingEntry)}
        onOpenChange={(open) => { if (!open) setRenamingEntry(null); }}
        title="Đổi tên bản sao lưu"
        description="Đặt một tên dễ nhận biết để phân biệt các lần nhập dữ liệu trong lịch sử."
        icon={Pencil}
        size="sm"
        footer={(
          <>
            <button type="button" onClick={() => setRenamingEntry(null)} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50">Hủy</button>
            <button type="button" disabled={!historyNameInput.trim()} onClick={confirmHistoryRename} className="h-9 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white transition hover:bg-[#003A78] disabled:cursor-not-allowed disabled:opacity-45">Lưu tên</button>
          </>
        )}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-gray-800">Tên hiển thị</span>
          <input
            autoFocus
            value={historyNameInput}
            maxLength={80}
            onChange={(event) => setHistoryNameInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') confirmHistoryRename(); }}
            placeholder="Ví dụ: Trước khi đăng ký HK2"
            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition focus:border-[#004A98] focus:bg-white focus:ring-2 focus:ring-[#004A98]/15"
          />
          <span className="mt-2 block text-xs text-gray-500">Nguồn gốc: {renamingEntry?.source}</span>
        </label>
      </AppDialog>

      <AppDialog
        open={isPartialUndoOpen}
        onOpenChange={(open) => { if (!isRestoring) setIsPartialUndoOpen(open); }}
        title="Hoàn tác một phần"
        description="Chọn các nguồn cần đưa về trạng thái trước lần import gần nhất. Những nguồn khác được giữ nguyên."
        icon={Undo2}
        size="md"
        footer={(
          <>
            <button type="button" disabled={isRestoring} onClick={() => setIsPartialUndoOpen(false)} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
            <button type="button" disabled={selectedUndoSources.length === 0 || isRestoring || !cryptoKey} onClick={confirmPartialUndo} className="h-9 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white transition hover:bg-[#003A78] disabled:cursor-not-allowed disabled:opacity-45">
              {isRestoring ? 'Đang khôi phục...' : `Hoàn tác ${selectedUndoSources.length} nguồn`}
            </button>
          </>
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <p className="text-sm text-slate-600">Đã chọn {selectedUndoSources.length}/{restorableSources.length} nguồn</p>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <button type="button" onClick={() => setSelectedUndoSources(restorableSources)} className="text-[#004A98] hover:text-[#003A78]">Chọn tất cả</button>
            <button type="button" onClick={() => setSelectedUndoSources([])} className="text-slate-600 hover:text-slate-900">Bỏ chọn</button>
          </div>
        </div>
        <div className="divide-y divide-slate-200 border-b border-slate-200">
          {restorableSources.map((sourceId) => {
            const source = sources.find((item) => item.id === sourceId);
            if (!source) return null;
            const Icon = source.icon;
            const checked = selectedUndoSources.includes(sourceId);
            return (
              <label key={sourceId} className="flex cursor-pointer items-center gap-3 px-1 py-3 transition hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => setSelectedUndoSources((current) => event.target.checked ? [...current, sourceId] : current.filter((item) => item !== sourceId))}
                  className="h-4 w-4 rounded border-slate-300 text-[#004A98] focus:ring-[#004A98]"
                />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98]"><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{source.label}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">Khôi phục dữ liệu và học kỳ của riêng nguồn này</p>
                </div>
              </label>
            );
          })}
        </div>
        {!cryptoKey && <p className="mt-3 text-xs font-medium text-amber-700">Cần mở khóa dữ liệu trước khi hoàn tác từng phần.</p>}
        <p className="mt-3 text-xs leading-5 text-slate-500">Các thay đổi bạn tạo sau lần import trong những nguồn được chọn cũng sẽ bị thay bằng dữ liệu từ snapshot.</p>
      </AppDialog>

      <AppDialog
        open={isUndoConfirmOpen}
        onOpenChange={setIsUndoConfirmOpen}
        title="Hoàn tác toàn bộ lần nhập gần nhất"
        description="Khôi phục toàn bộ localStorage về đúng trạng thái trước lần import gần nhất."
        icon={Undo2}
        size="sm"
        footer={(
          <>
            <button type="button" onClick={() => setIsUndoConfirmOpen(false)} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="button" onClick={() => { if (restoreLastImportRollback()) window.location.reload(); }} className="h-9 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">Hoàn tác toàn bộ</button>
          </>
        )}
      >
        <p className="text-sm leading-6 text-slate-600">Mọi thay đổi thuộc cùng lần import, ở tất cả nguồn dữ liệu, sẽ được hoàn tác cùng nhau. Thao tác này chỉ áp dụng cho lần nhập gần nhất.</p>
      </AppDialog>
    </section>
  );
}
