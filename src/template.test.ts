import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  loadTemplates,
  saveTemplates,
  setTemplate,
  removeTemplate,
  applyTemplate,
  listTemplates,
  SnapshotTemplate,
} from './template';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-template-'));
}

describe('template', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTmpDir();
  });

  it('returns empty object when no templates file exists', () => {
    expect(loadTemplates(dir)).toEqual({});
  });

  it('saves and loads templates', () => {
    const tpl: SnapshotTemplate = { name: 'base', keys: ['NODE_ENV', 'PORT'] };
    saveTemplates({ base: tpl }, dir);
    const loaded = loadTemplates(dir);
    expect(loaded['base']).toEqual(tpl);
  });

  it('setTemplate adds a template', () => {
    const tpl: SnapshotTemplate = { name: 'api', keys: ['API_KEY'], defaults: { API_KEY: 'default' } };
    setTemplate('api', tpl, dir);
    expect(loadTemplates(dir)['api']).toEqual(tpl);
  });

  it('removeTemplate removes existing template', () => {
    const tpl: SnapshotTemplate = { name: 'ci', keys: ['CI'] };
    setTemplate('ci', tpl, dir);
    const result = removeTemplate('ci', dir);
    expect(result).toBe(true);
    expect(loadTemplates(dir)['ci']).toBeUndefined();
  });

  it('removeTemplate returns false for missing template', () => {
    expect(removeTemplate('ghost', dir)).toBe(false);
  });

  it('applyTemplate filters env by keys', () => {
    const tpl: SnapshotTemplate = { name: 't', keys: ['A', 'B'] };
    const result = applyTemplate(tpl, { A: '1', B: '2', C: '3' });
    expect(result).toEqual({ A: '1', B: '2' });
  });

  it('applyTemplate uses defaults for missing keys', () => {
    const tpl: SnapshotTemplate = { name: 't', keys: ['A', 'B'], defaults: { B: 'fallback' } };
    const result = applyTemplate(tpl, { A: '1' });
    expect(result).toEqual({ A: '1', B: 'fallback' });
  });

  it('listTemplates returns all templates as array', () => {
    setTemplate('x', { name: 'x', keys: [] }, dir);
    setTemplate('y', { name: 'y', keys: [] }, dir);
    expect(listTemplates(dir)).toHaveLength(2);
  });
});
