import { Argv, ArgumentsCamelCase } from 'yargs';
import * as path from 'path';
import { checkSnapshotHealth, formatHealthReport } from '../snapshot-health';
import { listSnapshots } from '../snapshot';

interface HealthArgs {
  name?: string;
  all?: boolean;
  dir?: string;
}

export function registerSnapshotHealthCommand(yargs: Argv): Argv {
  return yargs.command(
    'health [name]',
    'Check the health of a snapshot or all snapshots',
    (y: Argv) =>
      y
        .positional('name', {
          type: 'string',
          description: 'Snapshot name to check',
        })
        .option('all', {
          type: 'boolean',
          alias: 'a',
          description: 'Check health of all snapshots',
          default: false,
        })
        .option('dir', {
          type: 'string',
          description: 'Snapshots directory',
          default: '.envsnap',
        }),
    (argv: ArgumentsCamelCase<HealthArgs>) => {
      const snapshotsDir = path.resolve(argv.dir ?? '.envsnap');

      if (argv.all) {
        const names = listSnapshots(snapshotsDir);
        if (names.length === 0) {
          console.log('No snapshots found.');
          return;
        }
        let anyUnhealthy = false;
        for (const name of names) {
          const report = checkSnapshotHealth(snapshotsDir, name);
          console.log(formatHealthReport(report));
          if (!report.healthy) anyUnhealthy = true;
        }
        if (anyUnhealthy) process.exitCode = 1;
        return;
      }

      if (!argv.name) {
        console.error('Error: provide a snapshot name or use --all');
        process.exitCode = 1;
        return;
      }

      const report = checkSnapshotHealth(snapshotsDir, argv.name);
      console.log(formatHealthReport(report));
      if (!report.healthy) process.exitCode = 1;
    }
  );
}
