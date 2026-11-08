# 0003: Package manager

|                  |            |
| ---------------- | ---------- |
| **Status**       | Accepted   |
| **Date**         | 2026-11-08 |
| **Milestone**    | M0         |
| **Requirements** | R01        |

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

## Amendment 1 (2026-11-08): how pnpm is installed (Status: Accepted)

**What changed:** while installing Node 26 (ADR 0004), we found that **Node 25+ no longer bundles corepack**. A fresh Node 26.13.0 install contains only `node`, `npm` and `npx`. The decision (pnpm) is unchanged; only the installation mechanism above is affected.

**Options:**

| Option                               | How                                                                                                                                                                         | Pros                                                                                   | Cons                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **A: pnpm's own version management** | Install pnpm once (`npm install -g pnpm`). pnpm reads `"packageManager": "pnpm@x.y.z"` in `package.json` and automatically switches to that exact version for this project. | No extra tool; pnpm officially supports this; the version is still pinned for everyone | Needs one global install of pnpm (any version)                                            |
| B: corepack as a separate package    | `npm install -g corepack && corepack enable`                                                                                                                                | Same behaviour as before                                                               | One more tool to install; corepack was dropped from Node core and its future is uncertain |
| C: pnpm standalone installer         | `curl -fsSL https://get.pnpm.io/install.sh \| sh -`                                                                                                                         | Doesn't need npm                                                                       | Runs a remote script; per-OS differences                                                  |

CI uses `pnpm/action-setup`, which reads the `packageManager` field directly with any option. The Dockerfile (M2) installs the pinned version with `npm install -g pnpm@<version>`.

**Chosen: Option A.** Developers run `npm install -g pnpm` once; the `packageManager` field still guarantees everyone runs the same pnpm version.

## Note (2026-11-08): dependency install scripts are blocked by default

pnpm does **not** run dependencies' install scripts (`postinstall` and so on) unless they are explicitly approved. This is a supply-chain protection, because install scripts are a common malware vector. Approved packages are listed in `pnpm-workspace.yaml` under `allowBuilds` (added with `pnpm approve-builds <pkg>`); every addition is reviewed in its PR.

Currently approved: `@swc/core` (sets up its native binary).
