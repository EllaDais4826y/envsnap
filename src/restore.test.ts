import * as fs from 'fs';
import * as path from 'path';
import { buildEnvFileContent, parseEnvFile } from './restore';

jest.mock('fs');
jest.mock('./snapshot');

const { loadSnapshot } = require('./snapshot');

describe('buildEnvFileContent', () => {
  it('serializes vars to .env format', () => {
    const content = buildEnvFileContent({ FOO: 'bar', BAZ: '123' });
    expect(content).toContain('FOO=bar');
    expect(content).toContain('BAZ=123');
    expect(content.endsWith('\n')).toBe(true);
  });

  it('returns empty newline for empty vars', () => {
    expect(buildEnvFileContent({})).toBe('\n');
  });
});

describe('parseEnvFile', () => {
  it('parses basic key=value lines', () => {
    const result = parseEnvFile('FOO=bar\nBAZ=123\n');
    expect(result).toEqual({ FOO: 'bar', BAZ: '123' });
  });

  it('skips comments and empty lines', () => {
    const result = parseEnvFile('# comment\n\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('handles values with equals signs', () => {
    const result = parseEnvFile('URL=http://a.com?x=1');
    expect(result.URL).toBe('http://a.com?x=1');
  });
});

describe('restoreSnapshot', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    loadSnapshot.mockReturnValue({
      name: 'test',
      timestamp: Date.now(),
      vars: { FOO: 'restored', NEW_VAR: 'value' },
    });
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.readFileSync as jest.Mock).mockReturnValue('');
  });

  it('writes all vars when target file does not exist', () => {
    const { restoreSnapshot } = require('./restore');
    const result = restoreSnapshot('test', '.env', { overwrite: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(result.targetFile).toBe('.env');
  });

  it('uses custom target file path', () => {
    const { restoreSnapshot } = require('./restore');
    restoreSnapshot('test', '.env.local', { overwrite: true });
    const callArgs = (fs.writeFileSync as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe('.env.local');
  });
});
