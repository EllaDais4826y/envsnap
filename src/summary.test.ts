import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSnapshotSummaries, formatSummaryOutput } from './summary';
import * as snapshotModule from './snapshot';

const mockSnapshots: Record<string, any> = {
  'snap-a': { timestamp: '2024-01-01T00:00:00.000Z', env: { FOO: 'bar', BAZ: 'qux' } },
  'snap-b': { timestamp: '2024-02-01T00:00:00.000Z', env: { HELLO: 'world' } },
};

beforeEach(() => {
  vi.spyOn(snapshotModule, 'listSnapshots').mockResolvedValue(Object.keys(mockSnapshots));
  vi.spyOn(snapshotModule, 'loadSnapshot').mockImplementation(async (_dir, name) => mockSnapshots[name]);
});

describe('getSnapshotSummaries', () => {
  it('returns a summary for each snapshot', async () => {
    const summaries = await getSnapshotSummaries('/tmp/snaps');
    expect(summaries).toHaveLength(2);
    expect(summaries[0].name).toBe('snap-a');
    expect(summaries[0].keyCount).toBe(2);
    expect(summaries[1].name).toBe('snap-b');
    expect(summaries[1].keyCount).toBe(1);
  });

  it('calculates sizeBytes correctly', async () => {
    const summaries = await getSnapshotSummaries('/tmp/snaps');
    const expected = Buffer.byteLength(JSON.stringify(mockSnapshots['snap-a'].env), 'utf8');
    expect(summaries[0].sizeBytes).toBe(expected);
  });

  it('returns empty array when no snapshots exist', async () => {
    vi.spyOn(snapshotModule, 'listSnapshots').mockResolvedValue([]);
    const summaries = await getSnapshotSummaries('/tmp/snaps');
    expect(summaries).toEqual([]);
  });
});

describe('formatSummaryOutput', () => {
  it('returns message when no summaries', () => {
    expect(formatSummaryOutput([])).toBe('No snapshots found.');
  });

  it('includes header and rows', () => {
    const summaries = [
      { name: 'snap-a', timestamp: '2024-01-01T00:00:00.000Z', keyCount: 2, sizeBytes: 20 },
    ];
    const output = formatSummaryOutput(summaries);
    expect(output).toContain('Name');
    expect(output).toContain('snap-a');
    expect(output).toContain('2');
  });
});
