'use strict';

/**
 * Minimal CLI entry point for wanman.
 *
 * Parses commands (run, list, help) and wires them to the orchestrator
 * and taskRunner modules.
 *
 * @module cli
 */

const { orchestrate } = require('./orchestrator');
const { listTasks } = require('./taskRunner');

/** Current CLI version — matches package.json */
const VERSION = '0.1.0';

/**
 * Help text displayed for the `help` command or when no command is given.
 * @type {string}
 */
const HELP_TEXT = `wanman — autonomous multi-agent task orchestration framework

Usage:
  wanman <command> [options]

Commands:
  run     Orchestrate a run from a JSON config (stdin or --config <file>)
  list    List current in-memory tasks (optionally filter by --status)
  help    Show this help message

Options:
  --version   Show version number
  --config    Path to JSON config file (for run command)
  --status    Filter tasks by status: pending | completed (for list command)

Examples:
  wanman run --config tasks.json
  wanman list --status pending
  wanman help`;

/**
 * Parse raw argv into a structured command object.
 *
 * @param {string[]} argv - The process.argv slice (typically process.argv.slice(2)).
 * @returns {{ command: string, options: Object }} Parsed command and options.
 */
function parseArgs(argv) {
  if (!Array.isArray(argv)) {
    throw new TypeError('argv must be an array');
  }

  const args = argv.map(String);
  const command = args.length > 0 ? args[0] : 'help';
  const options = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--version') {
      options.version = true;
    } else if (arg === '--config') {
      if (i + 1 < args.length) {
        options.config = args[++i];
      }
      // If no value follows, silently ignore the flag
    } else if (arg === '--status') {
      if (i + 1 < args.length) {
        options.status = args[++i];
      }
      // If no value follows, silently ignore the flag
    } else if (arg.startsWith('--')) {
      // Unknown flag — store as boolean
      const key = arg.slice(2);
      if (key.length > 0) {
        options[key] = true;
      }
    }
  }

  return { command, options };
}

/**
 * Execute the `run` command — orchestrate tasks from a config object.
 *
 * @param {Object} config - Orchestration config (agents + tasks).
 * @param {{ write: Function }} [io] - Output sink (default: process.stdout).
 * @returns {{ completed: number, failed: number, total: number, results: Array }} Run summary.
 */
function runCommand(config, io) {
  const out = io || { write: /* istanbul ignore next */ (s) => process.stdout.write(s) };

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('config must be a non-null object');
  }

  const summary = orchestrate(config);

  out.write(`Run complete: ${summary.completed}/${summary.total} tasks succeeded`);
  if (summary.failed > 0) {
    out.write(` (${summary.failed} failed)`);
  }
  out.write('\n');

  return summary;
}

/**
 * Execute the `list` command — display in-memory tasks.
 *
 * @param {{ status?: string }} options - Optional status filter.
 * @param {{ write: Function }} [io] - Output sink (default: process.stdout).
 * @returns {Array<Object>} The listed tasks.
 */
function listCommand(options, io) {
  const out = io || { write: /* istanbul ignore next */ (s) => process.stdout.write(s) };
  const opts = options || {};

  const tasks = listTasks(opts.status);

  if (tasks.length === 0) {
    out.write('No tasks found.\n');
  } else {
    out.write(`Found ${tasks.length} task(s):\n`);
    for (const task of tasks) {
      out.write(`  [${task.id}] ${task.title} (${task.status})\n`);
    }
  }

  return tasks;
}

/**
 * Execute the `help` command — print help text.
 *
 * @param {{ write: Function }} [io] - Output sink (default: process.stdout).
 * @returns {string} The help text.
 */
function helpCommand(io) {
  const out = io || { write: /* istanbul ignore next */ (s) => process.stdout.write(s) };
  out.write(HELP_TEXT + '\n');
  return HELP_TEXT;
}

/**
 * Execute the `--version` flag — print version.
 *
 * @param {{ write: Function }} [io] - Output sink (default: process.stdout).
 * @returns {string} The version string.
 */
function versionCommand(io) {
  const out = io || { write: /* istanbul ignore next */ (s) => process.stdout.write(s) };
  out.write(`wanman v${VERSION}\n`);
  return VERSION;
}

/**
 * Main CLI dispatcher. Parses argv, routes to the correct sub-command.
 *
 * @param {string[]} argv - Typically process.argv.slice(2).
 * @param {Object} [deps] - Injectable dependencies for testing.
 * @param {Function} [deps.readConfig] - Reads and parses a config file (path → object).
 * @param {{ write: Function }} [deps.io] - Output sink.
 * @returns {*} The result of the dispatched command.
 */
function main(argv, deps) {
  const { command, options } = parseArgs(argv || []);
  const d = deps || {};
  const io = d.io || { write: /* istanbul ignore next */ (s) => process.stdout.write(s) };

  // --version flag takes precedence regardless of command
  if (options.version) {
    return versionCommand(io);
  }

  switch (command) {
    case 'run': {
      if (!options.config) {
        throw new Error('run command requires --config <file>');
      }
      if (typeof d.readConfig !== 'function') {
        throw new Error('readConfig dependency is required for the run command');
      }
      const config = d.readConfig(options.config);
      return runCommand(config, io);
    }

    case 'list':
      return listCommand(options, io);

    case 'help':
      return helpCommand(io);

    default:
      io.write(`Unknown command: ${command}\n`);
      return helpCommand(io);
  }
}

module.exports = {
  parseArgs,
  runCommand,
  listCommand,
  helpCommand,
  versionCommand,
  main,
  VERSION,
  HELP_TEXT,
};
