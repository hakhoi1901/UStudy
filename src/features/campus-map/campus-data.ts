export type BuildingId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'NDH';

export interface CampusRoom {
  code: string;
  name?: string;
  aliases?: string[];
  type?: 'classroom' | 'lab' | 'office' | 'hall' | 'service' | 'self-study' | 'tolet';
}

export type FloorPlanElement =
  | {
    id: string;
    type: 'room';
    code: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    aliases?: string[];
    roomType?: CampusRoom['type'];
    fill?: string;
  }
  | {
    id: string;
    type: 'area';
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    fill?: string;
  }
  | {
    id: string;
    type: 'path';
    d: string;
    fill?: string;
    fillRule?: 'evenodd' | 'nonzero';
    stroke?: string;
    strokeWidth?: number;
  }
  | {
    id: string;
    type: 'label';
    x: number;
    y: number;
    text: string;
    size?: number;
    color?: string;
  };

export interface CampusFloorPlan {
  width: number;
  height: number;
  elements: FloorPlanElement[];
}

export interface CampusFloor {
  number: number;
  rooms: CampusRoom[];
  // Optional by design: each floor only appears as a diagram after its own plan is defined.
  plan?: CampusFloorPlan;
}

export interface CampusBuilding {
  id: BuildingId;
  shortLabel: string;
  name: string;
  description: string;
  floors: CampusFloor[];
  roomCount: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  accent: string;
  facilities: string[];
}

export interface RoomSearchResult {
  buildingId: BuildingId;
  floor: number;
  roomNumber: string;
  fullCode: string;
  roomName?: string;
}

