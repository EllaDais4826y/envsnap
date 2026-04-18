import { Command } from 'commander';
import { pinSnapshot, unpinSnapshot, resolvePin, listPins } from '../pin';

export function registerPinCommand(program: Command): void {
  const pin = program.command('pin').description('Pin a snapshot to a named alias');

  pin
    .command('set <alias> <snapshotId>')
    .description('Pin a snapshot ID to an alias')
    .action((alias: string, snapshotId: string) => {
      pinSnapshot(alias, snapshotId);
      console.log(`Pinned "${alias}" -> ${snapshotId}`);
    });

  pin
    .command('remove <alias>')
    .description('Remove a pinned alias')
    .action((alias: string) => {
      const removed = unpinSnapshot(alias);
      if (removed) {
        console.log(`Unpinned "${alias}"`);
      } else {
        console.error(`No pin found for alias "${alias}"`);
        process.exit(1);
      }
    });

  pin
    .command('resolve <alias>')
    .description('Resolve an alias to its snapshot ID')
    .action((alias: string) => {
      const id = resolvePin(alias);
      if (id) {
        console.log(id);
      } else {
        console.error(`No pin found for alias "${alias}"`);
        process.exit(1);
      }
    });

  pin
    .command('list')
    .description('List all pinned aliases')
    .action(() => {
      const pins = listPins();
      if (pins.length === 0) {
        console.log('No pins defined.');
        return;
      }
      pins.forEach(({ alias, snapshotId }) => {
        console.log(`${alias.padEnd(20)} ${snapshotId}`);
      });
    });
}
