# Contributing Guide

Thank you for your interest in contributing! This document covers the development workflow, branch naming conventions, and pull request guidelines.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Branch Naming](#branch-naming)
4. [Pull Request Guidelines](#pull-request-guidelines)
5. [Code Quality](#code-quality)
6. [Commit Messages](#commit-messages)

---

## Getting Started

1. **Fork** the repository and clone your fork locally.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your setup by running the test suite:
   ```bash
   npm test
   ```

---

## Development Workflow

All code changes follow a **feature-branch → PR → review → merge** cycle:

```
main
 └── wanman/<task-slug>   ← your feature branch
       ↓
     open PR against main
       ↓
     CI passes (lint + tests, coverage ≥ 95%)
       ↓
     reviewer approves
       ↓
     merge to main
```

### Step-by-step

1. **Create a feature branch** from the latest `main`:
   ```bash
   git checkout main && git pull
   git checkout -b wanman/<task-slug>
   ```
2. **Write code and tests** — see [Code Quality](#code-quality) for coverage requirements.
3. **Run lint and tests locally** before pushing:
   ```bash
   npm run lint
   npm test -- --coverage
   ```
4. **Push your branch** and open a Pull Request:
   ```bash
   git push -u origin wanman/<task-slug>
   ```
5. **Fill in the PR template** (title, description, linked task ID).
6. **Notify the reviewer** (or CTO) once the PR is ready for review.
7. Address review feedback; the reviewer approves and merges.

> **Never push directly to `main`.** All changes must go through a PR.

---

## Branch Naming

Use the pattern:

```
wanman/<task-slug>
```

Where `<task-slug>` is a short, lowercase, hyphen-separated description of the task, e.g.:

| Task | Branch |
|------|--------|
| Add login page | `wanman/add-login-page` |
| Fix auth token expiry | `wanman/fix-auth-token-expiry` |
| Update README | `wanman/update-readme` |

Rules:
- **Lowercase only** — no uppercase letters.
- **Hyphens** as word separators — no underscores or spaces.
- **Keep it short** — 3–5 words max.
- Always prefix with `wanman/`.

---

## Pull Request Guidelines

### Title

Write a concise imperative-mood title:

```
Add user authentication flow
Fix null pointer in payment handler
Update README with installation steps
```

### Description

Include at minimum:

- **What** was changed and **why**.
- The **task ID** this PR resolves (e.g., `Closes #dd738228`).
- A brief **test plan** or note on how to verify the change.

### Checklist before requesting review

- [ ] Branch is up to date with `main`.
- [ ] All existing tests pass (`npm test`).
- [ ] New code is covered by tests (coverage ≥ 95%).
- [ ] Lint passes with no errors (`npm run lint`).
- [ ] Relevant documentation has been updated (README, CHANGELOG, etc.).
- [ ] CHANGELOG.md has an entry under `[Unreleased]`.

### Review process

1. At least **one approval** is required before merging.
2. CI must be **green** (lint + tests).
3. Coverage gate: **≥ 95%** — PRs that drop coverage below this threshold will be blocked.
4. The **reviewer** (not the author) merges after approval.

---

## Code Quality

- **Linting**: code must pass the project linter with zero errors.
- **Testing**: write unit tests for all new logic; integration tests where applicable.
- **Coverage**: maintain project-wide line/branch coverage at or above **95%**.
- **No dead code**: remove commented-out blocks and unused imports before opening a PR.

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer: Closes #<task-id>]
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`.

Examples:
```
feat(auth): add JWT refresh token support
fix(api): handle empty response body gracefully
docs(readme): add installation section
chore(deps): upgrade eslint to v9
```

---

## Questions?

Open an issue or start a discussion — we're happy to help get you up and running.

---

For a high-level overview of the project, see [README.md → Contributing](./README.md#contributing).
For a record of all notable changes, see [CHANGELOG.md](./CHANGELOG.md).
