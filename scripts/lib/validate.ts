import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import type { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import semver from "semver";
import { ROOT } from "./load.js";
import type {
  MCPEntry,
  PluginEntry,
  PublishedSkill,
  SkillEntry,
  ValidationIssue,
} from "./types.js";

const SCHEMA_DIR = join(ROOT, "schema");

function schema(name: string): unknown {
  return JSON.parse(readFileSync(join(SCHEMA_DIR, `${name}.schema.json`), "utf8"));
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const name of ["mcp", "plugin", "skill", "entry"]) {
  ajv.addSchema(schema(name) as object);
}

const compiledEntryValidator = ajv.getSchema(
  "https://hub.pegg.dev/schema/entry.schema.json",
);

if (!compiledEntryValidator) {
  throw new Error("entry schema failed to compile");
}

const entryValidator: ValidateFunction = compiledEntryValidator;

export interface CatalogInput {
  mcp: Array<{ file: string; entry: MCPEntry }>;
  plugins: Array<{ file: string; entry: PluginEntry }>;
  skills: Array<{ file: string; entry: SkillEntry }>;
  base: Array<{ file: string; entry: PublishedSkill }>;
}

export function validateCatalog(input: CatalogInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const { file, entry } of [...input.mcp, ...input.plugins, ...input.skills]) {
    if (!entryValidator(entry)) {
      for (const error of entryValidator.errors ?? []) {
        issues.push({
          file,
          message: `${error.instancePath || "/"} ${error.message ?? "is invalid"}`,
        });
      }
    }

    if (entry.kind === "mcp") {
      validateMCP(file, entry, issues);
    } else if (entry.kind === "plugin") {
      validatePlugin(file, entry, issues);
    } else if (entry.kind === "skill") {
      validateSkill(file, entry, issues);
    }
  }

  validateUnique(
    input.mcp.map(({ file, entry }) => ({ file, key: entry.id })),
    "MCP id",
    issues,
  );
  validateUnique(
    input.plugins.map(({ file, entry }) => ({ file, key: entry.id })),
    "plugin id",
    issues,
  );
  validateUnique(
    input.skills.map(({ file, entry }) => ({
      file,
      key: `${entry.source}/${entry.skillId}`,
    })),
    "skill overlay",
    issues,
  );
  validateUnique(
    input.base.map(({ file, entry }) => ({
      file,
      key: `${entry.source}/${entry.skillId}`,
    })),
    "base skill",
    issues,
  );

  return issues;
}

function validateMCP(file: string, entry: MCPEntry, issues: ValidationIssue[]): void {
  const expected = `catalog/mcp/${entry.id}.json`;
  if (file !== expected) {
    issues.push({ file, message: `MCP entry must live at ${expected}` });
  }

  const required = new Set(entry.requiredEnv ?? []);
  const used = new Set<string>();
  collectPlaceholders(entry.transport, used);

  for (const name of used) {
    if (!required.has(name)) {
      issues.push({
        file,
        message: `placeholder \${${name}} is missing from requiredEnv`,
      });
    }
  }

  if (entry.readme?.type === "github" && !entry.readme.source) {
    issues.push({ file, message: "github readme requires a source" });
  }
}

function validatePlugin(
  file: string,
  entry: PluginEntry,
  issues: ValidationIssue[],
): void {
  const expected = `catalog/plugins/${entry.repository}.json`;
  if (file !== expected) {
    issues.push({ file, message: `plugin entry must live at ${expected}` });
  }
  if (entry.id !== entry.repository) {
    issues.push({ file, message: "plugin id must equal repository" });
  }
  if (entry.install.source !== entry.repository) {
    issues.push({ file, message: "install.source must equal repository" });
  }
  if (entry.requires?.pegg && !semver.validRange(entry.requires.pegg)) {
    issues.push({
      file,
      message: `requires.pegg is not a valid semver range: ${entry.requires.pegg}`,
    });
  }
}

function validateSkill(
  file: string,
  entry: SkillEntry,
  issues: ValidationIssue[],
): void {
  const expected = `catalog/skills/${entry.source}/${entry.skillId}.json`;
  if (file !== expected) {
    issues.push({ file, message: `skill overlay must live at ${expected}` });
  }
  if (entry.install && entry.install.source !== entry.source) {
    issues.push({ file, message: "install.source must equal source" });
  }
}

function validateUnique(
  items: Array<{ file: string; key: string }>,
  label: string,
  issues: ValidationIssue[],
): void {
  const seen = new Map<string, string>();
  for (const { file, key } of items) {
    const previous = seen.get(key);
    if (previous) {
      issues.push({
        file,
        message: `duplicate ${label} "${key}" (also in ${previous})`,
      });
    } else {
      seen.set(key, file);
    }
  }
}

function collectPlaceholders(value: unknown, out: Set<string>): void {
  if (typeof value === "string") {
    for (const match of value.matchAll(/\$\{([A-Z][A-Z0-9_]*)\}/g)) {
      out.add(match[1]!);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPlaceholders(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectPlaceholders(item, out);
  }
}

export function formatIssues(issues: ValidationIssue[]): string {
  return issues
    .map((issue) => `${issue.file}: ${issue.message}`)
    .join("\n");
}

export function assertValid(input: CatalogInput): void {
  const issues = validateCatalog(input);
  if (issues.length > 0) {
    throw new Error(`catalog validation failed:\n${formatIssues(issues)}`);
  }
}
