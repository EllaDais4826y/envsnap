# envsnap

> A CLI tool to snapshot, diff, and restore environment variable configurations across projects.

## Installation

```bash
npm install -g envsnap
```

## Usage

```bash
# Take a snapshot of your current environment
envsnap save my-snapshot

# List all saved snapshots
envsnap list

# Diff two snapshots
envsnap diff my-snapshot another-snapshot

# Restore a snapshot
envsnap restore my-snapshot
```

### Example

```bash
$ envsnap save pre-deploy
✔ Snapshot "pre-deploy" saved (42 variables)

$ envsnap diff pre-deploy post-deploy
+ NEW_FEATURE_FLAG=true
- OLD_API_URL=https://old.api.example.com
~ DATABASE_URL changed
```

## Configuration

Snapshots are stored in `~/.envsnap/` by default. You can override this by setting the `ENVSNAP_DIR` environment variable.

```bash
export ENVSNAP_DIR=/path/to/custom/dir
```

## Requirements

- Node.js >= 16
- npm or yarn

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)