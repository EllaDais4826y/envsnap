import { searchSnapshots, formatSearchResults } from './search';
import * as snapshotModule from './snapshot';

jest.mock('./snapshot');

const mockListSnapshots = snapshotModule.listSnapshots as jest.Mock;
const mockLoadSnapshot = snapshotModule.loadSnapshot as jest.Mock;

beforeEach(() => jest.clearAllMocks());

test('returns matching snapshots by key', async () => {
  mockListSnapshots.mockResolvedValue(['snap1', 'snap2']);
  mockLoadSnapshot.mockImplementation((_dir: string, id: string) => {
    if (id === 'snap1') return { vars: { API_KEY: 'abc', DB_HOST: 'localhost' } };
    return { vars: { PORT: '3000' } };
  });

  const results = await searchSnapshots('/tmp', 'API');
  expect(results).toHaveLength(1);
  expect(results[0].snapshotId).toBe('snap1');
  expect(results[0].matchedKeys).toContain('API_KEY');
});

test('returns matches by value when keyOnly is false', async () => {
  mockListSnapshots.mockResolvedValue(['snap1']);
  mockLoadSnapshot.mockResolvedValue({ vars: { DB_HOST: 'localhost' } });

  const results = await searchSnapshots('/tmp', 'localhost');
  expect(results[0].matchedKeys).toContain('DB_HOST');
});

test('skips value match when keyOnly is true', async () => {
  mockListSnapshots.mockResolvedValue(['snap1']);
  mockLoadSnapshot.mockResolvedValue({ vars: { DB_HOST: 'localhost' } });

  const results = await searchSnapshots('/tmp', 'localhost', { keyOnly: true });
  expect(results).toHaveLength(0);
});

test('returns empty when no matches', async () => {
  mockListSnapshots.mockResolvedValue(['snap1']);
  mockLoadSnapshot.mockResolvedValue({ vars: { PORT: '3000' } });

  const results = await searchSnapshots('/tmp', 'NONEXISTENT');
  expect(results).toHaveLength(0);
});

test('formatSearchResults with no results', () => {
  expect(formatSearchResults([])).toBe('No matches found.');
});

test('formatSearchResults with results', () => {
  const output = formatSearchResults([{ snapshotId: 'snap1', matchedKeys: ['API_KEY'] }]);
  expect(output).toContain('snap1');
  expect(output).toContain('API_KEY');
});
