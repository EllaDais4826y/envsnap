import { loadSnapshot } from './snapshot';
import { Snapshot } from './snapshot';
import * as fs from 'fs';
import * as path from 'path';

export type ExportFormat = 'dotenv' | 'json' | 'shell';

export function exportAsDotenv(snapshot: Snapshot): string {
  return Object.entries(snapshot.vars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';
}

export function exportAsJson(snapshot: Snapshot): string {
  return JSON.stringify(snapshot.vars, null, 2) + '\n';
}

export function exportAsShell(snapshot: Snapshot): string {
  return Object.entries(snapshot.vars)
    .map(([key, value]) => `export ${key}="${value.replace(/"/g, '\\"')}"`)
    .join('\n') + '\n';
}

export function exportSnapshot(
  snapshotName: string,
  format: ExportFormat = 'dotenv',
  outputPath?: string
): string {
  const snapshot = loadSnapshot(snapshotName);

  let content: string;
  switch (format) {
    case 'json':
      content = exportAsJson(snapshot);
      break;
    case 'shell':
      content = exportAsShell(snapshot);
      break;
    case 'dotenv':
    default:
      content = exportAsDotenv(snapshot);
      break;
  }

  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, content, 'utf-8');
  }

  return content;
}
