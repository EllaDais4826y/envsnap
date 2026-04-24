import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import yargs from 'yargs';
import { registerEnvGroupsCommand } from './env-groups';
import { loadEnvGroups } from '../env-groups';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-grpcmd-'));
}

function buildCli(dir: string) {
  return registerEnvGroupsCommand(
    yargs().exitProcess(false).fail(false)
  ).option('dir', { default: dir });
}

describe('commands/env-groups', () => {
  let tmpDir: string;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should set a group', async () => {
    await buildCli(tmpDir).parseAsync(
      ['group', 'set', '--name', 'db', '--keys', 'DB_HOST', 'DB_PORT', '--dir', tmpDir]
    );
    const data = loadEnvGroups(tmpDir);
    expect(data.groups['db']).toBeDefined();
    expect(data.groups['db'].keys).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('should list groups', async () => {
    await buildCli(tmpDir).parseAsync(
      ['group', 'set', '--name', 'app', '--keys', 'APP_ENV', '--dir', tmpDir]
    );
    consoleSpy.mockClear();
    await buildCli(tmpDir).parseAsync(['group', 'list', '--dir', tmpDir]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('app'));
  });

  it('should show empty list message', async () => {
    await buildCli(tmpDir).parseAsync(['group', 'list', '--dir', tmpDir]);
    expect(consoleSpy).toHaveBeenCalledWith('No groups defined.');
  });

  it('should remove a group', async () => {
    await buildCli(tmpDir).parseAsync(
      ['group', 'set', '--name', 'temp', '--keys', 'TMP', '--dir', tmpDir]
    );
    await buildCli(tmpDir).parseAsync(
      ['group', 'remove', '--name', 'temp', '--dir', tmpDir]
    );
    const data = loadEnvGroups(tmpDir);
    expect(data.groups['temp']).toBeUndefined();
  });

  it('should show group details', async () => {
    await buildCli(tmpDir).parseAsync(
      ['group', 'set', '--name', 'cache', '--keys', 'REDIS_URL', '--description', 'Cache vars', '--dir', tmpDir]
    );
    consoleSpy.mockClear();
    await buildCli(tmpDir).parseAsync(['group', 'show', '--name', 'cache', '--dir', tmpDir]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('cache'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cache vars'));
  });
});
