import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Braces,
    ChevronDown,
    ChevronRight,
    CircleAlert,
    FileJson2,
    FolderPlus,
    HardDrive,
    LockKeyhole,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Trash2,
} from 'lucide-react';
import { useCrypto } from '../../../context/CryptoContext';
import { readSecure, saveSecure, SECURE_DATA_KEYS } from '../../../helpers/localStorage/save';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonPath = Array<string | number>;

type StorageEntry = {
    key: string;
    raw: string;
    value: JsonValue | null;
    isJson: boolean;
    isSecure: boolean;
    isDecrypted: boolean;
};

const SECURE_KEY_SET = new Set<string>(SECURE_DATA_KEYS);
const UNDECRYPTABLE = Symbol('undecryptable');

function readStorageEntries(): StorageEntry[] {
    return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
        .filter((key): key is string => key !== null)
        .sort((left, right) => left.localeCompare(right))
        .map((key) => {
            const raw = localStorage.getItem(key) ?? '';
            try {
                return { key, raw, value: JSON.parse(raw) as JsonValue, isJson: true, isSecure: SECURE_KEY_SET.has(key), isDecrypted: false };
            } catch {
                return { key, raw, value: null, isJson: false, isSecure: SECURE_KEY_SET.has(key), isDecrypted: false };
            }
        });
}

function getJsonAtPath(value: JsonValue, path: JsonPath): JsonValue {
    return path.reduce<JsonValue>((current, segment) => {
        if (Array.isArray(current) && typeof segment === 'number') return current[segment];
        if (current && typeof current === 'object' && !Array.isArray(current) && typeof segment === 'string') return current[segment];
        return null;
    }, value);
}

function updateJsonAtPath(value: JsonValue, path: JsonPath, nextValue: JsonValue): JsonValue {
    if (path.length === 0) return nextValue;

    const [segment, ...rest] = path;
    if (Array.isArray(value) && typeof segment === 'number') {
        return value.map((item, index) => index === segment ? updateJsonAtPath(item, rest, nextValue) : item);
    }
    if (value && typeof value === 'object' && !Array.isArray(value) && typeof segment === 'string') {
        return { ...value, [segment]: updateJsonAtPath(value[segment], rest, nextValue) };
    }
    return value;
}

function removeJsonAtPath(value: JsonValue, path: JsonPath): JsonValue {
    if (path.length === 0) return value;

    const [segment, ...rest] = path;
    if (Array.isArray(value) && typeof segment === 'number') {
        if (rest.length === 0) return value.filter((_, index) => index !== segment);
        return value.map((item, index) => index === segment ? removeJsonAtPath(item, rest) : item);
    }
    if (value && typeof value === 'object' && !Array.isArray(value) && typeof segment === 'string') {
        if (rest.length === 0) {
            const { [segment]: _, ...remaining } = value;
            return remaining;
        }
        return { ...value, [segment]: removeJsonAtPath(value[segment], rest) };
    }
    return value;
}

function addJsonChild(value: JsonValue, path: JsonPath, key: string, child: JsonValue): JsonValue {
    const parent = getJsonAtPath(value, path);
    if (Array.isArray(parent)) return updateJsonAtPath(value, path, [...parent, child]);
    if (parent && typeof parent === 'object') return updateJsonAtPath(value, path, { ...parent, [key]: child });
    return value;
}

function isContainer(value: JsonValue) {
    return Array.isArray(value) || (value !== null && typeof value === 'object');
}

function getValueLabel(value: JsonValue) {
    if (Array.isArray(value)) return `[${value.length}]`;
    if (value !== null && typeof value === 'object') return `{${Object.keys(value).length}}`;
    if (typeof value === 'string') return JSON.stringify(value.length > 72 ? `${value.slice(0, 72)}...` : value);
    return String(value);
}

function pathsEqual(left: JsonPath, right: JsonPath) {
    return left.length === right.length && left.every((item, index) => item === right[index]);
}

