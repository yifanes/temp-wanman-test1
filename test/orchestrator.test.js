'use strict';

const { orchestrate, _reset } = require('../src/orchestrator');

beforeEach(() => {
  _reset();
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
describe('orchestrate – validation', () => {
  it('throws if config is not provided', () => {
    expect(() => orchestrate()).toThrow(TypeError);
    expect(() => orchestrate()).toThrow('config must be a non-null object');
  });

  it('throws if config is null', () => {
    expect(() => orchestrate(null)).toThrow(TypeError);
  });

  it('throws if config is an array', () => {
    expect(() => orchestrate([])).toThrow(TypeError);
  });

  it('throws if config is a primitive', () => {
    expect(() => orchestrate('hello')).toThrow(TypeError);
    expect(() => orchestrate(42)).toThrow(TypeError);
  });

  it('throws if config.agents is missing', () => {
    expect(() => orchestrate({ tasks: [] })).toThrow('config.agents must be a non-empty array');
  });

  it('throws if config.agents is empty', () => {
    expect(() => orchestrate({ agents: [], tasks: [] })).toThrow(
      'config.agents must be a non-empty array',
    );
  });

  it('throws if config.tasks is missing', () => {
    expect(() => orchestrate({ agents: [{ name: 'a', role: 'dev' }] })).toThrow(
      'config.tasks must be an array',
    );
  });

  it('throws if a task is not an object', () => {
    expect(() =>
      orchestrate({
        agents: [{ name: 'a', role: 'dev' }],
        tasks: [null],
      }),
    ).toThrow('each task must be a non-null object');
  });

  it('throws if a task has no title', () => {
    expect(() =>
      orchestrate({
        agents: [{ name: 'a', role: 'dev' }],
        tasks: [{ role: 'dev' }],
      }),
    ).toThrow('each task must have a non-empty title');
  });

  it('throws if a task title is blank', () => {
    expect(() =>
      orchestrate({
        agents: [{ name: 'a', role: 'dev' }],
        tasks: [{ title: '  ', role: 'dev' }],
      }),
    ).toThrow('each task must have a non-empty title');
  });

  it('throws if a task has no role', () => {
    expect(() =>
      orchestrate({
        agents: [{ name: 'a', role: 'dev' }],
        tasks: [{ title: 'foo' }],
      }),
    ).toThrow('each task must have a non-empty role');
  });

  it('throws if a task role is blank', () => {
    expect(() =>
      orchestrate({
        agents: [{ name: 'a', role: 'dev' }],
        tasks: [{ title: 'foo', role: '  ' }],
      }),
    ).toThrow('each task must have a non-empty role');
  });
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------
describe('orchestrate – happy path', () => {
  it('completes a single task dispatched to a matching agent', () => {
    const result = orchestrate({
      agents: [{ name: 'alice', role: 'dev' }],
      tasks: [{ title: 'Write code', role: 'dev' }],
    });

    expect(result.total).toBe(1);
    expect(result.completed).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.agents).toBe(1);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({
      title: 'Write code',
      status: 'completed',
      assignedTo: 'alice',
      role: 'dev',
      error: null,
    });
  });

  it('processes multiple tasks with multiple agents', () => {
    const result = orchestrate({
      agents: [
        { name: 'alice', role: 'dev' },
        { name: 'bob', role: 'qa' },
      ],
      tasks: [
        { title: 'Build feature', role: 'dev' },
        { title: 'Test feature', role: 'qa' },
      ],
    });

    expect(result.total).toBe(2);
    expect(result.completed).toBe(2);
    expect(result.failed).toBe(0);
  });

  it('handles empty tasks array', () => {
    const result = orchestrate({
      agents: [{ name: 'alice', role: 'dev' }],
      tasks: [],
    });

    expect(result.total).toBe(0);
    expect(result.completed).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.results).toHaveLength(0);
  });

  it('respects task priority ordering', () => {
    const result = orchestrate({
      agents: [{ name: 'alice', role: 'dev' }],
      tasks: [
        { title: 'Low priority', role: 'dev', priority: 10 },
        { title: 'High priority', role: 'dev', priority: 1 },
      ],
    });

    expect(result.total).toBe(2);
    expect(result.completed).toBe(2);
    // Higher priority (lower number) processed first
    expect(result.results[0].title).toBe('High priority');
    expect(result.results[1].title).toBe('Low priority');
  });
});

// ---------------------------------------------------------------------------
// Failure paths
// ---------------------------------------------------------------------------
describe('orchestrate – failure handling', () => {
  it('marks a task as failed when no agent matches the role', () => {
    const result = orchestrate({
      agents: [{ name: 'alice', role: 'dev' }],
      tasks: [{ title: 'Deploy', role: 'ops' }],
    });

    expect(result.total).toBe(1);
    expect(result.completed).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.results[0]).toMatchObject({
      title: 'Deploy',
      status: 'failed',
      assignedTo: null,
      role: 'ops',
    });
    expect(result.results[0].error).toBeTruthy();
  });

  it('mixes completed and failed tasks', () => {
    const result = orchestrate({
      agents: [{ name: 'alice', role: 'dev' }],
      tasks: [
        { title: 'Write code', role: 'dev' },
        { title: 'Deploy', role: 'ops' },
      ],
    });

    expect(result.total).toBe(2);
    expect(result.completed).toBe(1);
    expect(result.failed).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// resetBefore option
// ---------------------------------------------------------------------------
describe('orchestrate – resetBefore option', () => {
  it('resets state by default between runs', () => {
    const first = orchestrate({
      agents: [{ name: 'alice', role: 'dev' }],
      tasks: [{ title: 'Task 1', role: 'dev' }],
    });

    const second = orchestrate({
      agents: [{ name: 'alice', role: 'dev' }],
      tasks: [{ title: 'Task 2', role: 'dev' }],
    });

    // Each run should be independent
    expect(first.completed).toBe(1);
    expect(second.completed).toBe(1);
  });

  it('preserves state when resetBefore is false', () => {
    orchestrate({
      agents: [{ name: 'alice', role: 'dev' }],
      tasks: [{ title: 'Task 1', role: 'dev' }],
    });

    // Second run without reset — agents already registered
    const second = orchestrate({
      resetBefore: false,
      agents: [{ name: 'bob', role: 'qa' }],
      tasks: [{ title: 'QA task', role: 'qa' }],
    });

    expect(second.completed).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// _reset
// ---------------------------------------------------------------------------
describe('_reset', () => {
  it('clears internal state without throwing', () => {
    expect(() => _reset()).not.toThrow();
  });
});
