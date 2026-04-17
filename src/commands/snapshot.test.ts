import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as snapshotModule from '../snapshot';

vi.mock('../snapshot', () => ({
  captureSnapshot: vi.fn(),
  saveSnapshot: vi.fn(),
  listSnapshots: vi.fn(),
}));

const mockCaptureSnapshot = vi.mocked(snapshotModule.captureSnapshot);
const mockSaveSnapshot = vi.mocked(snapshotModule.saveSnapshot);
const mockListSnapshots = vi.mocked(snapshotModule.listSnapshots);

describe('snapshot command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('capture subcommand', () => {
    it('captures and saves a snapshot', async () => {
      const fakeSnapshot = { name: 'test', timestamp: Date.now(), vars: { FOO: 'bar' } };
      mockCaptureSnapshot.mockReturnValue(fakeSnapshot);
      mockSaveSnapshot.mockResolvedValue(undefined);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await snapshotModule.saveSnapshot(snapshotModule.captureSnapshot('test'));

      expect(mockCaptureSnapshot).toHaveBeenCalledWith('test');
      expect(mockSaveSnapshot).toHaveBeenCalledWith(fakeSnapshot);
      consoleSpy.mockRestore();
    });
  });

  describe('list subcommand', () => {
    it('lists available snapshots', async () => {
      const fakeSnapshots = [
        { name: 'snap1', timestamp: 1700000000000, vars: {} },
        { name: 'snap2', timestamp: 1700000001000, vars: {} },
      ];
      mockListSnapshots.mockResolvedValue(fakeSnapshots);

      const result = await snapshotModule.listSnapshots();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('snap1');
    });

    it('returns empty array when no snapshots exist', async () => {
      mockListSnapshots.mockResolvedValue([]);

      const result = await snapshotModule.listSnapshots();
      expect(result).toHaveLength(0);
    });
  });
});
