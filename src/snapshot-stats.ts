import * as fs from 'fs';
import * as path from 'path';
import { loadSnapshot, listSnapshots } from './snapshot';

export interface SnapshotStats {
  name: string;
  varCount: number;
  createdAt: string;
  sizeBytes: number;
}

export interface StatsReport {
  totalSnapshots: number;
  totalVars: number;
  avgVarsPerSnapshot: number;
  largestSnapshot: SnapshotStats | null;
  smallestSnapshot: SnapshotStats | null;
  mostRecentSnapshot: SnapshotStats | null;
}

export function getSnapshotStats(snapshotsDir: string, name: string): SnapshotStats {
  const filePath = path.join(snapshotsDir, `${name}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const snapshot = JSON.parse(raw);
  const sizeBytes = Buffer.byteLength(raw, 'utf-8');
  const varCount = Object.keys(snapshot.vars ?? {}).length;
  const createdAt = snapshot.createdAt ?? new Date(fs.statSync(filePath).mtime).toISOString();
  return { name, varCount, createdAt, sizeBytes };
}

export function buildStatsReport(snapshotsDir: string): StatsReport {
  const names = listSnapshots(snapshotsDir);
  if (names.length === 0) {
    return {
      totalSnapshots: 0,
      totalVars: 0,
      avgVarsPerSnapshot: 0,
      largestSnapshot: null,
      smallestSnapshot: null,
      mostRecentSnapshot: null,
    };
  }

  const statsList = names.map((name) => getSnapshotStats(snapshotsDir, name));
  const totalVars = statsList.reduce((sum, s) => sum + s.varCount, 0);
  const avgVarsPerSnapshot = Math.round(totalVars / statsList.length);

  const largestSnapshot = statsList.reduce((a, b) => (a.varCount >= b.varCount ? a : b));
  const smallestSnapshot = statsList.reduce((a, b) => (a.varCount <= b.varCount ? a : b));
  const mostRecentSnapshot = statsList.reduce((a, b) =>
    new Date(a.createdAt) >= new Date(b.createdAt) ? a : b
  );

  return {
    totalSnapshots: statsList.length,
    totalVars,
    avgVarsPerSnapshot,
    largestSnapshot,
    smallestSnapshot,
    mostRecentSnapshot,
  };
}

export function formatStatsReport(report: StatsReport): string {
  if (report.totalSnapshots === 0) {
    return 'No snapshots found.';
  }
  const lines: string[] = [
    `Total snapshots    : ${report.totalSnapshots}`,
    `Total variables    : ${report.totalVars}`,
    `Avg vars/snapshot  : ${report.avgVarsPerSnapshot}`,
    `Largest snapshot   : ${report.largestSnapshot!.name} (${report.largestSnapshot!.varCount} vars)`,
    `Smallest snapshot  : ${report.smallestSnapshot!.name} (${report.smallestSnapshot!.varCount} vars)`,
    `Most recent        : ${report.mostRecentSnapshot!.name} (${report.mostRecentSnapshot!.createdAt})`,
  ];
  return lines.join('\n');
}
