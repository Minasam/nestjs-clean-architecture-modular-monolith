# Architecture

> **Placeholder.** The architecture is designed and documented in **M1** (architecture skeleton and example modules). This page will then describe the layers, module boundaries, communication patterns and dependency rules, with diagrams.

Decided so far:

- **Repository layout** ([ADR 0002](adr/0002-repository-layout.md)): a single NestJS app with a folder per module under `src/modules/`. Each module exposes only `public-api.ts` to other modules; boundaries are enforced by lint rules (M1).
- **Layers per module** (clean architecture, R07): `domain/` (no framework code) ← `application/` (use cases) ← `infrastructure/` and `presentation/` (adapters).
- **Communication** between modules: synchronous through facades in `public-api.ts` (R08, M1); asynchronous through integration events (R31, M5).
- **Data ownership:** a schema per module, with no cross-schema foreign keys (R27, M4).
