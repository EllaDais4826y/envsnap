import * as fs from 'fs';
import * as path from 'path';
import { ensureSnapshotsDir } from './snapshot';

export interface Profile {
  name: string;
  description?: string;
  snapshots: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProfileMap = Record<string, Profile>;

export function getProfilesPath(dir: string): string {
  return path.join(dir, 'profiles.json');
}

export function loadProfiles(dir: string): ProfileMap {
  const p = getProfilesPath(dir);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function saveProfiles(dir: string, profiles: ProfileMap): void {
  ensureSnapshotsDir(dir);
  fs.writeFileSync(getProfilesPath(dir), JSON.stringify(profiles, null, 2));
}

export function setProfile(dir: string, name: string, snapshots: string[], description?: string): Profile {
  const profiles = loadProfiles(dir);
  const now = new Date().toISOString();
  const existing = profiles[name];
  const profile: Profile = {
    name,
    description: description ?? existing?.description,
    snapshots,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  profiles[name] = profile;
  saveProfiles(dir, profiles);
  return profile;
}

export function removeProfile(dir: string, name: string): boolean {
  const profiles = loadProfiles(dir);
  if (!profiles[name]) return false;
  delete profiles[name];
  saveProfiles(dir, profiles);
  return true;
}

export function getProfile(dir: string, name: string): Profile | undefined {
  return loadProfiles(dir)[name];
}

export function listProfiles(dir: string): Profile[] {
  return Object.values(loadProfiles(dir));
}

export function formatProfileOutput(profiles: Profile[]): string {
  if (profiles.length === 0) return 'No profiles found.';
  return profiles
    .map(p => {
      const desc = p.description ? ` — ${p.description}` : '';
      return `${p.name}${desc}\n  snapshots: ${p.snapshots.join(', ') || '(none)'}\n  updated: ${p.updatedAt}`;
    })
    .join('\n\n');
}
