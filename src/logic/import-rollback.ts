import { CACHE_POPULATED_EVENT } from '../context/CryptoContext';
import {
  markImportRollbackSourcesRestored,
  populateSecureCache,
  readFromStorage,
  readImportRollbackValue,
  saveSecure,
} from '../helpers/localStorage/save';
import { processRawData } from './dataProcessor';
import type { ImportMetadata, PortalDataSource } from './import-metadata';

const EMPTY_SOURCE_DATA: Record<PortalDataSource, unknown> = {
  grades: [],
  registrations: [],
  exams: { midterm: [], final: [] },
  courses: [],
  tuition: {},
};

const PARAM_KEY_BY_SOURCE: Partial<Record<PortalDataSource, string>> = {
  registrations: 'registration',
  exams: 'exam',
  courses: 'class',
  tuition: 'tuition',
};

export async function restoreImportSources(sources: readonly PortalDataSource[], cryptoKey: CryptoKey): Promise<void> {
  if (sources.length === 0) return;

  const currentRaw = readFromStorage<any>('raw_student_db', {}) || {};
  const previousRaw = await readImportRollbackValue<any>('raw_student_db', cryptoKey, null);
  const currentMeta = readFromStorage<ImportMetadata | null>('import_meta', null);
  const previousMeta = await readImportRollbackValue<ImportMetadata | null>('import_meta', cryptoKey, null);

  const nextRaw = {
    name: currentRaw.name || previousRaw?.name || '',
    grades: currentRaw.grades || [],
    exams: currentRaw.exams || { midterm: [], final: [] },
    tuition: currentRaw.tuition || {},
    registrations: currentRaw.registrations || [],
    courses: currentRaw.courses || [],
  };

  for (const source of sources) {
    nextRaw[source] = previousRaw?.[source] ?? EMPTY_SOURCE_DATA[source];
  }

  const nextParams = { ...(currentMeta?.params || {}) };
  const nextSourceUpdatedAt = { ...(currentMeta?.sourceUpdatedAt || {}) };
  for (const source of sources) {
    const paramKey = PARAM_KEY_BY_SOURCE[source];
    if (paramKey) {
      const previousParam = previousMeta?.params?.[paramKey];
      if (previousParam === undefined) delete nextParams[paramKey];
      else nextParams[paramKey] = previousParam;
    }

    const hadPreviousSource = source === 'grades'
      ? Boolean(previousRaw?.grades)
      : Boolean(paramKey && previousMeta?.params?.[paramKey]);
    const previousUpdatedAt = previousMeta?.sourceUpdatedAt?.[source]
      || (hadPreviousSource ? previousMeta?.scrapedAt : undefined);
    if (previousUpdatedAt === undefined) delete nextSourceUpdatedAt[source];
    else nextSourceUpdatedAt[source] = previousUpdatedAt;
  }

  const nextMeta: ImportMetadata | null = currentMeta || previousMeta
    ? {
        ...(currentMeta || previousMeta || {}),
        params: nextParams,
        sourceUpdatedAt: nextSourceUpdatedAt,
      }
    : null;

  const { student, courses } = processRawData(nextRaw);
  await Promise.all([
    saveSecure('raw_student_db', nextRaw, cryptoKey),
    saveSecure('student_db_full', student, cryptoKey),
    saveSecure('course_db_offline', courses, cryptoKey),
    nextMeta ? saveSecure('import_meta', nextMeta, cryptoKey) : Promise.resolve(),
  ]);

  populateSecureCache('raw_student_db', nextRaw);
  populateSecureCache('student_db_full', student);
  populateSecureCache('course_db_offline', courses);
  if (nextMeta) populateSecureCache('import_meta', nextMeta);
  markImportRollbackSourcesRestored(sources);
  window.postMessage({ type: CACHE_POPULATED_EVENT }, '*');
}
