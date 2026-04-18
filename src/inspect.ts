import { loadSnapshot } from './snapshot';

export interface InspectResult {
  name: string;
  timestamp: string;
  count: number;
  keys: string[];
  variables: Record<string, string>;
}

export function inspectSnapshot(name: string, snapshotsDir: string): InspectResult {
  const snapshot = loadSnapshot(name, snapshotsDir);
  const keys = Object.keys(snapshot.variables).sort();
  return {
    name: snapshot.name,
    timestamp: snapshot.timestamp,
    count: keys.length,
    keys,
    variables: snapshot.variables,
  };
}

export function formatInspectOutput(
  result: InspectResult,
  showValues: boolean = false
): string {
  const lines: string[] = [];
  lines.push(`Snapshot: ${result.name}`);
  lines.push(`Captured: ${new Date(result.timestamp).toLocaleString()}`);
  lines.push(`Variables: ${result.count}`);
  lines.push('');
  lines.push('Keys:');
  for (const key of result.keys) {
    if (showValues) {
      lines.push(`  ${key}=${result.variables[key]}`);
    } else {
      lines.push(`  ${key}`);
    }
  }
  return lines.join('\n');
}
