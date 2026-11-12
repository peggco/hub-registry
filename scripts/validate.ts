import {
  loadBaseSkills,
  loadMCPEntries,
  loadPluginEntries,
  loadSkillOverlays,
} from "./lib/load.js";
import { formatIssues, validateCatalog } from "./lib/validate.js";

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

console.log(
  `ok: ${input.base.length} base skills, ${input.skills.length} skill overlays, ${input.mcp.length} mcp, ${input.plugins.length} plugins`,
);
