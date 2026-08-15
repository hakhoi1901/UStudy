import { useEffect, useMemo, useState } from 'react';
import {
    BookOpen,
    CheckCircle2,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    CircleAlert,
    CircleDollarSign,
    Database,
    FileCode2,
    GitFork,
    LayoutTemplate,
    LoaderCircle,
    School,
} from 'lucide-react';
import { ACADEMIC_YEAR_MAJOR_CATALOGS, FACULTIES, getAcademicYearMajorCatalog, loadCohortData } from '../../../assets/data/academic-programs/registry';
import { ACADEMIC_YEARS, getTuitionRateDetails } from '../../../assets/data/tuition';
import { SectionTabs } from '../../../components/ui/navigation/section-tabs';
import { AppSelect } from '../../../components/ui/form';
import {
    getAllMajorDataCoverage,
    getCollectionSize,
    getMajorDataCoverage,
    type MajorDataCoverage,
    type ProgramDataAsset,
} from '../services/data-coverage';

type DataView = 'catalog' | 'coverage';

const DATA_VIEWS = [
    { id: 'catalog', label: 'Theo ngành', description: 'Xem file và nội dung đã nạp', icon: Database },
    { id: 'coverage', label: 'Độ phủ dữ liệu', description: 'Rà soát phần còn thiếu', icon: LayoutTemplate },
] as const;

const ASSET_ICONS = {
    courses: BookOpen,
    prerequisites: GitFork,
    categories: LayoutTemplate,
};

type DataStats = { courses: number; prerequisites: number; categories: number };
type ProgramContent = keyof DataStats;
type DataRecord = Record<string, unknown>;
type LoadedData = Record<ProgramContent, unknown>;
type CategoryDetail = {
    id: string;
    name: string;
    credits?: unknown;
    note?: string;
    courses: string[];
    depth: number;
};

const PROGRAM_CONTENT_TABS = [
    { id: 'courses', label: 'Môn học', icon: BookOpen },
    { id: 'prerequisites', label: 'Tiên quyết', icon: GitFork },
    { id: 'categories', label: 'Khung chương trình', icon: LayoutTemplate },
] as const;

function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

function asRecord(value: unknown): DataRecord | null {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as DataRecord : null;
}

function asRecords(value: unknown): DataRecord[] {
    return Array.isArray(value) ? value.map(asRecord).filter((item): item is DataRecord => item !== null) : [];
}

function textValue(value: unknown) {
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '-';
}

function getCategoryDetails(value: unknown, id: string, depth = 0): CategoryDetail[] {
    const category = asRecord(value);
    if (!category) return [];

    const courses = Array.isArray(category.courses)
        ? category.courses.filter((course): course is string => typeof course === 'string')
        : [];
    const details: CategoryDetail[] = [{
        id,
        name: textValue(category.name ?? id),
        credits: category.total_credits_required ?? category.credits_required ?? category.credits,
        note: typeof category.note === 'string' ? category.note : undefined,
        courses,
        depth,
    }];
    const breakdown = asRecord(category.breakdown);

    if (breakdown) {
        Object.entries(breakdown).forEach(([childId, child]) => {
            details.push(...getCategoryDetails(child, childId, depth + 1));
        });
    }

    return details;
}

