import { Command } from 'commander';
import * as path from 'path';
import { inspectSnapshot, formatInspectOutput } from '../inspect';

export function registerInspectCommand(program: Command): void {
  program
    .command('inspect <name>')
    .description('Show details of a snapshot including all captured keys')
    .option('--values', 'Show variable values alongside keys', false)
    .option(
      '--dir <dir>',
      'Snapshots directory',
      path.join(process.cwd(), '.envsnap')
    )
    .action((name: string, options: { values: boolean; dir: string }) => {
      try {
        const result = inspectSnapshot(name, options.dir);
        const output = formatInspectOutput(result, options.values);
        console.log(output);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
