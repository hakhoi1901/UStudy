import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { X509Certificate } from 'node:crypto';

import { describe, expect, it } from 'vitest';
import { isSupportedPortalOrigin } from '../../../src/portal-sync/protocol';

async function readJson(path: string): Promise<any> {
  return JSON.parse(await readFile(resolve(process.cwd(), path), 'utf8'));
}

describe('Portal sync extension contract', () => {
  it('accepts only HTTPS Portal content origins', () => {
    expect(isSupportedPortalOrigin('https://new-portal.hcmus.edu.vn')).toBe(true);
    expect(isSupportedPortalOrigin('https://new-portal1.hcmus.edu.vn')).toBe(true);
    expect(isSupportedPortalOrigin('https://new-portal8.hcmus.edu.vn')).toBe(true);
    expect(isSupportedPortalOrigin('https://new-portal27.hcmus.edu.vn')).toBe(true);
    expect(isSupportedPortalOrigin('http://new-portal8.hcmus.edu.vn')).toBe(false);
    expect(isSupportedPortalOrigin('http://portal8.hcmus.edu.vn')).toBe(false);
    expect(isSupportedPortalOrigin('https://portal8.hcmus.edu.vn')).toBe(false);
    expect(isSupportedPortalOrigin('https://portal10.hcmus.edu.vn')).toBe(false);
    expect(isSupportedPortalOrigin('https://portal.hcmus.edu.vn')).toBe(false);
    expect(isSupportedPortalOrigin('https://portalabc.hcmus.edu.vn')).toBe(false);
    expect(isSupportedPortalOrigin('https://new-portal.evil.example')).toBe(false);
    expect(isSupportedPortalOrigin('https://portal8.hcmus.edu.vn.evil.example')).toBe(false);
  });

  it('allows numbered redirect hosts only in the Android WebView policy', async () => {
    const policy = await readFile(
      resolve(process.cwd(), 'android/app/src/main/java/com/ustudy/app/PortalUrlPolicy.java'),
      'utf8',
    );

    expect(policy).toContain('^new-portal\\\\d*\\\\.hcmus\\\\.edu\\\\.vn$');
    expect(policy).toContain('^portal\\\\d+\\\\.hcmus\\\\.edu\\\\.vn$');
  });

  it('keeps extension background portal detection restricted to HTTPS content hosts', async () => {
    const background = await readFile(
      resolve(process.cwd(), 'extension/background.js'),
      'utf8',
    );

    expect(background).toContain("parsedUrl.protocol === 'https:'");
    expect(background).toContain("new RegExp(CONFIG.portalHostnamePattern, 'i').test(parsedUrl.hostname)");
  });

  it('never hands Portal sync navigation to an external Android browser', async () => {
    const activity = await readFile(
      resolve(process.cwd(), 'android/app/src/main/java/com/ustudy/app/PortalSyncActivity.java'),
      'utf8',
    );

    expect(activity).toContain('PortalUrlPolicy.isSupportedPortalUri(uri)');
    expect(activity).toContain('showBlockedNavigation(uri)');
    expect(activity).not.toContain('Intent.ACTION_VIEW');
  });

  it('keeps in-app update actions on native Android inside the PortalSync flow', async () => {
    const dataSourceCenter = await readFile(
      resolve(process.cwd(), 'src/features/settings/components/DataSourceCenter.tsx'),
      'utf8',
    );

    expect(dataSourceCenter).toContain('isNativePortalSyncAvailable');
    expect(dataSourceCenter).toContain('openNativePortalSync');
    expect(dataSourceCenter).not.toContain('href={APP_CONFIG.PORTAL_LOGIN_URL}');
  });

  it('provides the missing Sectigo intermediate only to HCMUS domains', async () => {
    const manifest = await readFile(resolve(process.cwd(), 'android/app/src/main/AndroidManifest.xml'), 'utf8');
    const networkConfig = await readFile(
      resolve(process.cwd(), 'android/app/src/main/res/xml/network_security_config.xml'),
      'utf8',
    );
    const certificatePem = await readFile(
      resolve(process.cwd(), 'android/app/src/main/res/raw/sectigo_public_server_authentication_ca_ov_r36.pem'),
      'utf8',
    );
    const certificate = new X509Certificate(certificatePem);

    expect(manifest).toContain('android:networkSecurityConfig="@xml/network_security_config"');
    expect(networkConfig).toContain('<domain includeSubdomains="true">hcmus.edu.vn</domain>');
    expect(networkConfig).toContain('@raw/sectigo_public_server_authentication_ca_ov_r36');
    expect(networkConfig).toContain('<certificates src="system" />');
    expect(certificate.subject).toContain('Sectigo Public Server Authentication CA OV R36');
    expect(certificate.fingerprint256).toBe('65:42:D1:76:BE:D5:0F:19:3C:0C:E2:97:AE:44:EC:D8:A0:A8:6B:EC:2E:DE:68:27:69:34:40:59:B4:E7:85:30');
  });

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
