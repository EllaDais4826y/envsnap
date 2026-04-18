import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getSnapshotHistory, formatHistoryOutput } from './history';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-history-'));
}

function writeSnapshot(dir: string, name: string, content: object): void {
  fs.writeFileSync(
    path.join(dir, `${name}.json`),
    JSON.stringify(content),
    'utf-8'
  );
}

describe('getSnapshotHistory', () => {
  it('returns empty array when no snapshots exist', () => {
    const dir = makeTmpDir();
    const result = getSnapshotHistory(dir);
    expect(result).toEqual([]);
  });

  it('returns entries for each snapshot', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-a', { NODE_ENV: 'test' });
    writeSnapshot(dir, 'snap-b', { NODE_ENV: 'prod' });
    const result = getSnapshotHistory(dir);
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.name)).toEqual(
      expect.arrayContaining(['snap-a', 'snap-b'])
    );
  });

  it('respects limit parameter', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-1', {});
    writeSnapshot(dir, 'snap-2', {});
    writeSnapshot(dir, 'snap-3', {});
    const result = getSnapshotHistory(dir, 2);
    expect(result).toHaveLength(2);
  });

  it('includes size > 0 for non-empty snapshot files', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-x', { KEY: 'value' });
    const result = getSnapshotHistory(dir);
    expect(result[0].size).toBeGreaterThan(0);
  });
});

describe('formatHistoryOutput', () => {
  it('returns message when no entries', () => {
    expect(formatHistoryOutput([])).toBe('No snapshots found.');
  });

  it('includes entry name in output', () => {
    const entries = [
      { name: 'my-snap', createdAt: new Date().toISOString(), size: 128 },
    ];
    const output = formatHistoryOutput(entries);
    expect(output).toContain('my-snap');
    expect(output).toContain('128B');
  });
});
