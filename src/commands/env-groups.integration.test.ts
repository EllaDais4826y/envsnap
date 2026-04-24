import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import yargs from 'yargs';
import { registerEnvGroupsCommand } from './env-groups';
import { setEnvGroup, filterSnapshotByGroup, getEnvGroup } from '../env-groups';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-grpint-'));
}

describe('env-groups integration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should set group via CLI and filter snapshot vars', async () => {
    const cli = registerEnvGroupsCommand(yargs().exitProcess(false).fail(false));
    await cli.parseAsync(
      ['group', 'set', '--name', 'infra', '--keys', 'DB_HOST', 'REDIS_URL', '--dir', tmpDir]
    );

    const group = getEnvGroup(tmpDir, 'infra');
    expect(group).toBeDefined();

    const allVars = { DB_HOST: 'localhost', REDIS_URL: 'redis://localhost', APP_SECRET: 'abc' };
    const filtered = filterSnapshotByGroup(allVars, group!);
    expect(filtered).toEqual({ DB_HOST: 'localhost', REDIS_URL: 'redis://localhost' });
    expect(filtered).not.toHaveProperty('APP_SECRET');
  });

  it('should overwrite group keys on re-set', async () => {
    setEnvGroup(tmpDir, 'app', ['APP_ENV', 'APP_PORT']);
    const cli = registerEnvGroupsCommand(yargs().exitProcess(false).fail(false));
    await cli.parseAsync(
      ['group', 'set', '--name', 'app', '--keys', 'APP_ENV', '--dir', tmpDir]
    );
    const group = getEnvGroup(tmpDir, 'app');
    expect(group!.keys).toEqual(['APP_ENV']);
  });
});
