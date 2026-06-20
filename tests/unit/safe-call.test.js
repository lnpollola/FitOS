import { describe, it, expect } from 'vitest';
import { safeCall } from '../../src/renderer/utils/safe-call.js';

describe('safeCall', () => {
  it('returns resolved value on success', async () => {
    const result = await safeCall(Promise.resolve(42), null);
    expect(result).toBe(42);
  });

  it('returns fallback on rejection', async () => {
    const result = await safeCall(Promise.reject(new Error('fail')), 'fallback');
    expect(result).toBe('fallback');
  });

  it('returns null as default fallback', async () => {
    const result = await safeCall(Promise.reject(new Error('fail')));
    expect(result).toBeNull();
  });

  it('returns empty array fallback', async () => {
    const result = await safeCall(Promise.reject(new Error('fail')), []);
    expect(result).toEqual([]);
  });
});
