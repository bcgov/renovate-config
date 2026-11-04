# 1. Record Architecture Decisions

Date: 2026-11-04

## Status

Accepted

## Context

We need a record of architectural and configuration decisions affecting `bcgov/renovate-config` presets (`default.json`) and associated repository workflows. Downstream repositories rely on these configurations across the organization, making it important to document the context, rationale, and consequences of significant configuration decisions.

Decisions prior to November 2026 are captured in git commit history and inline configuration comments. Reconstructing past decisions retroactively from memory or guesswork is unreliable and should be avoided.

## Decision

We will use Architectural Decision Records (ADRs) to document significant changes and policy decisions for `bcgov/renovate-config`.

- ADRs are stored as markdown files in `docs/adr/` using sequential numbering (`0001-record-architecture-decisions.md`, `0002-...`).
- Contributors and automated assistants should add an ADR when introducing architectural shifts or non-trivial configuration changes.
- Routine maintenance, regex adjustments, and minor dependency grouping tweaks do not strictly require an ADR when inline comments or PR descriptions suffice.
- Historical decisions prior to this record remain documented in git history and inline comments and will not be retroactively backfilled.

## Consequences

- Downstream teams and maintainers have a clear, documented record of configuration policy decisions.
- Contributors know why specific defaults and behaviors are configured.
- Minimal friction: ADR creation is recommended for configuration changes but does not block routine maintenance.
