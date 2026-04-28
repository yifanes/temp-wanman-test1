# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## [Unreleased]

### Added

- `src/orchestrator.js` — top-level orchestration module that wires `agentRegistry`, `taskQueue`, and `taskRunner` into a single coordinated run; `orchestrate(config)` validates config, registers agents, processes a priority queue of tasks, dispatches each task to the matching role via round-robin, and returns a run summary `{ total, completed, failed, agents, results }`
- `src/cli.js` — minimal CLI entry point: `parseArgs`, `runCommand`, `listCommand`, `helpCommand`, `versionCommand`, and `main`; supports `run --config <file>` (orchestrate tasks from a JSON config), `list --status <filter>` (display in-memory tasks), `help`, and `--version`
- `package.json` `bin` field: `{ "wanman": "src/cli.js" }` — installing the package globally now exposes a `wanman` executable
- Re-exported `orchestrate` (orchestrator) and `cliMain`, `parseArgs` (CLI) from `src/index.js` — single-entry import now covers all public modules: `const { createTask, createTaskQueue, registerAgent, orchestrate, cliMain } = require('temp-wanman-test1')`
- `test/orchestrator.test.js` — unit tests for orchestrator module (96%+ coverage)
- `test/cli.test.js` — comprehensive unit tests for CLI module (100% statement coverage, covers all commands, flags, error paths, and output formatting)
- ESLint CI step now runs before the test job in `.github/workflows/ci.yml` — lint failures are surfaced earlier in the pipeline
- Re-exported `taskRunner`, `taskQueue`, and `agentRegistry` from `src/index.js` — consumers can now import all modules from a single entry point: `const { createTask, createTaskQueue, registerAgent } = require('temp-wanman-test1')`
- `test/integration.test.js` — 23 integration tests covering cross-module workflows for `taskRunner`, `taskQueue`, and `agentRegistry` working together
- npm publish readiness: `files` whitelist in `package.json` (`src/`, `README.md`, `CHANGELOG.md`, `LICENSE`); `.npmignore` excluding dev artifacts from the published package

### Removed

- `src/eventBus.js` — removed from Phase 4 scope; a revised pub/sub module (`eventEmitter.js`) will be introduced in the next phase once the API is finalised

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
