import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getSnapshotsToRemove, pruneSnapshots } from './prune';
import { saveSnapshot } from './snapshot';
import { saveTags } from './tag';

describe('getSnapshotsToRemove', () => {
  it('removes oldest untagged snapshots beyond keepLast', () => {
    const snapshots = ['a', 'b', 'c', 'd', 'e', 'f'];
    const tags = { prod: 'a' };
    const result = getSnapshotsToRemove(snapshots, tags, 3);
    expect(result).toEqual(['b', 'c']);
  });

  it('keeps all if count <= keepLast', () => {
    const snapshots = ['a', 'b', 'c'];
    const result = getSnapshotsToRemove(snapshots, {}, 5);
    expect(result).toEqual([]);
  });

  it('does not remove tagged snapshots', () => {
    const snapshots = ['a', 'b', 'c', 'd'];
    const tags = { t1: 'a', t2: 'b' };
    const result = getSnapshotsToRemove(snapshots, tags, 1);
    expect(result).toEqual(['c']);
  });
});

describe('pruneSnapshots', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-prune-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('removes old snapshots from disk', async () => {
    for (let i = 0; i < 4; i++) {
      await saveSnapshot(tmpDir, { [`KEY${i}`]: `val${i}` }, `snap-${i}`);
    }
    const result = await pruneSnapshots(tmpDir, { keepLast: 2 });
    expect(result.removed).toHaveLength(2);
    for (const id of result.removed) {
      expect(fs.existsSync(path.join(tmpDir, `${id}.json`))).toBe(false);
    }
  });

  it('dry run does not delete files', async () => {
    for (let i = 0; i < 4; i++) {
      await saveSnapshot(tmpDir, { [`KEY${i}`]: `val${i}` }, `snap-${i}`);
    }
    const result = await pruneSnapshots(tmpDir, { keepLast: 2, dryRun: true });
    expect(result.removed).toHaveLength(2);
    for (const id of result.removed) {
      expect(fs.existsSync(path.join(tmpDir, `${id}.json`))).toBe(true);
    }
  });
});
