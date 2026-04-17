import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { compareSnapshots } from '../compare';
import { saveSnapshot } from '../snapshot';

describe('compareSnapshots integration', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'envsnap-compare-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('detects added, removed, and changed variables', async () => {
    await saveSnapshot(
      { name: 'base', timestamp: new Date().toISOString(), variables: { A: '1', B: '2' } },
      tmpDir
    );
    await saveSnapshot(
      { name: 'next', timestamp: new Date().toISOString(), variables: { A: '1', B: '3', C: '4' } },
      tmpDir
    );

    const result = await compareSnapshots('base', 'next', tmpDir);

    expect(result.unchanged).toEqual({ A: '1' });
    expect(result.changed).toEqual({ B: { from: '2', to: '3' } });
    expect(result.added).toEqual({ C: '4' });
    expect(result.removed).toEqual({});
    expect(result.summary).toContain('Added:     1');
  });
});
