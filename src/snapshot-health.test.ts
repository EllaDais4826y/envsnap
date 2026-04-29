import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { checkSnapshotHealth, formatHealthReport } from './snapshot-health';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-health-'));
}

function writeSnapshot(dir: string, name: string, data: object): void {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data));
}

describe('checkSnapshotHealth', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns healthy for a valid snapshot', () => {
    writeSnapshot(tmpDir, 'snap1', {
      name: 'snap1',
      timestamp: new Date().toISOString(),
      env: { FOO: 'bar', BAZ: 'qux' },
    });
    const result = checkSnapshotHealth(tmpDir, 'snap1');
    expect(result.name).toBe('snap1');
    expect(result.healthy).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('reports missing env field', () => {
    writeSnapshot(tmpDir, 'snap2', { name: 'snap2', timestamp: new Date().toISOString() });
    const result = checkSnapshotHealth(tmpDir, 'snap2');
    expect(result.healthy).toBe(false);
    expect(result.issues).toContain('Missing env field');
  });

  it('reports missing timestamp', () => {
    writeSnapshot(tmpDir, 'snap3', { name: 'snap3', env: { A: '1' } });
    const result = checkSnapshotHealth(tmpDir, 'snap3');
    expect(result.healthy).toBe(false);
    expect(result.issues).toContain('Missing timestamp field');
  });

  it('reports empty env', () => {
    writeSnapshot(tmpDir, 'snap4', { name: 'snap4', timestamp: new Date().toISOString(), env: {} });
    const result = checkSnapshotHealth(tmpDir, 'snap4');
    expect(result.healthy).toBe(false);
    expect(result.issues).toContain('Env is empty');
  });

  it('reports snapshot not found', () => {
    const result = checkSnapshotHealth(tmpDir, 'nonexistent');
    expect(result.healthy).toBe(false);
    expect(result.issues).toContain('Snapshot file not found');
  });

  it('reports invalid JSON', () => {
    fs.writeFileSync(path.join(tmpDir, 'bad.json'), 'not json {{');
    const result = checkSnapshotHealth(tmpDir, 'bad');
    expect(result.healthy).toBe(false);
    expect(result.issues).toContain('Invalid JSON format');
  });
});

describe('formatHealthReport', () => {
  it('formats a healthy report', () => {
    const report = { name: 'snap1', healthy: true, issues: [] };
    const output = formatHealthReport(report);
    expect(output).toContain('snap1');
    expect(output).toContain('Healthy');
  });

  it('formats an unhealthy report with issues', () => {
    const report = { name: 'snap2', healthy: false, issues: ['Missing env field', 'Missing timestamp field'] };
    const output = formatHealthReport(report);
    expect(output).toContain('Unhealthy');
    expect(output).toContain('Missing env field');
    expect(output).toContain('Missing timestamp field');
  });
});
