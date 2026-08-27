import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface HeaderEntry {
    key: string;
    value: string;
}

interface HeaderRule {
    source: string;
    headers: HeaderEntry[];
}

describe('Android APK download headers', () => {
    it('forces the production APK to download with an Android-compatible filename and MIME type', () => {
        const configPath = resolve(process.cwd(), 'vercel.json');
        const config = JSON.parse(readFileSync(configPath, 'utf8')) as { headers: HeaderRule[] };
        const apkRule = config.headers.find((rule) => rule.source === '/downloads/UStudy-android.apk');
        const headers = Object.fromEntries(
            (apkRule?.headers ?? []).map(({ key, value }) => [key.toLowerCase(), value]),
        );

        expect(headers).toMatchObject({
            'content-disposition': 'attachment; filename="UStudy-android.apk"',
            'content-type': 'application/vnd.android.package-archive',
        });
    });
});
