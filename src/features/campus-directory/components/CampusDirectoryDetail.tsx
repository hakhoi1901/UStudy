import type { ReactNode } from 'react';
import { useState } from 'react';
import { ArrowLeft, ChevronDown, Clock3, ExternalLink, Info, ListChecks, Mail, MapPin, Phone, Sparkles, FileText, TriangleAlert } from 'lucide-react';
import type { CampusUnit, CampusUnitLocation, CampusUnitServiceDetail, CampusUnitType } from '../../../assets/data/campus-directory';

const typeLabels: Record<CampusUnitType, string> = {
    faculty: 'Khoa',
    department: 'Bộ môn',
    office: 'Phòng ban',
    center: 'Trung tâm',
    'student-service': 'Dịch vụ sinh viên',
    library: 'Thư viện',
    other: 'Đơn vị',
};

function formatLocation(location: CampusUnitLocation) {
    return [
        location.buildingId === 'NDH' ? 'Nhà Điều hành' : `Tòa ${location.buildingId}`,
        location.floor && `Tầng ${location.floor}`,
        location.note ?? location.roomCode,
    ].filter(Boolean).join(' · ');
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="mt-6 first:mt-0">
            {/* Tăng độ đậm và chuyển màu sang slate-500 */}
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-500">
                {title}
            </h3>
            {/* Đóng khung nội dung vào một card mờ để tách biệt khỏi nền trắng */}
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 text-sm leading-6 text-slate-800">
                {children}
            </div>
        </section>
    );
}

