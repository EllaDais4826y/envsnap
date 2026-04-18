import { Command } from 'commander';
import { registerSearchCommand } from './search';
import * as searchModule from '../search';

jest.mock('../search');

const mockSearch = searchModule.searchSnapshots as jest.Mock;
const mockFormat = searchModule.formatSearchResults as jest.Mock;

let program: Command;

beforeEach(() => {
  jest.clearAllMocks();
  program = new Command();
  program.exitOverride();
  registerSearchCommand(program);
});

test('calls searchSnapshots and logs output', async () => {
  mockSearch.mockResolvedValue([{ snapshotId: 'snap1', matchedKeys: ['API_KEY'] }]);
  mockFormat.mockReturnValue('Snapshot: snap1\n  - API_KEY');

  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  await program.parseAsync(['node', 'envsnap', 'search', 'API']);

  expect(mockSearch).toHaveBeenCalledWith(expect.any(String), 'API', { keyOnly: false });
  expect(consoleSpy).toHaveBeenCalledWith('Snapshot: snap1\n  - API_KEY');
  consoleSpy.mockRestore();
});

test('passes --key-only flag', async () => {
  mockSearch.mockResolvedValue([]);
  mockFormat.mockReturnValue('No matches found.');

  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  await program.parseAsync(['node', 'envsnap', 'search', 'HOST', '--key-only']);

  expect(mockSearch).toHaveBeenCalledWith(expect.any(String), 'HOST', { keyOnly: true });
  consoleSpy.mockRestore();
});

test('logs error and exits on failure', async () => {
  mockSearch.mockRejectedValue(new Error('read error'));
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

  await expect(program.parseAsync(['node', 'envsnap', 'search', 'KEY'])).rejects.toThrow();
  expect(consoleSpy).toHaveBeenCalledWith('Error: read error');
  consoleSpy.mockRestore();
  exitSpy.mockRestore();
});
