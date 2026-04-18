import { Command } from 'commander';
import { registerEncryptCommand } from './encrypt';
import * as encryptModule from '../encrypt';
import * as snapshotModule from '../snapshot';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('../encrypt');
jest.mock('../snapshot');
jest.mock('fs');
jest.mock('readline', () => ({
  createInterface: () => ({
    question: (_: string, cb: (a: string) => void) => cb('testpassword'),
    close: jest.fn(),
  }),
}));

describe('registerEncryptCommand', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    registerEncryptCommand(program);
    jest.clearAllMocks();
  });

  describe('lock', () => {
    it('encrypts a snapshot and writes to .enc file', async () => {
      const variables = { API_KEY: 'secret' };
      (snapshotModule.loadSnapshot as jest.Mock).mockResolvedValue({ name: 'mysnap', variables, createdAt: '' });
      (snapshotModule.ensureSnapshotsDir as jest.Mock).mockReturnValue('/tmp/snaps');
      (encryptModule.encryptSnapshot as jest.Mock).mockReturnValue({ iv: 'abc', data: 'xyz' });
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await program.parseAsync(['node', 'test', 'encrypt', 'lock', 'mysnap']);

      expect(snapshotModule.loadSnapshot).toHaveBeenCalledWith('mysnap');
      expect(encryptModule.encryptSnapshot).toHaveBeenCalledWith(variables, 'testpassword');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join('/tmp/snaps', 'mysnap.enc'),
        expect.any(String)
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('encrypted'));
      consoleSpy.mockRestore();
    });
  });

  describe('unlock', () => {
    it('decrypts a snapshot and saves it', async () => {
      (snapshotModule.ensureSnapshotsDir as jest.Mock).mockReturnValue('/tmp/snaps');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ iv: 'abc', data: 'xyz' }));
      (encryptModule.decryptSnapshot as jest.Mock).mockReturnValue({ API_KEY: 'secret' });
      (snapshotModule.saveSnapshot as jest.Mock).mockResolvedValue(undefined);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await program.parseAsync(['node', 'test', 'encrypt', 'unlock', 'mysnap', '--output', 'mysnap-plain']);

      expect(encryptModule.decryptSnapshot).toHaveBeenCalledWith({ iv: 'abc', data: 'xyz' }, 'testpassword');
      expect(snapshotModule.saveSnapshot).toHaveBeenCalledWith('mysnap-plain', { API_KEY: 'secret' });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('mysnap-plain'));
      consoleSpy.mockRestore();
    });

    it('errors if encrypted file not found', async () => {
      (snapshotModule.ensureSnapshotsDir as jest.Mock).mockReturnValue('/tmp/snaps');
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

      await expect(program.parseAsync(['node', 'test', 'encrypt', 'unlock', 'missing'])).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });
});
