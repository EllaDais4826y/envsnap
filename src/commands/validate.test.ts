import { Command } from 'commander';
import { registerValidateCommand } from './validate';
import * as snapshotModule from '../snapshot';
import * as validateModule from '../validate';

jest.mock('../snapshot');
jest.mock('../validate');

const mockLoadSnapshot = snapshotModule.loadSnapshot as jest.Mock;
const mockValidateSnapshot = validateModule.validateSnapshot as jest.Mock;
const mockFormatValidationOutput = validateModule.formatValidationOutput as jest.Mock;

describe('registerValidateCommand', () => {
  let program: Command;
  let exitSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    registerValidateCommand(program);
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('prints validation output for a valid snapshot', async () => {
    const snap = { name: 'mysnap', timestamp: Date.now(), variables: { KEY: 'val' } };
    mockLoadSnapshot.mockResolvedValue(snap);
    mockValidateSnapshot.mockReturnValue({ valid: true, errors: [] });
    mockFormatValidationOutput.mockReturnValue('All checks passed.');

    await program.parseAsync(['node', 'test', 'validate', 'mysnap']);

    expect(mockLoadSnapshot).toHaveBeenCalledWith('mysnap');
    expect(consoleSpy).toHaveBeenCalledWith('All checks passed.');
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('exits with 1 when snapshot not found', async () => {
    mockLoadSnapshot.mockResolvedValue(null);

    await expect(
      program.parseAsync(['node', 'test', 'validate', 'missing'])
    ).rejects.toThrow('exit');

    expect(errorSpy).toHaveBeenCalledWith('Snapshot "missing" not found.');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits with 1 when validation fails', async () => {
    const snap = { name: 'mysnap', timestamp: Date.now(), variables: { KEY: '' } };
    mockLoadSnapshot.mockResolvedValue(snap);
    mockValidateSnapshot.mockReturnValue({ valid: false, errors: ['KEY is empty'] });
    mockFormatValidationOutput.mockReturnValue('Validation failed.');

    await expect(
      program.parseAsync(['node', 'test', 'validate', 'mysnap', '--no-empty'])
    ).rejects.toThrow('exit');

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('passes required and forbidden keys to validateSnapshot', async () => {
    const snap = { name: 's', timestamp: Date.now(), variables: { A: '1' } };
    mockLoadSnapshot.mockResolvedValue(snap);
    mockValidateSnapshot.mockReturnValue({ valid: true, errors: [] });
    mockFormatValidationOutput.mockReturnValue('ok');

    await program.parseAsync(['node', 'test', 'validate', 's', '--require', 'A,B', '--forbid', 'SECRET']);

    expect(mockValidateSnapshot).toHaveBeenCalledWith(snap, expect.objectContaining({
      requiredKeys: ['A', 'B'],
      forbiddenKeys: ['SECRET'],
    }));
  });
});