function createFloors(count: number): CampusFloor[] {
  return Array.from({ length: count }, (_, index) => ({
    number: index + 1,
    // Điền danh sách phòng đã xác minh của tầng vào đây khi có dữ liệu.
    rooms: [],
  }));
}

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: 'B', shortLabel: 'B', name: 'Hội trường B',
    description: 'Hội trường B',
    floors: [
      {
        number: 1,
        rooms: [
          {code: 'HTB', name: 'Hội trường B', type: 'hall'},
          {code: 'PTH-B', name: 'Phòng tự học Hội trường B', type: 'self-study'}
        ],
        plan: {
          width: 800,
          height: 500,
          elements: [
            { id: 'HTB', type: 'room', code: 'HTB', x: 300, y: 150, width: 300, height: 200, label: 'Hội trường B', fill: '#F2E8F0' },
            { id: 'PTH-HTB', type: 'room', code: 'PTH-B', x: 100, y: 150, width: 200, height: 200, label: 'Phòng tự học', fill: '#F2E8F0'},
            { id: 'HL-HTB', type: 'path', d: 'M100 150 H600 V350 H100 V400 H650 V100 H100 Z ', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 1 },
            { id: 'HTB-exit-1', type: 'label', x: 370, y: 140, text: 'Lối thoát', size: 13 },
            { id: 'HTB-exit-1', type: 'label', x: 370, y: 365, text: 'Lối thoát', size: 13 }
          ]
        }
      }
    ],
    roomCount: 2, x: 314, y: 62, width: 134, height: 110, rotate: 2,
    accent: '#004A98', facilities: ['Thang bộ', 'Nhà vệ sinh'],
  },
  {
    id: 'A', shortLabel: 'A', name: 'Hội trường A',
    description: 'Hội trường A',
    floors: [
      {
        number: 1,
        rooms: [],
        plan: {
          width: 900,
          height: 600,
          elements: [
            { id: 'outline', type: 'path', d: 'M40 40 H860 V560 H40 Z', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 3 },
            { id: 'stage', type: 'area', x: 280, y: 70, width: 340, height: 90, label: 'Sân khấu', fill: '#BFDBFE' },
            { id: 'b101', type: 'room', code: 'B101', label: 'Hội trường B', aliases: ['Hội trường tầng 1'], roomType: 'hall', x: 130, y: 205, width: 640, height: 250, fill: '#EFF6FF' },
            { id: 'entrance', type: 'area', x: 330, y: 485, width: 240, height: 45, label: 'Lối vào', fill: '#F2E8F0' },
            { id: 'exit-left', type: 'label', x: 90, y: 500, text: 'Lối thoát', size: 13 },
            { id: 'exit-right', type: 'label', x: 810, y: 500, text: 'Lối thoát', size: 13 },
          ],
        },
      },
    ],
    roomCount: 2, x: 314, y: 62, width: 134, height: 110, rotate: 2,
    accent: '#0058B2', facilities: [],
  },
  {
    id: 'C', shortLabel: 'C', name: 'Tòa C',
    description: 'Khu phòng thực hành và phòng máy.',
    floors: createFloors(4), roomCount: 31, x: 514, y: 82, width: 148, height: 82, rotate: -1,
    accent: '#0066CC', facilities: ['Phòng máy', 'Thang bộ'],
  },
  {
    id: 'D', shortLabel: 'D', name: 'Tòa D',
    description: 'Khu giảng đường trung tâm.',
    floors: createFloors(8), roomCount: 68, x: 76, y: 242, width: 166, height: 102, rotate: 1,
    accent: '#003A78', facilities: ['Thang máy', 'Thang bộ', 'Máy bán nước'],
  },
  {
    id: 'E', shortLabel: 'E', name: 'Tòa E',
    description: 'Khu học tập nhiều tầng và phòng chuyên dụng.',
    floors: [
      {
        number: 1,
        rooms: [
          {code: 'E101', name: 'E101 - Data center', type: 'service', aliases: ['E101', 'Trung tâm dữ liệu']},
          {code: 'E102', name: 'E102 - Phòng y tế', type: 'service', aliases: ['E102', 'Phòng y tế', "yte"]},
          {code: 'E103', name: 'E103', type: 'classroom'},
          {code: 'E104', name: 'E104', type: 'classroom'},
          {code: 'E105', name: 'E105', type: 'classroom'},
          {code: 'E106', name: 'E106', type: 'classroom'},
          {code: 'E107', name: 'E107', type: 'classroom'},
          {code: 'E108', name: 'E108', type: 'classroom'},
          {code: 'E109', name: 'E109', type: 'classroom'},
          {code: 'E110', name: 'E110', type: 'classroom'},
          {code: 'E111', name: 'E111', type: 'classroom'},
          {code: 'E112', name: 'E112', type: 'classroom'},
        ],
        plan: {
          width: 400,
          height: 400,
          elements: [
            { id: 'outline', type: 'path', d: 'M40 40 H860 V560 H40 Z', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 3 },
          ],
        },
      },
      {
        number: 2,
        rooms: [
          {code: 'E201', name: 'E201', type: 'classroom'},
          {code: 'E202', name: 'E202', type: 'classroom'},
          {code: 'E203', name: 'E203', type: 'classroom'},
          {code: 'E204', name: 'E204', type: 'classroom'},
          {code: 'E205', name: 'E205', type: 'classroom'},
          {code: 'E206', name: 'E206', type: 'classroom'},
          {code: 'E207', name: 'E207', type: 'classroom'},
          {code: 'E208', name: 'E208', type: 'classroom'},
          {code: 'E209', name: 'E209', type: 'classroom'},
          {code: 'E210', name: 'E210', type: 'classroom'},
          {code: 'E211', name: 'E211', type: 'classroom'},
          {code: 'E212', name: 'E212', type: 'classroom'},
        ],
        plan: {
          width: 400,
          height: 400,
          elements: [
            { id: 'outline', type: 'path', d: 'M40 40 H860 V560 H40 Z', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 3 },
          ],
        },
      },
      {
        number: 3,
        rooms: [
          {code: 'E301', name: 'E301', type: 'classroom'},
          {code: 'E302', name: 'E302', type: 'classroom'},
          {code: 'E303', name: 'E303', type: 'classroom'},
          {code: 'E304', name: 'E304', type: 'classroom'},
          {code: 'E305', name: 'E305', type: 'classroom'},
          {code: 'E306', name: 'E306', type: 'classroom'},
          {code: 'E307', name: 'E307', type: 'classroom'},
          {code: 'E308', name: 'E308', type: 'classroom'},
          {code: 'E309', name: 'E309', type: 'classroom'},
          {code: 'E310', name: 'E310', type: 'classroom'},
          {code: 'E311', name: 'E311', type: 'classroom'},
          {code: 'E312', name: 'E312', type: 'classroom'},
        ],
        plan: {
          width: 400,
          height: 400,
          elements: [
            { id: 'outline', type: 'path', d: 'M40 40 H860 V560 H40 Z', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 3 },
          ],
        },
      },
    ],
    roomCount: 48, x: 314, y: 62, width: 134, height: 110, rotate: 2,
    accent: '#004A98', facilities: ['Thang bộ', 'Nhà vệ sinh', 'Phòng y tế', 'máy bán nước'],
  },
  {
    id: 'F', shortLabel: 'F', name: 'Tòa F',
    description: 'Khu học tập nhiều tầng và phòng chuyên dụng.',
    floors: [
      {
        number: 1,
        rooms: [
          {code: 'F101', name: 'F101', type: 'classroom'},
          {code: 'F102', name: 'F102', type: 'classroom'},
          {code: 'F103', name: 'F103', type: 'classroom'},
          {code: 'F104', name: 'F104', type: 'classroom'},
          {code: 'F105', name: 'F105', type: 'classroom'},
          {code: 'F106', name: 'F106', type: 'classroom'},
          {code: 'NSV-F1-1', name: 'Nhà vệ sinh (Nam-Nữ)', type: 'tolet', aliases: ['Nhà vệ sinh', 'nvs', 'wc', 'toilet']},
          {code: 'NSV-F1-2', name: 'Nhà vệ sinh (Nam-Nữ)', type: 'tolet', aliases: ['Nhà vệ sinh', 'nvs', 'wc', 'toilet']}
        ],
        plan: {
          width: 900,
          height: 900,
          elements: [
            // Outline
            { id: 'outline', type: 'path', d: 'M280 20 H620 V880 H280 Z', fill: '#FFFFFF', stroke: '#475569', strokeWidth: 3 },
            { id: 'corridor', type: 'path', d: 'M405 70 V294 H530 H405 V645 H530 H405 V830', fill: 'none', stroke: '#E2E8F0', strokeWidth: 45 },
            
            { id: 'F106', type: 'room', code: 'F106', x: 430, y: 70, width: 98, height: 98, label: 'F106', fill: '#F3E8FF' },
            { id: 'F105', type: 'room', code: 'F105', x: 430, y: 170, width: 98, height: 98, label: 'F105', fill: '#F3E8FF' },
            
            { id: 'NSV-F1-1', type: 'room', code: 'NSV-F1-1', x: 480, y: 320, width: 48, height: 48, label: 'WC', fill: '#FEE2E2' },
            { id: 'stairs-north', type: 'area', x: 430, y: 320, width: 48, height: 48, label: 'Cầu thang', fill: '#DBEAFE' },
            { id: 'F104', type: 'room', code: 'F104', x: 430, y: 370, width: 98, height: 98, label: 'F104', fill: '#F3E8FF' },
            { id: 'F103', type: 'room', code: 'F103', x: 430, y: 470, width: 98, height: 98, label: 'F103', fill: '#F3E8FF' },
            { id: 'NSV-F1-2', type: 'room', code: 'NSV-F1-2', x: 480, y: 570, width: 48, height: 48, label: 'WC', fill: '#FEE2E2' },
            { id: 'stair-south', type: 'area', x: 430, y: 570, width: 48, height: 48, label: 'Cầu thang', fill: '#DBEAFE' },
            
            { id: 'F102', type: 'room', code: 'F102', x: 430, y: 670, width: 100, height: 78, label: 'F102', fill: '#F3E8FF' },
            { id: 'F101', type: 'room', code: 'F101', x: 430, y: 750, width: 100, height: 78, label: 'F101', fill: '#F3E8FF' },
          ],
        },
      },
      {
        number: 2,
        rooms: [
          {code: 'F201', name: 'F201', type: 'classroom'},
          {code: 'F202', name: 'F202', type: 'classroom'},
          {code: 'F203', name: 'F203', type: 'classroom'},
          {code: 'F204', name: 'F204', type: 'classroom'},
          {code: 'F205', name: 'F205', type: 'classroom'},
          {code: 'F206', name: 'F206', type: 'classroom'},
          {code: 'F207', name: 'F207', type: 'classroom'},
          {code: 'F208', name: 'F208', type: 'classroom'},
          {code: 'F209', name: 'F209', type: 'classroom'},
          {code: 'F210', name: 'F210', type: 'classroom'},
          {code: 'F211', name: 'F211', type: 'classroom'},
          {code: 'F212', name: 'F212', type: 'classroom'},
        ],
        plan: {
          width: 400,
          height: 400,
          elements: [
            { id: 'outline', type: 'path', d: 'M40 40 H860 V560 H40 Z', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 3 },
          ],
        },
      },
      {
        number: 3,
        rooms: [
          {code: 'F301', name: 'F301', type: 'classroom'},
          {code: 'F302', name: 'F302', type: 'classroom'},
          {code: 'F303', name: 'F303', type: 'classroom'},
          {code: 'F304', name: 'F304', type: 'classroom'},
          {code: 'F305', name: 'F305', type: 'classroom'},
          {code: 'F306', name: 'F306', type: 'classroom'},
          {code: 'F307', name: 'F307', type: 'classroom'},
          {code: 'F308', name: 'F308', type: 'classroom'},
          {code: 'F309', name: 'F309', type: 'classroom'},
          {code: 'F310', name: 'F310', type: 'classroom'},
          {code: 'F311', name: 'F311', type: 'classroom'},
          {code: 'F312', name: 'F312', type: 'classroom'},
        ],
        plan: {
          width: 400,
          height: 400,
          elements: [
            { id: 'outline', type: 'path', d: 'M40 40 H860 V560 H40 Z', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 3 },
          ],
        },
      },
    ],
    roomCount: 30, x: 314, y: 62, width: 134, height: 110, rotate: 2,
    accent: '#004A98', facilities: ['Thang bộ', 'Nhà vệ sinh', 'Phòng y tế', 'máy bán nước'],
  },
  {
    id: 'G', shortLabel: 'G', name: 'Tòa G',
    description: 'Khu phòng học quy mô nhỏ.',
    floors: createFloors(3), roomCount: 22, x: 164, y: 410, width: 144, height: 84, rotate: -2,
    accent: '#0066CC', facilities: ['Thang bộ'],
  },
  {
    id: 'NDH', shortLabel: 'NĐH', name: 'Nhà điều hành',
    description: 'Khu hành chính và các phòng chức năng.',
    floors: createFloors(9), roomCount: 63, x: 402, y: 398, width: 188, height: 98, rotate: 1,
    accent: '#003A78', facilities: ['Thang máy', 'Thang bộ', 'Hành chính'],
  },
];

