import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  getTemplatesPath,
  loadTemplates,
  saveTemplates,
  setTemplate,
  removeTemplate,
  listTemplates,
  applyTemplate,
} from './template';

export function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-test-'));
}

describe('template', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  it('returns templates path inside dir', () => {
    const p = getTemplatesPath(tmpDir);
    expect(p).toContain('templates.json');
  });

  it('loads empty templates when file missing', () => {
    const templates = loadTemplates(tmpDir);
    expect(templates).toEqual({});
  });

  it('sets and loads a template', () => {
    setTemplate(tmpDir, 'base', { NODE_ENV: 'production', PORT: '3000' });
    const templates = loadTemplates(tmpDir);
    expect(templates['base']).toEqual({ NODE_ENV: 'production', PORT: '3000' });
  });

  it('removes a template', () => {
    setTemplate(tmpDir, 'base', { NODE_ENV: 'production' });
    removeTemplate(tmpDir, 'base');
    const templates = loadTemplates(tmpDir);
    expect(templates['base']).toBeUndefined();
  });

  it('lists template names', () => {
    setTemplate(tmpDir, 'alpha', { A: '1' });
    setTemplate(tmpDir, 'beta', { B: '2' });
    const names = listTemplates(tmpDir);
    expect(names).toContain('alpha');
    expect(names).toContain('beta');
  });

  it('applies template to produce snapshot vars', () => {
    setTemplate(tmpDir, 'base', { NODE_ENV: 'production', PORT: '3000' });
    const vars = applyTemplate(tmpDir, 'base', { PORT: '8080', EXTRA: 'yes' });
    expect(vars['NODE_ENV']).toBe('production');
    expect(vars['PORT']).toBe('8080');
    expect(vars['EXTRA']).toBe('yes');
  });

  it('throws when applying missing template', () => {
    expect(() => applyTemplate(tmpDir, 'missing', {})).toThrow();
  });
});
