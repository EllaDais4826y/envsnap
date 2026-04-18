import { Argv } from 'yargs';
import * as path from 'path';
import { setNote, getNote, removeNote, formatNoteOutput } from '../notes';

const SNAPSHOTS_DIR = path.join(process.cwd(), '.envsnap');

export function registerNotesCommand(yargs: Argv): Argv {
  return yargs.command(
    'notes <action> <snapshot> [text]',
    'Manage notes attached to snapshots',
    (y) =>
      y
        .positional('action', {
          describe: 'Action: set | get | remove',
          type: 'string',
          choices: ['set', 'get', 'remove'],
        })
        .positional('snapshot', {
          describe: 'Snapshot ID',
          type: 'string',
        })
        .positional('text', {
          describe: 'Note text (required for set)',
          type: 'string',
        }),
    (argv) => {
      const action = argv.action as string;
      const snapshotId = argv.snapshot as string;
      const text = argv.text as string | undefined;

      if (action === 'set') {
        if (!text) {
          console.error('Error: note text is required for set action.');
          process.exit(1);
        }
        setNote(SNAPSHOTS_DIR, snapshotId, text);
        console.log(`Note set for "${snapshotId}".`);
      } else if (action === 'get') {
        const note = getNote(SNAPSHOTS_DIR, snapshotId);
        console.log(formatNoteOutput(snapshotId, note));
      } else if (action === 'remove') {
        const removed = removeNote(SNAPSHOTS_DIR, snapshotId);
        if (removed) {
          console.log(`Note removed for "${snapshotId}".`);
        } else {
          console.log(`No note found for "${snapshotId}".`);
        }
      }
    }
  );
}
