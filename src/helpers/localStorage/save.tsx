/**
 * save.tsx - Secure Storage Layer
 *
 * Kiến trúc:
 *  - PIN -> PBKDF2 KEK -> wrapped Master Data Key -> AES-GCM 256-bit data encryption
 *  - Master Data Key chỉ sống trong RAM (React Context) - không bao giờ ghi ra storage
 *  - Random Salt 16 bytes (lưu plain), Random IV 12 bytes mỗi lần encrypt
 *  - Legacy v1 dùng '__pin_verify__'; v2 xác minh PIN bằng cách mở Master Data Key
 *
 * Phân tầng:
 *  - savePlain / readPlain  → settings không nhạy cảm (faculty, semester, ...)
 *  - saveSecure / readSecure → data nhạy cảm (student_db, grades, ...)
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const MASTER_KEY_BYTES = 32;
const CRYPTO_VERSION_V2 = 2;
const SECURE_DATA_SCHEMA_VERSION = 1;
const MASTER_KEY_WRAP_AAD = new TextEncoder().encode('ustudy:master-key:v2');
const MIGRATION_STAGE_KEY = '__crypto_v2_migration_stage__';
const MIGRATION_LEGACY_PREFIX = '__crypto_v2_legacy__:';
const MIGRATION_DATA_PREFIX = '__crypto_v2_data__:';
const PIN_CHANGE_STAGE_KEY = '__crypto_v2_pin_change_stage__';
const DEVICE_SYNC_STAGE_KEY = '__device_sync_import_stage__';
const DEVICE_SYNC_PREVIOUS_PREFIX = '__device_sync_previous__:';
const DEVICE_SYNC_NEXT_PREFIX = '__device_sync_next__:';

/** Keys nội bộ của hệ thống bảo mật, không export ra STORAGE_KEYS */
const INTERNAL_KEYS = {
    VERSION: '__crypto_version__',
    SALT: '__pbkdf2_salt__',
    PIN_VERIFY: '__pin_verify__',
    MASTER_KEY_IV: '__master_key_iv__',
    ENCRYPTED_MASTER_KEY: '__encrypted_master_key__',
    SECURE_DATA_SCHEMA: '__secure_data_schema_version__',
    FAIL_COUNT: '__fail_count__',
    LOCKOUT_UNTIL: '__lockout_until__',
} as const;

const CRYPTO_METADATA_KEYS = [
    INTERNAL_KEYS.VERSION,
    INTERNAL_KEYS.SALT,
    INTERNAL_KEYS.PIN_VERIFY,
    INTERNAL_KEYS.MASTER_KEY_IV,
    INTERNAL_KEYS.ENCRYPTED_MASTER_KEY,
    INTERNAL_KEYS.SECURE_DATA_SCHEMA,
] as const;

type CryptoVersion = 1 | 2;

interface MigrationStage {
    kind: 'migration';
    phase: 'staging' | 'ready' | 'committing' | 'committed';
    keys: string[];
    legacySalt: string;
    legacyPinVerify: string;
    masterKeyIv: string;
    encryptedMasterKey: string;
}

interface PinChangeStage {
    kind: 'pin-change';
    phase: 'prepared' | 'committed';
    previousSalt: string;
    previousMasterKeyIv: string;
    previousEncryptedMasterKey: string;
    nextSalt: string;
    nextMasterKeyIv: string;
    nextEncryptedMasterKey: string;
}

interface DeviceSyncStage {
    kind: 'device-sync';
    phase: 'staging' | 'ready' | 'committing' | 'committed';
    keys: string[];
    previousCryptoMetadata: Record<string, string | null>;
    nextCryptoMetadata: Record<string, string>;
}

/** Nguồn truth cho các giá trị luôn được mã hóa bằng Master Data Key. */
export const SECURE_DATA_KEYS = [
    'raw_student_db',
    'student_db_full',
    'course_db_offline',
    'import_meta',
    'gpa_projected_grades',
    'gpa_pull_future_grades',
    'app_notifications',
    'solver_preferences',
    'allowed_classes_map',
    'saved_schedules',
] as const;

// ─── Helper: Encode / Decode payload ─────────────────────────────────────────

