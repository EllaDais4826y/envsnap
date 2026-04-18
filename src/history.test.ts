import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getSnapshotHistory, formatHistoryOutput } from './history';
import { saveSnapshot } from './snapshot';

export function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-history-'));
}

export function writeSnapshot(
  dir: string,
  name: string,
  env: Record<string, string>,
  timestamp: number
): void {
  saveSnapshot(dir, name, { name, timestamp, env });
}

describe('getSnapshotHistory', () => {
  it('returns empty array when no snapshots exist', () => {
    const dir = makeTmpDir();
    expect(getSnapshotHistory(dir)).toEqual([]);
  });

  it('returns entries sorted by timestamp descending', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'old', { A: '1' }, 1000);
    writeSnapshot(dir, 'new', { B: '2', C: '3' }, 2000);

    const history = getSnapshotHistory(dir);
    expect(history).toHaveLength(2);
    expect(history[0].name).toBe('new');
    expect(history[0].keyCount).toBe(2);
    expect(history[1].name).toBe('old');
    expect(history[1].keyCount).toBe(1);
  });

  it('includes keys in each entry', () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap', { FOO: 'bar', BAZ: 'qux' }, 3000);
    const history = getSnapshotHistory(dir);
    expect(history[0].keys).toEqual(expect.arrayContaining(['FOO', 'BAZ']));
  });
});

describe('formatHistoryOutput', () => {
  it('returns message when no entries', () => {
    expect(formatHistoryOutput([])).toBe('No snapshots found.');
  });

  it('formats entries with name, date, and key count', () => {
    const entries = [{ name: 'snap1', timestamp: 0, keyCount: 3, keys: ['A', 'B', 'C'] }];
    const output = formatHistoryOutput(entries);
    expect(output).toContain('snap1');
    expect(output).toContain('Keys:   3');
    expect(output).toContain('Date:');
  });
});
