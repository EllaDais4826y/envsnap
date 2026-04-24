import type { Argv } from 'yargs';
import * as path from 'path';
import { buildStatsReport, formatStatsReport } from '../snapshot-stats';
import { ensureSnapshotsDir } from '../snapshot';

export function registerSnapshotStatsCommand(yargs: Argv): Argv {
  return yargs.command(
    'stats',
    'Show statistics about all stored snapshots',
    (y) =>
      y.option('dir', {
        type: 'string',
        description: 'Custom snapshots directory',
        default: '.envsnap',
      }),
    (argv) => {
      const snapshotsDir = path.resolve(argv.dir as string);
      ensureSnapshotsDir(snapshotsDir);

      const report = buildStatsReport(snapshotsDir);
      console.log(formatStatsReport(report));
    }
  );
}
