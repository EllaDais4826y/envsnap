import type { Argv } from 'yargs';
import { buildCompareReport, formatCompareReport } from '../snapshot-compare-report';
import { ensureSnapshotsDir } from '../snapshot';

export function registerSnapshotCompareReportCommand(yargs: Argv): Argv {
  return yargs.command(
    'compare-report <snapshots..>',
    'Generate a comparison report across a sequence of snapshots',
    (y) =>
      y.positional('snapshots', {
        describe: 'Ordered list of snapshot names to compare (min 2)',
        type: 'string',
        array: true,
      }).option('dir', {
        describe: 'Snapshots directory',
        type: 'string',
        default: '.envsnap',
      }),
    (argv) => {
      const names = argv.snapshots as string[];
      if (names.length < 2) {
        console.error('Error: At least 2 snapshot names are required.');
        process.exit(1);
      }

      const snapshotsDir = ensureSnapshotsDir(argv.dir as string);

      try {
        const report = buildCompareReport(names, snapshotsDir);
        console.log(formatCompareReport(report));
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    }
  );
}
