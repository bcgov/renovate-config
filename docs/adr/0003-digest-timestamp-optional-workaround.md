# Digest timestamp-optional workaround is opt-in, not a shared default

- Status: accepted
- Deciders: Repository Maintainers
- Date: 2026-11-05

## Context

Digest and pinDigest updates can leave `renovate/stability-days` pending
indefinitely, even when the release is well past the preset's 7-day
`minimumReleaseAge`. This is an open Renovate bug,
[renovatebot/renovate#45236](https://github.com/renovatebot/renovate/issues/45236),
analysed by Conor in [#457](https://github.com/bcgov/renovate-config/issues/457)
(observed on bcgov/wps#6013, where a `docker/login-action` digest update was
12 days old but still pending).

Renovate checks release age in two places, and they disagree for digests:

- **Lookup:** ages the digest against the newest version matching the current
  value, so it passes and the branch is created.
- **Branch status:** reads `upgrade.releaseTimestamp`, which is not populated
  for digest/pinDigest updates. Under the default `minimumReleaseAgeBehaviour`
  of `timestamp-required`, a missing timestamp means pending, so waiting never
  clears it.

Because the preset sets `automerge: true`, these PRs silently never merge, and
other tooling that requires all commit statuses to pass (e.g. the GitHub
deployments API, 409) is blocked too.

## Options Considered

- **Option 1: Add `minimumReleaseAgeBehaviour: timestamp-optional` for
  digest/pinDigest to `default.json`**
  - Why cut: changes release-age behaviour for every consuming team. Digests
    with no timestamp (e.g. `latest`) would no longer be held, and #343-style
    missing-timestamp warnings may add dashboard noise. We cannot make that
    change for all teams without their permission.
- **Option 2: Document an opt-in rule teams add themselves**
  - Each team decides whether the trade-off suits them.
- **Option 3: Do nothing; wait for upstream
  ([renovatebot/renovate#46645](https://github.com/renovatebot/renovate/pull/46645))**
  - Why cut alone: leaves teams without guidance while PRs stall.

## Decision

Option 2 (plus watching upstream). The shared `default.json` does **not** set
`timestamp-optional` for digests. Teams that want stuck digest PRs to proceed
add this rule after `extends` in their own `renovate.json` (see README):

```json
{
  "packageRules": [
    {
      "matchUpdateTypes": ["digest", "pinDigest"],
      "minimumReleaseAgeBehaviour": "timestamp-optional"
    }
  ]
}
```

Optionally add `"matchManagers": ["github-actions"]` to scope it to Actions pins.

## Consequences

- No behaviour change for consumers of the shared preset.
- Opting-in teams accept that digests without any timestamp skip the age wait.

## Removal condition

Once renovatebot/renovate#45236 is fixed in the Renovate version consumers run,
teams can drop the rule and this ADR should be marked superseded.

## References

- renovatebot/renovate#45236, renovatebot/renovate#46645
- bcgov/renovate-config#457 (Conor's analysis)

## Related ADRs

- Extends ADR-0001
