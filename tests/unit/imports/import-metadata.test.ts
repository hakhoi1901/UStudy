import { describe, expect, it, vi } from 'vitest';

import { mergeImportMetadata } from '../../../src/logic/import-metadata';

describe('import metadata', () => {
  it('updates timestamps only for sources included in the import', () => {
    const merged = mergeImportMetadata(
      {
        scrapedAt: '2026-01-01T00:00:00.000Z',
        params: { registration: { year: '2025-2026', sem: 3 }, keep: true },
        sourceUpdatedAt: { grades: '2026-01-01T00:00:00.000Z' },
      },
      {
        scrapedAt: '2026-08-24T00:00:00.000Z',
        params: { registration: { year: '2026-2027', sem: 1 }, keep: null },
      },
      ['registrations'],
    );

    expect(merged?.sourceUpdatedAt).toEqual({
      grades: '2026-01-01T00:00:00.000Z',
      registrations: '2026-08-24T00:00:00.000Z',
    });
    expect(merged?.params).toEqual({
      registration: { year: '2026-2027', sem: 1 },
      keep: true,
    });
  });

  it('uses the current time when the incoming package has no scrapedAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-24T12:00:00.000Z'));

    expect(mergeImportMetadata(null, {}, ['grades'])?.sourceUpdatedAt?.grades)
      .toBe('2026-08-24T12:00:00.000Z');

    vi.useRealTimers();
  });
});
