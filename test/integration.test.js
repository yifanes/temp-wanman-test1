'use strict';

/**
 * Integration tests — taskRunner + taskQueue + agentRegistry working together.
 *
 * These tests verify the end-to-end flow of creating tasks, queueing them
 * by priority, registering agents, dispatching agents to process tasks,
 * and completing tasks through the full pipeline.
 */

const { createTask, listTasks, completeTask, _reset: resetRunner } = require('../src/taskRunner');
const { createTaskQueue } = require('../src/taskQueue');
const {
  registerAgent,
  getAgent,
  listAgents,
  updateStatus,
  unregisterAgent,
  dispatch,
  _reset: resetRegistry,
} = require('../src/agentRegistry');

/** Reset all module state between tests */
beforeEach(() => {
  resetRunner();
  resetRegistry();
});

// ─── End-to-end pipeline ─────────────────────────────────────────────

describe('end-to-end: task creation → queue → agent dispatch → completion', () => {
  test('creates tasks, queues them by priority, dispatches agents, and completes', () => {
    // 1. Register agents
    const devAgent = registerAgent({ name: 'dev-1', role: 'developer' });
    const qaAgent = registerAgent({ name: 'qa-1', role: 'tester' });

    expect(devAgent.status).toBe('active');
    expect(qaAgent.status).toBe('active');

    // 2. Create tasks via taskRunner
    const taskA = createTask('Implement feature X');
    const taskB = createTask('Write tests for feature X');
    const taskC = createTask('Fix critical bug Y');

    expect(listTasks()).toHaveLength(3);

    // 3. Enqueue tasks with priorities (bug fix is highest priority)
    const queue = createTaskQueue();
    queue.enqueue(taskC, 1); // critical — highest priority
    queue.enqueue(taskA, 3); // feature — medium
    queue.enqueue(taskB, 5); // tests — normal

    expect(queue.size()).toBe(3);

    // 4. Process tasks in priority order by dispatching agents
    const firstTask = queue.dequeue();
    expect(firstTask.item.title).toBe('Fix critical bug Y');

    const assignedDev = dispatch('developer');
    expect(assignedDev.name).toBe('dev-1');

    // Complete the critical bug fix
    const completed = completeTask(firstTask.item.id);
    expect(completed.status).toBe('completed');

    // 5. Continue processing
    const secondTask = queue.dequeue();
    expect(secondTask.item.title).toBe('Implement feature X');

    const thirdTask = queue.dequeue();
    expect(thirdTask.item.title).toBe('Write tests for feature X');

    // Dispatch tester for the test-writing task
    const assignedTester = dispatch('tester');
    expect(assignedTester.name).toBe('qa-1');

    completeTask(secondTask.item.id);
    completeTask(thirdTask.item.id);

    // 6. Verify all tasks completed
    expect(listTasks('completed')).toHaveLength(3);
    expect(listTasks('pending')).toHaveLength(0);
    expect(queue.size()).toBe(0);
  });

  test('round-robin dispatch distributes tasks across agents with the same role', () => {
    registerAgent({ name: 'dev-1', role: 'developer' });
    registerAgent({ name: 'dev-2', role: 'developer' });
    registerAgent({ name: 'dev-3', role: 'developer' });

    const queue = createTaskQueue();

    // Create and queue 6 tasks
    for (let i = 1; i <= 6; i++) {
      const task = createTask(`Task ${i}`);
      queue.enqueue(task, 5);
    }

    // Dispatch developer for each task — should round-robin
    const dispatched = [];
    for (let i = 0; i < 6; i++) {
      queue.dequeue();
      dispatched.push(dispatch('developer').name);
    }

    // Round-robin: dev-1, dev-2, dev-3, dev-1, dev-2, dev-3
    expect(dispatched).toEqual([
      'dev-1', 'dev-2', 'dev-3',
      'dev-1', 'dev-2', 'dev-3',
    ]);
  });
});

// ─── Agent status affects dispatch ───────────────────────────────────

