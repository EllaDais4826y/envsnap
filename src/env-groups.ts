import * as fs from 'fs';
import * as path from 'path';

export interface EnvGroup {
  name: string;
  keys: string[];
  description?: string;
  createdAt: string;
}

export interface EnvGroupsFile {
  groups: Record<string, EnvGroup>;
}

export function getEnvGroupsPath(dir: string): string {
  return path.join(dir, '.envsnap', 'groups.json');
}

export function loadEnvGroups(dir: string): EnvGroupsFile {
  const filePath = getEnvGroupsPath(dir);
  if (!fs.existsSync(filePath)) {
    return { groups: {} };
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as EnvGroupsFile;
}

export function saveEnvGroups(dir: string, data: EnvGroupsFile): void {
  const filePath = getEnvGroupsPath(dir);
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function setEnvGroup(
  dir: string,
  name: string,
  keys: string[],
  description?: string
): EnvGroup {
  const data = loadEnvGroups(dir);
  const group: EnvGroup = {
    name,
    keys,
    description,
    createdAt: data.groups[name]?.createdAt ?? new Date().toISOString(),
  };
  data.groups[name] = group;
  saveEnvGroups(dir, data);
  return group;
}

export function removeEnvGroup(dir: string, name: string): boolean {
  const data = loadEnvGroups(dir);
  if (!data.groups[name]) return false;
  delete data.groups[name];
  saveEnvGroups(dir, data);
  return true;
}

export function getEnvGroup(dir: string, name: string): EnvGroup | undefined {
  const data = loadEnvGroups(dir);
  return data.groups[name];
}

export function listEnvGroups(dir: string): EnvGroup[] {
  const data = loadEnvGroups(dir);
  return Object.values(data.groups);
}

export function filterSnapshotByGroup(
  vars: Record<string, string>,
  group: EnvGroup
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(vars).filter(([key]) => group.keys.includes(key))
  );
}
