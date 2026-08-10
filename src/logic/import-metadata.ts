export type PortalDataSource = 'grades' | 'registrations' | 'exams' | 'courses' | 'tuition';

export interface ImportMetadata {
  version?: string;
  scrapedAt?: string;
  params?: Record<string, unknown>;
  sourceUpdatedAt?: Partial<Record<PortalDataSource, string>>;
  [key: string]: unknown;
}

export function mergeImportMetadata(
  current: ImportMetadata | null | undefined,
  incoming: ImportMetadata | null | undefined,
  updatedSources: Iterable<PortalDataSource>,
): ImportMetadata | null {
  if (!current && !incoming) return null;

  const syncedAt = incoming?.scrapedAt || new Date().toISOString();
  const sourceUpdatedAt = { ...(current?.sourceUpdatedAt || {}) };
  for (const source of updatedSources) sourceUpdatedAt[source] = syncedAt;

  const params = { ...(current?.params || {}) };
  for (const [key, value] of Object.entries(incoming?.params || {})) {
    if (value !== null && value !== undefined) params[key] = value;
  }

  return {
    ...(current || {}),
    ...(incoming || {}),
    params,
    sourceUpdatedAt,
    scrapedAt: syncedAt,
  };
}
