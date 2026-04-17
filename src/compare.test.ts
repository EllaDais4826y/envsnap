import { summarizeComparison, formatCompareOutput, CompareResult } from './compare';

const mockResult: CompareResult = {
  snapshotA: 'snap-a',
  snapshotB: 'snap-b',
  added: { NEW_VAR: 'new' },
  removed: { OLD_VAR: 'old' },
  changed: { CHANGED: { from: 'before', to: 'after' } },
  unchanged: { STABLE: 'value' },
  summary: '',
};

describe('summarizeComparison', () => {
  it('includes snapshot names', () => {
    const out = summarizeComparison(mockResult);
    expect(out).toContain('snap-a');
    expect(out).toContain('snap-b');
  });

  it('reports correct counts', () => {
    const out = summarizeComparison(mockResult);
    expect(out).toContain('Added:     1');
    expect(out).toContain('Removed:   1');
    expect(out).toContain('Changed:   1');
    expect(out).toContain('Unchanged: 1');
  });
});

describe('formatCompareOutput', () => {
  it('returns summary only when not verbose', () => {
    mockResult.summary = summarizeComparison(mockResult);
    const out = formatCompareOutput(mockResult, false);
    expect(out).toBe(mockResult.summary);
  });

  it('includes diff details when verbose', () => {
    mockResult.summary = summarizeComparison(mockResult);
    const out = formatCompareOutput(mockResult, true);
    expect(out).toContain('NEW_VAR');
    expect(out).toContain('OLD_VAR');
    expect(out).toContain('CHANGED');
  });
});
