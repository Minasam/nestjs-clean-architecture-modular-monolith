# 0001: Record architecture decisions

|                  |            |
| ---------------- | ---------- |
| **Status**       | Accepted   |
| **Date**         | 2026-11-08 |
| **Milestone**    | M0         |
| **Requirements** | R05        |

## Context

This repository is a template for complex projects. People adopting it need to know not only _what_ was built but _why_: which alternatives were rejected and which trade-offs were accepted. Without that record, decisions get re-argued, or reversed by someone who doesn't know the original constraints. Work is also done in sessions with an AI assistant that has no memory between sessions unless the reasoning is written down.

## Decision drivers

- The reasoning must be reviewable before code is written.
- It must live with the code and be versioned with it.
- It must be lightweight enough to write for every significant choice.

## Options considered

### Option A: ADRs in the repo (MADR-style Markdown)

- ✅ Versioned with the code; reviewed in the same PR as the change
- ✅ Well-known format (Nygard / MADR); tooling is optional
- ✅ Readable by both humans and AI assistants in every session
- ❌ Needs discipline to keep up to date

### Option B: External wiki (Confluence, Notion, GitHub Wiki)

- ✅ Rich editing; easy for non-developers
- ❌ Drifts from the code; not part of the PR review
- ❌ Not shipped with the template to people who adopt it

### Option C: No formal records (commit messages, PR descriptions)

- ✅ Zero overhead
- ❌ Reasoning is scattered and hard to find; alternatives are rarely recorded

## Decision

**Chosen: Option A.** Use MADR-style ADRs in `docs/adr/`, numbered sequentially, with the status lifecycle `Proposed → Accepted → (Superseded | Deprecated)`. Each milestone also has a plan document in `docs/milestones/` that links to its ADRs.

## Consequences

- Positive: every trade-off is visible and reviewable; the template ships with its reasoning.
- Negative: there's some writing overhead per decision. Small, obvious choices don't need an ADR.
- Follow-ups: `CLAUDE.md` (ADR 0010) tells the assistant to read the relevant ADRs before changing an area, and to propose a new ADR rather than silently deviating from one.
