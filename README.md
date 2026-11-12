<div align="center">

<img src="https://cdn.pegg.dev/logo/infinity.gif" alt="Pegg" width="360" />

# Pegg Hub Registry

### The open catalog behind the Pegg Hub.

Skills, MCP servers, and plugins — one JSON file each, reviewed by pull request.

[Hub](https://hub.pegg.dev) · [Docs](https://docs.pegg.dev) · [Website](https://pegg.dev) · [Catalog API](https://hub-api.pegg.dev/v1)

[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-black?style=flat-square)](CONTRIBUTING.md)
[![JSON Schema 2020-12](https://img.shields.io/badge/schema-2020--12-black?style=flat-square)](schema/entry.schema.json)
[![Catalog API](https://img.shields.io/badge/API-hub--api.pegg.dev-black?style=flat-square)](https://hub-api.pegg.dev/v1)

</div>

---

<div align="center">
<sub>01 · WHAT LIVES HERE</sub>

## One registry. Three kinds.
</div>

<table>
<tr>
<td width="33%" valign="top">

### Skills

Metadata overlays for `SKILL.md` files hosted on GitHub. The registry stores the
name, description, tags, source, and install path.

<sub>`catalog/skills/<source>/<id>.json`</sub>

</td>
<td width="33%" valign="top">

### MCP servers

Stdio, SSE, and Streamable HTTP servers. Entries carry the transport, command,
URL, required environment variables, and a README source.

<sub>`catalog/mcp/<id>.json`</sub>

</td>
<td width="33%" valign="top">

### Plugins

Metadata for Pegg plugins. Binaries stay on GitHub Releases; the entry adds
version, platform, capability, and compatibility information.

<sub>`catalog/plugins/<owner>/<repo>.json`</sub>

</td>
</tr>
</table>

---

<div align="center">
<sub>02 · QUICK START</sub>

## Validate locally in one minute.
</div>

```bash
pnpm install
pnpm validate      # JSON Schema + catalog rules
pnpm typecheck
pnpm test
pnpm build         # writes dist/{skills,mcp,plugins,catalog}.json
```

`dist/` is generated and ignored by git. The published files are:

| File | Contents |
|---|---|
| `skills.json` | `base/skills.json` merged with `catalog/skills/**` |
| `mcp.json` | MCP entries sorted by name |
| `plugins.json` | plugin entries sorted by name |
| `catalog.json` | version, counts, and sha256 for each index |

---

<div align="center">
<sub>03 · REPOSITORY LAYOUT</sub>

## Small files, obvious ownership.
</div>

```text
base/skills.json                     imported skills snapshot
catalog/skills/<source>/<id>.json    skill overlay (wins over base)
catalog/mcp/<id>.json                MCP server entry
catalog/plugins/<owner>/<repo>.json  plugin entry
schema/                              JSON Schemas
scripts/                             validate, merge, build
test/                                unit tests for the build pipeline
.github/                             PR templates and workflows
```

`base/skills.json` keeps the legacy skills dataset shape. Overlays are merged by
`<source>/<skillId>` and replace the base record in place. New keys append.
Deleting an overlay restores the base record on the next build.

---

<div align="center">
<sub>04 · ADD AN ENTRY</sub>

## One file. One pull request.
</div>

### Skill overlay

```json
{
  "schemaVersion": 1,
  "kind": "skill",
  "name": "find-skills",
  "skillId": "find-skills",
  "source": "owner/repo",
  "isOfficial": false,
  "url": "https://github.com/owner/repo",
  "license": "MIT",
  "description": "Helps users discover and install agent skills.",
  "tags": ["productivity"],
  "path": "skills/find-skills/SKILL.md",
  "install": {
    "type": "github",
    "source": "owner/repo",
    "path": "skills/find-skills/SKILL.md",
    "ref": "HEAD"
  }
}
```

### MCP server

```json
{
  "schemaVersion": 1,
  "kind": "mcp",
  "id": "github",
  "name": "GitHub",
  "description": "Issues, pull requests, repositories and code search.",
  "vendor": "GitHub",
  "homepage": "https://github.com/github/github-mcp-server",
  "repository": "github/github-mcp-server",
  "license": "MIT",
  "isOfficial": true,
  "version": "1.2.0",
  "tags": ["git", "issues"],
  "transport": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  },
  "requiredEnv": ["GITHUB_PERSONAL_ACCESS_TOKEN"],
  "readme": {
    "type": "github",
    "source": "github/github-mcp-server"
  }
}
```

Remote servers use `"type": "sse"` or `"type": "http"` with a `url` and optional
`headers`. Every `${PLACEHOLDER}` must appear in `requiredEnv`.

### Plugin

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
  "install": {
    "type": "github-release",
    "source": "owner/repo"
  },
  "readme": {
    "type": "github",
    "source": "owner/repo"
  }
}
```

Plugin binaries are never stored here. `id` must equal `repository` and
`install.source` must equal `repository`, so `pegg plugins install owner/repo`
works unchanged. `platforms` must not list `windows` until the Pegg plugin
installer supports it.

---

<div align="center">
<sub>05 · COMPATIBILITY</sub>

## Warn, don't block.
</div>

Plugin entries can declare the Pegg versions they support:

```json
"requires": {
  "pegg": ">=0.2.4 <0.3.0",
  "protocol": 2
}
```

- `requires.pegg` is a semver range for the Pegg CLI and desktop app.
- `requires.protocol` is the plugin protocol version.
- Missing or mismatched values produce a warning in `pegg plugins info`,
  `pegg plugins install`, `pegg plugins update`, and the desktop catalog. The
  user can still install the plugin.

`version` is the plugin release version, independent of the Pegg compatibility
range.

---

<div align="center">
<sub>06 · HOW A CHANGE SHIPS</sub>

## Review, merge, publish.
</div>

1. Fork the repository and add or edit one JSON file.
2. Run `pnpm validate && pnpm test && pnpm build` locally.
3. Open a pull request. CI runs the same checks.
4. A maintainer reviews the entry and the upstream project.
5. Merging triggers the publish workflow, which builds the four index files and
   updates the CDN.
6. The hub site and `pegg` clients pick up the new catalog on their next fetch.

The catalog API has no write endpoint. Moderation is the pull request itself.

---

<div align="center">
<sub>07 · RULES</sub>

## Keep the catalog useful.
</div>

- One entry per JSON file, in the folder for its kind.
- `schemaVersion` is `1`; `kind` is `mcp`, `plugin`, or `skill`.
- Descriptions are 20–280 characters, factual and vendor-neutral.
- Tags are lowercase kebab-case, at most 8.
- MCP placeholders must be declared in `requiredEnv`.
- Plugins link to GitHub Releases; no binaries in this repository.
- Community entries keep `isOfficial` absent or `false`.
- Do not list `windows` for plugins until the installer supports it.

---

<div align="center">
<sub>08 · LINKS</sub>
</div>

- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [MCP PR template](.github/PULL_REQUEST_TEMPLATE/mcp.md)
- [Plugin PR template](.github/PULL_REQUEST_TEMPLATE/plugin.md)
- [Skill PR template](.github/PULL_REQUEST_TEMPLATE/skill.md)
- [Catalog API](https://hub-api.pegg.dev/v1)
- [Pegg Hub](https://hub.pegg.dev)

---

<div align="center">
<sub>MIT licensed · built for the Pegg catalog</sub>
</div>
