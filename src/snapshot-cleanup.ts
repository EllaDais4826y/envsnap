import * as fs from 'fs';
import * as path from 'path';
import { listSnapshots } from './snapshot';

export interface CleanupOptions {
  olderThanDays?: number;
  keepLatest?: number;
  dryRun?: boolean;
}

export interface CleanupResult {
  removed: string[];
  kept: string[];
  dryRun: boolean;
}

export function getSnapshotsOlderThan(snapshotsDir: string, days: number): string[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const snapshots = listSnapshots(snapshotsDir);
  return snapshots.filter((name) => {
    const filePath = path.join(snapshotsDir, `${name}.json`);
    try {
      const stat = fs.statSync(filePath);
      return stat.mtimeMs < cutoff;
    } catch {
      return false;
    }
  });
}

export function getSnapshotsBeyondKeepLatest(snapshotsDir: string, keepLatest: number): string[] {
  const snapshots = listSnapshots(snapshotsDir);
  if (snapshots.length <= keepLatest) return [];
  const sorted = [...snapshots].sort((a, b) => {
    const statA = fs.statSync(path.join(snapshotsDir, `${a}.json`)).mtimeMs;
    const statB = fs.statSync(path.join(snapshotsDir, `${b}.json`)).mtimeMs;
    return statB - statA;
  });
  return sorted.slice(keepLatest);
}

export function cleanupSnapshots(snapshotsDir: string, options: CleanupOptions): CleanupResult {
  const { olderThanDays, keepLatest, dryRun = false } = options;
  const toRemoveSet = new Set<string>();

  if (olderThanDays !== undefined) {
    getSnapshotsOlderThan(snapshotsDir, olderThanDays).forEach((s) => toRemoveSet.add(s));
  }

  if (keepLatest !== undefined) {
    getSnapshotsBeyondKeepLatest(snapshotsDir, keepLatest).forEach((s) => toRemoveSet.add(s));
  }

  const removed: string[] = [];
  const kept: string[] = [];
  const all = listSnapshots(snapshotsDir);

  for (const name of all) {
    if (toRemoveSet.has(name)) {
      if (!dryRun) {
        fs.unlinkSync(path.join(snapshotsDir, `${name}.json`));
      }
      removed.push(name);
    } else {
      kept.push(name);
    }
  }

  return { removed, kept, dryRun };
}

export function formatCleanupOutput(result: CleanupResult): string {
  const lines: string[] = [];
  if (result.dryRun) lines.push('[dry-run] No files were deleted.\n');
  if (result.removed.length === 0) {
    lines.push('No snapshots matched the cleanup criteria.');
  } else {
    lines.push(`Removed ${result.removed.length} snapshot(s):`);
    result.removed.forEach((s) => lines.push(`  - ${s}`));
  }
  if (result.kept.length > 0) {
    lines.push(`\nKept ${result.kept.length} snapshot(s).`);
  }
  return lines.join('\n');
}
