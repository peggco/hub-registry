import test from "node:test";
import assert from "node:assert/strict";
import { validateCatalog } from "../scripts/lib/validate.js";
import type { CatalogInput } from "../scripts/lib/validate.js";

function input(overrides: Partial<CatalogInput> = {}): CatalogInput {
  return {
    base: [],
    skills: [],
    mcp: [],
    plugins: [],
    ...overrides,
  };
}

const mcp = {
  schemaVersion: 1 as const,
  kind: "mcp" as const,
  id: "github",
  name: "GitHub",
  description: "Issues, pull requests and repository search.",
  transport: {
    type: "stdio" as const,
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: { GITHUB_TOKEN: "${GITHUB_TOKEN}" },
  },
  requiredEnv: ["GITHUB_TOKEN"],
};

const plugin = {
  schemaVersion: 1 as const,
  kind: "plugin" as const,
  id: "owner/repo",
  name: "Repo",
  description: "A plugin used to test catalog validation.",
  repository: "owner/repo",
  version: "1.0.0",
  install: { type: "github-release" as const, source: "owner/repo" },
};

const skill = {
  schemaVersion: 1 as const,
  kind: "skill" as const,
  name: "Skill",
  skillId: "skill",
  source: "owner/repo",
};

test("accepts a valid catalog", () => {
  const issues = validateCatalog(
    input({
      mcp: [{ file: "catalog/mcp/github.json", entry: mcp }],
      plugins: [{ file: "catalog/plugins/owner/repo.json", entry: plugin }],
      skills: [
        { file: "catalog/skills/owner/repo/skill.json", entry: skill },
      ],
      base: [
        {
          file: "base/skills.json",
          entry: { name: "Base", skillId: "base", source: "owner/repo" },
        },
      ],
    }),
  );

  assert.deepEqual(issues, []);
});

test("rejects a placeholder missing from requiredEnv", () => {
  const issues = validateCatalog(
    input({
      mcp: [
        {
          file: "catalog/mcp/github.json",
          entry: { ...mcp, requiredEnv: [] },
        },
      ],
    }),
  );

  assert.ok(
    issues.some((issue) =>
      issue.message.includes("missing from requiredEnv"),
    ),
  );
});

test("rejects duplicate MCP ids", () => {
  const issues = validateCatalog(
    input({
      mcp: [
        { file: "catalog/mcp/github.json", entry: mcp },
        { file: "catalog/mcp/github.json", entry: mcp },
      ],
    }),
  );

  assert.ok(issues.some((issue) => issue.message.includes("duplicate MCP id")));
});

test("rejects a plugin whose id does not match its repository", () => {
  const issues = validateCatalog(
    input({
      plugins: [
        {
          file: "catalog/plugins/owner/repo.json",
          entry: { ...plugin, id: "owner/other" },
        },
      ],
    }),
  );

  assert.ok(
    issues.some((issue) => issue.message.includes("id must equal repository")),
  );
});

test("accepts plugin compatibility metadata", () => {
  const issues = validateCatalog(
    input({
      plugins: [
        {
          file: "catalog/plugins/owner/repo.json",
          entry: {
            ...plugin,
            requires: { pegg: ">=0.2.4 <0.3.0", protocol: 2 },
          },
        },
      ],
    }),
  );

  assert.deepEqual(issues, []);
});

test("rejects an invalid plugin Pegg version range", () => {
  const issues = validateCatalog(
    input({
      plugins: [
        {
          file: "catalog/plugins/owner/repo.json",
          entry: {
            ...plugin,
            requires: { pegg: "not a range", protocol: 2 },
          },
        },
      ],
    }),
  );

  assert.ok(
    issues.some((issue) => issue.message.includes("valid semver range")),
  );
});

test("rejects an invalid plugin protocol version", () => {
  const issues = validateCatalog(
    input({
      plugins: [
        {
          file: "catalog/plugins/owner/repo.json",
          entry: {
            ...plugin,
            requires: { protocol: 0 },
          },
        },
      ],
    }),
  );

  assert.ok(issues.some((issue) => issue.message.includes("/requires/protocol")));
});

test("rejects a skill overlay in the wrong path", () => {
  const issues = validateCatalog(
    input({
      skills: [
        { file: "catalog/skills/owner/other/skill.json", entry: skill },
      ],
    }),
  );

  assert.ok(
    issues.some((issue) => issue.message.includes("must live at")),
  );
});

test("rejects a too-short description", () => {
  const issues = validateCatalog(
    input({
      mcp: [
        {
          file: "catalog/mcp/github.json",
          entry: { ...mcp, description: "short" },
        },
      ],
    }),
  );

  assert.ok(issues.some((issue) => issue.message.includes("fewer than 20")));
});
