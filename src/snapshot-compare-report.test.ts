import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { buildCompareReport, formatCompareReport } from './snapshot-compare-report';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-report-'));
}

function writeSnapshot(dir: string, name: string, vars: Record<string, string>) {
  const snap = { name, timestamp: new Date().toISOString(), vars };
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(snap));
}

describe('buildCompareReport', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true }); });

  it('returns empty array for fewer than 2 snapshots', () => {
    writeSnapshot(tmpDir, 'snap1', { A: '1' });
    const result = buildCompareReport(['snap1'], tmpDir);
    expect(result).toEqual([]);
  });

  it('computes correct counts for two snapshots', () => {
    writeSnapshot(tmpDir, 'snap1', { A: '1', B: '2', C: '3' });
    writeSnapshot(tmpDir, 'snap2', { A: '1', B: '9', D: '4' });
    const result = buildCompareReport(['snap1', 'snap2'], tmpDir);
    expect(result).toHaveLength(1);
    const entry = result[0];
    expect(entry.snapshotA).toBe('snap1');
    expect(entry.snapshotB).toBe('snap2');
    expect(entry.unchanged).toBe(1); // A
    expect(entry.changed).toBe(1);   // B
    expect(entry.removed).toBe(1);   // C
    expect(entry.added).toBe(1);     // D
  });

  it('score is 100 for identical snapshots', () => {
    writeSnapshot(tmpDir, 'a', { X: '1' });
    writeSnapshot(tmpDir, 'b', { X: '1' });
    const result = buildCompareReport(['a', 'b'], tmpDir);
    expect(result[0].score).toBe(100);
  });

  it('handles multiple consecutive pairs', () => {
    writeSnapshot(tmpDir, 'v1', { A: '1' });
    writeSnapshot(tmpDir, 'v2', { A: '2' });
    writeSnapshot(tmpDir, 'v3', { A: '2' });
    const result = buildCompareReport(['v1', 'v2', 'v3'], tmpDir);
    expect(result).toHaveLength(2);
  });
});

describe('formatCompareReport', () => {
  it('returns message for empty report', () => {
    expect(formatCompareReport([])).toBe('No comparisons to display.');
  });

  it('includes snapshot names and counts', () => {
    const entry = { snapshotA: 'snap1', snapshotB: 'snap2', added: 1, removed: 2, changed: 3, unchanged: 4, score: 57 };
    const output = formatCompareReport([entry]);
    expect(output).toContain('snap1 → snap2');
    expect(output).toContain('Added   : 1');
    expect(output).toContain('Score   : 57% similar');
  });
});
