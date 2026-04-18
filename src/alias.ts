import * as fs from 'fs';
import * as path from 'path';

const ALIASES_FILE = path.join(process.cwd(), '.envsnap', 'aliases.json');

export interface AliasMap {
  [alias: string]: string;
}

export function getAliasesPath(): string {
  return ALIASES_FILE;
}

export function loadAliases(dir: string = path.dirname(ALIASES_FILE)): AliasMap {
  const file = path.join(dir, 'aliases.json');
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function saveAliases(aliases: AliasMap, dir: string = path.dirname(ALIASES_FILE)): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'aliases.json'), JSON.stringify(aliases, null, 2));
}

export function setAlias(alias: string, snapshotName: string, dir?: string): AliasMap {
  const aliases = loadAliases(dir);
  aliases[alias] = snapshotName;
  saveAliases(aliases, dir);
  return aliases;
}

export function removeAlias(alias: string, dir?: string): AliasMap {
  const aliases = loadAliases(dir);
  if (!(alias in aliases)) throw new Error(`Alias '${alias}' not found`);
  delete aliases[alias];
  saveAliases(aliases, dir);
  return aliases;
}

export function resolveAlias(nameOrAlias: string, dir?: string): string {
  const aliases = loadAliases(dir);
  return aliases[nameOrAlias] ?? nameOrAlias;
}

export function listAliases(dir?: string): AliasMap {
  return loadAliases(dir);
}
