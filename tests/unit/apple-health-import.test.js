import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { isValidHealthsyncBinary, buildStagingPath, atomicSwap } from '../../src/main/apple-health-import.js';

describe('isValidHealthsyncBinary', () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fitos-test-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns false for missing file', () => {
    expect(isValidHealthsyncBinary(path.join(tmpDir, 'nope'))).toBe(false);
  });

  it('returns false for empty file', () => {
    const f = path.join(tmpDir, 'empty');
    fs.writeFileSync(f, '');
    expect(isValidHealthsyncBinary(f)).toBe(false);
  });

  it('returns false for ASCII stub (9 bytes "Not Found")', () => {
    const f = path.join(tmpDir, 'stub');
    fs.writeFileSync(f, 'Not Found');
    expect(isValidHealthsyncBinary(f)).toBe(false);
  });

  it('returns false for too-small ELF (right magic but <1MB)', () => {
    const f = path.join(tmpDir, 'tiny-elf');
    const buf = Buffer.alloc(64);
    buf.write('\x7fELF', 0, 4, 'binary');
    fs.writeFileSync(f, buf);
    expect(isValidHealthsyncBinary(f)).toBe(false);
  });

  it('returns true for valid ELF (≥1MB)', () => {
    const f = path.join(tmpDir, 'elf');
    const buf = Buffer.alloc(1024 * 1024 + 100);
    buf.write('\x7fELF', 0, 4, 'binary');
    fs.writeFileSync(f, buf);
    expect(isValidHealthsyncBinary(f)).toBe(true);
  });

  it('returns true for valid Mach-O 64 LE (≥1MB)', () => {
    const f = path.join(tmpDir, 'macho');
    const buf = Buffer.alloc(1024 * 1024 + 100);
    buf.write('\xcf\xfa\xed\xfe', 0, 4, 'binary');
    fs.writeFileSync(f, buf);
    expect(isValidHealthsyncBinary(f)).toBe(true);
  });

  it('returns true for valid PE (≥1MB)', () => {
    const f = path.join(tmpDir, 'pe');
    const buf = Buffer.alloc(1024 * 1024 + 100);
    buf.write('MZ\x90\x00', 0, 4, 'binary');
    fs.writeFileSync(f, buf);
    expect(isValidHealthsyncBinary(f)).toBe(true);
  });

  it('returns false for 1MB+ ASCII text', () => {
    const f = path.join(tmpDir, 'big-text');
    fs.writeFileSync(f, 'x'.repeat(1024 * 1024 + 100));
    expect(isValidHealthsyncBinary(f)).toBe(false);
  });
});

describe('buildStagingPath', () => {
  it('returns a path in os.tmpdir() with the healthsync-staging- prefix', () => {
    const p = buildStagingPath();
    expect(p.startsWith(os.tmpdir())).toBe(true);
    expect(path.basename(p)).toMatch(/^healthsync-staging-\d+-\d+\.db$/);
  });

  it('returns unique paths for sequential calls', async () => {
    const p1 = buildStagingPath();
    await new Promise((r) => setTimeout(r, 5));
    const p2 = buildStagingPath();
    expect(p1).not.toBe(p2);
  });
});

describe('atomicSwap', () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fitos-swap-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('moves src to dst and removes src on same filesystem', () => {
    const src = path.join(tmpDir, 'src');
    const dst = path.join(tmpDir, 'dst');
    fs.writeFileSync(src, 'hello');
    expect(atomicSwap(src, dst)).toBe(true);
    expect(fs.existsSync(dst)).toBe(true);
    expect(fs.existsSync(src)).toBe(false);
    expect(fs.readFileSync(dst, 'utf-8')).toBe('hello');
  });

  it('returns false if src does not exist', () => {
    const dst = path.join(tmpDir, 'dst');
    expect(atomicSwap(path.join(tmpDir, 'nope'), dst)).toBe(false);
  });

  it('leaves dst untouched when swap fails (simulated parse failure)', () => {
    const dst = path.join(tmpDir, 'dst');
    const original = 'original-content-untouched';
    fs.writeFileSync(dst, original);
    const originalMtime = fs.statSync(dst).mtimeMs;
    const fakeStaging = path.join(tmpDir, 'nope-staging');
    expect(atomicSwap(fakeStaging, dst)).toBe(false);
    expect(fs.readFileSync(dst, 'utf-8')).toBe(original);
    expect(fs.statSync(dst).mtimeMs).toBe(originalMtime);
  });

  it('replaces dst with new content on successful swap', () => {
    const src = path.join(tmpDir, 'staging.db');
    const dst = path.join(tmpDir, 'real.db');
    fs.writeFileSync(src, 'new-parse-output');
    fs.writeFileSync(dst, 'old-content');
    expect(atomicSwap(src, dst)).toBe(true);
    expect(fs.readFileSync(dst, 'utf-8')).toBe('new-parse-output');
    expect(fs.existsSync(src)).toBe(false);
  });
});
