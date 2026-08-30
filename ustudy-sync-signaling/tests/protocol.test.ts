import { describe, expect, it } from 'vitest';
import {
  isAllowedOrigin,
  isValidSessionId,
  MAX_SIGNAL_BYTES,
  parseAllowedOrigins,
  parseSignalingMessage,
  SYNC_PROTOCOL,
} from '../src/protocol';

describe('signaling protocol validation', () => {
  it('accepts a six-character session code without ambiguous characters', () => {
    expect(isValidSessionId('K7M4Q2')).toBe(true);
    expect(isValidSessionId('K7M4Q2A')).toBe(false);
    expect(isValidSessionId('K7MOQ2')).toBe(false);
    expect(isValidSessionId('invalid-session')).toBe(false);
  });

  it('validates the configurable origin allowlist', () => {
    const allowlist = parseAllowedOrigins('https://ustudy.hakhoi.io.vn, https://preview.example');
    expect(isAllowedOrigin('https://ustudy.hakhoi.io.vn', allowlist)).toBe(true);
    expect(isAllowedOrigin('https://attacker.example', allowlist)).toBe(false);
  });

  it('accepts only supported protocol messages', () => {
    expect(parseSignalingMessage(JSON.stringify({ protocol: SYNC_PROTOCOL, type: 'offer', payload: {} }))).toMatchObject({ type: 'offer' });
    expect(() => parseSignalingMessage('{')).toThrow('INVALID_SIGNAL_MESSAGE');
    expect(() => parseSignalingMessage(JSON.stringify({ protocol: 'other', type: 'offer' }))).toThrow('UNSUPPORTED_SIGNAL_PROTOCOL');
    expect(() => parseSignalingMessage('x'.repeat(MAX_SIGNAL_BYTES + 1))).toThrow('INVALID_SIGNAL_MESSAGE');
  });
});