function toBase64(buf: ArrayBuffer | Uint8Array): string {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/** Format lưu: base64(salt):base64(iv):base64(ciphertext) */
function encodePayload(salt: Uint8Array, iv: Uint8Array, ciphertext: ArrayBuffer): string {
    return `${toBase64(salt)}:${toBase64(iv)}:${toBase64(ciphertext)}`;
}

function decodePayload(payload: string): { salt: Uint8Array; iv: Uint8Array; ciphertext: Uint8Array } | null {
    const parts = payload.split(':');
    if (parts.length !== 3) return null;
    try {
        return {
            salt: fromBase64(parts[0]),
            iv: fromBase64(parts[1]),
            ciphertext: fromBase64(parts[2]),
        };
    } catch {
        return null;
    }
}

export function getCryptoVersion(): CryptoVersion {
    return localStorage.getItem(INTERNAL_KEYS.VERSION) === String(CRYPTO_VERSION_V2) ? 2 : 1;
}

function getCryptoVersionFromSnapshot(data: Record<string, string>): CryptoVersion {
    return data[INTERNAL_KEYS.VERSION] === String(CRYPTO_VERSION_V2) ? 2 : 1;
}

export function isEncryptedBackup(data: Record<string, string>): boolean {
    return Boolean(
        data[INTERNAL_KEYS.SALT]
        && (
            data[INTERNAL_KEYS.PIN_VERIFY]
            || (
                data[INTERNAL_KEYS.VERSION] === String(CRYPTO_VERSION_V2)
                && data[INTERNAL_KEYS.MASTER_KEY_IV]
                && data[INTERNAL_KEYS.ENCRYPTED_MASTER_KEY]
            )
        ),
    );
}

export function getCryptoMetadataKeys(): readonly string[] {
    return CRYPTO_METADATA_KEYS;
}

function isSecureDataKey(key: string): key is typeof SECURE_DATA_KEYS[number] {
    return (SECURE_DATA_KEYS as readonly string[]).includes(key);
}

/**
 * Early v2 builds added secure keys before every writer had been migrated away
 * from plain JSON. Upgrade those known legacy values once, after the Master Key
 * has been authenticated. Three-part payloads are never treated as plaintext:
 * damaged ciphertext must continue to fail AES-GCM authentication.
 */
async function migratePlainSecureValuesToCurrentSchema(masterKey: CryptoKey): Promise<void> {
    if (localStorage.getItem(INTERNAL_KEYS.SECURE_DATA_SCHEMA) === String(SECURE_DATA_SCHEMA_VERSION)) return;

    for (const key of SECURE_DATA_KEYS) {
        const raw = localStorage.getItem(key);
        if (raw === null || decodePayload(raw)) continue;

        let value: unknown;
        try {
            value = JSON.parse(raw);
        } catch {
            // Unknown or damaged values remain untouched and fail closed on read.
            continue;
        }

        const encrypted = await encryptWithKey(value, masterKey);
        const verified = await decryptWithKey(encrypted, masterKey);
        if (JSON.stringify(verified) !== JSON.stringify(value)) {
            throw new Error(`SECURE_SCHEMA_MIGRATION_MISMATCH:${key}`);
        }
        localStorage.setItem(key, encrypted);
    }

    localStorage.setItem(INTERNAL_KEYS.SECURE_DATA_SCHEMA, String(SECURE_DATA_SCHEMA_VERSION));
}

function clearCryptoMigrationArtifacts(): void {
    const keysToRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key?.startsWith(MIGRATION_LEGACY_PREFIX) || key?.startsWith(MIGRATION_DATA_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(MIGRATION_STAGE_KEY);
}

function clearDeviceSyncArtifacts(): void {
    const keysToRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key?.startsWith(DEVICE_SYNC_PREVIOUS_PREFIX) || key?.startsWith(DEVICE_SYNC_NEXT_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(DEVICE_SYNC_STAGE_KEY);
}

function recoverInterruptedDeviceSync(): void {
    const rawStage = localStorage.getItem(DEVICE_SYNC_STAGE_KEY);
    if (!rawStage) return;

    try {
        const stage = JSON.parse(rawStage) as DeviceSyncStage;
        if (stage.kind !== 'device-sync') return;
        if (stage.phase === 'committed') {
            clearDeviceSyncArtifacts();
            return;
        }

        for (const key of stage.keys) {
            const previousRaw = localStorage.getItem(`${DEVICE_SYNC_PREVIOUS_PREFIX}${key}`);
            if (!previousRaw) throw new Error(`MISSING_DEVICE_SYNC_PREVIOUS:${key}`);
            const previous = JSON.parse(previousRaw) as { exists: boolean; value?: string };
            if (previous.exists) localStorage.setItem(key, previous.value ?? '');
            else localStorage.removeItem(key);
        }
        for (const key of CRYPTO_METADATA_KEYS) {
            const previous = stage.previousCryptoMetadata[key];
            if (previous === null || previous === undefined) localStorage.removeItem(key);
            else localStorage.setItem(key, previous);
        }
        clearDeviceSyncArtifacts();
    } catch (error) {
        console.error('[crypto] Khong the khoi phuc dong bo thiet bi chua hoan tat:', error);
    }
}

function recoverInterruptedCryptoOperations(): void {
    recoverInterruptedDeviceSync();
    const pinChangeRaw = localStorage.getItem(PIN_CHANGE_STAGE_KEY);
    if (pinChangeRaw) {
        try {
            const stage = JSON.parse(pinChangeRaw) as PinChangeStage;
            if (stage.kind === 'pin-change') {
                if (stage.phase === 'committed') {
                    localStorage.removeItem(PIN_CHANGE_STAGE_KEY);
                } else {
                    localStorage.setItem(INTERNAL_KEYS.SALT, stage.previousSalt);
                    localStorage.setItem(INTERNAL_KEYS.MASTER_KEY_IV, stage.previousMasterKeyIv);
                    localStorage.setItem(INTERNAL_KEYS.ENCRYPTED_MASTER_KEY, stage.previousEncryptedMasterKey);
                    localStorage.removeItem(PIN_CHANGE_STAGE_KEY);
                }
            }
        } catch {
            // Keep existing metadata untouched if the recovery journal is unreadable.
        }
    }

    const migrationRaw = localStorage.getItem(MIGRATION_STAGE_KEY);
    if (!migrationRaw) return;
    try {
        const stage = JSON.parse(migrationRaw) as MigrationStage;
        if (stage.kind !== 'migration') return;

        if (getCryptoVersion() === 2) {
            // Version is written only after every primary v2 payload and envelope field.
            // A failed post-commit cleanup must not leave legacy PIN metadata behind.
            localStorage.removeItem(INTERNAL_KEYS.PIN_VERIFY);
            clearCryptoMigrationArtifacts();
            return;
        }

        if (stage.phase === 'committing' || stage.phase === 'ready') {
            for (const key of stage.keys) {
                const legacyValue = localStorage.getItem(`${MIGRATION_LEGACY_PREFIX}${key}`);
                if (legacyValue === null) throw new Error('MISSING_LEGACY_STAGING_DATA');
                localStorage.setItem(key, legacyValue);
            }
        }

        localStorage.setItem(INTERNAL_KEYS.SALT, stage.legacySalt);
        localStorage.setItem(INTERNAL_KEYS.PIN_VERIFY, stage.legacyPinVerify);
        localStorage.removeItem(INTERNAL_KEYS.VERSION);
        localStorage.removeItem(INTERNAL_KEYS.MASTER_KEY_IV);
        localStorage.removeItem(INTERNAL_KEYS.ENCRYPTED_MASTER_KEY);
        localStorage.removeItem(INTERNAL_KEYS.SECURE_DATA_SCHEMA);
        clearCryptoMigrationArtifacts();
    } catch (error) {
        console.error('[crypto] Không thể khôi phục migration chưa hoàn tất:', error);
    }
}

// ─── Key Derivation ───────────────────────────────────────────────────────────

/** Lấy salt hiện tại từ localStorage, hoặc tạo mới nếu chưa có */
export function getOrCreateSalt(): Uint8Array {
    const stored = localStorage.getItem(INTERNAL_KEYS.SALT);
    if (stored) {
        try {
            return fromBase64(stored);
        } catch {
            // fall through to create new
        }
    }
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    localStorage.setItem(INTERNAL_KEYS.SALT, toBase64(salt));
    return salt;
}

/** Derive AES-GCM key từ PIN + salt bằng PBKDF2 */
export async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
    const cryptoSalt = Uint8Array.from(salt);
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(pin),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: cryptoSalt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false, // không exportable
        ['encrypt', 'decrypt']
    );
}

/** PIN-derived Key Encryption Key. `deriveKey` remains for legacy compatibility. */
export const deriveKek = deriveKey;

function generateMasterKeyMaterial(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(MASTER_KEY_BYTES));
}

