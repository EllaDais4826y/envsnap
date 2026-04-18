import * as fs from 'fs';
import * as path from 'path';

const PINS_FILE = '.envsnap/pins.json';

export interface PinStore {
  [alias: string]: string; // alias -> snapshotId
}

export function loadPins(): PinStore {
  if (!fs.existsSync(PINS_FILE)) return {};
  const raw = fs.readFileSync(PINS_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function savePins(pins: PinStore): void {
  const dir = path.dirname(PINS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PINS_FILE, JSON.stringify(pins, null, 2));
}

export function pinSnapshot(alias: string, snapshotId: string): void {
  const pins = loadPins();
  pins[alias] = snapshotId;
  savePins(pins);
}

export function unpinSnapshot(alias: string): boolean {
  const pins = loadPins();
  if (!(alias in pins)) return false;
  delete pins[alias];
  savePins(pins);
  return true;
}

export function resolvePin(alias: string): string | undefined {
  const pins = loadPins();
  return pins[alias];
}

export function listPins(): Array<{ alias: string; snapshotId: string }> {
  const pins = loadPins();
  return Object.entries(pins).map(([alias, snapshotId]) => ({ alias, snapshotId }));
}
