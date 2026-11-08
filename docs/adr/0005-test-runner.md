# 0005: Test runner

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-11-08 |
| **Milestone** | M0 |
| **Requirements** | R03, R30 |

## Context

We need one test runner for unit tests (M0/M1) and integration tests with real infrastructure through Testcontainers (M4). NestJS relies on **decorator metadata** (`emitDecoratorMetadata`) for dependency injection, so whichever transpiler the runner uses must emit that metadata. Otherwise DI breaks in tests.

## Decision drivers

- Fast feedback (watch mode, parallelism)
- Correct NestJS decorator metadata in tests
- Good TypeScript and ESM support
- Built-in coverage with thresholds
- Supports separate unit and integration projects/configs

## Options considered

### Option A: Vitest + `unplugin-swc`
- ✅ Very fast startup and watch mode (Vite-based, on-demand transforms)
- ✅ Jest-compatible API (`describe/it/expect/vi.fn`), so the learning cost is low
- ✅ Native TS/ESM; built-in V8 coverage with thresholds
- ✅ `projects` support for separate unit and integration configs (different timeouts, setup files)
- ✅ The NestJS docs include an official Vitest + SWC recipe
- ❌ Needs `unplugin-swc`, because esbuild (Vite's default) doesn't emit decorator metadata
- ❌ Fewer NestJS-specific examples online than Jest

### Option B: Jest + `@swc/jest`
- ✅ The NestJS CLI default; most tutorials and examples use it
- ✅ Mature ecosystem
- ❌ Slower startup and watch, even with SWC
- ❌ ESM support is still awkward
- ❌ Module mocking and config (moduleNameMapper for path aliases) are more verbose

### Option C: Node's built-in test runner (`node:test`)
- ✅ Zero dependencies
- ❌ No built-in TS transform with decorator metadata; weaker mocking, coverage thresholds and DX

## Decision

**Chosen: Option A, Vitest with `unplugin-swc`.** It's the fastest option, has good DX and handles ESM well. Its one gap (decorator metadata) is solved by a documented plugin. SWC is also the build compiler (ADR 0006), so tests and production use the same transpiler.

## Consequences

- Positive: fast TDD loop; one runner for unit and integration tests; same transpiler as the build.
- Negative: adopters who know Jest need a short adjustment (mostly `jest.fn` → `vi.fn`).
- Follow-ups: M0 sets up the unit project and coverage thresholds; M4 adds an integration project using Testcontainers.
