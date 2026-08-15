import { Building2, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CAMPUS_UNITS, type CampusUnit, type CampusUnitLocation, type CampusUnitType } from '../../assets/data/campus-directory';
import { APP_ROUTES } from '../../app/routes';
import { AppSelect } from '../../components/ui/form';
import { searchCampusUnits } from './campus-directory-search';
import { CampusDirectoryDetail } from './components/CampusDirectoryDetail';
import { CampusDirectoryListItem } from './components/CampusDirectoryListItem';

const TYPE_OPTIONS: Array<{ id: 'all' | CampusUnitType; name: string }> = [
    { id: 'all', name: 'Tất cả đơn vị' },
    { id: 'faculty', name: 'Khoa' },
    { id: 'department', name: 'Bộ môn' },
    { id: 'office', name: 'Phòng ban' },
    { id: 'center', name: 'Trung tâm' },
    { id: 'student-service', name: 'Dịch vụ sinh viên' },
    { id: 'library', name: 'Thư viện' },
];

const UNIT_TYPE_ORDER: CampusUnitType[] = ['faculty', 'department', 'office', 'center', 'student-service', 'library', 'other'];

const UNIT_TYPE_LABELS: Record<CampusUnitType, string> = {
    faculty: 'Khoa',
    department: 'Bộ môn',
    office: 'Phòng ban',
    center: 'Trung tâm',
    'student-service': 'Dịch vụ sinh viên',
    library: 'Thư viện',
    other: 'Đơn vị khác',
};

const INITIAL_EXPANDED_TYPES: Record<CampusUnitType, boolean> = {
    faculty: false,
    department: false,
    office: false,
    center: false,
    'student-service': false,
    library: false,
    other: false,
};

const SEARCH_EXPANDED_TYPES: Record<CampusUnitType, boolean> = {
    faculty: true,
    department: true,
    office: true,
    center: true,
    'student-service': true,
    library: true,
    other: true,
};

export function CampusDirectoryFeature() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [type, setType] = useState<'all' | CampusUnitType>('all');
    const [selectedId, setSelectedId] = useState(CAMPUS_UNITS[0]?.id ?? '');
    const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
    const [expandedTypes, setExpandedTypes] = useState(INITIAL_EXPANDED_TYPES);

    const filteredUnits = useMemo(() => {
        const matchingUnits = searchCampusUnits(CAMPUS_UNITS, query);
        return type === 'all' ? matchingUnits : matchingUnits.filter((unit) => unit.type === type);
    }, [query, type]);
    const selectedUnit = filteredUnits.find((unit) => unit.id === selectedId) ?? filteredUnits[0] ?? null;
    const unitGroups = useMemo(() => UNIT_TYPE_ORDER
        .map((unitType) => ({ type: unitType, units: filteredUnits.filter((unit) => unit.type === unitType) }))
        .filter((group) => group.units.length > 0), [filteredUnits]);

    useEffect(() => {
        if (selectedUnit && selectedUnit.id !== selectedId) setSelectedId(selectedUnit.id);
    }, [selectedId, selectedUnit]);

    useEffect(() => {
        if (query.trim()) setExpandedTypes(SEARCH_EXPANDED_TYPES);
    }, [query]);

    const openMap = (location: CampusUnitLocation) => {
        const params = new URLSearchParams({ building: location.buildingId, from: 'directory' });
        if (location.floor) params.set('floor', String(location.floor));
        if (location.roomCode) params.set('room', location.roomCode);
        navigate(`${APP_ROUTES.campusMap}?${params.toString()}`);
    };

    const selectUnit = (unit: CampusUnit) => {
        setSelectedId(unit.id);
        if (window.matchMedia('(max-width: 1023px)').matches) setIsMobileDetailOpen(true);
    };

    return (
        <section className="mt-5">
            <div className="grid min-h-[420px] overflow-hidden rounded-xl border border-gray-200 bg-white lg:h-[min(700px,calc(100dvh-11rem))] lg:min-h-0 lg:grid-cols-[380px_minmax(0,1fr)] ustudy-card">
                <aside className="flex min-h-0 min-w-0 flex-col border-b border-gray-200 bg-slate-50/50 lg:border-b-0 lg:border-r">
                    <div className="shrink-0 border-b border-gray-200 bg-slate-50/50 p-4">                        <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm đơn vị, thủ tục, dịch vụ..." className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#004A98] focus:ring-2 focus:ring-blue-100" />
                        {query && <button type="button" onClick={() => setQuery('')} aria-label="Xóa tìm kiếm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X className="h-4 w-4" /></button>}
                    </label>
                        {/* <AppSelect value={type} options={TYPE_OPTIONS} onChange={(value) => setType(value as 'all' | CampusUnitType)} ariaLabel="Lọc loại đơn vị" className="mt-3" triggerClassName="h-10" /> */}
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto pb-2 scrollbar-hide">
                        {unitGroups.map((group) => (
                            <DirectoryGroup
                                key={group.type}
                                type={group.type}
                                units={group.units}
                                isExpanded={expandedTypes[group.type]}
                                selectedUnitId={selectedUnit?.id ?? null}
                                onToggle={() => setExpandedTypes((current) => ({ ...current, [group.type]: !current[group.type] }))}
                                onSelect={selectUnit}
                            />
                        ))}
                        {filteredUnits.length === 0 && (
                            <div className="px-5 py-12 text-center">
                                <Building2 className="mx-auto h-6 w-6 text-gray-300" />
                                <p className="mt-3 text-sm font-medium text-gray-700">Không tìm thấy đơn vị phù hợp</p>
                                <p className="mt-1 text-xs text-gray-500">Thử “PĐT”, “CTSV” hoặc “đăng ký học phần”.</p>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="hidden min-h-0 min-w-0 overflow-hidden lg:block">
                    {selectedUnit ? <CampusDirectoryDetail unit={selectedUnit} onOpenMap={openMap} scrollContent className="h-full" /> : <DirectoryEmptyState />}
                </div>
            </div>

            {isMobileDetailOpen && selectedUnit && (
                <div className="fixed inset-x-0 top-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-[9000] bg-white lg:hidden">
                    <div className="h-full overflow-y-auto scrollbar-hide">
                        <CampusDirectoryDetail unit={selectedUnit} onOpenMap={openMap} onBack={() => setIsMobileDetailOpen(false)} />
                    </div>
                </div>
            )}
        </section>
    );
}

function DirectoryGroup({ type, units, isExpanded, selectedUnitId, onToggle, onSelect }: {
    type: CampusUnitType;
    units: CampusUnit[];
    isExpanded: boolean;
    selectedUnitId: string | null;
    onToggle: () => void;
    onSelect: (unit: CampusUnit) => void;
}) {
    return (
        <section className="border-b border-gray-100 last:border-b-0">
            <button type="button" onClick={onToggle} className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-500 hover:bg-gray-50">
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                <span className="flex-1">{UNIT_TYPE_LABELS[type]}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] normal-case tracking-normal text-gray-500">{units.length}</span>
            </button>
            {isExpanded && (
                <div className="mb-2 ml-5 border-l border-gray-100">
                    {units.map((unit) => <CampusDirectoryListItem key={unit.id} unit={unit} isSelected={unit.id === selectedUnitId} onClick={() => onSelect(unit)} />)}
                </div>
            )}
        </section>
    );
}

function DirectoryEmptyState() {
    return <div className="flex min-h-[560px] items-center justify-center px-6 text-center text-sm text-gray-500">Chọn một đơn vị để xem thông tin chi tiết.</div>;
}
