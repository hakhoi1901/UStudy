import { STORAGE_KEYS } from '../../config/storageKeys';
import { readPlain, savePlain } from './save';

export type DataImportSource = 'bookmarklet' | 'extension' | 'mobile-app' | 'json' | 'optical';

interface DataImportStatus {
    at: string;
    source: DataImportSource;
}

export function recordDataImport(source: DataImportSource): void {
    savePlain<DataImportStatus>(STORAGE_KEYS.LAST_DATA_IMPORT, {
        at: new Date().toISOString(),
        source,
    });
}

export function hasImportedData(): boolean {
    const status = readPlain<DataImportStatus | null>(STORAGE_KEYS.LAST_DATA_IMPORT, null);
    return Boolean(status?.at && status.source);
}
