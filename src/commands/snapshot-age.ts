import { Argv } from 'yargs';
import * as path from 'path';
import { getSnapshotAgeReport, formatSnapshotAgeReport } from '../snapshot-age';
import { ensureSnapshotsDir } from '../snapshot';

export function registerSnapshotAgeCommand(yargs: Argv): Argv {
  return yargs.command(
    'snapshot-age',
    'Show the age of each snapshot',
    (y) =>
      y.option('dir', {
        type: 'string',
        description: 'Snapshots directory',
        default: '.envsnap',
      }),
    (argv) => {
      const snapshotsDir = path.resolve(argv.dir as string);
      ensureSnapshotsDir(snapshotsDir);
      const report = getSnapshotAgeReport(snapshotsDir);
      console.log(formatSnapshotAgeReport(report));
    }
  );
}
