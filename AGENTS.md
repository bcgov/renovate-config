# AGENTS.md

Repository facts for automated coding assistants. Teams may edit or remove this file.

## Layout
- Shared preset: `default.json` (JSONC). Downstream `github>bcgov/renovate-config` resolves that file. `renovate.json` is this repository's config.
- `rules-java.json5` bumps `extends` pins for presets through `2026.7.0`. `rules-actions.json5` is an empty stub so the `v1.0.0` preset can resolve. Other `rules-*.json5` grouping rules are frozen. Don't add grouping rules there.
- Workflows live in `.github/workflows/`: `renovate.yml` (schema check and dry-run), `pr-validate.yml`, `release-reminder.yml`. Duplicate-rule lint: `.github/scripts/lint_renovate_duplicates.mjs`.

## Build, test, deploy
- Schema check: `renovate-config-validator --strict default.json renovate.json`, using the `ghcr.io/renovatebot/renovate:<semver>-full` tag in `.github/workflows/renovate.yml`.
- Lint: `node .github/scripts/lint_renovate_duplicates.mjs *.json` (Node 24).
- Dry-run is the `Dry-Run` job in `renovate.yml`. It points `renovate.json` at the pull-request branch and runs that image with `--dry-run=full` on `bcgov/renovate-config`, `bcgov/quickstart-openshift`, and `bcgov/wps`. It needs `RENOVATE_TOKEN`.
- A release is a CalVer tag `YYYY.M.Patch` (third segment required). Downstream pins `github>bcgov/renovate-config#YYYY.M.Patch`. `release-reminder.yml` opens an issue when human commits to `default.json` are unreleased.

## Shared actions
- `pr-validate.yml` calls `bcgov/quickstart-openshift-helpers`. `release-reminder.yml` calls `bcgov/actions/workflow-notifier`. Use shared actions and workflows as provided; don't copy or fork them.
- Never pin `@main`. Pin bcgov shared actions to a published release SHA with a `# vX.Y.Z` comment.
