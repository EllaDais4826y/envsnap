import { Argv } from 'yargs';
import {
  setTemplate,
  removeTemplate,
  listTemplates,
  loadTemplates,
  applyTemplate,
} from '../template';
import { saveSnapshot, captureSnapshot } from '../snapshot';

export function registerTemplateCommand(yargs: Argv, snapshotsDir: string) {
  yargs.command(
    'template <action>',
    'Manage snapshot templates',
    (y) =>
      y
        .positional('action', {
          choices: ['set', 'remove', 'list', 'apply'] as const,
          describe: 'Action to perform',
        })
        .option('name', { type: 'string', describe: 'Template name' })
        .option('vars', { type: 'string', describe: 'JSON vars for set action' })
        .option('snapshot', { type: 'string', describe: 'Snapshot name for apply action' })
        .option('overrides', { type: 'string', describe: 'JSON overrides for apply action' }),
    (argv) => {
      const { action, name } = argv as { action: string; name?: string };

      if (action === 'list') {
        const names = listTemplates(snapshotsDir);
        if (names.length === 0) {
          console.log('No templates found.');
        } else {
          names.forEach((n) => console.log(n));
        }
        return;
      }

      if (!name) {
        console.error('--name is required for this action');
        process.exit(1);
      }

      if (action === 'set') {
        const vars = JSON.parse((argv.vars as string) || '{}');
        setTemplate(snapshotsDir, name, vars);
        console.log(`Template '${name}' saved.`);
      } else if (action === 'remove') {
        removeTemplate(snapshotsDir, name);
        console.log(`Template '${name}' removed.`);
      } else if (action === 'apply') {
        const snapshotName = argv.snapshot as string | undefined;
        const overrides = JSON.parse((argv.overrides as string) || '{}');
        const vars = applyTemplate(snapshotsDir, name, overrides);
        const label = snapshotName || `template-${name}-${Date.now()}`;
        saveSnapshot(snapshotsDir, label, { label, timestamp: new Date().toISOString(), variables: vars });
        console.log(`Snapshot '${label}' created from template '${name}'.`);
      }
    }
  );
}
