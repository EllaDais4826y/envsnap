import { lintSnapshot, formatLintOutput, LintResult } from './lint';
import { EnvSnapshot } from './snapshot';

function makeSnapshot(vars: Record<string, string>): EnvSnapshot {
  return { name: 'test', timestamp: Date.now(), vars };
}

describe('lintSnapshot', () => {
  it('returns no issues for clean snapshot', () => {
    const snap = makeSnapshot({ API_KEY: 'abc123', DB_HOST: 'localhost' });
    expect(lintSnapshot(snap)).toEqual([]);
  });

  it('detects empty values', () => {
    const snap = makeSnapshot({ API_KEY: '' });
    const results = lintSnapshot(snap);
    expect(results.some((r) => r.rule === 'no-empty-value')).toBe(true);
  });

  it('detects lowercase keys', () => {
    const snap = makeSnapshot({ api_key: 'value' });
    const results = lintSnapshot(snap);
    expect(results.some((r) => r.rule === 'uppercase-keys')).toBe(true);
  });

  it('detects spaces in keys', () => {
    const snap = makeSnapshot({ 'API KEY': 'value' });
    const results = lintSnapshot(snap);
    expect(results.some((r) => r.rule === 'no-spaces-in-keys')).toBe(true);
  });

  it('detects quoted values', () => {
    const snap = makeSnapshot({ API_KEY: '"myvalue"' });
    const results = lintSnapshot(snap);
    expect(results.some((r) => r.rule === 'no-quotes-in-value')).toBe(true);
  });

  it('supports custom rules', () => {
    const snap = makeSnapshot({ SECRET: 'password123' });
    const customRule = {
      name: 'no-password-in-value',
      check: (_: string, v: string) =>
        v.toLowerCase().includes('password') ? 'Possible password detected' : null,
    };
    const results = lintSnapshot(snap, [customRule]);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-password-in-value');
  });
});

describe('formatLintOutput', () => {
  it('returns clean message when no issues', () => {
    expect(formatLintOutput([])).toBe('No lint issues found.');
  });

  it('formats issues correctly', () => {
    const results: LintResult[] = [
      { key: 'api_key', rule: 'uppercase-keys', message: 'Key "api_key" should be uppercase' },
    ];
    const output = formatLintOutput(results);
    expect(output).toContain('Found 1 issue(s)');
    expect(output).toContain('[uppercase-keys]');
  });
});
