# temp-wanman-test1

A demonstration project showcasing [wanman](https://github.com/anthropics/wanman) -- an autonomous multi-agent task orchestration framework for software development.

> **Status:** Early Development | Phase 0 -- Repo Foundation

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Overview

This repository demonstrates how **wanman** bootstraps and manages a software project from scratch using a team of autonomous agents. It serves as both a reference implementation and a living example of agent-driven development, where specialized roles (CEO, CTO, Dev, Feedback, Marketing) collaborate to build, test, and ship software.

### Key Concepts

- **Initiatives** -- high-level goals that drive the project roadmap
- **Tasks** -- actionable work items decomposed from initiatives
- **Capsules** -- change boundaries that scope code modifications to specific file paths
- **Agents** -- specialized roles (dev, cto, ceo, feedback, marketing) that execute tasks autonomously

## Prerequisites

- **Git** >= 2.30
- **Node.js** >= 18 (if applicable once code is added)
- **wanman CLI** installed and configured

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd temp-wanman-test1

# If wanman is not yet installed
npm install -g wanman   # or follow wanman installation docs
```

## Usage

### Running with wanman

```bash
# List current initiatives
wanman initiative list

# List tasks
wanman task list

# Create a new task
wanman task create "Description of work" --path <file-path>

# Create a capsule before making code changes
wanman capsule create --task <task-id> --initiative <initiative-id> --paths <file-paths>
```

### Manual Development

```bash
# Create a feature branch
git checkout -b wanman/<task-slug>

# Make changes, then push
git push -u origin wanman/<task-slug>

# Open a pull request
gh pr create --title "Brief description" --body "Details"
```

## Project Structure

```
.
├── .wanman/          # wanman orchestration state and agent configs
│   ├── agents/       # per-agent working directories
│   ├── worktree/     # isolated git worktree for agent work
│   └── skills/       # skill snapshots and definitions
├── CHANGELOG.md      # release history
├── LICENSE           # project license
├── README.md         # this file
└── (source files)    # added as the project evolves
```

## Roadmap

| Phase | Goal | Status |
|-------|------|--------|
| **0 -- Foundation** | README, LICENSE, .gitignore, CHANGELOG scaffolding | In Progress |
| **1 -- Scaffolding** | Choose stack, initialize package manifest, set up CI, add CONTRIBUTING.md | Planned |
| **2 -- First Feature** | Implement core feature v0.1, write tests (>= 95% coverage), cut first release | Planned |

> The language/framework and project domain are pending a human decision. Once confirmed, Phase 1 tasks will be created automatically by the CEO agent.

## Development

### Branch Naming

All feature branches follow the convention: `wanman/<task-slug>`

### Workflow

1. **CEO** decomposes initiatives into tasks and creates capsules
2. **Dev** agents pick up tasks, create feature branches, implement changes with tests
3. **CTO** reviews PRs (coverage >= 95% gate), approves or requests changes
4. **Feedback** agents audit and propose improvements

### Code Quality

- All PRs require test coverage >= 95%
- Changes must stay within their capsule boundary
- Out-of-scope discoveries should be reported as follow-up tasks

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a branch** following the naming convention: `wanman/<descriptive-slug>`
3. **Make your changes** -- keep them scoped and well-tested
4. **Run tests** with coverage before pushing:
   ```bash
   # Run tests (command TBD based on project stack)
   npm test          # or equivalent
   ```
5. **Open a Pull Request** with a clear title and description
6. **Wait for review** -- the CTO agent or a maintainer will review your PR

### Guidelines

- Keep commits atomic and well-described
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation when changing behavior
- Do not commit secrets, credentials, or `.env` files

### Reporting Issues

If you find a bug or have a feature request, please open an issue with:
- A clear description of the problem or proposal
- Steps to reproduce (for bugs)
- Expected vs actual behavior

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

*This project is managed by autonomous agents via [wanman](https://github.com/anthropics/wanman). README last updated: 2026-04-27.*
