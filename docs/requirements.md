# Requirements & Roadmap

Source of truth for **what** this template must provide and **when** each item is delivered.
Design decisions (the **how**) are recorded as ADRs in [`docs/adr/`](./adr/).

**Status legend:** `[ ]` not started · `[~]` in progress · `[x]` done
**Type legend:** `Core` = original requirement · `Added` = production-grade addition · `Optional` = decided during the milestone's design

---

## 1. Goal

A production-grade **NestJS** template for complex projects, built as a **modular monolith** using **clean architecture**, where any module can later be extracted into a microservice with minimal change.

---

## 2. Requirements

Ordered by milestone, in delivery order within each milestone. **IDs are permanent:** a new requirement gets the next free ID and is placed in its milestone's position, so IDs may appear out of sequence.

| ID | Requirement | Type | Milestone | Open decision | Status |
|---|---|---|---|---|---|
| R01 | NestJS project scaffold with strict TypeScript | Added | M0 | Package manager: pnpm / npm | [ ] |
| R02 | Code quality gates (ESLint, Prettier, Husky, commitlint, coverage thresholds) | Added | M0 | | [ ] |
| R03 | Unit testing | Core | M0, M1 | Test runner: Jest / Vitest | [ ] |
| R04 | `.claude` setup with `CLAUDE.md` | Core | M0 | | [ ] |
| R05 | ADRs and architecture documentation | Added | M0 onward | | [ ] |
| R06 | Modular monolith that can be split into microservices easily | Core | M1, M10 | | [ ] |
| R07 | Clean architecture with three main layers (domain, application, infrastructure/presentation) | Core | M1 | | [ ] |
| R08 | Synchronous communication between modules through interfaces/facades | Core | M1 | | [ ] |
| R09 | Automated enforcement of architecture boundaries (lint rules / architecture tests) | Added | M1 | | [ ] |
| R10 | Two dummy example modules | Core | M1 | | [ ] |
| R11 | Typed config validated at startup (fail fast) | Added | M2 | | [ ] |
| R12 | Secrets and parameters management | Core | M2 | | [ ] |
| R13 | Docker Compose for local development with hot reload and seeding | Core | M2, M4 | | [ ] |
| R14 | Production Dockerfile (multi-stage, non-root, minimal image) | Added | M2 | | [ ] |
| R15 | Centralized exception handling | Core | M3 | | [ ] |
| R16 | Standard error format (RFC 9457 Problem Details) and error codes | Added | M3 | | [ ] |
| R17 | Input validation and DTO ↔ domain mapping | Added | M3 | | [ ] |
| R18 | Request context and correlation IDs (AsyncLocalStorage) | Added | M3 | | [ ] |
| R19 | Logging with levels | Core | M3 | | [ ] |
| R20 | Distributed tracing (traces and spans) | Core | M3 | | [ ] |
| R21 | Metrics behind an abstraction that hides the backend (Prometheus, Datadog, …) | Core | M3 | | [ ] |
| R22 | Health checks (liveness/readiness) and graceful shutdown | Added | M3 | | [ ] |
| R23 | API specification (OpenAPI) | Core | M3 | | [ ] |
| R24 | Security hardening (helmet, CORS, rate limiting, payload limits) | Added | M3, M8 | | [ ] |
| R25 | API versioning and pagination/filtering conventions | Optional | M3 | | [ ] |
| R26 | Idempotency keys for POST endpoints | Optional | M3 / M5 | | [ ] |
| R27 | A separate DB schema per module (one physical DB allowed), with no foreign keys across schemas | Core | M4 | ORM: MikroORM / Drizzle / Prisma / TypeORM | [ ] |
| R28 | Smooth, safe DB migrations with a suitable ORM; migrations must be backward compatible (expand and contract) so code behind a disabled feature flag can be deployed safely | Core | M4 | ORM (same as R27) | [ ] |
| R29 | Transactions with configurable isolation levels | Core | M4 | | [ ] |
| R30 | Integration testing | Core | M4 | | [ ] |
| R31 | Asynchronous, event-driven communication between modules | Core | M5 | | [ ] |
| R32 | Domain events kept separate from integration events; versioned message contracts | Added | M5 | | [ ] |
| R33 | Transactional outbox and inbox (idempotent consumers) | Added | M5 | | [ ] |
| R34 | Pushing to and pulling from queues | Core | M5 | Broker: RabbitMQ / SQS / Kafka behind an abstraction; BullMQ (Redis) for jobs | [ ] |
| R35 | Dead-letter queues and poison-message handling | Added | M5 | | [ ] |
| R36 | Retries for external calls | Core | M6 | | [ ] |
| R37 | Circuit breaker | Core | M6 | | [ ] |
| R38 | Timeouts and bulkheads | Added | M6 | | [ ] |
| R39 | Caching layer | Core | M6 | | [ ] |
| R40 | Cron tasks | Core | M7 | | [ ] |
| R41 | Distributed lock for cron jobs (a job runs once, not once per instance) | Added | M7 | | [ ] |
| R50 | Feature flags behind an abstraction (built-in provider first; Unleash / LaunchDarkly / OpenFeature pluggable): per-environment on/off, targeting (internal users, user/tenant lists), percentage rollouts, kill switch | Added | M7 | Flag provider and its evaluation model | [ ] |
| R42 | AuthN/AuthZ abstraction (JWT/OIDC, RBAC guards) | Added | M8 | | [ ] |
| R43 | CI/CD with multiple stages and environments | Core | M0 (basic CI), M9 | Release strategy (ADR in M9): feature flags + preview environments; promotion dev → staging (PPE-like) → prod; staging by default, canary deployment (e.g. Argo Rollouts) as an optional add-on; rollback | [ ] |
| R44 | Security and supply-chain checks in CI: secret scanning, dependency vulnerabilities and licences, SAST, automated dependency updates, workflow hardening (M0); Dockerfile and image scan (M2); SBOM, image signing, manifest scan, DAST (M9) | Added | M0, M2, M9 | | [ ] |
| R45 | Kubernetes deployment (per-env values, probes, HPA, External Secrets, migrations as a pre-upgrade Job, separate API and worker deployments, local `kind`/`k3d` check) | Added | M9 | Packaging: Helm / Kustomize | [ ] |
| R46 | E2E/contract tests and load tests (k6) | Optional | M9 / M10 | | [ ] |
| R47 | Module generator (CLI/schematic) to scaffold new modules | Optional | M10 | | [ ] |
| R48 | Demo of extracting an example module into its own service | Optional | M10 | | [ ] |
| R49 | Audit log, multi-tenancy hooks | Optional | Later | | [ ] |

