import { CommandModule } from 'yargs';
import { getSnapshotStats, buildStatsReport } from '../snapshot-stats';
import { ensureSnapshotsDir } from '../snapshot';

export function registerSnapshotStatsCommand(snapshotsDirOverride?: string): CommandModule {
  return {
    command: 'stats',
    describe: 'Display statistics about stored snapshots',
    builder: {},
    async handler() {
      const dir = snapshotsDirOverride ?? (await ensureSnapshotsDir());
      const stats = await getSnapshotStats(dir);
      const report = buildStatsReport(stats);
      console.log(report);
    },
  };
}
