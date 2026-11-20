# Maintaining `bcgov/renovate-config`

This guide covers day-to-day maintenance for `bcgov/renovate-config`: local validation, CI dry-runs, cutting CalVer releases, canary rollout verification, and recurring health checks.

## Architecture & Governance

- **Single preset file:** All shared rules live in [`default.json`](../default.json) (JSONC syntax). Never rename it to `default.jsonc` or add nested preset files; downstream `github>bcgov/renovate-config#<tag>` lookups resolve `default.json`.
- **This repo's config:** [`renovate.json`](../renovate.json) extends `github>bcgov/renovate-config` and disables self-updates so CI always validates against the active branch rather than a pinned tag.
- **ADRs:** Non-trivial preset, workflow, or policy decisions belong in [`docs/adr/`](adr/) using [`docs/adr/template.md`](adr/template.md). Routine regex tweaks and grouping adjustments do not require an ADR.
- **Code owners:** Maintainers are listed in [`.github/CODEOWNERS`](../.github/CODEOWNERS).

## Local Validation Before Opening a PR

Run the duplicate linter, policy linter, and policy tests (Node 24+; CI runs Node 26):

```bash
node .github/scripts/lint_renovate_duplicates.mjs *.json
node .github/scripts/lint_renovate_policy.mjs *.json
node --test .github/scripts/lint_renovate_policy.test.mjs
```

Run Renovate's strict schema validator in a container using the exact `-full` image tag pinned in [`.github/workflows/renovate.yml`](../.github/workflows/renovate.yml):

```bash
podman run --rm \
  --entrypoint renovate-config-validator \
  -v "$PWD:/work:Z" \
  -w /work \
  ghcr.io/renovatebot/renovate:44.131.3-full \
  --strict default.json renovate.json
```

> Use the `-full` tag; `-slim` images omit `uv` and `poetry`. Keep the image tag aligned with `.github/workflows/renovate.yml` (Renovate updates that tag automatically via PRs).

## CI Validation & Dry-Run Testing

[`.github/workflows/renovate.yml`](../.github/workflows/renovate.yml) (`PR` workflow) runs on pull requests, daily on cron (`0 10 * * *` UTC), and via `workflow_dispatch`:

1. **`Validate Config`:** Temporarily rewrites `renovate.json` to reference the PR branch, runs `renovate-config-validator --strict default.json renovate.json`, runs custom rule checks, and executes `lint_renovate_duplicates.mjs`, `lint_renovate_policy.mjs`, and `lint_renovate_policy.test.mjs`.
2. **`Dry-Run`:** Runs `renovate --dry-run=full` using `RENOVATE_TOKEN` against `bcgov/renovate-config`, `bcgov/quickstart-openshift`, and `bcgov/wps`, failing on `validationError`, `config-validation`, or `Cannot find preset`.

To test an additional downstream repository before releasing, trigger the `PR` workflow manually with `workflow_dispatch` and pass `repos` (for example `bcgov/nr-containers`) and `log_level: DEBUG` if needed.

## Cutting a Release

Downstream repositories pin releases with three-segment Calendar Versioning:

```json
{
  "extends": ["github>bcgov/renovate-config#2026.10.29"]
}
```

### Release trigger & cadence

- Releases are published on demand when meaningful configuration, grouping, or security changes land on `main` (avoiding churn for trivial docs-only edits).
- [`.github/workflows/release-reminder.yml`](../.github/workflows/release-reminder.yml) runs on the 1st of each month at `02:00` UTC (and via `workflow_dispatch`). It checks `git log <latest-tag>..HEAD -- default.json` excluding `renovate[bot]` and `dependabot[bot]` commits, and opens a `Release Triage` issue mentioning CODEOWNERS when unreleased human changes exist.

### Release steps

1. Confirm `Validate Config` and `Dry-Run` are green on `main` at the commit you plan to tag.
2. Inspect unreleased changes since the latest tag:
   ```bash
   git fetch --tags origin
   latest_tag=$(git describe --tags --abbrev=0)
   git log "${latest_tag}..origin/main" --oneline
   ```
3. Choose the next three-segment CalVer tag `YYYY.M.Patch` (no `v` prefix, e.g., `2026.11.0`, or increment `Patch` for subsequent releases in the same month). Never omit the third segment — the custom regex manager in `default.json` requires three numeric parts to compare tags and open downstream update PRs.
4. Create a GitHub Release on `main` with that tag and auto-generated release notes (matching prior releases such as `2026.10.29`).

## Canary Rollout & Verification

`default.json` includes a custom regex manager matching `bcgov/renovate-config` pins with `minimumReleaseAge: null` and `maxMajorIncrement: 0`, so downstream repositories receive update PRs on their next Renovate run without waiting 7 days.

After publishing a release:

1. **Verify the golden path and canary repositories first:** Check that the `bcgov/renovate-config` bump PR opens cleanly and passes CI on `bcgov/quickstart-openshift` (golden path) and active canary repos (such as `bcgov/nr-containers`, `bcgov/action-repo-reporter`, `bcgov/nr-forest-client-commons`, `bcgov/nr-old-growth`, and `bcgov/pubcode`).
2. **Watch for regressions:** Confirm canary Renovate runs show no config validation errors, unexpected PR floods, broken builds, or stuck `renovate/stability-days` checks.
3. **Rollback / hotfix:** Never delete or move a published CalVer tag. If a release causes downstream breakage, fix or revert on `main`, confirm `Dry-Run` passes, and cut a new patch release (`YYYY.M.Patch+1`).

## Health Checks

Check these signals regularly (and before cutting a release):

| Signal | Where to check | What to look for |
| :--- | :--- | :--- |
| Daily `Dry-Run` | Actions tab → `PR` workflow (`schedule` runs) | Config validation errors, `Cannot find preset`, or failures after Renovate image updates |
| Monthly release queue | `Release Triage` issues from `release-reminder.yml` | Unreleased `default.json` changes needing a `YYYY.M.Patch` tag |
| Dependency Dashboard | Issue `#100` (`Dependency Dashboard`) | Renovate warnings, rate-limit notices, or errored updates on this repo |
| Pending digest PRs | Downstream Renovate PRs stuck on `renovate/stability-days` | Known upstream issue `renovatebot/renovate#45236`; teams may opt into the [ADR-0003](adr/0003-digest-timestamp-optional-workaround.md) workaround |
