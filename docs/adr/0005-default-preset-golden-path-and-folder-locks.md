# 5. Default Preset Golden Path and Version-Scoped Folder Locks

- Status: Accepted
- Deciders: Repository Maintainers (@bcgov/renovate-config CODEOWNERS)
- Date: 2026-11-19

## Context

Downstream repositories across the organization consume `github>bcgov/renovate-config#YYYY.M.Patch` (`default.json`), which sets `automerge: true`, `minimumReleaseAge: "7 days"`, a weekday-only schedule, SHA/digest pinning, and `automerge: false` for database major updates.

Two recurring questions arise for maintainers and consuming teams:
1. When should a consuming repository override the shared preset instead of taking its defaults as-is?
2. How should repositories organized into version-scoped directories (such as `bcgov/nr-containers`, with paths like `postgres/16/**`, `mongo/7/**`, `alembic/3.14/**`, and `oracle-free/23/**`) prevent Renovate from proposing upgrades that cross the version track encoded in a directory name?

## Rationale

Treating `bcgov/quickstart-openshift` as the golden-path consumer keeps standard application repositories aligned on one documented baseline without per-repo preset drift. At the same time, encoding repository-specific directory layouts inside `default.json` would tightly couple the org-wide preset to individual consumers. Keeping version-track locks in the consuming repository's `renovate.json` protects version-scoped builds while keeping `default.json` general.

## Assumptions

- `bcgov/quickstart-openshift` remains the canonical golden-path consumer of `default.json` and is covered by the `Dry-Run` CI job in `.github/workflows/renovate.yml`.
- Standard application repositories do not need custom `packageRules` overrides beyond published opt-in exceptions (such as [ADR-0003](0003-digest-timestamp-optional-workaround.md)).
- Repositories using version-scoped folders treat each directory as a pinned major or minor release stream; adopting a newer stream happens by adding a new directory rather than upgrading an existing directory in place.

## Options Considered

- **Option 1: Allow ad-hoc preset overrides per repository**
  - *Trade-offs*: High flexibility, but causes inconsistent upgrade policies, stale rules, and extra support overhead.
- **Option 2: Put version-scoped folder rules into `default.json`**
  - *Trade-offs*: Centralizes everything, but bloats the shared preset with repo-specific file paths and `matchFileNames` patterns that break or confuse unrelated consumers.
- **Option 3: Golden-path defaults in `quickstart-openshift`, plus repo-local locks for version-scoped folders (Chosen)**
  - *Trade-offs*: Keeps standard consumers override-free and isolates folder-locking rules to the repositories whose directory structure requires them.

## Decision

1. **Golden path (`bcgov/quickstart-openshift`):**
   - Consuming application repositories should use the default `bcgov/renovate-config` preset (`extends: ["github>bcgov/renovate-config#YYYY.M.Patch"]`) with no `packageRules` overrides, following `bcgov/quickstart-openshift` as the reference `renovate.json`.
   - This preserves the shared defaults, including `automerge: true` after `minimumReleaseAge: "7 days"` (with database major updates excluded from automerge).
2. **Version-scoped folder lock rule (`bcgov/nr-containers` pattern):**
   - Repositories whose folder layout encodes a fixed major or minor version MUST block major and folder-crossing upgrades in their repository-level `renovate.json` rather than in `default.json`.
   - Enforce this with:
     - A repository-wide major update backstop (`"matchManagers": ["dockerfile"]`, `"matchUpdateTypes": ["major"]`, `"enabled": false`, plus `"matchManagers": ["github-actions"]`, `"matchDatasources": ["docker"]`, `"matchUpdateTypes": ["major"]`, `"enabled": false` where workflow `container:` images are used), and
     - Per-directory `packageRules` entries combining `matchManagers` (`["dockerfile"]`), `matchDatasources` (`["docker"]`), `matchFileNames`, `allowedVersions`, and `matchPackageNames` (whenever a directory contains unrelated packages or multiple images, so non-target dependencies remain updatable). For example, `postgres/16/**` scopes Docker image bumps with `"allowedVersions": "/^16([.-]|$)/"`, and `alembic/3.14/**` adds `"matchPackageNames": ["python"]` with `"allowedVersions": "/^3\\.14([.-]|$)/"` so application dependencies in `pyproject.toml` are not constrained by the Python 3.14 track.

## Consequences

### Positive
- Standard repositories follow one predictable golden path (`bcgov/quickstart-openshift`) with minimal `renovate.json` boilerplate.
- Version-scoped container repositories avoid accidental major or minor track bumps (including automerged base-image major bumps) without coupling `default.json` to repo-specific folder trees.

### Negative / Trade-offs
- Version-scoped repositories must update their local `renovate.json` whenever a new versioned directory is added or retired.
- Teams needing genuine exceptions on standard apps must document them locally in `renovate.json` rather than altering the shared preset for one repo.

## References

- [Issue #469](https://github.com/bcgov/renovate-config/issues/469)
- [README.md](../../README.md)
- [bcgov/quickstart-openshift `renovate.json`](https://github.com/bcgov/quickstart-openshift/blob/main/renovate.json)
- [bcgov/nr-containers `renovate.json`](https://github.com/bcgov/nr-containers/blob/main/renovate.json)

## Related ADRs

- Extends [ADR-0001](0001-record-architecture-decisions.md).
- Complements [ADR-0003](0003-digest-timestamp-optional-workaround.md) and [ADR-0004](0004-enforce-release-age-policy-linter.md).
