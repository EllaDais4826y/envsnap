import { loadSnapshot } from './snapshot';

export interface FilterOptions {
  prefix?: string;
  keys?: string[];
  pattern?: string;
}

export interface FilterResult {
  snapshotName: string;
  matched: Record<string, string>;
  total: number;
  matchedCount: number;
}

export function filterSnapshotVars(
  vars: Record<string, string>,
  options: FilterOptions
): Record<string, string> {
  let entries = Object.entries(vars);

  if (options.prefix) {
    const p = options.prefix.toUpperCase();
    entries = entries.filter(([k]) => k.toUpperCase().startsWith(p));
  }

  if (options.keys && options.keys.length > 0) {
    const keySet = new Set(options.keys.map(k => k.toUpperCase()));
    entries = entries.filter(([k]) => keySet.has(k.toUpperCase()));
  }

  if (options.pattern) {
    const regex = new RegExp(options.pattern, 'i');
    entries = entries.filter(([k, v]) => regex.test(k) || regex.test(v));
  }

  return Object.fromEntries(entries);
}

export async function filterSnapshot(
  snapshotName: string,
  options: FilterOptions,
  dir?: string
): Promise<FilterResult> {
  const snapshot = await loadSnapshot(snapshotName, dir);
  const matched = filterSnapshotVars(snapshot.vars, options);
  return {
    snapshotName,
    matched,
    total: Object.keys(snapshot.vars).length,
    matchedCount: Object.keys(matched).length,
  };
}

export function formatFilterOutput(result: FilterResult): string {
  const lines: string[] = [
    `Snapshot: ${result.snapshotName}`,
    `Matched ${result.matchedCount} of ${result.total} variables:`,
    '',
  ];
  for (const [key, value] of Object.entries(result.matched)) {
    lines.push(`  ${key}=${value}`);
  }
  if (result.matchedCount === 0) {
    lines.push('  (no matches)');
  }
  return lines.join('\n');
}
