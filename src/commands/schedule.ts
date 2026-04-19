import { Argv } from 'yargs';
import { addSchedule, removeSchedule, listSchedules, formatScheduleList } from '../schedule';

export function registerScheduleCommand(yargs: Argv): Argv {
  return yargs.command(
    'schedule <action>',
    'Manage auto-snapshot schedules',
    (y) =>
      y
        .positional('action', {
          choices: ['add', 'remove', 'list'] as const,
          describe: 'Action to perform',
        })
        .option('name', { type: 'string', describe: 'Snapshot name' })
        .option('cron', { type: 'string', describe: 'Cron expression' })
        .option('disabled', { type: 'boolean', default: false }),
    (argv) => {
      const baseDir = process.cwd();
      const action = argv.action as string;

      if (action === 'list') {
        const entries = listSchedules(baseDir);
        console.log(formatScheduleList(entries));
        return;
      }

      if (!argv.name) {
        console.error('--name is required');
        process.exit(1);
      }

      if (action === 'add') {
        if (!argv.cron) {
          console.error('--cron is required for add');
          process.exit(1);
        }
        addSchedule(baseDir, {
          snapshotName: argv.name as string,
          cron: argv.cron as string,
          enabled: !argv.disabled,
        });
        console.log(`Schedule added for "${argv.name}".`);
      } else if (action === 'remove') {
        const removed = removeSchedule(baseDir, argv.name as string);
        if (removed) console.log(`Schedule removed for "${argv.name}".`);
        else console.error(`No schedule found for "${argv.name}".`);
      }
    }
  );
}
