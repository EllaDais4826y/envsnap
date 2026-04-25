import { diffSnapshots, formatDiff } from './diff';
import { loadSnapshot } from './snapshot';

export interface CompareReportEntry {
  snapshotA: string;
  snapshotB: string;
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  score: number; // similarity 0-100
}

export function buildCompareReport(
  snapshotNames: string[],
  snapshotsDir: string
): CompareReportEntry[] {
  const report: CompareReportEntry[] = [];

  for (let i = 0; i < snapshotNames.length - 1; i++) {
    const nameA = snapshotNames[i];
    const nameB = snapshotNames[i + 1];
    const snapA = loadSnapshot(nameA, snapshotsDir);
    const snapB = loadSnapshot(nameB, snapshotsDir);
    const diff = diffSnapshots(snapA.vars, snapB.vars);

    const added = diff.filter(d => d.type === 'added').length;
    const removed = diff.filter(d => d.type === 'removed').length;
    const changed = diff.filter(d => d.type === 'changed').length;
    const unchanged = diff.filter(d => d.type === 'unchanged').length;
    const total = added + removed + changed + unchanged;
    const score = total === 0 ? 100 : Math.round((unchanged / total) * 100);

    report.push({ snapshotA: nameA, snapshotB: nameB, added, removed, changed, unchanged, score });
  }

  return report;
}

export function formatCompareReport(report: CompareReportEntry[]): string {
  if (report.length === 0) return 'No comparisons to display.';

  const lines: string[] = ['Snapshot Comparison Report', '=========================='];

  for (const entry of report) {
    lines.push(`\n${entry.snapshotA} → ${entry.snapshotB}`);
    lines.push(`  Added   : ${entry.added}`);
    lines.push(`  Removed : ${entry.removed}`);
    lines.push(`  Changed : ${entry.changed}`);
    lines.push(`  Same    : ${entry.unchanged}`);
    lines.push(`  Score   : ${entry.score}% similar`);
  }

  return lines.join('\n');
}
