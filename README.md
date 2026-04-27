# temp-wanman-test1

A demonstration project showcasing [wanman](https://github.com/anthropics/wanman) -- an autonomous multi-agent task orchestration framework for software development.

> **Status:** Active Development | Phase 4 -- Orchestration

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
- **Node.js** >= 18
- **wanman CLI** installed and configured

## Installation

```bash
# Clone the repository
git clone https://github.com/yifanes/temp-wanman-test1.git
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

### Using taskRunner

`src/taskRunner.js` provides lightweight in-memory task orchestration:

```js
const { createTask, listTasks, completeTask } = require('./src/taskRunner');

// Create a task
const task = createTask('Write unit tests');
// => { id: 1, title: 'Write unit tests', status: 'pending', createdAt: Date, completedAt: null }

// List all tasks (or filter by status)
listTasks();            // all tasks
listTasks('pending');   // pending only
listTasks('completed'); // completed only

// Mark a task done
completeTask(task.id);
// => { id: 1, ..., status: 'completed', completedAt: Date }
```

### Using taskQueue

`src/taskQueue.js` provides a priority-based min-heap task queue:

```js
const { enqueue, dequeue, peek, size } = require('./src/taskQueue');

enqueue({ title: 'Urgent fix', priority: 1 });
enqueue({ title: 'Nice to have', priority: 5 });

peek();    // returns highest-priority item without removing it
dequeue(); // removes and returns highest-priority item
size();    // current queue depth
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
├── .github/              # GitHub Actions workflows and PR/issue templates
│   └── workflows/        # CI pipeline definitions
├── .wanman/              # wanman orchestration state and agent configs
│   ├── agents/           # per-agent working directories
│   ├── worktree/         # isolated git worktree for agent work
│   └── skills/           # skill snapshots and definitions
├── src/                  # source code
│   ├── index.js          # entry point — re-exports all public modules
│   ├── taskRunner.js     # in-memory task orchestration: createTask, listTasks, completeTask
│   ├── taskQueue.js      # priority-based min-heap task queue: enqueue, dequeue, peek, size
│   ├── agentRegistry.js  # agent registration, lookup, role/status filtering, round-robin dispatch
│   └── eventBus.js       # lightweight pub/sub event bus for task lifecycle hooks
├── test/                 # test suite
│   ├── index.test.js     # unit tests for index.js (100% coverage)
│   ├── taskRunner.test.js    # unit tests for taskRunner (100% coverage)
│   ├── taskQueue.test.js     # unit tests for taskQueue (100% coverage, 92 tests)
│   ├── agentRegistry.test.js # unit tests for agentRegistry (100% coverage, 40 tests)
│   └── integration.test.js   # integration tests — taskRunner+taskQueue+agentRegistry (23 tests)
├── CHANGELOG.md          # release history
├── CONTRIBUTING.md       # contribution guidelines
├── LICENSE               # project license
├── package.json          # Node.js manifest, scripts, and release config
├── README.md             # this file
└── SECURITY.md           # security policy and vulnerability reporting
```

## Roadmap

| Phase | Goal | Status |
|-------|------|--------|
| **0 -- Foundation** | README, LICENSE, .gitignore, CHANGELOG scaffolding | ✅ Done |
| **1 -- Scaffolding** | Choose stack, initialize package manifest, set up CI, add CONTRIBUTING.md | ✅ Done |
| **2 -- First Feature** | Implement core feature v0.1, write tests (>= 95% coverage), cut v0.1.0 release | ✅ Done |
| **3 -- Core Modules** | Add `taskQueue`, `agentRegistry`, `eventBus`; re-export all from `index.js`; 155+ tests; npm publish readiness | ✅ Done |
| **4 -- Orchestration** | Implement `orchestrator.js` (coordinate taskRunner+taskQueue+agentRegistry); add `bin/cli.js` CLI entry point | 🚧 In Progress |

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

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for the full development workflow, branch naming conventions, and PR guidelines.

Here's a quick summary of how to get started:

1. **Fork** the repository
2. **Create a branch** following the naming convention: `wanman/<descriptive-slug>`
3. **Make your changes** -- keep them scoped and well-tested
4. **Run tests** with coverage before pushing:
   ```bash
   npm test
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

*This project is managed by autonomous agents via [wanman](https://github.com/anthropics/wanman). README last updated: 2026-04-27. Roadmap: Phase 0–3 complete (v0.1.0 released, core modules shipped); Phase 4 (orchestration) in progress.*
