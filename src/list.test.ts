import { getSnapshotSummaries, formatSnapshotList } from './list';
import * as snapshotModule from './snapshot';

jest.mock('./snapshot');

const mockListSnapshots = snapshotModule.listSnapshots as jest.MockedFunction<typeof snapshotModule.listSnapshots>;
const mockLoadSnapshot = snapshotModule.loadSnapshot as jest.MockedFunction<typeof snapshotModule.loadSnapshot>;

describe('getSnapshotSummaries', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns summaries for all snapshots', async () => {
    mockListSnapshots.mockResolvedValue(['snap1', 'snap2']);
    mockLoadSnapshot
      .mockResolvedValueOnce({ timestamp: '2024-01-01T00:00:00.000Z', env: { A: '1', B: '2' } })
      .mockResolvedValueOnce({ timestamp: '2024-01-02T00:00:00.000Z', env: { X: 'y' } });

    const result = await getSnapshotSummaries();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'snap1', timestamp: '2024-01-01T00:00:00.000Z', varCount: 2 });
    expect(result[1]).toEqual({ name: 'snap2', timestamp: '2024-01-02T00:00:00.000Z', varCount: 1 });
  });

  it('skips snapshots that fail to load', async () => {
    mockListSnapshots.mockResolvedValue(['good', 'bad']);
    mockLoadSnapshot
      .mockResolvedValueOnce({ timestamp: '2024-01-01T00:00:00.000Z', env: { A: '1' } })
      .mockRejectedValueOnce(new Error('read error'));

    const result = await getSnapshotSummaries();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('good');
  });

  it('returns empty array when no snapshots exist', async () => {
    mockListSnapshots.mockResolvedValue([]);
    const result = await getSnapshotSummaries();
    expect(result).toEqual([]);
  });
});

describe('formatSnapshotList', () => {
  it('returns message when no snapshots', () => {
    expect(formatSnapshotList([])).toBe('No snapshots found.');
  });

  it('formats summaries into a table', () => {
    const summaries = [{ name: 'mysnap', timestamp: '2024-06-01T12:00:00.000Z', varCount: 5 }];
    const output = formatSnapshotList(summaries);
    expect(output).toContain('mysnap');
    expect(output).toContain('5');
    expect(output).toContain('NAME');
  });
});
