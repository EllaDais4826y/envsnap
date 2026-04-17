import { diffCommand } from './diff';
import * as snapshotModule from '../snapshot';
import { Snapshot } from '../snapshot';

const mockSnapshot = (name: string, variables: Record<string, string>): Snapshot => ({
  name,
  createdAt: '2024-01-01T00:00:00.000Z',
  variables,
});

describe('diffCommand', () => {
  let consoleSpy: jest.SpyInstance;
  let loadSnapshotSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    loadSnapshotSpy = jest.spyOn(snapshotModule, 'loadSnapshot');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prints formatted diff by default', async () => {
    loadSnapshotSpy
      .mockResolvedValueOnce(mockSnapshot('snap-a', { FOO: 'bar' }))
      .mockResolvedValueOnce(mockSnapshot('snap-b', { FOO: 'baz' }));

    await diffCommand('snap-a', 'snap-b');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain('snap-a → snap-b');
    expect(output).toContain('FOO');
  });

  it('prints JSON when json option is true', async () => {
    loadSnapshotSpy
      .mockResolvedValueOnce(mockSnapshot('snap-a', { KEY: 'v1' }))
      .mockResolvedValueOnce(mockSnapshot('snap-b', { KEY: 'v2' }));

    await diffCommand('snap-a', 'snap-b', { json: true });

    const output = consoleSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.from).toBe('snap-a');
    expect(parsed.to).toBe('snap-b');
    expect(parsed.entries).toHaveLength(1);
  });

  it('exits with error when snapshot not found', async () => {
    loadSnapshotSpy.mockRejectedValueOnce(new Error('not found'));
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(diffCommand('missing', 'snap-b')).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('missing'));
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
