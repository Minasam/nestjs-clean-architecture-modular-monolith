# 0007: Lint and format tooling

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-11-08 |
| **Milestone** | M0 |
| **Requirements** | R02, R09 |

## Context

We need consistent formatting and static analysis. Linting matters more here than usual: in M1, **architecture boundaries** (R09) will be enforced by lint rules. So the linter must support boundary plugins and **type-aware** rules (for example catching floating promises, which are a common source of bugs in async NestJS code).

## Decision drivers

- Type-aware rules (`no-floating-promises`, `no-misused-promises`, strict boolean checks)
- Plugin support for architecture boundaries (`eslint-plugin-boundaries` or similar)
- Fast enough for pre-commit (on staged files only)
- Industry-standard configuration that adopters already know

## Options considered

### Option A: ESLint (flat config) + `typescript-eslint` (strict-type-checked) + Prettier
- ✅ Type-aware rules through `typescript-eslint`
- ✅ Huge plugin ecosystem, including `eslint-plugin-boundaries` and `eslint-plugin-import` for M1
- ✅ Prettier handles formatting, so ESLint can focus on correctness (`eslint-config-prettier` turns off conflicting rules)
- ❌ Two tools; type-aware linting is slower (fine with lint-staged on changed files)

### Option B: Biome (lint + format)
- ✅ Very fast single binary; one config
- ❌ No full type-aware rule set comparable to typescript-eslint
- ❌ No plugin equivalent to `eslint-plugin-boundaries`, so we'd still need ESLint or dependency-cruiser for R09

### Option C: ESLint for both linting and formatting (stylistic rules)
- ✅ One tool
- ❌ Slower and less consistent formatting than Prettier; stylistic rules are deprecated in ESLint core

## Decision

**Chosen: Option A.** ESLint flat config with `typescript-eslint` strict-type-checked plus stylistic presets, `eslint-config-prettier`, and Prettier for formatting.

## Consequences

- Positive: catches real async bugs; ready for boundary rules in M1; familiar to most TS developers.
- Negative: slower full-repo lint than Biome; mitigated by lint-staged and caching.
- Follow-ups: M1 adds boundary rules, plus a test that a deliberate violation fails lint.