export function parseRoomCode(input: string): RoomSearchResult | null {
  const normalized = input.trim().toUpperCase().replace(/\s+/g, '').replace('NĐH', 'NDH');
  const match = normalized.match(/^(NDH|[A-G])[-.]?(\d{3,4})$/);
  if (!match) return null;

  const buildingId = match[1] as BuildingId;
  const roomNumber = match[2];
  const floor = roomNumber.length === 3 ? Number(roomNumber.slice(0, 1)) : Number(roomNumber.slice(0, 2));
  if (!Number.isInteger(floor) || floor < 1) return null;

  return {
    buildingId,
    floor,
    roomNumber,
    fullCode: `${buildingId === 'NDH' ? 'NĐH' : buildingId}${roomNumber}`,
  };
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

export function getFloorRooms(floor: CampusFloor): CampusRoom[] {
  const roomsInPlan = floor.plan?.elements
    .filter((element): element is Extract<FloorPlanElement, { type: 'room' }> => element.type === 'room')
    .map(({ code, label, aliases, roomType }) => ({ code, name: label, aliases, type: roomType })) ?? [];

  return [...floor.rooms, ...roomsInPlan.filter((room) => !floor.rooms.some((item) => item.code === room.code))];
}

export function findCampusRoom(input: string): RoomSearchResult | null {
  const roomCode = parseRoomCode(input);
  const query = normalizeSearchText(input);
  if (!query) return roomCode;

  for (const building of CAMPUS_BUILDINGS) {
    for (const floor of building.floors) {
      for (const room of getFloorRooms(floor)) {
        if (roomCode && normalizeSearchText(room.code) === normalizeSearchText(roomCode.fullCode)) {
          return { ...roomCode, roomName: room.name };
        }

        if (roomCode) continue;
        const searchableNames = [room.code, room.name, ...(room.aliases || [])]
          .filter((value): value is string => Boolean(value));
        if (!searchableNames.some((value) => normalizeSearchText(value).includes(query))) continue;

        return {
          buildingId: building.id,
          floor: floor.number,
          roomNumber: room.code,
          fullCode: room.code,
          roomName: room.name,
        };
      }
    }
  }

  return roomCode;
}
