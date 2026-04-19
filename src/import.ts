import * as fs from 'fs';
import * as path from 'path';
import { saveSnapshot } from './snapshot';

export interface ImportResult {
  name: string;
  count: number;
}

export function parseDotenvContent(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) vars[key] = value;
  }
  return vars;
}

export function parseJsonContent(content: string): Record<string, string> {
  const parsed = JSON.parse(content);
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v === 'string') vars[k] = v;
    else vars[k] = String(v);
  }
  return vars;
}

export async function importSnapshot(
  filePath: string,
  snapshotName: string,
  snapshotsDir: string
): Promise<ImportResult> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();

  let vars: Record<string, string>;
  if (ext === '.json') {
    vars = parseJsonContent(content);
  } else {
    vars = parseDotenvContent(content);
  }

  const snapshot = {
    name: snapshotName,
    timestamp: new Date().toISOString(),
    vars,
  };

  await saveSnapshot(snapshotsDir, snapshot);
  return { name: snapshotName, count: Object.keys(vars).length };
}
