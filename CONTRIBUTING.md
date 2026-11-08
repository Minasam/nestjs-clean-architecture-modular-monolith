# Contributing

## Setup

1. **Node 26:** `nvm install 26`, then `nvm use` in the repo (reads `.nvmrc`).
2. **pnpm:** `npm install -g pnpm` (any version; the exact version is pinned by `packageManager` in `package.json` and selected automatically).
3. **Install:** `pnpm install` (this also installs the git hooks).
4. **If you commit from VS Code or a terminal not on Node 26**, make git hooks pick the right Node by creating `~/.config/husky/init.sh`:

   ```sh
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use --silent >/dev/null 2>&1
   ```

## Workflow

- Work is planned per milestone in [`docs/milestones/`](docs/milestones/); decisions are recorded as ADRs in [`docs/adr/`](docs/adr/README.md) **before** implementation.
- Branching: **GitHub Flow** (ADR 0008). Branch from `main` (`feat/mN-<name>`, `fix/<topic>`, `docs/<topic>`), open a PR, merge after green CI and review.
- Commits: **Conventional Commits** (`feat(orders): add cancel order`), enforced by commitlint.
- Before pushing: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:cov && pnpm build`.

## What runs automatically

| When                      | What                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `git commit`              | lint-staged (ESLint `--fix` + Prettier on staged files), type check, commitlint                                                                                          |
| Every PR / push to `main` | CI: quality, commit messages, secrets (Gitleaks), dependencies + licences (OSV-Scanner), code security (Semgrep), dependency review, workflow lint (actionlint + zizmor) |
| PRs + weekly              | CodeQL                                                                                                                                                                   |
| Weekly                    | Full security re-scan of `main` + OpenSSF Scorecard                                                                                                                      |
| Weekly                    | Dependabot update PRs (7-day cooldown; security fixes immediately)                                                                                                       |

### Handling security findings

Every exception needs a **written reason**, reviewed in the PR:

- **Vulnerability** that doesn't apply or can't be fixed yet: add `[[IgnoredVulns]]` with `reason` and `ignoreUntil` to `osv-scanner.toml`. Findings below CVSS 7.0 are reported but don't fail CI.
- **Licence** reported as UNKNOWN but verified: add a `[[PackageOverrides]]` entry to `osv-scanner.toml`. To allow a new licence, add it to `.github/osv-licenses.txt` (never GPL/AGPL without an ADR).
- **Secret false positive:** add an `[allowlist]` entry to `.gitleaks.toml` with a comment. **A real leaked secret must be revoked/rotated immediately.** Removing it from git does not make it safe.
- **New dependency install script:** approve with `pnpm approve-builds <pkg>` only if needed (ADR 0003).

## GitHub repository settings (repo admin, one-time)

These protections are settings, not code. Configure them in **Settings** on GitHub:

1. **Branch protection for `main`:** _Settings → Rules → Rulesets → New branch ruleset_
   - Target: default branch (`main`); Enforcement: **Active**
   - ✅ Restrict deletions · ✅ Block force pushes
   - ✅ Require a pull request before merging (required approvals: 1 for teams; 0 if you work alone)
   - ✅ Require status checks to pass, and require branches to be up to date. Add the checks once they have run on a PR: `Quality (lint, format, typecheck, test, build)`, `Commit messages (commitlint)`, `Security / Secrets (Gitleaks)`, `Security / Dependencies (OSV-Scanner vulnerabilities + licences)`, `Security / Code security (Semgrep)`, `Dependency review (new dependencies in this PR)`, `Workflow lint (actionlint, zizmor)`, `Analyze (JavaScript/TypeScript)`
2. **Security features:** _Settings → Advanced Security_ (or _Code security_)
   - ✅ Dependabot alerts · ✅ Dependabot security updates
   - ✅ Secret scanning · ✅ **Push protection**
   - ✅ Code scanning (CodeQL results appear via the `CodeQL` workflow)
3. **Actions:** _Settings → Actions → General_
   - Workflow permissions: **Read repository contents** (default least privilege)
   - ❌ Allow GitHub Actions to create and approve pull requests
