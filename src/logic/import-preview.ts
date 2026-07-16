export type ImportChangeStatus = 'add' | 'update' | 'remove' | 'unchanged';

type ImportCollection = 'grades' | 'registrations' | 'courses' | 'exams' | 'tuition';

export interface RawImportChange {
  id: string;
  collection: ImportCollection;
  index: number;
  label: string;
  status: ImportChangeStatus;
  courseId?: string;
  courseName?: string;
}

const COLLECTION_LABELS: Record<ImportCollection, string> = {
  grades: 'Bảng điểm',
  registrations: 'Kết quả đăng ký',
  courses: 'Danh sách lớp mở',
  exams: 'Lịch thi',
  tuition: 'Học phí',
};

const COLLECTIONS: ImportCollection[] = ['grades', 'registrations', 'courses', 'exams', 'tuition'];

function normalizeIdentityPart(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('vi-VN');
}

function normalizeSemester(value: unknown): string {
  const normalized = normalizeIdentityPart(value).replace(/\s+/g, '').replace('/HK', '/');
  const match = normalized.match(/^(\d{2}|\d{4})-(\d{2}|\d{4})\/(\d)$/);
  if (!match) return normalized;
  const shortYear = (year: string) => year.length === 4 ? year.slice(-2) : year;
  return `${shortYear(match[1])}-${shortYear(match[2])}/${match[3]}`;
}

function registrationBaseKey(value: any): string {
  return [value?.id, value?.classGroup, value?.courseType].map(normalizeIdentityPart).join('|');
}

function registrationKey(value: any): string {
  return `${normalizeSemester(value?.semester)}|${registrationBaseKey(value)}`;
}

