import { loadSnapshot } from '../snapshot';
import { diffSnapshots, formatDiff } from '../diff';

export interface DiffCommandOptions {
  json?: boolean;
}

export async function diffCommand(
  fromName: string,
  toName: string,
  options: DiffCommandOptions = {}
): Promise<void> {
  let fromSnapshot;
  let toSnapshot;

  try {
    fromSnapshot = await loadSnapshot(fromName);
  } catch {
    console.error(`Error: snapshot "${fromName}" not found.`);
    process.exit(1);
  }

  try {
    toSnapshot = await loadSnapshot(toName);
  } catch {
    console.error(`Error: snapshot "${toName}" not found.`);
    process.exit(1);
  }

  const diff = diffSnapshots(fromSnapshot, toSnapshot);

  if (options.json) {
    console.log(JSON.stringify(diff, null, 2));
  } else {
    console.log(formatDiff(diff));
  }
}
