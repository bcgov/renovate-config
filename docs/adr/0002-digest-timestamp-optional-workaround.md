# Allow digest updates without a release timestamp (temporary workaround)

- Status: accepted
- Deciders: Repository Maintainers
- Date: 2026-11-05

## Context

Digest and pinDigest updates often have no `releaseTimestamp`. Due to
[renovatebot/renovate#45236](https://github.com/renovatebot/renovate/issues/45236),
the `renovate/stability-days` branch status stays pending for these updates, so
they never merge under the shared `minimumReleaseAge` policy ([#457](https://github.com/bcgov/renovate-config/issues/457)).

## Rationale

Every consumer of `default.json` is affected: digest updates (GitHub Actions
SHAs, container digests) stall indefinitely, which delays security patches.

## Assumptions

- Digest updates track an already-published tag; the risk of skipping the age
  check is low compared with stalled pins.
- Upstream will fix the status check behaviour.

## Options Considered

- **Option 1: Leave policy unchanged**
  - Trade-offs / Why cut: digest PRs remain pending forever.
- **Option 2: Disable `minimumReleaseAge` for digests (`null`)**
  - Trade-offs / Why cut: drops the age check even when a timestamp exists.
- **Option 3: `minimumReleaseAgeBehaviour: timestamp-optional` for digest/pinDigest**
  - Description: keep the age check when a timestamp exists; proceed when it doesn't.

## Decision

Option 3, scoped only to `matchUpdateTypes: ["digest", "pinDigest"]` in `default.json`.

## Consequences

### Positive
- Digest updates no longer stall on `renovate/stability-days`.
- Age check still applies when a timestamp is available.

### Negative / Trade-offs
- Digest updates without a timestamp can merge with no release-age delay.

## Removal condition

Remove the rule (and mark this ADR superseded) once renovatebot/renovate#45236
is fixed in the Renovate version used by consumers.

## References

- renovatebot/renovate#45236
- bcgov/renovate-config#457

## Related ADRs

- Extends ADR-0001