function asCryptoBuffer(bytes: Uint8Array): ArrayBuffer {
    return Uint8Array.from(bytes).buffer;
}

async function importMasterDataKey(rawMasterKey: Uint8Array): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'raw',
        asCryptoBuffer(rawMasterKey),
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt'],
    );
}

async function wrapMasterKey(rawMasterKey: Uint8Array, kek: CryptoKey): Promise<{ iv: Uint8Array; ciphertext: ArrayBuffer }> {
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: asCryptoBuffer(iv), additionalData: asCryptoBuffer(MASTER_KEY_WRAP_AAD) },
        kek,
        asCryptoBuffer(rawMasterKey),
    );
    return { iv, ciphertext };
}

async function unwrapMasterKey(kek: CryptoKey, ivRaw: string, ciphertextRaw: string): Promise<Uint8Array> {
    const iv = fromBase64(ivRaw);
    const ciphertext = fromBase64(ciphertextRaw);
    const rawMasterKey = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: asCryptoBuffer(iv), additionalData: asCryptoBuffer(MASTER_KEY_WRAP_AAD) },
        kek,
        asCryptoBuffer(ciphertext),
    );
    return new Uint8Array(rawMasterKey);
}

async function createMasterKeyEnvelope(kek: CryptoKey): Promise<{ masterKey: CryptoKey; iv: string; ciphertext: string }> {
    const rawMasterKey = generateMasterKeyMaterial();
    try {
        const masterKey = await importMasterDataKey(rawMasterKey);
        const wrapped = await wrapMasterKey(rawMasterKey, kek);
        return {
            masterKey,
            iv: toBase64(wrapped.iv),
            ciphertext: toBase64(wrapped.ciphertext),
        };
    } finally {
        rawMasterKey.fill(0);
    }
}

async function openMasterKeyEnvelope(kek: CryptoKey, iv: string, ciphertext: string): Promise<CryptoKey> {
    const rawMasterKey = await unwrapMasterKey(kek, iv, ciphertext);
    try {
        return await importMasterDataKey(rawMasterKey);
    } finally {
        rawMasterKey.fill(0);
    }
}

// ─── Low-level Encrypt / Decrypt ──────────────────────────────────────────────

async function encryptWithKey(data: unknown, key: CryptoKey): Promise<string> {
    const salt = getOrCreateSalt(); // salt hiện tại của session
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES)); // IV mới mỗi lần
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
    return encodePayload(salt, iv, ciphertext);
}

async function decryptWithKey(payload: string, key: CryptoKey): Promise<unknown> {
    const decoded = decodePayload(payload);
    if (!decoded) throw new Error('INVALID_PAYLOAD');
    const { iv, ciphertext } = decoded;
    const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: Uint8Array.from(iv) },
        key,
        Uint8Array.from(ciphertext),
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
}

/** Legacy installations occasionally stored a now-sensitive key as plain JSON. */
async function readLegacySecureValue(payload: string, legacyKey: CryptoKey): Promise<unknown> {
    try {
        return await decryptWithKey(payload, legacyKey);
    } catch (error) {
        if (!(error instanceof Error) || error.message !== 'INVALID_PAYLOAD') throw error;
        try {
            return JSON.parse(payload);
        } catch {
            throw error;
        }
    }
}

// ─── Public: Plain Storage ────────────────────────────────────────────────────

/** Lưu dữ liệu KHÔNG nhạy cảm (settings, page, ...) - không mã hóa */
export function savePlain<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.error(`[savePlain] Lỗi khi lưu "${key}":`, err);
    }
}

/** Đọc dữ liệu KHÔNG nhạy cảm */
export function readPlain<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

// ─── Public: Secure Storage ───────────────────────────────────────────────────

/** Lưu dữ liệu nhạy cảm - mã hóa AES-GCM với CryptoKey */
export async function saveSecure(key: string, value: unknown, cryptoKey: CryptoKey): Promise<void> {
    try {
        const encrypted = await encryptWithKey(value, cryptoKey);
        localStorage.setItem(key, encrypted);
    } catch (err) {
        console.error(`[saveSecure] Lỗi khi lưu "${key}":`, err);
    }
}

/** Đọc và giải mã dữ liệu nhạy cảm */
export async function readSecure<T>(key: string, cryptoKey: CryptoKey, fallback: T): Promise<T> {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return await decryptWithKey(raw, cryptoKey) as T;
}

// ─── PIN Management ───────────────────────────────────────────────────────────

