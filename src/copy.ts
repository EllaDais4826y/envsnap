import { loadSnapshot, saveSnapshot, listSnapshots } from './snapshot';

export function snapshotExists(name: string): boolean {
  return listSnapshots().includes(name);
}

export function copySnapshot(
  sourceName: string,
  destName: string,
  overwrite = false
): void {
  if (!snapshotExists(sourceName)) {
    throw new Error(`Source snapshot "${sourceName}" does not exist.`);
  }
  if (snapshotExists(destName) && !overwrite) {
    throw new Error(
      `Destination snapshot "${destName}" already exists. Use --overwrite to replace it.`
    );
  }
  const snapshot = loadSnapshot(sourceName);
  const copied = {
    ...snapshot,
    name: destName,
    timestamp: new Date().toISOString(),
  };
  saveSnapshot(destName, copied);
}
