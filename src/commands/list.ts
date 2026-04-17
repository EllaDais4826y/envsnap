import { Command } from 'commander';
import { getSnapshotSummaries, formatSnapshotList } from '../list';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List all saved environment snapshots')
    .option('-d, --dir <dir>', 'snapshots directory', '.envsnap')
    .option('--json', 'output as JSON')
    .action(async (options) => {
      try {
        const summaries = await getSnapshotSummaries(options.dir);

        if (options.json) {
          console.log(JSON.stringify(summaries, null, 2));
        } else {
          console.log(formatSnapshotList(summaries));
        }
      } catch (err) {
        console.error('Error listing snapshots:', (err as Error).message);
        process.exit(1);
      }
    });
}
