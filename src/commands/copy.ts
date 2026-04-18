import { Argv } from 'yargs';
import { copySnapshot } from '../copy';

export function registerCopyCommand(yargs: Argv): Argv {
  return yargs.command(
    'copy <source> <destination>',
    'Copy a snapshot to a new name',
    (y) =>
      y
        .positional('source', {
          describe: 'Name of the snapshot to copy',
          type: 'string',
          demandOption: true,
        })
        .positional('destination', {
          describe: 'Name for the copied snapshot',
          type: 'string',
          demandOption: true,
        })
        .option('overwrite', {
          alias: 'f',
          type: 'boolean',
          default: false,
          describe: 'Overwrite destination if it already exists',
        }),
    (argv) => {
      const { source, destination, overwrite } = argv as {
        source: string;
        destination: string;
        overwrite: boolean;
      };
      try {
        copySnapshot(source, destination, overwrite);
        console.log(`Snapshot "${source}" copied to "${destination}".`);
      } catch (err: unknown) {
        console.error((err as Error).message);
        process.exit(1);
      }
    }
  );
}