export async function setupPin(pin: string): Promise<CryptoKey> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const kek = await deriveKek(pin, salt);
    const envelope = await createMasterKeyEnvelope(kek);

    localStorage.setItem(INTERNAL_KEYS.SALT, toBase64(salt));
    localStorage.setItem(INTERNAL_KEYS.MASTER_KEY_IV, envelope.iv);
    localStorage.setItem(INTERNAL_KEYS.ENCRYPTED_MASTER_KEY, envelope.ciphertext);
    localStorage.setItem(INTERNAL_KEYS.SECURE_DATA_SCHEMA, String(SECURE_DATA_SCHEMA_VERSION));
    localStorage.setItem(INTERNAL_KEYS.VERSION, String(CRYPTO_VERSION_V2));
    localStorage.removeItem(INTERNAL_KEYS.PIN_VERIFY);
    return envelope.masterKey;
}

export interface LocalMasterKeySetup {
    masterKey: CryptoKey;
    cryptoMetadata: Record<string, string>;
}

/** Creates a receiver-local Master Key without exposing or transferring its raw bytes. */
export async function prepareNewLocalMasterKey(pin: string): Promise<LocalMasterKeySetup> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const kek = await deriveKek(pin, salt);
    const envelope = await createMasterKeyEnvelope(kek);
    return {
        masterKey: envelope.masterKey,
        cryptoMetadata: {
            [INTERNAL_KEYS.VERSION]: String(CRYPTO_VERSION_V2),
            [INTERNAL_KEYS.SALT]: toBase64(salt),
            [INTERNAL_KEYS.MASTER_KEY_IV]: envelope.iv,
            [INTERNAL_KEYS.ENCRYPTED_MASTER_KEY]: envelope.ciphertext,
            [INTERNAL_KEYS.SECURE_DATA_SCHEMA]: String(SECURE_DATA_SCHEMA_VERSION),
        },
    };
}

/** Returns the authenticated metadata for reusing the receiver's current vault. */
export function getCurrentCryptoMetadata(): Record<string, string> {
    recoverInterruptedCryptoOperations();
    if (getCryptoVersion() !== 2) throw new Error('DEVICE_SYNC_REQUIRES_CRYPTO_V2');
    const metadata: Record<string, string> = {};
    for (const key of CRYPTO_METADATA_KEYS) {
        const value = localStorage.getItem(key);
        if (value !== null) metadata[key] = value;
    }
    if (!metadata[INTERNAL_KEYS.SALT] || !metadata[INTERNAL_KEYS.MASTER_KEY_IV] || !metadata[INTERNAL_KEYS.ENCRYPTED_MASTER_KEY]) {
        throw new Error('DEVICE_SYNC_MASTER_KEY_UNAVAILABLE');
    }
    return metadata;
}

/**
 * Replaces a curated set of user-data keys as one recoverable local transaction.
 * New values are staged first; a quota failure never intentionally deletes old data.
 */
export async function replaceDeviceSyncData(
    nextValues: Record<string, string>,
    syncKeys: readonly string[],
    nextCryptoMetadata: Record<string, string>,
    masterKey: CryptoKey,
): Promise<void> {
    recoverInterruptedCryptoOperations();
    const keys = Array.from(new Set(syncKeys));
    const preparedValues: Record<string, string> = {};
    for (const [key, value] of Object.entries(nextValues)) {
        if (!keys.includes(key)) continue;
        if (isSecureDataKey(key)) {
            let parsed: unknown;
            try {
                parsed = JSON.parse(value);
            } catch {
                throw new Error(`INVALID_DEVICE_SYNC_SECURE_VALUE:${key}`);
            }
            preparedValues[key] = await encryptWithKey(parsed, masterKey);
        } else {
            preparedValues[key] = value;
        }
    }
    const stage: DeviceSyncStage = {
        kind: 'device-sync',
        phase: 'staging',
        keys: [],
        previousCryptoMetadata: Object.fromEntries(CRYPTO_METADATA_KEYS.map((key) => [key, localStorage.getItem(key)])),
        nextCryptoMetadata,
    };

    try {
        localStorage.setItem(DEVICE_SYNC_STAGE_KEY, JSON.stringify(stage));
        for (const key of keys) {
            const previous = localStorage.getItem(key);
            localStorage.setItem(`${DEVICE_SYNC_PREVIOUS_PREFIX}${key}`, JSON.stringify({ exists: previous !== null, value: previous ?? undefined }));
            if (Object.prototype.hasOwnProperty.call(preparedValues, key)) {
                localStorage.setItem(`${DEVICE_SYNC_NEXT_PREFIX}${key}`, preparedValues[key]);
            }
            stage.keys.push(key);
            localStorage.setItem(DEVICE_SYNC_STAGE_KEY, JSON.stringify(stage));
        }

        stage.phase = 'ready';
        localStorage.setItem(DEVICE_SYNC_STAGE_KEY, JSON.stringify(stage));
        stage.phase = 'committing';
        localStorage.setItem(DEVICE_SYNC_STAGE_KEY, JSON.stringify(stage));
        for (const key of stage.keys) {
            const nextStageKey = `${DEVICE_SYNC_NEXT_PREFIX}${key}`;
            const hasNext = Object.prototype.hasOwnProperty.call(preparedValues, key);
            // Free the staged copy before writing the primary key. The previous
            // value is still journaled, so a failed write can roll back safely.
            localStorage.removeItem(nextStageKey);
            if (!hasNext) localStorage.removeItem(key);
            else localStorage.setItem(key, preparedValues[key]);
        }
        for (const key of CRYPTO_METADATA_KEYS) {
            const next = stage.nextCryptoMetadata[key];
            if (next === undefined) localStorage.removeItem(key);
            else localStorage.setItem(key, next);
        }
        stage.phase = 'committed';
        localStorage.setItem(DEVICE_SYNC_STAGE_KEY, JSON.stringify(stage));
        clearDeviceSyncArtifacts();
    } catch (error) {
        recoverInterruptedDeviceSync();
        throw error;
    }
}