---

## 3. Milestones

Ordered by dependency and priority. Each milestone is designed in plan mode (with ADRs for significant choices), implemented on its own branch (`feat/mN-<name>`), verified, reviewed and merged into `main`.

| M | Milestone | Scope | Depends on | Status |
|---|---|---|---|---|
| M0 | Foundation and tooling | NestJS scaffold, strict TS, lint/format, Husky/commitlint, unit test runner, `.claude` setup (CLAUDE.md, hooks, permissions), docs/ADR skeleton, basic CI (lint, typecheck, test) plus security checks (secrets, dependencies, SAST, Dependabot, workflow hardening) | – | [ ] |
| M1 | Architecture skeleton and example modules | Three layers, shared kernel (Entity, ValueObject, Result, DomainEvent), module layout, public facades, boundary enforcement, two dummy modules (in-memory repositories), unit test patterns | M0 | [ ] |
| M2 | Config, secrets and local environment | Typed and validated config, secrets/parameters abstraction (env, SSM, Vault adapters), Docker Compose with hot reload, production Dockerfile, Dockerfile and image scanning | M1 | [ ] |
| M3 | Cross-cutting HTTP and observability | Exception handling (Problem Details), validation, request context, leveled logging, OpenTelemetry traces, metrics abstraction, health checks, graceful shutdown, OpenAPI, security hardening | M2 | [ ] |
| M4 | Persistence | ORM (ADR), schema per module, migrations per module (expand and contract), transactions and isolation levels (unit of work), seeding, integration tests (Testcontainers) | M3 | [ ] |
| M5 | Async communication | Event bus abstraction, domain vs. integration events, outbox/inbox, queue push/pull abstraction, DLQ | M4 | [ ] |
| M6 | Resilience and caching | HTTP client with retries (backoff and jitter), timeouts, circuit breaker, bulkheads, cache abstraction and Redis adapter | M3, M4 | [ ] |
| M7 | Scheduling and feature flags | Cron tasks with distributed lock and observability; feature-flag abstraction with targeting and percentage rollouts | M4, M5 | [ ] |
| M8 | Security | AuthN/AuthZ abstraction, RBAC guards, rate limiting | M3 | [ ] |
| M9 | CI/CD and Kubernetes | Multi-stage pipeline (lint, test, integration, build, scan, deploy), dev/staging/prod environments, image publishing, supply-chain checks (SBOM, image signing, manifest scan, DAST), Helm chart, migrations as a deploy step, release strategy (flags, preview environments, promotion, rollback) | All above | [ ] |
| M10 | Microservice readiness and template DX | Extraction demo (facade to HTTP/gRPC adapter, events to broker), module generator, final docs | All above | [ ] |
