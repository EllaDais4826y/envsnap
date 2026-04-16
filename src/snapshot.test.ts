import * as fs from 'fs';
import * as path from 'path';
import { captureSnapshot, saveSnapshot, loadSnapshot, listSnapshots, Snapshot } from './snapshot';

const TEST_ENV_FILE = '.env.test';
const SNAPSHOTS_DIR = '.envsnap';

beforeEach(() => {
  fs.writeFileSync(TEST_ENV_FILE, 'DB_HOST=localhost\nDB_PORT=5432\nSECRET=abc123\n');
  if (fs.existsSync(SNAPSHOTS_DIR)) {
    fs.rmSync(SNAPSHOTS_DIR, { recursive: true });
  }
});

afterEach(() => {
  if (fs.existsSync(TEST_ENV_FILE)) fs.unlinkSync(TEST_ENV_FILE);
  if (fs.existsSync(SNAPSHOTS_DIR)) fs.rmSync(SNAPSHOTS_DIR, { recursive: true });
});

describe('captureSnapshot', () => {
  it('should parse env file into a snapshot object', () => {
    const snap = captureSnapshot('test-snap', TEST_ENV_FILE);
    expect(snap.name).toBe('test-snap');
    expect(snap.env['DB_HOST']).toBe('localhost');
    expect(snap.env['DB_PORT']).toBe('5432');
    expect(snap.env['SECRET']).toBe('abc123');
    expect(snap.timestamp).toBeDefined();
  });

  it('should throw if env file does not exist', () => {
    expect(() => captureSnapshot('bad', '.env.nonexistent')).toThrow('Environment file not found');
  });
});

describe('saveSnapshot and loadSnapshot', () => {
  it('should save and reload a snapshot correctly', () => {
    const snap = captureSnapshot('my-snap', TEST_ENV_FILE);
    const filepath = saveSnapshot(snap);
    expect(fs.existsSync(filepath)).toBe(true);

    const loaded = loadSnapshot('my-snap');
    expect(loaded.name).toBe('my-snap');
    expect(loaded.env['DB_HOST']).toBe('localhost');
  });

  it('should throw when loading a non-existent snapshot', () => {
    expect(() => loadSnapshot('ghost')).toThrow('Snapshot not found: ghost');
  });
});

describe('listSnapshots', () => {
  it('should return all saved snapshots', () => {
    const snap1 = captureSnapshot('snap-a', TEST_ENV_FILE);
    const snap2 = captureSnapshot('snap-b', TEST_ENV_FILE);
    saveSnapshot(snap1);
    saveSnapshot(snap2);

    const all = listSnapshots();
    const names = all.map((s: Snapshot) => s.name);
    expect(names).toContain('snap-a');
    expect(names).toContain('snap-b');
  });

  it('should return empty array when no snapshots exist', () => {
    const all = listSnapshots();
    expect(all).toEqual([]);
  });
});
