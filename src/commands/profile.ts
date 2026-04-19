import { Argv } from 'yargs';
import * as path from 'path';
import { setProfile, removeProfile, getProfile, listProfiles, formatProfileOutput } from '../profile';

const SNAPSHOTS_DIR = path.join(process.cwd(), '.envsnap');

export function registerProfileCommand(yargs: Argv): Argv {
  return yargs.command(
    'profile <action>',
    'Manage snapshot profiles',
    (y) =>
      y
        .positional('action', { choices: ['set', 'get', 'remove', 'list'] as const, demandOption: true })
        .option('name', { type: 'string', description: 'Profile name' })
        .option('snapshots', { type: 'array', string: true, description: 'Snapshot names' })
        .option('description', { type: 'string', description: 'Profile description' }),
    (argv) => {
      const dir = SNAPSHOTS_DIR;
      const { action, name, snapshots, description } = argv as any;

      if (action === 'list') {
        console.log(formatProfileOutput(listProfiles(dir)));
        return;
      }

      if (!name) {
        console.error('--name is required');
        process.exit(1);
      }

      if (action === 'set') {
        if (!snapshots || snapshots.length === 0) {
          console.error('--snapshots is required for set');
          process.exit(1);
        }
        const p = setProfile(dir, name, snapshots, description);
        console.log(`Profile "${p.name}" saved with ${p.snapshots.length} snapshot(s).`);
      } else if (action === 'get') {
        const p = getProfile(dir, name);
        if (!p) { console.error(`Profile "${name}" not found.`); process.exit(1); }
        console.log(formatProfileOutput([p]));
      } else if (action === 'remove') {
        const ok = removeProfile(dir, name);
        if (!ok) { console.error(`Profile "${name}" not found.`); process.exit(1); }
        console.log(`Profile "${name}" removed.`);
      }
    }
  );
}
