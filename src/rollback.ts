import * as fs from 'fs';
import * as path from 'path';
import { loadSnapshot, listSnapshots } from './snapshot';
import { logAudit } from './audit';

export interface RollbackResult {
  success: boolean;
  restoredSnapshot: string;
  previousSnapshot: string | null;
  message: string;
}

export function getPreviousSnapshot(
  snapshotsDir: string,
  currentName: string
): string | null {
  const snapshots = listSnapshots(snapshotsDir);
  const sorted = snapshots
    .map((s) => ({
      name: s,
      mtime: fs.statSync(path.join(snapshotsDir, `${s}.json`)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  const currentIndex = sorted.findIndex((s) => s.name === currentName);
  if (currentIndex === -1 || currentIndex + 1 >= sorted.length) return null;
  return sorted[currentIndex + 1].name;
}

export function rollbackSnapshot(
  snapshotsDir: string,
  currentName: string,
  auditPath?: string
): RollbackResult {
  const previous = getPreviousSnapshot(snapshotsDir, currentName);

  if (!previous) {
    return {
      success: false,
      restoredSnapshot: '',
      previousSnapshot: null,
      message: `No previous snapshot found before "${currentName}".`,
    };
  }

  const snapshot = loadSnapshot(snapshotsDir, previous);

  if (auditPath) {
    logAudit(auditPath, {
      action: 'rollback',
      snapshot: previous,
      timestamp: new Date().toISOString(),
      details: `Rolled back from "${currentName}" to "${previous}"`,
    });
  }

  return {
    success: true,
    restoredSnapshot: previous,
    previousSnapshot: currentName,
    message: `Rolled back from "${currentName}" to "${previous}" with ${Object.keys(snapshot.vars).length} variable(s).`,
  };
}
