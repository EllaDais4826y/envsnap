import { listSnapshots, loadSnapshot } from './snapshot';

export interface SnapshotSummary {
  name: string;
  timestamp: string;
  keyCount: number;
  sizeBytes: number;
}

export async function getSnapshotSummaries(snapshotsDir: string): Promise<SnapshotSummary[]> {
  const names = await listSnapshots(snapshotsDir);
  const summaries: SnapshotSummary[] = [];

  for (const name of names) {
    const snapshot = await loadSnapshot(snapshotsDir, name);
    const content = JSON.stringify(snapshot.env);
    summaries.push({
      name,
      timestamp: snapshot.timestamp,
      keyCount: Object.keys(snapshot.env).length,
      sizeBytes: Buffer.byteLength(content, 'utf8'),
    });
  }

  return summaries;
}

export function formatSummaryOutput(summaries: SnapshotSummary[]): string {
  if (summaries.length === 0) {
    return 'No snapshots found.';
  }

  const header = `${'Name'.padEnd(30)} ${'Timestamp'.padEnd(25)} ${'Keys'.padStart(6)} ${'Size'.padStart(10)}`;
  const divider = '-'.repeat(header.length);

  const rows = summaries.map(s =>
    `${s.name.padEnd(30)} ${s.timestamp.padEnd(25)} ${String(s.keyCount).padStart(6)} ${(s.sizeBytes + ' B').padStart(10)}`
  );

  return [header, divider, ...rows].join('\n');
}
