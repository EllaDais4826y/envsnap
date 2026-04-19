import { Command } from 'commander';
import { loadSnapshot, listSnapshots } from '../snapshot';
import { formatSummaryOutput } from '../summary';

export function registerSummaryCommand(program: Command): void {
  program
    .command('summary [name]')
    .description('Show a summary of a snapshot or all snapshots')
    .option('-d, --dir <dir>', 'Snapshots directory', '.envsnap')
    .action(async (name: string | undefined, opts: { dir: string }) => {
      try {
        if (name) {
          const snapshot = await loadSnapshot(name, opts.dir);
          if (!snapshot) {
            console.error(`Snapshot "${name}" not found.`);
            process.exit(1);
          }
          console.log(formatSummaryOutput([snapshot]));
        } else {
          const names = await listSnapshots(opts.dir);
          if (names.length === 0) {
            console.log('No snapshots found.');
            return;
          }
          const snapshots = await Promise.all(
            names.map((n) => loadSnapshot(n, opts.dir))
          );
          const valid = snapshots.filter(Boolean) as Awaited<ReturnType<typeof loadSnapshot>>[];
          console.log(formatSummaryOutput(valid as any));
        }
      } catch (err: any) {
        console.error('Error:', err.message);
        process.exit(1);
      }
    });
}
