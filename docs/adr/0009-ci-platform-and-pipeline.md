# 0009: CI platform, pipeline and security checks

|                  |                                                     |
| ---------------- | --------------------------------------------------- |
| **Status**       | Accepted                                            |
| **Date**         | 2026-11-08                                          |
| **Milestone**    | M0 (quality and security CI), extended in M2 and M9 |
| **Requirements** | R43, R44                                            |

## Context

Every change must pass the same quality gates in CI that developers run locally, because local hooks can be bypassed (`--no-verify`). Beyond code quality, a production-grade template must also catch **security problems** as early as possible:

- **leaked secrets** (API keys, passwords committed by mistake),
- **vulnerable or malicious dependencies** (most Node.js code is third-party packages),
- **insecure code patterns** (injection, unsafe deserialization, …),
- **licence problems** in dependencies,
- **insecure CI configuration** (the pipeline itself is an attack target).

Some checks need artifacts that don't exist yet: a Docker image (M2) and deployed environments (M9). Those are scheduled for later milestones.

The repository is on GitHub and **public**. GitHub's native security features (CodeQL, secret-scanning push protection, dependency review) are **free for public repos**. On **private repos** they need a paid GitHub Advanced Security licence. Adopters of the template may use private repos, so every _required_ gate must also work without that licence.

## Decision drivers

1. Native integration with the code host (PR checks, branch protection, security tab)
2. Required gates work on **private repos without paid licences**
3. Fast feedback: cheap checks on every PR, heavier scans on a schedule
4. Low noise: a failing check must be meaningful, or people learn to ignore it
5. Can grow into multi-environment CD (M9)

## Part 1: CI platform

### Option A: GitHub Actions

- ✅ Native PR checks, branch protection and Security tab; no external service
- ✅ Large marketplace; **Environments** with approvals and secrets for M9
- ❌ GitHub-specific YAML. Mitigated: jobs only call `pnpm` scripts or standard CLIs, so porting is just re-wrapping them.

### Option B: GitLab CI

- ✅ Strong built-in CD and security scanners
- ❌ The repo isn't on GitLab; it would need mirroring

### Option C: External CI (CircleCI, Jenkins, Buildkite)

- ❌ Extra service to configure and pay for; Jenkins has high upkeep

**Recommended: Option A, GitHub Actions.**

## Part 2: Security checks, options per category

### 2.1 Secret scanning

| Option                                       | Pros                                                                                                      | Cons                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Gitleaks** (CLI, run directly in CI)       | Free and open source; works on any repo or CI; scans full git history; allowlist file for false positives | Detects only after commit/push, unless also run locally |
| TruffleHog                                   | Can **verify** whether a found key is live (fewer false positives)                                        | Heavier; verification makes network calls               |
| GitHub secret scanning + **push protection** | **Blocks the push** before the secret reaches GitHub; partner providers auto-revoke leaked tokens         | Free on public repos only; GitHub-specific              |

**Recommended:** Gitleaks in CI as the **required gate** (works everywhere), plus GitHub push protection **enabled on this repo** as an extra layer.
Note: run the Gitleaks **CLI** directly. The official `gitleaks-action` needs a licence key for organisation-owned repos.

### 2.2 Dependency vulnerabilities (SCA)

| Option                              | Pros                                                                                                                                                                                             | Cons                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `pnpm audit`                        | Built in; no extra tool                                                                                                                                                                          | Single advisory source; coarse ignore handling |
| **OSV-Scanner** (Google)            | Reads `pnpm-lock.yaml`; uses the OSV database (aggregates GitHub, npm and other advisories); ignore file with **reason and expiry date**; SARIF output to the Security tab; licence scanning too | One more tool                                  |
| GitHub **dependency review** action | On PRs, flags **newly added** vulnerable dependencies and disallowed licences; shows the diff                                                                                                    | Free on public repos only                      |
| Snyk / Socket                       | Rich data; Socket detects **malicious** package behaviour (install scripts, typosquats)                                                                                                          | Paid tiers / external account                  |

**Recommended:** **OSV-Scanner** as the required gate (fails on high or critical), plus **dependency review** on PRs while the repo is public. Socket is noted as an optional add-on for malicious-package detection.

