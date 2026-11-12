import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import type { MCPEntry, PluginEntry, PublishedSkill, SkillEntry } from "./types.js";

export const ROOT = join(import.meta.dirname, "..", "..");

export function readJSON<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out.sort();
}

function loadEntries<T>(dir: string): Array<{ file: string; entry: T }> {
  return walk(dir).map((file) => ({
    file: relative(ROOT, file),
    entry: readJSON<T>(file),
  }));
}

export function loadBaseSkills(): Array<{ file: string; entry: PublishedSkill }> {
  const file = join(ROOT, "base", "skills.json");
  const entries = readJSON<PublishedSkill[]>(file);
  return entries.map((entry) => ({
    file: relative(ROOT, file),
    entry,
  }));
}

export function loadSkillOverlays(): Array<{ file: string; entry: SkillEntry }> {
  return loadEntries<SkillEntry>(join(ROOT, "catalog", "skills"));
}

export function loadMCPEntries(): Array<{ file: string; entry: MCPEntry }> {
  return loadEntries<MCPEntry>(join(ROOT, "catalog", "mcp"));
}

export function loadPluginEntries(): Array<{ file: string; entry: PluginEntry }> {
  return loadEntries<PluginEntry>(join(ROOT, "catalog", "plugins"));
}
