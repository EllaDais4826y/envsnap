import { Argv } from 'yargs';
import * as path from 'path';
import { importSnapshot } from '../import';
import { ensureSnapshotsDir } from '../snapshot';

export function registerImportCommand(yargs: Argv, snapshotsDir: string): Argv {
  return yargs.command(
    'import <file> <name>',
    'Import environment variables from a .env or .json file as a snapshot',
    (y) =>
      y
        .positional('file', {
          describe: 'Path to the .env or .json file to import',
          type: 'string',
          demandOption: true,
        })
        .positional('name', {
          describe: 'Name for the new snapshot',
          type: 'string',
          demandOption: true,
        }),
    async (argv) => {
      const filePath = path.resolve(argv.file as string);
      const name = argv.name as string;
      try {
        await ensureSnapshotsDir(snapshotsDir);
        const result = await importSnapshot(filePath, name, snapshotsDir);
        console.log(
          `Imported ${result.count} variable(s) from "${filePath}" as snapshot "${result.name}".`
        );
      } catch (err: any) {
        console.error(`Error importing snapshot: ${err.message}`);
        process.exit(1);
      }
    }
  );
}
