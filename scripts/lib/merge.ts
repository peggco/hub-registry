import type {
  MCPEntry,
  PluginEntry,
  PublishedSkill,
  SkillEntry,
} from "./types.js";

export function skillKey(entry: { source: string; skillId: string }): string {
  return `${entry.source}/${entry.skillId}`;
}

export function toPublishedSkill(entry: SkillEntry): PublishedSkill {
  const published: PublishedSkill = {
    name: entry.name,
    skillId: entry.skillId,
    source: entry.source,
  };
  if (entry.isOfficial !== undefined) published.isOfficial = entry.isOfficial;
  if (entry.url) published.url = entry.url;
  if (entry.license) published.license = entry.license;
  if (entry.description) published.description = entry.description;
  if (entry.tags?.length) published.tags = entry.tags;
  if (entry.path) published.path = entry.path;
  if (entry.meta) published.meta = entry.meta;
  return published;
}

export function mergeSkills(
  base: PublishedSkill[],
  overlays: SkillEntry[],
): PublishedSkill[] {
  const merged = base.map((entry) => ({ ...entry }));
  const positions = new Map<string, number>();
  merged.forEach((entry, index) => positions.set(skillKey(entry), index));

  for (const overlay of overlays) {
    const published = toPublishedSkill(overlay);
    const key = skillKey(published);
    const index = positions.get(key);
    if (index === undefined) {
      positions.set(key, merged.length);
      merged.push(published);
    } else {
      merged[index] = published;
    }
  }

  return merged;
}

export function sortByName<T extends { name: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function buildIndexes(input: {
  base: PublishedSkill[];
  overlays: SkillEntry[];
  mcp: MCPEntry[];
  plugins: PluginEntry[];
}): {
  skills: PublishedSkill[];
  mcp: MCPEntry[];
  plugins: PluginEntry[];
} {
  return {
    skills: mergeSkills(input.base, input.overlays),
    mcp: sortByName(input.mcp),
    plugins: sortByName(input.plugins),
  };
}
