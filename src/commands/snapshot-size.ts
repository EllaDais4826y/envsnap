import type { Argv } from 'yargs';
import * as path from 'path';
import { getSnapshotSizeReport, formatSnapshotSizeReport } from '../snapshot-size';
import { ensureSnapshotsDir } from '../snapshot';

export function registerSnapshotSizeCommand(yargs: Argv): Argv {
  return yargs.command(
    'size',
    'Show disk usage and variable counts for all snapshots',
    (y) =>
      y
        .option('dir', {
          type: 'string',
          description: 'Snapshots directory',
          default: '.envsnap',
        })
        .option('json', {
          type: 'boolean',
          description: 'Output as JSON',
          default: false,
        }),
    (argv) => {
      const snapshotsDir = path.resolve(argv.dir as string);
      ensureSnapshotsDir(snapshotsDir);

      const report = getSnapshotSizeReport(snapshotsDir);

      if (argv.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      console.log(formatSnapshotSizeReport(report));
    }
  );
}
