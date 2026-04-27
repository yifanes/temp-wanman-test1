'use strict';

const index = require('../src/index');

// ── helloWorld (backward compat) ────────────────────────────────────

describe('helloWorld', () => {
  it('returns "Hello, World!" when called without arguments', () => {
    expect(index.helloWorld()).toBe('Hello, World!');
  });

  it('returns "Hello, World!" when called with undefined', () => {
    expect(index.helloWorld(undefined)).toBe('Hello, World!');
  });

  it('returns "Hello, World!" when called with empty string', () => {
    expect(index.helloWorld('')).toBe('Hello, World!');
  });

  it('greets by name when a name is provided', () => {
    expect(index.helloWorld('Alice')).toBe('Hello, Alice!');
  });

  it('greets with any string value', () => {
    expect(index.helloWorld('wanman')).toBe('Hello, wanman!');
  });
});

// ── taskRunner re-exports ───────────────────────────────────────────

describe('taskRunner re-exports', () => {
  afterEach(() => {
    index._resetTaskRunner();
  });

  it('exports createTask', () => {
    expect(typeof index.createTask).toBe('function');
  });

  it('exports listTasks', () => {
    expect(typeof index.listTasks).toBe('function');
  });

  it('exports completeTask', () => {
    expect(typeof index.completeTask).toBe('function');
  });

  it('exports _resetTaskRunner', () => {
    expect(typeof index._resetTaskRunner).toBe('function');
  });

  it('createTask works through index', () => {
    const task = index.createTask('Test task');
    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Test task');
    expect(task.status).toBe('pending');
  });

  it('listTasks returns tasks created through index', () => {
    index.createTask('Task A');
    index.createTask('Task B');
    const all = index.listTasks();
    expect(all).toHaveLength(2);
  });

  it('completeTask works through index', () => {
    const task = index.createTask('Complete me');
    const completed = index.completeTask(task.id);
    expect(completed.status).toBe('completed');
  });
});

// ── taskQueue re-exports ────────────────────────────────────────────

describe('taskQueue re-exports', () => {
  it('exports createTaskQueue', () => {
    expect(typeof index.createTaskQueue).toBe('function');
  });

  it('exports PRIORITY_MIN', () => {
    expect(index.PRIORITY_MIN).toBe(1);
  });

  it('exports PRIORITY_MAX', () => {
    expect(index.PRIORITY_MAX).toBe(10);
  });

  it('exports PRIORITY_DEFAULT', () => {
    expect(index.PRIORITY_DEFAULT).toBe(5);
  });

  it('createTaskQueue returns a working queue', () => {
    const q = index.createTaskQueue();
    q.enqueue('item-a', 2);
    q.enqueue('item-b', 1);
    expect(q.size()).toBe(2);
    expect(q.dequeue().item).toBe('item-b'); // higher priority
  });
});

// ── agentRegistry re-exports ────────────────────────────────────────

describe('agentRegistry re-exports', () => {
  afterEach(() => {
    index._resetAgentRegistry();
  });

  it('exports registerAgent', () => {
    expect(typeof index.registerAgent).toBe('function');
  });

  it('exports getAgent', () => {
    expect(typeof index.getAgent).toBe('function');
  });

  it('exports listAgents', () => {
    expect(typeof index.listAgents).toBe('function');
  });

  it('exports updateStatus', () => {
    expect(typeof index.updateStatus).toBe('function');
  });

  it('exports unregisterAgent', () => {
    expect(typeof index.unregisterAgent).toBe('function');
  });

  it('exports dispatch', () => {
    expect(typeof index.dispatch).toBe('function');
  });

  it('exports _resetAgentRegistry', () => {
    expect(typeof index._resetAgentRegistry).toBe('function');
  });

  it('registerAgent works through index', () => {
    const agent = index.registerAgent({ name: 'bot-1', role: 'dev' });
    expect(agent.name).toBe('bot-1');
    expect(agent.role).toBe('dev');
    expect(agent.status).toBe('active');
  });

  it('getAgent finds registered agent through index', () => {
    index.registerAgent({ name: 'bot-2', role: 'cto' });
    const found = index.getAgent('bot-2');
    expect(found).not.toBeNull();
    expect(found.role).toBe('cto');
  });

  it('dispatch works through index', () => {
    index.registerAgent({ name: 'worker-1', role: 'runner' });
    const dispatched = index.dispatch('runner');
    expect(dispatched.name).toBe('worker-1');
  });
});
