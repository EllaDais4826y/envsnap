import * as fs from 'fs';
import * as path from 'path';

export interface SnapshotTemplate {
  name: string;
  keys: string[];
  defaults?: Record<string, string>;
  description?: string;
}

const TEMPLATES_FILE = '.envsnap/templates.json';

export function getTemplatesPath(dir: string = process.cwd()): string {
  return path.join(dir, TEMPLATES_FILE);
}

export function loadTemplates(dir?: string): Record<string, SnapshotTemplate> {
  const filePath = getTemplatesPath(dir);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveTemplates(templates: Record<string, SnapshotTemplate>, dir?: string): void {
  const filePath = getTemplatesPath(dir);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(templates, null, 2));
}

export function setTemplate(name: string, template: SnapshotTemplate, dir?: string): void {
  const templates = loadTemplates(dir);
  templates[name] = template;
  saveTemplates(templates, dir);
}

export function removeTemplate(name: string, dir?: string): boolean {
  const templates = loadTemplates(dir);
  if (!templates[name]) return false;
  delete templates[name];
  saveTemplates(templates, dir);
  return true;
}

export function applyTemplate(
  template: SnapshotTemplate,
  env: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of template.keys) {
    if (env[key] !== undefined) {
      result[key] = env[key];
    } else if (template.defaults && template.defaults[key] !== undefined) {
      result[key] = template.defaults[key];
    }
  }
  return result;
}

export function listTemplates(dir?: string): SnapshotTemplate[] {
  return Object.values(loadTemplates(dir));
}
