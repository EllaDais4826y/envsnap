import { filterSnapshotVars, formatFilterOutput } from './filter';

const sampleVars: Record<string, string> = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'myapp',
  APP_ENV: 'production',
  SECRET_KEY: 'abc123',
};

describe('filterSnapshotVars', () => {
  it('filters by prefix', () => {
    const result = filterSnapshotVars(sampleVars, { prefix: 'DB_' });
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('prefix match is case-insensitive', () => {
    const result = filterSnapshotVars(sampleVars, { prefix: 'app' });
    expect(Object.keys(result)).toContain('APP_NAME');
    expect(Object.keys(result)).toContain('APP_ENV');
  });

  it('filters by specific keys', () => {
    const result = filterSnapshotVars(sampleVars, { keys: ['SECRET_KEY', 'APP_NAME'] });
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['SECRET_KEY', 'APP_NAME']));
    expect(Object.keys(result).length).toBe(2);
  });

  it('filters by pattern matching key', () => {
    const result = filterSnapshotVars(sampleVars, { pattern: '^DB_' });
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('filters by pattern matching value', () => {
    const result = filterSnapshotVars(sampleVars, { pattern: 'localhost' });
    expect(result).toHaveProperty('DB_HOST', 'localhost');
  });

  it('returns empty object when nothing matches', () => {
    const result = filterSnapshotVars(sampleVars, { prefix: 'NONEXISTENT_' });
    expect(Object.keys(result).length).toBe(0);
  });

  it('combines prefix and pattern filters', () => {
    const result = filterSnapshotVars(sampleVars, { prefix: 'APP', pattern: 'prod' });
    expect(result).toHaveProperty('APP_ENV', 'production');
    expect(result).not.toHaveProperty('APP_NAME');
  });
});

describe('formatFilterOutput', () => {
  it('formats matched results', () => {
    const output = formatFilterOutput({
      snapshotName: 'test-snap',
      matched: { DB_HOST: 'localhost' },
      total: 5,
      matchedCount: 1,
    });
    expect(output).toContain('test-snap');
    expect(output).toContain('Matched 1 of 5');
    expect(output).toContain('DB_HOST=localhost');
  });

  it('shows no matches message when empty', () => {
    const output = formatFilterOutput({
      snapshotName: 'empty-snap',
      matched: {},
      total: 3,
      matchedCount: 0,
    });
    expect(output).toContain('(no matches)');
  });
});
