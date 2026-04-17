import * as fs from 'fs';
import * as path from 'path';
import { loadSnapshot } from './snapshot';
import { EnvSnapshot } from './snapshot';

export interface RestoreResult {
  written: string[];
  skipped: string[];
  targetFile: string;
}

export function buildEnvFileContent(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';
}

export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    result[key] = value;
  }
  return result;
}

export function restoreSnapshot(
  snapshotName: string,
  targetFile: string = '.env',
  options: { overwrite?: boolean; merge?: boolean } = {}
): RestoreResult {
  const snapshot: EnvSnapshot = loadSnapshot(snapshotName);
  const { overwrite = false, merge = false } = options;

  let existingVars: Record<string, string> = {};
  if (merge && fs.existsSync(targetFile)) {
    const existing = fs.readFileSync(targetFile, 'utf-8');
    existingVars = parseEnvFile(existing);
  }

  const written: string[] = [];
  const skipped: string[] = [];

  const finalVars: Record<string, string> = merge ? { ...existingVars } : {};

  for (const [key, value] of Object.entries(snapshot.vars)) {
    if (!overwrite && !merge && fs.existsSync(targetFile)) {
      skipped.push(key);
      continue;
    }
    if (merge && existingVars[key] !== undefined && !overwrite) {
      skipped.push(key);
      continue;
    }
    finalVars[key] = value;
    written.push(key);
  }

  if (!merge && overwrite) {
    for (const [key, value] of Object.entries(snapshot.vars)) {
      finalVars[key] = value;
      written.push(key);
    }
  }

  const content = buildEnvFileContent(finalVars);
  fs.writeFileSync(targetFile, content, 'utf-8');

  return { written, skipped, targetFile };
}
