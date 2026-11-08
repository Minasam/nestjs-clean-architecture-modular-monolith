# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this is

A production-grade **NestJS template**: a **modular monolith** with **clean architecture**, where any module can later be extracted into a microservice. It's built milestone by milestone (M0–M10).

- **What** must be built, and when: [`docs/requirements.md`](docs/requirements.md)
- **Why** each choice was made: [`docs/adr/`](docs/adr/README.md). Read the relevant ADR before changing an area.
- **Current milestone plan**: [`docs/milestones/`](docs/milestones/)

## Workflow rules (always follow)

1. **Decide in documents first.** Every non-trivial choice is written as an ADR in `docs/adr/` (options, pros and cons, recommendation) with status `Proposed`, and the user accepts it **before** any code is written. Small, obvious choices are recorded in the milestone plan instead (ADR 0001).
2. **Plan each milestone** in `docs/milestones/MN-<name>.md` (scope, slices, definition of done) before implementing.
3. **Never silently deviate from an accepted ADR.** If one seems wrong or outdated, propose an amendment or a new superseding ADR.
4. **One branch per milestone** (`feat/mN-<name>`), GitHub Flow, merged to `main` through a reviewed PR with green CI (ADR 0008).
5. **Commit each slice** once its checks pass, using **Conventional Commits** (`feat:`, `fix:`, `docs:`, `build:`, `test:`, `ci:`, `chore:`, `refactor:`, optional `(scope)`). **No AI attribution lines** in commits or PRs. Merge to `main` and push only when the user asks.
6. **Report results honestly.** Run the checks and state real results, including failures.
7. Explain concepts in plain language when the user asks; the user isn't a TypeScript/Node tooling expert.

## Commands

Requires **Node 26** (`nvm use` reads `.nvmrc`) and **pnpm** (`npm install -g pnpm`; the version is pinned by `packageManager`).

| Command                                           | Purpose                                              |
| ------------------------------------------------- | ---------------------------------------------------- |
| `pnpm install`                                    | Install dependencies (also installs git hooks)       |
| `pnpm start:dev`                                  | Run with SWC watch mode and background type checking |
| `pnpm build`                                      | Production build (SWC) to `dist/`                    |
| `pnpm lint` / `pnpm lint:fix`                     | ESLint (type-aware)                                  |
| `pnpm format` / `pnpm format:check`               | Prettier                                             |
| `pnpm typecheck`                                  | `tsc --noEmit` (the authoritative type gate)         |
| `pnpm test` / `pnpm test:watch` / `pnpm test:cov` | Vitest (coverage thresholds 80%)                     |

Before declaring work done: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:cov && pnpm build`.

## Architecture (target, built from M1 onward; ADR 0002)

```
src/
  main.ts                  # API entrypoint (worker entrypoint added in M5)
  app.module.ts            # root module: registers feature modules
  shared/                  # shared kernel + technical building blocks
  modules/<module>/
    domain/                # entities, value objects, domain events; NO framework imports
    application/           # use cases; depends only on domain (+ ports)
    infrastructure/        # DB, external APIs, adapters implementing ports
    presentation/          # HTTP controllers, DTOs
    <module>.module.ts
    public-api.ts          # the ONLY file other modules may import (facade + contracts)
```

Rules (enforced by lint from M1):

- Modules talk to each other **only** through `public-api.ts` (sync) or integration events (async, M5). Never import another module's internals.
- `domain/` must not import NestJS, the ORM or any infrastructure.
- No cross-module database foreign keys; each module owns its schema (M4).

## Tooling facts (and gotchas)

- **TypeScript is pinned to `~6.0.3`.** TS 7.0 lacks the compiler API the Nest CLI needs (ADR 0006). Don't bump it without checking.
- **SWC** compiles (build, dev, tests via `unplugin-swc`); `tsc` only type-checks. A test guards that decorator metadata (DI) works.
- **pnpm blocks dependency install scripts.** Approve one only when it's needed: `pnpm approve-builds <pkg>` (recorded in `pnpm-workspace.yaml`; ADR 0003).
- Imports use the `.js` extension for relative paths (`./app.module.js`), as `nodenext` module resolution requires.
- `.claude/hooks/format-lint.sh` runs after every Edit/Write: Prettier + `eslint --fix`; remaining lint errors are reported back. Fix them; don't disable rules to silence them.
- Secrets: never read or commit `.env` files (only `.env.example`). See ADR 0009 for the secret-scanning layers.
