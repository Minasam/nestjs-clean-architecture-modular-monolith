# Architecture Decision Records

Each significant technical decision is recorded here as an ADR: the context, the options considered with their trade-offs, the decision, and its consequences.

## Process

1. Copy [`0000-template.md`](0000-template.md) to `NNNN-short-title.md` (next free number).
2. Write it with **Status: Proposed** and open it for review (in the milestone branch or PR).
3. After review, set **Status: Accepted** and fill in the final decision. It may differ from the original recommendation; keep the options section as written.
4. Never rewrite an accepted ADR to change its decision. Write a new ADR that **supersedes** it and update the old one's status.

## Index

| #                                                | Title                                     | Status   | Milestone |
| ------------------------------------------------ | ----------------------------------------- | -------- | --------- |
| [0001](0001-record-architecture-decisions.md)    | Record architecture decisions             | Accepted | M0        |
| [0002](0002-repository-layout.md)                | Repository layout                         | Accepted | M0        |
| [0003](0003-package-manager.md)                  | Package manager                           | Accepted | M0        |
| [0004](0004-nodejs-runtime-version.md)           | Node.js runtime version                   | Accepted | M0        |
| [0005](0005-test-runner.md)                      | Test runner                               | Accepted | M0        |
| [0006](0006-build-and-compilation.md)            | Build and compilation                     | Accepted | M0        |
| [0007](0007-lint-and-format-tooling.md)          | Lint and format tooling                   | Accepted | M0        |
| [0008](0008-commit-and-branching-conventions.md) | Commit and branching conventions          | Accepted | M0        |
| [0009](0009-ci-platform-and-pipeline.md)         | CI platform, pipeline and security checks | Accepted | M0        |
| [0010](0010-claude-code-project-setup.md)        | Claude Code project setup                 | Accepted | M0        |
