import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  findDuplicateSnapshots,
  formatDuplicatesReport,
  DuplicatesReport,
} from './snapshot-duplicates';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-dup-'));
}

function writeSnapshot(
  dir: string,
  name: string,
  vars: Record<string, string>
): void {
  const snap = { name, timestamp: new Date().toISOString(), vars };
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(snap));
}

describe('findDuplicateSnapshots', () => {
  it('returns empty groups when no duplicates exist', async () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-a', { FOO: 'bar' });
    writeSnapshot(dir, 'snap-b', { FOO: 'baz' });
    const report = await findDuplicateSnapshots(dir);
    expect(report.groups).toHaveLength(0);
    expect(report.totalDuplicates).toBe(0);
  });

  it('detects snapshots with identical vars', async () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-a', { FOO: 'bar', BAZ: 'qux' });
    writeSnapshot(dir, 'snap-b', { FOO: 'bar', BAZ: 'qux' });
    writeSnapshot(dir, 'snap-c', { DIFFERENT: 'value' });
    const report = await findDuplicateSnapshots(dir);
    expect(report.groups).toHaveLength(1);
    expect(report.groups[0].snapshots).toContain('snap-a');
    expect(report.groups[0].snapshots).toContain('snap-b');
    expect(report.totalDuplicates).toBe(1);
  });

  it('handles multiple duplicate groups', async () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'a1', { X: '1' });
    writeSnapshot(dir, 'a2', { X: '1' });
    writeSnapshot(dir, 'b1', { Y: '2' });
    writeSnapshot(dir, 'b2', { Y: '2' });
    const report = await findDuplicateSnapshots(dir);
    expect(report.groups).toHaveLength(2);
    expect(report.totalDuplicates).toBe(2);
  });
});

describe('formatDuplicatesReport', () => {
  it('returns no-duplicates message when groups are empty', () => {
    const report: DuplicatesReport = { groups: [], totalDuplicates: 0 };
    expect(formatDuplicatesReport(report)).toBe(
      'No duplicate snapshots found.'
    );
  });

  it('formats duplicate groups correctly', () => {
    const report: DuplicatesReport = {
      groups: [{ hash: 'abc123', snapshots: ['snap-a', 'snap-b'] }],
      totalDuplicates: 1,
    };
    const output = formatDuplicatesReport(report);
    expect(output).toContain('abc123');
    expect(output).toContain('snap-a');
    expect(output).toContain('snap-b');
    expect(output).toContain('1 duplicate');
  });
});
