# MCP entries

Add one file per server at `catalog/mcp/<id>.json`, following
`schema/mcp.schema.json`.

- `id` is lowercase kebab-case and matches the filename.
- `transport.type` is `stdio`, `sse` or `http` (Streamable HTTP).
- stdio uses `command`, optional `args`/`env`; sse/http use `url` and optional
  `headers`.
- Use `${UPPER_CASE}` for user-supplied values and list every placeholder in
  `requiredEnv`.
- `readme.type: "github"` requires a public `source` repository. Use
  `"type": "none"` when there is no GitHub readme.

Example:

```json
{
  "schemaVersion": 1,
  "kind": "mcp",
  "id": "example",
  "name": "Example",
  "description": "What the server lets an agent do in one or two sentences.",
  "vendor": "Example",
  "homepage": "https://example.com",
  "repository": "owner/repo",
  "license": "MIT",
  "isOfficial": false,
  "version": "1.0.0",
  "tags": ["example"],
  "transport": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "example-mcp"],
    "env": { "EXAMPLE_TOKEN": "${EXAMPLE_TOKEN}" }
  },
  "requiredEnv": ["EXAMPLE_TOKEN"],
  "readme": { "type": "github", "source": "owner/repo" }
}
```
