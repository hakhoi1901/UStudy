export type BuildingId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'NDH';

export interface CampusRoom {
  code: string;
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
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
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
}

export interface CampusRoomSuggestion extends RoomSearchResult {
  aliases?: string[];
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
          {code: 'PTH-HTB', name: 'Phòng tự học Hội trường B', type: 'self-study'}
        ],
        plan: {
          width: 800,
          height: 500,
          elements: [
            { id: 'HTB-outline', type: 'path', d: 'M60 70 H740 V410 H60 Z', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 2 },
            { id: 'HTB-lobby', type: 'area', x: 90, y: 305, width: 620, height: 75, label: 'Sảnh / hành lang', fill: '#F8FAFC' },
            { id: 'PTH-HTB', type: 'room', code: 'PTH-HTB', x: 90, y: 100, width: 210, height: 190, label: 'Phòng tự học', fill: '#F2E8F0' },
            { id: 'HTB', type: 'room', code: 'HTB', x: 320, y: 100, width: 390, height: 190, label: 'Hội trường B', fill: '#F2E8F0' },
            { id: 'HTB-stage', type: 'area', x: 330, y: 135, width: 34, height: 120, label: 'Sân khấu', fill: '#DBEAFE' },
            { id: 'HTB-exit-front', type: 'label', x: 525, y: 88, text: 'Lối thoát', size: 13 },
            { id: 'HTB-exit-back', type: 'label', x: 400, y: 406, text: 'Lối thoát', size: 13 },
            { id: 'HTB-exit-right', type: 'label', x: 760, y: 350, text: 'Lối ra tòa C', size: 12 },
          ]
        }
      }
    ],
    roomCount: 2, 
    x: 314, y: 62, width: 134, height: 110, rotate: 2,
    accent: '#004A98', facilities: ['Thang bộ', 'Nhà vệ sinh'],
  },
  {
    id: 'A', shortLabel: 'A', name: 'Hội trường A',
    description: 'Hội trường A',
    floors: [
      {
        number: 1,
        rooms: [
          {code: 'HTA', name: 'Hội trường A', type: 'hall'} // Đã bổ sung phòng bị thiếu
        ],
        plan: {
          width: 900,
          height: 600,
          elements: [
            { id: 'outline', type: 'path', d: 'M40 40 H860 V560 H40 Z', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 3 },
            { id: 'stage', type: 'area', x: 280, y: 70, width: 340, height: 90, label: 'Sân khấu', fill: '#BFDBFE' },
            // Đã sửa lại code và label bị copy-paste nhầm từ Hội trường B
            { id: 'hta-room', type: 'room', code: 'HTA', label: 'Hội trường A', aliases: ['Hội trường tầng 1'], roomType: 'hall', x: 130, y: 205, width: 640, height: 250, fill: '#EFF6FF' },
            { id: 'entrance', type: 'area', x: 330, y: 485, width: 240, height: 45, label: 'Lối vào', fill: '#F2E8F0' },
            { id: 'exit-left', type: 'label', x: 90, y: 500, text: 'Lối thoát', size: 13 },
            { id: 'exit-right', type: 'label', x: 810, y: 500, text: 'Lối thoát', size: 13 },
          ],
        },
      },
    ],
    roomCount: 1, // Đã cập nhật lại số phòng thực tế
    x: 170, y: 62, width: 134, height: 110, rotate: 0, // Đã dời tọa độ x để không bị đè lên tòa B
    accent: '#0058B2', facilities: [],
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
          {code: 'NSV-F1-A', name: 'Nhà vệ sinh (Nam-Nữ)', type: 'tolet', aliases: ['nha ve sinh nvs wc toilet tolet nam nu toa f tang lau 1', 'Nhà vệ sinh nvs wc toilet tolet nam nữ tòa f tầng lầu 1', 'nvs', 'wc', 'toilet']},
          {code: 'NSV-F1-B', name: 'Nhà vệ sinh (Nam-Nữ)', type: 'tolet', aliases: ['nha ve sinh nvs wc toilet tolet nam nu toa f tang lau 1', 'Nhà vệ sinh nvs wc toilet tolet nam nữ tòa f tầng lầu 1', 'nvs', 'wc', 'toilet']}
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
            
            { id: 'NVS-F1-B', type: 'room', code: 'NVS-F1-B', x: 480, y: 320, width: 48, height: 48, label: 'WC', fill: '#FEE2E2' },
            { id: 'stairs-north', type: 'area', x: 430, y: 320, width: 48, height: 48, label: 'Cầu thang', fill: '#DBEAFE' },
            { id: 'F104', type: 'room', code: 'F104', x: 430, y: 370, width: 98, height: 98, label: 'F104', fill: '#F3E8FF' },
            { id: 'F103', type: 'room', code: 'F103', x: 430, y: 470, width: 98, height: 98, label: 'F103', fill: '#F3E8FF' },
            { id: 'NVS-F1-A', type: 'room', code: 'NVS-F1-B', x: 480, y: 570, width: 48, height: 48, label: 'WC', fill: '#FEE2E2' },
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
    floors: [
      {
        number: 1,
        rooms: [
          {code: 'NQKH', name: 'Hội quán khoa học - Hầm nhà điều hành', type: 'service', aliases: ['Hội quán sinh viên', 'HQKH']},
          {code: 'NSV-NĐH1-A', name: 'Nhà vệ sinh (Nam)', type: 'tolet', aliases: ['nha ve sinh nvs wc toilet tolet nam ndh nha dieu hanh tang lau 1', 'Nhà vệ sinh nvs wc toilet tolet nam nhà điều hành nđh ndh tầng lầu 1', 'nvs', 'wc', 'toilet']},
          {code: 'NSV-NĐH1-B', name: 'Nhà vệ sinh (Nữ)', type: 'tolet', aliases: ['nha ve sinh nvs wc toilet tolet nu ndh nha dieu hanh tang lau 1', 'Nhà vệ sinh nvs wc toilet tolet nữ nhà điều hành nđh ndh tầng lầu 1', 'nvs', 'wc', 'toilet']}
        ],
        plan: {
          width: 1000,
          height: 1000,
          elements: [
            { id: 'NDH1-outline', type: 'path', d: 'M40 40 H460 V380 H510 V620 H460 V960 H40 Z', fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 2 },
            { id: 'NDH1-main-hallway', type: 'area', x: 210, y: 50, width: 80, height: 900, label: 'Hành lang', fill: '#F8FAFC' },

            { id: 'NDH101', type: 'room', code: 'NDH101', x: 50, y: 50, width: 150, height: 150, label: 'NĐH 101', fill: '#EFF6FF' },
            { id: 'NDH102', type: 'room', code: 'NDH102', x: 50, y: 200, width: 150, height: 150, label: 'NĐH 102', fill: '#EFF6FF' },
            { id: 'NDH103', type: 'room', code: 'NDH103', x: 50, y: 350, width: 150, height: 300, label: 'NĐH 103', fill: '#EFF6FF' },
            { id: 'NDH104', type: 'room', code: 'NDH104', x: 50, y: 650, width: 150, height: 150, label: 'NĐH 104', fill: '#EFF6FF' },
            { id: 'NDH105', type: 'room', code: 'NDH105', x: 50, y: 800, width: 150, height: 150, label: 'NĐH 105', fill: '#EFF6FF' },

            { id: 'NVS-F1-B', type: 'room', code: 'NVS-F1-B', x: 400, y: 50, width: 50, height: 80, label: 'WC', fill: '#FEE2E2' },
            { id: 'NDH1-top-hallway', type: 'area', x: 300, y: 50, width: 100, height: 30, label: 'Hành lang nhỏ', fill: '#F8FAFC' },
            { id: 'NDH1-stair', type: 'area', x: 300, y: 80, width: 100, height: 50, label: 'Thang bộ', fill: '#DBEAFE' },

            { id: 'NDH106', type: 'room', code: 'NDH106', x: 300, y: 130, width: 150, height: 130, label: 'NĐH 106', fill: '#EFF6FF' },
            { id: 'NDH107', type: 'room', code: 'NDH107', x: 300, y: 260, width: 150, height: 130, label: 'NĐH 107', fill: '#EFF6FF' },

            { id: 'NVS-F1-B', type: 'room', code: 'NVS-F1-B', x: 450, y: 390, width: 50, height: 50, label: 'WC', fill: '#FEE2E2' },
            { id: 'NDH1-elevator', type: 'area', x: 300, y: 390, width: 150, height: 50, label: 'Thang máy', fill: '#E0F2FE' },
            { id: 'NDH1-side-hallway', type: 'area', x: 290, y: 450, width: 220, height: 100, label: 'Hành lang nhỏ', fill: '#F8FAFC' },
            { id: 'NDH1-stair', type: 'area', x: 300, y: 560, width: 150, height: 50, label: 'Thang bộ', fill: '#DBEAFE' },
            { id: 'NVS-F1-B', type: 'room', code: 'NVS-F1-B', x: 450, y: 560, width: 50, height: 50, label: 'WC', fill: '#FEE2E2' },

            { id: 'NDH108', type: 'room', code: 'NDH108', x: 300, y: 610, width: 150, height: 130, label: 'NĐH 108', fill: '#EFF6FF' },
            { id: 'NDH109', type: 'room', code: 'NDH109', x: 300, y: 740, width: 150, height: 130, label: 'NĐH 109', fill: '#EFF6FF' },

            { id: 'NDH1-stair', type: 'area', x: 300, y: 870, width: 100, height: 50, label: 'Thang bộ', fill: '#DBEAFE' },            
            { id: 'NDH1-left-hallway', type: 'area', x: 300, y: 920, width: 100, height: 30, label: 'Hành lang nhỏ', fill: '#F8FAFC' },
            { id: 'NVS-F1-B', type: 'room', code: 'NVS-F1-B', x: 400, y: 870, width: 50, height: 80, label: 'WC', fill: '#FEE2E2' },
          ],
        },
      },
      {
        number: 2,
        rooms: [
          {code: 'PĐT', name: 'Phòng đào tạo - NĐH 2.4', type: 'office', aliases: ['pdt', 'pđt', 'phong dao tao', 'Phòng đào tạo', 'bảng điểm', 'bang diem', '2.4', 'ndh24'], description: 'Tiếp nhận và hỗ trợ các thủ tục liên quan đến đào tạo.',
  phone: '(028) 0000 0000',
  email: 'pdt_khtn@hcmus.edu.vn',
  website: 'https://hcmus.edu.vn/phong-dao-tao/',
  openingHours: 'Thứ Hai - Thứ Sáu, 08:00 - 16:30',},
          {code: 'PCTSV', name: 'Phòng công tác sinh viên - NĐH 2.8', type: 'office', aliases: ['pctsv', 'phong cong tac sinh vien', 'Phòng công tác sinh viên', 'drl', 'đrl', 'diem ren luyen', 'điểm rèn luyện', 'xác nhận sinh viên', 'xac nhan sinh vien', '2.8', 'ndh28']},
          {code: 'NSV-NĐH2-A', name: 'Nhà vệ sinh (Nam)', type: 'tolet', aliases: ['nha ve sinh nvs wc toilet tolet nam ndh nha dieu hanh tang lau 2', 'Nhà vệ sinh nvs wc toilet tolet nam nhà điều hành nđh tầng lầu 2', 'nvs nam ndh', 'wc', 'toilet']},
          {code: 'NSV-NĐH2-B', name: 'Nhà vệ sinh (Nữ)', type: 'tolet', aliases: ['nha ve sinh nvs wc toilet tolet nu ndh nha dieu hanh tang lau 2', 'Nhà vệ sinh nvs wc toilet tolet nữ nhà điều hành nđh tầng lầu 2', 'nvs nu ndh', 'wc', 'toilet']},
        ],
        plan: {
          width: 900,
          height: 900,
          elements: [],
        },
      },
    ],
    roomCount: 30, x: 314, y: 62, width: 134, height: 110, rotate: 2,
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

function getSearchTokens(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function getMatchScore(token: string, value: string): number | null {
  if (value === token) return 0;
  if (value.startsWith(token)) return 2;
  if (value.includes(token)) return 5;
  return null;
}

function hasTokensInOrder(value: string, queryTokens: string[]): boolean {
  const valueTokens = getSearchTokens(value);
  let queryIndex = 0;

  for (const token of valueTokens) {
    if (token.includes(queryTokens[queryIndex])) queryIndex += 1;
    if (queryIndex === queryTokens.length) return true;
  }

  return false;
}

export function getFloorRooms(floor: CampusFloor): CampusRoom[] {
  return floor.rooms;
}

export function searchCampusRooms(input: string, limit = 6): CampusRoomSuggestion[] {
  const query = normalizeSearchText(input);
  const queryTokens = getSearchTokens(input);
  if (!query || queryTokens.length === 0) return [];

  const matches: Array<CampusRoomSuggestion & { score: number }> = [];

  for (const building of CAMPUS_BUILDINGS) {
    for (const floor of building.floors) {
      for (const room of getFloorRooms(floor)) {
        const code = normalizeSearchText(room.code);
        const names = [room.name, room.description, ...(room.aliases || [])]
          .filter((value): value is string => Boolean(value));
        const roomValues = [room.code, ...names];
        const buildingValues = [
          building.id,
          building.shortLabel,
          building.name,
        ];
        const searchableValues = [
          ...roomValues,
          ...buildingValues,
        ];
        const normalizedValues = searchableValues.map(normalizeSearchText);
        const matchesAllTokens = queryTokens.every((token) => normalizedValues.some((value) => value.includes(token)));
        if (!matchesAllTokens) continue;

        const tokenScore = queryTokens.reduce((total, token) => {
          const bestMatch = normalizedValues
            .map((value) => getMatchScore(token, value))
            .filter((score): score is number => score !== null)
            .reduce((best, score) => Math.min(best, score), Number.POSITIVE_INFINITY);
          return total + bestMatch;
        }, 0);
        const hasExactRoomPhrase = roomValues.some((value) => normalizeSearchText(value) === query);
        const hasOrderedRoomPhrase = roomValues.some((value) => hasTokensInOrder(value, queryTokens));
        const score = tokenScore
          + (hasExactRoomPhrase ? -20 : 0)
          + (hasOrderedRoomPhrase ? -6 : 0)
          + (code.startsWith(query) ? -10 : 0);
        matches.push({
          buildingId: building.id,
          floor: floor.number,
          roomNumber: room.code,
          fullCode: room.code,
          roomName: room.name,
          description: room.description,
          phone: room.phone,
          email: room.email,
          website: room.website,
          openingHours: room.openingHours,
          aliases: room.aliases,
          score,
        });
      }
    }
  }

  return matches
    .sort((left, right) => left.score - right.score || left.fullCode.localeCompare(right.fullCode))
    .slice(0, limit)
    .map(({ score: _score, ...room }) => room);
}

export function findCampusRoom(input: string): RoomSearchResult | null {
  const roomCode = parseRoomCode(input);
  return searchCampusRooms(input, 1)[0] ?? roomCode;
}
