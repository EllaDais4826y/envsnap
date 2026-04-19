import { registerRollbackCommand } from './rollback';
import * as rollbackModule from '../rollback';
import * as auditModule from '../audit';
import yargs from 'yargs';

function buildCli() {
  return registerRollbackCommand(yargs().exitProcess(false));
}

describe('registerRollbackCommand', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('prints error and exits when no previous snapshot found', async () => {
    jest.spyOn(rollbackModule, 'getPreviousSnapshot').mockResolvedValue(null);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(buildCli().parseAsync(['rollback', 'mysnap'])).rejects.toThrow('exit');
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('No previous snapshot'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('logs dry-run message without writing', async () => {
    const fakeSnap = { name: 'mysnap-1', vars: {}, timestamp: '' };
    jest.spyOn(rollbackModule, 'getPreviousSnapshot').mockResolvedValue(fakeSnap as any);
    const rollSpy = jest.spyOn(rollbackModule, 'rollbackSnapshot').mockResolvedValue(undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await buildCli().parseAsync(['rollback', 'mysnap', '--dry-run']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[dry-run]'));
    expect(rollSpy).not.toHaveBeenCalled();
  });

  it('calls rollbackSnapshot and logAudit on success', async () => {
    const fakeSnap = { name: 'mysnap-1', vars: {}, timestamp: '' };
    jest.spyOn(rollbackModule, 'getPreviousSnapshot').mockResolvedValue(fakeSnap as any);
    const rollSpy = jest.spyOn(rollbackModule, 'rollbackSnapshot').mockResolvedValue(undefined);
    jest.spyOn(auditModule, 'logAudit').mockResolvedValue(undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await buildCli().parseAsync(['rollback', 'mysnap']);
    expect(rollSpy).toHaveBeenCalledWith(fakeSnap, '.envsnap');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('mysnap-1'));
  });

  it('handles rollback error gracefully', async () => {
    const fakeSnap = { name: 'mysnap-1', vars: {}, timestamp: '' };
    jest.spyOn(rollbackModule, 'getPreviousSnapshot').mockResolvedValue(fakeSnap as any);
    jest.spyOn(rollbackModule, 'rollbackSnapshot').mockRejectedValue(new Error('write error'));
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(buildCli().parseAsync(['rollback', 'mysnap'])).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
