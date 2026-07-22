import {
  ArrowLeft,
  Building2,
  ChevronRight,
  CircleParking,
  Clock3,
  DoorOpen,
  Globe2,
  Layers3,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Search,
  Stars,
} from 'lucide-react';
import type { CampusBuilding, RoomSearchResult } from './campus-data';

interface CampusSidePanelProps {
  building: CampusBuilding;
  floors: number[];
  selectedFloor: number;
  searchResult: RoomSearchResult | null;
  onFloorChange: (floor: number) => void;
  onOpenRoomList: () => void;
  onOpenFloorPlan: () => void;
  onBackToExplore: () => void;
  onFindAnotherRoom: () => void;
}

export function CampusSidePanel({
  building,
  floors,
  selectedFloor,
  searchResult,
  onFloorChange,
  onOpenRoomList,
  onOpenFloorPlan,
  onBackToExplore,
  onFindAnotherRoom,
}: CampusSidePanelProps) {
  return (
    <aside className="border-t border-gray-200 bg-white lg:border-l lg:border-t-0">
      {searchResult ? (
        <RoomSearchResultPanel
          building={building}
          result={searchResult}
          onBack={onBackToExplore}
          onFindAnother={onFindAnotherRoom}
          onOpenFloorPlan={onOpenFloorPlan}
        />
      ) : (
        <BuildingExplorePanel
          building={building}
          floors={floors}
          selectedFloor={selectedFloor}
          onFloorChange={onFloorChange}
          onOpenRoomList={onOpenRoomList}
          onOpenFloorPlan={onOpenFloorPlan}
        />
      )}
    </aside>
  );
}

interface BuildingExplorePanelProps {
  building: CampusBuilding;
  floors: number[];
  selectedFloor: number;
  onFloorChange: (floor: number) => void;
  onOpenRoomList: () => void;
  onOpenFloorPlan: () => void;
}