export async function verifyPin(pin: string): Promise<CryptoKey | null> {
    recoverInterruptedCryptoOperations();
    try {
        const saltRaw = localStorage.getItem(INTERNAL_KEYS.SALT);
        if (!saltRaw) return null;
        const salt = fromBase64(saltRaw);
        const kek = await deriveKek(pin, salt);

        if (getCryptoVersion() === 2) {
            const masterKeyIv = localStorage.getItem(INTERNAL_KEYS.MASTER_KEY_IV);
            const encryptedMasterKey = localStorage.getItem(INTERNAL_KEYS.ENCRYPTED_MASTER_KEY);
            if (!masterKeyIv || !encryptedMasterKey) return null;
            const masterKey = await openMasterKeyEnvelope(kek, masterKeyIv, encryptedMasterKey);
            try {
                await migratePlainSecureValuesToCurrentSchema(masterKey);
            } catch (error) {
                // A schema upgrade must never turn a valid PIN into a lockout.
                console.warn('[crypto] Secure data schema migration is incomplete.', error);
            }
            return masterKey;
        }

        const verifyPayload = localStorage.getItem(INTERNAL_KEYS.PIN_VERIFY);
        if (!verifyPayload) return null;
        const result = await decryptWithKey(verifyPayload, kek) as any;
        if (result?.ok === true) {
            return await migrateLegacyDataToV2(kek, saltRaw, verifyPayload);
        }
        return null;
    } catch {
        return null;
    }
}

export async function verifyBackupPin(pin: string, saltRaw: string, verifyPayload: string): Promise<boolean> {
    try {
        const salt = fromBase64(saltRaw);
        const key = await deriveKek(pin, salt);
        const result = await decryptWithKey(verifyPayload, key) as { ok?: boolean };
        return result?.ok === true;
    } catch {
        return false;
    }
}

export async function unlockBackupKey(pin: string, backupData: Record<string, string>): Promise<CryptoKey | null> {
    try {
        const saltRaw = backupData[INTERNAL_KEYS.SALT];
        if (!saltRaw) return null;
        const kek = await deriveKek(pin, fromBase64(saltRaw));

        if (backupData[INTERNAL_KEYS.VERSION] === String(CRYPTO_VERSION_V2)) {
            const iv = backupData[INTERNAL_KEYS.MASTER_KEY_IV];
            const ciphertext = backupData[INTERNAL_KEYS.ENCRYPTED_MASTER_KEY];
            if (!iv || !ciphertext) return null;
            return await openMasterKeyEnvelope(kek, iv, ciphertext);
        }

        const verifyPayload = backupData[INTERNAL_KEYS.PIN_VERIFY];
        if (!verifyPayload || !await verifyBackupPin(pin, saltRaw, verifyPayload)) return null;
        return kek;
    } catch {
        return null;
    }
}

/**
 * Import dữ liệu từ file backup và mã hóa lại bằng khoá hiện tại của ứng dụng.
 */
export async function importBackupWithCurrentKey(
    backupData: Record<string, string>,
    backupPin: string,
    currentKey: CryptoKey,
    selectedKeys?: readonly string[],
): Promise<void> {
    const backupKey = await unlockBackupKey(backupPin, backupData);
    if (!backupKey) throw new Error('Không thể mở khóa file sao lưu');

    for (const [k, v] of Object.entries(backupData)) {
        if (selectedKeys && !selectedKeys.includes(k)) {
            continue;
        }

        if (CRYPTO_METADATA_KEYS.includes(k as typeof CRYPTO_METADATA_KEYS[number]) || k === INTERNAL_KEYS.FAIL_COUNT || k === INTERNAL_KEYS.LOCKOUT_UNTIL) {
            continue;
        }

        if (isSecureDataKey(k)) {
            const parsed = await decryptWithKey(v, backupKey);
            await saveSecure(k, parsed, currentKey);
        } else {
            localStorage.setItem(k, v);
        }
    }
}


async function migrateLegacyDataToV2(
    legacyKey: CryptoKey,
    legacySalt: string,
    legacyPinVerify: string,
): Promise<CryptoKey> {
    let masterKey: CryptoKey | null = null;
    try {
        const decryptedData: Array<[string, unknown]> = [];
        for (const key of SECURE_DATA_KEYS) {
            const payload = localStorage.getItem(key);
            if (payload === null) continue;
            decryptedData.push([key, await readLegacySecureValue(payload, legacyKey)]);
        }

        const envelope = await createMasterKeyEnvelope(legacyKey);
        masterKey = envelope.masterKey;
        const stage: MigrationStage = {
            kind: 'migration',
            phase: 'staging',
            keys: [],
            legacySalt,
            legacyPinVerify,
            masterKeyIv: envelope.iv,
            encryptedMasterKey: envelope.ciphertext,
        };
        localStorage.setItem(MIGRATION_STAGE_KEY, JSON.stringify(stage));

        for (const [key, value] of decryptedData) {
            const legacyPayload = localStorage.getItem(key);
            if (legacyPayload === null) throw new Error(`MISSING_LEGACY_DATA:${key}`);
            const encryptedPayload = await encryptWithKey(value, envelope.masterKey);
            localStorage.setItem(`${MIGRATION_LEGACY_PREFIX}${key}`, legacyPayload);
            localStorage.setItem(`${MIGRATION_DATA_PREFIX}${key}`, encryptedPayload);
            stage.keys.push(key);
            localStorage.setItem(MIGRATION_STAGE_KEY, JSON.stringify(stage));
        }

        const expectedValues = new Map(decryptedData);
        for (const key of stage.keys) {
            const payload = localStorage.getItem(`${MIGRATION_DATA_PREFIX}${key}`);
            if (!payload) throw new Error(`MISSING_STAGED_DATA:${key}`);
            const restored = await decryptWithKey(payload, envelope.masterKey);
            if (JSON.stringify(restored) !== JSON.stringify(expectedValues.get(key))) {
                throw new Error(`STAGED_DATA_MISMATCH:${key}`);
            }
        }

        stage.phase = 'ready';
        localStorage.setItem(MIGRATION_STAGE_KEY, JSON.stringify(stage));
        stage.phase = 'committing';
        localStorage.setItem(MIGRATION_STAGE_KEY, JSON.stringify(stage));

        for (const key of stage.keys) {
            const payload = localStorage.getItem(`${MIGRATION_DATA_PREFIX}${key}`);
            if (!payload) throw new Error(`MISSING_STAGED_DATA:${key}`);
            localStorage.setItem(key, payload);
        }

        localStorage.setItem(INTERNAL_KEYS.MASTER_KEY_IV, stage.masterKeyIv);
        localStorage.setItem(INTERNAL_KEYS.ENCRYPTED_MASTER_KEY, stage.encryptedMasterKey);
        localStorage.setItem(INTERNAL_KEYS.SECURE_DATA_SCHEMA, String(SECURE_DATA_SCHEMA_VERSION));
        localStorage.setItem(INTERNAL_KEYS.VERSION, String(CRYPTO_VERSION_V2));
        stage.phase = 'committed';
        localStorage.setItem(MIGRATION_STAGE_KEY, JSON.stringify(stage));
        localStorage.removeItem(INTERNAL_KEYS.PIN_VERIFY);
        clearCryptoMigrationArtifacts();
        return envelope.masterKey;
    } catch (error) {
        recoverInterruptedCryptoOperations();
        if (getCryptoVersion() === 2 && masterKey) {
            return masterKey;
        }
        console.warn('[crypto] Migration v1 -> v2 chưa hoàn tất, tiếp tục dùng định dạng cũ.', error);
        return legacyKey;
    }
}

