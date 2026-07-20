import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load generator and channels dynamically (they're CJS)
// We import them via a dynamic require that vitest handles in jsdom
let generatePreload, generateWebApi, channels;
try {
  const gen = require('../../scripts/generate-api-bridge.js');
  generatePreload = gen.generatePreload;
  generateWebApi = gen.generateWebApi;
  const ch = require('../../src/shared/api-channels.js');
  channels = ch.channels;
} catch (e) {
  // Fallback inline if module resolution fails in test environment
}

describe('API Bridge Drift Detection', () => {
  const preloadPath = path.join(__dirname, '..', '..', 'src', 'preload', 'preload.js');
  const webApiPath = path.join(__dirname, '..', '..', 'src', 'renderer', 'utils', 'web-api.js');

  it('preload.js is fresh (matches generated output)', () => {
    const actual = fs.readFileSync(preloadPath, 'utf-8');
    const generated = generatePreload(channels, preloadPath);
    expect(generated).toBe(actual);
  });

  it('web-api.js is fresh (matches generated output)', () => {
    const actual = fs.readFileSync(webApiPath, 'utf-8');
    const generated = generateWebApi(channels, webApiPath);
    expect(generated).toBe(actual);
  });

  it('has at least 150 channels in manifest', () => {
    expect(channels.length).toBeGreaterThanOrEqual(150);
  });

  it('every channel has method, channel, and args fields', () => {
    for (const ch of channels) {
      expect(ch).toHaveProperty('channel');
      expect(ch).toHaveProperty('method');
      expect(ch).toHaveProperty('args');
      expect(typeof ch.channel).toBe('string');
      expect(typeof ch.method).toBe('string');
      expect(Number.isInteger(ch.args)).toBe(true);
    }
  });
});
