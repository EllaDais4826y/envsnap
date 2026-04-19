import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import yargs from 'yargs';
import { registerScheduleCommand } from './schedule';
import { addSchedule, listSchedules } from '../schedule';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-cmd-schedule-'));
}

function buildCli(cwd: string) {
  const originalCwd = process.cwd;
  process.cwd = () => cwd;
  const cli = registerScheduleCommand(yargs().exitProcess(false));
  return { cli, restore: () => { process.cwd = originalCwd; } };
}

describe('schedule command', () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

  it('lists empty schedules', async () => {
    const { cli, restore } = buildCli(tmpDir);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await cli.parseAsync(['schedule', 'list']);
    expect(spy).toHaveBeenCalledWith('No schedules configured.');
    spy.mockRestore();
    restore();
  });

  it('adds a schedule', async () => {
    const { cli, restore } = buildCli(tmpDir);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await cli.parseAsync(['schedule', 'add', '--name', 'prod', '--cron', '0 * * * *']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('prod'));
    expect(listSchedules(tmpDir)).toHaveLength(1);
    spy.mockRestore();
    restore();
  });

  it('removes a schedule', async () => {
    addSchedule(tmpDir, { snapshotName: 'prod', cron: '0 * * * *', enabled: true });
    const { cli, restore } = buildCli(tmpDir);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await cli.parseAsync(['schedule', 'remove', '--name', 'prod']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('removed'));
    expect(listSchedules(tmpDir)).toHaveLength(0);
    spy.mockRestore();
    restore();
  });
});
