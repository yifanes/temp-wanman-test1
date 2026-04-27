# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## [Unreleased]

### Added

- `src/index.js` entry point with `helloWorld()` function
- `test/index.test.js` with 100% test coverage (5 test cases)
- Jest test runner configured in `package.json`
- `CODE_OF_CONDUCT.md` adopting Contributor Covenant v2.1
- GitHub issue templates for bug reports and feature requests (`.github/ISSUE_TEMPLATE/`)
- `.github/PULL_REQUEST_TEMPLATE.md` with checklist matching CONTRIBUTING.md guidelines
- `package.json` with project metadata and semantic-release configuration
- Enhanced CI workflow: `npm install` and `npm test` steps in GitHub Actions
- Cross-links between all top-level docs (README ↔ CONTRIBUTING ↔ CHANGELOG ↔ LICENSE)

### Changed

- Updated `package.json`: `main` → `src/index.js`, `test` → `jest --coverage`, `start` → `node src/index.js`
- Fixed repository URLs throughout `package.json` to match actual GitHub remote
- Fixed `CONTRIBUTING.md`: removed stale `.env.example` reference; added cross-link to README

---

## [0.1.0] — 2026-04-27

### Added

- GitHub Actions CI workflow with lint and placeholder test step (`.github/workflows/ci.yml`)
- `CONTRIBUTING.md` with development workflow, branch naming, and PR guidelines
- Comprehensive `README.md` with project overview, installation, usage, contributing, roadmap, and project structure sections
- Initial project scaffolding: `CHANGELOG.md`, `LICENSE` (MIT), `.gitignore`

### Changed

- Renamed `readme.md` → `README.md` to follow conventional casing

[Unreleased]: https://github.com/yifanes/temp-wanman-test1/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yifanes/temp-wanman-test1/releases/tag/v0.1.0