function JsonTreeNode({
    label,
    value,
    path,
    depth,
    selectedPath,
    onSelect,
}: {
    label: string;
    value: JsonValue;
    path: JsonPath;
    depth: number;
    selectedPath: JsonPath;
    onSelect: (path: JsonPath, value: JsonValue) => void;
}) {
    const [isOpen, setIsOpen] = useState(depth < 1);
    const container = isContainer(value);
    const selected = pathsEqual(path, selectedPath);
    const children = Array.isArray(value)
        ? value.map((item, index) => [String(index), item] as const)
        : value && typeof value === 'object'
            ? Object.entries(value)
            : [];

    return (
        <div>
            <div className={`group flex min-w-0 items-center gap-1 rounded-md pr-2 ${selected ? 'bg-blue-50 text-[#004A98]' : 'hover:bg-gray-50'}`} style={{ paddingLeft: `${Math.min(depth * 16 + 6, 70)}px` }}>
                {container ? (
                    <button type="button" onClick={() => setIsOpen((open) => !open)} className="flex h-7 w-6 shrink-0 items-center justify-center text-gray-400 hover:text-[#004A98]" aria-label={isOpen ? 'Thu gọn nhánh' : 'Mở nhánh'}>
                        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                ) : <span className="w-6 shrink-0" />}
                <button type="button" onClick={() => onSelect(path, value)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left">
                    <span className="truncate font-mono text-xs font-semibold text-gray-700">{label}</span>
                    <span className={`truncate font-mono text-xs ${container ? 'text-gray-400' : 'text-gray-500'}`}>{getValueLabel(value)}</span>
                </button>
            </div>
            {container && isOpen && children.map(([childLabel, childValue]) => <JsonTreeNode key={`${path.join('.')}-${childLabel}`} label={childLabel} value={childValue} path={[...path, Array.isArray(value) ? Number(childLabel) : childLabel]} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} />)}
        </div>
    );
}

