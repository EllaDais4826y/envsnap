import { Argv } from 'yargs';
import {
  setEnvGroup,
  removeEnvGroup,
  listEnvGroups,
  getEnvGroup,
} from '../env-groups';

export function registerEnvGroupsCommand(yargs: Argv): Argv {
  return yargs.command(
    'group <action>',
    'Manage environment variable groups',
    (y) =>
      y
        .positional('action', {
          choices: ['set', 'remove', 'list', 'show'] as const,
          describe: 'Action to perform',
        })
        .option('name', { type: 'string', describe: 'Group name' })
        .option('keys', { type: 'array', string: true, describe: 'Env var keys' })
        .option('description', { type: 'string', describe: 'Group description' })
        .option('dir', { type: 'string', default: process.cwd(), describe: 'Working directory' }),
    (argv) => {
      const dir = argv.dir as string;
      const action = argv.action as string;

      if (action === 'list') {
        const groups = listEnvGroups(dir);
        if (groups.length === 0) {
          console.log('No groups defined.');
          return;
        }
        groups.forEach((g) => {
          const desc = g.description ? ` — ${g.description}` : '';
          console.log(`  ${g.name}${desc}: ${g.keys.join(', ')}`);
        });
        return;
      }

      const name = argv.name as string | undefined;
      if (!name) {
        console.error('Error: --name is required for this action.');
        process.exit(1);
      }

      if (action === 'set') {
        const keys = (argv.keys as string[]) ?? [];
        if (keys.length === 0) {
          console.error('Error: --keys must not be empty.');
          process.exit(1);
        }
        const group = setEnvGroup(dir, name, keys, argv.description as string | undefined);
        console.log(`Group "${group.name}" saved with keys: ${group.keys.join(', ')}`);
      } else if (action === 'remove') {
        const ok = removeEnvGroup(dir, name);
        console.log(ok ? `Group "${name}" removed.` : `Group "${name}" not found.`);
      } else if (action === 'show') {
        const group = getEnvGroup(dir, name);
        if (!group) {
          console.log(`Group "${name}" not found.`);
        } else {
          console.log(`Name: ${group.name}`);
          if (group.description) console.log(`Description: ${group.description}`);
          console.log(`Keys: ${group.keys.join(', ')}`);
          console.log(`Created: ${group.createdAt}`);
        }
      }
    }
  );
}
