import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import yargs from 'yargs';
import { registerSnapshotDuplicatesCommand } from './snapshot-duplicates';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-dup-cmd-'));
}

function writeSnapshot(
  dir: string,
  name: string,
  vars: Record<string, string>
): void {
  const snap = { name, timestamp: new Date().toISOString(), vars };
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(snap));
}

function buildCli(dir: string) {
  return registerSnapshotDuplicatesCommand(
    yargs().scriptName('envsnap').option('dir', { default: dir })
  ).help(false);
}

describe('duplicates command', () => {
  it('prints no-duplicates message when all snapshots are unique', async () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-a', { FOO: 'bar' });
    writeSnapshot(dir, 'snap-b', { FOO: 'baz' });

    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

    await buildCli(dir).parse('duplicates');

    expect(logs.join('\n')).toContain('No duplicate snapshots found.');
    jest.restoreAllMocks();
  });

  it('reports duplicate groups in text format', async () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-a', { X: '1' });
    writeSnapshot(dir, 'snap-b', { X: '1' });

    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

    await buildCli(dir).parse('duplicates');

    const output = logs.join('\n');
    expect(output).toContain('snap-a');
    expect(output).toContain('snap-b');
    jest.restoreAllMocks();
  });

  it('outputs JSON when --json flag is provided', async () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, 'snap-a', { KEY: 'val' });
    writeSnapshot(dir, 'snap-b', { KEY: 'val' });

    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

    await buildCli(dir).parse('duplicates --json');

    const parsed = JSON.parse(logs[0]);
    expect(parsed).toHaveProperty('groups');
    expect(parsed).toHaveProperty('totalDuplicates');
    expect(parsed.totalDuplicates).toBe(1);
    jest.restoreAllMocks();
  });
});
