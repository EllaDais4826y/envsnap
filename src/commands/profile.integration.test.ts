import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { setProfile, getProfile, listProfiles, removeProfile } from '../profile';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-profile-int-'));
}

describe('profile integration', () => {
  let dir: string;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(dir, { recursive: true }); });

  test('full lifecycle: set, get, list, remove', () => {
    setProfile(dir, 'dev', ['snap-1', 'snap-2'], 'Development');
    setProfile(dir, 'prod', ['snap-3']);

    const dev = getProfile(dir, 'dev');
    expect(dev).toBeDefined();
    expect(dev!.snapshots).toContain('snap-1');
    expect(dev!.description).toBe('Development');

    const all = listProfiles(dir);
    expect(all).toHaveLength(2);

    removeProfile(dir, 'dev');
    expect(listProfiles(dir)).toHaveLength(1);
    expect(getProfile(dir, 'dev')).toBeUndefined();
  });

  test('updating profile preserves createdAt', () => {
    const p1 = setProfile(dir, 'dev', ['s1']);
    const p2 = setProfile(dir, 'dev', ['s1', 's2']);
    expect(p2.createdAt).toBe(p1.createdAt);
    expect(p2.snapshots).toHaveLength(2);
  });

  test('profiles file is valid JSON', () => {
    setProfile(dir, 'test', ['t1']);
    const raw = fs.readFileSync(path.join(dir, 'profiles.json'), 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });
});
