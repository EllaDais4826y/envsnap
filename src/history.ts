import * as fs from 'fs';
import * as path from 'path';
import { listSnapshots, loadSnapshot } from './snapshot';

export interface SnapshotHistoryEntry {
  name: string;
  timestamp: number;
  keyCount: number;
  keys: string[];
}

export function getSnapshotHistory(snapshotsDir: string): SnapshotHistoryEntry[] {
  const names = listSnapshots(snapshotsDir);
  const entries: SnapshotHistoryEntry[] = [];

  for (const name of names) {
    try {
      const snapshot = loadSnapshot(snapshotsDir, name);
      const keys = Object.keys(snapshot.env);
      entries.push({
        name,
        timestamp: snapshot.timestamp,
        keyCount: keys.length,
        keys,
      });
    } catch {
      // skip unreadable snapshots
    }
  }

  return entries.sort((a, b) => b.timestamp - a.timestamp);
}

export function formatHistoryOutput(entries: SnapshotHistoryEntry[]): string {
  if (entries.length === 0) {
    return 'No snapshots found.';
  }

  const lines: string[] = ['Snapshot History:', ''];

  for (const entry of entries) {
    const date = new Date(entry.timestamp).toISOString();
    lines.push(`  ${entry.name}`);
    lines.push(`    Date:   ${date}`);
    lines.push(`    Keys:   ${entry.keyCount}`);
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
