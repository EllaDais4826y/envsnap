import * as fs from 'fs';
import * as path from 'path';
import { renameSnapshot } from './rename';

const TEST_DIR = '.envsnap-test-rename';

beforeEach(() => {
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('renameSnapshot', () => {
  it('renames an existing snapshot', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'old.json'), JSON.stringify({ vars: {} }));
    const result = renameSnapshot('old', 'new', TEST_DIR);
    expect(result.success).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, 'new.json'))).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, 'old.json'))).toBe(false);
  });

  it('returns error if source snapshot does not exist', () => {
    const result = renameSnapshot('ghost', 'new', TEST_DIR);
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });

  it('returns error if target snapshot already exists', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'a.json'), '{}');
    fs.writeFileSync(path.join(TEST_DIR, 'b.json'), '{}');
    const result = renameSnapshot('a', 'b', TEST_DIR);
    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
  });

  it('returns error for invalid new name', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'a.json'), '{}');
    const result = renameSnapshot('a', 'bad name!', TEST_DIR);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid snapshot name');
  });
});
