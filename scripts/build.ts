import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildIndexes } from "./lib/merge.js";
import {
  loadBaseSkills,
  loadMCPEntries,
  loadPluginEntries,
  loadSkillOverlays,
  ROOT,
} from "./lib/load.js";
import { formatIssues, validateCatalog } from "./lib/validate.js";
import type { CatalogFile, PublishedSkill } from "./lib/types.js";

const args = process.argv.slice(2);
const check = args.includes("--check");
const againstFlag = args.indexOf("--against");
const againstFile = againstFlag >= 0 ? args[againstFlag + 1] : undefined;

const input = {
  base: loadBaseSkills(),
  skills: loadSkillOverlays(),
  mcp: loadMCPEntries(),
  plugins: loadPluginEntries(),
};

const issues = validateCatalog(input);
if (issues.length > 0) {
  console.error(formatIssues(issues));
  process.exit(1);
}

const indexes = buildIndexes({
  base: input.base.map(({ entry }) => entry),
  overlays: input.skills.map(({ entry }) => entry),
  mcp: input.mcp.map(({ entry }) => entry),
  plugins: input.plugins.map(({ entry }) => entry),
});

const payloads: Record<string, unknown> = {
  "skills.json": indexes.skills,
  "mcp.json": indexes.mcp,
  "plugins.json": indexes.plugins,
};

const serialized: Record<string, string> = {};
const digests: Record<string, string> = {};
const combined = createHash("sha256");

for (const [name, payload] of Object.entries(payloads)) {
  const text = `${JSON.stringify(payload)}\n`;
  serialized[name] = text;
  const hash = createHash("sha256").update(text).digest("hex");
  digests[name] = hash;
  combined.update(hash);
}

const version = `sha-${combined.digest("hex").slice(0, 12)}`;
const fileManifest: Record<string, CatalogFile> = {};
for (const [name, count] of Object.entries({
  skills: indexes.skills.length,
  mcp: indexes.mcp.length,
  plugins: indexes.plugins.length,
})) {
  const file = `${name}.json`;
  fileManifest[name] = {
    count,
    sha256: digests[file]!,
    etag: `"${digests[file]!.slice(0, 32)}"`,
  };
}

const catalog = {
  version,
  counts: {
    skills: indexes.skills.length,
    mcp: indexes.mcp.length,
    plugins: indexes.plugins.length,
  },
  files: fileManifest,
};

serialized["catalog.json"] = `${JSON.stringify(catalog, null, 2)}\n`;

console.log(
  `catalog ${version}: ${catalog.counts.skills} skills, ${catalog.counts.mcp} mcp, ${catalog.counts.plugins} plugins`,
);

if (againstFile) {
  compareAgainst(againstFile, indexes.skills);
}

if (check) {
  checkDist(serialized);
} else {
  const outDir = join(ROOT, "dist");
  mkdirSync(outDir, { recursive: true });
  for (const [name, text] of Object.entries(serialized)) {
    writeFileSync(join(outDir, name), text);
  }
  console.log(`wrote ${Object.keys(serialized).length} files to dist/`);
}

function checkDist(expected: Record<string, string>): void {
  const outDir = join(ROOT, "dist");
  if (!existsSync(outDir)) {
    console.log("dist/ not present; nothing to compare");
    return;
  }

  let failed = false;
  for (const [name, text] of Object.entries(expected)) {
    const file = join(outDir, name);
    if (!existsSync(file)) {
      console.error(`missing dist/${name}`);
      failed = true;
      continue;
    }
    if (readFileSync(file, "utf8") !== text) {
      console.error(`dist/${name} is out of date`);
      failed = true;
    }
  }

  if (failed) process.exit(1);
  console.log("dist/ is up to date");
}

function compareAgainst(file: string, skills: PublishedSkill[]): void {
  const raw = JSON.parse(readFileSync(file, "utf8")) as
    | PublishedSkill[]
    | { items: PublishedSkill[] };
  const previous = Array.isArray(raw) ? raw : raw.items;
  const before = new Set(previous.map((s) => `${s.source}/${s.skillId}`));
  const after = new Set(skills.map((s) => `${s.source}/${s.skillId}`));

  const added = [...after].filter((key) => !before.has(key));
  const removed = [...before].filter((key) => !after.has(key));

  console.log(
    `skills vs ${file}: ${added.length} added, ${removed.length} removed`,
  );
  for (const key of added.slice(0, 20)) console.log(`  + ${key}`);
  for (const key of removed.slice(0, 20)) console.log(`  - ${key}`);
}
