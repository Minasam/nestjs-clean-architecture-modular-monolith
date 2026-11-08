# 0002: Repository layout

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-11-08 |
| **Milestone** | M0 |
| **Requirements** | R01, R06, R07, R09, R45 |

## Context

The physical layout of the repo decides:
- how **module boundaries** are enforced (R09),
- how easily a module can be **extracted into a microservice** (R06),
- how we produce **separate API and worker deployments** from the same code (R45),
- how much build and tooling overhead every developer pays daily.

Clean architecture (R07) governs layers *inside* a module. This ADR is about how modules and apps are arranged in the repo.

## Decision drivers

1. Strong, automatically enforced boundaries between modules
2. Low friction when extracting a module into its own service
3. Low tooling overhead (simple builds, fast feedback, easy to understand for people adopting the template)
4. Support for multiple runtime entrypoints (HTTP API, workers, cron)

## Options considered

### Option A: Single NestJS app, folder per module, boundaries enforced by lint
```
src/
  main.ts                 # API entrypoint (worker.ts added in M5)
  app.module.ts
  shared/                 # shared kernel + technical building blocks
  modules/
    <module>/
      domain/ application/ infrastructure/ presentation/
      <module>.module.ts
      public-api.ts       # the only file other modules may import
```
- ✅ Simplest setup: one `package.json`, one tsconfig, one build
- ✅ Fastest feedback loop (single SWC build, single test run)
- ✅ Multiple entrypoints are just extra `main` files bootstrapping different root modules
- ✅ Boundaries enforced by `eslint-plugin-boundaries` / dependency-cruiser in CI (M1)
- ❌ Isolation is enforced by a rule, not by the compiler. A misconfigured rule lets violations through.
- ❌ All modules share one dependency set; per-module dependency versions aren't possible

### Option B: pnpm workspaces (one package per module)
```
apps/api  apps/worker
packages/shared-kernel  packages/<module>   # each with its own package.json
```
- ✅ Physical isolation: a module can only import packages it declares
- ✅ Extraction is close to "move the package and add an app"
- ❌ Build orchestration needed (TS project references, build order, watch mode across packages)
- ❌ Much more config per module (package.json, tsconfig, test config); harder for adopters
- ❌ Slower dev loop; hot reload across packages is fiddly

### Option C: Nest CLI monorepo mode (`apps/` + `libs/`)
- ✅ Built into the Nest CLI, no extra tools; multiple apps supported natively
- ✅ A lib per module, with path aliases
- ❌ Isolation still relies on lint (same as A), with more config (`nest-cli.json` projects, per-app tsconfigs)
- ❌ Defaults to webpack bundling per app, which differs from the standard Nest build

### Option D: Nx workspace
- ✅ Best-in-class boundary enforcement (`@nx/enforce-module-boundaries` with tags), affected-only CI, caching
- ✅ Generators for new modules
- ❌ Heavy dependency and its own learning curve; the template becomes an Nx template
- ❌ Version upgrades tied to Nx's release cadence

## Decision

**Chosen: Option A.** A single NestJS app with a folder per module and lint-enforced boundaries.

Reasoning:
- The *logical* contract between modules (a facade in `public-api.ts`, versioned integration events) is what makes extraction easy, not the physical package boundary. When a module is extracted, its facade gets an HTTP/gRPC adapter and its events go through the broker. The folder layout doesn't change that work.
- Lint-based boundary rules run in CI and the pre-commit hook, so violations are blocked before merge. That's close to compiler-level safety at a fraction of the cost.
- It keeps the template approachable and the dev loop fast.

Escape hatch: if physical isolation becomes necessary (for example many teams or a very large codebase), moving each `src/modules/<module>` into its own workspace package is mechanical, because the boundaries were enforced from day one.

## Consequences

- Positive: minimal tooling; fast builds and tests; one place to configure everything.
- Negative: boundary safety depends on lint rules being correct and enforced. M1 includes a test proving a deliberate violation fails.
- Follow-ups: M1 defines the boundary rules and the module folder conventions. M5 adds the worker entrypoint.
