import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { setProfile, removeProfile, getProfile, listProfiles, formatProfileOutput, loadProfiles } from './profile';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-profile-'));
}

describe('profile', () => {
  let dir: string;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(dir, { recursive: true }); });

  test('setProfile creates a profile', () => {
    const p = setProfile(dir, 'dev', ['snap1', 'snap2'], 'Dev profile');
    expect(p.name).toBe('dev');
    expect(p.snapshots).toEqual(['snap1', 'snap2']);
    expect(p.description).toBe('Dev profile');
  });

  test('setProfile updates existing profile', () => {
    setProfile(dir, 'dev', ['snap1']);
    const p = setProfile(dir, 'dev', ['snap1', 'snap2']);
    expect(p.snapshots).toHaveLength(2);
    expect(p.createdAt).toBe(p.createdAt);
  });

  test('getProfile returns profile', () => {
    setProfile(dir, 'prod', ['snap3']);
    const p = getProfile(dir, 'prod');
    expect(p?.name).toBe('prod');
  });

  test('getProfile returns undefined for missing', () => {
    expect(getProfile(dir, 'missing')).toBeUndefined();
  });

  test('removeProfile deletes profile', () => {
    setProfile(dir, 'staging', ['s1']);
    expect(removeProfile(dir, 'staging')).toBe(true);
    expect(getProfile(dir, 'staging')).toBeUndefined();
  });

  test('removeProfile returns false for missing', () => {
    expect(removeProfile(dir, 'nope')).toBe(false);
  });

  test('listProfiles returns all profiles', () => {
    setProfile(dir, 'a', []);
    setProfile(dir, 'b', []);
    expect(listProfiles(dir)).toHaveLength(2);
  });

  test('formatProfileOutput handles empty', () => {
    expect(formatProfileOutput([])).toBe('No profiles found.');
  });

  test('formatProfileOutput lists profiles', () => {
    const p = setProfile(dir, 'dev', ['s1'], 'desc');
    const out = formatProfileOutput([p]);
    expect(out).toContain('dev');
    expect(out).toContain('desc');
    expect(out).toContain('s1');
  });
});
