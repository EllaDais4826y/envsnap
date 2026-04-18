import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

const TAGS_FILE = '.envsnap/tags.json';

export interface TagMap {
  [tag: string]: string; // tag -> snapshot name
}

export function loadTags(): TagMap {
  ensureSnapshotsDir();
  if (!fs.existsSync(TAGS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(TAGS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveTags(tags: TagMap): void {
  ensureSnapshotsDir();
  fs.writeFileSync(TAGS_FILE, JSON.stringify(tags, null, 2), 'utf-8');
}

export function addTag(tag: string, snapshotName: string): void {
  const tags = loadTags();
  tags[tag] = snapshotName;
  saveTags(tags);
}

export function removeTag(tag: string): boolean {
  const tags = loadTags();
  if (!(tag in tags)) return false;
  delete tags[tag];
  saveTags(tags);
  return true;
}

export function resolveTag(nameOrTag: string): string {
  const tags = loadTags();
  return tags[nameOrTag] ?? nameOrTag;
}

export function listTags(): Array<{ tag: string; snapshot: string }> {
  const tags = loadTags();
  return Object.entries(tags).map(([tag, snapshot]) => ({ tag, snapshot }));
}
