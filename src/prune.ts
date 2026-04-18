import * as fs from 'fs';
import * as path from 'path';
import { listSnapshots } from './snapshot';
import { loadTags } from './tag';

export interface PruneOptions {
  keepLast?: number;
  dryRun?: boolean;
}

export interface PruneResult {
  removed: string[];
  kept: string[];
}

export function getSnapshotsToRemove(
  snapshots: string[],
  tags: Record<string, string>,
  keepLast: number
): string[] {
  const taggedIds = new Set(Object.values(tags));
  const sorted = [...snapshots].sort();
  const untagged = sorted.filter((id) => !taggedIds.has(id));
  if (untagged.length <= keepLast) return [];
  return untagged.slice(0, untagged.length - keepLast);
}

export async function pruneSnapshots(
  snapshotsDir: string,
  options: PruneOptions = {}
): Promise<PruneResult> {
  const { keepLast = 5, dryRun = false } = options;
  const snapshots = await listSnapshots(snapshotsDir);
  const tags = await loadTags(snapshotsDir);
  const tagMap: Record<string, string> = {};
  for (const [name, id] of Object.entries(tags)) {
    tagMap[name] = id;
  }

  const toRemove = getSnapshotsToRemove(snapshots, tagMap, keepLast);
  const kept = snapshots.filter((s) => !toRemove.includes(s));

  if (!dryRun) {
    for (const id of toRemove) {
      const filePath = path.join(snapshotsDir, `${id}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  return { removed: toRemove, kept };
}
