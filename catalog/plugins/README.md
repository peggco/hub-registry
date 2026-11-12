# Plugin entries

Add one file per plugin at `catalog/plugins/<owner>/<repo>.json`, following
`schema/plugin.schema.json`. Plugin binaries are **not** stored here; the entry
points at GitHub Releases and `install.source` must equal `repository`.

The first plugin (`peggco/pegg-browser-use`) is intentionally not seeded until
its release repository is public. Use this template:

```json
{
  "schemaVersion": 1,
  "kind": "plugin",
  "id": "owner/repo",
  "name": "plugin-name",
  "description": "What the plugin makes possible in one or two sentences.",
  "repository": "owner/repo",
  "homepage": "https://github.com/owner/repo",
  "license": "MIT",
  "isOfficial": false,
  "version": "1.2.3",
  "requires": {
    "pegg": ">=0.2.4 <0.3.0",
    "protocol": 2
  },
  "tags": ["category", "capability"],
  "capabilities": ["tools", "skills"],
  "platforms": ["linux", "darwin"],
  "arch": ["amd64", "arm64"],
  "install": { "type": "github-release", "source": "owner/repo" },
  "readme": { "type": "github", "source": "owner/repo" }
}
```

`requires.pegg` is a semver range for the Pegg CLI/desktop version and
`requires.protocol` is the plugin protocol version (`pkg/plugin.ProtocolVersion`,
currently `2`). Missing or mismatched values produce an install warning, not a
hard block; the user can still install the plugin.

`windows` is rejected until the Pegg plugin installer supports it.
