import { listSnapshots, loadSnapshot } from './snapshot';

export interface SnapshotSummary {
  name: string;
  timestamp: string;
  varCount: number;
}

export async function getSnapshotSummaries(dir?: string): Promise<SnapshotSummary[]> {
  const names = await listSnapshots(dir);
  const summaries: SnapshotSummary[] = [];

  for (const name of names) {
    try {
      const snapshot = await loadSnapshot(name, dir);
      summaries.push({
        name,
        timestamp: snapshot.timestamp,
        varCount: Object.keys(snapshot.env).length,
      });
    } catch {
      // skip unreadable snapshots
    }
  }

  return summaries;
}

export function formatSnapshotList(summaries: SnapshotSummary[]): string {
  if (summaries.length === 0) {
    return 'No snapshots found.';
  }

  const header = `${'NAME'.padEnd(30)} ${'TIMESTAMP'.padEnd(25)} VARS`;
  const separator = '-'.repeat(60);
  const rows = summaries.map(
    (s) =>
      `${s.name.padEnd(30)} ${new Date(s.timestamp).toLocaleString().padEnd(25)} ${s.varCount}`
  );

  return [header, separator, ...rows].join('\n');
}