### 2.3 Static application security testing (SAST)

| Option                          | Pros                                                                                                                            | Cons                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **CodeQL**                      | Deep semantic analysis (data-flow, injection paths); GitHub's own engine; results in the Security tab                           | Slower (minutes); free on public repos only           |
| **Semgrep** (community edition) | Fast; free and open source on any repo; readable rules; can add custom rules (for example architecture or security conventions) | Community rules are shallower than CodeQL's data-flow |
| `eslint-plugin-security`        | Already inside our lint step                                                                                                    | Pattern-based, noisy; weak on TS                      |

**Recommended:** **Semgrep CE** as the required gate (works on private repos), plus **CodeQL** enabled on this public repo (on PRs and weekly). Adopters on private repos without a licence simply disable CodeQL.

### 2.4 Licence compliance

**Recommended:** **OSV-Scanner licence scanning** with an **allowlist** (MIT, Apache-2.0, BSD-2/3-Clause, ISC, 0BSD, …). Copyleft licences (GPL/AGPL) fail the build unless explicitly approved. Dependency review adds the same check on PRs.

### 2.5 Automated dependency updates

| Option         | Pros                                                                                                                 | Cons                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Dependabot** | Native to GitHub, no app to install; security PRs on new CVEs; supports pnpm and GitHub Actions; grouping of updates | Less flexible than Renovate                       |
| Renovate       | Very flexible (schedules, automerge rules, grouping, monorepo presets)                                               | Requires installing the Renovate app; more config |

**Recommended:** **Dependabot** (weekly, grouped: minor/patch together, majors separately), covering **npm dependencies and GitHub Actions**. This moves from M9 to M0, because dependencies exist from day one.

### 2.6 Pipeline (CI) hardening

The CI pipeline has access to the code and, later, to deployment credentials, so it's an attack target. Recommended rules:

- `permissions: contents: read` by default; grant more only per job when needed (least privilege).
- Third-party actions **pinned to a full commit SHA**, not a tag (tags can be moved to malicious code). Dependabot keeps the SHAs updated.
- **actionlint** (workflow syntax and bug linting) and **zizmor** (workflow security linting, for example script injection from PR titles) run on every change to `.github/workflows/`.
- No secrets exposed to workflows triggered by forks (`pull_request`, never `pull_request_target`, for untrusted code).

### 2.7 Repository posture

- **OpenSSF Scorecard** (weekly): scores repo security practices (branch protection, pinned dependencies, signed releases…) and publishes a badge.
- **Branch protection / rulesets on `main`** (configured in GitHub settings by the repo admin, documented in `CONTRIBUTING.md`): require a PR, require all CI checks green, require 1 approval, block force pushes and deletion, require branches to be up to date.

### 2.8 Commit convention in CI

**commitlint** re-runs on the PR's commits in CI, because the local hook can be bypassed (ADR 0008).

## Decision

**Chosen:** GitHub Actions, with the following workflows.

### `ci.yml`: every PR and every push to `main`

| Job                 | Steps                                                                                               | Blocks merge |
| ------------------- | --------------------------------------------------------------------------------------------------- | ------------ |
| `quality`           | install (frozen lockfile, cached) → lint → format:check → typecheck → test:cov (thresholds) → build | ✅           |
| `commits`           | commitlint over the PR's commits                                                                    | ✅           |
| `secrets`           | Gitleaks (full history on `main`, PR range on PRs)                                                  | ✅           |
| `dependencies`      | OSV-Scanner: vulnerabilities (fail on high/critical) + licence allowlist                            | ✅           |
| `sast`              | Semgrep CE (TypeScript / Node / NestJS rulesets)                                                    | ✅           |
| `dependency-review` | GitHub dependency review on PRs (public repo)                                                       | ✅           |
| `workflow-lint`     | actionlint + zizmor (only when workflows change)                                                    | ✅           |

Jobs run **in parallel**. `concurrency` cancels superseded runs on the same branch. The coverage report is uploaded as an artifact. Findings are uploaded as **SARIF** to the GitHub Security tab.

### `codeql.yml`: PRs to `main` + weekly

