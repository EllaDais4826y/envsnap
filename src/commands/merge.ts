import { Command } from 'commander';
import { mergeAndSave, MergeStrategy } from '../merge';

export function registerMergeCommand(program: Command): void {
  program
    .command('merge <base> <other> <target>')
    .description('Merge two snapshots into a new snapshot')
    .option(
      '-s, --strategy <strategy>',
      'Merge strategy: ours | theirs | union',
      'union'
    )
    .action(async (base: string, other: string, target: string, opts) => {
      const strategy = opts.strategy as MergeStrategy;
      const validStrategies: MergeStrategy[] = ['ours', 'theirs', 'union'];
      if (!validStrategies.includes(strategy)) {
        console.error(`Invalid strategy: ${strategy}. Use ours, theirs, or union.`);
        process.exit(1);
      }
      try {
        const result = await mergeAndSave(base, other, target, strategy);
        if (result.conflicts.length > 0) {
          console.warn(`Conflicts resolved (${strategy}): ${result.conflicts.join(', ')}`);
        }
        console.log(`Merged snapshot saved as "${target}" with ${Object.keys(result.merged).length} variables.`);
      } catch (err: any) {
        console.error(`Error merging snapshots: ${err.message}`);
        process.exit(1);
      }
    });
}
