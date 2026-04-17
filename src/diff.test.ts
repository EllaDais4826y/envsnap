import { diffSnapshots, formatDiff } from './diff';
import { Snapshot } from './snapshot';

const makeSnapshot = (name: string, variables: Record<string, string>): Snapshot => ({
  name,
  createdAt: new Date().toISOString(),
  variables,
});

describe('diffSnapshots', () => {
  it('detects added keys', () => {
    const a = makeSnapshot('a', { FOO: 'bar' });
    const b = makeSnapshot('b', { FOO: 'bar', NEW_KEY: 'value' });
    const diff = diffSnapshots(a, b);
    expect(diff.added).toBe(1);
    expect(diff.removed).toBe(0);
    expect(diff.changed).toBe(0);
    expect(diff.entries[0]).toMatchObject({ key: 'NEW_KEY', status: 'added', newValue: 'value' });
  });

  it('detects removed keys', () => {
    const a = makeSnapshot('a', { FOO: 'bar', OLD: 'gone' });
    const b = makeSnapshot('b', { FOO: 'bar' });
    const diff = diffSnapshots(a, b);
    expect(diff.removed).toBe(1);
    expect(diff.entries[0]).toMatchObject({ key: 'OLD', status: 'removed', oldValue: 'gone' });
  });

  it('detects changed values', () => {
    const a = makeSnapshot('a', { FOO: 'old' });
    const b = makeSnapshot('b', { FOO: 'new' });
    const diff = diffSnapshots(a, b);
    expect(diff.changed).toBe(1);
    expect(diff.entries[0]).toMatchObject({ key: 'FOO', status: 'changed', oldValue: 'old', newValue: 'new' });
  });

  it('returns empty diff for identical snapshots', () => {
    const a = makeSnapshot('a', { FOO: 'bar' });
    const b = makeSnapshot('b', { FOO: 'bar' });
    const diff = diffSnapshots(a, b);
    expect(diff.entries).toHaveLength(0);
  });

  it('sets from/to names correctly', () => {
    const a = makeSnapshot('snap-a', {});
    const b = makeSnapshot('snap-b', {});
    const diff = diffSnapshots(a, b);
    expect(diff.from).toBe('snap-a');
    expect(diff.to).toBe('snap-b');
  });
});

describe('formatDiff', () => {
  it('includes header with counts', () => {
    const a = makeSnapshot('a', { X: '1' });
    const b = makeSnapshot('b', { X: '2', Y: '3' });
    const output = formatDiff(diffSnapshots(a, b));
    expect(output).toContain('a → b');
    expect(output).toContain('+1 added');
    expect(output).toContain('~1 changed');
  });

  it('shows no differences message when equal', () => {
    const a = makeSnapshot('a', {});
    const b = makeSnapshot('b', {});
    const output = formatDiff(diffSnapshots(a, b));
    expect(output).toContain('No differences found.');
  });
});
