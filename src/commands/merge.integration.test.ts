import { Command } from 'commander';
import { registerMergeCommand } from './merge';
import { saveSnapshot, loadSnapshot } from '../snapshot';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('merge command integration', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'envsnap-merge-'));
    process.env.ENVSNAP_DIR = tmpDir;
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    delete process.env.ENVSNAP_DIR;
  });

  it('merges two real snapshots and saves result', async () => {
    await saveSnapshot('base', { FOO: 'bar', SHARED: 'base-val' });
    await saveSnapshot('other', { BAZ: 'qux', SHARED: 'other-val' });

    const program = new Command();
    program.exitOverride();
    registerMergeCommand(program);

    const log = jest.spyOn(console, 'log').mockImplementation();
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    await program.parseAsync(['node', 'test', 'merge', 'base', 'other', 'result', '--strategy', 'theirs']);

    const result = await loadSnapshot('result');
    expect(result.vars.FOO).toBe('bar');
    expect(result.vars.BAZ).toBe('qux');
    expect(result.vars.SHARED).toBe('other-val');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('SHARED'));

    log.mockRestore();
    warn.mockRestore();
  });
});
