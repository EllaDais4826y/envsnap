import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getSnapshotAgeReport, formatSnapshotAgeReport } from './snapshot-age';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-age-'));
}

function writeSnapshot(dir: string, name: string, vars: Record<string, string> = {}): void {
  fs.writeFileSync(
    path.join(dir, `${name}.json`),
    JSON.stringify({ name, timestamp: new Date().toISOString(), variables: vars }),
    'utf-8'
  );
}

describe('getSnapshotAgeReport', () => {
  it('returns empty report when no snapshots exist', () => {
    const dir = makeTmpDir();
    const report = getSnapshotAgeReport(dir);
    expect(report.entries).toHaveLength(0);
    expect(report.oldest).toBeNull();
    expect(report.newest).toBeNull();
  });

  it('returns entries for each snapshot', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'alpha');
    writeSnapshot(dir, 'beta');
    const report = getSnapshotAgeReport(dir);
    expect(report.entries).toHaveLength(2);
    const names = report.entries.map((e) => e.name);
    expect(names).toContain('alpha');
    expect(names).toContain('beta');
  });

  it('entries have numeric ageMs and ageDays', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap1');
    const report = getSnapshotAgeReport(dir);
    const entry = report.entries[0];
    expect(entry.ageMs).toBeGreaterThanOrEqual(0);
    expect(entry.ageDays).toBeGreaterThanOrEqual(0);
  });

  it('sets newest and oldest correctly for single snapshot', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'only');
    const report = getSnapshotAgeReport(dir);
    expect(report.newest?.name).toBe('only');
    expect(report.oldest?.name).toBe('only');
  });

  it('entries are sorted newest first', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'first');
    writeSnapshot(dir, 'second');
    const report = getSnapshotAgeReport(dir);
    expect(report.entries[0].ageMs).toBeLessThanOrEqual(report.entries[report.entries.length - 1].ageMs);
  });
});

describe('formatSnapshotAgeReport', () => {
  it('returns no-snapshots message for empty report', () => {
    const output = formatSnapshotAgeReport({ entries: [], oldest: null, newest: null });
    expect(output).toBe('No snapshots found.');
  });

  it('includes snapshot names and age labels', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'mysnap');
    const report = getSnapshotAgeReport(dir);
    const output = formatSnapshotAgeReport(report);
    expect(output).toContain('mysnap');
    expect(output).toContain('ago');
  });

  it('includes Newest and Oldest summary lines', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-a');
    writeSnapshot(dir, 'snap-b');
    const report = getSnapshotAgeReport(dir);
    const output = formatSnapshotAgeReport(report);
    expect(output).toContain('Newest:');
    expect(output).toContain('Oldest:');
  });
});
