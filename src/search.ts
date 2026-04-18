import { loadSnapshot, listSnapshots } from './snapshot';

export interface SearchResult {
  snapshotId: string;
  matchedKeys: string[];
}

export async function searchSnapshots(
  dir: string,
  query: string,
  options: { keyOnly?: boolean } = {}
): Promise<SearchResult[]> {
  const ids = await listSnapshots(dir);
  const results: SearchResult[] = [];

  for (const id of ids) {
    const snapshot = await loadSnapshot(dir, id);
    const matchedKeys: string[] = [];

    for (const [key, value] of Object.entries(snapshot.vars)) {
      const keyMatch = key.toLowerCase().includes(query.toLowerCase());
      const valueMatch =
        !options.keyOnly &&
        value.toLowerCase().includes(query.toLowerCase());

      if (keyMatch || valueMatch) {
        matchedKeys.push(key);
      }
    }

    if (matchedKeys.length > 0) {
      results.push({ snapshotId: id, matchedKeys });
    }
  }

  return results;
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No matches found.';
  }

  const lines: string[] = [];
  for (const result of results) {
    lines.push(`Snapshot: ${result.snapshotId}`);
    for (const key of result.matchedKeys) {
      lines.push(`  - ${key}`);
    }
  }
  return lines.join('\n');
}
