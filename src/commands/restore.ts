import { Command } from 'commander';
import { restoreSnapshot } from '../restore';
import { listSnapshots } from '../snapshot';

export function registerRestoreCommand(program: Command): void {
  program
    .command('restore <snapshot-name>')
    .description('Restore environment variables from a saved snapshot')
    .option('-t, --target <file>', 'Target .env file to write to', '.env')
    .option('-o, --overwrite', 'Overwrite existing variables in target file', false)
    .option('-m, --merge', 'Merge snapshot vars into existing file', false)
    .option('-l, --list', 'List available snapshots', false)
    .action((snapshotName: string, options) => {
      if (options.list) {
        const snapshots = listSnapshots();
        if (snapshots.length === 0) {
          console.log('No snapshots found.');
        } else {
          console.log('Available snapshots:');
          snapshots.forEach((s) => console.log(`  - ${s}`));
        }
        return;
      }

      try {
        const result = restoreSnapshot(snapshotName, options.target, {
          overwrite: options.overwrite,
          merge: options.merge,
        });

        console.log(`\nRestored snapshot "${snapshotName}" to ${result.targetFile}`);

        if (result.written.length > 0) {
          console.log(`  Written (${result.written.length}): ${result.written.join(', ')}`);
        }
        if (result.skipped.length > 0) {
          console.log(`  Skipped (${result.skipped.length}): ${result.skipped.join(', ')}`);
        }
      } catch (err: any) {
        console.error(`Error restoring snapshot: ${err.message}`);
        process.exit(1);
      }
    });
}
