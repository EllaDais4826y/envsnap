import * as fs from 'fs';
import * as path from 'path';

export interface SnapshotStatEntry {
  name: string;
  varCount: number;
  createdAt: string;
}

export interface SnapshotStats {
  total: number;
  totalVars: number;
  avgVarsPerSnapshot: number;
  largestSnapshot: { name: string; varCount: number } | null;
  newestSnapshot: { name: string; createdAt: string } | null;
  oldestSnapshot: { name: string; createdAt: string } | null;
}

export async function getSnapshotStats(snapshotsDir: string): Promise<SnapshotStats> {
  if (!fs.existsSync(snapshotsDir)) {
    return { total: 0, totalVars: 0, avgVarsPerSnapshot: 0, largestSnapshot: null, newestSnapshot: null, oldestSnapshot: null };
  }

  const files = fs.readdirSync(snapshotsDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    return { total: 0, totalVars: 0, avgVarsPerSnapshot: 0, largestSnapshot: null, newestSnapshot: null, oldestSnapshot: null };
  }

  const entries: SnapshotStatEntry[] = files.map(file => {
    const raw = fs.readFileSync(path.join(snapshotsDir, file), 'utf-8');
    const snap = JSON.parse(raw);
    return {
      name: snap.name ?? file.replace('.json', ''),
      varCount: Object.keys(snap.vars ?? {}).length,
      createdAt: snap.createdAt ?? new Date(0).toISOString(),
    };
  });

  const totalVars = entries.reduce((sum, e) => sum + e.varCount, 0);
  const avgVarsPerSnapshot = totalVars / entries.length;

  const largestSnapshot = entries.reduce((max, e) => e.varCount > max.varCount ? e : max, entries[0]);
  const sorted = [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return {
    total: entries.length,
    totalVars,
    avgVarsPerSnapshot,
    largestSnapshot: { name: largestSnapshot.name, varCount: largestSnapshot.varCount },
    newestSnapshot: { name: sorted[sorted.length - 1].name, createdAt: sorted[sorted.length - 1].createdAt },
    oldestSnapshot: { name: sorted[0].name, createdAt: sorted[0].createdAt },
  };
}

export function buildStatsReport(stats: SnapshotStats): string {
  return formatStatsReport(
    stats.total,
    stats.totalVars,
    stats.avgVarsPerSnapshot,
    stats.largestSnapshot?.name,
    stats.newestSnapshot?.name,
    stats.oldestSnapshot?.name,
  );
}

export function formatStatsReport(
  total: number,
  totalVars: number,
  avg: number,
  largest?: string,
  newest?: string,
  oldest?: string,
): string {
  const lines: string[] = [
    `Total Snapshots    : ${total}`,
    `Total Variables    : ${totalVars}`,
    `Avg Vars/Snapshot  : ${avg.toFixed(2)}`,
  ];
  if (largest) lines.push(`Largest Snapshot   : ${largest}`);
  if (newest)  lines.push(`Newest Snapshot    : ${newest}`);
  if (oldest)  lines.push(`Oldest Snapshot    : ${oldest}`);
  return lines.join('\n');
}
