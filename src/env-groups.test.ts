import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  setEnvGroup,
  removeEnvGroup,
  getEnvGroup,
  listEnvGroups,
  filterSnapshotByGroup,
  loadEnvGroups,
} from './env-groups';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-groups-'));
}

describe('env-groups', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should return empty groups when no file exists', () => {
    const data = loadEnvGroups(tmpDir);
    expect(data.groups).toEqual({});
  });

  it('should create and retrieve a group', () => {
    const group = setEnvGroup(tmpDir, 'database', ['DB_HOST', 'DB_PORT'], 'DB vars');
    expect(group.name).toBe('database');
    expect(group.keys).toEqual(['DB_HOST', 'DB_PORT']);
    expect(group.description).toBe('DB vars');
    expect(group.createdAt).toBeDefined();
  });

  it('should preserve createdAt on update', () => {
    const first = setEnvGroup(tmpDir, 'app', ['APP_ENV']);
    const second = setEnvGroup(tmpDir, 'app', ['APP_ENV', 'APP_PORT']);
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.keys).toEqual(['APP_ENV', 'APP_PORT']);
  });

  it('should list all groups', () => {
    setEnvGroup(tmpDir, 'db', ['DB_HOST']);
    setEnvGroup(tmpDir, 'cache', ['REDIS_URL']);
    const groups = listEnvGroups(tmpDir);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.name)).toContain('db');
    expect(groups.map((g) => g.name)).toContain('cache');
  });

  it('should remove a group', () => {
    setEnvGroup(tmpDir, 'temp', ['TEMP_KEY']);
    const removed = removeEnvGroup(tmpDir, 'temp');
    expect(removed).toBe(true);
    expect(getEnvGroup(tmpDir, 'temp')).toBeUndefined();
  });

  it('should return false when removing non-existent group', () => {
    expect(removeEnvGroup(tmpDir, 'ghost')).toBe(false);
  });

  it('should filter snapshot vars by group keys', () => {
    const group = setEnvGroup(tmpDir, 'db', ['DB_HOST', 'DB_PORT']);
    const vars = { DB_HOST: 'localhost', DB_PORT: '5432', APP_ENV: 'prod' };
    const filtered = filterSnapshotByGroup(vars, group);
    expect(filtered).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });
});
