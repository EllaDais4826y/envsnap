import { Command } from 'commander';
import { loadSnapshot } from '../snapshot';
import { lintSnapshot, formatLintOutput } from '../lint';

export function registerLintCommand(program: Command): void {
  program
    .command('lint <snapshot>')
    .description('Lint a snapshot for common env var issues')
    .option('--no-color', 'Disable colored output')
    .option('--strict', 'Treat warnings as errors')
    .action(async (snapshotName: string, options: { color: boolean; strict: boolean }) => {
      try {
        const snapshot = await loadSnapshot(snapshotName);
        if (!snapshot) {
          console.error(`Snapshot "${snapshotName}" not found.`);
          process.exit(1);
        }

        const results = lintSnapshot(snapshot);
        const output = formatLintOutput(results, { color: options.color });

        if (output) {
          console.log(output);
        }

        const hasErrors = results.some((r) => r.severity === 'error');
        const hasWarnings = results.some((r) => r.severity === 'warning');

        if (hasErrors) {
          process.exit(1);
        }

        if (options.strict && hasWarnings) {
          process.exit(1);
        }

        if (!hasErrors && !hasWarnings) {
          console.log(`✓ Snapshot "${snapshotName}" passed all lint checks.`);
        }
      } catch (err) {
        console.error('Lint failed:', (err as Error).message);
        process.exit(1);
      }
    });
}
