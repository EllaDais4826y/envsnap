import { registerExportCommand } from './export';
import * as exportModule from '../export';
import { Command } from 'commander';

jest.mock('../export');

const mockedExportSnapshot = exportModule.exportSnapshot as jest.MockedFunction<typeof exportModule.exportSnapshot>;

describe('registerExportCommand', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    registerExportCommand(program);
    jest.clearAllMocks();
  });

  it('registers the export command', () => {
    const cmd = program.commands.find(c => c.name() === 'export');
    expect(cmd).toBeDefined();
  });

  it('calls exportSnapshot with correct args for dotenv format', async () => {
    mockedExportSnapshot.mockResolvedValue('KEY=value');
    await program.parseAsync(['node', 'test', 'export', 'my-snapshot', '--format', 'dotenv']);
    expect(mockedExportSnapshot).toHaveBeenCalledWith('my-snapshot', 'dotenv');
  });

  it('calls exportSnapshot with json format', async () => {
    mockedExportSnapshot.mockResolvedValue('{"KEY":"value"}');
    await program.parseAsync(['node', 'test', 'export', 'my-snapshot', '--format', 'json']);
    expect(mockedExportSnapshot).toHaveBeenCalledWith('my-snapshot', 'json');
  });

  it('calls exportSnapshot with shell format', async () => {
    mockedExportSnapshot.mockResolvedValue('export KEY=value');
    await program.parseAsync(['node', 'test', 'export', 'my-snapshot', '--format', 'shell']);
    expect(mockedExportSnapshot).toHaveBeenCalledWith('my-snapshot', 'shell');
  });

  it('defaults to dotenv format when no format specified', async () => {
    mockedExportSnapshot.mockResolvedValue('KEY=value');
    await program.parseAsync(['node', 'test', 'export', 'my-snapshot']);
    expect(mockedExportSnapshot).toHaveBeenCalledWith('my-snapshot', 'dotenv');
  });

  it('handles export errors gracefully', async () => {
    mockedExportSnapshot.mockRejectedValue(new Error('Snapshot not found'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const processSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['node', 'test', 'export', 'nonexistent'])
    ).rejects.toThrow('exit');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Snapshot not found'));
    consoleSpy.mockRestore();
    processSpy.mockRestore();
  });
});