/** Re-wrap the Master Data Key only; secure data ciphertext remains unchanged. */
export async function changePin(currentMasterKey: CryptoKey, oldPin: string, newPin: string): Promise<CryptoKey> {
    recoverInterruptedCryptoOperations();
    if (getCryptoVersion() !== 2) {
        throw new Error('Dữ liệu cũ chưa thể nâng cấp sang kiến trúc Master Key.');
    }

    const previousSalt = localStorage.getItem(INTERNAL_KEYS.SALT);
    const previousMasterKeyIv = localStorage.getItem(INTERNAL_KEYS.MASTER_KEY_IV);
    const previousEncryptedMasterKey = localStorage.getItem(INTERNAL_KEYS.ENCRYPTED_MASTER_KEY);
    if (!previousSalt || !previousMasterKeyIv || !previousEncryptedMasterKey) {
        throw new Error('Thiếu metadata mã hóa Master Key.');
    }

    const oldKek = await deriveKek(oldPin, fromBase64(previousSalt));
    const rawMasterKey = await unwrapMasterKey(oldKek, previousMasterKeyIv, previousEncryptedMasterKey);
    try {
        const nextSalt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
        const nextKek = await deriveKek(newPin, nextSalt);
        const wrapped = await wrapMasterKey(rawMasterKey, nextKek);
        const stage: PinChangeStage = {
            kind: 'pin-change',
            phase: 'prepared',
            previousSalt,
            previousMasterKeyIv,
            previousEncryptedMasterKey,
            nextSalt: toBase64(nextSalt),
            nextMasterKeyIv: toBase64(wrapped.iv),
            nextEncryptedMasterKey: toBase64(wrapped.ciphertext),
        };

        localStorage.setItem(PIN_CHANGE_STAGE_KEY, JSON.stringify(stage));
        localStorage.setItem(INTERNAL_KEYS.SALT, stage.nextSalt);
        localStorage.setItem(INTERNAL_KEYS.MASTER_KEY_IV, stage.nextMasterKeyIv);
        localStorage.setItem(INTERNAL_KEYS.ENCRYPTED_MASTER_KEY, stage.nextEncryptedMasterKey);

        await openMasterKeyEnvelope(nextKek, stage.nextMasterKeyIv, stage.nextEncryptedMasterKey);
        stage.phase = 'committed';
        localStorage.setItem(PIN_CHANGE_STAGE_KEY, JSON.stringify(stage));
        localStorage.removeItem(PIN_CHANGE_STAGE_KEY);
        return currentMasterKey;
    } finally {
        rawMasterKey.fill(0);
    }
}

// ─── Brute-force Protection ───────────────────────────────────────────────────

const LOCKOUT_THRESHOLDS = [
    { attempts: 5, seconds: 30 },
    { attempts: 6, seconds: 60 },
    { attempts: 7, seconds: 120 },
    { attempts: 8, seconds: 300 },
];

export function getFailCount(): number {
    return parseInt(sessionStorage.getItem(INTERNAL_KEYS.FAIL_COUNT) || '0', 10);
}

export function incrementFailCount(): void {
    const count = getFailCount() + 1;
    sessionStorage.setItem(INTERNAL_KEYS.FAIL_COUNT, String(count));

    const threshold = LOCKOUT_THRESHOLDS.slice().reverse().find(t => count >= t.attempts);
    if (threshold) {
        const lockoutUntil = Date.now() + threshold.seconds * 1000;
        sessionStorage.setItem(INTERNAL_KEYS.LOCKOUT_UNTIL, String(lockoutUntil));
    }
}

export function resetFailCount(): void {
    sessionStorage.removeItem(INTERNAL_KEYS.FAIL_COUNT);
    sessionStorage.removeItem(INTERNAL_KEYS.LOCKOUT_UNTIL);
}

