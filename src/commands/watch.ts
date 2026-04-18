import { Argv } from 'yargs';
import chalk from 'chalk';
import { startWatch } from '../watch';

export function registerWatchCommand(yargs: Argv): Argv {
  return yargs.command(
    'watch <envFile>',
    'Watch an env file and auto-snapshot on changes',
    (y) =>
      y
        .positional('envFile', {
          type: 'string',
          describe: 'Path to the .env file to watch',
          demandOption: true,
        })
        .option('label', {
          type: 'string',
          alias: 'l',
          describe: 'Label prefix for auto-generated snapshots',
        })
        .option('debounce', {
          type: 'number',
          default: 300,
          describe: 'Debounce delay in milliseconds',
        }),
    (argv) => {
      const envFile = argv.envFile as string;
      const label = argv.label as string | undefined;
      const debounceMs = argv.debounce as number;

      console.log(chalk.cyan(`Watching ${envFile} for changes...`));
      console.log(chalk.gray('Press Ctrl+C to stop.\n'));

      const stop = startWatch({ envFile, label, debounceMs }, (event) => {
        const time = event.timestamp.toLocaleTimeString();
        console.log(
          chalk.green(`[${time}] Snapshot saved: `) + chalk.bold(event.snapshotId)
        );
      });

      process.on('SIGINT', () => {
        stop();
        console.log(chalk.yellow('\nWatch stopped.'));
        process.exit(0);
      });
    }
  );
}
