import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { checkSnapshotHealth, formatHealthReport } from "./snapshot-health";
import { saveSnapshot } from "./snapshot";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "envsnap-health-"));
}

function writeSnapshot(
  dir: string,
  name: string,
  vars: Record<string, string>
): void {
  saveSnapshot(dir, { name, vars, createdAt: new Date().toISOString() });
}

describe("checkSnapshotHealth", () => {
  it("returns unhealthy report for missing snapshot", () => {
    const dir = makeTmpDir();
    const report = checkSnapshotHealth(dir, "ghost");
    expect(report.exists).toBe(false);
    expect(report.readable).toBe(false);
    expect(report.healthy).toBe(false);
    expect(report.varCount).toBe(0);
  });

  it("returns healthy report for valid snapshot", () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, "prod", { NODE_ENV: "production", PORT: "3000" });
    const report = checkSnapshotHealth(dir, "prod");
    expect(report.exists).toBe(true);
    expect(report.readable).toBe(true);
    expect(report.healthy).toBe(true);
    expect(report.varCount).toBe(2);
    expect(report.hasEmptyValues).toBe(false);
    expect(report.emptyValueKeys).toEqual([]);
  });

  it("detects empty values", () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, "staging", { API_KEY: "", HOST: "localhost" });
    const report = checkSnapshotHealth(dir, "staging");
    expect(report.hasEmptyValues).toBe(true);
    expect(report.emptyValueKeys).toContain("API_KEY");
  });

  it("reports unhealthy for snapshot with no vars", () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, "empty", {});
    const report = checkSnapshotHealth(dir, "empty");
    expect(report.hasVars).toBe(false);
    expect(report.healthy).toBe(false);
  });

  it("reports file size > 0 for existing snapshot", () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, "sized", { FOO: "bar" });
    const report = checkSnapshotHealth(dir, "sized");
    expect(report.fileSizeBytes).toBeGreaterThan(0);
  });
});

describe("formatHealthReport", () => {
  it("includes snapshot name and status", () => {
    const dir = makeTmpDir();
    writeSnapshot(dir, "prod", { NODE_ENV: "production" });
    const report = checkSnapshotHealth(dir, "prod");
    const output = formatHealthReport(report);
    expect(output).toContain("prod");
    expect(output).toContain("healthy");
    expect(output).toContain("Var count:");
  });

  it("shows unhealthy for missing snapshot", () => {
    const dir = makeTmpDir();
    const report = checkSnapshotHealth(dir, "missing");
    const output = formatHealthReport(report);
    expect(output).toContain("unhealthy");
  });
});
