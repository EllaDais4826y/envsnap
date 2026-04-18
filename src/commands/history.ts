import { Argv } from 'yargs';
import * as path from 'path';
import { getSnapshotHistory, formatHistoryOutput } from '../history';

export function registerHistoryCommand(yargs: Argv, snapshotsDir: string): Argv {
  return yargs.command(
    'history',
    'Show history of all snapshots',
    (y) =>
      y.option('json', {
        type: 'boolean',
        description: 'Output as JSON',
        default: false,
      }),
    (argv) => {
      const entries = getSnapshotHistory(snapshotsDir);

      if (argv.json) {
        console.log(JSON.stringify(entries, null, 2));
        return;
      }

      console.log(formatHistoryOutput(entries));
    }
  );
}
