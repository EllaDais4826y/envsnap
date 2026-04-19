import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { loadAudit, saveAudit, logAudit, formatAuditOutput, AuditEntry } from './audit';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-audit-'));
}

describe('audit', () => {
  it('returns empty array when no audit file exists', () => {
    const dir = makeTmpDir();
    expect(loadAudit(dir)).toEqual([]);
  });

  it('saves and loads audit entries', () => {
    const dir = makeTmpDir();
    const entries: AuditEntry[] = [
      { timestamp: '2024-01-01T00:00:00.000Z', action: 'snapshot', snapshotName: 'prod' }
    ];
    saveAudit(dir, entries);
    expect(loadAudit(dir)).toEqual(entries);
  });

  it('logAudit appends a new entry', () => {
    const dir = makeTmpDir();
    logAudit(dir, 'snapshot', 'dev', 'initial capture');
    logAudit(dir, 'restore', 'dev');
    const entries = loadAudit(dir);
    expect(entries).toHaveLength(2);
    expect(entries[0].action).toBe('snapshot');
    expect(entries[1].action).toBe('restore');
    expect(entries[0].details).toBe('initial capture');
  });

  it('formatAuditOutput returns message when empty', () => {
    expect(formatAuditOutput([])).toBe('No audit entries found.');
  });

  it('formatAuditOutput formats entries correctly', () => {
    const entries: AuditEntry[] = [
      { timestamp: '2024-01-01T00:00:00.000Z', action: 'snapshot', snapshotName: 'prod', details: 'manual' }
    ];
    const output = formatAuditOutput(entries);
    expect(output).toContain('SNAPSHOT');
    expect(output).toContain('"prod"');
    expect(output).toContain('manual');
  });
});
