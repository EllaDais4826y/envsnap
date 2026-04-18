import * as fs from 'fs';
import * as path from 'path';
import { captureSnapshot, saveSnapshot } from './snapshot';

export interface WatchOptions {
  envFile: string;
  label?: string;
  debounceMs?: number;
}

export interface WatchEvent {
  snapshotId: string;
  timestamp: Date;
  envFile: string;
}

export function startWatch(
  options: WatchOptions,
  onSnapshot: (event: WatchEvent) => void
): () => void {
  const { envFile, label, debounceMs = 300 } = options;
  const filePath = path.resolve(envFile);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const handleChange = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const vars = parseEnvContent(content);
      const snapshotId = await captureAndSave(vars, label);
      onSnapshot({ snapshotId, timestamp: new Date(), envFile: filePath });
    }, debounceMs);
  };

  const watcher = fs.watch(filePath, handleChange);

  return () => watcher.close();
}

function parseEnvContent(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) vars[key] = value;
  }
  return vars;
}

async function captureAndSave(
  vars: Record<string, string>,
  label?: string
): Promise<string> {
  const snapshot = captureSnapshot(vars, label);
  await saveSnapshot(snapshot);
  return snapshot.id;
}
