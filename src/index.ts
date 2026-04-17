#!/usr/bin/env node
import { Command } from 'commander';
import { snapshotCommand } from './commands/snapshot';
import { diffCommand } from './commands/diff';

const program = new Command();

program
  .name('envsnap')
  .description('Snapshot, diff, and restore environment variable configurations')
  .version('0.1.0');

program.addCommand(snapshotCommand);
program.addCommand(diffCommand);

program.parse(process.argv);
