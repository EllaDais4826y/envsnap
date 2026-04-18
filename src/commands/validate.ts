import { Command } from 'commander';
import { loadSnapshot } from '../snapshot';
import { validateSnapshot, formatValidationOutput } from '../validate';

export function registerValidateCommand(program: Command): void {
  program
    .command('validate <name>')
    .description('Validate a snapshot against required or forbidden keys')
    .option('-r, --require <keys>', 'comma-separated list of required keys')
    .option('-f, --forbid <keys>', 'comma-separated list of forbidden keys')
    .option('--no-empty', 'fail if any value is empty')
    .action(async (name: string, options) => {
      try {
        const snapshot = await loadSnapshot(name);
        if (!snapshot) {
          console.error(`Snapshot "${name}" not found.`);
          process.exit(1);
        }

        const requiredKeys = options.require
          ? options.require.split(',').map((k: string) => k.trim())
          : [];

        const forbiddenKeys = options.forbid
          ? options.forbid.split(',').map((k: string) => k.trim())
          : [];

        const allowEmpty = options.empty !== false;

        const result = validateSnapshot(snapshot, {
          requiredKeys,
          forbiddenKeys,
          allowEmpty,
        });

        console.log(formatValidationOutput(result));

        if (!result.valid) {
          process.exit(1);
        }
      } catch (err) {
        console.error('Error validating snapshot:', (err as Error).message);
        process.exit(1);
      }
    });
}
