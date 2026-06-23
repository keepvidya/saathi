# ADR-0001 — Record architecture decisions

- **Status**: Accepted
- **Date**: 2026-06-23

## Context
We need a durable, reviewable trail of significant technical decisions so the rationale survives and changes are deliberate (per the Plan→Document→Execute mandate).

## Decision
We use lightweight **Architecture Decision Records** (Michael Nygard format) in `docs/adr/NNNN-title.md`. One ADR per significant decision. ADRs are immutable once Accepted; a later ADR supersedes an earlier one (cross-linked). Any change to the Engineering Protocol or Architecture requires an ADR.

## Consequences
- Decisions are discoverable and auditable in version control.
- PRs that change architecture must include/append an ADR (checked in review).
