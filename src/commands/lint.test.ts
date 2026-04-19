import { Command } from 'commander';
import { registerLintCommand } from './lint';
import * as snapshotModule from '../snapshot';
import * as lintModule from '../lint';

function buildCli() {
  const program = new Command();
  program.exitOverride();
  registerLintCommand(program);
  return program;
}

const mockSnapshot = {
  name: 'test',
  timestamp: new Date().toISOString(),
  vars: { API_KEY: 'abc123', DEBUG: 'true' },
};

beforeEach(() => {
  jest.spyOn(snapshotModule, 'loadSnapshot').mockResolvedValue(mockSnapshot as any);
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('lint command', () => {
  it('prints passing message when no issues found', async () => {
    jest.spyOn(lintModule, 'lintSnapshot').mockReturnValue([]);
    jest.spyOn(lintModule, 'formatLintOutput').mockReturnValue('');

    const cli = buildCli();
    await cli.parseAsync(['node', 'test', 'lint', 'test']);

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('passed all lint checks'));
  });

  it('prints lint output when issues found', async () => {
    jest.spyOn(lintModule, 'lintSnapshot').mockReturnValue([
      { key: 'API_KEY', message: 'Looks like a secret', severity: 'warning' },
    ]);
    jest.spyOn(lintModule, 'formatLintOutput').mockReturnValue('warning: API_KEY - Looks like a secret');

    const cli = buildCli();
    await cli.parseAsync(['node', 'test', 'lint', 'test']);

    expect(console.log).toHaveBeenCalledWith('warning: API_KEY - Looks like a secret');
  });

  it('exits with 1 when snapshot not found', async () => {
    jest.spyOn(snapshotModule, 'loadSnapshot').mockResolvedValue(null as any);
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    const cli = buildCli();
    await expect(cli.parseAsync(['node', 'test', 'lint', 'missing'])).rejects.toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('exits with 1 on error issues', async () => {
    jest.spyOn(lintModule, 'lintSnapshot').mockReturnValue([
      { key: 'EMPTY_VAR', message: 'Value is empty', severity: 'error' },
    ]);
    jest.spyOn(lintModule, 'formatLintOutput').mockReturnValue('error: EMPTY_VAR - Value is empty');
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    const cli = buildCli();
    await expect(cli.parseAsync(['node', 'test', 'lint', 'test'])).rejects.toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
