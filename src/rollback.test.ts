import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getPreviousSnapshot, rollbackSnapshot } from './rollback';
import { saveSnapshot } from './snapshot';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-rollback-'));
}

function writeSnap(dir: string, name: string, vars: Record<string, string>, offsetMs: number) {
  saveSnapshot(dir, name, { name, vars, createdAt: new Date(Date.now() - offsetMs).toISOString() });
  const filePath = path.join(dir, `${name}.json`);
  const time = new Date(Date.now() - offsetMs);
  fs.utimesSync(filePath, time, time);
}

describe('getPreviousSnapshot', () => {
  it('returns the snapshot taken before the current one', () => {
    const dir = makeTmpDir();
    writeSnap(dir, 'snap-old', { A: '1' }, 3000);
    writeSnap(dir, 'snap-mid', { A: '2' }, 2000);
    writeSnap(dir, 'snap-new', { A: '3' }, 1000);

    const prev = getPreviousSnapshot(dir, 'snap-new');
    expect(prev).toBe('snap-mid');
  });

  it('returns null when there is no previous snapshot', () => {
    const dir = makeTmpDir();
    writeSnap(dir, 'only-snap', { A: '1' }, 1000);

    const prev = getPreviousSnapshot(dir, 'only-snap');
    expect(prev).toBeNull();
  });

  it('returns null when current snapshot is not found', () => {
    const dir = makeTmpDir();
    writeSnap(dir, 'snap-a', { A: '1' }, 2000);

    const prev = getPreviousSnapshot(dir, 'nonexistent');
    expect(prev).toBeNull();
  });
});

describe('rollbackSnapshot', () => {
  it('returns success result with correct message', () => {
    const dir = makeTmpDir();
    writeSnap(dir, 'snap-old', { X: 'foo' }, 3000);
    writeSnap(dir, 'snap-new', { X: 'bar' }, 1000);

    const result = rollbackSnapshot(dir, 'snap-new');
    expect(result.success).toBe(true);
    expect(result.restoredSnapshot).toBe('snap-old');
    expect(result.previousSnapshot).toBe('snap-new');
    expect(result.message).toContain('snap-old');
  });

  it('returns failure when no previous snapshot exists', () => {
    const dir = makeTmpDir();
    writeSnap(dir, 'only', { X: '1' }, 1000);

    const result = rollbackSnapshot(dir, 'only');
    expect(result.success).toBe(false);
    expect(result.message).toContain('No previous snapshot');
  });
});
