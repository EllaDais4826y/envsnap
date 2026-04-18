import * as fs from 'fs';
import * as path from 'path';
import { listSnapshots } from './snapshot';

export interface HistoryEntry {
  name: string;
  createdAt: string;
  size: number;
}

export function getSnapshotHistory(
  snapshotsDir: string,
  limit?: number
): HistoryEntry[] {
  const names = listSnapshots(snapshotsDir);

  const entries: HistoryEntry[] = names.map((name) => {
    const filePath = path.join(snapshotsDir, `${name}.json`);
    let createdAt = '';
    let size = 0;
    try {
      const stat = fs.statSync(filePath);
      createdAt = stat.birthtime.toISOString();
      size = stat.size;
    } catch {
      createdAt = new Date(0).toISOString();
    }
    return { name, createdAt, size };
  });

  entries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return limit !== undefined ? entries.slice(0, limit) : entries;
}

export function formatHistoryOutput(entries: HistoryEntry[]): string {
  if (entries.length === 0) {
    return 'No snapshots found.';
  }

  const header = `${'NAME'.padEnd(30)} ${'CREATED AT'.padEnd(30)} SIZE`;
  const divider = '-'.repeat(70);
  const rows = entries.map(
    (e) =>
      `${e.name.padEnd(30)} ${e.createdAt.padEnd(30)} ${e.size}B`
  );

  return [header, divider, ...rows].join('\n');
}
