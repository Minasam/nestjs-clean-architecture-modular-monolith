# 0010: Claude Code project setup

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-11-08 |
| **Milestone** | M0 |
| **Requirements** | R04 |

## Context

This template is developed with Claude Code, and adopters are likely to use AI assistants too. Without project-level guidance, an assistant starts every session knowing nothing about the architecture rules, conventions and workflow. It may break boundaries, pick different libraries, or skip the ADR process. Claude Code reads:
- **`CLAUDE.md`** (repo root): instructions loaded into every session
- **`.claude/settings.json`** (committed, shared by the team): permissions and **hooks**, which are shell commands the harness runs automatically on events such as after a file edit
- **`.claude/settings.local.json`** (git-ignored): personal overrides
- **`.claude/skills/`**: reusable, on-demand procedures (for example "scaffold a new module")

## Decision drivers

- The assistant consistently follows the architecture rules and the milestone/ADR workflow
- Quality checks run automatically, not by relying on the assistant remembering
- Fewer permission prompts for safe, read-only or project-script commands
- Shared and versioned with the repo; personal settings stay local

## Options considered

### Option A: `CLAUDE.md` only
- ✅ Simplest; guidance in one file
- ❌ Guidance isn't enforcement: formatting and linting depend on the assistant remembering
- ❌ Every `pnpm` command prompts for permission

### Option B: `CLAUDE.md` + `.claude/settings.json` (permissions + hooks)
- ✅ A `PostToolUse` hook (after Edit/Write) runs Prettier and `eslint --fix` on the edited file, so every AI edit is formatted and lint-checked automatically. Lint errors are fed back to the assistant.
- ✅ The permission allowlist covers project scripts (`pnpm lint/test/typecheck/build/format`) and read-only git commands
- ✅ Deny rules for dangerous commands (for example reading `.env*` secrets files, force pushes)
- ❌ A bit more config to maintain; the hook script must be fast

### Option C: Option B + project skills now
- ✅ Encodes repeatable procedures (new module, new ADR)
- ❌ Premature: the module structure doesn't exist until M1, so skills written now would be rewritten

## Decision

**Chosen: Option B now; add skills when the patterns exist** (for example a `new-module` skill in M1 and an `adr` skill whenever useful).

Contents:
- **`CLAUDE.md`**: project purpose; layout; architecture rules (summarized, linking to ADRs); commands; workflow (milestone docs in `docs/milestones/`, decisions as ADRs written before code, conventional commits, branch per milestone); "read the relevant ADRs before changing an area; propose a new ADR rather than deviating from one."
- **`.claude/settings.json`**:
  - `permissions.allow`: `pnpm lint*`, `pnpm format*`, `pnpm typecheck`, `pnpm test*`, `pnpm build`, `git status`, `git diff*`, `git log*`
  - `permissions.deny`: reading `.env` / `.env.*` (except `.env.example`), `git push --force*`
  - `hooks.PostToolUse` (matcher `Edit|Write`) → `.claude/hooks/format-lint.sh`, which formats and lints only the edited `.ts` file
- **`.gitignore`**: `.claude/settings.local.json`

## Consequences

- Positive: consistent AI-assisted changes; formatting and lint issues fixed at edit time; fewer interruptions.
- Negative: the hook adds about a second per edit; the settings need maintenance as scripts change.
- Follow-ups: M1 adds a `new-module` skill once the module template exists.
