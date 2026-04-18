import { Command } from 'commander';
import { registerMergeCommand } from './merge';
import { mergeAndSave } from '../merge';

jest.mock('../merge');

const mockMerge = mergeAndSave as jest.MockedFunction<typeof mergeAndSave>;

async function run(args: string[]) {
  const program = new Command();
  program.exitOverride();
  registerMergeCommand(program);
  await program.parseAsync(['node', 'test', ...args]);
}

describe('merge command', () => {
  beforeEach(() => jest.clearAllMocks());

  it('merges two snapshots with default strategy', async () => {
    mockMerge.mockResolvedValue({ merged: { A: '1' }, conflicts: [] });
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await run(['merge', 'snap1', 'snap2', 'merged']);
    expect(mockMerge).toHaveBeenCalledWith('snap1', 'snap2', 'merged', 'union');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('merged'));
    spy.mockRestore();
  });

  it('warns on conflicts', async () => {
    mockMerge.mockResolvedValue({ merged: { A: '1' }, conflicts: ['A'] });
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const log = jest.spyOn(console, 'log').mockImplementation();
    await run(['merge', 'snap1', 'snap2', 'merged', '--strategy', 'ours']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('A'));
    warn.mockRestore();
    log.mockRestore();
  });

  it('exits on invalid strategy', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    await expect(run(['merge', 'a', 'b', 'c', '--strategy', 'bad'])).rejects.toThrow();
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
    errSpy.mockRestore();
  });
});