/** Trả về số giây còn lại trong lockout, hoặc 0 nếu không bị khóa */
export function getLockoutSeconds(): number {
    const until = parseInt(sessionStorage.getItem(INTERNAL_KEYS.LOCKOUT_UNTIL) || '0', 10);
    if (!until) return 0;
    const remaining = Math.ceil((until - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Kiểm tra xem có dữ liệu nhạy cảm trong localStorage không */
export function hasSecureData(): boolean {
    if (
        getCryptoVersion() === 2
        && localStorage.getItem(INTERNAL_KEYS.SALT)
        && localStorage.getItem(INTERNAL_KEYS.MASTER_KEY_IV)
        && localStorage.getItem(INTERNAL_KEYS.ENCRYPTED_MASTER_KEY)
    ) return true;

    return !!(
        localStorage.getItem(INTERNAL_KEYS.PIN_VERIFY) ||
        localStorage.getItem('raw_student_db') ||
        localStorage.getItem('student_db_full')
    );
}

export const IMPORT_ROLLBACK_STORAGE_KEY = '__ustudy_last_import_rollback__';
export const IMPORT_ROLLBACK_EVENT = 'ustudy:import-rollback-created';
export const IMPORT_HISTORY_STORAGE_KEY = '__ustudy_import_history__';

const IMPORT_ROLLBACK_DATABASE = 'ustudy-import-rollback';
const IMPORT_ROLLBACK_STORE = 'snapshots';
const LATEST_IMPORT_ROLLBACK_ID = 'latest';

export interface ImportRollbackSummary {
    added: number;
    updated: number;
    removed?: number;
    unchanged: number;
}

export interface ImportRollbackSnapshot {
    createdAt: string;
    source: string;
    summary: ImportRollbackSummary;
    data: Record<string, string>;
    storage?: 'indexeddb';
    details?: ImportHistoryDetail[];
    restoredSources?: string[];
}

export interface ImportHistoryDetail extends ImportRollbackSummary {
    source: string;
}

export interface ImportHistoryEntry {
    id: string;
    createdAt: string;
    source: string;
    displayName?: string;
    summary: ImportRollbackSummary;
    details: ImportHistoryDetail[];
    restoredSources?: string[];
}

export function getImportHistory(): ImportHistoryEntry[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(IMPORT_HISTORY_STORAGE_KEY) || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((entry): entry is ImportHistoryEntry => Boolean(entry?.id && entry?.createdAt && entry?.summary))
            .map((entry) => ({
                ...entry,
                details: Array.isArray(entry.details) ? entry.details : [],
                restoredSources: Array.isArray(entry.restoredSources) ? entry.restoredSources : [],
            }));
    } catch {
        return [];
    }
}

function appendImportHistory(source: string, summary: ImportRollbackSummary, details: ImportHistoryDetail[], displayName?: string) {
    const entry: ImportHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        source,
        displayName: displayName?.trim() || undefined,
        summary,
        details,
    };
    localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify([entry, ...getImportHistory()].slice(0, 20)));
}

function openImportRollbackDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IMPORT_ROLLBACK_DATABASE, 1);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(IMPORT_ROLLBACK_STORE)) {
                request.result.createObjectStore(IMPORT_ROLLBACK_STORE);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Không thể mở IndexedDB cho điểm hoàn tác.'));
    });
}

async function writeImportRollbackData(data: Record<string, string>): Promise<void> {
    const database = await openImportRollbackDatabase();
    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(IMPORT_ROLLBACK_STORE, 'readwrite');
            transaction.objectStore(IMPORT_ROLLBACK_STORE).put(data, LATEST_IMPORT_ROLLBACK_ID);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error('Không thể lưu điểm hoàn tác.'));
            transaction.onabort = () => reject(transaction.error || new Error('Đã hủy lưu điểm hoàn tác.'));
        });
    } finally {
        database.close();
    }
}

async function readImportRollbackData(snapshot: ImportRollbackSnapshot): Promise<Record<string, string> | null> {
    if (snapshot.storage !== 'indexeddb') return snapshot.data;

    const database = await openImportRollbackDatabase();
    try {
        return await new Promise<Record<string, string> | null>((resolve, reject) => {
            const request = database.transaction(IMPORT_ROLLBACK_STORE, 'readonly')
                .objectStore(IMPORT_ROLLBACK_STORE)
                .get(LATEST_IMPORT_ROLLBACK_ID);
            request.onsuccess = () => resolve(request.result && typeof request.result === 'object' ? request.result as Record<string, string> : null);
            request.onerror = () => reject(request.error || new Error('Không thể đọc điểm hoàn tác.'));
        });
    } finally {
        database.close();
    }
}

async function deleteImportRollbackData(): Promise<void> {
    const database = await openImportRollbackDatabase();
    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(IMPORT_ROLLBACK_STORE, 'readwrite');
            transaction.objectStore(IMPORT_ROLLBACK_STORE).delete(LATEST_IMPORT_ROLLBACK_ID);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error('Không thể xóa điểm hoàn tác.'));
        });
    } finally {
        database.close();
    }
}

/** Lưu đúng trạng thái localStorage trước lần nhập gần nhất để có thể hoàn tác một lần. */
export async function createImportRollbackSnapshot(source: string, summary: ImportRollbackSummary, details: ImportHistoryDetail[] = [], displayName?: string): Promise<boolean> {
    try {
        const data: Record<string, string> = {};
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (key && key !== IMPORT_ROLLBACK_STORAGE_KEY) {
                data[key] = localStorage.getItem(key) || '';
            }
        }
        await writeImportRollbackData(data);
        const snapshot: ImportRollbackSnapshot = {
            createdAt: new Date().toISOString(),
            source,
            summary,
            data: {},
            storage: 'indexeddb',
            details,
        };
        localStorage.setItem(IMPORT_ROLLBACK_STORAGE_KEY, JSON.stringify(snapshot));
        appendImportHistory(source, summary, details, displayName);
        window.dispatchEvent(new Event(IMPORT_ROLLBACK_EVENT));
        return true;
    } catch (error) {
        console.error('[createImportRollbackSnapshot] Không thể lưu snapshot:', error);
        return false;
    }
}

