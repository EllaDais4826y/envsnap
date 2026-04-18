import { copySnapshot } from './copy';
import { loadSnapshot, saveSnapshot, listSnapshots } from './snapshot';

jest.mock('./snapshot');

const mockList = listSnapshots as jest.MockedFunction<typeof listSnapshots>;
const mockLoad = loadSnapshot as jest.MockedFunction<typeof loadSnapshot>;
const mockSave = saveSnapshot as jest.MockedFunction<typeof saveSnapshot>;

const fakeSnapshot = {
  name: 'snap-a',
  timestamp: '2024-01-01T00:00:00.000Z',
  variables: { FOO: 'bar' },
};

beforeEach(() => jest.clearAllMocks());

test('copies snapshot to new name', () => {
  mockList.mockReturnValue(['snap-a']);
  mockLoad.mockReturnValue(fakeSnapshot);
  copySnapshot('snap-a', 'snap-b');
  expect(mockSave).toHaveBeenCalledWith(
    'snap-b',
    expect.objectContaining({ name: 'snap-b', variables: { FOO: 'bar' } })
  );
});

test('throws if source does not exist', () => {
  mockList.mockReturnValue([]);
  expect(() => copySnapshot('missing', 'snap-b')).toThrow(
    'Source snapshot "missing" does not exist.'
  );
});

test('throws if destination exists without overwrite', () => {
  mockList.mockReturnValue(['snap-a', 'snap-b']);
  expect(() => copySnapshot('snap-a', 'snap-b')).toThrow(
    'already exists'
  );
});

test('allows overwrite when flag is set', () => {
  mockList.mockReturnValue(['snap-a', 'snap-b']);
  mockLoad.mockReturnValue(fakeSnapshot);
  expect(() => copySnapshot('snap-a', 'snap-b', true)).not.toThrow();
  expect(mockSave).toHaveBeenCalled();
});
