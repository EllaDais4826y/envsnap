import { exportAsDotenv, exportAsJson, exportAsShell, exportSnapshot } from './export';
import * as snapshot from './snapshot';
import * as fs from 'fs';

const mockSnapshot = {
  name: 'test',
  timestamp: '2024-01-01T00:00:00.000Z',
  vars: { FOO: 'bar', BAZ: 'qux' },
};

jest.mock('./snapshot');
jest.mock('fs');

describe('exportAsDotenv', () => {
  it('formats vars as dotenv lines', () => {
    const result = exportAsDotenv(mockSnapshot);
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=qux');
  });
});

describe('exportAsJson', () => {
  it('formats vars as pretty JSON', () => {
    const result = exportAsJson(mockSnapshot);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});

describe('exportAsShell', () => {
  it('formats vars as export statements', () => {
    const result = exportAsShell(mockSnapshot);
    expect(result).toContain('export FOO="bar"');
    expect(result).toContain('export BAZ="qux"');
  });

  it('escapes double quotes in values', () => {
    const snap = { ...mockSnapshot, vars: { KEY: 'val"ue' } };
    const result = exportAsShell(snap);
    expect(result).toContain('export KEY="val\\"ue"');
  });
});

describe('exportSnapshot', () => {
  beforeEach(() => {
    (snapshot.loadSnapshot as jest.Mock).mockReturnValue(mockSnapshot);
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  it('returns dotenv format by default', () => {
    const result = exportSnapshot('test');
    expect(result).toContain('FOO=bar');
  });

  it('returns json format when specified', () => {
    const result = exportSnapshot('test', 'json');
    expect(JSON.parse(result)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('writes to file when outputPath provided', () => {
    exportSnapshot('test', 'dotenv', '/tmp/out.env');
    expect(fs.writeFileSync).toHaveBeenCalledWith('/tmp/out.env', expect.any(String), 'utf-8');
  });
});
