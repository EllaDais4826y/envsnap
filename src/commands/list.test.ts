import { Command } from 'commander';
import { registerListCommand } from './list';
import * as listModule from '../list';

jest.mock('../list');

const mockGetSnapshotSummaries = listModule.getSnapshotSummaries as jest.MockedFunction<typeof listModule.getSnapshotSummaries>;
const mockFormatSnapshotList = listModule.formatSnapshotList as jest.MockedFunction<typeof listModule.formatSnapshotList>;

describe('registerListCommand', () => {
  let program: Command;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    registerListCommand(program);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => consoleSpy.mockRestore());

  it('calls getSnapshotSummaries and prints formatted list', async () => {
    const summaries = [{ name: 'snap1', timestamp: '2024-01-01T00:00:00.000Z', varCount: 3 }];
    mockGetSnapshotSummaries.mockResolvedValue(summaries);
    mockFormatSnapshotList.mockReturnValue('formatted output');

    await program.parseAsync(['list'], { from: 'user' });

    expect(mockGetSnapshotSummaries).toHaveBeenCalledWith('.envsnap');
    expect(mockFormatSnapshotList).toHaveBeenCalledWith(summaries);
    expect(consoleSpy).toHaveBeenCalledWith('formatted output');
  });

  it('outputs JSON when --json flag is set', async () => {
    const summaries = [{ name: 'snap1', timestamp: '2024-01-01T00:00:00.000Z', varCount: 2 }];
    mockGetSnapshotSummaries.mockResolvedValue(summaries);

    await program.parseAsync(['list', '--json'], { from: 'user' });

    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(summaries, null, 2));
  });

  it('exits with code 1 on error', async () => {
    mockGetSnapshotSummaries.mockRejectedValue(new Error('disk error'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(program.parseAsync(['list'], { from: 'user' })).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
