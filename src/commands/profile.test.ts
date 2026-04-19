import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import yargs from 'yargs';
import { setProfile } from '../profile';
import { registerProfileCommand } from './profile';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-cmd-profile-'));
}

function buildCli(dir: string) {
  jest.resetModules();
  jest.mock('path', () => ({ ...jest.requireActual('path'), join: (...args: string[]) => {
    if (args[1] === '.envsnap') return dir;
    return jest.requireActual('path').join(...args);
  }});
  const y = yargs().exitProcess(false);
  return registerProfileCommand(y);
}

describe('profile command', () => {
  let dir: string;
  let log: jest.SpyInstance;
  let err: jest.SpyInstance;

  beforeEach(() => {
    dir = makeTmpDir();
    log = jest.spyOn(console, 'log').mockImplementation();
    err = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true });
    jest.restoreAllMocks();
  });

  test('list shows no profiles message', async () => {
    const cli = buildCli(dir);
    await cli.parseAsync(['profile', 'list']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('No profiles'));
  });

  test('set creates profile', async () => {
    const cli = buildCli(dir);
    await cli.parseAsync(['profile', 'set', '--name', 'dev', '--snapshots', 's1', 's2']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('dev'));
  });

  test('get retrieves profile', async () => {
    setProfile(dir, 'prod', ['snap1'], 'production');
    const cli = buildCli(dir);
    await cli.parseAsync(['profile', 'get', '--name', 'prod']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('prod'));
  });

  test('remove deletes profile', async () => {
    setProfile(dir, 'staging', ['s1']);
    const cli = buildCli(dir);
    await cli.parseAsync(['profile', 'remove', '--name', 'staging']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('removed'));
  });
});
