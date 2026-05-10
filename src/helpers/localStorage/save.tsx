/**
 * save.tsx — Secure Storage Layer
 *
 * Kiến trúc:
 *  - PBKDF2 (310,000 iterations) + AES-GCM 256-bit (Web Crypto API)
 *  - CryptoKey chỉ sống trong RAM (React Context) — không bao giờ ghi ra storage
 *  - Random Salt 16 bytes (lưu plain), Random IV 12 bytes mỗi lần encrypt
 *  - Test blob '__pin_verify__' để verify PIN nhanh
 *
 * Phân tầng:
 *  - savePlain / readPlain  → settings không nhạy cảm (faculty, semester, ...)
 *  - saveSecure / readSecure → data nhạy cảm (student_db, grades, ...)
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

/** Keys nội bộ của hệ thống bảo mật, không export ra STORAGE_KEYS */
const INTERNAL_KEYS = {
    SALT: '__pbkdf2_salt__',
    PIN_VERIFY: '__pin_verify__',
    FAIL_COUNT: '__fail_count__',
    LOCKOUT_UNTIL: '__lockout_until__',
} as const;

/** Keys dữ liệu nhạy cảm cần re-encrypt khi đổi PIN */
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
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(pin),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false, // không exportable
        ['encrypt', 'decrypt']
    );
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
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(plaintext));
}

// ─── Public: Plain Storage ────────────────────────────────────────────────────

/** Lưu dữ liệu KHÔNG nhạy cảm (settings, page, ...) — không mã hóa */
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

/** Lưu dữ liệu nhạy cảm — mã hóa AES-GCM với CryptoKey */
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
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        const decrypted = await decryptWithKey(raw, cryptoKey);
        return decrypted as T;
    } catch {
        return fallback;
    }
}

// ─── PIN Management ───────────────────────────────────────────────────────────

/**
 * Thiết lập PIN lần đầu:
 * 1. Tạo salt mới
 * 2. Derive key
 * 3. Lưu test blob để verify nhanh sau này
 * @returns CryptoKey đã sẵn sàng dùng
 */
export async function setupPin(pin: string): Promise<CryptoKey> {
    // Tạo salt mới (ghi đè salt cũ nếu có)
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    localStorage.setItem(INTERNAL_KEYS.SALT, toBase64(salt));

    const key = await deriveKey(pin, salt);

    // Lưu test blob
    await saveSecure(INTERNAL_KEYS.PIN_VERIFY, { ok: true, ts: Date.now() }, key);

    return key;
}

/**
 * Xác minh PIN mà không ghi bất kỳ thứ gì vào storage
 * @returns CryptoKey nếu PIN đúng, null nếu sai
 */
export async function verifyPin(pin: string): Promise<CryptoKey | null> {
    try {
        const saltRaw = localStorage.getItem(INTERNAL_KEYS.SALT);
        if (!saltRaw) return null;
        const salt = fromBase64(saltRaw);
        const key = await deriveKey(pin, salt);

        const verifyPayload = localStorage.getItem(INTERNAL_KEYS.PIN_VERIFY);
        if (!verifyPayload) return null;

        const result = await decryptWithKey(verifyPayload, key) as any;
        if (result?.ok === true) return key;
        return null;
    } catch {
        return null;
    }
}

/**
 * Đổi PIN:
 * 1. Decrypt toàn bộ SECURE_DATA_KEYS bằng oldKey
 * 2. Tạo salt mới, derive newKey
 * 3. Re-encrypt toàn bộ bằng newKey (atomic)
 * @returns CryptoKey mới
 */
export async function changePin(oldKey: CryptoKey, newPin: string): Promise<CryptoKey> {
    // 1. Decrypt tất cả data hiện có
    const decryptedData: Record<string, unknown> = {};
    for (const k of SECURE_DATA_KEYS) {
        const raw = localStorage.getItem(k);
        if (raw) {
            try {
                decryptedData[k] = await decryptWithKey(raw, oldKey);
            } catch {
                // key không decrypt được thì bỏ qua (có thể là data plain cũ)
            }
        }
    }

    // 2. Tạo salt mới + derive key mới
    const newSalt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    localStorage.setItem(INTERNAL_KEYS.SALT, toBase64(newSalt));
    const newKey = await deriveKey(newPin, newSalt);

    // 3. Re-encrypt tất cả (atomic: chỉ ghi sau khi tất cả encrypt xong)
    const encryptedEntries: Array<[string, string]> = [];
    for (const [k, v] of Object.entries(decryptedData)) {
        const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
        const plaintext = new TextEncoder().encode(JSON.stringify(v));
        const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, newKey, plaintext);
        encryptedEntries.push([k, encodePayload(newSalt, iv, cipher)]);
    }

    // Ghi tất cả cùng lúc
    for (const [k, v] of encryptedEntries) {
        localStorage.setItem(k, v);
    }

    // Ghi test blob mới
    await saveSecure(INTERNAL_KEYS.PIN_VERIFY, { ok: true, ts: Date.now() }, newKey);

    return newKey;
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
    return !!(
        localStorage.getItem('__pin_verify__') ||
        localStorage.getItem('raw_student_db') ||
        localStorage.getItem('student_db_full')
    );
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
export const saveToStorage = savePlain;

/**
 * @deprecated Dùng readSecure() thay thế cho data nhạy cảm.
 * Shim này đọc RAM cache trước (populate từ CryptoContext sau unlock),
 * sau đó fallback sang readPlain cho plain data.
 */
export const readFromStorage = <T,>(key: string, fallback: T): T => {
    if (Object.prototype.hasOwnProperty.call(_ramCache, key)) {
        return _ramCache[key] as T;
    }
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