import { Snapshot } from './snapshot';

export interface DiffEntry {
  key: string;
  status: 'added' | 'removed' | 'changed';
  oldValue?: string;
  newValue?: string;
}

export interface SnapshotDiff {
  from: string;
  to: string;
  entries: DiffEntry[];
  added: number;
  removed: number;
  changed: number;
}

export function diffSnapshots(a: Snapshot, b: Snapshot): SnapshotDiff {
  const entries: DiffEntry[] = [];
  const aVars = a.variables;
  const bVars = b.variables;

  const allKeys = new Set([...Object.keys(aVars), ...Object.keys(bVars)]);

  for (const key of allKeys) {
    const inA = Object.prototype.hasOwnProperty.call(aVars, key);
    const inB = Object.prototype.hasOwnProperty.call(bVars, key);

    if (inA && !inB) {
      entries.push({ key, status: 'removed', oldValue: aVars[key] });
    } else if (!inA && inB) {
      entries.push({ key, status: 'added', newValue: bVars[key] });
    } else if (aVars[key] !== bVars[key]) {
      entries.push({ key, status: 'changed', oldValue: aVars[key], newValue: bVars[key] });
    }
  }

  entries.sort((x, y) => x.key.localeCompare(y.key));

  return {
    from: a.name,
    to: b.name,
    entries,
    added: entries.filter(e => e.status === 'added').length,
    removed: entries.filter(e => e.status === 'removed').length,
    changed: entries.filter(e => e.status === 'changed').length,
  };
}

export function formatDiff(diff: SnapshotDiff): string {
  const lines: string[] = [];
  lines.push(`Diff: ${diff.from} → ${diff.to}`);
  lines.push(`+${diff.added} added  -${diff.removed} removed  ~${diff.changed} changed\n`);

  for (const entry of diff.entries) {
    if (entry.status === 'added') {
      lines.push(`  + ${entry.key}=${entry.newValue}`);
    } else if (entry.status === 'removed') {
      lines.push(`  - ${entry.key}=${entry.oldValue}`);
    } else {
      lines.push(`  ~ ${entry.key}: ${entry.oldValue} → ${entry.newValue}`);
    }
  }

  if (diff.entries.length === 0) {
    lines.push('  No differences found.');
  }

  return lines.join('\n');
}
