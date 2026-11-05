# 2. Restrict Renovate PR Creation to Weekday Office Hours

- Status: Accepted
- Deciders: Repository Maintainers (@bcgov/renovate-config CODEOWNERS)
- Date: 2026-11-05

## Context

`bcgov/renovate-config` presets previously allowed Renovate to open pull requests (regular dependency updates and security/vulnerability updates) at any time, including weekends. Weekend PRs create notification noise for maintainers and leave updates sitting unreviewed until the next weekday.

## Rationale

Restricting PR creation to weekday office hours aligns automation with when teams can review and merge, reducing weekend alert fatigue and stale PR backlogs.

## Assumptions

- Downstream consumers of `default.json` benefit from a predictable weekday-only cadence.
- Urgent CVEs disclosed over a weekend can still be handled manually when needed.
- `timezone: America/Vancouver` remains the correct reference for office hours across consumers.

## Options Considered

- **Option 1: Status quo (PR creation enabled 24/7)**
  - *Trade-offs*: Maximum automation frequency, but weekend notification noise and stale queues.
- **Option 2: Restrict regular updates to weekdays; keep security updates 24/7**
  - *Trade-offs*: Faster security response on weekends, but advisory PRs still disrupt downtime.
- **Option 3: Restrict both regular and security updates to weekdays (Chosen)**
  - *Trade-offs*: Quiet weekends for all automated PRs; Friday-evening/weekend CVEs wait until Monday for automated PRs.

## Decision

Extend the shared preset with `schedule:officeHours` (`* 8-17 * * 1-5` in `America/Vancouver`) so regular and security/vulnerability PRs open only during weekday office hours. The preset is listed in `extends` (schedule arrays cannot reference preset names). Lock file maintenance keeps its own weekly schedule from `:maintainLockFilesWeekly`.

## Consequences

### Positive
- Eliminates weekend notification fatigue for maintainers and downstream owners.
- Keeps active PR queues aligned with working days.

### Negative / Trade-offs
- Security advisories disclosed Friday evening or over the weekend wait until Monday for automated PRs (manual intervention remains available for critical cases).
- Weekday mornings may see a burst of updates that accumulated over the weekend.

## References

- [Issue #458](https://github.com/bcgov/renovate-config/issues/458)
- [Renovate schedule:officeHours](https://docs.renovatebot.com/presets-schedule/#scheduleofficehours)

## Related ADRs

- Extends [ADR-0001](0001-record-architecture-decisions.md) (non-trivial configuration decision).
