#!/usr/bin/env node
import { Command } from 'commander';
import { registerSnapshotCommand } from './commands/snapshot';
import { registerDiffCommand } from './commands/diff';
import { registerRestoreCommand } from './commands/restore';
import { registerListCommand } from './commands/list';

const program = new Command();

program
  .name('envsnap')
  .description('Snapshot, diff, and restore environment variable configurations')
  .version('1.0.0');

registerSnapshotCommand(program);
registerDiffCommand(program);
registerRestoreCommand(program);
registerListCommand(program);

program.parse(process.argv);
