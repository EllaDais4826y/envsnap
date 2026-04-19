import { parseDotenvContent, parseJsonContent, importSnapshot } from './import';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-import-'));
}

describe('parseDotenvContent', () => {
  it('parses simple key=value pairs', () => {
    const result = parseDotenvContent('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comments and blank lines', () => {
    const result = parseDotenvContent('# comment\n\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('strips surrounding quotes', () => {
    const result = parseDotenvContent('FOO="hello world"\nBAR=\'single\'');
    expect(result).toEqual({ FOO: 'hello world', BAR: 'single' });
  });

  it('handles values with equals signs', () => {
    const result = parseDotenvContent('URL=http://x.com?a=1');
    expect(result).toEqual({ URL: 'http://x.com?a=1' });
  });
});

describe('parseJsonContent', () => {
  it('parses a flat json object', () => {
    const result = parseJsonContent(JSON.stringify({ FOO: 'bar', NUM: 42 }));
    expect(result).toEqual({ FOO: 'bar', NUM: '42' });
  });

  it('throws on invalid json', () => {
    expect(() => parseJsonContent('not json')).toThrow();
  });
});

describe('importSnapshot', () => {
  it('imports a .env file and saves snapshot', async () => {
    const dir = makeTmpDir();
    const envFile = path.join(dir, '.env');
    fs.writeFileSync(envFile, 'FOO=bar\nBAZ=123');
    const result = await importSnapshot(envFile, 'my-import', dir);
    expect(result.name).toBe('my-import');
    expect(result.count).toBe(2);
    const saved = path.join(dir, 'my-import.json');
    expect(fs.existsSync(saved)).toBe(true);
  });

  it('imports a .json file and saves snapshot', async () => {
    const dir = makeTmpDir();
    const jsonFile = path.join(dir, 'vars.json');
    fs.writeFileSync(jsonFile, JSON.stringify({ KEY: 'value' }));
    const result = await importSnapshot(jsonFile, 'json-import', dir);
    expect(result.count).toBe(1);
  });
});
