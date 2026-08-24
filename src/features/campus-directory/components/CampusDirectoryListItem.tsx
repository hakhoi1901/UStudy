import { Building2, GraduationCap, Landmark, Library, MapPin, UsersRound, Microscope } from 'lucide-react';
import type { CampusUnit, CampusUnitLocation, CampusUnitType } from '../../../assets/data/campus-directory';
import { CAMPUS_UNITS } from '../../../assets/data/campus-directory';
const unitIcon: Record<CampusUnitType, typeof Building2> = {
    faculty: GraduationCap,
    department: Building2,
    laboratory: Microscope,
    office: Landmark,
    center: Building2,
    'student-service': UsersRound,
    library: Library,
    other: Building2,
};

function formatLocation(location: CampusUnitLocation) {
    return [
        location.buildingId === 'NDH' ? 'Nhà Điều hành' : `Tòa ${location.buildingId}`,
        location.floor && `Tầng ${location.floor}`,
        location.note ?? location.roomCode,
    ].filter(Boolean).join(' · ');
}

function getLocationLabels(unit: CampusUnit): string[] {
    if (unit.locations.length === 0) {
        if (unit.type === 'laboratory' || unit.type === 'department') {
            const parent = CAMPUS_UNITS.find(u => u.id === unit.parentId);
            return [parent ? `Trực thuộc ${parent.name}` : 'Đang cập nhật vị trí'];
        }
        return ['Đang cập nhật vị trí'];
    }

    return unit.locations.map(formatLocation);
}

export function CampusDirectoryListItem({ unit, isSelected, onClick }: {
    unit: CampusUnit;
    isSelected: boolean;
    onClick: () => void;
}) {
    const Icon = unitIcon[unit.type];
    const locationLabels = getLocationLabels(unit);
    const hasPhysicalLocation = unit.locations.length > 0;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${isSelected ? 'bg-blue-50/70 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
        >
            {isSelected && <span className="absolute inset-y-0 left-0 w-[3px] bg-[#004A98]" />}
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-white text-[#004A98]' : 'bg-gray-100 text-gray-500'}`}>
                <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{unit.name}</span>
                <span className="mt-1 block space-y-1">
                    {locationLabels.map((label, index) => (
                        <span
                            key={`${unit.id}-location-${index}`}
                            className="flex min-w-0 items-start gap-1.5 text-xs leading-4 text-gray-500"
                        >
                            {hasPhysicalLocation && <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />}
                            <span className="min-w-0 flex-1 truncate" title={label}>{label}</span>
                        </span>
                    ))}
                </span>
            </span>
        </button>
    );
}
