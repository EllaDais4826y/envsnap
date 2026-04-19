import * as fs from 'fs';
import * as path from 'path';

export interface ScheduleEntry {
  snapshotName: string;
  cron: string;
  lastRun?: string;
  enabled: boolean;
}

export interface ScheduleStore {
  entries: ScheduleEntry[];
}

export function getSchedulePath(baseDir: string): string {
  return path.join(baseDir, '.envsnap', 'schedules.json');
}

export function loadSchedules(baseDir: string): ScheduleStore {
  const p = getSchedulePath(baseDir);
  if (!fs.existsSync(p)) return { entries: [] };
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function saveSchedules(baseDir: string, store: ScheduleStore): void {
  const p = getSchedulePath(baseDir);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(store, null, 2));
}

export function addSchedule(baseDir: string, entry: ScheduleEntry): void {
  const store = loadSchedules(baseDir);
  const idx = store.entries.findIndex(e => e.snapshotName === entry.snapshotName);
  if (idx >= 0) store.entries[idx] = entry;
  else store.entries.push(entry);
  saveSchedules(baseDir, store);
}

export function removeSchedule(baseDir: string, snapshotName: string): boolean {
  const store = loadSchedules(baseDir);
  const before = store.entries.length;
  store.entries = store.entries.filter(e => e.snapshotName !== snapshotName);
  saveSchedules(baseDir, store);
  return store.entries.length < before;
}

export function listSchedules(baseDir: string): ScheduleEntry[] {
  return loadSchedules(baseDir).entries;
}

export function formatScheduleList(entries: ScheduleEntry[]): string {
  if (entries.length === 0) return 'No schedules configured.';
  return entries
    .map(e => `${e.snapshotName} | cron: ${e.cron} | enabled: ${e.enabled}${e.lastRun ? ` | last: ${e.lastRun}` : ''}`)
    .join('\n');
}
