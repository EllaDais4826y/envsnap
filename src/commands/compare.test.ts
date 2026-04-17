import yargs from 'yargs';
import { registerCompareCommand } from './compare';
import * as compare from '../compare';

jest.mock('../compare');

const mockCompareSnapshots = compare.compareSnapshots as jest.MockedFunction<typeof compare.compareSnapshots>;
const mockFormatCompareOutput = compare.formatCompareOutput as jest.MockedFunction<typeof compare.formatCompareOutput>;

const mockResult = {
  snapshotA: 'a',
  snapshotB: 'b',
  added: {},
  removed: {},
  changed: {},
  unchanged: {},
  summary: 'mock summary',
};

describe('compare command', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockCompareSnapshots.mockResolvedValue(mockResult as any);
    mockFormatCompareOutput.mockReturnValue('formatted output');
  });

  afterEach(() => jest.clearAllMocks());

  it('calls compareSnapshots with correct args', async () => {
    const parser = registerCompareCommand(yargs()).help(false);
    await parser.parseAsync(['compare', 'snap-a', 'snap-b']);
    expect(mockCompareSnapshots).toHaveBeenCalledWith('snap-a', 'snap-b', undefined);
  });

  it('passes verbose flag', async () => {
    const parser = registerCompareCommand(yargs()).help(false);
    await parser.parseAsync(['compare', 'snap-a', 'snap-b', '--verbose']);
    expect(mockFormatCompareOutput).toHaveBeenCalledWith(mockResult, true);
  });

  it('logs formatted output', async () => {
    const parser = registerCompareCommand(yargs()).help(false);
    await parser.parseAsync(['compare', 'snap-a', 'snap-b']);
    expect(consoleSpy).toHaveBeenCalledWith('formatted output');
  });

  it('exits on error', async () => {
    mockCompareSnapshots.mockRejectedValue(new Error('not found'));
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    const parser = registerCompareCommand(yargs()).help(false);
    await expect(parser.parseAsync(['compare', 'x', 'y'])).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });
});
