# 0004: Node.js runtime version

|                  |            |
| ---------------- | ---------- |
| **Status**       | Accepted   |
| **Date**         | 2026-11-08 |
| **Milestone**    | M0         |
| **Requirements** | R01        |

## Context

The template must target a Node.js release with a long support window, since adopters will build on it for years. Release lines as of 2026-11-08 (from nodejs.org/dist):

| Line | Codename | Phase                           | Latest   |
| ---- | -------- | ------------------------------- | -------- |
| 26   | Lithium  | **Active LTS** (since Oct 2026) | v26.13.0 |
| 24   | Krypton  | Maintenance LTS                 | v24.22.2 |
| 22   | Jod      | Maintenance LTS (EOL Apr 2027)  | v22.23.4 |

The current development machine runs Node 22.19.

## Decision drivers

- Longest support window for a new template
- Compatibility with NestJS and the main libraries we'll add (ORM, OpenTelemetry, SWC, Vitest)
- The same version locally, in CI and in Docker

## Options considered

### Option A: Node 26 (Active LTS)

- ✅ Longest remaining support; newest V8 and language features
- ✅ Most new projects will start on it
- ⚠️ Recently promoted to LTS. A few native add-ons may lag; to be checked during B1.
- ❌ Requires installing Node 26 locally (`nvm install 26`)

### Option B: Node 24 (Maintenance LTS)

- ✅ Very mature ecosystem support
- ❌ Already in maintenance (security fixes only); shorter runway

### Option C: Node 22 (current machine)

- ✅ No local change needed
- ❌ End of life in April 2027, only months away; the template would need a bump almost immediately

## Decision

**Chosen: Option A, Node 26 LTS,** pinned in `.nvmrc` (`26`), `package.json` `engines` (`>=26`), the CI matrix and the Docker base image.

Fallback: if an important dependency turns out to be incompatible during B1, fall back to Node 24 and record it here.

## Consequences

- Positive: maximum support runway; modern runtime features.
- Negative: contributors must install Node 26 (documented in the README).
- Follow-ups: the M2 Dockerfile uses `node:26-<slim|alpine>`; Renovate (M9) tracks Node updates.
