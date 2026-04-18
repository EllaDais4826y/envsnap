import { mergeSnapshots, mergeAndSave, MergeStrategy } from './merge';
import { loadSnapshot, saveSnapshot } from './snapshot';

jest.mock('./snapshot');

const mockLoad = loadSnapshot as jest.MockedFunction<typeof loadSnapshot>;
const mockSave = saveSnapshot as jest.MockedFunction<typeof saveSnapshot>;

const makeSnap = (vars: Record<string, string>) => ({
  id: 'x',
  name: 'x',
  timestamp: Date.now(),
  vars,
});

describe('mergeSnapshots', () => {
  it('merges non-conflicting keys', () => {
    const base = makeSnap({ A: '1', B: '2' });
    const other = makeSnap({ C: '3' });
    const { merged, conflicts } = mergeSnapshots(base, other);
    expect(merged).toEqual({ A: '1', B: '2', C: '3' });
    expect(conflicts).toHaveLength(0);
  });

  it('detects conflicts', () => {
    const base = makeSnap({ A: '1' });
    const other = makeSnap({ A: '2' });
    const { conflicts } = mergeSnapshots(base, other);
    expect(conflicts).toContain('A');
  });

  it('resolves conflict with ours strategy', () => {
    const base = makeSnap({ A: '1' });
    const other = makeSnap({ A: '2' });
    const { merged } = mergeSnapshots(base, other, 'ours');
    expect(merged.A).toBe('1');
  });

  it('resolves conflict with theirs strategy', () => {
    const base = makeSnap({ A: '1' });
    const other = makeSnap({ A: '2' });
    const { merged } = mergeSnapshots(base, other, 'theirs');
    expect(merged.A).toBe('2');
  });

  it('no conflict when values match', () => {
    const base = makeSnap({ A: '1' });
    const other = makeSnap({ A: '1' });
    const { conflicts } = mergeSnapshots(base, other);
    expect(conflicts).toHaveLength(0);
  });
});

describe('mergeAndSave', () => {
  it('loads, merges, and saves', async () => {
    mockLoad
      .mockResolvedValueOnce(makeSnap({ A: '1' }))
      .mockResolvedValueOnce(makeSnap({ B: '2' }));
    mockSave.mockResolvedValue(undefined);
    const result = await mergeAndSave('id1', 'id2', 'merged-snap');
    expect(result.merged).toEqual({ A: '1', B: '2' });
    expect(mockSave).toHaveBeenCalledWith('merged-snap', { A: '1', B: '2' });
  });
});