function BuildingExplorePanel({
  building,
  floors,
  selectedFloor,
  onFloorChange,
  onOpenRoomList,
  onOpenFloorPlan,
}: BuildingExplorePanelProps) {
  return (
    <div className="flex h-full flex-col">
      <header
        className="bg-gradient-to-br from-[#004A98] to-[#0066CC] px-5 py-5 text-white sm:px-6"
        style={{ backgroundImage: `linear-gradient(135deg, ${building.accent}, #0066CC)` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase text-blue-100">Tham quan tòa nhà</p>
            <h2 className="mt-1 text-xl font-bold">{building.name}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-blue-50/90">{building.description}</p>
          </div>
          <div className="shrink-0 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-center">
            <div className="text-lg font-bold">{building.floors.length}</div>
            <div className="text-[10px] font-semibold uppercase text-blue-100">tầng</div>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-5 sm:p-6">
        <div className="grid grid-cols-2 divide-x divide-gray-200 rounded-xl border border-gray-200 bg-gray-50">
          <div className="p-4">
            <Layers3 className="h-4 w-4 text-[#004A98]" />
            <p className="mt-2 text-lg font-bold text-gray-900">{building.floors.length}</p>
            <p className="text-xs text-gray-500">Tổng số tầng</p>
          </div>
          <div className="p-4">
            <DoorOpen className="h-4 w-4 text-[#004A98]" />
            <p className="mt-2 text-lg font-bold text-gray-900">{building.roomCount}</p>
            <p className="text-xs text-gray-500">Phòng dự kiến</p>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Chọn tầng</h3>
            <span className="text-xs text-gray-500">{building.floors.length} tầng</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {floors.map((floor) => {
              const active = floor === selectedFloor;
              return (
                <button
                  key={floor}
                  type="button"
                  onClick={() => onFloorChange(floor)}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30 ${
                    active
                      ? 'bg-[#004A98] text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-[#004A98] hover:bg-blue-50 hover:text-[#004A98]'
                  }`}
                >
                  {floor}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Phòng trong tòa</h3>
          <button
            type="button"
            onClick={onOpenRoomList}
            className="group flex w-full items-center justify-between border-y border-gray-200 py-3 text-left transition-colors hover:bg-blue-50"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#004A98]">
                <DoorOpen className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-900">Xem danh sách phòng</span>
                <span className="mt-0.5 block text-xs text-gray-500">Danh sách được chia theo từng tầng</span>
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
          </button>
        </section>

        {building.facilities.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Tiện ích tại tòa</h3>
            <div className="flex flex-wrap gap-2">
              {building.facilities.map((facility) => (
                <span key={facility} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600">
                  {facility.includes('Thang') ? (
                    <Stars className="h-3.5 w-3.5" />
                  ) : facility.includes('xe') ? (
                    <CircleParking className="h-3.5 w-3.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                  {facility}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="border-t border-gray-200 p-5 sm:p-6">
        <button
          type="button"
          onClick={onOpenFloorPlan}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#004A98] text-sm font-semibold text-white transition-colors hover:bg-[#003A78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30"
        >
          <Layers3 className="h-4 w-4" />
          Xem sơ đồ tầng {selectedFloor}
        </button>
      </footer>
    </div>
  );
}

interface RoomSearchResultPanelProps {
  building: CampusBuilding;
  result: RoomSearchResult;
  onBack: () => void;
  onFindAnother: () => void;
  onOpenFloorPlan: () => void;
}

function RoomSearchResultPanel({
  building,
  result,
  onBack,
  onFindAnother,
  onOpenFloorPlan,
}: RoomSearchResultPanelProps) {
  const floor = building.floors.find((item) => item.number === result.floor);
  const isPlacedOnPlan = Boolean(floor?.plan?.elements.some(
    (element) => element.type === 'room' && element.code.toUpperCase() === result.fullCode.toUpperCase(),
  ));
  const hasDescription = Boolean(result.description);
  const hasContact = Boolean(result.phone || result.email || result.website || result.openingHours);

  return (
    <div className="flex h-full flex-col" aria-live="polite">
      <header className="border-b border-gray-200 px-5 py-5 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#004A98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại tham quan
        </button>

        <div className="mt-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004A98] text-white">
            <Navigation className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-[#004A98]">Kết quả tìm phòng</p>
            <h2 className="mt-1 text-xl font-bold leading-7 text-gray-900">
              {result.roomName || `Phòng ${result.fullCode}`}
            </h2>
            {result.roomName && <p className="mt-1 font-mono text-xs font-semibold text-gray-500">{result.fullCode}</p>}
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0 text-[#004A98]" />
              {building.name} · Tầng {result.floor}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 divide-y divide-gray-200 px-5 sm:px-6">
        <section className="py-5">
          <h3 className="text-sm font-semibold text-gray-900">Thông tin phòng</h3>
          {hasDescription ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{result.description}</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-gray-500">Phòng này chưa có mô tả chi tiết.</p>
          )}
        </section>

        {hasContact && (
          <section className="grid gap-3 py-5 text-sm">
            <h3 className="text-sm font-semibold text-gray-900">Liên hệ và giờ làm việc</h3>
            {result.phone && (
              <a href={`tel:${result.phone}`} className="flex min-w-0 items-center gap-3 text-[#004A98] hover:underline">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="truncate font-medium">{result.phone}</span>
              </a>
            )}
            {result.email && (
              <a href={`mailto:${result.email}`} className="flex min-w-0 items-center gap-3 text-[#004A98] hover:underline">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate font-medium">{result.email}</span>
              </a>
            )}
            {result.website && (
              <a href={result.website} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-3 text-[#004A98] hover:underline">
                <Globe2 className="h-4 w-4 shrink-0" />
                <span className="truncate font-medium">{result.website}</span>
              </a>
            )}
            {result.openingHours && (
              <p className="flex items-start gap-3 text-gray-600">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#004A98]" />
                <span>{result.openingHours}</span>
              </p>
            )}
          </section>
        )}

        <section className="py-5">
          <div className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-sm ${
            isPlacedOnPlan
              ? 'border-blue-200 bg-blue-50 text-blue-900'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}>
            <Layers3 className={`mt-0.5 h-4 w-4 shrink-0 ${isPlacedOnPlan ? 'text-[#004A98]' : 'text-amber-700'}`} />
            <p>
              {isPlacedOnPlan
                ? 'Phòng đã có vị trí trên sơ đồ tầng.'
                : 'Phòng chưa được đặt vị trí trên sơ đồ tầng.'}
            </p>
          </div>
        </section>
      </div>

      <footer className="grid gap-2 border-t border-gray-200 p-5 sm:p-6">
        <button
          type="button"
          onClick={onOpenFloorPlan}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#004A98] text-sm font-semibold text-white transition-colors hover:bg-[#003A78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30"
        >
          <Layers3 className="h-4 w-4" />
          {isPlacedOnPlan ? 'Xem vị trí trên sơ đồ' : `Xem sơ đồ tầng ${result.floor}`}
        </button>
        <button
          type="button"
          onClick={onFindAnother}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#004A98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30"
        >
          <Search className="h-4 w-4" />
          Tìm phòng khác
        </button>
      </footer>
    </div>
  );
}
