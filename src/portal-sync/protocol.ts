import portalSyncConfig from './config.json';

export const PORTAL_SYNC_PROTOCOL_VERSION = portalSyncConfig.protocolVersion;
export const PORTAL_SCRAPER_VERSION = portalSyncConfig.scraperVersion;

export const PORTAL_EXTENSION_BRIDGE_REQUEST = 'USTUDY_EXTENSION_BRIDGE_REQUEST';
export const PORTAL_EXTENSION_BRIDGE_RESPONSE = 'USTUDY_EXTENSION_BRIDGE_RESPONSE';
export const PORTAL_EXTENSION_PENDING_AVAILABLE = 'USTUDY_EXTENSION_PENDING_AVAILABLE';
export const PORTAL_EXTENSION_READY = 'USTUDY_EXTENSION_READY';
export const PORTAL_EXTENSION_READY_EVENT = 'ustudy:extension-ready';
export const PORTAL_EXTENSION_MARKER_ATTRIBUTE = 'data-ustudy-extension-version';

export type PortalSyncMode = 'manual' | 'ask' | 'auto';
export type PortalImportTransport = 'bookmarklet' | 'extension';
export type PortalSyncSource = 'grades' | 'registrations' | 'exams' | 'courses' | 'tuition';

export interface PortalSyncSources {
  grades: true;
  registrations: boolean;
  exams: boolean;
  courses: boolean;
  tuition: boolean;
}

export interface PortalExtensionSettings {
  onboardingComplete: boolean;
  mode: PortalSyncMode;
  sources: PortalSyncSources;
  academicYear: string;
  semester: string;
  cooldownMinutes: number;
  openAppAfterSync: boolean;
  autoSuggestionDismissed: boolean;
}

export interface PortalExtensionStats {
  successfulSyncs: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export interface PortalSyncPacket {
  protocolVersion?: string;
  scraperVersion?: string;
  source?: PortalImportTransport;
  version?: string;
  raw: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface PendingPortalImport {
  id: string;
  createdAt: string;
  packet: PortalSyncPacket;
}

export interface PortalExtensionState {
  installed: boolean;
  extensionVersion: string;
  settings: PortalExtensionSettings;
  stats: PortalExtensionStats;
  pendingImport: Pick<PendingPortalImport, 'id' | 'createdAt'> | null;
}

export interface PortalBridgeResponse<T = unknown> {
  type: typeof PORTAL_EXTENSION_BRIDGE_RESPONSE;
  requestId: string;
  ok: boolean;
  data?: T;
  error?: string;
}

export function isPortalSyncPacket(value: unknown): value is PortalSyncPacket {
  if (!value || typeof value !== 'object') return false;
  const packet = value as Partial<PortalSyncPacket>;
  if (!packet.raw || typeof packet.raw !== 'object' || Array.isArray(packet.raw)) return false;
  return Array.isArray((packet.raw as { grades?: unknown }).grades);
}

export function isSupportedPortalOrigin(origin: string): boolean {
  try {
    return new RegExp(portalSyncConfig.portalHostnamePattern, 'i').test(new URL(origin).hostname);
  } catch {
    return false;
  }
}

export { portalSyncConfig };
