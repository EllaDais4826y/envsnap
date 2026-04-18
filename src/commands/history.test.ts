import { registerHistoryCommand } from './history';
import { getSnapshotHistory } from '../history';
import yargs from 'yargs';

jest.mock('../history');

const mockGetSnapshotHistory = getSnapshotHistory as jest.MockedFunction<typeof getSnapshotHistory>;

function buildCli() {
  const argv = yargs().exitProcess(false);
  registerHistoryCommand(argv);
  return argv;
}

describe('history command', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.resetAllMocks());

  it('prints history for a given key', async () => {
    mockGetSnapshotHistory.mockResolvedValue({
      key: 'API_URL',
      entries: [
        { snapshotName: 'snap1', timestamp: '2024-01-01T00:00:00.000Z', value: 'http://localhost' },
        { snapshotName: 'snap2', timestamp: '2024-01-02T00:00:00.000Z', value: 'https://api.example.com' },
      ],
      formatted: 'API_URL\n  snap1 (2024-01-01): http://localhost\n  snap2 (2024-01-02): https://api.example.com',
    });

    await buildCli().parse('history API_URL');

    expect(mockGetSnapshotHistory).toHaveBeenCalledWith('API_URL', expect.any(String), undefined);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('API_URL'));
  });

  it('respects --limit option', async () => {
    mockGetSnapshotHistory.mockResolvedValue({
      key: 'DB_HOST',
      entries: [{ snapshotName: 'snap1', timestamp: '2024-01-01T00:00:00.000Z', value: 'localhost' }],
      formatted: 'DB_HOST\n  snap1 (2024-01-01): localhost',
    });

    await buildCli().parse('history DB_HOST --limit 1');

    expect(mockGetSnapshotHistory).toHaveBeenCalledWith('DB_HOST', expect.any(String), 1);
  });

  it('prints message when no history found', async () => {
    mockGetSnapshotHistory.mockResolvedValue({
      key: 'MISSING_KEY',
      entries: [],
      formatted: 'No history found for MISSING_KEY',
    });

    await buildCli().parse('history MISSING_KEY');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No history found'));
  });
});