export function WorkspaceStorageFeature() {
    const { cryptoKey } = useCrypto();
    const [entries, setEntries] = useState<StorageEntry[]>(readStorageEntries);
    const [selectedKey, setSelectedKey] = useState<string | null>(() => entries[0]?.key ?? null);
    const [selectedPath, setSelectedPath] = useState<JsonPath>([]);
    const [editorValue, setEditorValue] = useState('');
    const [rawValue, setRawValue] = useState('');
    const [isAddingKey, setIsAddingKey] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [childKey, setChildKey] = useState('');
    const [childValue, setChildValue] = useState('{}');
    const [error, setError] = useState<string | null>(null);

    const refreshEntries = useCallback(async () => {
        const storedEntries = readStorageEntries();
        const nextEntries = await Promise.all(storedEntries.map(async (entry) => {
            if (!entry.isSecure || entry.isJson || !cryptoKey) return entry;
            const decrypted = await readSecure<unknown | symbol>(entry.key, cryptoKey, UNDECRYPTABLE);
            if (decrypted === UNDECRYPTABLE) return entry;
            return { ...entry, value: decrypted as JsonValue, isJson: true, isDecrypted: true };
        }));
        setEntries(nextEntries);
        setSelectedKey((current) => nextEntries.some((entry) => entry.key === current) ? current : (nextEntries[0]?.key ?? null));
    }, [cryptoKey]);

    useEffect(() => {
        void refreshEntries();
        const onStorage = () => { void refreshEntries(); };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [refreshEntries]);

    const selectedEntry = useMemo(() => entries.find((entry) => entry.key === selectedKey) ?? null, [entries, selectedKey]);
    const selectedValue = selectedEntry?.isJson ? getJsonAtPath(selectedEntry.value, selectedPath) : null;
    const selectedIsContainer = selectedEntry?.isJson && selectedValue !== null && isContainer(selectedValue);

    const selectNode = useCallback((path: JsonPath, value: JsonValue) => {
        setSelectedPath(path);
        setEditorValue(JSON.stringify(value, null, 2));
        setChildKey('');
        setError(null);
    }, []);

    useEffect(() => {
        if (!selectedEntry) {
            setEditorValue('');
            setRawValue('');
            return;
        }
        setSelectedPath([]);
        setRawValue(selectedEntry.raw);
        setEditorValue(selectedEntry.isJson ? JSON.stringify(selectedEntry.value, null, 2) : selectedEntry.raw);
        setError(null);
    }, [selectedEntry?.key, selectedEntry?.raw]);

    const persistJson = async (value: JsonValue) => {
        if (!selectedEntry) return;
        if (selectedEntry.isSecure) {
            if (!cryptoKey) throw new Error('LOCKED_SECURE_DATA');
            await saveSecure(selectedEntry.key, value, cryptoKey);
        } else {
            localStorage.setItem(selectedEntry.key, JSON.stringify(value));
        }
        await refreshEntries();
    };

    const handleSaveNode = async () => {
        if (!selectedEntry?.isJson) return;
        try {
            await persistJson(updateJsonAtPath(selectedEntry.value, selectedPath, JSON.parse(editorValue) as JsonValue));
            setError(null);
        } catch {
            setError(cryptoKey ? 'Giá trị phải là JSON hợp lệ. Chuỗi cần đặt trong dấu ngoặc kép.' : 'Dữ liệu được bảo vệ đang khóa. Mở khóa ứng dụng trước khi sửa.');
        }
    };

    const handleSaveRaw = () => {
        if (!selectedEntry) return;
        if (selectedEntry.isSecure) {
            setError('Dữ liệu được bảo vệ chỉ có thể được sửa sau khi giải mã.');
            return;
        }
        localStorage.setItem(selectedEntry.key, rawValue);
        void refreshEntries();
    };

    const handleDeleteNode = async () => {
        if (!selectedEntry) return;
        if (!selectedEntry.isJson || selectedPath.length === 0) {
            localStorage.removeItem(selectedEntry.key);
            await refreshEntries();
            return;
        }
        await persistJson(removeJsonAtPath(selectedEntry.value, selectedPath));
        setSelectedPath([]);
    };

    const handleAddChild = async () => {
        if (!selectedEntry?.isJson || !selectedIsContainer) return;
        if (!Array.isArray(selectedValue) && !childKey.trim()) {
            setError('Nhập tên thuộc tính trước khi thêm.');
            return;
        }
        try {
            await persistJson(addJsonChild(selectedEntry.value, selectedPath, childKey.trim(), JSON.parse(childValue) as JsonValue));
            setChildKey('');
            setChildValue('{}');
            setError(null);
        } catch {
            setError('Giá trị mục mới phải là JSON hợp lệ.');
        }
    };

    const handleAddKey = () => {
        const key = newKey.trim();
        if (!key) return;
        localStorage.setItem(key, '{}');
        setNewKey('');
        setIsAddingKey(false);
        void refreshEntries();
        setSelectedKey(key);
    };

    return (
        <section className="grid min-h-[580px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[260px_minmax(0,1fr)_minmax(280px,0.75fr)]">
            <aside className="flex min-h-0 flex-col border-b border-gray-200 lg:border-r lg:border-b-0">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-4">
                    <div><h2 className="text-sm font-bold text-gray-900">Storage keys</h2><p className="mt-0.5 text-xs text-gray-500">{entries.length} mục trên thiết bị này</p></div>
                    <button type="button" onClick={() => setIsAddingKey((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004A98] text-white transition hover:bg-[#003A78]" title="Thêm key"><Plus className="h-4 w-4" /></button>
                </div>
                {isAddingKey && <div className="flex gap-2 border-b border-gray-100 p-3"><input value={newKey} onChange={(event) => setNewKey(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleAddKey(); }} placeholder="Tên key" className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#004A98]" /><button type="button" onClick={handleAddKey} className="rounded-lg bg-blue-50 px-2.5 text-xs font-bold text-[#004A98]">Thêm</button></div>}
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                    {entries.map((entry) => <button key={entry.key} type="button" onClick={() => setSelectedKey(entry.key)} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition ${entry.key === selectedEntry?.key ? 'bg-blue-50 text-[#004A98]' : 'text-gray-700 hover:bg-gray-50'}`}><FileJson2 className={`h-4 w-4 shrink-0 ${entry.isJson ? 'text-[#004A98]' : 'text-gray-400'}`} /><span className="min-w-0 flex-1 truncate font-mono text-xs font-semibold">{entry.key}</span>{entry.isSecure && <LockKeyhole className={`h-3.5 w-3.5 shrink-0 ${entry.isJson ? 'text-emerald-600' : 'text-amber-600'}`} title={entry.isJson ? 'Đã giải mã trong RAM' : 'Đang khóa'} />}{!entry.isJson && !entry.isSecure && <span className="text-[10px] text-gray-400">raw</span>}</button>)}
                    {entries.length === 0 && <p className="px-3 py-6 text-center text-xs text-gray-500">Chưa có dữ liệu localStorage.</p>}
                </div>
            </aside>

            <div className="flex min-h-0 flex-col border-b border-gray-200 lg:border-r lg:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5"><div className="min-w-0"><div className="flex items-center gap-2"><HardDrive className="h-4 w-4 text-[#004A98]" /><h2 className="truncate font-mono text-sm font-bold text-gray-900">{selectedEntry?.key ?? 'Chọn một key'}</h2></div><p className="mt-1 text-xs text-gray-500">{selectedEntry?.isSecure ? selectedEntry.isJson ? 'Đã giải mã bằng khóa đang giữ trong RAM.' : 'Dữ liệu đang mã hóa. Mở khóa ứng dụng để xem.' : selectedEntry?.isJson ? 'Cây JSON; bấm một nhánh để chỉnh sửa.' : 'Giá trị thô, không phải JSON.'}</p></div><button type="button" onClick={() => { void refreshEntries(); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50" title="Làm mới"><RefreshCw className="h-4 w-4" /></button></div>
                <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
                    {selectedEntry?.isSecure && !selectedEntry.isJson ? <div className="flex h-full flex-col items-center justify-center text-center text-gray-500"><LockKeyhole className="h-9 w-9 text-amber-400" /><p className="mt-3 text-sm font-semibold text-gray-700">Dữ liệu đang được mã hóa</p><p className="mt-1 max-w-xs text-xs leading-5">Mở khóa UStudy bằng PIN để giải mã và xem nội dung tại đây.</p></div> : selectedEntry?.isJson ? <JsonTreeNode label="root" value={selectedEntry.value} path={[]} depth={0} selectedPath={selectedPath} onSelect={selectNode} /> : selectedEntry ? <pre className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 font-mono text-xs leading-5 text-gray-700">{selectedEntry.raw || '(trống)'}</pre> : <div className="flex h-full flex-col items-center justify-center text-center text-gray-500"><Braces className="h-8 w-8 text-gray-300" /><p className="mt-3 text-sm">Chọn một key để xem nội dung.</p></div>}
                </div>
            </div>

            <aside className="min-h-0 bg-gray-50/60 p-4 sm:p-5">
                {selectedEntry?.isSecure && !selectedEntry.isJson ? <div className="flex h-full flex-col items-center justify-center text-center text-gray-500"><LockKeyhole className="h-8 w-8 text-amber-400" /><p className="mt-3 text-sm font-semibold text-gray-700">Chưa thể chỉnh sửa</p><p className="mt-1 max-w-xs text-xs leading-5">Khóa bảo vệ không được lưu trong localStorage. Hãy mở khóa ứng dụng trước.</p></div> : selectedEntry ? <div className="space-y-4">
                    <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{selectedEntry.isJson ? `Đang chọn: ${selectedPath.length === 0 ? 'root' : selectedPath.join(' > ')}` : 'Giá trị thô'}</p><h2 className="mt-1 text-base font-bold text-gray-900">Chỉnh sửa trực tiếp</h2></div>
                    {error && <p className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800"><CircleAlert className="h-4 w-4 shrink-0" />{error}</p>}
                    <textarea value={selectedEntry.isJson ? editorValue : rawValue} onChange={(event) => selectedEntry.isJson ? setEditorValue(event.target.value) : setRawValue(event.target.value)} className="min-h-40 w-full resize-y rounded-lg border border-gray-200 bg-white p-3 font-mono text-xs leading-5 text-gray-800 outline-none transition focus:border-[#004A98] focus:ring-2 focus:ring-blue-100" spellCheck={false} />
                    <div className="flex gap-2"><button type="button" onClick={selectedEntry.isJson ? handleSaveNode : handleSaveRaw} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#004A98] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#003A78]"><Save className="h-4 w-4" /> Lưu thay đổi</button><button type="button" onClick={handleDeleteNode} className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50" title={selectedPath.length === 0 ? 'Xóa key này' : 'Xóa mục đang chọn'}><Trash2 className="h-4 w-4" /></button></div>
                    {selectedIsContainer && <div className="border-t border-gray-200 pt-4"><div className="mb-3 flex items-center gap-2"><FolderPlus className="h-4 w-4 text-[#004A98]" /><h3 className="text-sm font-bold text-gray-900">Thêm mục con</h3></div>{!Array.isArray(selectedValue) && <input value={childKey} onChange={(event) => setChildKey(event.target.value)} placeholder="Tên thuộc tính" className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#004A98]" />}<textarea value={childValue} onChange={(event) => setChildValue(event.target.value)} className="min-h-24 w-full resize-y rounded-lg border border-gray-200 bg-white p-3 font-mono text-xs outline-none focus:border-[#004A98]" spellCheck={false} /><button type="button" onClick={handleAddChild} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-sm font-bold text-[#004A98] transition hover:bg-blue-50"><Plus className="h-4 w-4" /> {Array.isArray(selectedValue) ? 'Thêm phần tử' : 'Thêm thuộc tính'}</button></div>}
                </div> : <div className="flex h-full flex-col items-center justify-center text-center text-gray-500"><Pencil className="h-7 w-7 text-gray-300" /><p className="mt-3 text-sm">Chọn một key để chỉnh sửa.</p></div>}
            </aside>
        </section>
    );
}