function ServiceDetails({ details }: { details: CampusUnitServiceDetail[] }) {
    return (
        <div className="space-y-4">
            {details.map((detail, index) => {
                if (detail.type === 'paragraph') {
                    return <p key={`${detail.type}-${index}`} className="text-sm leading-6 text-gray-700">{detail.text}</p>;
                }

                if (detail.type === 'list') {
                    return (
                        <div key={`${detail.type}-${index}`}>
                            {detail.title && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{detail.title}</p>}
                            <ul className="space-y-2">
                                {detail.items.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-gray-700"><ListChecks className="mt-1 h-4 w-4 shrink-0 text-[#004A98]" />{item}</li>)}
                            </ul>
                        </div>
                    );
                }

                if (detail.type === 'notice') {
                    const isWarning = detail.tone === 'warning';
                    const Icon = isWarning ? TriangleAlert : Info;
                    return (
                        <div key={`${detail.type}-${index}`} className={`flex gap-3 border-l-2 px-3 py-2.5 ${isWarning ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-[#004A98] bg-blue-50 text-blue-950'}`}>
                            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isWarning ? 'text-amber-600' : 'text-[#004A98]'}`} />
                            <div><p className="text-sm font-semibold">{detail.title}</p><p className="mt-1 text-sm leading-6 opacity-85">{detail.text}</p></div>
                        </div>
                    );
                }

                return (
                    <a key={`${detail.type}-${index}`} href={detail.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 border-t border-gray-100 pt-3 text-sm font-semibold text-[#004A98] hover:text-[#003A78] hover:underline">
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        <span>{detail.label}</span>
                    </a>
                );
            })}
        </div>
    );
}

export function CampusDirectoryDetail({ unit, onOpenMap, onBack, className = '', scrollContent = false }: {
    unit: CampusUnit;
    onOpenMap: (location: CampusUnitLocation) => void;
    onBack?: () => void;
    className?: string;
    scrollContent?: boolean;
}) {
    const primaryLocation = unit.locations[0];
    const hasContacts = (unit.phones?.length ?? 0) + (unit.emails?.length ?? 0) + (unit.websites?.length ?? 0) > 0;
    const [openServiceId, setOpenServiceId] = useState<string | null>(null);

    return (
        <article className={`flex min-h-0 min-w-0 flex-col bg-white ${className}`}>
            <header className="shrink-0 flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-5 sm:px-6">
                <div className="min-w-0">
                    {onBack && (
                        <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#004A98]">
                            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                        </button>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#004A98]">{typeLabels[unit.type]}</p>
                    <h2 className="mt-1 text-xl font-bold text-gray-900">{unit.name}</h2>
                </div>
                {primaryLocation && (
                    <button type="button" onClick={() => onOpenMap(primaryLocation)} className="ustudy-button-outline shrink-0 gap-2 px-3 py-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span className="hidden sm:inline">Xem trên bản đồ</span>
                    </button>
                )}
            </header>

            <div className={`px-5 py-6 sm:px-6 ${scrollContent ? 'min-h-0 flex-1 overflow-y-auto scrollbar-hide' : ''}`}>
                <p className="text-sm leading-6 text-gray-700">{unit.summary}</p>
                {unit.description && <p className="mt-3 text-sm leading-6 text-gray-600">{unit.description}</p>}

                {unit.locations.length > 0 && (
                    <DetailSection title="Địa điểm">
                        <div className="space-y-2">
                            {unit.locations.map((location) => (
                                <button key={`${location.buildingId}-${location.floor}-${location.roomCode}`} type="button" onClick={() => onOpenMap(location)} className="flex w-full items-start gap-2 text-left text-[#004A98] hover:underline">
                                    <MapPin className="mt-1 h-4 w-4 shrink-0" />
                                    <span>{formatLocation(location)}</span>
                                </button>
                            ))}
                        </div>
                    </DetailSection>
                )}

                {hasContacts && (
                    <DetailSection title="Liên hệ">
                        <div className="space-y-2.5">
                            {unit.phones?.map((phone) => <a key={phone} href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2 text-gray-900 hover:text-[#004A98]"><Phone className="h-4 w-4 text-gray-400" />{phone}</a>)}
                            {unit.emails?.map((email) => <a key={email} href={`mailto:${email}`} className="flex items-center gap-2 text-gray-900 hover:text-[#004A98]"><Mail className="h-4 w-4 text-gray-400" />{email}</a>)}
                            {unit.websites?.map((website) => <a key={website} href={website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-900 hover:text-[#004A98]"><ExternalLink className="h-4 w-4 text-gray-400" /><span className="truncate">{website}</span></a>)}
                        </div>
                    </DetailSection>
                )}

                {unit.openingHours && (
                    <DetailSection title="Giờ làm việc">
                        <p className="flex items-start gap-2"><Clock3 className="mt-1 h-4 w-4 shrink-0 text-gray-400" />{unit.openingHours}</p>
                    </DetailSection>
                )}

                {unit.services && unit.services.length > 0 && (
    <DetailSection title="Hỗ trợ">
        <div className="space-y-3">
            {unit.services.map((service) => {
                const isOpen = openServiceId === service.id;
                return (
                    <div 
                        key={service.id} 
                        className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                            isOpen 
                                ? 'border-[#004A98]/20 bg-blue-50/40 shadow-md ring-1 ring-[#004A98]/10' 
                                : 'border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md'
                        }`}
                    >
                        <button 
                            type="button" 
                            onClick={() => setOpenServiceId(isOpen ? null : service.id)} 
                            className="group flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
                        >
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                                isOpen 
                                    ? 'border-transparent bg-[#004A98] text-white shadow-sm' 
                                    : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-[#004A98]'
                            }`}>
                                <FileText className="h-5 w-5" />
                            </span>
                            <span className={`min-w-0 flex-1 text-[15px] font-semibold transition-colors ${
                                isOpen ? 'text-[#004A98]' : 'text-slate-800'
                            }`}>
                                {service.name}
                            </span>
                            <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                                isOpen ? 'rotate-180 text-[#004A98]' : 'text-slate-400 group-hover:text-blue-400'
                            }`} />
                        </button>
                        {isOpen && (
                            <div className="border-t border-blue-100/50 bg-white px-5 py-4">
                                <ServiceDetails details={service.details} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </DetailSection>
)}

                {(unit.sourceUrl || unit.lastVerifiedAt || unit.verificationStatus === 'pending') && (
                    <p className="border-t border-gray-100 pt-4 text-xs text-gray-400">
                        {unit.lastVerifiedAt ? `Xác minh gần nhất: ${unit.lastVerifiedAt}` : 'Thông tin đang được cập nhật.'}
                    </p>
                )}
            </div>
        </article>
    );
}
