import { Argv } from 'yargs';
import { addTag, removeTag, listTags } from '../tag';

export function registerTagCommand(yargs: Argv): Argv {
  return yargs.command(
    'tag <subcommand>',
    'Manage snapshot tags',
    (y) =>
      y
        .command(
          'add <tag> <snapshot>',
          'Assign a tag to a snapshot',
          (y2) =>
            y2
              .positional('tag', { type: 'string', demandOption: true })
              .positional('snapshot', { type: 'string', demandOption: true }),
          (argv) => {
            addTag(argv.tag as string, argv.snapshot as string);
            console.log(`Tag "${argv.tag}" -> "${argv.snapshot}" saved.`);
          }
        )
        .command(
          'remove <tag>',
          'Remove a tag',
          (y2) => y2.positional('tag', { type: 'string', demandOption: true }),
          (argv) => {
            const removed = removeTag(argv.tag as string);
            if (removed) {
              console.log(`Tag "${argv.tag}" removed.`);
            } else {
              console.error(`Tag "${argv.tag}" not found.`);
              process.exit(1);
            }
          }
        )
        .command(
          'list',
          'List all tags',
          () => {},
          () => {
            const tags = listTags();
            if (tags.length === 0) {
              console.log('No tags defined.');
              return;
            }
            tags.forEach(({ tag, snapshot }) =>
              console.log(`  ${tag.padEnd(20)} -> ${snapshot}`)
            );
          }
        )
        .demandCommand(1, 'Specify a subcommand: add, remove, list'),
    () => {}
  );
}
