import test from "node:test";
import assert from "node:assert/strict";
import { mergeSkills, toPublishedSkill } from "../scripts/lib/merge.js";

const base = [
  { name: "A", skillId: "a", source: "owner/repo" },
  { name: "B", skillId: "b", source: "owner/repo" },
];

test("overlay replaces in place and appends new entries", () => {
  const merged = mergeSkills(base, [
    {
      schemaVersion: 1,
      kind: "skill",
      name: "B2",
      skillId: "b",
      source: "owner/repo",
      description: "updated",
    },
    {
      schemaVersion: 1,
      kind: "skill",
      name: "C",
      skillId: "c",
      source: "owner/repo",
    },
  ]);

  assert.deepEqual(
    merged.map((entry) => entry.name),
    ["A", "B2", "C"],
  );
  assert.deepEqual(merged[1], {
    name: "B2",
    skillId: "b",
    source: "owner/repo",
    description: "updated",
  });
});

test("overlay for a different source appends", () => {
  const merged = mergeSkills(base, [
    {
      schemaVersion: 1,
      kind: "skill",
      name: "A",
      skillId: "a",
      source: "other/repo",
    },
  ]);

  assert.equal(merged.length, 3);
  assert.equal(merged[2]!.source, "other/repo");
});

test("published skill drops registry-only fields", () => {
  const published = toPublishedSkill({
    schemaVersion: 1,
    kind: "skill",
    name: "A",
    skillId: "a",
    source: "owner/repo",
    isOfficial: true,
    install: { type: "github", source: "owner/repo" },
    meta: { license: "MIT" },
  });

  assert.deepEqual(published, {
    name: "A",
    skillId: "a",
    source: "owner/repo",
    isOfficial: true,
    meta: { license: "MIT" },
  });
});