export function renameImportHistoryEntry(id: string, displayName: string): boolean {
    try {
        const history = getImportHistory();
        const entryIndex = history.findIndex((entry) => entry.id === id);
        if (entryIndex < 0) return false;
        const normalizedName = displayName.trim().slice(0, 80);
        history[entryIndex] = { ...history[entryIndex], displayName: normalizedName || undefined };
        localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(history));
        window.dispatchEvent(new Event(IMPORT_ROLLBACK_EVENT));
        return true;
    } catch (error) {
        console.error('[renameImportHistoryEntry] Không thể đổi tên lịch sử:', error);
        return false;
    }
}

export function getImportRollbackSnapshot(): ImportRollbackSnapshot | null {
    try {
        const raw = localStorage.getItem(IMPORT_ROLLBACK_STORAGE_KEY);
        if (!raw) return null;
        const snapshot = JSON.parse(raw) as ImportRollbackSnapshot;
        return snapshot?.data && snapshot?.createdAt ? snapshot : null;
    } catch {
        return null;
    }
}

/** Đọc một giá trị trong snapshot bằng khóa hiện tại mà không ghi dữ liệu thô xuống storage. */
export async function readImportRollbackValue<T>(key: string, cryptoKey: CryptoKey, fallback: T): Promise<T> {
    const snapshot = getImportRollbackSnapshot();
    if (!snapshot) return fallback;

    const data = await readImportRollbackData(snapshot);
    if (data && getCryptoVersionFromSnapshot(data) !== getCryptoVersion()) {
        throw new Error('INCOMPATIBLE_CRYPTO_SNAPSHOT');
    }
    const raw = data?.[key];
    if (!raw) return fallback;
    try {
        return await decryptWithKey(raw, cryptoKey) as T;
    } catch {
        try {
            return JSON.parse(raw) as T;
        } catch {
            return fallback;
        }
    }
}

/** Ghi nhận các nguồn đã được hoàn tác riêng trong snapshot và lịch sử gần nhất. */
export function markImportRollbackSourcesRestored(sources: readonly string[]): void {
    const snapshot = getImportRollbackSnapshot();
    if (!snapshot) return;

    const restoredSources = Array.from(new Set([...(snapshot.restoredSources || []), ...sources]));
    localStorage.setItem(IMPORT_ROLLBACK_STORAGE_KEY, JSON.stringify({ ...snapshot, restoredSources }));

    const history = getImportHistory();
    if (history[0]) {
        history[0] = { ...history[0], restoredSources };
        localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
    window.dispatchEvent(new Event(IMPORT_ROLLBACK_EVENT));
}

/** Khôi phục toàn bộ localStorage về trạng thái trước lần nhập gần nhất. */
export async function restoreLastImportRollback(): Promise<boolean> {
    const snapshot = getImportRollbackSnapshot();
    if (!snapshot) return false;
    try {
        const data = await readImportRollbackData(snapshot);
        if (!data) return false;
        if (getCryptoVersionFromSnapshot(data) === 2 && getCryptoVersion() === 2) {
            for (const key of CRYPTO_METADATA_KEYS) {
                const currentValue = localStorage.getItem(key);
                if (currentValue === null) delete data[key];
                else data[key] = currentValue;
            }
        }
        localStorage.clear();
        Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, value));
        if (snapshot.storage === 'indexeddb') await deleteImportRollbackData();
        return true;
    } catch (error) {
        console.error('[restoreLastImportRollback] Không thể khôi phục snapshot:', error);
        return false;
    }
}

/** Xóa toàn bộ localStorage + sessionStorage. Caller tự gọi reload nếu cần. */
export function clearAllStorage(): void {
    localStorage.clear();
    sessionStorage.clear();
}

// ─── Module-level RAM Cache ────────────────────────────────────────────────────
// Giữ dữ liệu đã giải mã trong RAM để các hook đồng bộ có thể đọc được.
// Cache được populate bởi CryptoContext sau khi unlock.

const _ramCache: Record<string, any> = {};
let _activeCryptoKey: CryptoKey | null = null;

/** Keeps the non-extractable Master Key available to legacy synchronous writers. */
export function setActiveSecureStorageKey(key: CryptoKey | null): void {
    _activeCryptoKey = key;
}

/** Ghi một entry vào RAM cache */
export function populateSecureCache(key: string, value: any): void {
    _ramCache[key] = value;
}

/** Xóa toàn bộ RAM cache (khi lock hoặc đăng xuất) */
export function clearSecureCache(): void {
    Object.keys(_ramCache).forEach(k => delete _ramCache[k]);
}

// ─── Backward Compat Shims ────────────────────────────────────────────────────

/** @deprecated Dùng saveSecure() hoặc savePlain() thay thế */
export function saveToStorage<T>(key: string, value: T): void {
    if (!isSecureDataKey(key)) {
        savePlain(key, value);
        return;
    }
    if (!_activeCryptoKey) {
        console.error(`[saveToStorage] Khong the luu secure key "${key}" khi du lieu dang khoa.`);
        return;
    }
    populateSecureCache(key, value);
    void saveSecure(key, value, _activeCryptoKey);
}

/**
 * @deprecated Dùng readSecure() thay thế cho data nhạy cảm.
 * Shim này đọc RAM cache trước (populate từ CryptoContext sau unlock),
 * sau đó fallback sang readPlain cho plain data.
 */
export const readFromStorage = <T,>(key: string, fallback: T): T => {
    if (Object.prototype.hasOwnProperty.call(_ramCache, key)) {
        return _ramCache[key] as T;
    }
    if (isSecureDataKey(key)) return fallback;
    return readPlain(key, fallback);
};

/** @deprecated Dùng hasSecureData() + verifyPin() thay thế */
export const getSessionPin = (): string | null => sessionStorage.getItem('USER_PIN');
/** @deprecated */
export const setSessionPin = (pin: string): void => { sessionStorage.setItem('USER_PIN', pin); };
/** @deprecated Dùng verifyPin() thay thế */
export const decryptData = (_payload: string | null, defaultValue: any = null): any => defaultValue;
/** @deprecated */
export const encryptData = <T,>(_data: T): string | null => null;