describe('agent status transitions affect task dispatch', () => {
  test('offline agents are skipped during dispatch', () => {
    registerAgent({ name: 'dev-1', role: 'developer' });
    registerAgent({ name: 'dev-2', role: 'developer' });

    // Take dev-1 offline
    updateStatus('dev-1', 'offline');

    const task = createTask('Urgent fix');
    const queue = createTaskQueue();
    queue.enqueue(task, 1);
    queue.dequeue();

    // Only dev-2 should receive dispatch
    const assigned = dispatch('developer');
    expect(assigned.name).toBe('dev-2');
  });

  test('idle agents are skipped during dispatch', () => {
    registerAgent({ name: 'agent-a', role: 'worker' });
    registerAgent({ name: 'agent-b', role: 'worker' });

    updateStatus('agent-a', 'idle');

    const assigned = dispatch('worker');
    expect(assigned.name).toBe('agent-b');
  });

  test('reactivated agent becomes eligible for dispatch again', () => {
    registerAgent({ name: 'solo', role: 'worker' });

    // Take offline
    updateStatus('solo', 'offline');
    expect(() => dispatch('worker')).toThrow(/no active agent/);

    // Reactivate
    updateStatus('solo', 'active');
    const assigned = dispatch('worker');
    expect(assigned.name).toBe('solo');
  });

  test('unregistered agent is no longer dispatchable', () => {
    registerAgent({ name: 'temp', role: 'worker' });
    expect(dispatch('worker').name).toBe('temp');

    unregisterAgent('temp');
    expect(() => dispatch('worker')).toThrow(/no active agent/);
  });
});

// ─── Queue priority ordering with real tasks ─────────────────────────

describe('queue priority ordering with taskRunner tasks', () => {
  test('dequeue returns tasks in priority order regardless of insertion order', () => {
    const queue = createTaskQueue();

    const low = createTask('Low priority chore');
    const high = createTask('High priority fix');
    const medium = createTask('Medium priority feature');

    queue.enqueue(low, 8);
    queue.enqueue(high, 1);
    queue.enqueue(medium, 5);

    expect(queue.dequeue().item.title).toBe('High priority fix');
    expect(queue.dequeue().item.title).toBe('Medium priority feature');
    expect(queue.dequeue().item.title).toBe('Low priority chore');
  });

  test('FIFO within same priority level', () => {
    const queue = createTaskQueue();

    const t1 = createTask('First at priority 3');
    const t2 = createTask('Second at priority 3');
    const t3 = createTask('Third at priority 3');

    queue.enqueue(t1, 3);
    queue.enqueue(t2, 3);
    queue.enqueue(t3, 3);

    expect(queue.dequeue().item.title).toBe('First at priority 3');
    expect(queue.dequeue().item.title).toBe('Second at priority 3');
    expect(queue.dequeue().item.title).toBe('Third at priority 3');
  });

  test('toArray snapshot reflects correct ordering', () => {
    const queue = createTaskQueue();

    queue.enqueue(createTask('C'), 7);
    queue.enqueue(createTask('A'), 2);
    queue.enqueue(createTask('B'), 5);

    const snapshot = queue.toArray();
    expect(snapshot.map((e) => e.item.title)).toEqual(['A', 'B', 'C']);
    expect(snapshot.map((e) => e.priority)).toEqual([2, 5, 7]);
  });
});

// ─── Multi-role dispatch pipeline ────────────────────────────────────