function ProgramContentPanel({ content, data }: { content: ProgramContent; data: LoadedData }) {
    if (content === 'courses') {
        const courses = asRecords(data.courses);
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500"><tr><th className="px-4 py-3 sm:px-5">Mã môn</th><th className="px-4 py-3">Tên môn</th><th className="px-4 py-3 text-right">TC</th><th className="px-4 py-3 text-right sm:px-5">Loại</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {courses.map((course, index) => <tr key={`${textValue(course.course_id)}-${index}`}><td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-[#004A98] sm:px-5">{textValue(course.course_id)}</td><td className="px-4 py-3 font-medium text-gray-900">{textValue(course.course_name_vi)}</td><td className="px-4 py-3 text-right tabular-nums text-gray-700">{textValue(course.credits)}</td><td className="px-4 py-3 text-right text-xs text-gray-500 sm:px-5">{textValue(course.course_type)}</td></tr>)}
                        {courses.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">Chưa có môn học để hiển thị.</td></tr>}
                    </tbody>
                </table>
            </div>
        );
    }

    if (content === 'prerequisites') {
        const prerequisites = asRecords(data.prerequisites);
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500"><tr><th className="px-4 py-3 sm:px-5">Môn học</th><th className="px-4 py-3">Điều kiện</th><th className="px-4 py-3 text-right sm:px-5">Loại</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {prerequisites.map((item, index) => <tr key={`${textValue(item.course_id)}-${textValue(item.prereq_id)}-${index}`}><td className="px-4 py-3 font-mono text-xs font-semibold text-[#004A98] sm:px-5">{textValue(item.course_id)}</td><td className="px-4 py-3 font-mono text-xs text-gray-700">{textValue(item.prereq_id)}</td><td className="px-4 py-3 text-right text-xs text-gray-500 sm:px-5">{textValue(item.type)}</td></tr>)}
                        {prerequisites.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">Chưa có quan hệ tiên quyết để hiển thị.</td></tr>}
                    </tbody>
                </table>
            </div>
        );
    }

    const categories = Object.entries(asRecord(data.categories) ?? {})
        .flatMap(([id, value]) => getCategoryDetails(value, id));
    return (
        <div className="divide-y divide-gray-100">
            {categories.map((category, index) => {
                const isRoot = category.depth === 0;
                return (
                    <div key={`${category.id}-${index}`} className="px-4 py-3.5 sm:px-5" style={{ paddingLeft: `${Math.min(category.depth * 20 + 16, 76)}px` }}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className={`text-sm ${isRoot ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>{category.name}</p>
                                <p className="mt-0.5 font-mono text-xs text-gray-500">{category.id}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-[#004A98]">{category.credits === undefined ? '-' : `${textValue(category.credits)} TC`}</span>
                        </div>
                        {category.note && <p className="mt-2 text-xs leading-5 text-gray-500">{category.note}</p>}
                        {category.courses.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{category.courses.map((course) => <code key={course} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">{course}</code>)}</div>}
                    </div>
                );
            })}
            {categories.length === 0 && <p className="px-4 py-6 text-center text-sm text-gray-500">Chưa có khung chương trình để hiển thị.</p>}
        </div>
    );
}

function AssetRow({ asset, count }: { asset: ProgramDataAsset; count?: number }) {
    const Icon = ASSET_ICONS[asset.id];

    return (
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${asset.present ? 'bg-blue-50 text-[#004A98]' : 'bg-gray-100 text-gray-400'}`}>
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{asset.label}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-gray-500">src/assets/data/{asset.path}</p>
            </div>
            <div className="shrink-0 text-right">
                {asset.present ? (
                    <>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Có file</span>
                        {count !== undefined && <p className="mt-0.5 text-xs text-gray-500">{count.toLocaleString('vi-VN')} mục</p>}
                    </>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"><CircleAlert className="h-3.5 w-3.5" /> Chưa có</span>
                )}
            </div>
        </div>
    );
}

function CoverageRow({ item }: { item: MajorDataCoverage }) {
    const missing = item.assets.filter((asset) => !asset.present);
    const isComplete = missing.length === 0;

    return (
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isComplete ? 'bg-emerald-50 text-emerald-700' : (missing.length === 3 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700' )}`}>
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{item.major.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                    {isComplete ? 'Đủ chương trình, tiên quyết và khung chương trình.' : `Thiếu: ${missing.map((asset) => asset.label.toLowerCase()).join(', ')}.`}
                </p>
                {item.sourceCohort !== item.cohort.id && <p className="mt-1 text-xs font-medium text-[#004A98]">Dùng dữ liệu nguồn {item.sourceCohort.toUpperCase()}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${isComplete ? 'bg-emerald-50 text-emerald-700' : (missing.length === 3 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700' )}`}>
                {item.availableCount}/3
            </span>
        </div>
    );
}

export function WorkspaceDataFeature() {
    const [view, setView] = useState<DataView>('catalog');
    const [cohortId, setCohortId] = useState('k24');
    const [facultyId, setFacultyId] = useState('khoa-cntt');
    const [majorId, setMajorId] = useState('nhom-nganh');
    const [coverageCohortId, setCoverageCohortId] = useState('k24');
    const [stats, setStats] = useState<DataStats | null>(null);
    const [loadedData, setLoadedData] = useState<LoadedData | null>(null);
    const [content, setContent] = useState<ProgramContent>('courses');
    const [isProgramDataOpen, setIsProgramDataOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const activeCatalog = getAcademicYearMajorCatalog(cohortId);
    const availableFaculties = FACULTIES.filter((item) => activeCatalog?.faculties.some((faculty) => faculty.id === item.id));
    const faculty = availableFaculties.find((item) => item.id === facultyId) ?? availableFaculties[0];
    const availableMajors = faculty
        ? faculty.majors.filter((item) => activeCatalog?.faculties
            .find((catalogFaculty) => catalogFaculty.id === faculty.id)
            ?.majors.some((major) => major.id === item.id))
        : [];
    const major = availableMajors.find((item) => item.id === majorId) ?? availableMajors[0];

    useEffect(() => {
        if (faculty && faculty.id !== facultyId) {
            setFacultyId(faculty.id);
        }
    }, [faculty, facultyId]);

    useEffect(() => {
        if (major && major.id !== majorId) {
            setMajorId(major.id);
        }
    }, [major, majorId]);

    useEffect(() => {
        setIsProgramDataOpen(false);
    }, [faculty?.id, major?.id, cohortId]);

    const selectedCoverage = useMemo(
        () => (faculty && major ? getMajorDataCoverage(faculty, major, cohortId) : null),
        [faculty, major, cohortId],
    );
    const allCoverage = useMemo(() => getAllMajorDataCoverage(coverageCohortId), [coverageCohortId]);
    const completeMajors = allCoverage.filter((item) => item.availableCount === 3).length;
    const missingMajors = allCoverage.length - completeMajors;

    useEffect(() => {
        let cancelled = false;
        if (!faculty || !major || !selectedCoverage || selectedCoverage.availableCount !== 3) {
            setStats(null);
            setLoadedData(null);
            return undefined;
        }

        setIsLoading(true);
        setStats(null);
        setLoadedData(null);
        loadCohortData(faculty.id, major.id, cohortId)
            .then((data) => {
                if (!cancelled) {
                    setLoadedData({
                        courses: data.courses,
                        prerequisites: data.prerequisites,
                        categories: data.categories,
                    });
                    setStats({
                        courses: getCollectionSize(data.courses),
                        prerequisites: getCollectionSize(data.prerequisites),
                        categories: getCollectionSize(data.categories),
                    });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setStats(null);
                    setLoadedData(null);
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [faculty, major, cohortId, selectedCoverage]);

    const tuitionRows = useMemo(() => {
        if (!major) return [];
        return ACADEMIC_YEARS.map((year) => ({ year, ...getTuitionRateDetails(year.id, major.id) }));
    }, [major]);

    return (
        <section className="space-y-5">
            <SectionTabs
                ariaLabel="Dữ liệu đào tạo"
                tabs={DATA_VIEWS}
                activeTab={view}
                onChange={setView}
            />

            {view === 'catalog' && faculty && major && selectedCoverage && (
                <>
                    <section className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3 md:p-5">
                        <div>
                            <p className="text-xs font-semibold text-gray-600">Khoa</p>
                            <AppSelect value={faculty.id} onChange={setFacultyId} options={availableFaculties} ariaLabel="Chọn khoa" className="mt-1.5" triggerClassName="px-3 py-2.5 text-sm font-medium" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600">Ngành</p>
                            <AppSelect value={major.id} onChange={setMajorId} options={availableMajors} ariaLabel="Chọn ngành" className="mt-1.5" triggerClassName="px-3 py-2.5 text-sm font-medium" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600">Khóa tuyển</p>
                            <AppSelect value={cohortId} onChange={setCohortId} options={ACADEMIC_YEAR_MAJOR_CATALOGS.map((item) => ({ id: item.cohortId, name: item.label }))} ariaLabel="Chọn khóa tuyển" className="mt-1.5" triggerClassName="px-3 py-2.5 text-sm font-medium" />
                        </div>
                    </section>

                    {loadedData && (
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5 ${isProgramDataOpen ? 'border-b border-gray-100' : ''}`}>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Xem dữ liệu trực tiếp</h2>
                                    <p className="mt-1 text-sm text-gray-500">Mở khi cần xem danh sách môn, quan hệ tiên quyết và khung chi tiết.</p>
                                </div>
                                <button type="button" onClick={() => setIsProgramDataOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#004A98] transition hover:border-blue-300 hover:bg-blue-50">
                                    {isProgramDataOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    {isProgramDataOpen ? 'Ẩn dữ liệu' : 'Xem dữ liệu'}
                                </button>
                            </div>
                            {isProgramDataOpen && <>
                                <SectionTabs
                                    ariaLabel="Nội dung dữ liệu chương trình"
                                    tabs={PROGRAM_CONTENT_TABS}
                                    activeTab={content}
                                    onChange={setContent}
                                />
                                <ProgramContentPanel content={content} data={loadedData} />
                            </>}
                        </section>
                    )}

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <School className="h-4 w-4 text-[#004A98]" />
                                    <h2 className="text-base font-bold text-gray-900">{major.name}</h2>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{faculty.name} · {selectedCoverage.cohort.name}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${selectedCoverage.availableCount === 3 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {selectedCoverage.availableCount}/3 dữ liệu chương trình
                            </span>
                        </div>
                        {selectedCoverage.sourceCohort !== cohortId && (
                            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2.5 text-xs text-[#004A98] sm:px-5">
                                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                Khóa này đang dùng dữ liệu nguồn của {selectedCoverage.sourceCohort.toUpperCase()}.
                            </div>
                        )}
                        <div className="divide-y divide-gray-100">
                            {selectedCoverage.assets.map((asset) => (
                                <AssetRow
                                    key={asset.id}
                                    asset={asset}
                                    count={stats?.[asset.id]}
                                />
                            ))}
                        </div>
                        {isLoading && (
                            <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:px-5">
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#004A98]" /> Đang đọc số lượng dữ liệu...
                            </div>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
                            <div className="flex items-center gap-2">
                                <CircleDollarSign className="h-4 w-4 text-[#004A98]" />
                                <h2 className="text-base font-bold text-gray-900">Đơn giá học phí liên quan</h2>
                            </div>
                            <span className="text-xs font-medium text-gray-500">{tuitionRows.length} năm học</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {tuitionRows.map(({ year, default_price, rates, majorRates }) => (
                                <div key={year.id} className="px-4 py-4 sm:px-5">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{year.name}</p>
                                            <p className="mt-0.5 text-xs text-gray-500">{Object.keys(rates).length} mã đơn giá áp dụng</p>
                                        </div>
                                        <p className="text-sm font-bold text-[#004A98]">Mặc định {formatCurrency(default_price)}/TC</p>
                                    </div>
                                    <div className="mt-3 grid gap-x-5 gap-y-2 border-t border-gray-100 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {Object.entries(rates).sort(([left], [right]) => left.localeCompare(right)).map(([code, price]) => {
                                            const isMajorRate = Object.prototype.hasOwnProperty.call(majorRates, code);
                                            return (
                                                <div key={code} className="flex items-center justify-between gap-3 text-sm">
                                                    <span className="flex min-w-0 items-center gap-1.5"><code className="truncate font-mono text-xs font-semibold text-gray-700">{code}</code>{isMajorRate && <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-[#004A98]">Riêng ngành</span>}</span>
                                                    <span className="shrink-0 font-semibold text-gray-900">{formatCurrency(price)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}

            {view === 'coverage' && (
                <>
                    <section className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:px-5">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Khóa tuyển cần kiểm tra</h2>
                            <p className="mt-1 text-sm text-gray-500">Danh sách ngành lấy từ manifest theo từng khóa.</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                            <span>Khóa tuyển</span>
                            <AppSelect
                                value={coverageCohortId}
                                onChange={setCoverageCohortId}
                                options={ACADEMIC_YEAR_MAJOR_CATALOGS.map((item) => ({ id: item.cohortId, name: item.label }))}
                                ariaLabel="Chọn khóa tuyển cần kiểm tra"
                                className="min-w-36"
                                triggerClassName="h-9 px-3 py-0 text-sm font-medium"
                            />
                        </div>
                    </section>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Khoa</p><p className="mt-1 text-2xl font-bold text-gray-900">{FACULTIES.length}</p></div>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ngành đủ 3 dữ liệu</p><p className="mt-1 text-2xl font-bold text-emerald-700">{completeMajors}/{allCoverage.length}</p></div>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ngành cần bổ sung</p><p className="mt-1 text-2xl font-bold text-amber-700">{missingMajors}</p></div>
                    </div>

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
                            <h2 className="text-base font-bold text-gray-900">Độ phủ dữ liệu theo khoa</h2>
                            <p className="mt-1 text-sm text-gray-500">Mỗi ngành cần đủ chương trình đào tạo, môn tiên quyết và khung chương trình.</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {FACULTIES.filter((item) => allCoverage.some((coverage) => coverage.faculty.id === item.id)).map((item) => {
                                const facultyCoverage = allCoverage.filter((coverage) => coverage.faculty.id === item.id);
                                const facultyComplete = facultyCoverage.filter((coverage) => coverage.availableCount === 3).length;
                                return (
                                    <div key={item.id} className="px-4 py-4 sm:px-5">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                                                <p className="mt-0.5 text-xs text-gray-500">{facultyComplete}/{facultyCoverage.length} ngành có đủ dữ liệu</p>
                                            </div>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{facultyCoverage.length} ngành</span>
                                        </div>
                                        <div className="overflow-hidden rounded-lg border border-gray-100 divide-y divide-gray-100">
                                            {facultyCoverage.map((coverage) => <CoverageRow key={coverage.major.id} item={coverage} />)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <p className="flex items-center gap-2 px-1 text-xs text-gray-500"><FileCode2 className="h-3.5 w-3.5" /> Danh sách khoa, ngành và khóa nằm tại src/assets/data/academic-programs/registry.ts; học phí có {ACADEMIC_YEARS.length} bảng tại src/assets/data/tuition/.</p>
                </>
            )}
        </section>
    );
}
