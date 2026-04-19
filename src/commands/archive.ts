import { Argv } from 'yargs';
import path from 'path';
import { archiveSnapshot, unarchiveSnapshot, listArchive } from '../archive';

const SNAPSHOTS_DIR = path.join(process.cwd(), '.envsnap');

export function registerArchiveCommand(yargs: Argv): void {
  yargs.command(
    'archive <action> [name]',
    'Archive, unarchive, or list archived snapshots',
    (y) =>
      y
        .positional('action', {
          describe: 'Action to perform: add | restore | list',
          type: 'string',
          choices: ['add', 'restore', 'list'],
        })
        .positional('name', {
          describe: 'Snapshot name',
          type: 'string',
        }),
    (argv) => {
      const action = argv.action as string;
      const name = argv.name as string | undefined;

      try {
        if (action === 'add') {
          if (!name) throw new Error('Snapshot name is required for archive add.');
          const entry = archiveSnapshot(SNAPSHOTS_DIR, name);
          console.log(`Archived snapshot "${entry.name}" at ${entry.archivedAt}.`);
        } else if (action === 'restore') {
          if (!name) throw new Error('Snapshot name is required for archive restore.');
          const entry = unarchiveSnapshot(SNAPSHOTS_DIR, name);
          console.log(`Unarchived snapshot "${entry.name}" successfully.`);
        } else if (action === 'list') {
          const entries = listArchive(SNAPSHOTS_DIR);
          if (entries.length === 0) {
            console.log('No archived snapshots.');
          } else {
            console.log(`Found ${entries.length} archived snapshot(s):`);
            entries.forEach(e => console.log(`  - ${e.name}  (archived: ${e.archivedAt})`));
          }
        }
      } catch (err: any) {
        // Distinguish between user errors and unexpected failures
        if (err.code === 'ENOENT') {
          console.error(`Error: Snapshot not found - ${err.message}`);
        } else {
          console.error(`Error: ${err.message}`);
        }
        process.exit(1);
      }
    }
  );
}
