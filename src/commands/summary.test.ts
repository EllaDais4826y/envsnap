import { Command } from 'commander';
import { registerSummaryCommand } from './summary';
import * as snapshot from '../snapshot';
import * as summary from '../summary';

function buildCli() {
  const program = new Command();
  program.exitOverride();
  registerSummaryCommand(program);
  return program;
}

describe('summary command', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows summary for a named snapshot', async () => {
    const snap = { name: 'snap1', timestamp: Date.now(), vars: { FOO: 'bar' } };
    jest.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(snap as any);
    jest.spyOn(summary, 'formatSummaryOutput').mockReturnValue('summary output');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await buildCli().parseAsync(['node', 'envsnap', 'summary', 'snap1']);

    expect(snapshot.loadSnapshot).toHaveBeenCalledWith('snap1', '.envsnap');
    expect(summary.formatSummaryOutput).toHaveBeenCalledWith([snap]);
    expect(consoleSpy).toHaveBeenCalledWith('summary output');
  });

  it('shows summary for all snapshots', async () => {
    const snap = { name: 'snap1', timestamp: Date.now(), vars: { FOO: 'bar' } };
    jest.spyOn(snapshot, 'listSnapshots').mockResolvedValue(['snap1']);
    jest.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(snap as any);
    jest.spyOn(summary, 'formatSummaryOutput').mockReturnValue('all summary');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await buildCli().parseAsync(['node', 'envsnap', 'summary']);

    expect(snapshot.listSnapshots).toHaveBeenCalledWith('.envsnap');
    expect(consoleSpy).toHaveBeenCalledWith('all summary');
  });

  it('prints message when no snapshots exist', async () => {
    jest.spyOn(snapshot, 'listSnapshots').mockResolvedValue([]);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await buildCli().parseAsync(['node', 'envsnap', 'summary']);

    expect(consoleSpy).toHaveBeenCalledWith('No snapshots found.');
  });

  it('exits with error if named snapshot not found', async () => {
    jest.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(null as any);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(
      buildCli().parseAsync(['node', 'envsnap', 'summary', 'missing'])
    ).rejects.toThrow('exit');

    expect(errorSpy).toHaveBeenCalledWith('Snapshot "missing" not found.');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