describe('multi-role agent pipeline', () => {
  test('tasks flow through dev → review → deploy pipeline', () => {
    // Register multi-role team
    registerAgent({ name: 'alice', role: 'developer' });
    registerAgent({ name: 'bob', role: 'reviewer' });
    registerAgent({ name: 'charlie', role: 'deployer' });

    // Create task
    const task = createTask('Ship feature Z');
    const queue = createTaskQueue();
    queue.enqueue(task, 3);

    // Phase 1: Development
    const devTask = queue.dequeue();
    const dev = dispatch('developer');
    expect(dev.name).toBe('alice');
    expect(devTask.item.title).toBe('Ship feature Z');

    // Phase 2: Review (re-queue for review)
    queue.enqueue(devTask.item, 2);
    const reviewTask = queue.dequeue();
    const reviewer = dispatch('reviewer');
    expect(reviewer.name).toBe('bob');

    // Phase 3: Deploy (re-queue for deploy)
    queue.enqueue(reviewTask.item, 1);
    const deployTask = queue.dequeue();
    const deployer = dispatch('deployer');
    expect(deployer.name).toBe('charlie');

    // Complete
    completeTask(deployTask.item.id);
    expect(listTasks('completed')).toHaveLength(1);
    expect(listTasks('completed')[0].title).toBe('Ship feature Z');
  });

  test('multiple agents per role with mixed statuses', () => {
    registerAgent({ name: 'dev-1', role: 'developer' });
    registerAgent({ name: 'dev-2', role: 'developer', status: 'idle' });
    registerAgent({ name: 'dev-3', role: 'developer' });
    registerAgent({ name: 'qa-1', role: 'tester' });
    registerAgent({ name: 'qa-2', role: 'tester', status: 'offline' });

    // Only active devs: dev-1, dev-3
    expect(dispatch('developer').name).toBe('dev-1');
    expect(dispatch('developer').name).toBe('dev-3');
    expect(dispatch('developer').name).toBe('dev-1'); // wraps

    // Only active tester: qa-1
    expect(dispatch('tester').name).toBe('qa-1');
    expect(dispatch('tester').name).toBe('qa-1'); // only one
  });
});

// ─── Error handling across modules ───────────────────────────────────

describe('cross-module error handling', () => {
  test('dispatching with no registered agents throws', () => {
    expect(() => dispatch('developer')).toThrow(/no active agent/);
  });

  test('completing a non-existent task ID throws', () => {
    expect(() => completeTask(999)).toThrow(/not found/);
  });

  test('double completion throws', () => {
    const task = createTask('One-time task');
    completeTask(task.id);
    expect(() => completeTask(task.id)).toThrow(/already completed/);
  });

  test('dequeue from empty queue throws', () => {
    const queue = createTaskQueue();
    expect(() => queue.dequeue()).toThrow(/empty/);
  });

  test('registering duplicate agent throws', () => {
    registerAgent({ name: 'dup', role: 'worker' });
    expect(() => registerAgent({ name: 'dup', role: 'worker' })).toThrow(/already registered/);
  });
});

// ─── Queue + Runner state isolation ──────────────────────────────────

describe('state isolation between queue instances and runner', () => {
  test('multiple queue instances operate independently', () => {
    const q1 = createTaskQueue();
    const q2 = createTaskQueue();

    const t1 = createTask('Task for Q1');
    const t2 = createTask('Task for Q2');

    q1.enqueue(t1, 1);
    q2.enqueue(t2, 1);

    expect(q1.size()).toBe(1);
    expect(q2.size()).toBe(1);

    const from1 = q1.dequeue();
    expect(from1.item.title).toBe('Task for Q1');

    const from2 = q2.dequeue();
    expect(from2.item.title).toBe('Task for Q2');

    // But taskRunner tracks both
    expect(listTasks()).toHaveLength(2);
  });

  test('queue clear does not affect taskRunner state', () => {
    const queue = createTaskQueue();
    const task = createTask('Persistent task');
    queue.enqueue(task, 5);

    queue.clear();
    expect(queue.size()).toBe(0);

    // Task still exists in runner
    expect(listTasks()).toHaveLength(1);
    expect(listTasks()[0].title).toBe('Persistent task');
  });

  test('completing task in runner does not remove it from queue', () => {
    const queue = createTaskQueue();
    const task = createTask('Complete me');
    queue.enqueue(task, 5);

    completeTask(task.id);

    // Queue still has the (now-stale) reference
    expect(queue.size()).toBe(1);
    const dequeued = queue.dequeue();
    // The task object in queue was captured before completion
    expect(dequeued.item.id).toBe(task.id);
  });
});

