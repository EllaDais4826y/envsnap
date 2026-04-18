import { Argv } from 'yargs';
import { renameSnapshot } from '../rename';

export function registerRenameCommand(yargs: Argv): Argv {
  return yargs.command(
    'rename <old> <new>',
    'Rename an existing snapshot',
    (y) =>
      y
        .positional('old', {
          describe: 'Current snapshot name',
          type: 'string',
          demandOption: true,
        })
        .positional('new', {
          describe: 'New snapshot name',
          type: 'string',
          demandOption: true,
        }),
    (argv) => {
      const oldName = argv['old'] as string;
      const newName = argv['new'] as string;
      const result = renameSnapshot(oldName, newName);
      if (result.success) {
        console.log(result.message);
      } else {
        console.error(`Error: ${result.message}`);
        process.exit(1);
      }
    }
  );
}
