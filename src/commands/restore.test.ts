import { registerRestoreCommand } from './restore';
import * as restoreModule from '../restore';
import { Command } from 'commander';

jest.mock('../restore');

const mockedRestoreSnapshot = restoreModule.restoreSnapshot as jest.MockedFunction<typeof restoreModule.restoreSnapshot>;

describe('registerRestoreCommand', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    registerRestoreCommand(program);
    jest.clearAllMocks();
  });

  it('registers the restore command', () => {
    const cmd = program.commands.find(c => c.name() === 'restore');
    expect(cmd).toBeDefined();
  });

  it('calls restoreSnapshot with snapshot name and default env file', async () => {
    mockedRestoreSnapshot.mockResolvedValue(undefined);
    await program.parseAsync(['node', 'test', 'restore', 'my-snapshot']);
    expect(mockedRestoreSnapshot).toHaveBeenCalledWith('my-snapshot', '.env');
  });

  it('calls restoreSnapshot with custom env file path', async () => {
    mockedRestoreSnapshot.mockResolvedValue(undefined);
    await program.parseAsync(['node', 'test', 'restore', 'my-snapshot', '--output', '.env.local']);
    expect(mockedRestoreSnapshot).toHaveBeenCalledWith('my-snapshot', '.env.local');
  });

  it('prints success message after restore', async () => {
    mockedRestoreSnapshot.mockResolvedValue(undefined);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await program.parseAsync(['node', 'test', 'restore', 'my-snapshot']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('my-snapshot'));
    consoleSpy.mockRestore();
  });

  it('handles restore errors gracefully', async () => {
    mockedRestoreSnapshot.mockRejectedValue(new Error('Snapshot not found'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const processSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['node', 'test', 'restore', 'nonexistent'])
    ).rejects.toThrow('exit');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Snapshot not found'));
    consoleSpy.mockRestore();
    processSpy.mockRestore();
  });
});
