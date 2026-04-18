import * as fs from 'fs';
import * as path from 'path';

export interface SnapshotNotes {
  [snapshotId: string]: string;
}

function getNotesPath(snapshotsDir: string): string {
  return path.join(snapshotsDir, 'notes.json');
}

export function loadNotes(snapshotsDir: string): SnapshotNotes {
  const notesPath = getNotesPath(snapshotsDir);
  if (!fs.existsSync(notesPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(notesPath, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveNotes(snapshotsDir: string, notes: SnapshotNotes): void {
  const notesPath = getNotesPath(snapshotsDir);
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
}

export function setNote(snapshotsDir: string, snapshotId: string, note: string): void {
  const notes = loadNotes(snapshotsDir);
  notes[snapshotId] = note;
  saveNotes(snapshotsDir, notes);
}

export function getNote(snapshotsDir: string, snapshotId: string): string | undefined {
  const notes = loadNotes(snapshotsDir);
  return notes[snapshotId];
}

export function removeNote(snapshotsDir: string, snapshotId: string): boolean {
  const notes = loadNotes(snapshotsDir);
  if (!(snapshotId in notes)) return false;
  delete notes[snapshotId];
  saveNotes(snapshotsDir, notes);
  return true;
}

export function formatNoteOutput(snapshotId: string, note: string | undefined): string {
  if (!note) return `No note found for snapshot "${snapshotId}".`;
  return `Note for "${snapshotId}":\n  ${note}`;
}
