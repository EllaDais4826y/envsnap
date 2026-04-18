import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

const SNAPSHOTS_DIR = '.envsnap';

export function snapshotExists(name: string): boolean {
  const filePath = path.join(SNAPSHOTS_DIR, `${name}.json`);
  return fs.existsSync(filePath);
}

export function renameSnapshot(
  oldName: string,
  newName: string,
  snapshotsDir: string = SNAPSHOTS_DIR
): { success: boolean; message: string } {
  ensureSnapshotsDir();

  const oldPath = path.join(snapshotsDir, `${oldName}.json`);
  const newPath = path.join(snapshotsDir, `${newName}.json`);

  if (!fs.existsSync(oldPath)) {
    return { success: false, message: `Snapshot "${oldName}" not found.` };
  }

  if (fs.existsSync(newPath)) {
    return { success: false, message: `Snapshot "${newName}" already exists.` };
  }

  if (!newName || !/^[a-zA-Z0-9_\-\.]+$/.test(newName)) {
    return {
      success: false,
      message: `Invalid snapshot name "${newName}". Use alphanumeric characters, dashes, underscores, or dots.`,
    };
  }

  fs.renameSync(oldPath, newPath);
  return { success: true, message: `Snapshot "${oldName}" renamed to "${newName}".` };
}
