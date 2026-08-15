export type CampusUnitType =
    | 'faculty'
    | 'department'
    | 'office'
    | 'center'
    | 'student-service'
    | 'library'
    | 'other';

export type CampusUnitVerificationStatus = 'verified' | 'partial' | 'pending';

export type CampusUnitServiceDetail =
    | { type: 'paragraph'; text: string }
    | { type: 'list'; title?: string; items: string[] }
    | { type: 'notice'; tone: 'info' | 'warning'; title: string; text: string }
    | { type: 'link'; label: string; href: string };

export interface CampusUnitService {
    id: string;
    name: string;
    details: CampusUnitServiceDetail[];
}

export interface CampusUnitLocation {
    /** Ready for a stable CampusRoom identifier when the map data provides one. */
    campusRoomId?: string;
    buildingId: string;
    floor?: number;
    roomCode?: string;
    note?: string;
}

export interface CampusUnit {
    id: string;
    type: CampusUnitType;
    name: string;
    shortName?: string;
    aliases?: string[];
    parentId?: string;
    summary: string;
    description?: string;
    services?: CampusUnitService[];
    phones?: string[];
    emails?: string[];
    websites?: string[];
    openingHours?: string;
    locations: CampusUnitLocation[];
    sourceUrl?: string;
    lastVerifiedAt?: string;
    verificationStatus?: CampusUnitVerificationStatus;
}
