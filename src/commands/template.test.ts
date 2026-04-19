import { describe, it, expect, beforeEach } from 'vitest';
import yargs from 'yargs';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { registerTemplateCommand } from './template';
import { setTemplate, loadTemplates } from '../template';
import { loadSnapshot } from '../snapshot';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-cmd-template-'));
}

function buildCli(dir: string) {
  const cli = yargs().exitProcess(false);
  registerTemplateCommand(cli, dir);
  return cli;
}

describe('template command', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  it('sets a template', async () => {
    const cli = buildCli(tmpDir);
    await cli.parseAsync(['template', 'set', '--name', 'base', '--vars', JSON.stringify({ NODE_ENV: 'production' })]);
    const templates = loadTemplates(tmpDir);
    expect(templates['base']).toEqual({ NODE_ENV: 'production' });
  });

  it('lists templates', async () => {
    setTemplate(tmpDir, 'alpha', { A: '1' });
    const logs: string[] = [];
    const orig = console.log;
    console.log = (msg: string) => logs.push(msg);
    const cli = buildCli(tmpDir);
    await cli.parseAsync(['template', 'list']);
    console.log = orig;
    expect(logs).toContain('alpha');
  });

  it('removes a template', async () => {
    setTemplate(tmpDir, 'base', { NODE_ENV: 'test' });
    const cli = buildCli(tmpDir);
    await cli.parseAsync(['template', 'remove', '--name', 'base']);
    const templates = loadTemplates(tmpDir);
    expect(templates['base']).toBeUndefined();
  });

  it('applies a template and creates a snapshot', async () => {
    setTemplate(tmpDir, 'base', { NODE_ENV: 'production', PORT: '3000' });
    const cli = buildCli(tmpDir);
    await cli.parseAsync([
      'template', 'apply',
      '--name', 'base',
      '--snapshot', 'my-snap',
      '--overrides', JSON.stringify({ PORT: '9000' }),
    ]);
    const snap = loadSnapshot(tmpDir, 'my-snap');
    expect(snap.variables['NODE_ENV']).toBe('production');
    expect(snap.variables['PORT']).toBe('9000');
  });
});
