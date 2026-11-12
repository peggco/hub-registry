# Security policy

## Reporting

Report vulnerabilities privately to the maintainers through GitHub Security
Advisories on this repository. Do not open a public issue for a vulnerability.

## Catalog safety

- Never include tokens, passwords or private URLs in an entry. Use
  `${UPPER_CASE}` placeholders and list them in `requiredEnv`.
- Plugin entries link to GitHub Releases; this repository stores no binaries.
- Skill overlays must point at public source repositories.
- CI validates schemas and rejects placeholder/`requiredEnv` mismatches, but it
  cannot audit upstream code. Review the upstream project before installing.
