import { ArrowLeft, DoorOpen, Layers3, MapPinned } from 'lucide-react';
import { CAMPUS_BUILDINGS } from './campus-data';
import type { BuildingId, FloorPlanElement } from './campus-data';

interface FloorPlanViewProps {
  buildingId: BuildingId;
  floorNumber: number;
  onBuildingChange: (buildingId: BuildingId) => void;
  onFloorChange: (floor: number) => void;
  onBack: () => void;
}

export function FloorPlanView({
  buildingId,
  floorNumber,
  onBuildingChange,
  onFloorChange,
  onBack,
}: FloorPlanViewProps) {
  const building = CAMPUS_BUILDINGS.find((item) => item.id === buildingId) ?? CAMPUS_BUILDINGS[0];
  const floor = building.floors.find((item) => item.number === floorNumber) ?? building.floors[0];
  const plan = floor.plan;

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#004A98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004A98]/30"
            title="Quay lại bản đồ khuôn viên"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Sơ đồ tầng</h1>
            <p className="mt-0.5 text-sm text-gray-500">{building.name} · Tầng {floor.number}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={building.id}
            onChange={(event) => onBuildingChange(event.target.value as BuildingId)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-[#004A98] focus:ring-2 focus:ring-[#004A98]/20"
          >
            {CAMPUS_BUILDINGS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            {building.floors.map((item) => (
              <button
                key={item.number}
                type="button"
                onClick={() => onFloorChange(item.number)}
                className={`h-7 min-w-7 rounded px-2 text-xs font-semibold transition-colors ${item.number === floor.number ? 'bg-white text-[#004A98] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {item.number}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:p-6">
        <div className="overflow-auto rounded-lg border border-gray-200 bg-[#F8FAFC] p-4">
          {plan ? (
            <svg
              viewBox={`0 0 ${plan.width} ${plan.height}`}
              className="mx-auto block min-w-[620px] max-w-full rounded border border-gray-200 bg-white"
              style={{ aspectRatio: `${plan.width} / ${plan.height}` }}
              role="img"
              aria-label={`Sơ đồ ${building.name}, tầng ${floor.number}`}
            >
              {plan.elements.map((element) => <PlanElement key={element.id} element={element} />)}
            </svg>
          ) : (
            <div className="flex min-h-[420px] min-w-[620px] flex-col items-center justify-center rounded border border-dashed border-gray-300 bg-white px-6 text-center">
              <DoorOpen className="h-8 w-8 text-gray-400" />
              <p className="mt-3 text-sm font-semibold text-gray-800">Tầng này chưa có bản thiết kế</p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">Khai báo <code>plan</code> riêng cho tầng trong <code>campus-data.ts</code>. Giao diện sẽ render nguyên bản vẽ đó, không áp layout mặc định.</p>
            </div>
          )}
        </div>

        <aside className="border-t border-gray-200 pt-4 lg:border-t-0 lg:border-l lg:pl-5 lg:pt-0">
          <Layers3 className="h-5 w-5 text-[#004A98]" />
          <h2 className="mt-2 text-sm font-semibold text-gray-900">{building.name} · Tầng {floor.number}</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">Mỗi tầng dùng một bản vẽ SVG độc lập, nên có thể đặt phòng, hành lang, cầu thang và các khu vực theo đúng thực tế.</p>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs font-medium text-gray-500">Trạng thái bản thiết kế</p>
            <p className="mt-1 text-sm font-semibold text-[#004A98]">{plan ? `${plan.elements.length} thành phần` : 'Chưa thiết kế'}</p>
          </div>
          <div className="mt-4 flex items-start gap-2 border-t border-gray-200 pt-4 text-xs leading-5 text-gray-500">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-[#004A98]" />
            <span>Dữ liệu bản vẽ nằm tại <code>campus-data.ts</code>.</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PlanElement({ element }: { element: FloorPlanElement }) {
  if (element.type === 'path') {
    return <path d={element.d} fill={element.fill ?? 'none'} fillRule={element.fillRule} stroke={element.stroke ?? '#94A3B8'} strokeWidth={element.strokeWidth ?? 1} />;
  }

  if (element.type === 'label') {
    return <text x={element.x} y={element.y} fill={element.color ?? '#475569'} fontSize={element.size ?? 14} textAnchor="middle">{element.text}</text>;
  }

  const label = element.type === 'room' ? element.label ?? element.code : element.label;
  const fill = element.fill ?? (element.type === 'room' ? '#EAF3FF' : '#F1F5F9');

  return (
    <g>
      <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="4" fill={fill} stroke="#94A3B8" strokeWidth="1" />
      <text x={element.x + element.width / 2} y={element.y + element.height / 2} fill="#1E3A5F" fontSize="13" fontWeight="600" textAnchor="middle" dominantBaseline="middle">{label}</text>
    </g>
  );
}
