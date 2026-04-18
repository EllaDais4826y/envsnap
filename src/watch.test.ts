import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { startWatch } from './watch';
import { loadSnapshot } from './snapshot';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-watch-'));
const envFile = path.join(tmpDir, '.env');

beforeEach(() => {
  fs.writeFileSync(envFile, 'FOO=bar\nBAZ=qux\n');
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('startWatch', () => {
  it('returns a stop function', () => {
    const stop = startWatch({ envFile }, () => {});
    expect(typeof stop).toBe('function');
    stop();
  });

  it('calls onSnapshot when file changes', (done) => {
    const stop = startWatch({ envFile, debounceMs: 50 }, async (event) => {
      stop();
      expect(event.envFile).toBe(path.resolve(envFile));
      expect(event.snapshotId).toBeTruthy();
      expect(event.timestamp).toBeInstanceOf(Date);

      const snapshot = await loadSnapshot(event.snapshotId);
      expect(snapshot.vars['HELLO']).toBe('world');
      done();
    });

    setTimeout(() => {
      fs.writeFileSync(envFile, 'HELLO=world\n');
    }, 20);
  }, 3000);

  it('debounces rapid changes', (done) => {
    let callCount = 0;
    const stop = startWatch({ envFile, debounceMs: 100 }, () => {
      callCount++;
    });

    fs.writeFileSync(envFile, 'A=1\n');
    fs.writeFileSync(envFile, 'A=2\n');
    fs.writeFileSync(envFile, 'A=3\n');

    setTimeout(() => {
      stop();
      expect(callCount).toBeLessThanOrEqual(2);
      done();
    }, 400);
  }, 3000);
});
