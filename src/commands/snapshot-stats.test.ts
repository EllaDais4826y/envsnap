import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import yargs from 'yargs';
import { registerSnapshotStatsCommand } from './snapshot-stats';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-stats-cmd-test-'));
}

function writeSnapshot(dir: string, name: string, vars: Record<string, string>): void {
  const snapshot = { name, vars, createdAt: new Date().toISOString() };
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(snapshot));
}

function buildCli(snapshotsDir: string) {
  return yargs([])
    .command(registerSnapshotStatsCommand(snapshotsDir))
    .exitProcess(false);
}

describe('registerSnapshotStatsCommand', () => {
  let tmpDir: string;
  let output: string[];

  beforeEach(() => {
    tmpDir = makeTmpDir();
    output = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => output.push(args.join(' ')));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
    vi.restoreAllMocks();
  });

  it('prints stats for an empty snapshot directory', async () => {
    const cli = buildCli(tmpDir);
    await cli.parseAsync(['stats']);
    expect(output.join('\n')).toContain('Total Snapshots');
    expect(output.join('\n')).toContain('0');
  });

  it('prints stats including snapshot count', async () => {
    writeSnapshot(tmpDir, 'alpha', { FOO: 'bar', BAZ: 'qux' });
    writeSnapshot(tmpDir, 'beta', { X: '1' });
    const cli = buildCli(tmpDir);
    await cli.parseAsync(['stats']);
    const joined = output.join('\n');
    expect(joined).toContain('Total Snapshots');
    expect(joined).toContain('2');
    expect(joined).toContain('3');
  });

  it('shows largest snapshot name', async () => {
    writeSnapshot(tmpDir, 'small', { A: '1' });
    writeSnapshot(tmpDir, 'large', { A: '1', B: '2', C: '3' });
    const cli = buildCli(tmpDir);
    await cli.parseAsync(['stats']);
    expect(output.join('\n')).toContain('large');
  });
});
