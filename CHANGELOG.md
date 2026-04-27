# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## [Unreleased]

### Added

- `src/eventBus.js` — lightweight pub/sub event bus for task lifecycle hooks: `createEventBus()` returns an instance with `on`, `off`, `once`, `emit`, `listenerCount`, and `removeAllListeners`; `on` returns an unsubscribe function; `once` auto-removes after first invocation
- `src/eventBus.js` exported from `src/index.js` alongside all other public modules (`createEventBus`)
- Re-exported `taskRunner`, `taskQueue`, and `agentRegistry` from `src/index.js` — consumers can now import all modules from a single entry point: `const { createTask, createTaskQueue, registerAgent, createEventBus } = require('temp-wanman-test1')`
- `test/integration.test.js` — 23 integration tests covering cross-module workflows for `taskRunner`, `taskQueue`, and `agentRegistry` working together
- `test/eventBus.test.js` — unit tests for `eventBus` module with 100% coverage
- npm publish readiness: `files` whitelist in `package.json` (`src/`, `README.md`, `CHANGELOG.md`, `LICENSE`); `.npmignore` excluding dev artifacts from the published package

---

## [0.1.0] — 2026-04-27

### Added

- Comprehensive `README.md` with project overview, installation, usage, contributing, roadmap, and project structure sections
- Initial project scaffolding: `CHANGELOG.md`, `LICENSE` (MIT), `.gitignore`
- GitHub Actions CI workflow with `npm install` and `npm test` steps (`.github/workflows/ci.yml`)
- `CONTRIBUTING.md` with development workflow, branch naming, and PR guidelines
- `CODE_OF_CONDUCT.md` adopting Contributor Covenant v2.1
- `SECURITY.md` with vulnerability reporting instructions
- GitHub issue templates for bug reports and feature requests (`.github/ISSUE_TEMPLATE/`)
- `.github/PULL_REQUEST_TEMPLATE.md` with checklist matching CONTRIBUTING.md guidelines
- `package.json` with project metadata, scripts, and semantic-release configuration
- Cross-links between all top-level docs (README ↔ CONTRIBUTING ↔ CHANGELOG ↔ LICENSE)
- `src/index.js` entry point with `helloWorld()` function; `test/index.test.js` with 100% coverage
- `src/taskRunner.js` — in-memory task orchestration: `createTask`, `listTasks`, `completeTask`; `test/taskRunner.test.js` with 100% coverage
- `src/agentRegistry.js` — agent registration, lookup, role/status filtering, and round-robin dispatch: `registerAgent`, `getAgent`, `listAgents`, `updateStatus`, `unregisterAgent`, `dispatch`; `test/agentRegistry.test.js` with 100% coverage (40 tests)
- ESLint configured with `eslint-config-standard` (`.eslintrc.json`); `lint` script added to `package.json`
- Jest added to `devDependencies`; `package-lock.json` generated
- `src/taskQueue.js` — priority-based min-heap task queue: `enqueue`, `dequeue`, `peek`, `size`, `clear`, `toArray`; `test/taskQueue.test.js` with 100% coverage (92 tests)

### Changed

- Renamed `readme.md` → `README.md` to follow conventional casing
- Updated `package.json`: `main` → `src/index.js`, `test` → `jest --coverage`, `start` → `node src/index.js`
- Fixed repository URLs throughout `package.json` to match actual GitHub remote
- Fixed `CONTRIBUTING.md`: removed stale `.env.example` reference; added cross-link to README

[Unreleased]: https://github.com/yifanes/temp-wanman-test1/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yifanes/temp-wanman-test1/releases/tag/v0.1.0
