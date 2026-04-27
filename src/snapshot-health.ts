import * as fs from "fs";
import * as path from "path";
import { listSnapshots, loadSnapshot } from "./snapshot";

export interface SnapshotHealthReport {
  name: string;
  exists: boolean;
  readable: boolean;
  hasVars: boolean;
  varCount: number;
  hasEmptyValues: boolean;
  emptyValueKeys: string[];
  hasDuplicateKeys: boolean;
  fileSizeBytes: number;
  healthy: boolean;
}

export function checkSnapshotHealth(
  snapshotsDir: string,
  snapshotName: string
): SnapshotHealthReport {
  const filePath = path.join(snapshotsDir, `${snapshotName}.json`);
  const exists = fs.existsSync(filePath);

  if (!exists) {
    return {
      name: snapshotName,
      exists: false,
      readable: false,
      hasVars: false,
      varCount: 0,
      hasEmptyValues: false,
      emptyValueKeys: [],
      hasDuplicateKeys: false,
      fileSizeBytes: 0,
      healthy: false,
    };
  }

  let readable = false;
  let vars: Record<string, string> = {};
  let fileSizeBytes = 0;

  try {
    const stat = fs.statSync(filePath);
    fileSizeBytes = stat.size;
    const snapshot = loadSnapshot(snapshotsDir, snapshotName);
    vars = snapshot.vars;
    readable = true;
  } catch {
    readable = false;
  }

  const varCount = Object.keys(vars).length;
  const hasVars = varCount > 0;
  const emptyValueKeys = Object.entries(vars)
    .filter(([, v]) => v === "" || v === undefined || v === null)
    .map(([k]) => k);
  const hasEmptyValues = emptyValueKeys.length > 0;

  // Duplicate keys aren't possible in a JS object, but we check raw file for them
  let hasDuplicateKeys = false;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const keyMatches = raw.match(/"([^"]+)"\s*:/g) ?? [];
    const keys = keyMatches.map((k) => k.replace(/"(.*?)"\s*:/, "$1"));
    hasDuplicateKeys = new Set(keys).size !== keys.length;
  } catch {
    // ignore
  }

  const healthy = readable && hasVars && !hasDuplicateKeys;

  return {
    name: snapshotName,
    exists,
    readable,
    hasVars,
    varCount,
    hasEmptyValues,
    emptyValueKeys,
    hasDuplicateKeys,
    fileSizeBytes,
    healthy,
  };
}

export function formatHealthReport(report: SnapshotHealthReport): string {
  const status = report.healthy ? "✅ healthy" : "❌ unhealthy";
  const lines: string[] = [
    `Snapshot: ${report.name} — ${status}`,
    `  Exists:          ${report.exists}`,
    `  Readable:        ${report.readable}`,
    `  Var count:       ${report.varCount}`,
    `  File size:       ${report.fileSizeBytes} bytes`,
    `  Empty values:    ${report.hasEmptyValues ? report.emptyValueKeys.join(", ") : "none"}`,
    `  Duplicate keys:  ${report.hasDuplicateKeys}`,
  ];
  return lines.join("\n");
}
