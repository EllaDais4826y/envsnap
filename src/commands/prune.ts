import { Argv } from 'yargs';
import * as path from 'path';
import { pruneSnapshots } from '../prune';

export function registerPruneCommand(yargs: Argv): Argv {
  return yargs.command(
    'prune',
    'Remove old snapshots, keeping the most recent N and all tagged snapshots',
    (y) =>
      y
        .option('keep', {
          alias: 'k',
          type: 'number',
          default: 5,
          description: 'Number of recent untagged snapshots to keep',
        })
        .option('dry-run', {
          type: 'boolean',
          default: false,
          description: 'Preview what would be removed without deleting',
        })
        .option('dir', {
          type: 'string',
          default: '.envsnap',
          description: 'Snapshots directory',
        }),
    async (argv) => {
      const snapshotsDir = path.resolve(argv.dir as string);
      const { removed, kept } = await pruneSnapshots(snapshotsDir, {
        keepLast: argv.keep as number,
        dryRun: argv['dry-run'] as boolean,
      });

      if (removed.length === 0) {
        console.log('Nothing to prune.');
        return;
      }

      const prefix = argv['dry-run'] ? '[dry-run] Would remove' : 'Removed';
      console.log(`${prefix} ${removed.length} snapshot(s):`);
      for (const id of removed) {
        console.log(`  - ${id}`);
      }
      console.log(`Kept ${kept.length} snapshot(s).`);
    }
  );
}
