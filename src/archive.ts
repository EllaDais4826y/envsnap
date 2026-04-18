import fs from 'fs';
import path from 'path';
import { loadSnapshot, listSnapshots } from './snapshot';

export interface ArchiveEntry {
  name: string;
  snapshot: Record<string, string>;
  archivedAt: string;
}

export function getArchivePath(snapshotsDir: string): string {
  return path.join(snapshotsDir, '.archive.json');
}

export function loadArchive(snapshotsDir: string): ArchiveEntry[] {
  const archivePath = getArchivePath(snapshotsDir);
  if (!fs.existsSync(archivePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(archivePath, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveArchive(snapshotsDir: string, entries: ArchiveEntry[]): void {
  fs.writeFileSync(getArchivePath(snapshotsDir), JSON.stringify(entries, null, 2));
}

export function archiveSnapshot(snapshotsDir: string, name: string): ArchiveEntry {
  const snapshot = loadSnapshot(snapshotsDir, name);
  if (!snapshot) throw new Error(`Snapshot "${name}" not found.`);

  const snapshotFile = path.join(snapshotsDir, `${name}.json`);
  if (!fs.existsSync(snapshotFile)) throw new Error(`Snapshot file for "${name}" not found.`);

  const entry: ArchiveEntry = { name, snapshot, archivedAt: new Date().toISOString() };
  const archive = loadArchive(snapshotsDir);

  if (archive.find(e => e.name === name)) throw new Error(`Snapshot "${name}" is already archived.`);

  archive.push(entry);
  saveArchive(snapshotsDir, archive);
  fs.unlinkSync(snapshotFile);
  return entry;
}

export function unarchiveSnapshot(snapshotsDir: string, name: string): ArchiveEntry {
  const archive = loadArchive(snapshotsDir);
  const entry = archive.find(e => e.name === name);
  if (!entry) throw new Error(`No archived snapshot found with name "${name}".`);

  const existing = listSnapshots(snapshotsDir);
  if (existing.includes(name)) throw new Error(`A snapshot named "${name}" already exists.`);

  const snapshotFile = path.join(snapshotsDir, `${name}.json`);
  fs.writeFileSync(snapshotFile, JSON.stringify(entry.snapshot, null, 2));

  const updated = archive.filter(e => e.name !== name);
  saveArchive(snapshotsDir, updated);
  return entry;
}

export function listArchive(snapshotsDir: string): ArchiveEntry[] {
  return loadArchive(snapshotsDir);
}
