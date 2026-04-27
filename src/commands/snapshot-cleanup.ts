import type { Argv } from 'yargs';
import * as path from 'path';
import { cleanupSnapshots, formatCleanupOutput } from '../snapshot-cleanup';
import { ensureSnapshotsDir } from '../snapshot';

export function registerSnapshotCleanupCommand(yargs: Argv): Argv {
  return yargs.command(
    'cleanup',
    'Remove old or excess snapshots based on age or count',
    (y) =>
      y
        .option('older-than', {
          alias: 'o',
          type: 'number',
          description: 'Remove snapshots older than N days',
        })
        .option('keep-latest', {
          alias: 'k',
          type: 'number',
          description: 'Keep only the N most recent snapshots',
        })
        .option('dry-run', {
          alias: 'd',
          type: 'boolean',
          default: false,
          description: 'Preview what would be removed without deleting',
        })
        .option('dir', {
          type: 'string',
          description: 'Snapshots directory',
          default: '.envsnap',
        })
        .check((argv) => {
          if (argv['older-than'] === undefined && argv['keep-latest'] === undefined) {
            throw new Error('Provide at least one of --older-than or --keep-latest');
          }
          return true;
        }),
    (argv) => {
      const snapshotsDir = ensureSnapshotsDir(path.resolve(argv.dir as string));
      const result = cleanupSnapshots(snapshotsDir, {
        olderThanDays: argv['older-than'] as number | undefined,
        keepLatest: argv['keep-latest'] as number | undefined,
        dryRun: argv['dry-run'] as boolean,
      });
      console.log(formatCleanupOutput(result));
    }
  );
}
