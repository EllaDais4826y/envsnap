import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { buildStatsReport, formatStatsReport, getSnapshotStats } from './snapshot-stats';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-stats-'));
}

function writeSnapshot(dir: string, name: string, vars: Record<string, string>, createdAt: string) {
  fs.writeFileSync(
    path.join(dir, `${name}.json`),
    JSON.stringify({ name, vars, createdAt }),
    'utf-8'
  );
}

describe('getSnapshotStats', () => {
  it('returns correct stats for a snapshot', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap1', { A: '1', B: '2' }, '2024-01-01T00:00:00.000Z');
    const stats = getSnapshotStats(dir, 'snap1');
    expect(stats.name).toBe('snap1');
    expect(stats.varCount).toBe(2);
    expect(stats.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(stats.sizeBytes).toBeGreaterThan(0);
  });
});

describe('buildStatsReport', () => {
  it('returns empty report when no snapshots exist', () => {
    const dir = makeTmpDir();
    const report = buildStatsReport(dir);
    expect(report.totalSnapshots).toBe(0);
    expect(report.largestSnapshot).toBeNull();
  });

  it('returns correct report for multiple snapshots', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'a', { X: '1' }, '2024-01-01T00:00:00.000Z');
    writeSnapshot(dir, 'b', { X: '1', Y: '2', Z: '3' }, '2024-06-01T00:00:00.000Z');
    writeSnapshot(dir, 'c', { X: '1', Y: '2' }, '2024-03-01T00:00:00.000Z');
    const report = buildStatsReport(dir);
    expect(report.totalSnapshots).toBe(3);
    expect(report.totalVars).toBe(6);
    expect(report.avgVarsPerSnapshot).toBe(2);
    expect(report.largestSnapshot?.name).toBe('b');
    expect(report.smallestSnapshot?.name).toBe('a');
    expect(report.mostRecentSnapshot?.name).toBe('b');
  });
});

describe('formatStatsReport', () => {
  it('returns a no-snapshots message when empty', () => {
    const report = buildStatsReport(makeTmpDir());
    expect(formatStatsReport(report)).toBe('No snapshots found.');
  });

  it('formats a non-empty report as readable text', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap1', { A: '1' }, '2024-01-01T00:00:00.000Z');
    const report = buildStatsReport(dir);
    const output = formatStatsReport(report);
    expect(output).toContain('Total snapshots');
    expect(output).toContain('snap1');
    expect(output).toContain('Most recent');
  });
});
