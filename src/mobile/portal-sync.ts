import { Capacitor, registerPlugin } from '@capacitor/core';
import bookmarkletSource from '../logic/Bookmarklet.js?raw';
import { APP_CONFIG } from '../config';
import {
  PORTAL_SYNC_PROTOCOL_VERSION,
  PORTAL_MOBILE_IMPORT_EVENT,
  portalSyncConfig,
  type PortalSyncPacket,
} from '../portal-sync/protocol';

interface NativePortalSyncResult {
  packetJson: string;
}

interface NativePortalSyncPlugin {
  openPortal(options: {
    url: string;
    runnerSource: string;
    runtimeJson: string;
  }): Promise<NativePortalSyncResult>;
}

const NativePortalSync = registerPlugin<NativePortalSyncPlugin>('PortalSync');

function normalizeAcademicYear(value: string) {
  const years = value.match(/\d{2,4}/g);
  if (!years || years.length < 2) return portalSyncConfig.defaults.academicYear;
  return `${years[0].slice(-2)}-${years[1].slice(-2)}`;
}

export function isNativePortalSyncAvailable() {
  return Capacitor.isNativePlatform();
}

export async function openNativePortalSync(academicYear: string, semesterNumber: number) {
  const targetYear = normalizeAcademicYear(academicYear);
  const targetSemester = String(semesterNumber);
  const requestId = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const runtime = {
    transport: 'extension',
    requestId,
    config: {
      URL_DIEM: portalSyncConfig.endpoints.grades,
      URL_LICHTHI: portalSyncConfig.endpoints.exams,
      URL_HOCPHI: portalSyncConfig.endpoints.tuition,
      URL_LOPMO: portalSyncConfig.endpoints.openClasses,
      URL_DKHP: portalSyncConfig.endpoints.registrations,
      TARGET_YEAR: targetYear,
      TARGET_SEM: targetSemester,
      CLASS_TARGET_YEAR: targetYear,
      CLASS_TARGET_SEM: targetSemester,
      REG_TARGET_YEAR: targetYear,
      REG_TARGET_SEM: targetSemester,
      VERSION: APP_CONFIG.BOOKMARKLET_VERSION,
      PROTOCOL_VERSION: PORTAL_SYNC_PROTOCOL_VERSION,
    },
    syncOptions: {
      getGrades: true,
      getTuition: true,
      getExam: true,
      getClass: true,
      classYear: targetYear,
      classSem: targetSemester,
      getReg: true,
      regYear: targetYear,
      regSem: targetSemester,
    },
  };

  const result = await NativePortalSync.openPortal({
    url: portalSyncConfig.portalLoginUrl,
    runnerSource: bookmarkletSource,
    runtimeJson: JSON.stringify(runtime),
  });
  const parsedPacket = JSON.parse(result.packetJson) as PortalSyncPacket;
  const packet: PortalSyncPacket = {
    ...parsedPacket,
    source: 'mobile-app',
    meta: {
      ...parsedPacket.meta,
      source: 'mobile-app',
    },
  };
  window.dispatchEvent(new CustomEvent<PortalSyncPacket>(PORTAL_MOBILE_IMPORT_EVENT, { detail: packet }));
  return packet;
}
