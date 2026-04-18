import * as renameModule from '../rename';
import { registerRenameCommand } from './rename';
import yargs from 'yargs';

describe('registerRenameCommand', () => {
  let renameSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    renameSpy = jest.spyOn(renameModule, 'renameSnapshot');
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });

  afterEach(() => jest.restoreAllMocks());

  it('calls renameSnapshot and logs success', async () => {
    renameSpy.mockReturnValue({ success: true, message: 'Snapshot "a" renamed to "b".' });
    const parser = registerRenameCommand(yargs()).help(false);
    await parser.parseAsync(['rename', 'a', 'b']);
    expect(renameSpy).toHaveBeenCalledWith('a', 'b');
    expect(consoleLogSpy).toHaveBeenCalledWith('Snapshot "a" renamed to "b".');
  });

  it('logs error and exits on failure', async () => {
    renameSpy.mockReturnValue({ success: false, message: 'Snapshot "x" not found.' });
    const parser = registerRenameCommand(yargs()).help(false);
    await expect(parser.parseAsync(['rename', 'x', 'y'])).rejects.toThrow('exit');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Snapshot "x" not found.');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
