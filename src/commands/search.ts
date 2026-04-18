import { Command } from 'commander';
import path from 'path';
import { searchSnapshots, formatSearchResults } from '../search';

export function registerSearchCommand(program: Command): void {
  program
    .command('search <query>')
    .description('Search for a key or value across all snapshots')
    .option('-d, --dir <dir>', 'Snapshots directory', '.envsnap')
    .option('--key-only', 'Search only in keys, not values', false)
    .action(async (query: string, options: { dir: string; keyOnly: boolean }) => {
      try {
        const dir = path.resolve(options.dir);
        const results = await searchSnapshots(dir, query, {
          keyOnly: options.keyOnly,
        });
        console.log(formatSearchResults(results));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Error: ${message}`);
        process.exit(1);
      }
    });
}
