import * as fs from 'fs';
import * as path from 'path';
import { listSnapshots } from './snapshot';

export interface SnapshotSizeEntry {
  name: string;
  sizeBytes: number;
  varCount: number;
  createdAt: string;
}

export interface SnapshotSizeReport {
  entries: SnapshotSizeEntry[];
  totalBytes: number;
  largestSnapshot: string | null;
  smallestSnapshot: string | null;
}

export function getSnapshotSizeReport(snapshotsDir: string): SnapshotSizeReport {
  const names = listSnapshots(snapshotsDir);
  const entries: SnapshotSizeEntry[] = [];

  for (const name of names) {
    const filePath = path.join(snapshotsDir, `${name}.json`);
    if (!fs.existsSync(filePath)) continue;

    const stat = fs.statSync(filePath);
    const raw = fs.readFileSync(filePath, 'utf-8');
    let varCount = 0;
    let createdAt = '';

    try {
      const parsed = JSON.parse(raw);
      varCount = parsed.vars ? Object.keys(parsed.vars).length : 0;
      createdAt = parsed.createdAt ?? '';
    } catch {
      // ignore parse errors
    }

    entries.push({ name, sizeBytes: stat.size, varCount, createdAt });
  }

  entries.sort((a, b) => b.sizeBytes - a.sizeBytes);

  const totalBytes = entries.reduce((sum, e) => sum + e.sizeBytes, 0);
  const largestSnapshot = entries.length > 0 ? entries[0].name : null;
  const smallestSnapshot = entries.length > 0 ? entries[entries.length - 1].name : null;

  return { entries, totalBytes, largestSnapshot, smallestSnapshot };
}

export function formatSnapshotSizeReport(report: SnapshotSizeReport): string {
  if (report.entries.length === 0) {
    return 'No snapshots found.';
  }

  const lines: string[] = ['Snapshot Size Report', '='.repeat(40)];

  for (const entry of report.entries) {
    const kb = (entry.sizeBytes / 1024).toFixed(2);
    lines.push(`  ${entry.name.padEnd(30)} ${kb.padStart(8)} KB   ${entry.varCount} vars`);
  }

  lines.push('='.repeat(40));
  const totalKb = (report.totalBytes / 1024).toFixed(2);
  lines.push(`Total: ${totalKb} KB across ${report.entries.length} snapshot(s)`);
  if (report.largestSnapshot) lines.push(`Largest:  ${report.largestSnapshot}`);
  if (report.smallestSnapshot && report.smallestSnapshot !== report.largestSnapshot) {
    lines.push(`Smallest: ${report.smallestSnapshot}`);
  }

  return lines.join('\n');
}
