import { Argv } from 'yargs';
import { getPreviousSnapshot, rollbackSnapshot } from '../rollback';
import { logAudit } from '../audit';

export function registerRollbackCommand(yargs: Argv): Argv {
  return yargs.command(
    'rollback [name]',
    'Rollback to the previous snapshot for a given name prefix',
    (y) =>
      y
        .positional('name', {
          type: 'string',
          describe: 'Snapshot name prefix or exact name to rollback from',
          demandOption: true,
        })
        .option('dir', {
          type: 'string',
          describe: 'Snapshots directory',
          default: '.envsnap',
        })
        .option('dry-run', {
          type: 'boolean',
          describe: 'Preview rollback without writing files',
          default: false,
        }),
    async (argv) => {
      const { name, dir, dryRun } = argv as { name: string; dir: string; dryRun: boolean };
      try {
        const previous = await getPreviousSnapshot(name, dir);
        if (!previous) {
          console.error(`No previous snapshot found for "${name}"`);
          process.exit(1);
        }
        if (dryRun) {
          console.log(`[dry-run] Would rollback to snapshot: ${previous.name}`);
          return;
        }
        await rollbackSnapshot(previous, dir);
        await logAudit(dir, { action: 'rollback', snapshot: previous.name, timestamp: new Date().toISOString() });
        console.log(`Rolled back to snapshot: ${previous.name}`);
      } catch (err: any) {
        console.error(`Rollback failed: ${err.message}`);
        process.exit(1);
      }
    }
  );
}
