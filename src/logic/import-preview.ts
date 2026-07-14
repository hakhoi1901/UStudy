export type ImportChangeStatus = 'add' | 'update' | 'unchanged';

type ImportCollection = 'grades' | 'registrations' | 'courses' | 'exams' | 'tuition';

export interface RawImportChange {
  id: string;
  collection: ImportCollection;
  index: number;
  label: string;
  status: ImportChangeStatus;
}

const COLLECTION_LABELS: Record<ImportCollection, string> = {
  grades: 'Bảng điểm',
  registrations: 'Kết quả đăng ký',
  courses: 'Danh sách lớp mở',
  exams: 'Lịch thi',
  tuition: 'Học phí',
};

const COLLECTIONS: ImportCollection[] = ['grades', 'registrations', 'courses', 'exams', 'tuition'];

function valueKey(collection: ImportCollection, value: any, index: number): string {
  switch (collection) {
    case 'grades':
      return [value?.semester, value?.id, value?.class, value?.type].map((part) => String(part ?? '').trim()).join('|') || `grade-${index}`;
    case 'registrations':
      return [value?.semester, value?.id, value?.classGroup, value?.courseType].map((part) => String(part ?? '').trim()).join('|') || `registration-${index}`;
    case 'courses':
      return [value?.id, value?.className].map((part) => String(part ?? '').trim()).join('|') || `course-${index}`;
    default:
      return collection;
  }
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
    incomingValue.forEach((value: any, index: number) => {
      const key = valueKey(collection, value, index);
      const currentValue = currentByKey.get(key);
      changes.push({ id: `${collection}:${index}`, collection, index, label: valueLabel(collection, value), status: currentValue === undefined ? 'add' : isSameValue(currentValue, value) ? 'unchanged' : 'update' });
    });
  }
  return changes;
}

export function mergeSelectedRawImport(incoming: any, current: any, selectedIds: readonly string[]): any {
  const selected = new Set(selectedIds);
  const next = { ...(current || {}) };
  for (const collection of COLLECTIONS) {
    const incomingValue = incoming?.[collection];
    if (incomingValue === undefined) continue;
    if (collection === 'exams' || collection === 'tuition') {
      if (selected.has(`${collection}:0`)) next[collection] = incomingValue;
      continue;
    }
    if (!Array.isArray(incomingValue)) continue;
    const merged = Array.isArray(current?.[collection]) ? [...current[collection]] : [];
    const indexesByKey = new Map(merged.map((value: any, index: number) => [valueKey(collection, value, index), index]));
    incomingValue.forEach((value: any, index: number) => {
      if (!selected.has(`${collection}:${index}`)) return;
      const key = valueKey(collection, value, index);
      const currentIndex = indexesByKey.get(key);
      if (currentIndex === undefined) {
        indexesByKey.set(key, merged.length);
        merged.push(value);
      } else {
        merged[currentIndex] = value;
      }
    });
    next[collection] = merged;
  }
  return { ...next, name: incoming?.name || next.name };
}

export function getImportCollectionLabel(collection: ImportCollection): string {
  return COLLECTION_LABELS[collection];
}
