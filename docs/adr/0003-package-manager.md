# 0003: Package manager

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-11-08 |
| **Milestone** | M0 |
| **Requirements** | R01 |

## Context

The package manager affects install speed (locally and in CI), lockfile reliability, Docker image builds, and whether code can import packages it never declared ("phantom dependencies").

## Decision drivers

- Reproducible installs (lockfile, pinned package-manager version)
- Fast CI and Docker builds
- Strictness: undeclared dependencies should fail
- Low setup friction for people adopting the template

## Options considered

### Option A: pnpm
- ✅ Strict `node_modules` layout: undeclared (phantom) dependencies fail to resolve
- ✅ Fast installs and a content-addressable store, so less disk use and good CI caching
- ✅ First-class workspaces if we ever move to ADR 0002 Option B
- ✅ Version pinned through `packageManager` in `package.json` and activated by **corepack**, which ships with Node
- ❌ Needs `corepack enable` once (or a pnpm install)
- ❌ The strict layout occasionally breaks badly-packaged libraries (fixable with `publicHoistPattern`)

### Option B: npm
- ✅ Comes with Node; zero setup; most familiar
- ❌ Flat `node_modules` allows phantom dependencies
- ❌ Slower installs; weaker monorepo ergonomics

### Option C: Yarn (Berry)
- ✅ Fast; Plug'n'Play gives strictness
- ❌ PnP is incompatible with some tooling; `nodeLinker: node-modules` loses the strictness
- ❌ Smaller share of the NestJS ecosystem

### Option D: Bun (as package manager)
- ✅ Very fast installs
- ❌ Running Nest on Node while installing with Bun adds a second toolchain; less mature lockfile and CI story

## Decision

**Chosen: Option A, pnpm,** pinned in `package.json` (`"packageManager": "pnpm@<version>"`) and enabled with `corepack enable`.

## Consequences

- Positive: strict, fast, reproducible installs; easy CI caching.
- Negative: contributors run `corepack enable` once; this is documented in the README.
- Follow-ups: the Dockerfile (M2) and CI (ADR 0009) use corepack-pinned pnpm with `--frozen-lockfile`.
