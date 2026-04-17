import { Command } from 'commander';
import { captureSnapshot, saveSnapshot, listSnapshots } from '../snapshot';

export const snapshotCommand = new Command('snapshot')
  .description('Manage environment variable snapshots')
  .addCommand(
    new Command('capture')
      .description('Capture current environment variables as a snapshot')
      .argument('<name>', 'Name for the snapshot')
      .option('-e, --env <vars...>', 'Specific env var keys to capture')
      .action(async (name: string, options: { env?: string[] }) => {
        try {
          const snapshot = captureSnapshot(name, options.env);
          await saveSnapshot(snapshot);
          console.log(`Snapshot '${name}' saved with ${Object.keys(snapshot.vars).length} variable(s).`);
        } catch (err) {
          console.error('Failed to capture snapshot:', (err as Error).message);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List all saved snapshots')
      .action(async () => {
        try {
          const snapshots = await listSnapshots();
          if (snapshots.length === 0) {
            console.log('No snapshots found.');
            return;
          }
          console.log('Saved snapshots:');
          snapshots.forEach((s) => {
            console.log(`  - ${s.name} (${new Date(s.timestamp).toLocaleString()})`);
          });
        } catch (err) {
          console.error('Failed to list snapshots:', (err as Error).message);
          process.exit(1);
        }
      })
  );
