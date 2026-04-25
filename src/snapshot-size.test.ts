import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getSnapshotSizeReport, formatSnapshotSizeReport } from './snapshot-size';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-size-'));
}

function writeSnapshot(dir: string, name: string, vars: Record<string, string>): void {
  fs.writeFileSync(
    path.join(dir, `${name}.json`),
    JSON.stringify({ name, vars, createdAt: new Date().toISOString() })
  );
}

describe('getSnapshotSizeReport', () => {
  it('returns empty report when no snapshots exist', () => {
    const dir = makeTmpDir();
    const report = getSnapshotSizeReport(dir);
    expect(report.entries).toHaveLength(0);
    expect(report.totalBytes).toBe(0);
    expect(report.largestSnapshot).toBeNull();
    expect(report.smallestSnapshot).toBeNull();
  });

  it('reports size and var count for a single snapshot', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap1', { FOO: 'bar', BAZ: 'qux' });
    const report = getSnapshotSizeReport(dir);
    expect(report.entries).toHaveLength(1);
    expect(report.entries[0].name).toBe('snap1');
    expect(report.entries[0].varCount).toBe(2);
    expect(report.entries[0].sizeBytes).toBeGreaterThan(0);
    expect(report.largestSnapshot).toBe('snap1');
  });

  it('sorts entries by size descending', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'small', { A: '1' });
    writeSnapshot(dir, 'large', { A: '1', B: '2', C: '3', D: '4', E: '5' });
    const report = getSnapshotSizeReport(dir);
    expect(report.entries[0].name).toBe('large');
    expect(report.entries[1].name).toBe('small');
    expect(report.largestSnapshot).toBe('large');
    expect(report.smallestSnapshot).toBe('small');
  });

  it('accumulates totalBytes correctly', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'a', { X: 'hello' });
    writeSnapshot(dir, 'b', { Y: 'world' });
    const report = getSnapshotSizeReport(dir);
    const manual = report.entries.reduce((s, e) => s + e.sizeBytes, 0);
    expect(report.totalBytes).toBe(manual);
  });
});

describe('formatSnapshotSizeReport', () => {
  it('returns a message when no snapshots', () => {
    const report = { entries: [], totalBytes: 0, largestSnapshot: null, smallestSnapshot: null };
    expect(formatSnapshotSizeReport(report)).toBe('No snapshots found.');
  });

  it('includes snapshot name and var count in output', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'mysnap', { FOO: 'bar' });
    const report = getSnapshotSizeReport(dir);
    const output = formatSnapshotSizeReport(report);
    expect(output).toContain('mysnap');
    expect(output).toContain('1 vars');
    expect(output).toContain('KB');
  });
});
