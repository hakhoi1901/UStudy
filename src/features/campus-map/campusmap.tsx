'use client';
import {
  DoorOpen,
  LocateFixed,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CAMPUS_BUILDINGS, findCampusRoom, getFloorRooms, searchCampusRooms } from './campus-data';
import type { BuildingId, CampusBuilding, CampusRoomSuggestion, RoomSearchResult } from './campus-data';
import { CampusSidePanel } from './CampusSidePanel';
import { FloorPlanView } from './FloorPlanView';

const ROOM_TYPE_LABELS: Record<string, string> = {
  classroom: 'Phòng học',
  lab: 'Phòng thực hành',
  office: 'Văn phòng',
  hall: 'Hội trường',
  service: 'Tiện ích',
  'self-study': 'Tự học',
  tolet: 'Nhà vệ sinh',
};

export default function CampusMap() {
  const [searchParams] = useSearchParams();
  const [selectedBuildingId, setSelectedBuildingId] =
    useState<BuildingId>('E');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] =
    useState<RoomSearchResult | null>(null);
  const [error, setError] = useState('');
  const [isSearchSuggestionOpen, setIsSearchSuggestionOpen] = useState(false);
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({ buildingId: 'all', floor: 'all', roomType: 'all' });
  const [view, setView] = useState<'campus' | 'floor'>('campus');
  const [isRoomListOpen, setIsRoomListOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const buildingId = searchParams.get('building') as BuildingId | null;
    const floor = Number(searchParams.get('floor'));
    const roomCode = searchParams.get('room');
    if (!buildingId || !Number.isInteger(floor) || floor < 1) return;

    const building = CAMPUS_BUILDINGS.find((item) => item.id === buildingId);
    const floorData = building?.floors.find((item) => item.number === floor);
    if (!building || !floorData) return;

    const room = roomCode ? getFloorRooms(floorData).find((item) => item.code === roomCode) : undefined;
    setSelectedBuildingId(buildingId);
    setSelectedFloor(floor);
    setSearchResult({
      buildingId,
      floor,
      roomNumber: roomCode ?? '',
      fullCode: roomCode ?? '',
      roomName: room?.name,
      description: room?.description,
      phone: room?.phone,
      email: room?.email,
      website: room?.website,
      openingHours: room?.openingHours,
    });
    setSearchValue(room?.name ?? roomCode ?? '');
  }, [searchParams]);

  const selectedBuilding = useMemo(
    () =>
      CAMPUS_BUILDINGS.find(
        (building) => building.id === selectedBuildingId
      ) ?? CAMPUS_BUILDINGS[0],
    [selectedBuildingId]
  );

  const floors = useMemo(
    () => selectedBuilding.floors.map((floor) => floor.number),
    [selectedBuilding.floors]
  );

  const roomsByFloor = useMemo(
    () => selectedBuilding.floors.map((floor) => ({
      floor: floor.number,
      rooms: getFloorRooms(floor),
    })),
    [selectedBuilding.floors]
  );

  const searchSuggestions = useMemo(() => {
    const filteredSuggestions = searchCampusRooms(searchValue, 100).filter((suggestion) => {
      if (searchFilters.buildingId !== 'all' && suggestion.buildingId !== searchFilters.buildingId) return false;
      if (searchFilters.floor !== 'all' && suggestion.floor !== Number(searchFilters.floor)) return false;
      if (searchFilters.roomType === 'all') return true;

      const floor = CAMPUS_BUILDINGS
        .find((building) => building.id === suggestion.buildingId)
        ?.floors.find((item) => item.number === suggestion.floor);
      return floor ? getFloorRooms(floor).some((room) => room.code === suggestion.fullCode && room.type === searchFilters.roomType) : false;
    });

    return filteredSuggestions.slice(0, 6);
  }, [searchFilters, searchValue]);

  const availableRoomTypes = useMemo(() => Array.from(new Set(
    CAMPUS_BUILDINGS.flatMap((building) => building.floors.flatMap((floor) => getFloorRooms(floor).map((room) => room.type).filter(Boolean)))
  )).sort(), []);

  const availableFloors = useMemo(() => {
    if (searchFilters.buildingId === 'all') return Array.from(new Set(CAMPUS_BUILDINGS.flatMap((building) => building.floors.map((floor) => floor.number)))).sort((left, right) => left - right);
    return CAMPUS_BUILDINGS.find((building) => building.id === searchFilters.buildingId)?.floors.map((floor) => floor.number) ?? [];
  }, [searchFilters.buildingId]);

  useEffect(() => {
    if (!searchResult || !window.matchMedia('(max-width: 1023px)').matches) return;
    sidePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [searchResult]);

  function selectBuilding(building: CampusBuilding) {
    setSelectedBuildingId(building.id);
    setSelectedFloor(1);

    if (searchResult?.buildingId !== building.id) {
      setSearchResult(null);
    }

    setError('');
  }

  function handleSearch(event: SyntheticEvent<HTMLFormElement>) {
  event.preventDefault();

  const parsed = findCampusRoom(searchValue);

  if (!parsed) {
    setError('Nhập mã, tên hoặc tên gọi khác của phòng.');
    setSearchResult(null);
    return;
  }

  selectRoom(parsed);
}

  function selectRoom(parsed: RoomSearchResult | CampusRoomSuggestion) {
  const building = CAMPUS_BUILDINGS.find((item) => item.id === parsed.buildingId);

  if (!building) {
    setError('Không tìm thấy tòa tương ứng.');
    setSearchResult(null);
    return;
  }

  if (parsed.floor > building.floors.length) {
    setError(
      `${building.name} chỉ có ${building.floors.length} tầng, không có tầng ${parsed.floor}.`
    );
    setSearchResult(null);
    return;
  }

  setSelectedBuildingId(building.id);
  setSelectedFloor(parsed.floor);
  setSearchResult(parsed);
  setError('');
  setIsSearchSuggestionOpen(false);
}

  function clearSearch() {
    setSearchValue('');
    setSearchResult(null);
    setError('');
    setIsSearchSuggestionOpen(false);
  }

  if (view === 'floor') {
    return (
      <FloorPlanView
        buildingId={selectedBuildingId}
        floorNumber={selectedFloor}
        highlightedRoomCode={
          searchResult?.buildingId === selectedBuildingId && searchResult.floor === selectedFloor
            ? searchResult.fullCode
            : undefined
        }
        onBuildingChange={(buildingId) => {
          setSelectedBuildingId(buildingId);
          setSelectedFloor(1);
        }}
        onFloorChange={setSelectedFloor}
        onBack={() => setView('campus')}
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#004A98] to-[#0066CC] text-white shadow-sm">
              <MapPin className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                Bản đồ khuôn viên
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Tra cứu tòa, tầng và vị trí phòng học.
              </p>
            </div>
          </div>
          
          <form
            onSubmit={handleSearch}
            className="relative w-full xl:max-w-xl"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              ref={searchInputRef}
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setError('');
                setIsSearchSuggestionOpen(true);
              }}
              onFocus={() => setIsSearchSuggestionOpen(true)}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isSearchSuggestionOpen && searchSuggestions.length > 0}
              aria-controls="room-search-suggestions"
              placeholder="Nhập mã phòng, ví dụ A305 hoặc NĐH504"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-40 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#004A98] focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-[132px] top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSearchFilterOpen((isOpen) => !isOpen)}
              className={`absolute right-[96px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition ${searchFilters.buildingId !== 'all' || searchFilters.floor !== 'all' || searchFilters.roomType !== 'all' ? 'bg-blue-100 text-[#004A98]' : 'text-slate-500 hover:bg-slate-200 hover:text-[#004A98]'}`}
              title="Lọc kết quả tìm phòng"
              aria-label="Lọc kết quả tìm phòng"
              aria-expanded={isSearchFilterOpen}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            <button
              type="submit"
              className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-[#004A98] px-4 text-sm font-semibold text-white transition hover:bg-[#003A78] focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Tìm phòng
            </button>

            {isSearchFilterOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Lọc kết quả</h2>
                  <button
                    type="button"
                    onClick={() => setSearchFilters({ buildingId: 'all', floor: 'all', roomType: 'all' })}
                    className="text-xs font-medium text-[#004A98] hover:text-[#003A78]"
                  >
                    Đặt lại
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                    Tòa
                    <select
                      value={searchFilters.buildingId}
                      onChange={(event) => setSearchFilters((filters) => ({ ...filters, buildingId: event.target.value, floor: 'all' }))}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none focus:border-[#004A98]"
                    >
                      <option value="all">Tất cả</option>
                      {CAMPUS_BUILDINGS.map((building) => <option key={building.id} value={building.id}>{building.shortLabel}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                    Tầng
                    <select
                      value={searchFilters.floor}
                      onChange={(event) => setSearchFilters((filters) => ({ ...filters, floor: event.target.value }))}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none focus:border-[#004A98]"
                    >
                      <option value="all">Tất cả</option>
                      {availableFloors.map((floor) => <option key={floor} value={floor}>Tầng {floor}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                    Loại phòng
                    <select
                      value={searchFilters.roomType}
                      onChange={(event) => setSearchFilters((filters) => ({ ...filters, roomType: event.target.value }))}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none focus:border-[#004A98]"
                    >
                      <option value="all">Tất cả</option>
                      {availableRoomTypes.map((type) => <option key={type} value={type}>{ROOM_TYPE_LABELS[type ?? ''] ?? type}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            )}

            {isSearchSuggestionOpen && searchValue.trim() && searchSuggestions.length > 0 && (
              <div
                id="room-search-suggestions"
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
              >
                {searchSuggestions.map((suggestion) => {
                  const building = CAMPUS_BUILDINGS.find((item) => item.id === suggestion.buildingId);
                  return (
                    <button
                      key={`${suggestion.buildingId}-${suggestion.floor}-${suggestion.fullCode}`}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setSearchValue(suggestion.fullCode);
                        selectRoom(suggestion);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98]">
                        <DoorOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {suggestion.roomName && <p className="font-mono text-sm font-semibold text-slate-900">{suggestion.roomName}</p>}
                        <p className="mt-0.5 truncate text-xs text-slate-500">{suggestion.fullCode}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-500">{building?.shortLabel} · Tầng {suggestion.floor}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </form>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative min-h-[560px] overflow-hidden bg-[#eef3f8]">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(100,116,139,0.14) 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur sm:left-6 sm:top-6">
            <LocateFixed className="h-4 w-4 text-[#004A98]" />
            <span className="text-xs font-semibold text-slate-700">
              Toàn khuôn viên
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-10 hidden items-center gap-4 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-xs text-slate-500 shadow-sm backdrop-blur sm:flex">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#004A98]" />
              Đang chọn
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#0066CC] bg-white" />
              Kết quả tìm kiếm
            </span>
          </div>

          <svg
            viewBox="0 0 1000 720"
            className="relative z-[1] h-full min-h-[540px] w-full p-3 sm:p-5"
            role="img"
            aria-label="Sơ đồ khuôn viên Trường Đại học Khoa học Tự nhiên"
          >
            <defs>
              <linearGradient
                id="buildingGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e8f1fb" />
              </linearGradient>

              <linearGradient
                id="selectedBuildingGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#004A98" />
                <stop offset="100%" stopColor="#0066CC" />
              </linearGradient>

              <linearGradient
                id="roadGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#e7edf4" />
                <stop offset="100%" stopColor="#d5dee8" />
              </linearGradient>

              <linearGradient
                id="lakeGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#8ed8ff" />
                <stop offset="100%" stopColor="#3ba7e8" />
              </linearGradient>

              <pattern
                id="parkingPattern"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 24L24 0"
                  stroke="#d6dee8"
                  strokeWidth="1.5"
                />
              </pattern>

              <filter
                id="buildingShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="6"
                  stdDeviation="6"
                  floodColor="#0f172a"
                  floodOpacity="0.13"
                />
              </filter>

              <filter
                id="softShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="4"
                  floodColor="#0f172a"
                  floodOpacity="0.1"
                />
              </filter>
            </defs>

            {/* Campus boundary */}
            <rect
              x="24"
              y="24"
              width="952"
              height="654"
              rx="36"
              fill="#f4f7fb"
              stroke="#d6e0ea"
              strokeWidth="2"
            />

            {/* Header */}
            <g transform="translate(300 44)">
              <rect
                width="400"
                height="52"
                rx="20"
                fill="#ffffff"
                stroke="#d6e0ea"
                filter="url(#softShadow)"
              />

              <text
                x="200"
                y="22"
                textAnchor="middle"
                fill="#004A98"
                fontSize="12"
                fontWeight="700"
                letterSpacing="1.8"
              >
                CƠ SỞ LINH TRUNG
              </text>

              <text
                x="200"
                y="40"
                textAnchor="middle"
                fill="#0f172a"
                fontSize="16"
                fontWeight="800"
              >
                SƠ ĐỒ KHUÔN VIÊN
              </text>
            </g>

            {/* Main internal road */}
            <path
              d="
                M78 250
                H310
                V336
                H465
                V250
                H792
                V530
                H670
              "
              fill="none"
              stroke="url(#roadGradient)"
              strokeWidth="38"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Bottom road */}
            <path
              d="M180 565 H780"
              fill="none"
              stroke="#d9e2ec"
              strokeWidth="26"
              strokeLinecap="round"
            />

            {/* Left garden */}
            <path
              d="
                M70 278
                H284
                V356
                C260 380 230 408 214 448
                H72
                Z
              "
              fill="#dff3e4"
              stroke="#b8dec4"
              strokeWidth="2"
            />

            {/* Center lower garden */}
            <rect
              x="328"
              y="486"
              width="190"
              height="70"
              rx="26"
              fill="#dff3e4"
              stroke="#b8dec4"
              strokeWidth="2"
            />

            {/* Right garden */}
            <path
              d="
                M642 122
                H790
                V498
                H626
                C648 430 660 356 652 284
                Z
              "
              fill="#dff3e4"
              stroke="#b8dec4"
              strokeWidth="2"
            />

            {/* Front garden */}
            <path
              d="
                M694 548
                H900
                V638
                H724
                C710 610 700 584 694 548
                Z
              "
              fill="#dff3e4"
              stroke="#b8dec4"
              strokeWidth="2"
            />

            {/* A building */}
            <g
              onClick={() =>
                selectBuilding(
                  CAMPUS_BUILDINGS.find((item) => item.id === 'A')!
                )
              }
              className="cursor-pointer"
              filter="url(#buildingShadow)"
            >
              <rect
                x="62"
                y="118"
                width="76"
                height="232"
                rx="20"
                fill={
                  selectedBuildingId === 'A'
                    ? 'url(#selectedBuildingGradient)'
                    : 'url(#buildingGradient)'
                }
                stroke={
                  selectedBuildingId === 'A'
                    ? '#003A78'
                    : '#bdd0e1'
                }
                strokeWidth="3"
              />

              <text
                x="100"
                y="230"
                textAnchor="middle"
                fill={selectedBuildingId === 'A' ? '#ffffff' : '#0f172a'}
                fontSize="38"
                fontWeight="800"
              >
                A
              </text>

              <text
                x="100"
                y="254"
                textAnchor="middle"
                fill={selectedBuildingId === 'A' ? '#dbeafe' : '#64748b'}
                fontSize="11"
                fontWeight="600"
              >
                {CAMPUS_BUILDINGS.find((item) => item.id === 'A')?.floors.length ?? 0} tầng
              </text>
            </g>

            {/* B building */}
            <g
              onClick={() =>
                selectBuilding(
                  CAMPUS_BUILDINGS.find((item) => item.id === 'B')!
                )
              }
              className="cursor-pointer"
              filter="url(#buildingShadow)"
            >
              <rect
                x="142"
                y="154"
                width="156"
                height="96"
                rx="22"
                fill={
                  selectedBuildingId === 'B'
                    ? 'url(#selectedBuildingGradient)'
                    : 'url(#buildingGradient)'
                }
                stroke={
                  selectedBuildingId === 'B'
                    ? '#003A78'
                    : '#bdd0e1'
                }
                strokeWidth="3"
              />

              <text
                x="220"
                y="198"
                textAnchor="middle"
                fill={selectedBuildingId === 'B' ? '#ffffff' : '#0f172a'}
                fontSize="34"
                fontWeight="800"
              >
                B
              </text>

              <text
                x="220"
                y="222"
                textAnchor="middle"
                fill={selectedBuildingId === 'B' ? '#dbeafe' : '#64748b'}
                fontSize="11"
                fontWeight="600"
              >
                Hội trường
              </text>
            </g>

            {/* C building */}
            <g
              onClick={() =>
                selectBuilding(
                  CAMPUS_BUILDINGS.find((item) => item.id === 'C')!
                )
              }
              className="cursor-pointer"
              filter="url(#buildingShadow)"
            >
              <rect
                x="324"
                y="134"
                width="72"
                height="318"
                rx="18"
                fill={
                  selectedBuildingId === 'C'
                    ? 'url(#selectedBuildingGradient)'
                    : 'url(#buildingGradient)'
                }
                stroke={
                  selectedBuildingId === 'C'
                    ? '#003A78'
                    : '#bdd0e1'
                }
                strokeWidth="3"
              />

              <text
                x="360"
                y="292"
                textAnchor="middle"
                fill={selectedBuildingId === 'C' ? '#ffffff' : '#0f172a'}
                fontSize="36"
                fontWeight="800"
              >
                C
              </text>
            </g>

            {/* D building */}
            <g
              onClick={() =>
                selectBuilding(
                  CAMPUS_BUILDINGS.find((item) => item.id === 'D')!
                )
              }
              className="cursor-pointer"
              filter="url(#buildingShadow)"
            >
              <rect
                x="430"
                y="134"
                width="72"
                height="318"
                rx="18"
                fill={
                  selectedBuildingId === 'D'
                    ? 'url(#selectedBuildingGradient)'
                    : 'url(#buildingGradient)'
                }
                stroke={
                  selectedBuildingId === 'D'
                    ? '#003A78'
                    : '#bdd0e1'
                }
                strokeWidth="3"
              />

              <text
                x="466"
                y="292"
                textAnchor="middle"
                fill={selectedBuildingId === 'D' ? '#ffffff' : '#0f172a'}
                fontSize="36"
                fontWeight="800"
              >
                D
              </text>
            </g>

            {/* E building */}
            <g
              onClick={() =>
                selectBuilding(
                  CAMPUS_BUILDINGS.find((item) => item.id === 'E')!
                )
              }
              className="cursor-pointer"
              filter="url(#buildingShadow)"
            >
              <rect
                x="540"
                y="134"
                width="72"
                height="318"
                rx="18"
                fill={
                  selectedBuildingId === 'E'
                    ? 'url(#selectedBuildingGradient)'
                    : 'url(#buildingGradient)'
                }
                stroke={
                  selectedBuildingId === 'E'
                    ? '#003A78'
                    : '#bdd0e1'
                }
                strokeWidth="3"
              />

              <text
                x="576"
                y="292"
                textAnchor="middle"
                fill={selectedBuildingId === 'E' ? '#ffffff' : '#0f172a'}
                fontSize="36"
                fontWeight="800"
              >
                E
              </text>
            </g>

            {/* F building */}
            <g
              onClick={() =>
                selectBuilding(
                  CAMPUS_BUILDINGS.find((item) => item.id === 'F')!
                )
              }
              className="cursor-pointer"
              filter="url(#buildingShadow)"
            >
              <rect
                x="780"
                y="154"
                width="72"
                height="298"
                rx="18"
                fill={
                  selectedBuildingId === 'F'
                    ? 'url(#selectedBuildingGradient)'
                    : 'url(#buildingGradient)'
                }
                stroke={
                  selectedBuildingId === 'F'
                    ? '#003A78'
                    : '#bdd0e1'
                }
                strokeWidth="3"
              />

              <text
                x="816"
                y="298"
                textAnchor="middle"
                fill={selectedBuildingId === 'F' ? '#ffffff' : '#0f172a'}
                fontSize="36"
                fontWeight="800"
              >
                F
              </text>
            </g>

            {/* G building */}
            <g
              onClick={() =>
                selectBuilding(
                  CAMPUS_BUILDINGS.find((item) => item.id === 'G')!
                )
              }
              className="cursor-pointer"
              filter="url(#buildingShadow)"
            >
              <rect
                x="878"
                y="154"
                width="72"
                height="298"
                rx="18"
                fill={
                  selectedBuildingId === 'G'
                    ? 'url(#selectedBuildingGradient)'
                    : 'url(#buildingGradient)'
                }
                stroke={
                  selectedBuildingId === 'G'
                    ? '#003A78'
                    : '#bdd0e1'
                }
                strokeWidth="3"
              />

              <text
                x="914"
                y="298"
                textAnchor="middle"
                fill={selectedBuildingId === 'G' ? '#ffffff' : '#0f172a'}
                fontSize="36"
                fontWeight="800"
              >
                G
              </text>
            </g>

            {/* Lake */}
            <path
              d="
                M680 252
                C708 214 754 234 760 286
                C768 342 742 404 704 410
                C668 416 652 376 660 326
                C664 296 666 270 680 252
                Z
              "
              fill="url(#lakeGradient)"
              stroke="#2b92d0"
              strokeWidth="3"
              filter="url(#softShadow)"
            />

            <text
              x="710"
              y="332"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="700"
              transform="rotate(-4 710 332)"
            >
              HỒ NƯỚC
            </text>

            {/* Gym */}
            <g transform="translate(648 124)">
              <rect
                width="128"
                height="62"
                rx="16"
                fill="#ffffff"
                stroke="#bdd0e1"
                strokeWidth="2"
                filter="url(#softShadow)"
              />

              <text
                x="64"
                y="27"
                textAnchor="middle"
                fill="#004A98"
                fontSize="12"
                fontWeight="800"
              >
                NHÀ THỂ DỤC
              </text>

              <text
                x="64"
                y="44"
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontWeight="600"
              >
                THỂ THAO
              </text>
            </g>

            {/* Parking */}
            <g
              transform="translate(246 556)"
              filter="url(#softShadow)"
            >
              <rect
                width="232"
                height="78"
                rx="18"
                fill="url(#parkingPattern)"
                stroke="#aebdca"
                strokeWidth="2"
              />

              <rect
                x="1"
                y="1"
                width="230"
                height="46"
                rx="17"
                fill="#ffffff"
              />

              <text
                x="116"
                y="32"
                textAnchor="middle"
                fill="#0f172a"
                fontSize="24"
                fontWeight="800"
              >
                NHÀ XE
              </text>

              <text
                x="116"
                y="64"
                textAnchor="middle"
                fill="#64748b"
                fontSize="11"
                fontWeight="700"
              >
                KHU VỰC GIỮ XE
              </text>
            </g>

            {/* Administration building */}
            <g
              onClick={() =>
                selectBuilding(
                  CAMPUS_BUILDINGS.find((item) => item.id === 'NDH')!
                )
              }
              className="cursor-pointer"
              transform="translate(650 512)"
              filter="url(#buildingShadow)"
            >
              <rect
                width="92"
                height="142"
                rx="20"
                fill={
                  selectedBuildingId === 'NDH'
                    ? 'url(#selectedBuildingGradient)'
                    : 'url(#buildingGradient)'
                }
                stroke={
                  selectedBuildingId === 'NDH'
                    ? '#003A78'
                    : '#bdd0e1'
                }
                strokeWidth="3"
              />

              <text
                x="46"
                y="58"
                textAnchor="middle"
                fill={
                  selectedBuildingId === 'NDH'
                    ? '#ffffff'
                    : '#0f172a'
                }
                fontSize="17"
                fontWeight="800"
              >
                NĐH
              </text>

              <text
                x="46"
                y="82"
                textAnchor="middle"
                fill={
                  selectedBuildingId === 'NDH'
                    ? '#dbeafe'
                    : '#64748b'
                }
                fontSize="10"
                fontWeight="700"
              >
                NHÀ ĐIỀU
              </text>

              <text
                x="46"
                y="96"
                textAnchor="middle"
                fill={
                  selectedBuildingId === 'NDH'
                    ? '#dbeafe'
                    : '#64748b'
                }
                fontSize="10"
                fontWeight="700"
              >
                HÀNH
              </text>
            </g>

            {/* Trees */}
            {[
              [174, 340],
              [236, 322],
              [208, 418],
              [274, 392],
              [350, 514],
              [398, 504],
              [466, 518],
              [656, 212],
              [700, 190],
              [748, 210],
              [642, 438],
              [690, 452],
              [744, 438],
              [754, 604],
              [812, 584],
              [862, 606],
            ].map(([x, y], index) => (
              <g key={`${x}-${y}-${index}`} transform={`translate(${x} ${y})`}>
                <rect
                  x="-3"
                  y="8"
                  width="6"
                  height="16"
                  rx="3"
                  fill="#8a5c3c"
                />

                <circle
                  cx="-8"
                  cy="2"
                  r="11"
                  fill="#83bd63"
                  stroke="#609b47"
                />

                <circle
                  cx="7"
                  cy="0"
                  r="12"
                  fill="#6cac50"
                  stroke="#568e40"
                />

                <circle
                  cx="0"
                  cy="-8"
                  r="12"
                  fill="#94c96f"
                  stroke="#6ca34e"
                />
              </g>
            ))}

            {/* Main entrance */}
            <g transform="translate(782 640)">
              <rect
                width="160"
                height="34"
                rx="14"
                fill="#ffffff"
                stroke="#bdd0e1"
                strokeWidth="2"
                filter="url(#softShadow)"
              />

              <circle
                cx="20"
                cy="17"
                r="7"
                fill="#004A98"
              />

              <text
                x="38"
                y="22"
                fill="#475569"
                fontSize="11"
                fontWeight="800"
              >
                CỔNG CHÍNH
              </text>
            </g>
          </svg>
        </div>

        <div ref={sidePanelRef}>
          <CampusSidePanel
            building={selectedBuilding}
            floors={floors}
            selectedFloor={selectedFloor}
            searchResult={searchResult?.buildingId === selectedBuilding.id ? searchResult : null}
            onFloorChange={setSelectedFloor}
            onOpenRoomList={() => setIsRoomListOpen(true)}
            onOpenFloorPlan={() => setView('floor')}
            onBackToExplore={clearSearch}
            onFindAnotherRoom={() => {
              clearSearch();
              searchInputRef.current?.focus();
            }}
          />
        </div>
      </div>

      {isRoomListOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
          role="presentation"
          onClick={() => setIsRoomListOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-list-title"
            className="max-h-[min(680px,calc(100vh-2rem))] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#004A98]">{selectedBuilding.name}</p>
                <h2 id="room-list-title" className="mt-1 text-base font-bold text-slate-900">Danh sách phòng</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRoomListOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Đóng danh sách phòng"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="max-h-[calc(min(680px,100vh-2rem)-84px)] overflow-y-auto p-3">
              {roomsByFloor.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {roomsByFloor.map(({ floor, rooms }) => (
                    <section key={floor} className="py-3 first:pt-0 last:pb-0">
                      <h3 className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tầng {floor}</h3>
                      {rooms.length > 0 ? (
                        <div className="mt-2 divide-y divide-slate-100">
                          {rooms.map((room) => (
                            <button
                              key={room.code}
                              type="button"
                              onClick={() => {
                                setSearchValue(room.code);
                                selectRoom({
                                  buildingId: selectedBuilding.id,
                                  floor,
                                  roomNumber: room.code,
                                  fullCode: room.code,
                                  roomName: room.name,
                                  description: room.description,
                                  phone: room.phone,
                                  email: room.email,
                                  website: room.website,
                                  openingHours: room.openingHours,
                                });
                                setIsRoomListOpen(false);
                              }}
                              className="flex w-full items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-blue-50"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#004A98]">
                                <DoorOpen className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-mono text-sm font-semibold text-slate-900">{room.code}</p>
                                {room.name && <p className="mt-0.5 truncate text-sm text-slate-600">{room.name}</p>}
                              </div>
                              {room.type && <span className="ml-auto shrink-0 text-xs font-medium text-slate-500">{room.type}</span>}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 px-2 text-sm text-slate-400">Chưa có dữ liệu phòng.</p>
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center">
                  <DoorOpen className="h-7 w-7 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">Chưa có dữ liệu phòng</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Thêm phòng vào <code>rooms</code> hoặc vẽ phần tử <code>type: 'room'</code> trong <code>plan</code>.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
