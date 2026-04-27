import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  cleanupSnapshots,
  formatCleanupOutput,
  getSnapshotsOlderThan,
  getSnapshotsBeyondKeepLatest,
} from './snapshot-cleanup';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-cleanup-'));
}

function writeSnapshot(dir: string, name: string, ageDays = 0): void {
  const filePath = path.join(dir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ vars: {}, createdAt: new Date().toISOString() }));
  if (ageDays > 0) {
    const mtime = new Date(Date.now() - ageDays * 24 * 60 * 60 * 1000);
    fs.utimesSync(filePath, mtime, mtime);
  }
}

describe('getSnapshotsOlderThan', () => {
  it('returns snapshots older than the given days', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'old-snap', 10);
    writeSnapshot(dir, 'new-snap', 1);
    const result = getSnapshotsOlderThan(dir, 5);
    expect(result).toContain('old-snap');
    expect(result).not.toContain('new-snap');
  });
});

describe('getSnapshotsBeyondKeepLatest', () => {
  it('returns excess snapshots beyond keepLatest count', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-a', 3);
    writeSnapshot(dir, 'snap-b', 2);
    writeSnapshot(dir, 'snap-c', 1);
    const result = getSnapshotsBeyondKeepLatest(dir, 2);
    expect(result).toHaveLength(1);
    expect(result).toContain('snap-a');
  });

  it('returns empty array when count is within limit', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-x');
    const result = getSnapshotsBeyondKeepLatest(dir, 5);
    expect(result).toHaveLength(0);
  });
});

describe('cleanupSnapshots', () => {
  it('removes old snapshots when olderThanDays is set', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'stale', 20);
    writeSnapshot(dir, 'fresh', 1);
    const result = cleanupSnapshots(dir, { olderThanDays: 10 });
    expect(result.removed).toContain('stale');
    expect(result.kept).toContain('fresh');
    expect(fs.existsSync(path.join(dir, 'stale.json'))).toBe(false);
  });

  it('does not delete files in dry-run mode', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'old', 30);
    const result = cleanupSnapshots(dir, { olderThanDays: 5, dryRun: true });
    expect(result.removed).toContain('old');
    expect(result.dryRun).toBe(true);
    expect(fs.existsSync(path.join(dir, 'old.json'))).toBe(true);
  });
});

describe('formatCleanupOutput', () => {
  it('shows dry-run notice and removed list', () => {
    const output = formatCleanupOutput({ removed: ['snap1'], kept: ['snap2'], dryRun: true });
    expect(output).toContain('[dry-run]');
    expect(output).toContain('snap1');
  });

  it('shows no match message when nothing removed', () => {
    const output = formatCleanupOutput({ removed: [], kept: ['snap1'], dryRun: false });
    expect(output).toContain('No snapshots matched');
  });
});
