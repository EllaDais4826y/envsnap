import { Argv } from 'yargs';
import { setAlias, removeAlias, listAliases } from '../alias';

export function registerAliasCommand(yargs: Argv): Argv {
  return yargs.command(
    'alias <subcommand>',
    'Manage snapshot aliases',
    (y) =>
      y
        .command(
          'set <alias> <snapshot>',
          'Set an alias for a snapshot',
          (y2) =>
            y2
              .positional('alias', { type: 'string', demandOption: true })
              .positional('snapshot', { type: 'string', demandOption: true }),
          (argv) => {
            setAlias(argv.alias as string, argv.snapshot as string);
            console.log(`Alias '${argv.alias}' -> '${argv.snapshot}' saved.`);
          }
        )
        .command(
          'remove <alias>',
          'Remove an alias',
          (y2) => y2.positional('alias', { type: 'string', demandOption: true }),
          (argv) => {
            try {
              removeAlias(argv.alias as string);
              console.log(`Alias '${argv.alias}' removed.`);
            } catch (e: any) {
              console.error(e.message);
              process.exit(1);
            }
          }
        )
        .command(
          'list',
          'List all aliases',
          () => {},
          () => {
            const aliases = listAliases();
            const entries = Object.entries(aliases);
            if (entries.length === 0) {
              console.log('No aliases defined.');
            } else {
              entries.forEach(([alias, snap]) => console.log(`${alias} -> ${snap}`));
            }
          }
        )
        .demandCommand(1, 'Specify a subcommand: set, remove, list'),
    () => {}
  );
}
