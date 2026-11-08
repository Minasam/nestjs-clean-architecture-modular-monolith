# 0006: Build and compilation

|                  |            |
| ---------------- | ---------- |
| **Status**       | Accepted   |
| **Date**         | 2026-11-08 |
| **Milestone**    | M0         |
| **Requirements** | R01, R13   |

## Context

The NestJS CLI can compile with `tsc` (default), **SWC** (`--builder swc`) or webpack. Compilation speed drives dev hot reload (R13) and CI time. Type checking can be done separately from transpiling.

TypeScript 7 (the native Go port, currently `7.0.x`) is now the latest major. Its support for the legacy `experimentalDecorators` / `emitDecoratorMetadata` options that NestJS depends on must be checked. Splitting "transpile" from "typecheck" keeps us safe either way.

## Decision drivers

- Fast dev rebuilds and hot reload
- Correct decorator metadata output
- Strict type checking in CI and pre-commit
- The same transpiler for build and tests (ADR 0005)

## Options considered

### Option A: SWC for transpiling + `tsc --noEmit` for type checking

- ✅ SWC is around 10–20× faster than `tsc` for transpiling; much faster `start:dev`
- ✅ Supported by the Nest CLI (`"builder": "swc"`, `typeCheck` optional)
- ✅ Same transpiler as Vitest (via `unplugin-swc`)
- ✅ Type checking runs as its own `typecheck` script (CI, pre-push, editor)
- ❌ Two tools to configure (`.swcrc` and `tsconfig.json`)
- ❌ SWC doesn't type-check, so type errors only surface in `typecheck`, the IDE, or `start:dev` with `--type-check`

### Option B: `tsc` only (Nest default)

- ✅ One tool, with type errors at build time
- ❌ Slow rebuilds as the codebase grows (felt in a modular monolith)

### Option C: webpack bundling

- ✅ A single bundle file; supports HMR
- ❌ Extra config and complexity; harder debugging; bundling isn't needed in a container

## Decision

**Chosen: Option A.** SWC transpiles; `tsc` type-checks.

Note: SWC itself cannot type-check (its experimental checker was abandoned). The Nest CLI `--type-check` flag runs `tsc` in a parallel background process alongside the SWC build.

| Where                            | What runs                             | Why                                                        |
| -------------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| `pnpm start:dev`                 | SWC (watch) + Nest CLI `--type-check` | Fast restarts; type errors also appear in the dev terminal |
| `pnpm typecheck`, pre-commit, CI | `tsc --noEmit`                        | The authoritative gate before commit or merge              |
| `pnpm build` (production)        | SWC only                              | Already type-checked by the gate above                     |

**TypeScript version (verified in B1, 2026-11-08): pinned to `~6.0.3`.**

- TypeScript **7.0.2** (latest) was tried first and rejected: the Nest CLI fails with _"TypeScript 7.0 ships the `tsc` executable only; the compiler API is expected to return in 7.1. Please install TypeScript 6"_. TS 7 also removed `baseUrl`.
- With TS 6: `tsc --noEmit` passes, `nest build` (SWC) compiles, the app boots, and a constructor-injection check (`@Injectable` provider injected into another) resolves correctly, confirming SWC emits decorator metadata.
- TS 6 no longer includes `@types/*` packages automatically, so `tsconfig.json` sets `"types": ["node"]` explicitly.
- Revisit when TypeScript 7.1 ships the compiler API and the Nest CLI supports it (Dependabot will propose the bump; CI verifies it).

## Consequences

- Positive: fast dev loop and builds; strict types are still enforced.
- Negative: the production build alone does not catch type errors; that is covered by `start:dev --type-check`, the IDE, pre-commit and CI.
- Follow-ups: `start:dev` uses SWC with watch mode and `--type-check`; the Docker dev setup (M2) reuses it for hot reload.