function dedupeRegistrations(values: any[]): any[] {
  const basesWithSemester = new Set(
    values.filter((value) => normalizeSemester(value?.semester)).map(registrationBaseKey),
  );
  const seen = new Set<string>();
  const result: any[] = [];
  for (const value of values) {
    const semester = normalizeSemester(value?.semester);
    const baseKey = registrationBaseKey(value);
    if (!semester && basesWithSemester.has(baseKey)) continue;
    const key = registrationKey(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function valueKey(collection: ImportCollection, value: any, index: number): string {
  switch (collection) {
    case 'grades':
      return [value?.semester, value?.id, value?.class, value?.type].map((part) => String(part ?? '').trim()).join('|') || `grade-${index}`;
    case 'registrations':
      return registrationKey(value) || `registration-${index}`;
    case 'courses':
      return [value?.id, value?.className].map((part) => String(part ?? '').trim()).join('|') || `course-${index}`;
    default:
      return collection;
  }
}

function removalChangeId(collection: ImportCollection, key: string): string {
  return `${collection}:remove:${encodeURIComponent(key)}`;
}

function valueLabel(collection: ImportCollection, value: any): string {
  if (collection === 'grades') return `${value?.id || 'Không rõ mã'} - ${value?.name || 'Không rõ tên'}${value?.semester ? ` (${value.semester})` : ''}`;
  if (collection === 'registrations') return `${value?.id || 'Không rõ mã'} - ${value?.name || 'Không rõ tên'}${value?.semester ? ` (${value.semester})` : ''}`;
  if (collection === 'courses') return `${value?.id || 'Không rõ mã'} - ${value?.name || 'Không rõ tên'}${value?.className ? ` (${value.className})` : ''}`;
  return COLLECTION_LABELS[collection];
}

function isSameValue(first: unknown, second: unknown): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function buildRawImportPreview(incoming: any, current: any): RawImportChange[] {
  const changes: RawImportChange[] = [];
  for (const collection of COLLECTIONS) {
    const incomingValue = incoming?.[collection];
    if (collection === 'exams' || collection === 'tuition') {
      if (incomingValue === undefined) continue;
      const currentValue = current?.[collection];
      changes.push({ id: `${collection}:0`, collection, index: 0, label: valueLabel(collection, incomingValue), status: currentValue === undefined ? 'add' : isSameValue(currentValue, incomingValue) ? 'unchanged' : 'update' });
      continue;
    }
    if (!Array.isArray(incomingValue)) continue;
    const currentValues = Array.isArray(current?.[collection]) ? current[collection] : [];
    const currentByKey = new Map(currentValues.map((value: any, index: number) => [valueKey(collection, value, index), value]));
    const legacyRegistrationsByBase = collection === 'registrations'
      ? new Map(currentValues
        .filter((value: any) => !normalizeSemester(value?.semester))
        .map((value: any) => [registrationBaseKey(value), value]))
      : null;
    incomingValue.forEach((value: any, index: number) => {
      const key = valueKey(collection, value, index);
      const currentValue = currentByKey.get(key)
        ?? (collection === 'registrations' ? legacyRegistrationsByBase?.get(registrationBaseKey(value)) : undefined);
      const hasRegistrationDuplicates = collection === 'registrations' && currentValues.filter((currentValue: any) => (
        valueKey(collection, currentValue, 0) === key
        || (!normalizeSemester(currentValue?.semester) && registrationBaseKey(currentValue) === registrationBaseKey(value))
      )).length > 1;
      const courseId = String(value?.id ?? '').trim();
      const courseName = String(value?.name ?? '').trim();
      changes.push({
        id: `${collection}:${index}`,
        collection,
        index,
        label: valueLabel(collection, value),
        status: currentValue === undefined ? 'add' : !hasRegistrationDuplicates && isSameValue(currentValue, value) ? 'unchanged' : 'update',
        ...(courseId ? { courseId } : {}),
        ...(courseName ? { courseName } : {}),
      });
    });

    // Only reconcile deletions from a non-empty snapshot. An empty array can
    // also mean the Portal parser failed, so it must never erase local data.
    if (incomingValue.length === 0 || (collection !== 'grades' && collection !== 'registrations' && collection !== 'courses')) continue;

    const incomingKeys = new Set(incomingValue.map((value: any, index: number) => valueKey(collection, value, index)));
    const incomingRegistrationBases = collection === 'registrations'
      ? new Set(incomingValue.map(registrationBaseKey))
      : null;
    const incomingRegistrationSemesters = collection === 'registrations'
      ? new Set(incomingValue.map((value: any) => normalizeSemester(value?.semester)).filter(Boolean))
      : null;

    const queuedRemovalKeys = new Set<string>();
    currentValues.forEach((value: any, index: number) => {
      const key = valueKey(collection, value, index);
      const semester = collection === 'registrations' ? normalizeSemester(value?.semester) : '';
      const existsInIncoming = incomingKeys.has(key)
        || (collection === 'registrations'
          && !semester
          && incomingRegistrationBases?.has(registrationBaseKey(value)));
      const isInReconciledScope = collection !== 'registrations'
        || Boolean(semester && incomingRegistrationSemesters?.has(semester));
      if (existsInIncoming || !isInReconciledScope || queuedRemovalKeys.has(key)) return;
      queuedRemovalKeys.add(key);

      const courseId = String(value?.id ?? '').trim();
      const courseName = String(value?.name ?? '').trim();
      changes.push({
        id: removalChangeId(collection, key),
        collection,
        index,
        label: valueLabel(collection, value),
        status: 'remove',
        ...(courseId ? { courseId } : {}),
        ...(courseName ? { courseName } : {}),
      });
    });
  }
  return changes;
}

export function mergeSelectedRawImport(incoming: any, current: any, selectedIds: readonly string[]): any {
  const selected = new Set(selectedIds);
  const next = { ...(current || {}) };
  const collectionNames = new Set<string>(COLLECTIONS);

  // Preserve future scraper fields even before the import UI knows how to
  // render them. Known collections still follow the user's item selection.
  for (const [key, value] of Object.entries(incoming || {})) {
    if (key !== 'name' && !collectionNames.has(key)) next[key] = value;
  }
  for (const collection of COLLECTIONS) {
    const incomingValue = incoming?.[collection];
    if (incomingValue === undefined) continue;
    if (collection === 'exams' || collection === 'tuition') {
      if (selected.has(`${collection}:0`)) next[collection] = incomingValue;
      continue;
    }
    if (!Array.isArray(incomingValue)) continue;
    const currentCollection = Array.isArray(current?.[collection]) ? current[collection] : [];
    const retainedCurrentCollection = currentCollection.filter((value: any, index: number) => (
      !selected.has(removalChangeId(collection, valueKey(collection, value, index)))
    ));
    const merged = collection === 'registrations' ? dedupeRegistrations(retainedCurrentCollection) : [...retainedCurrentCollection];
    const indexesByKey = new Map(merged.map((value: any, index: number) => [valueKey(collection, value, index), index]));
    const legacyRegistrationIndexes = collection === 'registrations'
      ? new Map(merged
        .map((value: any, index: number) => ({ value, index }))
        .filter(({ value }) => !normalizeSemester(value?.semester))
        .map(({ value, index }) => [registrationBaseKey(value), index]))
      : null;
    incomingValue.forEach((value: any, index: number) => {
      if (!selected.has(`${collection}:${index}`)) return;
      const key = valueKey(collection, value, index);
      const currentIndex = indexesByKey.get(key)
        ?? (collection === 'registrations' ? legacyRegistrationIndexes?.get(registrationBaseKey(value)) : undefined);
      if (currentIndex === undefined) {
        indexesByKey.set(key, merged.length);
        merged.push(value);
      } else {
        merged[currentIndex] = value;
        indexesByKey.set(key, currentIndex);
      }
    });
    next[collection] = merged;
  }
  return { ...next, name: incoming?.name || next.name };
}

export function getImportCollectionLabel(collection: ImportCollection): string {
  return COLLECTION_LABELS[collection];
}
