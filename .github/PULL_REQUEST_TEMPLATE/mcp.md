## MCP server

- [ ] Entry file is `catalog/mcp/<id>.json`
- [ ] `id` is lowercase kebab-case and matches the filename
- [ ] `transport.type` is `stdio`, `sse` or `http`
- [ ] Every `${PLACEHOLDER}` is listed in `requiredEnv`
- [ ] `pnpm validate && pnpm test` passes
- [ ] Upstream project is public and maintained

### What it does

<!-- one or two sentences -->

### Required env

<!-- list the placeholders and where users get them -->
