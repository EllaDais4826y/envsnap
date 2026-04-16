import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export interface Snapshot {
  name: string;
  timestamp: string;
  env: Record<string, string>;
}

const SNAPSHOTS_DIR = '.envsnap';

export function ensureSnapshotsDir(): void {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
}

export function captureSnapshot(name: string, envFilePath: string = '.env'): Snapshot {
  if (!fs.existsSync(envFilePath)) {
    throw new Error(`Environment file not found: ${envFilePath}`);
  }

  const parsed = dotenv.parse(fs.readFileSync(envFilePath));

  const snapshot: Snapshot = {
    name,
    timestamp: new Date().toISOString(),
    env: parsed,
  };

  return snapshot;
}

export function saveSnapshot(snapshot: Snapshot): string {
  ensureSnapshotsDir();
  const filename = `${snapshot.name}.json`;
  const filepath = path.join(SNAPSHOTS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
  return filepath;
}

export function loadSnapshot(name: string): Snapshot {
  const filepath = path.join(SNAPSHOTS_DIR, `${name}.json`);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Snapshot not found: ${name}`);
  }
  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw) as Snapshot;
}

export function listSnapshots(): Snapshot[] {
  ensureSnapshotsDir();
  const files = fs.readdirSync(SNAPSHOTS_DIR).filter(f => f.endsWith('.json'));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(SNAPSHOTS_DIR, file), 'utf-8');
    return JSON.parse(raw) as Snapshot;
  });
}
