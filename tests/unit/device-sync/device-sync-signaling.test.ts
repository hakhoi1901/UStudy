import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEVICE_SYNC_PROTOCOL } from '../../../src/features/device-sync/services/sync-protocol';
import { buildDeviceSyncWebSocketUrl, createDeviceSyncSessionId, DeviceSyncSignalingClient } from '../../../src/features/device-sync/services/signaling';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('device sync signaling contract', () => {
  it('generates a Worker-compatible session locator', () => {
    const sessionId = createDeviceSyncSessionId();
    expect(sessionId).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });

  it('connects through the deterministic Durable Object route', () => {
    expect(buildDeviceSyncWebSocketUrl(
      'https://ustudy-sync-signaling.hakhoi1901.workers.dev/',
      'K7M4Q2',
      'receiver',
    )).toBe('wss://ustudy-sync-signaling.hakhoi1901.workers.dev/session/K7M4Q2?role=receiver');
  });

  it('does not construct a socket URL for an invalid session locator', () => {
    expect(() => buildDeviceSyncWebSocketUrl('https://example.test', 'invalid', 'sender')).toThrow('INVALID_SESSION_ID');
  });

  it('buffers a peer message that arrives before the socket open promise resumes', async () => {
    class EarlyMessageWebSocket extends EventTarget {
      static readonly OPEN = 1;
      readyState = 0;

      constructor(_url: string) {
        super();
        queueMicrotask(() => {
          const message = new Event('message');
          Object.defineProperty(message, 'data', {
            value: JSON.stringify({
              protocol: DEVICE_SYNC_PROTOCOL,
              type: 'public-key',
              role: 'sender',
              payload: { publicKey: 'early-key', nonce: 'early-nonce' },
            }),
          });
          this.dispatchEvent(message);
          this.readyState = EarlyMessageWebSocket.OPEN;
          this.dispatchEvent(new Event('open'));
        });
      }

      send() {}
      close() {}
    }

    vi.stubGlobal('WebSocket', EarlyMessageWebSocket);
    const client = await DeviceSyncSignalingClient.connect('https://example.test', 'K7M4Q2', 'receiver');
    const messages: string[] = [];
    client.onMessage = (message) => messages.push(String((message.payload as { publicKey?: string })?.publicKey));

    expect(messages).toEqual(['early-key']);
  });
});
