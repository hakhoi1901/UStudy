import { describe, expect, it } from 'vitest';

import { buildRawImportPreview, mergeSelectedRawImport } from '../../../src/logic/import-preview';

describe('raw import preview', () => {
  it('deduplicates legacy and semester-aware registration records', () => {
    const current = {
      registrations: [
        { id: 'CSC10009', name: 'Old name', classGroup: '24CTT1', courseType: 'LT', schedule: 'T2(1-4)' },
        { id: 'CSC10009', name: 'Old name', classGroup: '24CTT1', courseType: 'LT', schedule: 'T2(1-4)' },
      ],
    };
    const incoming = {
      registrations: [
        { id: 'CSC10009', name: 'Database', classGroup: '24CTT1', courseType: 'LT', schedule: 'T2(1-4)', semester: '26-27/1' },
      ],
    };
    const preview = buildRawImportPreview(incoming, current);
    const merged = mergeSelectedRawImport(incoming, current, preview.map((change) => change.id));

    expect(preview[0].status).toBe('update');
    expect(merged.registrations).toEqual(incoming.registrations);
  });

  it('never interprets an empty scraped collection as deletion', () => {
    const current = {
      grades: [{ id: 'CSC10001', name: 'Intro', semester: '25-26/1', class: 'A', type: 'LT' }],
      registrations: [{ id: 'CSC10009', classGroup: 'A', courseType: 'LT', semester: '26-27/1' }],
      courses: [{ id: 'CSC10007', className: 'A' }],
    };
    const incoming = { grades: [], registrations: [], courses: [] };

    expect(buildRawImportPreview(incoming, current)).toEqual([]);
    expect(mergeSelectedRawImport(incoming, current, [])).toMatchObject(current);
  });

  it('replaces old registrations when a verified new-period snapshot is empty', () => {
    const current = {
      registrations: [
        { id: 'CSC10009', classGroup: 'A', courseType: 'LT', semester: '25-26/3' },
      ],
    };
    const incoming = { registrations: [] };
    const preview = buildRawImportPreview(incoming, current, {
      incomingMeta: { params: { registration: { year: '26-27', sem: '1', semester: '26-27/1', snapshotComplete: true } } },
      currentMeta: { params: { registration: { year: '25-26', sem: '3', semester: '25-26/3' } } },
    });
    const removalIds = preview.filter((change) => change.status === 'remove').map((change) => change.id);

    expect(removalIds).toHaveLength(1);
    expect(mergeSelectedRawImport(incoming, current, removalIds).registrations).toEqual([]);
  });

  it('keeps registrations when an empty snapshot was not verified by the scraper', () => {
    const current = {
      registrations: [
        { id: 'CSC10009', classGroup: 'A', courseType: 'LT', semester: '25-26/3' },
      ],
    };

    const preview = buildRawImportPreview({ registrations: [] }, current, {
      incomingMeta: { params: { registration: { year: '26-27', sem: '1', semester: '26-27/1' } } },
    });

    expect(preview).toEqual([]);
  });

  it('updates an empty registration period once without repeating an auto-import change', () => {
    const incoming = { registrations: [] };
    const newMeta = { params: { registration: { year: '26-27', sem: '1', semester: '26-27/1', snapshotComplete: true } } };
    const oldMeta = { params: { registration: { year: '25-26', sem: '3', semester: '25-26/3' } } };

    const firstPreview = buildRawImportPreview(incoming, { registrations: [] }, {
      incomingMeta: newMeta,
      currentMeta: oldMeta,
    });
    const repeatedPreview = buildRawImportPreview(incoming, { registrations: [] }, {
      incomingMeta: newMeta,
      currentMeta: newMeta,
    });

    expect(firstPreview).toMatchObject([{ collection: 'registrations', status: 'update' }]);
    expect(repeatedPreview).toMatchObject([{ collection: 'registrations', status: 'unchanged' }]);
  });

  it('removes only selected records that disappeared from a non-empty snapshot', () => {
    const current = {
      grades: [
        { id: 'CSC10001', name: 'Intro', semester: '25-26/1', class: 'A', type: 'LT' },
        { id: 'CSC10002', name: 'Programming', semester: '25-26/1', class: 'A', type: 'LT' },
      ],
    };
    const incoming = { grades: [current.grades[0]] };
    const preview = buildRawImportPreview(incoming, current);
    const removal = preview.find((change) => change.status === 'remove');

    expect(removal?.courseId).toBe('CSC10002');
    const merged = mergeSelectedRawImport(incoming, current, removal ? [removal.id] : []);
    expect(merged.grades).toEqual([current.grades[0]]);
  });

  it('preserves future scraper fields that the current UI does not know yet', () => {
    const merged = mergeSelectedRawImport({ customPortalBlock: { value: 1 } }, {}, []);
    expect(merged.customPortalBlock).toEqual({ value: 1 });
  });
});
