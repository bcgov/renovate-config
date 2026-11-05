# 2. Quiet Weekend Window for Renovate PR Creation

- Status: Accepted
- Deciders: Repository Maintainers (@bcgov/renovate-config CODEOWNERS)
- Date: 2026-11-05

## Context

`bcgov/renovate-config` presets previously allowed Renovate to open pull requests (regular dependency updates and security/vulnerability updates) at any time, including weekends. Weekend PRs create notification noise for maintainers and leave updates sitting unreviewed until the next weekday.

## Rationale

Pausing PR creation from Friday 17:00 to Monday 00:00 gives teams a quiet weekend while still allowing updates on weekday evenings, so throughput stays high without weekend alert fatigue.

## Assumptions

- Downstream consumers of `default.json` benefit from a predictable quiet weekend.
- Weekday evening PRs are acceptable; only the weekend needs to be quiet.
- Urgent CVEs disclosed over a weekend can still be handled manually when needed.
- `timezone: America/Vancouver` remains the correct reference across consumers.

## Options Considered

- **Option 1: Status quo (PR creation enabled 24/7)**
  - *Trade-offs*: Maximum automation frequency, but weekend notification noise and stale queues.
- **Option 2: Quiet weekend for regular updates only; keep security updates 24/7**
  - *Trade-offs*: Faster security response on weekends, but advisory PRs still disrupt downtime.
- **Option 3: Quiet weekend for both regular and security updates (Chosen)**
  - *Trade-offs*: Quiet weekends for all automated PRs; Friday-evening/weekend CVEs wait until Monday 00:00 for automated PRs.

Office hours (`schedule:officeHours`, weekdays 08:00–17:59) was considered and rejected as too restrictive: weekday evenings are fine, only the weekend needs to be quiet.

## Decision

Set a top-level `schedule` in `default.json` (timezone `America/Vancouver`):

```json
"schedule": [
  "* * * * 1-4",
  "* 0-16 * * 5"
]
```

Mon–Thu all day and Friday through 16:59; no PR creation from Friday 17:00 to Monday 00:00. Regular and security/vulnerability updates share this schedule. The array contains only cron expressions (preset names are not valid inside `schedule`). Lock file maintenance keeps its own weekly schedule from `:maintainLockFilesWeekly`.

## Consequences

### Positive
- Eliminates weekend notification fatigue for maintainers and downstream owners.
- Keeps weekday (including evening) throughput unchanged.

### Negative / Trade-offs
- Security advisories disclosed Friday evening or over the weekend wait until Monday for automated PRs (manual intervention remains available for critical cases).
- Monday may see a burst of updates that accumulated over the weekend.

## References

- [Issue #458](https://github.com/bcgov/renovate-config/issues/458)
- [Renovate schedule configuration](https://docs.renovatebot.com/configuration-options/#schedule)

## Related ADRs

- Extends [ADR-0001](0001-record-architecture-decisions.md) (non-trivial configuration decision).
