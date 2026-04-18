import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { registerSearchCommand } from './search';
import { saveSnapshot } from '../snapshot';

let tmpDir: string;
let program: Command;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'envsnap-search-'));
  program = new Command();
  program.exitOverride();
  registerSearchCommand(program);
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

test('finds key in saved snapshot', async () => {
  await saveSnapshot(tmpDir, 'snap1', { vars: { DATABASE_URL: 'postgres://localhost/db', PORT: '5432' } });

  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  await program.parseAsync(['node', 'envsnap', 'search', 'DATABASE', '--dir', tmpDir]);

  const output: string = consoleSpy.mock.calls[0][0];
  expect(output).toContain('snap1');
  expect(output).toContain('DATABASE_URL');
  consoleSpy.mockRestore();
});

test('returns no matches message when nothing found', async () => {
  await saveSnapshot(tmpDir, 'snap1', { vars: { PORT: '3000' } });

  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  await program.parseAsync(['node', 'envsnap', 'search', 'NONEXISTENT', '--dir', tmpDir]);

  expect(consoleSpy.mock.calls[0][0]).toBe('No matches found.');
  consoleSpy.mockRestore();
});
