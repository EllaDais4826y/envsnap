import { loadSnapshot } from './snapshot';
import { diffSnapshots, formatDiff } from './diff';

export interface CompareResult {
  snapshotA: string;
  snapshotB: string;
  added: Record<string, string>;
  removed: Record<string, string>;
  changed: Record<string, { from: string; to: string }>;
  unchanged: Record<string, string>;
  summary: string;
}

export function summarizeComparison(result: CompareResult): string {
  const { added, removed, changed, unchanged } = result;
  const lines: string[] = [
    `Comparing '${result.snapshotA}' → '${result.snapshotB}'`,
    `  Added:     ${Object.keys(added).length}`,
    `  Removed:   ${Object.keys(removed).length}`,
    `  Changed:   ${Object.keys(changed).length}`,
    `  Unchanged: ${Object.keys(unchanged).length}`,
  ];
  return lines.join('\n');
}

export async function compareSnapshots(
  nameA: string,
  nameB: string,
  dir?: string
): Promise<CompareResult> {
  const snapA = await loadSnapshot(nameA, dir);
  const snapB = await loadSnapshot(nameB, dir);
  const diff = diffSnapshots(snapA.variables, snapB.variables);
  const result: CompareResult = {
    snapshotA: nameA,
    snapshotB: nameB,
    ...diff,
    summary: '',
  };
  result.summary = summarizeComparison(result);
  return result;
}

export function formatCompareOutput(result: CompareResult, verbose = false): string {
  const parts: string[] = [result.summary];
  if (verbose) {
    parts.push('');
    parts.push(formatDiff(result));
  }
  return parts.join('\n');
}
