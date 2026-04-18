import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { encryptSnapshot, decryptSnapshot } from '../encrypt';
import { loadSnapshot, saveSnapshot, ensureSnapshotsDir } from '../snapshot';

function promptPassword(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export function registerEncryptCommand(program: Command): void {
  const cmd = program.command('encrypt').description('Encrypt or decrypt a snapshot');

  cmd
    .command('lock <name>')
    .description('Encrypt a snapshot with a password')
    .action(async (name: string) => {
      try {
        const snapshot = await loadSnapshot(name);
        const password = await promptPassword('Enter password: ');
        const encrypted = encryptSnapshot(snapshot.variables, password);
        const encPath = path.join(ensureSnapshotsDir(), `${name}.enc`);
        fs.writeFileSync(encPath, JSON.stringify(encrypted, null, 2));
        console.log(`Snapshot "${name}" encrypted to ${encPath}`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  cmd
    .command('unlock <name>')
    .description('Decrypt a snapshot and restore it')
    .option('-o, --output <name>', 'Save decrypted snapshot under a new name')
    .action(async (name: string, opts: { output?: string }) => {
      try {
        const encPath = path.join(ensureSnapshotsDir(), `${name}.enc`);
        if (!fs.existsSync(encPath)) throw new Error(`Encrypted snapshot "${name}" not found`);
        const encrypted = JSON.parse(fs.readFileSync(encPath, 'utf-8'));
        const password = await promptPassword('Enter password: ');
        const variables = decryptSnapshot(encrypted, password);
        const outName = opts.output || `${name}-decrypted`;
        await saveSnapshot(outName, variables);
        console.log(`Snapshot decrypted and saved as "${outName}"`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