CodeQL for JavaScript/TypeScript (public repo; documented as optional for private adopters).

### `security-scheduled.yml`: weekly on `main`

Re-runs Gitleaks, OSV-Scanner and Semgrep **even without code changes**, because new vulnerabilities are published every day. Also runs OpenSSF Scorecard.

### `.github/dependabot.yml`

Weekly grouped updates for npm and GitHub Actions.

### Planned for later milestones

| Check                                                                            | Milestone                     | Why later                    |
| -------------------------------------------------------------------------------- | ----------------------------- | ---------------------------- |
| Dockerfile and compose misconfiguration scan (Trivy config / hadolint)           | M2                            | The Dockerfile arrives in M2 |
| Container image vulnerability scan (Trivy)                                       | M2 (build), M9 (publish gate) | Needs the image              |
| SBOM generation (Syft / CycloneDX) and image signing + provenance (cosign, SLSA) | M9                            | Tied to publishing images    |
| Kubernetes / Helm manifest scan (Trivy config / kubeconform)                     | M9                            | Manifests arrive in M9       |
| DAST: dynamic scan of the running API (OWASP ZAP baseline) against staging       | M9                            | Needs a deployed environment |
| Integration-test job                                                             | M4                            | Needs the database           |

## Consequences

- Positive: secrets, vulnerable or badly licensed dependencies, insecure code and insecure workflows are caught **before merge**, and re-checked weekly. Required gates work on private repos at no cost.
- Negative: more CI jobs (they run in parallel, so wall-clock time stays about the same). Some **false positives** are inevitable; each is handled through an allowlist entry **with a reason** (and an expiry date for vulnerability ignores), reviewed in the PR.
- Negative: GitHub-specific features (CodeQL, dependency review, push protection) need a paid licence on private repos; they are optional extras, not required gates.
- Follow-ups: the repo admin enables push protection, Dependabot alerts and the branch ruleset in GitHub settings (step-by-step guide in `CONTRIBUTING.md`). M2 and M9 add the checks listed above.

## Implementation notes (M0 B6, 2026-11-08)

Details settled while implementing; the decision itself is unchanged.

- **Reusable security workflow:** Gitleaks, OSV-Scanner and Semgrep live in `security-scans.yml` (`workflow_call`), called by `ci.yml` (PR range / full history on `main`) and `security-scheduled.yml` (weekly, full history), so the rules exist in one place.
- **OSV severity gate:** OSV-Scanner fails on _any_ finding and has no severity threshold. `scripts/ci/osv-gate.mjs` applies the policy: fail on CVSS ≥ 7.0, unknown severity, or licence violations; report lower findings. On day one it reports 2 medium findings (`minimatch` GHSA-g3hv-75wg-m249, CVSS 6.9) that come only through dev tooling (ESLint, SWC CLI); the fix needs `minimatch` 11 upstream.
- **Licence allowlist** lives in `.github/osv-licenses.txt`. It includes **MPL-2.0** (weak, file-level copyleft; `lightningcss`, a Vitest/Vite dev dependency, used unmodified). `busboy` and `streamsearch` are MIT but use the legacy `licenses` field, so they have reasoned overrides in `osv-scanner.toml`.
- **Workflow lint runs on every PR**, not only when workflows change. It takes seconds, and path-filtered jobs can't be required status checks.
- **Dependabot cooldown (7 days)** added after zizmor flagged its absence: hijacked releases are usually pulled within days; security updates are not delayed.
- **Tool installs are checksum-verified** (Gitleaks, OSV-Scanner, actionlint), all actions are pinned to commit SHAs, and the Semgrep container is pinned by digest. Semgrep rule sets: `p/typescript`, `p/nodejs`, `p/expressjs`, `p/owasp-top-ten`, `p/secrets`.
- **Verified locally before the first CI run:** Gitleaks (history clean; catches a planted token in a throwaway repo), OSV-Scanner + gate (passes; blocks a synthetic CVSS 9.8 finding and a GPL licence), actionlint and zizmor (clean). Semgrep and CodeQL could not be run locally (container registry unreachable from the dev machine); their first run is on the PR.
