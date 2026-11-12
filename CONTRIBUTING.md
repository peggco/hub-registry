# Contributing

Thanks for adding to the Pegg Hub catalog.

## Rules

- One entry per JSON file, in the folder for its kind.
- `schemaVersion` is `1`; `kind` is `mcp`, `plugin` or `skill`.
- Descriptions are 20–280 characters, factual and vendor-neutral.
- Tags are lowercase kebab-case, at most 8.
- MCP entries must declare every `${PLACEHOLDER}` in `requiredEnv`.
- Plugins are metadata only. Do not upload binaries; link a GitHub Release.
- Do not add Windows platforms until the Pegg plugin installer supports it.
- Community entries keep `isOfficial` absent or `false`. Only project
  maintainers mark an entry official.

## Local checks

```bash
pnpm install
pnpm validate
pnpm test
pnpm check
```

## Review

A maintainer checks:

1. the upstream project exists and is maintained;
2. the transport/command is the documented one;
3. secrets are placeholders, never values;
4. no duplicate ids or conflicting sources;
5. the entry does not point at a fork when an official repo exists.

By submitting a PR you confirm you have the right to publish the metadata and
that it contains no secrets.
