import { inspectSnapshot, formatInspectOutput } from './inspect';
import { saveSnapshot } from './snapshot';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-inspect-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true });
});

const mockSnapshot = {
  name: 'test',
  timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
  variables: { APP_ENV: 'production', PORT: '3000', DB_HOST: 'localhost' },
};

test('inspectSnapshot returns sorted keys and count', () => {
  saveSnapshot(mockSnapshot, tmpDir);
  const result = inspectSnapshot('test', tmpDir);
  expect(result.count).toBe(3);
  expect(result.keys).toEqual(['APP_ENV', 'DB_HOST', 'PORT']);
  expect(result.name).toBe('test');
});

test('inspectSnapshot includes variables', () => {
  saveSnapshot(mockSnapshot, tmpDir);
  const result = inspectSnapshot('test', tmpDir);
  expect(result.variables['PORT']).toBe('3000');
});

test('formatInspectOutput without values hides values', () => {
  saveSnapshot(mockSnapshot, tmpDir);
  const result = inspectSnapshot('test', tmpDir);
  const output = formatInspectOutput(result, false);
  expect(output).toContain('APP_ENV');
  expect(output).not.toContain('production');
  expect(output).toContain('Variables: 3');
});

test('formatInspectOutput with values shows key=value pairs', () => {
  saveSnapshot(mockSnapshot, tmpDir);
  const result = inspectSnapshot('test', tmpDir);
  const output = formatInspectOutput(result, true);
  expect(output).toContain('APP_ENV=production');
  expect(output).toContain('PORT=3000');
});
