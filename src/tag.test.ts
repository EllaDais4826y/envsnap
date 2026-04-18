import * as fs from 'fs';
import * as path from 'path';
import { addTag, removeTag, resolveTag, listTags, loadTags } from './tag';

jest.mock('fs');
jest.mock('./snapshot', () => ({ ensureSnapshotsDir: jest.fn() }));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('tag', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockFs.existsSync.mockReturnValue(false);
  });

  describe('loadTags', () => {
    it('returns empty object when tags file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(loadTags()).toEqual({});
    });

    it('parses tags from file', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ prod: 'snap-1' }));
      expect(loadTags()).toEqual({ prod: 'snap-1' });
    });
  });

  describe('addTag', () => {
    it('saves a new tag', () => {
      mockFs.existsSync.mockReturnValue(false);
      addTag('staging', 'snap-2');
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '.envsnap/tags.json',
        JSON.stringify({ staging: 'snap-2' }, null, 2),
        'utf-8'
      );
    });
  });

  describe('removeTag', () => {
    it('returns false when tag does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(removeTag('missing')).toBe(false);
    });

    it('removes existing tag and returns true', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ prod: 'snap-1' }));
      expect(removeTag('prod')).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '.envsnap/tags.json',
        JSON.stringify({}, null, 2),
        'utf-8'
      );
    });
  });

  describe('resolveTag', () => {
    it('returns snapshot name for known tag', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ prod: 'snap-1' }));
      expect(resolveTag('prod')).toBe('snap-1');
    });

    it('returns input unchanged when tag not found', () => {
      mockFs.existsSync.mockReturnValue(false);
      expect(resolveTag('snap-direct')).toBe('snap-direct');
    });
  });
});
