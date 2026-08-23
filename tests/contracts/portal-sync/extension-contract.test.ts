import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

async function readJson(path: string): Promise<any> {
  return JSON.parse(await readFile(resolve(process.cwd(), path), 'utf8'));
}

describe('Portal sync extension contract', () => {
  it('keeps the extension version and production origin aligned with shared config', async () => {
    const config = await readJson('src/portal-sync/config.json');
    const manifest = await readJson('extension/manifest.json');

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.version).toBe(config.extensionVersion);
    expect(config.productionAppUrl).toBe(`${config.appOrigins[0]}/`);
    expect(manifest.host_permissions).toContain(`${config.appOrigins[0]}/*`);
  });

  it('declares every script referenced by the manifest in the extension source', async () => {
    const manifest = await readJson('extension/manifest.json');
    const referencedFiles = [
      manifest.background.service_worker,
      manifest.action.default_popup,
      ...manifest.content_scripts.flatMap((entry: any) => entry.js),
    ].filter((file) => file !== 'config.js');

    await Promise.all(referencedFiles.map(async (file: string) => {
      await expect(readFile(resolve(process.cwd(), 'extension', file), 'utf8')).resolves.toBeTruthy();
    }));
  });

  it('limits requested permissions to the Portal and UStudy data bridge', async () => {
    const manifest = await readJson('extension/manifest.json');

    expect(manifest.permissions).toEqual(expect.arrayContaining(['storage', 'scripting']));
    expect(manifest.permissions).not.toContain('tabs');
    expect(manifest.host_permissions).toEqual([
      'https://*.hcmus.edu.vn/*',
      'https://ustudy.hakhoi.io.vn/*',
    ]);
  });

  it('keeps the empty scraper fixture compatible with every Portal source', async () => {
    const payload = await readJson('tests/fixtures/portal-payloads/empty-snapshot.json');

    expect(payload).toMatchObject({
      name: expect.any(String),
      grades: [],
      registrations: [],
      courses: [],
      exams: { midterm: [], final: [] },
      tuition: {},
      metadata: { version: expect.any(String), scrapedAt: expect.any(String) },
    });
  });
});
