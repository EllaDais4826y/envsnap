import * as fs from 'fs';
import * as path from 'path';

export interface AuditEntry {
  timestamp: string;
  action: string;
  snapshotName: string;
  details?: string;
}

export function getAuditPath(baseDir: string): string {
  return path.join(baseDir, '.envsnap', 'audit.json');
}

export function loadAudit(baseDir: string): AuditEntry[] {
  const auditPath = getAuditPath(baseDir);
  if (!fs.existsSync(auditPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveAudit(baseDir: string, entries: AuditEntry[]): void {
  const auditPath = getAuditPath(baseDir);
  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
  fs.writeFileSync(auditPath, JSON.stringify(entries, null, 2));
}

export function logAudit(baseDir: string, action: string, snapshotName: string, details?: string): void {
  const entries = loadAudit(baseDir);
  entries.push({ timestamp: new Date().toISOString(), action, snapshotName, details });
  saveAudit(baseDir, entries);
}

export function formatAuditOutput(entries: AuditEntry[]): string {
  if (entries.length === 0) return 'No audit entries found.';
  return entries
    .map(e => `[${e.timestamp}] ${e.action.toUpperCase()} "${e.snapshotName}"${e.details ? ` — ${e.details}` : ''}`)
    .join('\n');
}
