# AGENTS.md

Repository facts for automated coding assistants. Teams may edit or remove this file.

## Layout
- Shared preset: `default.json` (JSONC). Downstream `github>bcgov/renovate-config` resolves that file. `renovate.json` is this repository's config.
- All shared rules live in `default.json`. Don't add other preset files.
- Architectural and configuration decisions are recorded in `docs/adr/`; follow the ADR convention below.
- Workflows live in `.github/workflows/`: `renovate.yml` (schema check and dry-run), `pr-validate.yml`, `release-reminder.yml`. Duplicate-rule lint: `.github/scripts/lint_renovate_duplicates.mjs`.

## ADR convention
- Write an ADR when a change has large or downstream impact, was a group decision or needed conversation in government chat (Teams), or has ramifications for future decisions. Follow `docs/adr/template.md` and identify the accountable team or role (`Deciders`).
- Err on writing too many ADRs rather than too few. With AI, writing “too many” ADRs is no longer the hassle it used to be. Prefer generating a record and trimming over skipping one to save effort. Cleanup is cheap; losing the decision record is not.
- Generate the ADR with the change. Before merge, trim it only if the change is clearly routine (regex, grouping, or other small maintenance). After merge, keep the decision record; do not delete an ADR just to tidy `docs/adr/`.
- When a new ADR overwrites or amends an older decision, change the older ADR's Status to `Superseded by [ADR-xxxx](xxxx-title.md)`. Under Related ADRs, add `Supersedes [ADR-xxxx](xxxx-title.md)` in the new ADR and `Superseded by [ADR-yyyy](yyyy-title.md)` in the older ADR, linking to the older and newer records respectively. All ADR links in Status and Related ADRs must use relative in-repo paths (same-directory filenames for ADRs), never `file://` local paths.

## Build, test, deploy
- Schema check: `renovate-config-validator --strict default.json renovate.json`, using the `ghcr.io/renovatebot/renovate:<semver>-full` tag in `.github/workflows/renovate.yml`.
- Lint: `node .github/scripts/lint_renovate_duplicates.mjs *.json` and `node .github/scripts/lint_renovate_policy.mjs *.json` (Node 24).
- Tests: `node --test .github/scripts/lint_renovate_policy.test.mjs` (Node 24).
- Dry-run is the `Dry-Run` job in `renovate.yml`. It points `renovate.json` at the pull-request branch and runs that image with `--dry-run=full` on `bcgov/renovate-config`, `bcgov/quickstart-openshift`, and `bcgov/wps`. It needs `RENOVATE_TOKEN`.
- A release is a CalVer tag `YYYY.M.Patch` (third segment required). Downstream pins `github>bcgov/renovate-config#YYYY.M.Patch`. `release-reminder.yml` opens an issue when human commits to `default.json` are unreleased.

## Shared actions
- `pr-validate.yml` calls `bcgov/quickstart-openshift-helpers`. `release-reminder.yml` calls `bcgov/actions/workflow-notifier`. Use shared actions and workflows as provided; don't copy or fork them.
- Never pin `@main`. Pin bcgov shared actions to a published release SHA with a `# vX.Y.Z` comment.
