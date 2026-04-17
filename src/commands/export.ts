import { Command } from 'commander';
import { exportSnapshot, ExportFormat } from '../export';

export function registerExportCommand(program: Command): void {
  program
    .command('export <snapshot>')
    .description('Export a snapshot to a file or stdout in various formats')
    .option('-f, --format <format>', 'Output format: dotenv, json, shell', 'dotenv')
    .option('-o, --output <path>', 'Write output to file instead of stdout')
    .action((snapshotName: string, options: { format: string; output?: string }) => {
      const format = options.format as ExportFormat;
      const validFormats: ExportFormat[] = ['dotenv', 'json', 'shell'];

      if (!validFormats.includes(format)) {
        console.error(`Invalid format "${format}". Choose from: ${validFormats.join(', ')}`);
        process.exit(1);
      }

      try {
        const content = exportSnapshot(snapshotName, format, options.output);

        if (options.output) {
          console.log(`Exported snapshot "${snapshotName}" to ${options.output}`);
        } else {
          process.stdout.write(content);
        }
      } catch (err: any) {
        console.error(`Error exporting snapshot: ${err.message}`);
        process.exit(1);
      }
    });
}
