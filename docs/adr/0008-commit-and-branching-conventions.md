# 0008: Commit and branching conventions

|                  |               |
| ---------------- | ------------- |
| **Status**       | Accepted      |
| **Date**         | 2026-11-08    |
| **Milestone**    | M0            |
| **Requirements** | R02, R43, R50 |

## Context

A readable history makes reviews and releases easier, and later allows automated changelogs and semantic versioning (M9). Local hooks catch problems before they reach CI.

## Decision drivers

- A consistent, machine-readable commit history
- Problems caught locally, fast (before push)
- A simple branching model that fits milestone-based delivery

## Options considered

### Commit format

- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`, `build:`, with an optional `(scope)`)
  - ✅ Industry standard; enables automated changelogs and semver (M9)
  - ✅ Scopes map naturally to modules (`feat(orders): …`)
  - ❌ Small learning cost; enforced by commitlint
- **Free-form**
  - ✅ No friction
  - ❌ No automation possible; inconsistent history

### Local enforcement

- **Husky + lint-staged + commitlint**
  - ✅ Standard JS-ecosystem setup; runs lint/format only on staged files (fast)
  - ✅ `commit-msg` hook rejects non-conventional messages
  - ❌ Hooks can be skipped with `--no-verify`, so CI re-runs every check
- **lefthook**
  - ✅ A single fast binary; parallel hooks
  - ❌ Less familiar in the Node ecosystem; one more tool to learn
- **No hooks (CI only)**
  - ❌ Slow feedback; noisy fix-up commits

### Branching strategy

- **GitHub Flow**: `main` is the only long-lived branch and is always deployable. Work happens on a branch, goes through a PR (CI + review), is merged to `main`, and the branch is deleted.
  - ✅ Simple, widely known; fits continuous delivery to multiple environments
  - ✅ Built-in review step through PRs
  - ❌ Needs a discipline that `main` is always deployable (feature flags / testing before merge, see the release strategy note below)
- **Strict trunk-based development**: commit straight to `main` or use branches that live less than a day
  - ✅ Fastest integration; no merge pain
  - ❌ Assumes very strong test automation and experienced teams; weak review step
- **GitFlow** (`main`, `develop`, `release/*`, `hotfix/*`)
  - ✅ Explicit release stabilization; suits versioned products (mobile apps, libraries)
  - ❌ Heavyweight for a continuously deployed backend; fixes applied to several branches; slow integration
- **Environment branches** (`staging`, `production` branches with selective promotion)
  - ❌ Branches drift apart; production runs code combinations never tested together. Considered an anti-pattern.

### Branch size (within GitHub Flow)

- **One branch per milestone** (`feat/mN-<name>`, one PR)
  - ✅ Keeps a milestone's decisions, code and docs together as one reviewable unit; commits inside the PR still show each slice
  - ❌ Larger PRs
- **One branch per slice** (several small PRs per milestone)
  - ✅ Smaller, easier reviews; "purer" GitHub Flow
  - ❌ `main` receives partial milestones

## Decision

**Chosen:**

- **Conventional Commits**, enforced by **commitlint** (`@commitlint/config-conventional`).
- **Husky** hooks: `pre-commit` runs lint-staged (ESLint `--fix` + Prettier on staged files); `commit-msg` runs commitlint.
- **GitHub Flow**: one branch per milestone (`feat/mN-<name>`), or per topic for work outside milestones (`fix/<topic>`, `docs/<topic>`), merged to `main` through a reviewed PR with green CI. Large milestones (for example M3, M4) may be split into per-slice branches if the PR gets too big.

### Release strategy (decided later)

GitHub Flow requires that **whatever is on `main` is safe to deploy to production**. How a merged but unapproved feature is kept away from production users is a release-strategy question, decided in an M9 ADR. The intended direction:

- **Feature flags** (R50, M7): merge and deploy early, release by switching the flag on, per environment and gradually.
- **Testing before merge** on preview or staging environments for smaller changes.
- **Revert** as the emergency fallback.
- Not used: environment branches and cherry-picked release branches.
- Supporting rule (R28, M4): DB migrations must be backward compatible (expand and contract), because code behind a disabled flag still deploys its migrations.

## Consequences

- Positive: a clean, automatable history; fast local feedback.
- Negative: hooks add a second or two per commit; `--no-verify` can bypass them, but CI still blocks the merge.
- Follow-ups: M9 adds automated release notes and versioning based on the commit types.
