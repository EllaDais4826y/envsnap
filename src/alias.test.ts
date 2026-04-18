import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { setAlias, removeAlias, resolveAlias, listAliases, loadAliases } from './alias';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-alias-'));
}

describe('alias', () => {
  let dir: string;

  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(dir, { recursive: true }); });

  test('loadAliases returns empty object when no file', () => {
    expect(loadAliases(dir)).toEqual({});
  });

  test('setAlias saves alias', () => {
    const result = setAlias('prod', 'snapshot-2024-01', dir);
    expect(result['prod']).toBe('snapshot-2024-01');
    expect(loadAliases(dir)['prod']).toBe('snapshot-2024-01');
  });

  test('setAlias overwrites existing alias', () => {
    setAlias('prod', 'snapshot-old', dir);
    setAlias('prod', 'snapshot-new', dir);
    expect(loadAliases(dir)['prod']).toBe('snapshot-new');
  });

  test('removeAlias deletes alias', () => {
    setAlias('staging', 'snapshot-staging', dir);
    removeAlias('staging', dir);
    expect(loadAliases(dir)['staging']).toBeUndefined();
  });

  test('removeAlias throws if alias not found', () => {
    expect(() => removeAlias('nonexistent', dir)).toThrow("Alias 'nonexistent' not found");
  });

  test('resolveAlias returns snapshot name for known alias', () => {
    setAlias('dev', 'snapshot-dev-01', dir);
    expect(resolveAlias('dev', dir)).toBe('snapshot-dev-01');
  });

  test('resolveAlias returns input unchanged if not an alias', () => {
    expect(resolveAlias('snapshot-xyz', dir)).toBe('snapshot-xyz');
  });

  test('listAliases returns all aliases', () => {
    setAlias('a', 'snap-a', dir);
    setAlias('b', 'snap-b', dir);
    expect(listAliases(dir)).toEqual({ a: 'snap-a', b: 'snap-b' });
  });
});
