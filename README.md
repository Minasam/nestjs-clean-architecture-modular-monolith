# NestJS Clean Architecture: Modular Monolith Template

A production-grade **NestJS** template for complex projects: a **modular monolith** built with **clean architecture**, designed so any module can later be extracted into a microservice.

> **Status:** under construction, milestone by milestone. **M0 (foundation and tooling)** is in progress. See the [roadmap](docs/requirements.md#3-milestones).

## What you get (target)

- Modules with clean architecture layers (domain, application, infrastructure, presentation) and **lint-enforced boundaries**
- Sync (facades) and async (events, outbox/inbox, queues) communication between modules
- A separate DB schema per module, safe migrations, transactions with isolation levels
- Observability: leveled logging, OpenTelemetry traces, vendor-neutral metrics
- Resilience: retries, timeouts, circuit breaker, caching; cron with distributed locks; feature flags
- CI/CD with quality and security gates, Docker, Kubernetes

The full list, with delivery milestones, is in [`docs/requirements.md`](docs/requirements.md).

## Quick start

Requirements: **Node 26** and **pnpm**.

```bash
nvm install 26 && nvm use      # Node version from .nvmrc
npm install -g pnpm            # exact version is pinned in package.json
pnpm install                   # dependencies + git hooks
pnpm start:dev                 # http://localhost:3000 (PORT to override)
```

## Scripts

| Command                                           | What it does                                            |
| ------------------------------------------------- | ------------------------------------------------------- |
| `pnpm start:dev`                                  | Run with fast SWC rebuilds and background type checking |
| `pnpm build` / `pnpm start:prod`                  | Production build / run it                               |
| `pnpm test` / `pnpm test:watch` / `pnpm test:cov` | Unit tests (Vitest), with coverage thresholds           |
| `pnpm lint` / `pnpm format` / `pnpm typecheck`    | ESLint, Prettier, TypeScript checks                     |

## Documentation

| Doc                                            | Purpose                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| [`docs/requirements.md`](docs/requirements.md) | Requirements and milestone roadmap                                      |
| [`docs/adr/`](docs/adr/README.md)              | Architecture Decision Records: every choice with options and trade-offs |
| [`docs/milestones/`](docs/milestones/)         | Per-milestone plans                                                     |
| [`docs/architecture.md`](docs/architecture.md) | Architecture overview                                                   |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)           | Workflow, CI and security checks, GitHub settings                       |
| [`CLAUDE.md`](CLAUDE.md)                       | Guidance for AI-assisted development with Claude Code                   |
