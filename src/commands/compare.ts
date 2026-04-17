import { Argv } from 'yargs';
import { compareSnapshots, formatCompareOutput } from '../compare';

export function registerCompareCommand(yargs: Argv): Argv {
  return yargs.command(
    'compare <snapshotA> <snapshotB>',
    'Compare two snapshots and show differences',
    (y) =>
      y
        .positional('snapshotA', {
          describe: 'First snapshot name',
          type: 'string',
          demandOption: true,
        })
        .positional('snapshotB', {
          describe: 'Second snapshot name',
          type: 'string',
          demandOption: true,
        })
        .option('verbose', {
          alias: 'v',
          type: 'boolean',
          default: false,
          describe: 'Show full variable diff',
        })
        .option('dir', {
          type: 'string',
          describe: 'Snapshots directory',
        }),
    async (argv) => {
      try {
        const result = await compareSnapshots(
          argv.snapshotA as string,
          argv.snapshotB as string,
          argv.dir as string | undefined
        );
        console.log(formatCompareOutput(result, argv.verbose as boolean));
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    }
  );
}
