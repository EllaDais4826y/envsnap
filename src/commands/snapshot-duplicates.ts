import { Argv } from 'yargs';
import * as path from 'path';
import {
  findDuplicateSnapshots,
  formatDuplicatesReport,
} from '../snapshot-duplicates';
import { ensureSnapshotsDir } from '../snapshot';

export function registerSnapshotDuplicatesCommand(yargs: Argv): Argv {
  return yargs.command(
    'duplicates',
    'Find snapshots with identical environment variable sets',
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
    async (argv) => {
      const snapshotsDir = path.resolve(argv.dir as string);
      await ensureSnapshotsDir(snapshotsDir);
      const report = await findDuplicateSnapshots(snapshotsDir);

      if (argv.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(formatDuplicatesReport(report));
      }

      if (report.totalDuplicates > 0) {
        process.exitCode = 1;
      }
    }
  );
}
