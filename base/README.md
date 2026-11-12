# Skills base snapshot

`skills.json` is an imported snapshot of the catalog that predates this
registry. It keeps the legacy shape (no `kind`/`schemaVersion`) so
`/v1/skills` stays compatible.

| Field | Value |
|---|---|
| Source | `https://cdn.pegg.dev/skills.json` |
| Imported | 2026-11-12 |
| Entries | 7347 |
| SHA-256 | `1f927998d3f754332ce05984c281f8f51abe6f3ff9505d3d43b6d9dffc8fbbec` |

`base-refresh.yml` re-imports the snapshot on a schedule until the legacy
producer is retired. After the cutover, this file changes only through PRs.
Overlay entries in `catalog/skills/` are merged over this base at build time
and win on `${source}/${skillId}` conflicts.
