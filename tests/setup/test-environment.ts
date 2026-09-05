import { webcrypto } from 'node:crypto';
import { beforeEach } from 'vitest';

export class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

const local = new MemoryStorage();
const session = new MemoryStorage();

Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: local });
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: session });
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: Object.assign(globalThis, {
    location: { origin: 'https://ustudy.test' },
    dispatchEvent: () => true,
  }),
});

beforeEach(() => {
  local.clear();
  session.clear();
});
