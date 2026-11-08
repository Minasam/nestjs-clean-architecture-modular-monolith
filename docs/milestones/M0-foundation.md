# M0: Foundation and Tooling

| | |
|---|---|
| **Status** | Phase A done (all ADRs accepted); Phase B in progress |
| **Branch** | `feat/m0-foundation` |
| **Requirements** | R01, R02, R03 (runner), R04, R05, R43 (basic CI), R44 (CI security checks); see [requirements](../requirements.md) |
| **Depends on** | – |

## 1. Goal

Set up the project foundation that every later milestone builds on: a strict TypeScript NestJS app, quality gates, a unit-test runner, Claude Code project setup, documentation conventions and a basic CI pipeline. No business or architecture code yet; that starts in M1.

## 2. Approach

M0 runs in two phases:

1. **Phase A: Decide.** Every non-trivial choice is written up as an ADR with the options, trade-offs and a recommendation. The ADRs start as `Proposed`. Once reviewed, each becomes `Accepted` (possibly with a different choice).
2. **Phase B: Implement.** Build according to the accepted ADRs, in small slices with one commit each.

No code is written until every Phase A ADR is accepted.

## 3. Phase A: Decisions

| ADR | Decision | Recommendation | Status |
|---|---|---|---|
| [0001](../adr/0001-record-architecture-decisions.md) | Record architecture decisions | MADR-style ADRs in `docs/adr/` | Accepted |
| [0002](../adr/0002-repository-layout.md) | Repository layout | Single NestJS app, folder per module, lint-enforced boundaries | Accepted |
| [0003](../adr/0003-package-manager.md) | Package manager | pnpm (installed with npm, version pinned by `packageManager`; Amendment 1) | Accepted |
| [0004](../adr/0004-nodejs-runtime-version.md) | Node.js version | Node 26 (Active LTS) | Accepted |
| [0005](../adr/0005-test-runner.md) | Test runner | Vitest + unplugin-swc | Accepted |
| [0006](../adr/0006-build-and-compilation.md) | Build and compilation | SWC to build, `tsc --noEmit` to typecheck; `--type-check` in dev | Accepted |
| [0007](../adr/0007-lint-and-format-tooling.md) | Lint and format | ESLint (flat config, type-aware) + Prettier | Accepted |
| [0008](../adr/0008-commit-and-branching-conventions.md) | Commit and branching conventions | Conventional Commits, GitHub Flow (branch per milestone), Husky + lint-staged + commitlint | Accepted |
| [0009](../adr/0009-ci-platform-and-pipeline.md) | CI platform, pipeline and security checks | GitHub Actions; Gitleaks, OSV-Scanner, Semgrep, CodeQL, Dependabot, actionlint/zizmor | Accepted |
| [0010](../adr/0010-claude-code-project-setup.md) | Claude Code project setup | `CLAUDE.md` + `.claude/settings.json` (permissions, hooks) | Accepted |

## 4. Phase B: Implementation slices

Written for the recommended options; adjusted if any ADR is changed.

| # | Slice | Output |
|---|---|---|
| B1 | Scaffold | NestJS app (latest stable), strict `tsconfig`, empty `AppModule` (hello-world removed), `.nvmrc`, `engines`, `packageManager`, and the repository hygiene files (section 4.1) |
| B2 | Lint and format | ESLint flat config, Prettier, scripts `lint`, `format`, `format:check`, `typecheck` |
| B3 | Tests | Vitest + unplugin-swc, coverage thresholds, smoke test that `AppModule` compiles; scripts `test`, `test:watch`, `test:cov` |
| B4 | Git hooks | Husky, lint-staged, commitlint (conventional config) |
| B5 | Claude Code | `CLAUDE.md`, `.claude/settings.json` (permission allowlist, format/lint hook), `.claude/hooks/format-lint.sh` |
| B6 | CI and security | `.github/workflows/ci.yml` (quality, commits, secrets, dependencies, SAST, dependency review, workflow lint), `codeql.yml`, `security-scheduled.yml`, `.github/dependabot.yml`, `.gitleaks.toml`, `osv-scanner.toml`, `.github/pull_request_template.md`, `CONTRIBUTING.md` (incl. GitHub settings guide) |
| B7 | Docs | `README.md` quick start; `docs/architecture.md` placeholder; requirement statuses updated |

### 4.1 Repository hygiene files

Small, conventional choices: documented here rather than in an ADR (per ADR 0001).

| File | Purpose | Contents / rules |
|---|---|---|
| `.gitignore` | Keep regenerable, personal and secret files out of git | Dependencies (`node_modules/`); build output (`dist/`, `*.tsbuildinfo`); test output (`coverage/`, `reports/`); **secrets** (`.env`, `.env.*` except `.env.example`, `*.pem`, `*.key`, `*.p12`); logs; tool caches (`.eslintcache`, `.swc/`, `.cache/`); OS files (`.DS_Store`, `Thumbs.db`); editors (`.idea/`, `.vscode/*` except the shared files below); Claude personal files (`.claude/settings.local.json`, `CLAUDE.local.md`). Later milestones append their own entries (for example local Docker data in M2). |
| `.gitattributes` | Same line endings on every OS | `* text=auto eol=lf`, so Windows commits don't show every line as changed |
| `.editorconfig` | Basic editor rules for any editor | UTF-8, LF, 2-space indent, final newline, trim trailing whitespace |
| `.vscode/extensions.json` | VS Code suggests the project's extensions | ESLint, Prettier, Vitest, EditorConfig |
| `.vscode/settings.json` | Shared VS Code behaviour | Format on save with Prettier; ESLint fixes on save; use the workspace TypeScript version |

Secrets are protected in four layers: `.gitignore` → Gitleaks in CI (ADR 0009) → GitHub push protection → Claude Code deny rules (ADR 0010). `.dockerignore` comes with the Dockerfile in M2.

## 5. Definition of done

- [x] All Phase A ADRs `Accepted`
- [ ] `pnpm install && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:cov && pnpm build` pass locally
- [ ] `pnpm start:dev` boots the app
- [ ] A non-conventional commit message is rejected; a lint error blocks the pre-commit hook
- [ ] Editing a TS file through Claude Code triggers the format/lint hook
- [ ] CI is green on the PR, including all security jobs
- [ ] A deliberately committed fake secret is caught by Gitleaks (verified, then removed)
- [ ] `/code-review` run, findings addressed, user review done, merged to `main`
- [ ] `docs/requirements.md` statuses updated

## 6. Out of scope (later milestones)

Module boundaries and the shared kernel (M1), config and Docker (M2, including image scanning), observability (M3), the full CI/CD pipeline with SBOM, signing and DAST (M9).
