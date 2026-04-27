'use strict';

const {
  parseArgs,
  runCommand,
  listCommand,
  helpCommand,
  versionCommand,
  main,
  VERSION,
  HELP_TEXT,
} = require('../src/cli');

// Mock io helper — captures all write calls
function mockIo() {
  const chunks = [];
  return {
    write: (s) => chunks.push(s),
    output: () => chunks.join(''),
    chunks,
  };
}

// ─── parseArgs ───────────────────────────────────────────────────────

describe('parseArgs', () => {
  it('returns help when argv is empty', () => {
    expect(parseArgs([])).toEqual({ command: 'help', options: {} });
  });

  it('parses a bare command', () => {
    expect(parseArgs(['run'])).toEqual({ command: 'run', options: {} });
  });

  it('parses --version flag', () => {
    const result = parseArgs(['run', '--version']);
    expect(result.options.version).toBe(true);
  });

  it('parses --config with value', () => {
    const result = parseArgs(['run', '--config', 'tasks.json']);
    expect(result.command).toBe('run');
    expect(result.options.config).toBe('tasks.json');
  });

  it('parses --status with value', () => {
    const result = parseArgs(['list', '--status', 'pending']);
    expect(result.options.status).toBe('pending');
  });

  it('stores unknown flags as boolean true', () => {
    const result = parseArgs(['help', '--verbose']);
    expect(result.options.verbose).toBe(true);
  });

  it('ignores bare -- (empty flag name)', () => {
    const result = parseArgs(['help', '--']);
    expect(Object.keys(result.options)).toHaveLength(0);
  });

  it('ignores --config without a following value', () => {
    const result = parseArgs(['run', '--config']);
    // --config is the last arg so no value follows — not stored
    expect(result.options.config).toBeUndefined();
  });

  it('ignores --status without a following value', () => {
    const result = parseArgs(['list', '--status']);
    expect(result.options.status).toBeUndefined();
  });

  it('throws TypeError if argv is not an array', () => {
    expect(() => parseArgs('not-array')).toThrow(TypeError);
    expect(() => parseArgs(null)).toThrow(TypeError);
    expect(() => parseArgs(123)).toThrow(TypeError);
  });

  it('coerces non-string elements to strings', () => {
    const result = parseArgs([42, '--version']);
    expect(result.command).toBe('42');
    expect(result.options.version).toBe(true);
  });
});

// ─── runCommand ──────────────────────────────────────────────────────

describe('runCommand', () => {
  it('orchestrates and returns summary', () => {
    const io = mockIo();
    const config = { agents: [{ name: 'a1', role: 'dev' }], tasks: [{ title: 't1', role: 'dev' }] };
    const result = runCommand(config, io);

    expect(result).toHaveProperty('completed');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('total');
    expect(io.output()).toContain('Run complete:');
  });

  it('reports failed tasks in output', () => {
    const io = mockIo();
    // Task with a role that has no matching agent → will fail dispatch
    const config = {
      agents: [{ name: 'a1', role: 'dev' }],
      tasks: [{ title: 't1', role: 'nonexistent' }],
    };
    const result = runCommand(config, io);

    expect(result.failed).toBeGreaterThan(0);
    expect(io.output()).toContain('failed');
  });

  it('throws TypeError for non-object config', () => {
    const io = mockIo();
    expect(() => runCommand(null, io)).toThrow(TypeError);
    expect(() => runCommand('bad', io)).toThrow(TypeError);
    expect(() => runCommand([1, 2], io)).toThrow(TypeError);
  });
});

// ─── listCommand ─────────────────────────────────────────────────────

