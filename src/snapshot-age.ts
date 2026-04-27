import * as fs from 'fs';
import * as path from 'path';
import { listSnapshots } from './snapshot';

export interface SnapshotAgeEntry {
  name: string;
  createdAt: Date;
  ageMs: number;
  ageLabel: string;
}

export interface SnapshotAgeReport {
  entries: SnapshotAgeEntry[];
  oldest: SnapshotAgeEntry | null;
  newest: SnapshotAgeEntry | null;
}

export function formatAge(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ago`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`;
  return `${seconds}s ago`;
}

export function getSnapshotAgeReport(snapshotsDir: string): SnapshotAgeReport {
  const names = listSnapshots(snapshotsDir);
  const now = Date.now();

  const entries: SnapshotAgeEntry[] = names.map((name) => {
    const filePath = path.join(snapshotsDir, `${name}.json`);
    const stat = fs.statSync(filePath);
    const createdAt = stat.birthtime ?? stat.mtime;
    const ageMs = now - createdAt.getTime();
    return {
      name,
      createdAt,
      ageMs,
      ageLabel: formatAge(ageMs),
    };
  });

  entries.sort((a, b) => a.ageMs - b.ageMs);

  return {
    entries,
    oldest: entries.length > 0 ? entries[entries.length - 1] : null,
    newest: entries.length > 0 ? entries[0] : null,
  };
}

export function formatSnapshotAgeReport(report: SnapshotAgeReport): string {
  if (report.entries.length === 0) {
    return 'No snapshots found.';
  }

  const lines: string[] = ['Snapshot Ages:', ''];

  for (const entry of report.entries) {
    lines.push(`  ${entry.name.padEnd(30)} ${entry.ageLabel}`);
  }

  lines.push('');
  if (report.newest) {
    lines.push(`Newest: ${report.newest.name} (${report.newest.ageLabel})`);
  }
  if (report.oldest) {
    lines.push(`Oldest: ${report.oldest.name} (${report.oldest.ageLabel})`);
  }

  return lines.join('\n');
}
