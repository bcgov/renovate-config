# 4. Enforce Release Age Policy Linter

- Status: Accepted
- Deciders: Repository Maintainers (@bcgov/renovate-config CODEOWNERS)
- Date: 2026-11-05

## Context

The global `default.json` preset sets `minimumReleaseAge: "7 days"`. Downstream ecosystems (notably Yarn 4.x in `bcgov/wps`) enforce minimum release age gates (default 24 hours), causing package installations to fail if Renovate proposes updates immediately upon upstream publication.

An ad-hoc package rule exception setting `"minimumReleaseAge": null` on Playwright packages (added in #445, fixed in #463) resulted in premature pull requests that broke downstream installs. Standard Renovate schema validation (`renovate-config-validator`) validates syntax but does not enforce policy invariants regarding release stability windows.

## Rationale

Without automated policy enforcement, ad-hoc overrides of `minimumReleaseAge` can inadvertently bypass stability gates and break downstream consumers. Enforcing release-age guardrails in CI prevents zero-delay stability bypasses from reaching `default.json`.

## Assumptions

- `bcgov/renovate-config` is legitimately exempt to support zero-delay downstream CalVer transitions.
- `lockFileMaintenance` is legitimately exempt because it only regenerates lockfiles against existing manifest constraints and does not bump ranges or add dependencies.
- All other general dependency updates must respect stability windows (at least 24 hours / non-zero).

## Options Considered

- **Option 1: Manual code review only**
  - *Trade-offs*: Human reviewers easily overlook the downstream implications of `"minimumReleaseAge": null` in large JSON configs.
- **Option 2: Embed checks in `renovate-config-validator`**
  - *Trade-offs*: The upstream validator only checks Renovate's official schema and cannot enforce organization-specific policy rules.
- **Option 3: Dedicated CI policy linter and test suite (Chosen)**
  - *Trade-offs*: Adds a small native Node script (`lint_renovate_policy.mjs`) and unit test suite (`lint_renovate_policy.test.mjs`) to CI with zero external runtime dependencies. Fails fast if any unauthorized package rule sets `minimumReleaseAge: null` or zero duration.

## Decision

Add `.github/scripts/lint_renovate_policy.mjs` and execute it as part of the `Validate Config` job in `.github/workflows/renovate.yml`:
1. Reject `"minimumReleaseAge": null` on any `packageRule` unless explicitly allowlisted (`bcgov/renovate-config` or `lockFileMaintenance`).
2. Reject any release age string evaluating to zero (e.g. `"0 days"`, `"0h"`).
3. Verify test coverage via Node's native test runner (`node --test .github/scripts/lint_renovate_policy.test.mjs`).

## Consequences

### Positive

- Automates prevention of zero-delay stability bypasses in shared presets.
- Guarantees compatibility with downstream package managers enforcing publication delays (such as Yarn 4.x).
- Runs with zero additional third-party dependencies in standard Node environments.

### Negative / Trade-offs

- Legitimate new exceptions (if ever needed in the future) must be explicitly allowlisted in the policy linter.

## References

- Issue [#462](https://github.com/bcgov/renovate-config/issues/462)
- Pull Request [#463](https://github.com/bcgov/renovate-config/pull/463)
- Pull Request [#445](https://github.com/bcgov/renovate-config/pull/445)
