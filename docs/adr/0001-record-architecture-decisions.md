# 1. Record Architecture Decisions

- Status: Accepted
- Deciders: Repository Maintainers (@bcgov/renovate-config CODEOWNERS)
- Date: 2026-11-04

## Context

We need a structured method to record architectural and configuration decisions affecting `bcgov/renovate-config` presets (`default.json`) and associated repository workflows. Downstream repositories rely on these configurations across the organization, making it important to document the context, rationale, and consequences of significant configuration decisions.

Decisions prior to November 2026 are captured in git commit history and inline configuration comments. Reconstructing past decisions retroactively from memory or guesswork is unreliable and should be avoided.

## Rationale

Documenting architectural decisions ensures long-term maintainability and transparent governance across the organization. As maintainers rotate and automation evolves, written records prevent re-debating settled designs and provide downstream teams with clear explanations of why specific rules and policies exist.

## Assumptions

- Maintainers and contributors have visibility into downstream consumption patterns through issues and pull requests.
- Lightweight markdown files in the repository provide sufficient discoverability without requiring external documentation tooling.
- Routine dependency updates and regex fixes do not require full architectural review.

## Options Considered

- **Option 1: Status quo (Git history and inline comments only)**
  - *Trade-offs*: Low overhead, but context is fragmented across closed PRs, commit messages, and disparate inline JSON comments.
- **Option 2: Mandatory ADR check in CI for every change**
  - *Trade-offs*: Guarantees documentation, but severely impedes routine maintenance, security hotfixes, and minor regex tuning with unnecessary process friction.
- **Option 3: Repository-local ADRs for non-trivial changes alongside standard template (Chosen)**
  - *Trade-offs*: Provides standardized structure and governance for meaningful changes while keeping routine maintenance friction-free.

## Decision

We will use Architectural Decision Records (ADRs) to document significant changes and policy decisions for `bcgov/renovate-config`.

- ADRs are stored as markdown files in `docs/adr/` using sequential numbering (`0001-record-architecture-decisions.md`, `0002-...`).
- New records follow [`docs/adr/template.md`](file:///var/home/derek/Repos/renovate-config/docs/adr/template.md).
- Each ADR must specify the accountable group or role in its header (`Deciders:` e.g., Repository Maintainers, DevOps Platform Team).
- Contributors and automated assistants should add an ADR when introducing architectural shifts or non-trivial configuration changes.
- Routine maintenance, regex adjustments, and minor dependency grouping tweaks do not strictly require an ADR when inline comments or PR descriptions suffice.
- Historical decisions prior to this record remain documented in git history and inline comments and will not be retroactively backfilled.

## Consequences

### Positive
- Downstream teams and maintainers have a clear, documented record of configuration policy decisions.
- Future contributors and agents understand why specific defaults and behaviors are configured.
- Structured sections (Rationale, Assumptions, Options Considered, Consequences, References, Related ADRs) ensure thorough evaluation of major changes.

### Negative / Trade-offs
- Slight additional authoring overhead when proposing major configuration or workflow changes.

## References

- [MADR (Markdown Architectural Decision Records)](https://adr.github.io/madr/)
- [Pull Request #456](https://github.com/bcgov/renovate-config/pull/456)

## Related ADRs

- None (Initial ADR).
