import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getSnapshotStats, buildStatsReport, formatStatsReport } from './snapshot-stats';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-stats-test-'));
}

function writeSnapshot(dir: string, name: string, vars: Record<string, string>, createdAt?: string): void {
  const snapshot = { name, vars, createdAt: createdAt ?? new Date().toISOString() };
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(snapshot));
}

describe('getSnapshotStats', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true }); });

  it('returns zero stats for empty directory', async () => {
    const stats = await getSnapshotStats(tmpDir);
    expect(stats.total).toBe(0);
    expect(stats.totalVars).toBe(0);
    expect(stats.avgVarsPerSnapshot).toBe(0);
  });

  it('counts snapshots and variables correctly', async () => {
    writeSnapshot(tmpDir, 'snap1', { A: '1', B: '2' });
    writeSnapshot(tmpDir, 'snap2', { C: '3' });
    const stats = await getSnapshotStats(tmpDir);
    expect(stats.total).toBe(2);
    expect(stats.totalVars).toBe(3);
    expect(stats.avgVarsPerSnapshot).toBe(1.5);
  });

  it('identifies largest snapshot', async () => {
    writeSnapshot(tmpDir, 'small', { A: '1' });
    writeSnapshot(tmpDir, 'large', { A: '1', B: '2', C: '3', D: '4' });
    const stats = await getSnapshotStats(tmpDir);
    expect(stats.largestSnapshot?.name).toBe('large');
    expect(stats.largestSnapshot?.varCount).toBe(4);
  });

  it('identifies newest and oldest snapshots', async () => {
    writeSnapshot(tmpDir, 'old', { A: '1' }, '2023-01-01T00:00:00.000Z');
    writeSnapshot(tmpDir, 'new', { B: '2' }, '2024-06-01T00:00:00.000Z');
    const stats = await getSnapshotStats(tmpDir);
    expect(stats.newestSnapshot?.name).toBe('new');
    expect(stats.oldestSnapshot?.name).toBe('old');
  });
});

describe('buildStatsReport', () => {
  it('builds a report with correct fields', () => {
    const stats = {
      total: 3,
      totalVars: 9,
      avgVarsPerSnapshot: 3,
      largestSnapshot: { name: 'big', varCount: 5 },
      newestSnapshot: { name: 'new', createdAt: '2024-06-01T00:00:00.000Z' },
      oldestSnapshot: { name: 'old', createdAt: '2023-01-01T00:00:00.000Z' },
    };
    const report = buildStatsReport(stats);
    expect(report).toContain('big');
    expect(report).toContain('3');
  });
});

describe('formatStatsReport', () => {
  it('formats output with labels', () => {
    const output = formatStatsReport(2, 6, 3, 'snap-a', 'snap-b');
    expect(output).toContain('Total Snapshots');
    expect(output).toContain('2');
    expect(output).toContain('snap-a');
  });
});
