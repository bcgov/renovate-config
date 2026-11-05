# Rule notes

Explanations moved verbatim from `description` fields in `default.json`. Only existing notes are recorded here; per ADR-0001, no ADRs are written retroactively for these older decisions. See git history for earlier context.

## Vulnerability alerts

`enabled` is forced true so advisories can still bump deps that packageRules disable, e.g. overrides and resolutions.

## bcgov/renovate-config CalVer upgrades

Bypass stability wait and allow unlimited major version upgrades for bcgov/renovate-config to support CalVer transitions (where maxMajorIncrement: 0 disables the default increment limit)

## Package overrides and resolutions

Overrides in package.json (and resolutions/pnpm.overrides) exist to patch security vulnerabilities or enforce transitive dependency pins. Renovate should not auto-upgrade them, except for security advisories (see vulnerabilityAlerts).

## Infrastructure providers grouping

Combine Terraform, Docker, Kubernetes, Helm, and Docker Compose updates into single PRs. Infrastructure changes should be reviewed together for consistency.

## Java pinning

Pin all digests/SHAs for supply chain security. This ensures reproducible builds and prevents dependency substitution attacks.

## Java ecosystem grouping

Combine Maven and Gradle updates into single PRs. Java dependencies should be updated together to maintain compatibility and avoid version conflicts.

## JavaScript TypeScript pinning

Pin all digests/SHAs for supply chain security. This ensures reproducible builds and prevents dependency substitution attacks.

## Nodejs ecosystem grouping

Combine updates from all JavaScript managers (npm, yarn, pnpm, bun) into single PRs. JavaScript/TypeScript dependencies should be updated together to maintain compatibility.

## Python pinning

Pin all digests/SHAs for supply chain security. This ensures reproducible builds and prevents dependency substitution attacks.

## Python ecosystem grouping

Combine updates from all Python managers (pip_requirements, pip_setup, pipenv, poetry, uv, pep621, pip-compile) into single PRs to maintain compatibility.
