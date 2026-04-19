import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  addSchedule,
  removeSchedule,
  listSchedules,
  formatScheduleList,
  loadSchedules,
} from './schedule';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-schedule-'));
}

describe('schedule', () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

  it('starts empty', () => {
    expect(listSchedules(tmpDir)).toEqual([]);
  });

  it('adds a schedule', () => {
    addSchedule(tmpDir, { snapshotName: 'prod', cron: '0 * * * *', enabled: true });
    const entries = listSchedules(tmpDir);
    expect(entries).toHaveLength(1);
    expect(entries[0].snapshotName).toBe('prod');
  });

  it('updates existing schedule', () => {
    addSchedule(tmpDir, { snapshotName: 'prod', cron: '0 * * * *', enabled: true });
    addSchedule(tmpDir, { snapshotName: 'prod', cron: '30 * * * *', enabled: false });
    const entries = listSchedules(tmpDir);
    expect(entries).toHaveLength(1);
    expect(entries[0].cron).toBe('30 * * * *');
  });

  it('removes a schedule', () => {
    addSchedule(tmpDir, { snapshotName: 'prod', cron: '0 * * * *', enabled: true });
    const removed = removeSchedule(tmpDir, 'prod');
    expect(removed).toBe(true);
    expect(listSchedules(tmpDir)).toHaveLength(0);
  });

  it('returns false when removing non-existent', () => {
    expect(removeSchedule(tmpDir, 'ghost')).toBe(false);
  });

  it('formatScheduleList shows no schedules message', () => {
    expect(formatScheduleList([])).toBe('No schedules configured.');
  });

  it('formatScheduleList formats entries', () => {
    const out = formatScheduleList([{ snapshotName: 'dev', cron: '* * * * *', enabled: true }]);
    expect(out).toContain('dev');
    expect(out).toContain('* * * * *');
  });
});
