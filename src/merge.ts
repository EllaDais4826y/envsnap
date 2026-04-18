import { loadSnapshot, saveSnapshot } from './snapshot';
import { EnvSnapshot } from './snapshot';

export type MergeStrategy = 'ours' | 'theirs' | 'union';

export interface MergeResult {
  merged: Record<string, string>;
  conflicts: string[];
}

export function mergeSnapshots(
  base: EnvSnapshot,
  other: EnvSnapshot,
  strategy: MergeStrategy = 'union'
): MergeResult {
  const merged: Record<string, string> = {};
  const conflicts: string[] = [];

  const allKeys = new Set([
    ...Object.keys(base.vars),
    ...Object.keys(other.vars),
  ]);

  for (const key of allKeys) {
    const inBase = key in base.vars;
    const inOther = key in other.vars;

    if (inBase && inOther) {
      if (base.vars[key] === other.vars[key]) {
        merged[key] = base.vars[key];
      } else {
        conflicts.push(key);
        if (strategy === 'ours') {
          merged[key] = base.vars[key];
        } else if (strategy === 'theirs') {
          merged[key] = other.vars[key];
        } else {
          merged[key] = other.vars[key];
        }
      }
    } else if (inBase) {
      merged[key] = base.vars[key];
    } else {
      merged[key] = other.vars[key];
    }
  }

  return { merged, conflicts };
}

export async function mergeAndSave(
  baseId: string,
  otherId: string,
  targetName: string,
  strategy: MergeStrategy = 'union'
): Promise<MergeResult> {
  const base = await loadSnapshot(baseId);
  const other = await loadSnapshot(otherId);
  const result = mergeSnapshots(base, other, strategy);
  await saveSnapshot(targetName, result.merged);
  return result;
}
