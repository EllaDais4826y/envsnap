import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { loadNotes, saveNotes, setNote, getNote, removeNote, formatNoteOutput } from './notes';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-notes-'));
}

describe('notes', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true }); });

  test('loadNotes returns empty object when file missing', () => {
    expect(loadNotes(tmpDir)).toEqual({});
  });

  test('setNote and getNote round-trip', () => {
    setNote(tmpDir, 'snap1', 'initial release');
    expect(getNote(tmpDir, 'snap1')).toBe('initial release');
  });

  test('setNote overwrites existing note', () => {
    setNote(tmpDir, 'snap1', 'first');
    setNote(tmpDir, 'snap1', 'second');
    expect(getNote(tmpDir, 'snap1')).toBe('second');
  });

  test('getNote returns undefined for unknown snapshot', () => {
    expect(getNote(tmpDir, 'nope')).toBeUndefined();
  });

  test('removeNote removes existing note and returns true', () => {
    setNote(tmpDir, 'snap1', 'hello');
    expect(removeNote(tmpDir, 'snap1')).toBe(true);
    expect(getNote(tmpDir, 'snap1')).toBeUndefined();
  });

  test('removeNote returns false for missing note', () => {
    expect(removeNote(tmpDir, 'ghost')).toBe(false);
  });

  test('loadNotes returns all notes', () => {
    setNote(tmpDir, 'a', 'note a');
    setNote(tmpDir, 'b', 'note b');
    expect(loadNotes(tmpDir)).toEqual({ a: 'note a', b: 'note b' });
  });

  test('formatNoteOutput with note', () => {
    expect(formatNoteOutput('snap1', 'my note')).toContain('my note');
  });

  test('formatNoteOutput without note', () => {
    expect(formatNoteOutput('snap1', undefined)).toContain('No note found');
  });
});
