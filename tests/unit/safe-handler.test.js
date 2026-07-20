import { describe, it, expect, vi } from 'vitest';

describe('safeHandle', () => {
  it('returns ok:true with data on success', async () => {
    const { safeHandle } = await import('../../src/main/utils/safe-handler.js');
    const ipc = { handle: vi.fn() };
    safeHandle(ipc, 'test:channel', async () => 'result');
    const handler = ipc.handle.mock.calls[0][1];
    const result = await handler({});
    expect(result).toEqual('result');
  });

  it('returns ok:false with error on rejection', async () => {
    const { safeHandle } = await import('../../src/main/utils/safe-handler.js');
    const ipc = { handle: vi.fn() };
    safeHandle(ipc, 'test:channel', async () => { throw new Error('fail'); });
    const handler = ipc.handle.mock.calls[0][1];
    const result = await handler({});
    expect(result).toEqual({ ok: false, error: 'fail' });
  });

  it('logs error to console on rejection', async () => {
    const { safeHandle } = await import('../../src/main/utils/safe-handler.js');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ipc = { handle: vi.fn() };
    safeHandle(ipc, 'test:channel', async () => { throw new Error('hidden'); });
    const handler = ipc.handle.mock.calls[0][1];
    await handler({});
    expect(consoleSpy).toHaveBeenCalledWith('[test:channel]', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
