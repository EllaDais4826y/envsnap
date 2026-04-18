import * as fs from 'fs';
import { loadPins, savePins, pinSnapshot, unpinSnapshot, resolvePin, listPins } from './pin';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

beforeEach(() => {
  jest.resetAllMocks();
  mockFs.existsSync.mockReturnValue(false);
});

test('loadPins returns empty object when file missing', () => {
  mockFs.existsSync.mockReturnValue(false);
  expect(loadPins()).toEqual({});
});

test('loadPins parses existing file', () => {
  mockFs.existsSync.mockReturnValue(true);
  mockFs.readFileSync.mockReturnValue(JSON.stringify({ prod: 'snap-123' }) as any);
  expect(loadPins()).toEqual({ prod: 'snap-123' });
});

test('pinSnapshot adds alias to store', () => {
  mockFs.existsSync.mockReturnValue(false);
  let written = '';
  mockFs.writeFileSync.mockImplementation((_p, data) => { written = data as string; });
  mockFs.mkdirSync.mockImplementation(() => undefined as any);
  pinSnapshot('staging', 'snap-456');
  const parsed = JSON.parse(written);
  expect(parsed).toEqual({ staging: 'snap-456' });
});

test('unpinSnapshot removes alias and returns true', () => {
  mockFs.existsSync.mockReturnValue(true);
  mockFs.readFileSync.mockReturnValue(JSON.stringify({ dev: 'snap-789' }) as any);
  mockFs.writeFileSync.mockImplementation(() => {});
  mockFs.mkdirSync.mockImplementation(() => undefined as any);
  const result = unpinSnapshot('dev');
  expect(result).toBe(true);
});

test('unpinSnapshot returns false for unknown alias', () => {
  mockFs.existsSync.mockReturnValue(true);
  mockFs.readFileSync.mockReturnValue(JSON.stringify({}) as any);
  expect(unpinSnapshot('nope')).toBe(false);
});

test('resolvePin returns snapshotId for known alias', () => {
  mockFs.existsSync.mockReturnValue(true);
  mockFs.readFileSync.mockReturnValue(JSON.stringify({ prod: 'snap-001' }) as any);
  expect(resolvePin('prod')).toBe('snap-001');
});

test('resolvePin returns undefined for unknown alias', () => {
  mockFs.existsSync.mockReturnValue(false);
  expect(resolvePin('ghost')).toBeUndefined();
});

test('listPins returns array of alias/snapshotId pairs', () => {
  mockFs.existsSync.mockReturnValue(true);
  mockFs.readFileSync.mockReturnValue(JSON.stringify({ a: '1', b: '2' }) as any);
  expect(listPins()).toEqual([{ alias: 'a', snapshotId: '1' }, { alias: 'b', snapshotId: '2' }]);
});
