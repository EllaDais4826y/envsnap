import * as fs from 'fs';
import * as path from 'path';
import { listSnapshots, loadSnapshot } from './snapshot';

export interface DuplicateGroup {
  hash: string;
  snapshots: string[];
}

export interface DuplicatesReport {
  groups: DuplicateGroup[];
  totalDuplicates: number;
}

function hashVars(vars: Record<string, string>): string {
  const sorted = Object.keys(vars)
    .sort()
    .map((k) => `${k}=${vars[k]}`)
    .join('\n');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    const chr = sorted.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash.toString(16);
}

export async function findDuplicateSnapshots(
  snapshotsDir: string
): Promise<DuplicatesReport> {
  const names = await listSnapshots(snapshotsDir);
  const hashMap: Record<string, string[]> = {};

  for (const name of names) {
    const snapshot = await loadSnapshot(snapshotsDir, name);
    const hash = hashVars(snapshot.vars);
    if (!hashMap[hash]) hashMap[hash] = [];
    hashMap[hash].push(name);
  }

  const groups: DuplicateGroup[] = Object.entries(hashMap)
    .filter(([, snaps]) => snaps.length > 1)
    .map(([hash, snaps]) => ({ hash, snapshots: snaps }));

  const totalDuplicates = groups.reduce(
    (sum, g) => sum + g.snapshots.length - 1,
    0
  );

  return { groups, totalDuplicates };
}

export function formatDuplicatesReport(report: DuplicatesReport): string {
  if (report.groups.length === 0) {
    return 'No duplicate snapshots found.';
  }

  const lines: string[] = [
    `Found ${report.totalDuplicates} duplicate snapshot(s) in ${report.groups.length} group(s):`,
    '',
  ];

  for (const group of report.groups) {
    lines.push(`  Hash: ${group.hash}`);
    for (const snap of group.snapshots) {
      lines.push(`    - ${snap}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