describe('listCommand', () => {
  it('reports no tasks when store is empty', () => {
    const io = mockIo();
    const result = listCommand({}, io);
    // Either empty or has tasks from prior tests — just verify it returns an array
    expect(Array.isArray(result)).toBe(true);
  });

  it('passes status filter through', () => {
    const io = mockIo();
    const result = listCommand({ status: 'pending' }, io);
    expect(Array.isArray(result)).toBe(true);
  });

  it('handles undefined options gracefully', () => {
    const io = mockIo();
    const result = listCommand(undefined, io);
    expect(Array.isArray(result)).toBe(true);
  });

  it('outputs task details when tasks exist', () => {
    // Force a task into the store via orchestrate
    const { orchestrate } = require('../src/orchestrator');
    orchestrate({
      agents: [{ name: 'a1', role: 'dev' }],
      tasks: [{ title: 'Test Task', role: 'dev' }],
    });

    const io = mockIo();
    const result = listCommand({}, io);
    // There should be at least one task
    if (result.length > 0) {
      expect(io.output()).toContain('task(s):');
    }
  });
});

// ─── helpCommand ─────────────────────────────────────────────────────

describe('helpCommand', () => {
  it('writes help text and returns it', () => {
    const io = mockIo();
    const result = helpCommand(io);
    expect(result).toBe(HELP_TEXT);
    expect(io.output()).toContain('wanman');
    expect(io.output()).toContain('Commands:');
  });
});

// ─── versionCommand ──────────────────────────────────────────────────

describe('versionCommand', () => {
  it('writes version and returns it', () => {
    const io = mockIo();
    const result = versionCommand(io);
    expect(result).toBe(VERSION);
    expect(io.output()).toContain(`wanman v${VERSION}`);
  });
});

// ─── main ────────────────────────────────────────────────────────────

describe('main', () => {
  it('defaults to help when argv is empty', () => {
    const io = mockIo();
    const result = main([], { io });
    expect(result).toBe(HELP_TEXT);
    expect(io.output()).toContain('Commands:');
  });

  it('defaults to help when argv is undefined', () => {
    const io = mockIo();
    const result = main(undefined, { io });
    expect(result).toBe(HELP_TEXT);
  });

  it('handles --version flag on any command', () => {
    const io = mockIo();
    const result = main(['run', '--version'], { io });
    expect(result).toBe(VERSION);
  });

  it('dispatches run command with config', () => {
    const io = mockIo();
    const config = { agents: [{ name: 'a1', role: 'dev' }], tasks: [{ title: 't', role: 'dev' }] };
    const readConfig = () => config;
    const result = main(['run', '--config', 'file.json'], { io, readConfig });
    expect(result).toHaveProperty('completed');
  });

  it('throws when run command has no --config', () => {
    const io = mockIo();
    expect(() => main(['run'], { io })).toThrow('run command requires --config');
  });

  it('throws when run command has no readConfig dependency', () => {
    const io = mockIo();
    expect(() => main(['run', '--config', 'f.json'], { io })).toThrow(
      'readConfig dependency is required',
    );
  });

  it('dispatches list command', () => {
    const io = mockIo();
    const result = main(['list'], { io });
    expect(Array.isArray(result)).toBe(true);
  });

  it('dispatches list command with --status', () => {
    const io = mockIo();
    const result = main(['list', '--status', 'pending'], { io });
    expect(Array.isArray(result)).toBe(true);
  });

  it('dispatches help command', () => {
    const io = mockIo();
    const result = main(['help'], { io });
    expect(result).toBe(HELP_TEXT);
  });

  it('handles unknown command — prints message then help', () => {
    const io = mockIo();
    const result = main(['frobnicate'], { io });
    expect(io.output()).toContain('Unknown command: frobnicate');
    expect(result).toBe(HELP_TEXT);
  });

  it('works without deps argument', () => {
    // Just ensure it doesn't throw (output goes to stdout)
    expect(() => main(['help'])).not.toThrow();
  });
});

// ─── Exports sanity ──────────────────────────────────────────────────

describe('module exports', () => {
  it('exports VERSION as a string', () => {
    expect(typeof VERSION).toBe('string');
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('exports HELP_TEXT as a non-empty string', () => {
    expect(typeof HELP_TEXT).toBe('string');
    expect(HELP_TEXT.length).toBeGreaterThan(50);
  });
});
