import { describe, it, expect, vi } from 'vitest';

describe('confetti', () => {
  it('returns undefined for null canvas', async () => {
    const { triggerConfetti } = await import('../../src/renderer/utils/confetti.js');
    expect(triggerConfetti(null, 100)).toBeUndefined();
  });

  it('returns undefined when getContext(2d) returns null', async () => {
    const { triggerConfetti } = await import('../../src/renderer/utils/confetti.js');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      expect(triggerConfetti(canvas, 100)).toBeUndefined();
    }
  });

  it('requests animation frame when canvas context is available', async () => {
    const { triggerConfetti } = await import('../../src/renderer/utils/confetti.js');
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 42);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 200;
      triggerConfetti(canvas, 500);
      expect(rafSpy).toHaveBeenCalled();
    }
    rafSpy.mockRestore();
  });
});
