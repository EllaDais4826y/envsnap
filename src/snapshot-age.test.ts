import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { formatAge, getSnapshotAgeReport, formatSnapshotAgeReport } from './snapshot-age';

export function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-age-'));
}

export function writeSnapshot(dir: string, name: string, vars: Record<string, string> = {}): void {
  fs.writeFileSync(
    path.join(dir, `${name}.json`),
    JSON.stringify({ name, timestamp: new Date().toISOString(), variables: vars })
  );
}

describe('formatAge', () => {
  it('formats seconds', () => {
    expect(formatAge(30_000)).toBe('30s ago');
  });

  it('formats minutes', () => {
    expect(formatAge(90_000)).toBe('1m 30s ago');
  });

  it('formats hours', () => {
    expect(formatAge(3_660_000)).toBe('1h 1m ago');
  });

  it('formats days', () => {
    expect(formatAge(90_000_000)).toBe('1d 1h ago');
  });
});

describe('getSnapshotAgeReport', () => {
  it('returns empty report when no snapshots', () => {
    const dir = makeTmpDir();
    const report = getSnapshotAgeReport(dir);
    expect(report.entries).toHaveLength(0);
    expect(report.oldest).toBeNull();
    expect(report.newest).toBeNull();
  });

  it('returns entries sorted newest first', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'alpha');
    writeSnapshot(dir, 'beta');
    const report = getSnapshotAgeReport(dir);
    expect(report.entries).toHaveLength(2);
    expect(report.entries[0].ageMs).toBeLessThanOrEqual(report.entries[1].ageMs);
  });

  it('identifies oldest and newest correctly', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap1');
    writeSnapshot(dir, 'snap2');
    const report = getSnapshotAgeReport(dir);
    expect(report.newest).not.toBeNull();
    expect(report.oldest).not.toBeNull();
  });
});

describe('formatSnapshotAgeReport', () => {
  it('returns message when no snapshots', () => {
    const output = formatSnapshotAgeReport({ entries: [], oldest: null, newest: null });
    expect(output).toBe('No snapshots found.');
  });

  it('includes snapshot names and age labels', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'mysnap');
    const report = getSnapshotAgeReport(dir);
    const output = formatSnapshotAgeReport(report);
    expect(output).toContain('mysnap');
    expect(output).toContain('Newest:');
    expect(output).toContain('Oldest:');
  });
});
