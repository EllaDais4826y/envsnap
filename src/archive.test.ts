import fs from 'fs';
import os from 'os';
import path from 'path';
import { archiveSnapshot, unarchiveSnapshot, listArchive, loadArchive } from './archive';
import { saveSnapshot } from './snapshot';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-archive-'));
}

describe('archiveSnapshot', () => {
  it('moves snapshot to archive and removes file', () => {
    const dir = makeTmpDir();
    saveSnapshot(dir, 'mysnap', { FOO: 'bar' });
    const entry = archiveSnapshot(dir, 'mysnap');
    expect(entry.name).toBe('mysnap');
    expect(entry.snapshot).toEqual({ FOO: 'bar' });
    expect(fs.existsSync(path.join(dir, 'mysnap.json'))).toBe(false);
    const archive = loadArchive(dir);
    expect(archive).toHaveLength(1);
  });

  it('throws if snapshot not found', () => {
    const dir = makeTmpDir();
    expect(() => archiveSnapshot(dir, 'ghost')).toThrow('not found');
  });

  it('throws if already archived', () => {
    const dir = makeTmpDir();
    saveSnapshot(dir, 'snap', { A: '1' });
    archiveSnapshot(dir, 'snap');
    expect(() => archiveSnapshot(dir, 'snap')).toThrow('already archived');
  });
});

describe('unarchiveSnapshot', () => {
  it('restores snapshot from archive', () => {
    const dir = makeTmpDir();
    saveSnapshot(dir, 'snap', { X: 'y' });
    archiveSnapshot(dir, 'snap');
    const entry = unarchiveSnapshot(dir, 'snap');
    expect(entry.name).toBe('snap');
    expect(fs.existsSync(path.join(dir, 'snap.json'))).toBe(true);
    expect(loadArchive(dir)).toHaveLength(0);
  });

  it('throws if not in archive', () => {
    const dir = makeTmpDir();
    expect(() => unarchiveSnapshot(dir, 'nope')).toThrow('No archived snapshot');
  });
});

describe('listArchive', () => {
  it('returns empty array when no archive', () => {
    const dir = makeTmpDir();
    expect(listArchive(dir)).toEqual([]);
  });

  it('lists archived entries', () => {
    const dir = makeTmpDir();
    saveSnapshot(dir, 'a', { K: 'v' });
    archiveSnapshot(dir, 'a');
    const list = listArchive(dir);
    expect(list[0].name).toBe('a');
  });
});