// ─── Bulk processing scenario ────────────────────────────────────────

describe('bulk task processing scenario', () => {
  test('process 20 tasks across 3 agents with mixed priorities', () => {
    registerAgent({ name: 'w1', role: 'worker' });
    registerAgent({ name: 'w2', role: 'worker' });
    registerAgent({ name: 'w3', role: 'worker' });

    const queue = createTaskQueue();

    // Create 20 tasks with varied priorities
    const tasks = [];
    for (let i = 1; i <= 20; i++) {
      const task = createTask(`Bulk task ${i}`);
      const priority = (i % 10) + 1; // priorities 1-10
      queue.enqueue(task, priority);
      tasks.push(task);
    }

    expect(queue.size()).toBe(20);
    expect(listTasks()).toHaveLength(20);

    // Process all tasks
    const assignments = [];
    while (queue.size() > 0) {
      const { item } = queue.dequeue();
      const agent = dispatch('worker');
      assignments.push({ task: item.title, agent: agent.name });
      completeTask(item.id);
    }

    expect(assignments).toHaveLength(20);
    expect(listTasks('completed')).toHaveLength(20);
    expect(listTasks('pending')).toHaveLength(0);

    // Verify round-robin distribution
    const agentCounts = {};
    assignments.forEach(({ agent }) => {
      agentCounts[agent] = (agentCounts[agent] || 0) + 1;
    });
    // 20 tasks / 3 agents: expect roughly even distribution
    expect(Object.keys(agentCounts)).toHaveLength(3);
    Object.values(agentCounts).forEach((count) => {
      expect(count).toBeGreaterThanOrEqual(6);
      expect(count).toBeLessThanOrEqual(7);
    });

    // Verify priority ordering: tasks should come out in priority order
    let lastPriority = 0;
    // We can't check strict ordering from assignments since we already dequeued,
    // but we can verify via the queue's toArray before full drain
  });

  test('peek does not consume items', () => {
    const queue = createTaskQueue();
    const task = createTask('Peek target');
    queue.enqueue(task, 1);

    const peeked = queue.peek();
    expect(peeked.item.title).toBe('Peek target');
    expect(queue.size()).toBe(1);

    // Still there after peek
    const dequeued = queue.dequeue();
    expect(dequeued.item.title).toBe('Peek target');
    expect(queue.size()).toBe(0);
  });
});

// ─── Agent registry + runner combined lookups ────────────────────────

describe('agent registry queries during task processing', () => {
  test('getAgent returns current state after status updates during processing', () => {
    registerAgent({ name: 'busy-dev', role: 'developer' });
    const task = createTask('Work item');

    // Check initial state
    expect(getAgent('busy-dev').status).toBe('active');

    // Simulate: set to idle while processing
    updateStatus('busy-dev', 'idle');
    expect(getAgent('busy-dev').status).toBe('idle');

    // Can still complete the task
    completeTask(task.id);
    expect(listTasks('completed')).toHaveLength(1);

    // Restore agent
    updateStatus('busy-dev', 'active');
    expect(getAgent('busy-dev').status).toBe('active');
  });

  test('listAgents with filters works alongside task operations', () => {
    registerAgent({ name: 'a1', role: 'developer' });
    registerAgent({ name: 'a2', role: 'developer', status: 'idle' });
    registerAgent({ name: 'a3', role: 'tester' });

    expect(listAgents({ role: 'developer' })).toHaveLength(2);
    expect(listAgents({ role: 'developer', status: 'active' })).toHaveLength(1);
    expect(listAgents({ status: 'idle' })).toHaveLength(1);
    expect(listAgents()).toHaveLength(3);

    // Process a task concurrently
    const task = createTask('Concurrent work');
    const queue = createTaskQueue();
    queue.enqueue(task, 5);

    // Agent state queries still work during queue operations
    const activeDevs = listAgents({ role: 'developer', status: 'active' });
    expect(activeDevs).toHaveLength(1);
    expect(activeDevs[0].name).toBe('a1');
  });
});
