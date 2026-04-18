import { Argv } from 'yargs';
import path from 'path';
import { getSnapshotHistory } from '../history';

export function registerHistoryCommand(yargs: Argv): void {
  yargs.command(
    'history <key>',
    'Show the value history of an environment variable key across snapshots',
    (y) =>
      y
        .positional('key', {
          type: 'string',
          description: 'The environment variable key to look up',
          demandOption: true,
        })
        .option('dir', {
          type: 'string',
          description: 'Directory where snapshots are stored',
          default: path.join(process.cwd(), '.envsnap'),
        })
        .option('limit', {
          type: 'number',
          description: 'Maximum number of history entries to show',
        }),
    async (argv) => {
      try {
        const result = await getSnapshotHistory(
          argv.key as string,
          argv.dir as string,
          argv.limit as number | undefined
        );
        console.log(result.formatted);
      } catch (err: any) {
        console.error(`Error retrieving history: ${err.message}`);
        process.exit(1);
      }
    }
  );
}
