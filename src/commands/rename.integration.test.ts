import * as fs from 'fs';
import * as path from 'path';
import { renameSnapshot } from '../rename';

const TEST_DIR = '.envsnap-rename-integration';

beforeEach(() => {
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('rename integration', () => {
  it('persists rename on disk correctly', () => {
    const data = JSON.stringify({ name: 'staging', timestamp: Date.now(), vars: { NODE_ENV: 'staging' } });
    fs.writeFileSync(path.join(TEST_DIR, 'staging.json'), data);

    const result = renameSnapshot('staging', 'staging-backup', TEST_DIR);
    expect(result.success).toBe(true);

    const newContent = fs.readFileSync(path.join(TEST_DIR, 'staging-backup.json'), 'utf-8');
    const parsed = JSON.parse(newContent);
    expect(parsed.vars.NODE_ENV).toBe('staging');
    expect(fs.existsSync(path.join(TEST_DIR, 'staging.json'))).toBe(false);
  });

  it('does not overwrite existing snapshot on rename', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'a.json'), JSON.stringify({ vars: { A: '1' } }));
    fs.writeFileSync(path.join(TEST_DIR, 'b.json'), JSON.stringify({ vars: { B: '2' } }));

    const result = renameSnapshot('a', 'b', TEST_DIR);
    expect(result.success).toBe(false);

    const bContent = JSON.parse(fs.readFileSync(path.join(TEST_DIR, 'b.json'), 'utf-8'));
    expect(bContent.vars.B).toBe('2');
  });
});
