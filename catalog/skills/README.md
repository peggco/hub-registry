# Skill overlays

Add user-submitted skills here as `catalog/skills/<source>/<skillId>.json`.
Each file follows `schema/skill.schema.json`.

The build merges these over `base/skills.json` by `${source}/${skillId}`.
Overlays win. Delete an overlay to remove that submission from the next
publish. `skills.json` keeps the legacy shape; `kind`, `schemaVersion` and
`install` are stripped from the published record.
