# 4. Align Playwright Release Age with Stability Window

- Status: Accepted
- Deciders: Repository Maintainers (@bcgov/renovate-config CODEOWNERS)
- Date: 2026-11-05

## Context

The shared preset `default.json` defines a default `minimumReleaseAge` of 7 days. Previously, a package rule for Playwright npm packages (`@playwright/test`, `playwright`, `playwright-core`) and container images (`mcr.microsoft.com/playwright`) explicitly set `"minimumReleaseAge": null` to sync updates with lockfile maintenance.

Downstream projects using Yarn modern (e.g. `bcgov/wps` on Yarn 4.18.1) enforce a default minimum release age (24 hours). Setting `minimumReleaseAge: null` permitted Renovate to create pull requests for Playwright releases within hours of publication (e.g., [wps#6022](https://github.com/bcgov/wps/pull/6022)), which Yarn rejected during install because the package was newer than Yarn's 24-hour threshold.

## Rationale

Renovate pull requests that fail installation out of the box create unnecessary CI failures and maintainer friction. Re-aligning Playwright with the global stability window ensures that when Renovate proposes a Playwright update, the package is mature enough to pass downstream package manager checks (such as Yarn's 24-hour threshold) while keeping the npm packages and container images grouped and synchronized.

## Assumptions

- Playwright npm packages and the official Microsoft Playwright container image are published and available within the 7-day stability window.
- The `rangeStrategy: "bump"` configuration ensures manifest range updates are generated in sync with the container image.
- Waiting 7 days is acceptable for downstream consumers and satisfies Yarn 4.x's 24-hour minimum release age requirement.

## Options Considered

- **Option 1: Retain `minimumReleaseAge: null` (Status Quo)**
  - *Trade-offs*: Updates are proposed immediately upon upstream release, but break package installations on repositories enforcing release age rules (e.g., Yarn modern).
- **Option 2: Set `minimumReleaseAge: "1 day"` or `"24 hours"` for Playwright**
  - *Trade-offs*: Satisfies Yarn's default 24-hour buffer, but creates an ad-hoc stability window inconsistent with the rest of the repository ecosystem.
- **Option 3: Remove `minimumReleaseAge: null` and inherit global 7-day policy (Chosen)**
  - *Trade-offs*: Playwright updates wait the standard 7 days before PR creation. All packages in the Playwright group (`@playwright/test`, `playwright`, `playwright-core`, `mcr.microsoft.com/playwright`) update together without breaking downstream package managers.

## Decision

Remove `"minimumReleaseAge": null` from the Playwright package rule in `default.json`. Playwright updates will inherit the top-level `"minimumReleaseAge": "7 days"`.

## Consequences

### Positive

- Prevents immediate PRs that fail installation on package managers enforcing minimum release ages (e.g. Yarn 4.x).
- Standardizes Playwright on the global 7-day stability window alongside other dependencies.
- Playwright npm packages and Docker images remain grouped together under `groupName: "playwright"`.

### Negative / Trade-offs

- Teams wait 7 days after an upstream Playwright release before receiving automated Renovate PRs.

## References

- Issue [#462](https://github.com/bcgov/renovate-config/issues/462)
- Pull Request [#445](https://github.com/bcgov/renovate-config/pull/445)
- [bcgov/wps PR #6022](https://github.com/bcgov/wps/pull/6022)
