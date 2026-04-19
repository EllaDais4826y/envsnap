import { Command } from 'commander';
import { loadSnapshot } from '../snapshot';
import { filterSnapshotVars, formatFilterOutput } from '../filter';

/**
 * Registers the `filter` command with the CLI.
 * Allows filtering snapshot variables by key pattern or value pattern.
 */
export function registerFilterCommand(program: Command): void {
  program
    .command('filter <snapshot>')
    .description('Filter variables from a snapshot by key or value pattern')
    .option('-k, --key <pattern>', 'Filter by key pattern (glob or substring)')
    .option('-v, --value <pattern>', 'Filter by value pattern (glob or substring)')
    .option('--json', 'Output as JSON')
    .action(async (snapshotName: string, options: { key?: string; value?: string; json?: boolean }) => {
      try {
        const snapshot = await loadSnapshot(snapshotName);

        if (!snapshot) {
          console.error(`Snapshot "${snapshotName}" not found.`);
          process.exit(1);
        }

        if (!options.key && !options.value) {
          console.error('Please provide at least one filter: --key or --value');
          process.exit(1);
        }

        const filtered = filterSnapshotVars(snapshot, {
          keyPattern: options.key,
          valuePattern: options.value,
        });

        if (options.json) {
          console.log(JSON.stringify(filtered, null, 2));
        } else {
          console.log(formatFilterOutput(snapshotName, filtered));
        }
      } catch (err) {
        console.error('Error filtering snapshot:', (err as Error).message);
        process.exit(1);
      }
    });
}
