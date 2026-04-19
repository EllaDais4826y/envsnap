import { Argv } from 'yargs';
import { loadAudit, formatAuditOutput } from '../audit';
import * as path from 'path';

export function registerAuditCommand(yargs: Argv): Argv {
  return yargs.command(
    'audit',
    'Show audit log of snapshot actions',
    (y) =>
      y
        .option('dir', {
          type: 'string',
          default: process.cwd(),
          description: 'Base directory for envsnap data'
        })
        .option('limit', {
          type: 'number',
          default: 50,
          description: 'Maximum number of entries to show'
        })
        .option('action', {
          type: 'string',
          description: 'Filter by action type (e.g. snapshot, restore)'
        }),
    (argv) => {
      const baseDir = path.resolve(argv.dir as string);
      let entries = loadAudit(baseDir);

      if (argv.action) {
        entries = entries.filter(e => e.action === argv.action);
      }

      if (argv.limit) {
        entries = entries.slice(-argv.limit);
      }

      console.log(formatAuditOutput(entries));
    }
  );
}
